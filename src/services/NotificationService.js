// src/services/NotificationService.js
const pool = require('../config/database');

class NotificationService {
  async getUserNotifications(userId, isRead = null, limit = 20) {
    let query = `
      SELECT n.*,
             e.title as event_title
      FROM notifications n
      LEFT JOIN events e ON n.related_event_id = e.id
      WHERE n.user_id = ?
    `;
    
    const params = [userId];
    
    if (isRead !== null) {
      query += ' AND n.is_read = ?';
      params.push(isRead);
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async createNotification(userId, type, message, relatedEventId = null) {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, message, related_event_id) 
       VALUES (?, ?, ?, ?)`,
      [userId, type, message, relatedEventId]
    );
    
    return { id: result.insertId, user_id: userId, type, message, related_event_id: relatedEventId };
  }

  async markAsRead(notificationId, userId = null) {
    let query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    const params = [notificationId];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async markAllAsRead(userId) {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return result.affectedRows;
  }

  async deleteNotification(notificationId, userId = null) {
    let query = 'DELETE FROM notifications WHERE id = ?';
    const params = [notificationId];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  // Создание типовых уведомлений
  async sendRegistrationNotification(userId, eventId, eventTitle) {
    return this.createNotification(
      userId,
      'registration_confirmed',
      `Ваша регистрация на мероприятие "${eventTitle}" подтверждена`,
      eventId
    );
  }

  async sendEventReminder(userId, eventId, eventTitle, hoursBefore = 24) {
    return this.createNotification(
      userId,
      'event_reminder',
      `Напоминание: мероприятие "${eventTitle}" через ${hoursBefore} часов`,
      eventId
    );
  }

  async sendNewEventNotification(userIds, eventId, eventTitle) {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification(
        userId,
        'new_event',
        `Новое мероприятие: "${eventTitle}"`,
        eventId
      );
      notifications.push(notification);
    }
    
    return notifications;
  }
}

module.exports = new NotificationService();