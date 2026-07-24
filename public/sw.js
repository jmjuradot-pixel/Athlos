const CACHE = "athlos-v1";
const urls = ["/", "/check-in", "/health", "/progress", "/photos", "/settings"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(urls))); self.skipWaiting(); });
self.addEventListener("fetch", (event) => { event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)).catch(() => caches.match("/"))); });
