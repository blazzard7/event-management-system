const express = require('express');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();
router.use(authRoutes);
router.use(eventRoutes);
router.use(notificationRoutes);

module.exports = router;
