const CACHE = "nobody-arcade-v2-1-0";
const CORE = [
  "./", "./index.html", "./assets/styles.css", "./assets/app.js", "./assets/games-loader.js",
  "./games/games.json", "./manifest.webmanifest", "./assets/favicon.svg", "./assets/share-card.svg",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./secret/index.html", "./secret/game.js", "./secret/styles.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  const needsFreshContent =
    url.pathname === "/games/games.json" ||
    url.pathname.startsWith("/games/");

  // Game data and artwork change often. Prefer the network so a newly deployed
  // poster is visible immediately, while keeping the current cache as an
  // offline fallback.
  if (needsFreshContent) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (!response || response.status !== 200 || response.type !== "basic") return response;
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
