const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const authController = require('../../controllers/authController');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();
router.get('/login', asyncHandler(authController.showLogin));
router.post('/login', asyncHandler(authController.loginWeb));
router.get('/register', asyncHandler(authController.showRegister));
router.post('/register', asyncHandler(authController.registerWeb));
router.post('/logout', asyncHandler(authController.logout));
router.get('/profile', requireAuth, asyncHandler(authController.profile));

module.exports = router;
