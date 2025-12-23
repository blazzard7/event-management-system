// src/controllers/eventController.js
const EventService = require('../services/eventService.js');
const logger = require('../utils/logger');

class EventController {
  async createEvent(req, res) {
    try {
      const { title, description, date_time, location_id, max_participants, price } = req.body;
      
      // Проверка обязательных полей
      if (!title || !description || !date_time || !location_id) {
        return res.status(400).render('pages/createEvent', { 
          error: 'Заполните все обязательные поля',
          user: req.user,
          formData: req.body
        });
      }
      
      // Создаем событие
      const event = await EventService.createEvent(
        title,
        description,
        date_time,
        parseInt(location_id),
        req.user.id,
        max_participants ? parseInt(max_participants) : 0,
        price ? parseFloat(price) : 0
      );
      
      logger.info(`Создано мероприятие: ${title} (ID: ${event.id})`);
      
      // Перенаправляем на страницу события или список событий
      res.redirect(`/events/${event.id}?success=Мероприятие успешно создано`);
    } catch (error) {
      logger.error(`Ошибка создания мероприятия: ${error.message}`, { stack: error.stack });
      res.status(400).render('pages/createEvent', { 
        error: error.message,
        user: req.user,
        formData: req.body
      });
    }
  }

  async getEvents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // Количество мероприятий на странице
      
      // Получаем фильтры из запроса
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.location_id) filters.locationId = parseInt(req.query.location_id);
      
      // Получаем все события с фильтрами
      const events = await EventService.getEvents(filters);
      
      // Пагинация на стороне сервера (можно оптимизировать в EventService)
      const totalEvents = events.length;
      const totalPages = Math.ceil(totalEvents / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedEvents = events.slice(startIndex, endIndex);
      
      // Получаем список мест для фильтра
      // TODO: Создать LocationService для получения мест
      
      res.render('pages/events', {
        events: paginatedEvents,
        currentPage: page,
        totalPages,
        user: req.user,
        filters,
        totalEvents
      });
    } catch (error) {
      logger.error(`Ошибка получения мероприятий: ${error.message}`, { stack: error.stack });
      res.status(500).render('pages/events', {
        events: [],
        user: req.user,
        error: 'Не удалось загрузить мероприятия'
      });
    }
  }

  async getEventById(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      const event = await EventService.getEventById(eventId);
      
      if (!event) {
        return res.status(404).render('pages/404', { 
          user: req.user,
          message: 'Мероприятие не найдено'
        });
      }
      
      // Проверяем, зарегистрирован ли пользователь на это событие
      let userRegistration = null;
      if (req.user) {
        // TODO: Добавить метод в EventService для проверки регистрации
      }
      
      res.render('pages/eventDetail', {
        event,
        user: req.user,
        userRegistration,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      logger.error(`Ошибка получения мероприятия: ${error.message}`, { stack: error.stack });
      res.status(500).render('pages/404', { 
        user: req.user,
        message: 'Ошибка загрузки мероприятия'
      });
    }
  }

  async registerForEvent(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      const { notes } = req.body;
      
      const registration = await EventService.registerForEvent(eventId, userId, notes);
      
      logger.info(`Пользователь ${userId} зарегистрирован на мероприятие ${eventId}`);
      
      res.redirect(`/events/${eventId}?success=Вы успешно зарегистрированы на мероприятие`);
    } catch (error) {
      logger.error(`Ошибка регистрации на мероприятие: ${error.message}`, { stack: error.stack });
      res.redirect(`/events/${eventId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  async cancelRegistration(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const success = await EventService.cancelRegistration(userId, eventId);
      
      if (success) {
        logger.info(`Пользователь ${userId} отменил регистрацию на мероприятие ${eventId}`);
        res.redirect(`/events/${eventId}?success=Регистрация отменена`);
      } else {
        res.redirect(`/events/${eventId}?error=Регистрация не найдена`);
      }
    } catch (error) {
      logger.error(`Ошибка отмены регистрации: ${error.message}`, { stack: error.stack });
      res.redirect(`/events/${eventId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  async updateEvent(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Проверяем, является ли пользователь организатором
      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
      
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Только организатор или администратор может редактировать мероприятие' });
      }
      
      const updatedEvent = await EventService.updateEvent(eventId, updateData);
      
      logger.info(`Мероприятие обновлено: ${updatedEvent.title} (ID: ${eventId})`);
      
      res.redirect(`/events/${eventId}?success=Мероприятие успешно обновлено`);
    } catch (error) {
      logger.error(`Ошибка обновления мероприятия: ${error.message}`, { stack: error.stack });
      res.redirect(`/events/${req.params.id}?error=${encodeURIComponent(error.message)}`);
    }
  }

  async deleteEvent(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      
      // Проверяем, является ли пользователь организатором
      const event = await EventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
      
      if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Только организатор или администратор может удалить мероприятие' });
      }
      
      const success = await EventService.deleteEvent(eventId);
      
      if (success) {
        logger.info(`Мероприятие удалено: ${event.title} (ID: ${eventId})`);
        res.redirect('/events?success=Мероприятие успешно удалено');
      } else {
        res.redirect(`/events/${eventId}?error=Не удалось удалить мероприятие`);
      }
    } catch (error) {
      logger.error(`Ошибка удаления мероприятия: ${error.message}`, { stack: error.stack });
      res.redirect(`/events/${req.params.id}?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Новый метод для отображения формы создания события
  async showCreateEvent(req, res) {
    try {
      // Получаем список мест для выпадающего списка
      // TODO: Создать LocationService
      const locations = []; // Временно пустой массив
      
      res.render('pages/createEvent', {
        user: req.user,
        locations,
        error: null,
        formData: {}
      });
    } catch (error) {
      logger.error(`Ошибка загрузки формы создания мероприятия: ${error.message}`);
      res.render('pages/createEvent', {
        user: req.user,
        locations: [],
        error: 'Ошибка загрузки формы'
      });
    }
  }
}

module.exports = new EventController();