// src/controllers/eventController.js
const Event = require('../models/event.js');
const logger = require('../utils/logger');

class EventController {
  async createEvent(req, res) {
    try {
      const { title, description, date, time, location } = req.body;
      if (!title || !description || !date || !time || !location) {
        throw new Error('Missing required fields');
      }
      const event = await Event.create({
        title,
        description,
        date,
        time,
        location,
        organizerId: req.user.id,
      });
      logger.info(`Event created successfully: ${title}`);
      res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
      logger.error(`Event creation error: ${error.message}`, { stack: error.stack });
      res.status(400).render('pages/createEvent', { error: error.message, user: req.user });
    }
  }

  async getEvents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Получаем номер страницы из запроса
      const limit = 5; // Количество мероприятий на странице
      const offset = (page - 1) * limit; // Смещение для запроса

      const { count, rows: events } = await Event.findAndCountAll({
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit); // Общее количество страниц

      res.render('pages/events', {
        events,
        currentPage: page,
        totalPages,
        user: req.user,
      });
    } catch (error) {
      logger.error(`Error retrieving events: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async registerForEvent(req, res) {
    try {
      const { eventId } = req.body;
      if (!eventId) {
        throw new Error('Missing required fields');
      }
      const event = await Event.findByPk(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      await event.addUser(req.user);
      logger.info(`User registered for event: ${event.title}`);
      res.status(200).json({ message: 'Registered for event successfully' });
    } catch (error) {
      logger.error(`Event registration error: ${error.message}`, { stack: error.stack });
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      await event.destroy();
      logger.info(`Event deleted successfully: ${event.title}`);
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      logger.error(`Event deletion error: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new EventController();