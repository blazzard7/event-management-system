// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/chat', authMiddleware, (req, res) => {
  res.render('pages/chat', { user: req.user });
});

module.exports = router;