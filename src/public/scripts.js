// src/public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000); // Уведомление будет отображаться 3 секунды
  }
});