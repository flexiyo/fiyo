import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst } from "workbox-strategies";
import { CacheFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "html-cache",
    plugins: [
      {
        cacheWillUpdate: async ({ response }) =>
          response?.status === 200 ? response : null,
      },
    ],
  }),
);

registerRoute(
  ({ request }) =>
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [],
  }),
);

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match("/offline.html"))
      );
    }),
  );
});
