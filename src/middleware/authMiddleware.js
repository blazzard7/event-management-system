// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const UserService = require('../services/userService.js');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Получаем пользователя из базы
    const user = await UserService.getUserById(decoded.id);
    
    if (!user) {
      res.clearCookie('token');
      req.user = null;
      return next();
    }
    
    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    // Если токен невалиден, очищаем куку
    if (error.name === 'JsonWebTokenError') {
      res.clearCookie('token');
    }
    req.user = null;
    next();
  }
};