const express = require('express');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
