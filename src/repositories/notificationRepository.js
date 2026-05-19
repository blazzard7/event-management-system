const { appPool } = require('../db/pool');

async function createNotification({ userId, title, message }) {
  const [result] = await appPool.query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [userId, title, message]
  );
  return result.insertId;
}

async function listNotifications(userId) {
  const [rows] = await appPool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function markRead(notificationId, userId) {
  await appPool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, userId]);
}

async function markAllRead(userId) {
  await appPool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
}

async function hasDuplicateReminder(userId, eventId) {
  const [rows] = await appPool.query(
    'SELECT id FROM notifications WHERE user_id = ? AND title = ? AND message LIKE ? LIMIT 1',
    [userId, 'Напоминание', `%#${eventId}%`]
  );
  return Boolean(rows.length);
}

async function hasEmailLog(userId, eventId, type) {
  const [rows] = await appPool.query(
    'SELECT id FROM email_notification_log WHERE user_id = ? AND event_id = ? AND type = ? LIMIT 1',
    [userId, eventId, type]
  );
  return Boolean(rows.length);
}

async function createEmailLog({ userId, eventId, type }) {
  const [result] = await appPool.query(
    'INSERT INTO email_notification_log (user_id, event_id, type) VALUES (?, ?, ?)',
    [userId, eventId, type]
  );
  return result.insertId;
}

module.exports = { createNotification, listNotifications, markRead, markAllRead, hasDuplicateReminder, hasEmailLog, createEmailLog };
