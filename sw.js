/**
 * Service Worker — 轻量离线策略
 *
 * 核心原则：
 * - HTML: 始终从网络加载（确保用户总是最新版本）
 * - JS/CSS: 网络优先，缓存兜底（快速加载最新版）
 * - 静态大文件: 网络优先，缓存兜底
 * - 仅首次访问或离线时使用缓存
 */
const CACHE_NAME = 'football-claim-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // 跳过 API 请求
  if (path.includes('/api/')) return;

  // 全部资源使用「网络优先」策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 缓存成功的 GET 响应
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached))
  );
});
