const CACHE_NAME = 'kiosco-digital-cache-v1.0.3';
const ASSETS_TO_CACHE = [
  './index.html',
  './ofertas.html',
  './assets/css/tailwind-built.css?v=1.0.3',
  './assets/css/fontawesome-all.min.css?v=1.0.3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin || url.href.includes('cdnjs.cloudflare.com')) {
    // ESTRATEGIA NETWORK-FIRST PARA HTML Y CSS (Para ver los cambios al instante)
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css')) {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
    } else {
      // ESTRATEGIA CACHE-FIRST PARA IMAGENES, FUENTES Y OTROS ESTÁTICOS
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          });
        })
      );
    }
  }
});
