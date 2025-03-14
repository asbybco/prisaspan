const CACHE_NAME = 'prisaspan-v01';

const urlsToCache = [
  '/',
  '/index.html',
  '/blog.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/img/hero-prisas-pan.webp',
  '/img/logo.svg',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/sobre-nosotros-1.webp',
  '/img/sobre-nosotros-2.webp',
  '/img/sobre-nosotros-3.webp',
  '/img/pan-hawaiano-prisas-pan.webp',
  '/img/torta-tres-leches-prisas-pan.webp',
  '/img/pan-queso-prisas-pan.webp',
  '/img/pan-maiz-prisas-pan.webp',
  '/img/pandebono.webp',
  '/img/torta-tres-leches.webp',
  '/img/pan-hawaiano.webp',
  '/img/bunuelo.webp',
  '/img/pan-de-yuca.webp',
  '/img/pan-de-maiz.webp',
  '/img/huevos-hogao.webp',
  '/img/arepa-choclo.webp',
  '/img/calentado.webp',
  '/img/placeholder.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Error al cachear recursos:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          }
          return cachedResponse;
        }).catch(() => cachedResponse);
      }
      return fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/img/placeholder.webp');
        }
        return new Response('Recurso no disponible offline', { status: 404 });
      });
    })
  );
});