const CACHE_NAME = 'prisaspan-v02';
const IMAGE_CACHE_NAME = 'prisaspan-images-v01';

// Separar las URLs en diferentes categorías
const criticalResources = [
  '/',
  '/index.html',
  '/blog.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

const imageResources = [
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
    Promise.all([
      // Cache recursos críticos primero
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(criticalResources);
      }),
      
      // Luego cachear imágenes en un cache separado
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.addAll(imageResources);
      })
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Especial manejo para imágenes
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Si está en caché, usar la versión cacheada
          if (cachedResponse) {
            // En segundo plano, verificar si hay una versión más reciente
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => console.log('Imagen en caché usada, actualización fallida'));
              
            return cachedResponse;
          }
          
          // Si no está en caché, intentar la red
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Si falla la red, usar un placeholder
              return caches.match('/img/placeholder.webp');
            });
        });
      })
    );
  } else {
    // Para otros recursos, usar el cache general
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok && event.request.method === 'GET') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              return new Response('Recurso no disponible offline', { status: 404 });
            });
        });
      })
    );
  }
});

// Responder a mensajes para actualización inmediata
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
