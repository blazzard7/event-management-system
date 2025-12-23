// src/controllers/authController.js
const AuthService = require('../services/authService.js');
const EventService = require('../services/eventService.js'); // Добавляем для получения событий
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;
      
      // Проверка обязательных полей
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).render('pages/register', { 
          error: 'Заполните все обязательные поля: email, пароль, имя и фамилия' 
        });
      }

      const user = await AuthService.register(email, password, firstName, lastName, phone, role || 'user');
      logger.info(`Пользователь зарегистрирован: ${email}`);
      
      // Перенаправление на страницу входа с сообщением об успехе
      res.redirect('/login?success=Регистрация успешна! Теперь войдите в систему');
    } catch (error) {
      logger.error(`Ошибка регистрации: ${error.message}`, { stack: error.stack });
      res.status(400).render('pages/register', { 
        error: error.message,
        formData: req.body // Сохраняем введенные данные для повторного заполнения
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).render('pages/login', { 
          error: 'Введите email и пароль' 
        });
      }

      const { token, user } = await AuthService.login(email, password);
      
      // Устанавливаем cookie с JWT токеном
      res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 60 * 60 * 1000, // 1 час
        secure: process.env.NODE_ENV === 'production' // HTTPS в продакшене
      });
      
      logger.info(`Пользователь вошел: ${email}`);
      res.redirect('/profile');
    } catch (error) {
      logger.error(`Ошибка входа: ${error.message}`, { stack: error.stack });
      res.status(401).render('pages/login', { 
        error: 'Неверный email или пароль',
        email: req.body.email // Сохраняем email для повторного ввода
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('token');
      res.redirect('/login?message=Вы успешно вышли из системы');
    } catch (error) {
      logger.error(`Ошибка выхода: ${error.message}`, { stack: error.stack });
      res.status(500).redirect('/login?error=Ошибка при выходе из системы');
    }
  }

  async showRegister(req, res) {
    res.render('pages/register', { 
      error: null,
      formData: {},
      success: req.query.success // Для сообщений об успешной регистрации
    });
  }

  async showLogin(req, res) {
    res.render('pages/login', { 
      error: null,
      email: '',
      message: req.query.message,
      success: req.query.success
    });
  }

  async showProfile(req, res) {
    try {
      // Пользователь уже должен быть в req.user благодаря middleware
      const user = req.user;
      
      if (!user) {
        return res.redirect('/login');
      }

      // Получаем события, которые пользователь организовал
      const organizedEvents = await EventService.getEvents({ organizerId: user.id });
      
      // Получаем события, на которые пользователь зарегистрирован
      // TODO: Добавить метод в EventService для получения регистраций пользователя
      
      res.render('pages/profile', { 
        user,
        organizedEvents,
        registeredEvents: [] // Пока пусто, можно добавить позже
      });
    } catch (error) {
      logger.error(`Ошибка загрузки профиля: ${error.message}`, { stack: error.stack });
      res.status(500).redirect('/login?error=Ошибка загрузки профиля');
    }
  }
}

module.exports = new AuthController();