const express = require('express');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use(authRoutes);
router.use(eventRoutes);
router.use(notificationRoutes);
router.use(adminRoutes);

module.exports = router;