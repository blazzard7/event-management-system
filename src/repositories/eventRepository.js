const { appPool } = require('../db/pool');

const eventSelectFields = `
  SELECT e.*,
         CONCAT(u.first_name, ' ', u.last_name) AS organizer_name,
         c.name AS category_name,
         l.name AS location_name,
         l.address AS location_address,
         l.city AS location_city,
         COALESCE(rc.registration_count, 0) AS registration_count
`;

const eventSelectFrom = `
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

function normalizePage(page) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function listEvents({ city, query, page = 1, limit = 5 } = {}) {
  const params = [];
  const filters = [];

  if (city) {
    filters.push('COALESCE(l.city, ?) = ?');
    params.push(city, city);
  }

  if (query) {
    filters.push('e.title LIKE ?');
    params.push(`%${query}%`);
  }

  const whereClause = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';

  const [countRows] = await appPool.query(
    `SELECT COUNT(*) AS total
     FROM events e
     LEFT JOIN locations l ON l.id = e.location_id${whereClause}`,
    params
  );

  const currentPage = normalizePage(page);
  const safeLimit = Number(limit) > 0 ? Number(limit) : 5;
  const total = Number(countRows[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const offset = (Math.min(currentPage, totalPages) - 1) * safeLimit;

  const [rows] = await appPool.query(
    `${eventSelectFields}${eventSelectFrom}${whereClause} ORDER BY e.start_at ASC LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  return {
    events: rows,
    pagination: {
      page: Math.min(currentPage, totalPages),
      limit: safeLimit,
      total,
      totalPages
    }
  };
}

async function listCalendarEvents({ city, month, userId } = {}) {
  const params = [];
  const filters = [];

  if (city) {
    filters.push('COALESCE(l.city, ?) = ?');
    params.push(city, city);
  }

  if (month) {
    filters.push('DATE_FORMAT(e.start_at, "%Y-%m") = ?');
    params.push(month);
  }

  const whereClause = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
  const userJoin = userId ? ' LEFT JOIN registrations ur ON ur.event_id = e.id AND ur.user_id = ?' : '';
  const userSelect = userId ? ', CASE WHEN ur.id IS NULL THEN 0 ELSE 1 END AS is_registered_for_current_user' : ', 0 AS is_registered_for_current_user';
  const queryParams = userId ? [userId, ...params] : params;
  const [rows] = await appPool.query(
    `${eventSelectFields}${userSelect}${eventSelectFrom}${userJoin}${whereClause} ORDER BY e.start_at ASC`,
    queryParams
  );
  return rows;
}

async function getEventById(id) {
  const [rows] = await appPool.query(`${eventSelectFields}${eventSelectFrom} WHERE e.id = ?`, [id]);
  return rows[0] || null;
}

async function getEventByInvitationCode(code) {
  const [rows] = await appPool.query(`${eventSelectFields}${eventSelectFrom} WHERE e.invitation_code = ?`, [code]);
  return rows[0] || null;
}

async function createEvent({
  title,
  shortDescription,
  description,
  imageUrl,
  startAt,
  endAt,
  organizerId,
  categoryId,
  locationId,
  maxParticipants,
  invitationCode
}) {
  const [result] = await appPool.query(
    `INSERT INTO events (
      title,
      short_description,
      description,
      image_url,
      start_at,
      end_at,
      organizer_id,
      category_id,
      location_id,
      max_participants,
      invitation_code
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      shortDescription,
      description,
      imageUrl || null,
      startAt,
      endAt,
      organizerId,
      categoryId || null,
      locationId || null,
      maxParticipants || 0,
      invitationCode
    ]
  );
  return getEventById(result.insertId);
}

async function updateEvent(
  id,
  { title, shortDescription, description, imageUrl, startAt, endAt, status, categoryId, locationId, maxParticipants }
) {
  await appPool.query(
    `UPDATE events
     SET title = ?,
         short_description = ?,
         description = ?,
         image_url = ?,
         start_at = ?,
         end_at = ?,
         status = ?,
         category_id = ?,
         location_id = ?,
         max_participants = ?
     WHERE id = ?`,
    [
      title,
      shortDescription,
      description,
      imageUrl || null,
      startAt,
      endAt,
      status,
      categoryId || null,
      locationId || null,
      maxParticipants || 0,
      id
    ]
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

async function listLocations({ city } = {}) {
  if (city) {
    const [rows] = await appPool.query('SELECT * FROM locations WHERE city = ? ORDER BY city, name', [city]);
    return rows;
  }
  const [rows] = await appPool.query('SELECT * FROM locations ORDER BY city, name');
  return rows;
}

async function listCities() {
  const [rows] = await appPool.query(
    `SELECT DISTINCT city
     FROM locations
     WHERE city IS NOT NULL AND city <> ''
     ORDER BY city`
  );
  return rows.map((row) => row.city);
}

async function createCategory(name) {
  const [result] = await appPool.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result.insertId;
}

async function updateCategory(id, name) {
  await appPool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
}

async function deleteCategory(id) {
  await appPool.query('DELETE FROM categories WHERE id = ?', [id]);
}

async function getLocationById(id) {
  const [rows] = await appPool.query('SELECT * FROM locations WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createLocation({ name, address, city, capacity }) {
  const [result] = await appPool.query(
    'INSERT INTO locations (name, address, city, capacity) VALUES (?, ?, ?, ?)',
    [name, address, city, capacity]
  );
  return result.insertId;
}

async function updateLocation(id, { name, address, city, capacity }) {
  await appPool.query(
    'UPDATE locations SET name = ?, address = ?, city = ?, capacity = ? WHERE id = ?',
    [name, address, city, capacity, id]
  );
}

async function deleteLocation(id) {
  await appPool.query('DELETE FROM locations WHERE id = ?', [id]);
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

async function listEventsForUser(userId, sortOrder) {
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  const [rows] = await appPool.query(
    `${eventSelectFields}
     ${eventSelectFrom}
     LEFT JOIN registrations ur ON ur.event_id = e.id AND ur.user_id = ?
     WHERE e.organizer_id = ? OR ur.user_id = ?
     ORDER BY e.start_at ${order}`,
    [userId, userId, userId]
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

async function listUpcomingEventsWithUsers(hours, minutesWindow) {
  const minutesBefore = minutesWindow || 10;
  const [rows] = await appPool.query(
    `SELECT e.id, e.title, e.start_at, e.invitation_code,
            r.user_id, u.email, u.email_notifications
     FROM events e
     JOIN registrations r ON r.event_id = e.id
     JOIN users u ON u.id = r.user_id
     WHERE e.status = 'active'
       AND e.start_at BETWEEN
         DATE_ADD(NOW(), INTERVAL (? * 60 - ?) MINUTE)
         AND DATE_ADD(NOW(), INTERVAL (? * 60 + ?) MINUTE)`,
    [hours, minutesBefore, hours, minutesBefore]
  );
  return rows;
}

module.exports = {
  listEvents,
  listCalendarEvents,
  getEventById,
  getEventByInvitationCode,
  createEvent,
  updateEvent,
  deleteEvent,
  listCategories,
  listLocations,
  listCities,
  createCategory,
  updateCategory,
  deleteCategory,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  createRegistration,
  deleteRegistration,
  registrationExists,
  listRegistrationsForEvent,
  listEventsForUser,
  addComment,
  listComments,
  markCompletedEvents,
  listUpcomingEventsWithinHours,
  listUpcomingEventsWithUsers
};
