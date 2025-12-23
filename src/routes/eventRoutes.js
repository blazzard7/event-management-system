// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Публичные маршруты
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

// Формы (требуют аутентификации)
router.get('/create/form', authMiddleware, EventController.showCreateEvent);

// Защищенные маршруты
router.post('/', authMiddleware, EventController.createEvent);
router.post('/:id/register', authMiddleware, EventController.registerForEvent);
router.post('/:id/cancel', authMiddleware, EventController.cancelRegistration);
router.put('/:id', authMiddleware, EventController.updateEvent);
router.delete('/:id', authMiddleware, EventController.deleteEvent);

module.exports = router;