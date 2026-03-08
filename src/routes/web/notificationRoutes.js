const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const notificationController = require('../../controllers/notificationController');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();
router.get('/notifications', requireAuth, asyncHandler(notificationController.listWeb));
router.post('/notifications/:id/read', requireAuth, asyncHandler(notificationController.markReadWeb));

module.exports = router;
