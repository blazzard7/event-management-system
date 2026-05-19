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
router.get('/profile/edit', requireAuth, asyncHandler(authController.showEditProfile));
router.post('/profile/edit', requireAuth, asyncHandler(authController.updateProfileWeb));
router.get('/forgot-password', asyncHandler(authController.showForgotForm));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.get('/reset-password/:token', asyncHandler(authController.showResetForm));
router.post('/reset-password/:token', asyncHandler(authController.resetPassword));

module.exports = router;
