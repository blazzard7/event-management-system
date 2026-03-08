const http = require('http');
const { Server } = require('socket.io');
const config = require('./config');
const logger = require('./lib/logger');
const { createApp } = require('./app');
const { initializeDatabase } = require('./db/init');
const { startScheduler } = require('./jobs/scheduler');
const { registerChatSocket } = require('./sockets/chatSocket');

async function start() {
  await initializeDatabase();
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server);

  registerChatSocket(io);
  startScheduler();

  server.listen(config.app.port, () => {
    logger.info('Server started', {
      name: config.app.name,
      env: config.app.env,
      url: `http://localhost:${config.app.port}`
    });
  });
}

start().catch((error) => {
  logger.error('Startup error', { message: error.message, stack: error.stack });
  process.exit(1);
});
