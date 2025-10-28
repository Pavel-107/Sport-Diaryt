window.addEventListener('load', function () {
  // 1) Регистрируем service worker (если поддерживается)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        // мгновенные обновления при новом билде
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (nw) {
            nw.addEventListener('statechange', () => {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                // новая версия готова — мягко перезагрузим страницу
                location.reload();
              }
            });
          }
        });
      })
      .catch(() => { /* тихо игнорируем, приложение все равно запустится */ });
  }

  // 2) Запуск Flutter (стандартный bootstrap)
  // объект _flutter.loader уже в пакете Flutter; его подключает flutter_bootstrap.js
  if (window._flutter && _flutter.loader) {
    _flutter.loader.loadEntrypoint({
      serviceWorker: { serviceWorkerVersion: null },
      onEntrypointLoaded: async function (engineInitializer) {
        const appRunner = await engineInitializer.initializeEngine();
        await appRunner.runApp();
      }
    });
  } else {
    // На случай, если Flutter bootstrap ещё не прогрузился
    const waitAndStart = setInterval(() => {
      if (window._flutter && _flutter.loader) {
        clearInterval(waitAndStart);
        _flutter.loader.loadEntrypoint({
          serviceWorker: { serviceWorkerVersion: null },
          onEntrypointLoaded: async (engineInitializer) => {
            const appRunner = await engineInitializer.initializeEngine();
            await appRunner.runApp();
          }
        });
      }
    }, 50);
    setTimeout(() => clearInterval(waitAndStart), 5000);
  }
});
