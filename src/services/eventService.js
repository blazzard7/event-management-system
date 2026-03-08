const AppError = require('../lib/AppError');
const eventRepository = require('../repositories/eventRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { validateEventPayload, validateComment } = require('../validators/eventValidator');

async function listDashboardData() {
  const [events, categories, locations] = await Promise.all([
    eventRepository.listEvents(),
    eventRepository.listCategories(),
    eventRepository.listLocations()
  ]);
  return { events, categories, locations };
}

async function getExistingEvent(id) {
  const event = await eventRepository.getEventById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
}

async function getEventDetails(id) {
  const event = await getExistingEvent(id);
  const [comments, registrations] = await Promise.all([
    eventRepository.listComments(id),
    eventRepository.listRegistrationsForEvent(id)
  ]);
  return { event, comments, registrations };
}

async function createEvent(payload) {
  const data = validateEventPayload(payload);
  return eventRepository.createEvent({ ...data, organizerId: payload.organizerId });
}

async function updateEvent(id, payload) {
  await getExistingEvent(id);
  const data = validateEventPayload(payload, true);
  return eventRepository.updateEvent(id, data);
}

async function deleteEvent(id) {
  await getExistingEvent(id);
  await eventRepository.deleteEvent(id);
}

async function registerForEvent(userId, eventId) {
  const event = await getExistingEvent(eventId);
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
    message: `You are registered for \"${event.title}\".`
  });
}

async function cancelRegistration(userId, eventId) {
  await eventRepository.deleteRegistration(userId, eventId);
}

async function addComment(userId, eventId, body) {
  await getExistingEvent(eventId);
  return eventRepository.addComment({ userId, eventId, body: validateComment(body) });
}

module.exports = {
  listDashboardData,
  getEventDetails,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  addComment
};
