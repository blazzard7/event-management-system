// server/src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

module.exports = router;