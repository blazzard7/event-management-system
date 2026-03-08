const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const notificationController = require('../../controllers/notificationController');
const { requireApiAuth } = require('../../middleware/auth');

const router = express.Router();
router.get('/', requireApiAuth, asyncHandler(notificationController.listApi));

module.exports = router;
