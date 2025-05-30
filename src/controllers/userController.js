// server/src/controllers/userController.js
const UserService = require('../services/userService.js');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await UserService.getProfile(req.user.userId);
      res.render('pages/profile', { user });
    } catch (error) {
      res.render('pages/profile', { error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { username, password } = req.body;
      await UserService.updateProfile(req.user.userId, username, password);
      res.redirect('/profile');
    } catch (error) {
      res.render('pages/profile', { error: error.message });
    }
  }
}

module.exports = new UserController();