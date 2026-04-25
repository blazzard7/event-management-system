(() => {
  const chatMessages = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const authorInput = document.getElementById('chat-author');
  const textInput = document.getElementById('chat-input');

  if (!chatMessages || !form || !window.io || typeof window.EVENT_ID === 'undefined') {
    return;
  }

  const socket = io();

  function renderMessage(message) {
    const item = document.createElement('div');
    item.className = 'chat-message';
    item.textContent = `${message.author_name}: ${message.message}`;
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  socket.on('chat:history', (messages) => {
    chatMessages.innerHTML = '';
    messages.forEach(renderMessage);
  });

  socket.on('chat:message', renderMessage);
  socket.on('chat:error', (message) => window.alert(message));
  socket.emit('joinEventChat', window.EVENT_ID);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!textInput.value.trim()) {
      return;
    }

    socket.emit('chat:message', {
      authorName: authorInput?.value || 'Guest',
      message: textInput.value
    });
    textInput.value = '';
  });
})();
