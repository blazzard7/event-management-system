(function () {
  var container = document.getElementById('toast-container');
  if (!container) return;

  var messages = window.__toasts || [];
  messages.forEach(function (msg) {
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (msg.type || 'info');
    toast.textContent = msg.text;
    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    setTimeout(function () {
      toast.classList.remove('toast--visible');
      toast.addEventListener('transitionend', function () {
        toast.remove();
      });
    }, 3500);
  });
})();
