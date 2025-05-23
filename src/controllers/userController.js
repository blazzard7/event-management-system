const UserService = require('../services/userService.js');
const UserView = require('../views/userView.js');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await UserService.getProfile(req.user.userId);
      UserView.renderSuccess(res, user);
    } catch (error) {
      UserView.renderError(res, error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const { username, password } = req.body;
      const user = await UserService.updateProfile(req.user.userId, username, password);
      UserView.renderSuccess(res, user);
    } catch (error) {
      UserView.renderError(res, error.message);
    }
  }
}

module.exports = new UserController();