// 네트워크 우선: 연결되면 항상 새 파일을 받고 저장해 두며, 연결이 없을 때만 저장본을 보여 준다.
var CACHE = 'market-calendar-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(['./', 'data.js', 'manifest.webmanifest', 'icon-192.png']);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || Response.error(); });
    })
  );
});
