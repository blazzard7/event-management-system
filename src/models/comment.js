const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db,js');
const User = require('./user.js');
const Event = require('./event.js');

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'comments',
  timestamps: true,
});

Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Event, { foreignKey: 'eventId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Event.hasMany(Comment, { foreignKey: 'eventId' });

module.exports = Comment;