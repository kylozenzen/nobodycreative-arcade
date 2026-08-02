const CACHE = "nobody-arcade-v2-2026-08-01";
const CORE = [
  "./", "./index.html", "./assets/styles.css", "./assets/app.js", "./data/games.js", "./data/ranks.js", "./data/achievements.js", "./data/challenges.js", "./js/storage.js", "./js/analytics.js", "./js/progression.js", "./js/passport.js", "./js/event-bridge.js",
  "./manifest.webmanifest", "./assets/favicon.svg", "./assets/share-card.svg",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./secret/index.html", "./secret/game.js", "./secret/styles.css"
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
  const networkFirst = url.pathname.startsWith("/secret/") || /\.(?:html|js|css)$/.test(url.pathname) || event.request.mode === "navigate";
  if (networkFirst) {
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html"))));
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
