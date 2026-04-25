const AppError = require('../lib/AppError');
const chatRepository = require('../repositories/chatRepository');

async function getHistory() {
  return chatRepository.getRecentMessages();
}

async function postMessage({ userId, authorName, message }) {
  const text = String(message || '').trim();
  if (!text) {
    throw new AppError('Message is required', 400);
  }
  return chatRepository.saveMessage({
    userId,
    authorName: String(authorName || 'Guest').trim() || 'Guest',
    message: text
  });
}

async function sendMessage(eventId, userId, text) {

    if (!text || text.trim() === '') {
        throw new Error("Сообщение пустое");
    }

    const messageId = await chatRepository.saveMessage(
        eventId,
        userId,
        text
    );

    return {
        id: messageId,
        eventId,
        userId,
        message: text
    };
}
module.exports = { getHistory, postMessage };
