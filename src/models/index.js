// src/models/index.js
const sequelize = require('../config/db.js');
const User = require('./user.js');
const Event = require('./event.js');
const UserEvents = require('./userEvent.js');

// Настройка ассоциаций
User.belongsToMany(Event, { through: UserEvents, foreignKey: 'userId' });
Event.belongsToMany(User, { through: UserEvents, foreignKey: 'eventId' });

Event.belongsTo(User, { foreignKey: 'organizerId' });
User.hasMany(Event, { foreignKey: 'organizerId' });

module.exports = {
  sequelize,
  User,
  Event,
  UserEvents,
};