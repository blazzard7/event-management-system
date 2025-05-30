// server/src/routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/events', authMiddleware, eventController.getEvents);
router.get('/events/:eventId', authMiddleware, eventController.getEvent);
router.post('/events', authMiddleware, eventController.createEvent);
router.post('/events/register', authMiddleware, eventController.registerForEvent);
router.put('/events/confirm/:registrationId', authMiddleware, eventController.confirmRegistration);

module.exports = router;