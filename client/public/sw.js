const CACHE_NAME = 'gambler-cup-2025-v4';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/gambler-logo.png',
  '/gambler-logo-192.png',
  '/gambler-logo-512.png'
];

// Install event - skip waiting to immediately activate new service worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing new service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting and immediately activate new service worker
  self.skipWaiting();
});

// Fetch event - Network-first strategy for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Network-first for HTML pages and API calls
  if (event.request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful HTML responses
          if (response.ok && event.request.mode === 'navigate') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache only for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(event.request) || caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
  }
});

// Activate event - claim clients and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating new service worker');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Message event - handle update notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline score updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementation for syncing offline data
  console.log('Background sync triggered');
}
