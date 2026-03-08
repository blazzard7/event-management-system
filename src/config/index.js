const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = Object.freeze({
  app: {
    name: process.env.APP_NAME || 'Event Management System',
    env: process.env.NODE_ENV || 'development',
    port: toNumber(process.env.PORT, 3000),
    sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'event_management_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!'
  },
  chat: {
    historyLimit: toNumber(process.env.CHAT_HISTORY_LIMIT, 30)
  },
  jobs: {
    schedulerCron: process.env.SCHEDULER_CRON || '*/10 * * * *'
  }
});

module.exports = config;
