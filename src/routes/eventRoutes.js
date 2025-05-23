const express = require('express');
const eventController = require('../controllers/eventController.js');

const router = express.Router();

router.post('/events', eventController.createEvent);
router.get('/events', eventController.getEvents);
router.post('/events/register', eventController.registerForEvent);
router.put('/events/confirm/:registrationId', eventController.confirmRegistration);

module.exports = router;