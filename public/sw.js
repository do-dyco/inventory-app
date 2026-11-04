// ponytail: cache-first for app shell, network-first for everything else.
// Upgrade to Workbox/strategies if offline complexity grows.
const CACHE = 'inventory-app-v1';
const SHELL = ['/', '/manifest.json', '/favicon.svg', '/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE)
                        .map((k) => caches.delete(k)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const { request } = e;
    if (request.method !== 'GET') return;

    // Network-first for navigations & API
    if (request.mode === 'navigate' || request.url.includes('/api/')) {
        e.respondWith(
            fetch(request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(request, copy));
                    return res;
                })
                .catch(() =>
                    caches.match(request).then((r) => r || caches.match('/')),
                ),
        );
        return;
    }

    // Cache-first for static assets
    e.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request).then((res) => {
                    if (res.ok && res.type === 'basic') {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy));
                    }
                    return res;
                }),
        ),
    );
});
