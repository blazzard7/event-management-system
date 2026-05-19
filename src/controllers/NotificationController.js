const notificationService = require('../services/notificationService');
const { ok } = require('../lib/http');

async function listWeb(req, res) {
  const notifications = await notificationService.listForUser(req.currentUser.id);
  res.render('pages/notifications', { title: 'Уведомления', currentUser: req.currentUser, notifications });
}

async function markReadWeb(req, res) {
  await notificationService.markAsRead(req.currentUser.id, Number(req.params.id));
  res.redirect('/notifications');
}

async function markAllReadWeb(req, res) {
  await notificationService.markAllAsRead(req.currentUser.id);
  req.flash('success', 'Все уведомления отмечены как прочитанные');
  res.redirect('/notifications');
}

async function listApi(req, res) {
  const notifications = await notificationService.listForUser(req.currentUser.id);
  return ok(res, notifications);
}

module.exports = { listWeb, markReadWeb, markAllReadWeb, listApi };
