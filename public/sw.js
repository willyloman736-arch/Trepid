/* ============================================================
   Trepid Service Worker
   - Precaches core shell (dashboard, rules, journal, offline)
   - Network-first for pages (fresh content, cache fallback)
   - Cache-first for static assets (_next/static/*)
   - Network-only for API routes (never serve stale data)
   - Offline fallback to /offline page
   - Push notification display + click handling
   ============================================================ */

const CACHE_NAME = 'trepid-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/rules',
  '/journal',
  '/analytics',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon.svg',
  '/favicon.svg',
];

/* ── Install: precache core assets ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Don't fail install if a single asset is unavailable
        console.warn('[SW] Precache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

/* ── Activate: purge old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: strategy per route type ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API routes → network only, offline JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({
            error: 'offline',
            message: 'You are offline. Data will sync when reconnected.',
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Static assets (_next/static/) → cache first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Pages → network first, cache fallback, offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});

/* ── Push notifications ── */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Trepid', {
        body: data.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        tag: data.tag || 'trepid',
        renotify: true,
        data: { url: data.url || '/dashboard' },
        actions: data.actions || [],
      })
    );
  } catch {
    // Swallow malformed push
  }
});

/* ── Notification click → open/focus the app ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          return client.navigate(url);
        }
      }
      return self.clients.openWindow?.(url);
    })
  );
});
