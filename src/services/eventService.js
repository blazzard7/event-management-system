const QRCode = require('qrcode');
const AppError = require('../lib/AppError');
const eventRepository = require('../repositories/eventRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { validateEventPayload, validateComment } = require('../validators/eventValidator');

const DEFAULT_CITY = 'Екатеринбург';
const PAGE_SIZE = 5;

function normalizeMonth(rawMonth) {
  return /^\d{4}-\d{2}$/.test(String(rawMonth || '')) ? String(rawMonth) : new Date().toISOString().slice(0, 7);
}

function normalizeSearch(rawQuery) {
  return String(rawQuery || '').trim();
}

function buildEventRole(event, userId, isRegistered) {
  if (!userId) {
    return null;
  }
  if (event.organizer_id === userId) {
    return 'organizer';
  }
  if (isRegistered) {
    return 'participant';
  }
  return null;
}

function mapMyEvents(events, userId) {
  return events.map((event) => ({
    ...event,
    user_role: event.organizer_id === userId ? 'organizer' : 'participant'
  }));
}

function getMonthNavigation(selectedMonth) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const current = new Date(year, month - 1, 1);
  const previous = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);

  return {
    label: current.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
    previous: `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`,
    next: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  };
}

function buildCalendarMonthData(events, selectedMonth, userId) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const monthNavigation = getMonthNavigation(selectedMonth);
  const eventMap = new Map();

  for (const event of events) {
    const start = new Date(event.start_at);
    const dayNumber = start.getDate();
    const role = event.organizer_id === userId
      ? 'organizer'
      : event.is_registered_for_current_user
        ? 'participant'
        : 'global';

    if (!eventMap.has(dayNumber)) {
      eventMap.set(dayNumber, []);
    }

    eventMap.get(dayNumber).push({
      id: event.id,
      title: event.title,
      startAt: event.start_at,
      role
    });
  }

  const days = [];
  for (let index = 0; index < startOffset; index += 1) {
    days.push({ isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      isCurrentMonth: true,
      day,
      events: eventMap.get(day) || []
    });
  }

  while (days.length % 7 !== 0) {
    days.push({ isCurrentMonth: false });
  }

  return {
    monthLabel: monthNavigation.label,
    previousMonth: monthNavigation.previous,
    nextMonth: monthNavigation.next,
    weekdayLabels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    days
  };
}

async function buildQrCode(url) {
  return QRCode.toDataURL(url, { margin: 1, width: 240 });
}

async function listDashboardData({ city, page, month, query, userId } = {}) {
  const selectedCity = city || DEFAULT_CITY;
  const selectedMonth = normalizeMonth(month);
  const searchQuery = normalizeSearch(query);

  const [eventList, categories, locations, cities, calendarEvents] = await Promise.all([
    eventRepository.listEvents({ city: selectedCity, query: searchQuery, page, limit: PAGE_SIZE }),
    eventRepository.listCategories(),
    eventRepository.listLocations({ city: selectedCity }),
    eventRepository.listCities(),
    eventRepository.listCalendarEvents({ city: selectedCity, month: selectedMonth, userId })
  ]);

  const availableCities = cities.length ? cities : [DEFAULT_CITY];

  return {
    events: eventList.events,
    categories,
    locations,
    cities: availableCities.includes(DEFAULT_CITY) ? availableCities : [DEFAULT_CITY, ...availableCities],
    selectedCity,
    selectedMonth,
    searchQuery,
    pagination: eventList.pagination,
    calendarMonth: buildCalendarMonthData(calendarEvents, selectedMonth, userId)
  };
}

async function getExistingEvent(id) {
  const event = await eventRepository.getEventById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
}

async function getEventDetails(id, currentUser, baseUrl = '') {
  const event = await getExistingEvent(id);
  const [comments, registrations] = await Promise.all([
    eventRepository.listComments(id),
    eventRepository.listRegistrationsForEvent(id)
  ]);
  const isRegistered = currentUser ? registrations.some((registration) => registration.user_id === currentUser.id) : false;
  const invitePath = `/events/join?code=${event.invitation_code}`;
  const invitationUrl = `${baseUrl}${invitePath}`;

  return {
    event,
    comments,
    registrations,
    isRegistered,
    userRole: buildEventRole(event, currentUser?.id, isRegistered),
    canManage: Boolean(currentUser && (currentUser.role === 'admin' || event.organizer_id === currentUser.id)),
    invitationCode: event.invitation_code,
    invitationUrl,
    qrCodeDataUrl: await buildQrCode(invitationUrl)
  };
}

function createInvitationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function generateUniqueInvitationCode() {
  let code = createInvitationCode();

  while (await eventRepository.getEventByInvitationCode(code)) {
    code = createInvitationCode();
  }

  return code;
}

async function createEvent(payload) {
  const data = validateEventPayload(payload);
  return eventRepository.createEvent({
    ...data,
    organizerId: payload.organizerId,
    invitationCode: await generateUniqueInvitationCode()
  });
}

async function ensureCanManageEvent(eventId, currentUser) {
  const event = await getExistingEvent(eventId);
  if (!currentUser || (currentUser.role !== 'admin' && event.organizer_id !== currentUser.id)) {
    throw new AppError('You can manage only your own events', 403);
  }
  return event;
}

async function updateEvent(id, payload, currentUser) {
  await ensureCanManageEvent(id, currentUser);
  const data = validateEventPayload(payload, true);
  return eventRepository.updateEvent(id, data);
}

async function deleteEvent(id, currentUser) {
  await ensureCanManageEvent(id, currentUser);
  await eventRepository.deleteEvent(id);
}

async function registerForEvent(userId, eventId) {
  const event = await getExistingEvent(eventId);
  if (event.organizer_id === userId) {
    throw new AppError('Organizer does not need registration for their own event', 400);
  }
  if (event.status !== 'active') {
    throw new AppError('Registration is available only for active events', 400);
  }
  if (await eventRepository.registrationExists(userId, eventId)) {
    throw new AppError('User is already registered for this event', 409);
  }
  if (event.max_participants > 0 && event.registration_count >= event.max_participants) {
    throw new AppError('Event is full', 400);
  }
  await eventRepository.createRegistration(userId, eventId);
  await notificationRepository.createNotification({
    userId,
    title: 'Registration confirmed',
    message: `You are registered for "${event.title}".`
  });
}

async function cancelRegistration(userId, eventId) {
  await eventRepository.deleteRegistration(userId, eventId);
}

async function addComment(userId, eventId, body) {
  await getExistingEvent(eventId);
  return eventRepository.addComment({ userId, eventId, body: validateComment(body) });
}

async function getMyEvents(userId) {
  const events = await eventRepository.listEventsForUser(userId);
  return mapMyEvents(events, userId);
}

async function resolveInvitation(code) {
  const invitationCode = String(code || '').trim();
  if (!/^\d{6}$/.test(invitationCode)) {
    throw new AppError('Invitation code must contain 6 digits', 400);
  }

  const event = await eventRepository.getEventByInvitationCode(invitationCode);
  if (!event) {
    throw new AppError('Event with this invitation code was not found', 404);
  }

  return event;
}

module.exports = {
  DEFAULT_CITY,
  PAGE_SIZE,
  listDashboardData,
  getEventDetails,
  createEvent,
  ensureCanManageEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  addComment,
  getMyEvents,
  resolveInvitation
};
