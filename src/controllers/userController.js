// src/controllers/userController.js
const UserService = require('../services/userService.js');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await UserService.getProfile(req.user.id);
      res.render('pages/profile', { 
        user,
        error: null,
        success: req.query.success 
      });
    } catch (error) {
      logger.error(`Ошибка получения профиля: ${error.message}`);
      res.render('pages/profile', { 
        user: req.user, // Используем данные из сессии
        error: 'Не удалось загрузить профиль'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { email, firstName, lastName, phone, password } = req.body;
      
      // Подготавливаем данные для обновления
      const updateData = {};
      if (email && email !== req.user.email) updateData.email = email;
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (phone) updateData.phone = phone;
      if (password) updateData.password = password;
      
      // Если нет данных для обновления
      if (Object.keys(updateData).length === 0) {
        return res.redirect('/profile?error=Нет данных для обновления');
      }
      
      const updatedUser = await UserService.updateProfile(req.user.id, updateData);
      
      // Обновляем данные в сессии (если используется)
      if (req.user) {
        req.user = { ...req.user, ...updatedUser };
      }
      
      res.redirect('/profile?success=Профиль успешно обновлен');
    } catch (error) {
      logger.error(`Ошибка обновления профиля: ${error.message}`);
      res.redirect(`/profile?error=${encodeURIComponent(error.message)}`);
    }
  }

  async getUserEvents(req, res) {
    try {
      // Получаем события пользователя (как организатора и как участника)
      // TODO: Добавить методы в EventService для получения событий пользователя
      const userId = req.user.id;
      
      res.json({
        success: true,
        organizedEvents: [], // События, где пользователь организатор
        registeredEvents: [] // События, на которые пользователь зарегистрирован
      });
    } catch (error) {
      logger.error(`Ошибка получения событий пользователя: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();