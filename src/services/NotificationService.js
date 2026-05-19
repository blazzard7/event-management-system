const eventRepository = require('../repositories/eventRepository');
const notificationRepository = require('../repositories/notificationRepository');
const emailService = require('./emailService');

const REMINDER_TYPES = [
  { hours: 24, window: 10, type: 'reminder_1day', label: 'за день' },
  { hours: 3, window: 10, type: 'reminder_3h', label: 'за 3 часа' },
  { hours: 1, window: 10, type: 'reminder_1h', label: 'за час' }
];

async function listForUser(userId) {
  return notificationRepository.listNotifications(userId);
}

async function markAsRead(userId, notificationId) {
  await notificationRepository.markRead(notificationId, userId);
}

async function markAllAsRead(userId) {
  await notificationRepository.markAllRead(userId);
}

async function processReminderInterval({ hours, window, type, label }) {
  const rows = await eventRepository.listUpcomingEventsWithUsers(hours, window);
  let created = 0;

  for (const row of rows) {
    if (!row.email_notifications) continue;

    const duplicate = await notificationRepository.hasEmailLog(row.user_id, row.id, type);
    if (duplicate) continue;

    const message = `Мероприятие "${row.title}" начинается ${label} (${new Date(row.start_at).toLocaleString('ru-RU')}).`;

    await notificationRepository.createNotification({
      userId: row.user_id,
      title: 'Напоминание',
      message: `#${row.id}: ${message}`
    });

    emailService.sendEmail({
      to: row.email,
      subject: `Напоминание: "${row.title}" начинается ${label}`,
      text: message
    }).catch(function () {});

    await notificationRepository.createEmailLog({
      userId: row.user_id,
      eventId: row.id,
      type
    });

    created += 1;
  }

  return created;
}

async function createUpcomingEventReminders() {
  let total = 0;

  for (const interval of REMINDER_TYPES) {
    total += await processReminderInterval(interval);
  }

  return total;
}

module.exports = { listForUser, markAsRead, markAllAsRead, createUpcomingEventReminders };
