// src/services/RegistrationService.js
const pool = require('../config/database');

class RegistrationService {
  async getRegistrationById(id) {
    const [rows] = await pool.execute(`
      SELECT r.*, 
             e.title as event_title,
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM registrations r
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getRegistrationsByEvent(eventId, status = null) {
    let query = `
      SELECT r.*, 
             u.email, 
             u.first_name, 
             u.last_name,
             u.phone
      FROM registrations r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
    `;
    
    const params = [eventId];
    
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY r.registered_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getRegistrationsByUser(userId, status = null) {
    let query = `
      SELECT r.*, 
             e.title as event_title,
             e.date_time as event_date,
             l.name as location_name,
             l.city as location_city
      FROM registrations r
      LEFT JOIN events e ON r.event_id = e.id
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE r.user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY e.date_time DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async createRegistration(userId, eventId, notes = '') {
    // Проверяем, существует ли уже регистрация
    const [existing] = await pool.execute(
      'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (existing.length > 0) {
      throw new Error('Пользователь уже зарегистрирован на это событие');
    }
    
    const [result] = await pool.execute(
      `INSERT INTO registrations (user_id, event_id, notes) 
       VALUES (?, ?, ?)`,
      [userId, eventId, notes]
    );
    
    return { id: result.insertId, user_id: userId, event_id: eventId, status: 'pending' };
  }

  async updateRegistrationStatus(id, status, changedBy = null) {
    // Получаем текущую регистрацию
    const registration = await this.getRegistrationById(id);
    if (!registration) {
      throw new Error('Регистрация не найдена');
    }
    
    // Обновляем статус
    const [result] = await pool.execute(
      `UPDATE registrations 
       SET status = ? 
       WHERE id = ?`,
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Не удалось обновить регистрацию');
    }
    
    // Добавляем запись в историю
    if (changedBy) {
      await this.addToRegistrationHistory(id, 'status', registration.status, status, changedBy);
    }
    
    return this.getRegistrationById(id);
  }

  async deleteRegistration(id) {
    // Сначала удаляем историю
    await pool.execute(
      'DELETE FROM registration_history WHERE registration_id = ?',
      [id]
    );
    
    // Удаляем регистрацию
    const [result] = await pool.execute(
      'DELETE FROM registrations WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  async cancelRegistration(userId, eventId) {
    const [result] = await pool.execute(
      'DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    return result.affectedRows > 0;
  }

  async addToRegistrationHistory(registrationId, changedField, oldValue, newValue, changedBy) {
    const [result] = await pool.execute(
      `INSERT INTO registration_history 
       (registration_id, changed_field, old_value, new_value, changed_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [registrationId, changedField, oldValue, newValue, changedBy]
    );
    return result.insertId;
  }

  async getRegistrationHistory(registrationId) {
    const [rows] = await pool.execute(`
      SELECT rh.*, 
             u.email as changed_by_email,
             u.first_name as changed_by_first_name
      FROM registration_history rh
      LEFT JOIN users u ON rh.changed_by = u.id
      WHERE rh.registration_id = ?
      ORDER BY rh.changed_at DESC
    `, [registrationId]);
    return rows;
  }

  async getEventRegistrationStats(eventId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_show
      FROM registrations 
      WHERE event_id = ?
    `, [eventId]);
    
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = new RegistrationService();