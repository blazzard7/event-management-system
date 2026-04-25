(() => {
  const startButton = document.getElementById('start-qr-scan');
  const status = document.getElementById('qr-scanner-status');
  const video = document.getElementById('qr-scanner-video');
  const inviteInput = document.getElementById('invite-code-input');
  const scannerBox = document.getElementById('qr-scanner-box');

  if (!startButton || !status || !video || !scannerBox) {
    return;
  }

  let stream;
  let detector;
  let scanTimer;

  async function stopScanner() {
    if (scanTimer) {
      window.clearInterval(scanTimer);
      scanTimer = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
  }

  function redirectFromQr(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) {
      return false;
    }

    if (/^\d{6}$/.test(value)) {
      inviteInput.value = value;
      document.getElementById('invite-form')?.submit();
      return true;
    }

    try {
      const url = new URL(value, window.location.origin);
      window.location.href = url.pathname + url.search;
      return true;
    } catch (error) {
      return false;
    }
  }

  async function scanFrame() {
    if (!detector || video.readyState < 2) {
      return;
    }

    try {
      const barcodes = await detector.detect(video);
      const match = barcodes.find((barcode) => barcode.rawValue);
      if (match && redirectFromQr(match.rawValue)) {
        status.textContent = 'QR-код считан, открываю мероприятие...';
        await stopScanner();
      }
    } catch (error) {
      status.textContent = 'Не удалось считать QR-код. Попробуйте ещё раз.';
    }
  }

  startButton.addEventListener('click', async () => {
    if (!('BarcodeDetector' in window)) {
      status.textContent = 'Ваш браузер не поддерживает сканирование QR. Используйте 6-значный код.';
      return;
    }

    detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      status.textContent = 'Наводите камеру на QR-код мероприятия.';
      scanTimer = window.setInterval(scanFrame, 800);
    } catch (error) {
      status.textContent = 'Не удалось открыть камеру. Разрешите доступ или используйте код.';
    }
  });

  window.addEventListener('beforeunload', stopScanner);
})();
