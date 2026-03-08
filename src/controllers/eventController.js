const eventService = require('../services/eventService');
const { ok } = require('../lib/http');

async function home(req, res) {
  const data = await eventService.listDashboardData();
  res.render('pages/home', { title: 'Events', currentUser: req.currentUser, ...data });
}

async function eventDetails(req, res) {
  const data = await eventService.getEventDetails(Number(req.params.id));
  res.render('pages/event-details', { title: data.event.title, currentUser: req.currentUser, ...data });
}

async function showCreateForm(req, res) {
  const data = await eventService.listDashboardData();
  res.render('pages/event-form', {
    title: 'Create Event',
    currentUser: req.currentUser,
    categories: data.categories,
    locations: data.locations,
    event: null,
    action: '/admin/events'
  });
}

async function showEditForm(req, res) {
  const [listData, details] = await Promise.all([
    eventService.listDashboardData(),
    eventService.getEventDetails(Number(req.params.id))
  ]);
  res.render('pages/event-form', {
    title: 'Edit Event',
    currentUser: req.currentUser,
    categories: listData.categories,
    locations: listData.locations,
    event: details.event,
    action: `/admin/events/${details.event.id}`
  });
}

async function createWeb(req, res) {
  await eventService.createEvent({ ...req.body, organizerId: req.currentUser.id });
  res.redirect('/');
}

async function updateWeb(req, res) {
  await eventService.updateEvent(Number(req.params.id), req.body);
  res.redirect(`/events/${req.params.id}`);
}

async function deleteWeb(req, res) {
  await eventService.deleteEvent(Number(req.params.id));
  res.redirect('/');
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

async function listApi(req, res) {
  const data = await eventService.listDashboardData();
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
  listApi,
  createApi
};
