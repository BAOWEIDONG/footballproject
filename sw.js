// Service Worker — PWA 离线缓存
const CACHE_NAME = 'football-claim-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', (event) => {
  // 跳过 API 请求
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // 缓存成功的 HTML/JS/CSS 请求
        if (response.ok && (
          event.request.destination === 'script' ||
          event.request.destination === 'style' ||
          event.request.destination === 'document'
        )) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});