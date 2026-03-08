const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const authController = require('../../controllers/authController');

const router = express.Router();
router.post('/login', asyncHandler(authController.loginApi));
router.post('/register', asyncHandler(authController.registerApi));

module.exports = router;
