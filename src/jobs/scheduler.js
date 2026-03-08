const cron = require('node-cron');
const config = require('../config');
const logger = require('../lib/logger');
const eventRepository = require('../repositories/eventRepository');
const notificationService = require('../services/notificationService');

function startScheduler() {
  const task = cron.schedule(config.jobs.schedulerCron, async () => {
    try {
      const completed = await eventRepository.markCompletedEvents();
      const reminders = await notificationService.createUpcomingEventReminders();
      logger.info('Scheduler tick completed', { completed, reminders });
    } catch (error) {
      logger.error('Scheduler error', { message: error.message });
    }
  });

  logger.info('Scheduler started', { cron: config.jobs.schedulerCron });
  return task;
}

module.exports = { startScheduler };
