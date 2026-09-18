/* 事宝儿 Service Worker：离线缓存，数据仍在浏览器本地，不受影响 */
var CACHE = 'shibaoer-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') { return; }
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) { return; }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var network = fetch(event.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(event.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
