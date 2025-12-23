// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Уведомления пользователя
router.get('/', NotificationController.getUserNotifications);
router.get('/unread/count', NotificationController.getUnreadCount);

// Управление уведомлениями
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read/all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

// WebSocket подписка
router.post('/subscribe', NotificationController.subscribeToNotifications);

module.exports = router;