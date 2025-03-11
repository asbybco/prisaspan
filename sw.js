// Versión del caché
const CACHE_NAME = 'prisaspan-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css', // Si separas el CSS en un archivo externo, ajusta esto
    '/js/script.js',   // Si separas el JS en un archivo externo, ajusta esto
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

// Fetch: Servir desde caché o red
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                // Cachear nuevas respuestas dinámicamente
                if (event.request.method === 'GET') {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Fallback offline: Mostrar index.html si falla
            return caches.match('/index.html');
        })
    );
});
