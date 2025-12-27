const CACHE_NAME = "tdah-cache-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/src/app.js",
  "/src/storage.js",
  "/src/routine.js",
  "/src/focus.js",
  "/src/rewards.js",
  "/src/emotions.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key))))
  );
  self.clients.claim();
});

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const clone = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  return response;
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  if (ASSETS.includes(url.pathname) || ["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
