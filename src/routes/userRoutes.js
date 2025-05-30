// server/src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.post('/profile', authMiddleware, userController.updateProfile);

module.exports = router;