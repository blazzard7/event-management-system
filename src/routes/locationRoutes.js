// src/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Публичные маршруты (доступны всем)
router.get('/', LocationController.getAllLocations);
router.get('/:id', LocationController.getLocationById);

// Защищенные маршруты (только админ)
router.post('/', authMiddleware, roleMiddleware('admin'), LocationController.createLocation);
router.put('/:id', authMiddleware, roleMiddleware('admin'), LocationController.updateLocation);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), LocationController.deleteLocation);

// Маршрут для форм (выбор места)
router.get('/form/select', LocationController.getLocationsForForm);

module.exports = router;