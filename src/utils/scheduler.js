// src/utils/scheduler.js
const cron = require('node-cron');
const Event = require('../models/event.js');
const transporter = require('../config/email.js');
const ejs = require('ejs');
const path = require('path');
const logger = require('../utils/logger');

const sendEventReminders = async () => {
  try {
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const events = await Event.findAll({
      where: {
        date: {
          [Op.between]: [now, oneDayLater],
        },
      },
      include: [{ model: User, through: { attributes: [] } }],
    });

    for (const event of events) {
      for (const user of event.Users) {
        const templatePath = path.join(__dirname, '../views/emails/eventReminder.ejs');
        const html = await ejs.renderFile(templatePath, { user, event });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Event Reminder',
          html: html,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Reminder email sent to ${user.email} for event: ${event.title}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending event reminders: ${error.message}`, { stack: error.stack });
  }
};

// Запуск планировщика задач каждый день в 9:00 утра
cron.schedule('0 9 * * *', sendEventReminders);