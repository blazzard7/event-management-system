// src/models/index.js
const sequelize = require('../config/db.js');
const User = require('./user.js');
const Event = require('./event.js');

// Настройка ассоциаций
User.belongsToMany(Event, { through: 'UserEvents' });
Event.belongsToMany(User, { through: 'UserEvents' });

Event.belongsTo(User, { foreignKey: 'organizerId' });
User.hasMany(Event, { foreignKey: 'organizerId' });

module.exports = {
  sequelize,
  User,
  Event,
};