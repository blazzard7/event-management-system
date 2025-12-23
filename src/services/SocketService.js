// src/services/SocketService.js
class SocketService {
  constructor() {
    this.io = null;
  }

  setIo(ioInstance) {
    this.io = ioInstance;
  }

  emitNewEvent(event) {
    if (this.io) {
      this.io.emit('newEvent', event);
    }
  }

  emitNewRegistration(registration) {
    if (this.io) {
      this.io.emit('newRegistration', registration);
    }
  }

  emitRegistrationConfirmed(registration) {
    if (this.io) {
      this.io.emit('registrationConfirmed', registration);
    }
  }

  emitEventUpdated(event) {
    if (this.io) {
      this.io.emit('eventUpdated', event);
    }
  }

  emitEventDeleted(eventId) {
    if (this.io) {
      this.io.emit('eventDeleted', eventId);
    }
  }

  sendNotificationToUser(userId, notification) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', notification);
    }
  }
}

module.exports = new SocketService();