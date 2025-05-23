const AuthService = require('../services/authService.js');
const AuthView = require('../views/authView.js');

class AuthController {
  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      const user = await AuthService.register(username, password, role);
      AuthView.renderSuccess(res, user);
    } catch (error) {
      AuthView.renderError(res, error.message);
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const token = await AuthService.login(username, password);
      AuthView.renderSuccess(res, { token });
    } catch (error) {
      AuthView.renderError(res, error.message);
    }
  }
}

module.exports = new AuthController();