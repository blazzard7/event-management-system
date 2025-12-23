// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();

// Импорт всех маршрутов
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const locationRoutes = require('./LocationRoutes');
const categoryRoutes = require('./categoryRoutes');
const registrationRoutes = require('./registrationRoutes');
const commentRoutes = require('./commentRoutes');
const notificationRoutes = require('./notificationRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const chatRoutes = require('./chatRoutes');

// Подключение маршрутов с префиксами
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/locations', locationRoutes);
router.use('/categories', categoryRoutes);
router.use('/registrations', registrationRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/chat', chatRoutes);

module.exports = router;