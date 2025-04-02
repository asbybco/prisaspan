const CACHE_NAME = 'prisaspan-v04';
const IMAGE_CACHE_NAME = 'prisaspan-images-v03';
const MAX_IMAGE_CACHE_ITEMS = 50;

const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

const criticalResources = [
  '/',
  '/index.html',
  '/blog.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

const immediateImageResources = [
  '/img/hero-prisas-pan.webp',
  '/img/logo.svg',
  '/img/placeholder.webp',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/sobre-nosotros-1.webp'
];

const secondaryImageResources = [
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
  '/img/calentado.webp'
];

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Mantener las imágenes más recientes eliminando las antiguas
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

async function getCacheExpiration(request) {
  const cachedMetadata = await caches.match(`${request.url}:metadata`);
  if (cachedMetadata) {
    const metadata = await cachedMetadata.json();
    return metadata.timestamp + CACHE_EXPIRATION < Date.now();
  }
  return false;
}

async function addMetadata(cache, request, response) {
  const metadata = {
    url: request.url,
    timestamp: Date.now()
  };
  const metadataResponse = new Response(JSON.stringify(metadata));
  await cache.put(`${request.url}:metadata`, metadataResponse);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      // Cachear primero los recursos críticos
      const mainCache = await caches.open(CACHE_NAME);
      await mainCache.addAll(criticalResources);
      
      // Luego cachear imágenes inmediatas
      const imageCache = await caches.open(IMAGE_CACHE_NAME);
      await imageCache.addAll(immediateImageResources);
      
      // Cachear imágenes secundarias en segundo plano si hay buena conexión
      if (navigator.connection && (navigator.connection.effectiveType === '4g' || navigator.connection.effectiveType === 'wifi')) {
        await imageCache.addAll(secondaryImageResources);
      }
      
      self.skipWaiting();
    } catch (error) {
      console.error('Error durante la instalación del Service Worker:', error);
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
      
      // Limpiar metadatos antiguos
      const imageCache = await caches.open(IMAGE_CACHE_NAME);
      const keys = await imageCache.keys();
      const metadataKeys = keys.filter(key => key.url.includes(':metadata'));
      const metadataUrls = metadataKeys.map(key => key.url.replace(':metadata', ''));
      
      const expiredMetadata = await Promise.all(
        metadataKeys.map(async (key) => {
          const metadataResponse = await imageCache.match(key);
          const metadata = await metadataResponse.json();
          return metadata.timestamp + CACHE_EXPIRATION < Date.now() ? key : null;
        })
      );
      
      await Promise.all(
        expiredMetadata.filter(Boolean).map(key => imageCache.delete(key))
      );
      
      await trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
      
      await self.clients.claim();
    } catch (error) {
      console.error('Error durante la activación del Service Worker:', error);
    }
  })());
});

self.addEventListener('fetch', (event) => {
  // No interceptar peticiones que no son a nuestro dominio
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // No interceptar solicitudes al CloudFlare CDN o solicitudes POST
  if (event.request.url.includes('/cdn-cgi/') || event.request.method !== 'GET') {
    return;
  }
  
  // Estrategia para imágenes: stale-while-revalidate con fallback
  if (event.request.destination === 'image') {
    event.respondWith((async () => {
      try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        // Verificar si hay una versión en caché
        if (cachedResponse) {
          // Comprobar si necesita actualización en segundo plano
          const isExpired = await getCacheExpiration(event.request);
          
          // Iniciar actualización en segundo plano si está expirada
          if (isExpired) {
            try {
              const networkResponse = await fetch(event.request);
              if (networkResponse.ok) {
                await cache.put(event.request, networkResponse.clone());
                await addMetadata(cache, event.request, networkResponse);
                await trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
              }
            } catch (error) {
              // Continuar usando la versión cacheada si falla la red
              console.warn('Error al actualizar imagen:', error);
            }
          }
          
          // Devolver la versión cacheada inmediatamente
          return cachedResponse;
        }
        
        // Si no está en caché, intentar la red
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            // Almacenar en caché para futuros usos
            await cache.put(event.request, networkResponse.clone());
            await addMetadata(cache, event.request, networkResponse);
            await trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
            
            return networkResponse;
          }
        } catch (error) {
          console.warn('Error al obtener imagen de la red:', error);
        }
        
        // Fallback al placeholder si todo falla
        const placeholderResponse = await cache.match('/img/placeholder.webp');
        if (placeholderResponse) {
          return placeholderResponse;
        }
        
        // Último recurso si ni siquiera tenemos un placeholder
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#5B2A32"/></svg>',
          { 
            status: 200, 
            headers: { 'Content-Type': 'image/svg+xml' } 
          }
        );
      } catch (error) {
        console.error('Error fatal en la estrategia de caché de imágenes:', error);
        return new Response('Imagen no disponible', { status: 503 });
      }
    })());
  } else {
    // Estrategia para otros recursos: Network-first con fallback a caché
    event.respondWith((async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Para recursos críticos, usar caché-first para mayor velocidad
        if (criticalResources.includes(new URL(event.request.url).pathname)) {
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            // Actualizar en segundo plano
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  cache.put(event.request, networkResponse);
                }
              })
              .catch(error => console.warn('Error al actualizar recurso crítico:', error));
            
            return cachedResponse;
          }
        }
        
        // Para el resto de recursos, intentar red primero
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            await cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        } catch (networkError) {
          // Si la red falla, intentar el caché
          console.warn('Error en red, intentando caché:', networkError);
        }
        
        // Comprobar caché como fallback
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si el recurso es HTML, mostrar página offline
        if (event.request.destination === 'document') {
          const offlineResponse = await cache.match('/index.html');
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // Último recurso
        return new Response('Recurso no disponible en modo offline', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        console.error('Error fatal en la estrategia de caché general:', error);
        return new Response('Error al procesar la solicitud', { status: 500 });
      }
    })());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
