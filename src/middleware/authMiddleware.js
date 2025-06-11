// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    res.locals.user = user; // Передаем переменную user в шаблоны
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`, { stack: error.stack });
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;