const CACHE_NAME = "mortgage-calculator-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/screenshot1.png",
  "/logo192.png",
  "/logo512.png"
  // Add other static assets like CSS/JS here if needed
];

// Install and cache necessary assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Forces SW activation after install
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Takes control of open pages
});

// Serve cache-first, fallback to network, then fallback to offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Optionally cache new resources here if needed
            return response;
          })
          .catch(() => {
            // Fallback: SPA routing or offline
            if (event.request.mode === "navigate") {
              return caches.match("/index.html");
            }
          })
      );
    })
  );
});
