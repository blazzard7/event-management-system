const { appPool } = require('../db/pool');
const config = require('../config');

async function saveMessage({ userId, authorName, message }) {
  const [result] = await appPool.query(
    'INSERT INTO chat_messages (user_id, author_name, message) VALUES (?, ?, ?)',
    [userId || null, authorName, message]
  );
  const [rows] = await appPool.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);
  return rows[0] || null;
}

async function getRecentMessages(limit = config.chat.historyLimit) {
  const [rows] = await appPool.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?', [limit]);
  return rows.reverse();
}

async function getMessagesByEvent(eventId) {
    const [rows] = await pool.query(
        'SELECT * FROM chat_messages WHERE event_id = ? ORDER BY created_at ASC',
        [eventId]
    );
    return rows;
}

async function saveMessage(eventId, userId, message) {
    const [result] = await pool.query(
        'INSERT INTO chat_messages (event_id, user_id, message) VALUES (?, ?, ?)',
        [eventId, userId, message]
    );

    return result.insertId;
}

module.exports = { saveMessage, getRecentMessages };
