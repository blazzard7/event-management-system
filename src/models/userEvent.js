// src/models/userEvent.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const UserEvents = sequelize.define('UserEvents', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  eventId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'events',
      key: 'id',
    },
  },
}, {
  tableName: 'user_events',
  timestamps: true,
});

module.exports = UserEvents;