// /src/models/event.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');
const User = require('./user.js');

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
});

Event.belongsTo(User, { foreignKey: 'organizerId' });
User.hasMany(Event, { foreignKey: 'organizerId' });

module.exports = Event;