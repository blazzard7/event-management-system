// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Импортируем модель пользователя

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token; // Получаем токен из cookies

  if (!token) {
    return res.redirect('/login'); // Перенаправляем на страницу входа, если токен отсутствует
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Верифицируем токен
    const user = await User.findByPk(decoded.id); // Находим пользователя по ID

    if (!user) {
      return res.redirect('/login'); // Перенаправляем на страницу входа, если пользователь не найден
    }

    req.user = user; // Добавляем пользователя в запрос
    res.cookie('username', user.username); // Сохраняем имя пользователя в cookies
    next();
  } catch (error) {
    return res.redirect('/login'); // Перенаправляем на страницу входа в случае ошибки
  }
};

module.exports = authMiddleware;