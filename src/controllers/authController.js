// src/controllers/authController.js
const AuthService = require('../services/authService.js');

class AuthController {
  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      const user = await AuthService.register(username, password, role);
      res.redirect('/login');
    } catch (error) {
      res.render('pages/register', { error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const token = await AuthService.login(username, password);
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/events');
    } catch (error) {
      res.render('pages/login', { error: error.message });
    }
  }

  async showRegister(req, res) {
    res.render('pages/register');
  }

  async showLogin(req, res) {
    res.render('pages/login');
  }
}

module.exports = new AuthController();