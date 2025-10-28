/* SportDiary SW — аккуратное кэширование + мгновенные обновления */
const CACHE = 'sd-v1';
const PRECACHE_URLS = [
  '/', '/index.html', '/manifest.json', '/flutter.js',
  '/favicon.svg'
];

// Файлы c «вечным» кэшем (версии меняются в путях при билде)
const IMMUTABLE_RE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|wasm|ttf|otf|eot|woff2?)$/i;
const DART_MAIN_RE = /\/main\.dart\.js$/; // всегда стараться брать свежий

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Навигация: network-first -> index.html (SPA)
  if (request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        return fresh;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // main.dart.js — network-first (чтобы всегда получать новый билд)
  if (DART_MAIN_RE.test(url.pathname)) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        const cache = await caches.open(CACHE);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(request)) || Response.error();
      }
    })());
    return;
  }

  // Статика (иконки/шрифты/wasm) — stale-while-revalidate
  if (IMMUTABLE_RE.test(url.pathname) || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/canvaskit/')) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request).then(resp => {
        if (resp && resp.status === 200) cache.put(request, resp.clone());
        return resp;
      }).catch(() => null);
      return cached || (await fetchPromise) || Response.error();
    })());
    return;
  }

  // Остальное — по сети как есть
});
