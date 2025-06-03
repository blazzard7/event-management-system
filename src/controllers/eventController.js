// server/src/controllers/eventController.js
const EventService = require('../services/eventService.js');
const CommentService = require('../services/commentService.js');
// src/controllers/eventController.js
const Event = require('../models/event.js');

exports.getEvents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const events = await Event.findAndCountAll({
      offset: (page - 1) * limit,
      limit: limit,
    });

    res.render('pages/events', {
      title: 'Events',
      events: events.rows,
      currentPage: page,
      totalPages: Math.ceil(events.count / limit),
      limit: limit,
    });
  } catch (error) {
    res.status(500).send({ error: 'Something went wrong!' });
  }
};

class EventController {
  async createEvent(req, res) {
    try {
      const { title, description, date, time, location } = req.body;
      const organizerId = req.user.userId;
      await EventService.createEvent(title, description, date, time, location, organizerId);
      res.redirect('/events');
    } catch (error) {
      res.render('pages/events', { error: error.message });
    }
  }

  async getEvents(req, res) {
    try {
      const events = await EventService.getEvents();
      res.render('pages/events', { events });
    } catch (error) {
      res.render('pages/events', { error: error.message });
    }
  }

  async getEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.getEvent(eventId);
      const comments = await CommentService.getComments(eventId);
      res.render('pages/event', { event, comments });
    } catch (error) {
      res.render('pages/event', { error: error.message });
    }
  }

  async registerForEvent(req, res) {
    try {
      const { eventId } = req.body;
      const userId = req.user.userId;
      await EventService.registerForEvent(eventId, userId);
      res.redirect(`/events/${eventId}`);
    } catch (error) {
      res.render('pages/event', { error: error.message });
    }
  }

  async confirmRegistration(req, res) {
    try {
      const { registrationId } = req.params;
      await EventService.confirmRegistration(registrationId);
      res.redirect('/events');
    } catch (error) {
      res.render('pages/events', { error: error.message });
    }
  }
}

module.exports = new EventController();