const { appPool } = require('../db/pool');

const eventSelect = `
  SELECT e.*,
         CONCAT(u.first_name, ' ', u.last_name) AS organizer_name,
         c.name AS category_name,
         l.name AS location_name,
         l.address AS location_address,
         l.city AS location_city,
         COALESCE(rc.registration_count, 0) AS registration_count
  FROM events e
  JOIN users u ON u.id = e.organizer_id
  LEFT JOIN categories c ON c.id = e.category_id
  LEFT JOIN locations l ON l.id = e.location_id
  LEFT JOIN (
    SELECT event_id, COUNT(*) AS registration_count
    FROM registrations
    GROUP BY event_id
  ) rc ON rc.event_id = e.id
`;

async function listEvents() {
  const [rows] = await appPool.query(`${eventSelect} ORDER BY e.start_at ASC`);
  return rows;
}

async function getEventById(id) {
  const [rows] = await appPool.query(`${eventSelect} WHERE e.id = ?`, [id]);
  return rows[0] || null;
}

async function createEvent({ title, description, startAt, endAt, organizerId, categoryId, locationId, maxParticipants }) {
  const [result] = await appPool.query(
    `INSERT INTO events (title, description, start_at, end_at, organizer_id, category_id, location_id, max_participants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, startAt, endAt, organizerId, categoryId || null, locationId || null, maxParticipants || 0]
  );
  return getEventById(result.insertId);
}

async function updateEvent(id, { title, description, startAt, endAt, status, categoryId, locationId, maxParticipants }) {
  await appPool.query(
    `UPDATE events
     SET title = ?, description = ?, start_at = ?, end_at = ?, status = ?, category_id = ?, location_id = ?, max_participants = ?
     WHERE id = ?`,
    [title, description, startAt, endAt, status, categoryId || null, locationId || null, maxParticipants || 0, id]
  );
  return getEventById(id);
}

async function deleteEvent(id) {
  await appPool.query('DELETE FROM events WHERE id = ?', [id]);
}

async function listCategories() {
  const [rows] = await appPool.query('SELECT * FROM categories ORDER BY name');
  return rows;
}

async function listLocations() {
  const [rows] = await appPool.query('SELECT * FROM locations ORDER BY city, name');
  return rows;
}

async function createRegistration(userId, eventId) {
  await appPool.query('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
}

async function deleteRegistration(userId, eventId) {
  await appPool.query('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
}

async function registrationExists(userId, eventId) {
  const [rows] = await appPool.query('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
  return Boolean(rows.length);
}

async function listRegistrationsForEvent(eventId) {
  const [rows] = await appPool.query(
    `SELECT r.id, u.id AS user_id, u.email, u.first_name, u.last_name, r.created_at
     FROM registrations r
     JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ?
     ORDER BY r.created_at ASC`,
    [eventId]
  );
  return rows;
}

async function addComment({ eventId, userId, body }) {
  const [result] = await appPool.query('INSERT INTO comments (event_id, user_id, body) VALUES (?, ?, ?)', [eventId, userId, body]);
  const [rows] = await appPool.query(
    `SELECT c.id, c.body, c.created_at, u.first_name, u.last_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [result.insertId]
  );
  return rows[0] || null;
}

async function listComments(eventId) {
  const [rows] = await appPool.query(
    `SELECT c.id, c.body, c.created_at, u.first_name, u.last_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.event_id = ?
     ORDER BY c.created_at DESC`,
    [eventId]
  );
  return rows;
}

async function markCompletedEvents() {
  const [result] = await appPool.query("UPDATE events SET status = 'completed' WHERE status = 'active' AND end_at < NOW()");
  return result.affectedRows;
}

async function listUpcomingEventsWithinHours(hours) {
  const [rows] = await appPool.query(
    `SELECT e.id, e.title, e.start_at, r.user_id
     FROM events e
     JOIN registrations r ON r.event_id = e.id
     WHERE e.status = 'active'
       AND e.start_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)`,
    [hours]
  );
  return rows;
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  listCategories,
  listLocations,
  createRegistration,
  deleteRegistration,
  registrationExists,
  listRegistrationsForEvent,
  addComment,
  listComments,
  markCompletedEvents,
  listUpcomingEventsWithinHours
};
