const CACHE = "star-whale-maze-v32";
const ASSETS = [
  "./", "./index.html", "./styles.css?v=32", "./app.js?v=32", "./manifest.webmanifest?v=32",
  "./levels/forest.js?v=32", "./levels/clock.js?v=32", "./levels/dragon.js?v=32",
  "./levels/sea.js?v=32", "./levels/stars.js?v=32", "./levels/cloudtrain.js?v=32",
  "./levels/moonlibrary.js?v=32",
  "./assets/scenes/forest-maze-v1.webp",
  "./assets/scenes/clock-maze-v1.webp", "./assets/scenes/dragon-maze-v1.webp",
  "./assets/scenes/sea-maze-v1.webp", "./assets/scenes/stars-maze-v1.webp", "./assets/scenes/cloud-train-maze-v1.webp",
  "./assets/scenes/moon-library-maze-v1.webp",
  "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
