// /src/models/registration.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');
const User = require('./user.js');
const Event = require('./event.js');

const Registration = sequelize.define('Registration', {
  status: {
    type: DataTypes.ENUM('в ожидании', 'принято', 'отколнено'),
    defaultValue: 'в ожидании',
  },
}, {
  tableName: 'registrations',
  timestamps: true,
});

Registration.belongsTo(User, { foreignKey: 'userId' });
Registration.belongsTo(Event, { foreignKey: 'eventId' });
User.hasMany(Registration, { foreignKey: 'userId' });
Event.hasMany(Registration, { foreignKey: 'eventId' });

module.exports = Registration;