// src/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const RegistrationController = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Регистрации пользователя
router.get('/my', RegistrationController.getUserRegistrations);

// Регистрации события
router.get('/event/:eventId', RegistrationController.getEventRegistrations);
router.get('/event/:eventId/stats', RegistrationController.getRegistrationStats);

// Работа с конкретной регистрацией
router.get('/:id', RegistrationController.getRegistrationById);
router.put('/:id/status', RegistrationController.updateRegistrationStatus);
router.delete('/:id', RegistrationController.deleteRegistration);
router.get('/:id/history', RegistrationController.getRegistrationHistory);

module.exports = router;