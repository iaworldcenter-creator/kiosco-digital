const CACHE_NAME = 'kiosco-digital-cache-v1.0.5';
const ASSETS_TO_CACHE = [
  './assets/css/tailwind-built.css?v=1.0.4',
  './assets/css/fontawesome-all.min.css?v=1.0.4'
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
  
  // BYPASS HTML PAGES completely from Service Worker caching to reflect updates instantly
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    return; // Let the browser handle HTML requests directly from the network
  }
  
  if (url.origin === self.location.origin || url.href.includes('cdnjs.cloudflare.com')) {
    // Cache-first strategy for static assets (images, css, js)
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.includes('/assets/')) {
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
