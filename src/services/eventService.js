// src/services/eventService.js
const pool = require('../config/database');
const LocationService = require('./LocationService');
const CategoryService = require('./CategoryService');
const RegistrationService = require('./RegistrationService');
const NotificationService = require('./NotificationService');
const EmailService = require('./EmailService');
const SocketService = require('./SocketService');
// emailService и socket нужно будет тоже переписать, если они используют модели

class EventService {
  async createEvent(title, description, dateTime, locationId, organizerId, maxParticipants = 0, price = 0) {
    const [result] = await pool.execute(
      `INSERT INTO events 
       (title, description, date_time, location_id, organizer_id, max_participants, price) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, dateTime, locationId, organizerId, maxParticipants, price]
    );
    

    // Получаем созданное событие со всеми данными
    const [events] = await pool.execute(
      `SELECT e.*, 
              u.first_name as organizer_first_name, 
              u.last_name as organizer_last_name,
              l.name as location_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN locations l ON e.location_id = l.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    const event = events[0];
      const notificationService = require('./NotificationService');
  await notificationService.createNotification(
    organizerId,
    'event_created',
    `Вы создали мероприятие "${title}"`,
    result.insertId
  );
  
  return event;
}
    

  async getEvents(filters = {}) {
    let query = `
      SELECT e.*, 
             u.first_name as organizer_first_name, 
             u.last_name as organizer_last_name,
             l.name as location_name,
             l.city as location_city,
             COUNT(r.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
    `;

    const whereConditions = [];
    const queryParams = [];

    // Добавляем фильтры
    if (filters.status) {
      whereConditions.push('e.status = ?');
      queryParams.push(filters.status);
    }

    if (filters.organizerId) {
      whereConditions.push('e.organizer_id = ?');
      queryParams.push(filters.organizerId);
    }

    if (filters.locationId) {
      whereConditions.push('e.location_id = ?');
      queryParams.push(filters.locationId);
    }

    if (filters.dateFrom) {
      whereConditions.push('e.date_time >= ?');
      queryParams.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      whereConditions.push('e.date_time <= ?');
      queryParams.push(filters.dateTo);
    }

    // Добавляем WHERE если есть условия
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Добавляем GROUP BY и ORDER BY
    query += ' GROUP BY e.id ORDER BY e.date_time ASC';

    const [events] = await pool.execute(query, queryParams);
    return events;
  }

  async getEventById(eventId) {
    const [events] = await pool.execute(
      `SELECT e.*, 
              u.first_name as organizer_first_name, 
              u.last_name as organizer_last_name,
              u.email as organizer_email,
              l.name as location_name,
              l.address as location_address,
              l.city as location_city,
              l.capacity as location_capacity
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN locations l ON e.location_id = l.id
       WHERE e.id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      throw new Error('Событие не найдено');
    }

    return events[0];
    
  }

  async registerForEvent(eventId, userId, notes = '') {
    // Проверяем, существует ли уже регистрация
    const [existingRegistrations] = await pool.execute(
      'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existingRegistrations.length > 0) {
      throw new Error('Вы уже зарегистрированы на это событие');
    }

    // Создаем регистрацию
    const [result] = await pool.execute(
      `INSERT INTO registrations (user_id, event_id, notes) 
       VALUES (?, ?, ?)`,
      [userId, eventId, notes]
    );

    // TODO: Отправить email уведомление
    // TODO: Отправить socket уведомление
    
    return {
      id: result.insertId,
      user_id: userId,
      event_id: eventId,
      status: 'pending'
    };
  }

  async confirmRegistration(registrationId) {
    // Обновляем статус регистрации
    const [result] = await pool.execute(
      `UPDATE registrations 
       SET status = 'confirmed' 
       WHERE id = ?`,
      [registrationId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Регистрация не найдена');
    }

    // Получаем обновленную регистрацию с информацией о событии и пользователе
    const [registrations] = await pool.execute(
      `SELECT r.*, 
              e.title as event_title,
              u.email as user_email,
              u.first_name as user_first_name
       FROM registrations r
       LEFT JOIN events e ON r.event_id = e.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [registrationId]
    );

    // TODO: Отправить email уведомление
    // TODO: Отправить socket уведомление
    
    return registrations[0];
  }

  // Ваш DELETE для отмены регистрации
  async cancelRegistration(userId, eventId) {
    const [result] = await pool.execute(
      'DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    return result.affectedRows > 0;
  }

  async updateEvent(eventId, updateData) {
    const updates = [];
    const values = [];

    // Формируем поля для обновления
    const allowedFields = ['title', 'description', 'date_time', 'location_id', 'max_participants', 'status', 'price'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('Нет данных для обновления');
    }

    values.push(eventId);
    const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
    
    return this.getEventById(eventId);
  }

  async deleteEvent(eventId) {
    const [result] = await pool.execute(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );
    
    return result.affectedRows > 0;
  }
  
}

module.exports = new EventService();