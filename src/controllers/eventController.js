const eventService = require('../services/eventService');
const { ok } = require('../lib/http');

async function home(req, res) {
  const data = await eventService.listDashboardData({
    city: req.query.city,
    page: req.query.page,
    month: req.query.month,
    query: req.query.q,
    userId: req.currentUser?.id
  });
  res.render('pages/home', { title: 'Мероприятия', currentUser: req.currentUser, ...data });
}

async function eventDetails(req, res) {
  const data = await eventService.getEventDetails(
    Number(req.params.id),
    req.currentUser,
    `${req.protocol}://${req.get('host')}`
  );
  res.render('pages/event-details', { title: data.event.title, currentUser: req.currentUser, ...data });
}

async function showCreateForm(req, res) {
  const data = await eventService.listDashboardData({ city: req.query.city || eventService.DEFAULT_CITY });
  res.render('pages/event-form', {
    title: 'Создать мероприятие',
    currentUser: req.currentUser,
    categories: data.categories,
    locations: data.locations,
    cities: data.cities,
    selectedCity: data.selectedCity,
    event: null,
    action: '/events',
    isEdit: false
  });
}

async function showEditForm(req, res) {
  const details = await eventService.getEventDetails(
    Number(req.params.id),
    req.currentUser,
    `${req.protocol}://${req.get('host')}`
  );
  await eventService.ensureCanManageEvent(details.event.id, req.currentUser);
  const data = await eventService.listDashboardData({ city: details.event.location_city || eventService.DEFAULT_CITY });
  res.render('pages/event-form', {
    title: 'Редактировать мероприятие',
    currentUser: req.currentUser,
    categories: data.categories,
    locations: data.locations,
    cities: data.cities,
    selectedCity: details.event.location_city || data.selectedCity,
    event: details.event,
    action: `/events/${details.event.id}`,
    isEdit: true
  });
}

async function createWeb(req, res) {
  await eventService.createEvent({ ...req.body, organizerId: req.currentUser.id });
  res.redirect('/my-events');
}

async function updateWeb(req, res) {
  await eventService.updateEvent(Number(req.params.id), req.body, req.currentUser);
  res.redirect(`/events/${req.params.id}`);
}

async function deleteWeb(req, res) {
  await eventService.deleteEvent(Number(req.params.id), req.currentUser);
  res.redirect('/my-events');
}

async function registerWeb(req, res) {
  await eventService.registerForEvent(req.currentUser.id, Number(req.params.id));
  res.redirect(`/events/${req.params.id}`);
}

async function unregisterWeb(req, res) {
  await eventService.cancelRegistration(req.currentUser.id, Number(req.params.id));
  res.redirect(`/events/${req.params.id}`);
}

async function addCommentWeb(req, res) {
  await eventService.addComment(req.currentUser.id, Number(req.params.id), req.body.body);
  res.redirect(`/events/${req.params.id}`);
}

async function myEvents(req, res) {
  const events = await eventService.getMyEvents(req.currentUser.id);
  res.render('pages/my-events', {
    title: 'Мои мероприятия',
    currentUser: req.currentUser,
    events
  });
}

async function joinByInvitation(req, res) {
  const event = await eventService.resolveInvitation(req.query.code || req.body.code);
  res.redirect(`/events/${event.id}`);
}

async function listApi(req, res) {
  const data = await eventService.listDashboardData({
    city: req.query.city,
    page: req.query.page,
    month: req.query.month,
    query: req.query.q,
    userId: req.currentUser?.id
  });
  return ok(res, data.events);
}

async function createApi(req, res) {
  const event = await eventService.createEvent({ ...req.body, organizerId: req.currentUser.id });
  return ok(res, event, 201);
}

module.exports = {
  home,
  eventDetails,
  showCreateForm,
  showEditForm,
  createWeb,
  updateWeb,
  deleteWeb,
  registerWeb,
  unregisterWeb,
  addCommentWeb,
  myEvents,
  joinByInvitation,
  listApi,
  createApi
};
