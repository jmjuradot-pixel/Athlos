const CACHE = "athlos-v3";
const urls = ["/", "/check-in", "/zepp", "/workouts", "/activities", "/progress", "/health", "/photos", "/import", "/settings", "/journal", "/ia-report"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(urls)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
      self.clients.claim(),
    ])
  );
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && new URL(request.url).origin === self.location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
      }
      return res;
    })).catch(() => caches.match("/"))
  );
});
