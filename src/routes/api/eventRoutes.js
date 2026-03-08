const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const eventController = require('../../controllers/eventController');
const { requireApiAuth, requireApiAdmin } = require('../../middleware/auth');

const router = express.Router();
router.get('/', asyncHandler(eventController.listApi));
router.post('/', requireApiAuth, requireApiAdmin, asyncHandler(eventController.createApi));

module.exports = router;
