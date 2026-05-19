(function () {
  document.addEventListener('submit', function (e) {
    var form = e.target;
    var btn = form.querySelector('button[type="submit"]');
    if (!btn || btn.dataset.noLoading) return;
    btn.disabled = true;
    btn.textContent = btn.dataset.loading || 'Сохранение...';
  });
})();
