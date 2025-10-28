// === web/sw.js ===
// Лёгкий service worker для Sport Diary (только статика)
const CACHE_NAME = 'sportdiary-static-v1';

const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/Icon-192.svg',
  '/icons/Icon-512.svg',
  '/flutter.js'
];

// Установка SW и кэширование статических файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Активация SW и очистка старого кэша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Не кэшируем HTML — чтобы обновления прилетали сразу
  if (req.headers.get('accept')?.includes('text/html')) return;

  // Для статических файлов — cache-first стратегия
  const isStatic = STATIC_ASSETS.includes(url.pathname);
  if (isStatic) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached ||
        fetch(req).then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, resClone));
          return res;
        })
      )
    );
  }
});
