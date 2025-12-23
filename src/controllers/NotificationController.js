// src/controllers/NotificationController.js
const NotificationService = require('../services/NotificationService');
const logger = require('../utils/logger');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const { is_read, limit } = req.query;
      const notifications = await NotificationService.getUserNotifications(
        req.user.id,
        is_read !== undefined ? is_read === 'true' : null,
        limit ? parseInt(limit) : 20
      );
      
      // Если запрос API
      if (req.accepts('json')) {
        return res.json({ success: true, data: notifications });
      }
      
      // Если запрос для страницы
      res.render('pages/notifications', {
        notifications,
        user: req.user,
        unreadCount: await NotificationService.getUnreadCount(req.user.id)
      });
    } catch (error) {
      logger.error(`Ошибка получения уведомлений: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const success = await NotificationService.markAsRead(parseInt(id), req.user.id);
      
      if (success) {
        res.json({ success: true, message: 'Уведомление отмечено как прочитанное' });
      } else {
        res.status(404).json({ success: false, error: 'Уведомление не найдено' });
      }
    } catch (error) {
      logger.error(`Ошибка отметки уведомления как прочитанного: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const count = await NotificationService.markAllAsRead(req.user.id);
      res.json({ 
        success: true, 
        message: `Отмечено ${count} уведомлений как прочитанные`,
        count 
      });
    } catch (error) {
      logger.error(`Ошибка отметки всех уведомлений как прочитанных: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const success = await NotificationService.deleteNotification(parseInt(id), req.user.id);
      
      if (success) {
        res.json({ success: true, message: 'Уведомление удалено' });
      } else {
        res.status(404).json({ success: false, error: 'Уведомление не найдено' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления уведомления: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      logger.error(`Ошибка получения количества непрочитанных уведомлений: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // WebSocket endpoint для реального времени
  async subscribeToNotifications(req, res) {
    try {
      // Здесь будет логика подписки на WebSocket
      res.json({ success: true, message: 'Подписка на уведомления активирована' });
    } catch (error) {
      logger.error(`Ошибка подписки на уведомления: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NotificationController();