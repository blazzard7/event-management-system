const { appPool } = require('../db/pool');

async function createUser({ email, passwordHash, firstName, lastName, role = 'user' }) {
  const [result] = await appPool.query(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, lastName, role]
  );

  return findById(result.insertId);
}

async function findByEmail(email) {
  const [rows] = await appPool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await appPool.query(
    'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
    [id]
  );

  return rows[0] || null;
}

async function findAll() {
  const [rows] = await appPool.query(
    'SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC'
  );

  return rows;
}

async function updateRole(id, role) {
  await appPool.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id]
  );

  return findById(id);
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAll,
  updateRole
};