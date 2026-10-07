const CACHE_NAME = 'portfolio-v13';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/image/4.jpg',
  '/image/1.jpg',
  '/image/6.jpg',
  '/image/13.jpg',
  '/image/14.jpg',
  '/image/17.mp4',
  '/image/16.mp4',
  '/image/15.mp4',
  '/fonts/Kare.woff2',
  '/fonts/GaretVariableVF.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== CACHE_NAME){
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const requestPath = decodeURIComponent(new URL(event.request.url).pathname);
  if(event.request.headers.has('range') || /\.(mp4|m4v|webm)$/i.test(requestPath)) return;
  
  // Page navigations: network first so the landing page is always the real, current home page.
  if(event.request.mode === 'navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if(response && response.status === 200){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if(response) return response;
        return fetch(event.request).then(fetchResponse => {
          if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic'){
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      })
      .catch(() => caches.match('/index.html'))
  );
});