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

async function hasDuplicateReminder(userId, eventId) {
  const [rows] = await appPool.query(
    'SELECT id FROM notifications WHERE user_id = ? AND title = ? AND message LIKE ? LIMIT 1',
    [userId, 'Event reminder', `%Event #${eventId}%`]
  );
  return Boolean(rows.length);
}

module.exports = { createNotification, listNotifications, markRead, hasDuplicateReminder };
