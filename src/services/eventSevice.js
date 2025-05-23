const Event = require('../models/event');
const Registration = require('../models/registration');
const User = require('../models/user');
const emailService = require('../utils/email');
const { getIo } = require('../utils/socket');

class EventService {
  async createEvent(title, description, date, time, location, organizerId) {
    const event = await Event.create({ title, description, date, time, location, organizerId });
    const organizer = await User.findByPk(organizerId);
    await emailService.sendEmail(organizer.username, 'New Event Created', `You have created a new event: ${title}`);
    getIo().emit('newEvent', event);
    return event;
  }

  async getEvents() {
    const events = await Event.findAll({ include: [User] });
    return events;
  }

  async registerForEvent(eventId, userId) {
    const registration = await Registration.create({ eventId, userId });
    const event = await Event.findByPk(eventId);
    const user = await User.findByPk(userId);
    await emailService.sendEmail(user.username, 'Event Registration', `You have registered for the event: ${event.title}`);
    getIo().emit('newRegistration', registration);
    return registration;
  }

  async confirmRegistration(registrationId) {
    const registration = await Registration.findByPk(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }
    registration.status = 'confirmed';
    await registration.save();
    const event = await Event.findByPk(registration.eventId);
    const user = await User.findByPk(registration.userId);
    await emailService.sendEmail(user.username, 'Registration Confirmed', `Your registration for the event: ${event.title} has been confirmed`);
    getIo().emit('registrationConfirmed', registration);
    return registration;
  }
}

module.exports = new EventService();