const CACHE_NAME = 'nopMedCount-2026-11-17-v11';
const ASSETS = [
  './',
  './index.html',
  './nopMedCount.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const accept = req.headers.get('accept') || '';
  const path = new URL(req.url).pathname;
  const isHtml = req.mode === 'navigate' || accept.includes('text/html');
  const isManifest = path.endsWith('/manifest.json');
  if(isHtml || isManifest){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
