const eventRepository = require('../repositories/eventRepository');
const notificationRepository = require('../repositories/notificationRepository');

async function listForUser(userId) {
  return notificationRepository.listNotifications(userId);
}

async function markAsRead(userId, notificationId) {
  await notificationRepository.markRead(notificationId, userId);
}

async function createUpcomingEventReminders() {
  const upcoming = await eventRepository.listUpcomingEventsWithinHours(24);
  let created = 0;

  for (const item of upcoming) {
    const duplicate = await notificationRepository.hasDuplicateReminder(item.user_id, item.id);
    if (!duplicate) {
      await notificationRepository.createNotification({
        userId: item.user_id,
        title: 'Event reminder',
        message: `Event #${item.id}: \"${item.title}\" starts at ${item.start_at}.`
      });
      created += 1;
    }
  }

  return created;
}

module.exports = { listForUser, markAsRead, createUpcomingEventReminders };
