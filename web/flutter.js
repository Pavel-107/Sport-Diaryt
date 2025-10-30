window.addEventListener('load', function () {
  _flutter.loader.loadEntrypoint({
    serviceWorker: { serviceWorkerVersion: null },
    onEntrypointLoaded: function (engineInitializer) {
      engineInitializer.initializeEngine().then(function (appRunner) {
        appRunner.runApp();
      });
    },
  });
});
