const crypto = require('crypto');
const { appPool } = require('../db/pool');

async function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await appPool.query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
  return token;
}

async function findValidToken(token) {
  const [rows] = await appPool.query(
    'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
    [token]
  );
  return rows[0] || null;
}

async function markUsed(token) {
  await appPool.query('UPDATE password_resets SET used = 1 WHERE token = ?', [token]);
}

module.exports = { createToken, findValidToken, markUsed };
