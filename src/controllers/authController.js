// src/controllers/authController.js
const AuthService = require('../services/authService.js');
const logger = require('../utils/logger');
const { User, Event } = require('../models/index.js');

class AuthController {
  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      if (!username || !password || !role) {
        throw new Error('Missing required fields');
      }
      const user = await AuthService.register(username, password, role);
      logger.info(`User registered successfully: ${username}`);
      res.redirect('/login'); // Перенаправление на страницу входа
    } catch (error) {
      logger.error(`Registration error: ${error.message}`, { stack: error.stack });
      res.status(400).render('pages/register', { error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new Error('Missing required fields');
      }
      const token = await AuthService.login(username, password);
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/profile'); // Перенаправление на страницу профиля
    } catch (error) {
      logger.error(`Login error: ${error.message}`, { stack: error.stack });
      res.status(401).render('pages/login', { error: error.message });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('token');
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      logger.error(`Logout error: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async showRegister(req, res) {
    res.render('pages/register', { error: null });
  }

  async showLogin(req, res) {
    res.render('pages/login', { error: null });
  }

  async showProfile(req, res) {
    const user = req.user; // Предполагается, что req.user установлен middleware аутентификации
    if (!user) {
      return res.redirect('/login');
    }
    const events = await user.getEvents();
    res.render('pages/profile', { user, events });
  }
}

module.exports = new AuthController();