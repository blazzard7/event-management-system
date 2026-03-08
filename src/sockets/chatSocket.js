const logger = require('../lib/logger');
const chatService = require('../services/chatService');

function registerChatSocket(io) {
  io.on('connection', async (socket) => {
    logger.info('Socket connected', { socketId: socket.id });
    const history = await chatService.getHistory();
    socket.emit('chat:history', history);

    socket.on('chat:message', async (payload) => {
      try {
        const saved = await chatService.postMessage({
          userId: payload.userId || null,
          authorName: payload.authorName || 'Guest',
          message: payload.message
        });
        io.emit('chat:message', saved);
      } catch (error) {
        socket.emit('chat:error', error.message);
      }
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });
}

module.exports = { registerChatSocket };
