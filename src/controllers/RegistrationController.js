// src/controllers/RegistrationController.js
const RegistrationService = require('../services/RegistrationService');
const EventService = require('../services/eventService');
const logger = require('../utils/logger');

class RegistrationController {
  async getEventRegistrations(req, res) {
    try {
      const eventId = parseInt(req.params.eventId);
      const { status } = req.query;
      
      // Проверяем права (организатор события или админ)
      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Событие не найдено' });
      }
      
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Доступ запрещен' 
        });
      }
      
      const registrations = await RegistrationService.getRegistrationsByEvent(eventId, status);
      
      // Если запрос API
      if (req.accepts('json')) {
        return res.json({ success: true, data: registrations });
      }
      
      // Если запрос для страницы
      res.render('pages/eventRegistrations', {
        event,
        registrations,
        user: req.user,
        stats: await RegistrationService.getEventRegistrationStats(eventId)
      });
    } catch (error) {
      logger.error(`Ошибка получения регистраций: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserRegistrations(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      
      const registrations = await RegistrationService.getRegistrationsByUser(userId, status);
      res.json({ success: true, data: registrations });
    } catch (error) {
      logger.error(`Ошибка получения регистраций пользователя: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRegistrationById(req, res) {
    try {
      const registration = await RegistrationService.getRegistrationById(parseInt(req.params.id));
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Регистрация не найдена' });
      }
      
      // Проверяем права (участник, организатор или админ)
      if (registration.user_id !== req.user.id && 
          registration.organizer_id !== req.user.id && 
          req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Доступ запрещен' 
        });
      }
      
      res.json({ success: true, data: registration });
    } catch (error) {
      logger.error(`Ошибка получения регистрации: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateRegistrationStatus(req, res) {
    try {
      const registrationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          success: false, 
          error: 'Статус обязателен' 
        });
      }
      
      const registration = await RegistrationService.getRegistrationById(registrationId);
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Регистрация не найдена' });
      }
      
      // Проверяем права (организатор события или админ)
      const event = await EventService.getEventById(registration.event_id);
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Только организатор или администратор может изменять статус регистрации' 
        });
      }
      
      const updatedRegistration = await RegistrationService.updateRegistrationStatus(
        registrationId, 
        status, 
        req.user.id
      );
      
      res.json({ success: true, data: updatedRegistration });
    } catch (error) {
      logger.error(`Ошибка обновления статуса регистрации: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteRegistration(req, res) {
    try {
      const registrationId = parseInt(req.params.id);
      
      const registration = await RegistrationService.getRegistrationById(registrationId);
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Регистрация не найдена' });
      }
      
      // Проверяем права (участник, организатор или админ)
      if (registration.user_id !== req.user.id && 
          registration.organizer_id !== req.user.id && 
          req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Доступ запрещен' 
        });
      }
      
      const success = await RegistrationService.deleteRegistration(registrationId);
      if (success) {
        res.json({ success: true, message: 'Регистрация успешно удалена' });
      } else {
        res.status(400).json({ success: false, error: 'Не удалось удалить регистрацию' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления регистрации: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRegistrationHistory(req, res) {
    try {
      const registrationId = parseInt(req.params.id);
      
      const registration = await RegistrationService.getRegistrationById(registrationId);
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Регистрация не найдена' });
      }
      
      // Проверяем права (участник, организатор или админ)
      if (registration.user_id !== req.user.id && 
          registration.organizer_id !== req.user.id && 
          req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Доступ запрещен' 
        });
      }
      
      const history = await RegistrationService.getRegistrationHistory(registrationId);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error(`Ошибка получения истории регистрации: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRegistrationStats(req, res) {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Проверяем права (организатор события или админ)
      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Событие не найдено' });
      }
      
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Доступ запрещен' 
        });
      }
      
      const stats = await RegistrationService.getEventRegistrationStats(eventId);
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error(`Ошибка получения статистики регистраций: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new RegistrationController();