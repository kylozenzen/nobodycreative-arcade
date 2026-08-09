const CACHE = "nobody-arcade-v1-5-7";
const CORE = [
  "./", "./index.html", "./assets/styles.css", "./assets/app.js", "./data/games.js",
  "./manifest.webmanifest", "./assets/favicon.svg", "./assets/share-card.svg",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./secret/index.html", "./secret/game.js", "./secret/styles.css",
  "./assets/games/plot-twisted-movies/plot-twisted-movies-poster.webp",
  "./assets/games/high-stakes-truth/poster.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type !== "basic") return response;
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
