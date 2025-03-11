// Versión del caché
const CACHE_NAME = 'prisaspan-v2'; // Actualizado a v2 para reflejar los cambios

// Archivos estáticos a cachear durante la instalación
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/img/hero-prisas-pan.webp',
    '/img/logo.svg',
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/sobre-nosotros-1.webp',
    '/img/sobre-nosotros-2.webp',
    '/img/sobre-nosotros-3.webp',
    '/img/producto-destacado-1.webp',
    '/img/producto-destacado-2.webp',
    '/img/producto-destacado-3.webp',
    '/img/producto-destacado-4.webp'
];

// Instalación: Cachear archivos esenciales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache abierto');
            return cache.addAll(urlsToCache);
        })
    );
    // Forzar activación inmediata
    self.skipWaiting();
});

// Activación: Limpiar cachés antiguos
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

// Fetch: Servir desde caché o red con stale-while-revalidate
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (event.request.method === 'GET' && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Si la red falla, devolver la respuesta cacheada si existe
                    return cachedResponse;
                });

                // Devolver la respuesta cacheada si existe, o esperar la respuesta de la red
                return cachedResponse || fetchPromise;
            });
        }).catch(() => {
            // Fallback offline: Mostrar index.html si todo falla
            return caches.match('/index.html');
        })
    );
});
