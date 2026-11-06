// 离线缓存：第一次打开后把页面存到平板上，没网也能打开“拼一拼”和“认一认”
// 改了 index.html 后，把版本号加 1，平板才会拿到新版本
const CACHE = 'pinyin-v1';
const FILES = ['./', './index.html', './manifest.json',
               './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// 删除旧版本的缓存
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 优先用网络上的最新版，没网时用缓存
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
