const User = require('../models/user.js');
const bcrypt = require('bcrypt');

class UserService {
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, username, password) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (username) {
      user.username = username;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return user;
  }
}

module.exports = new UserService();