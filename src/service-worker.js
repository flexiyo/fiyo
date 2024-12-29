import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

const AUDIO_CACHE = "audio-cache-v1";

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
    }),
);

registerRoute(
    ({ request }) => request.destination === "audio",
    async ({ request }) => {
        const cache = await caches.open(AUDIO_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }
);

self.addEventListener("activate", async (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            const allowedCaches = [AUDIO_CACHE, "static-assets", "html-cache"];
            for (const cache of cacheNames) {
                if (!allowedCaches.includes(cache)) {
                    await caches.delete(cache);
                }
            }
        })()
    );
});

self.addEventListener("message", async (event) => {
    if (event.data && event.data.type === "CLEAR_AUDIO_CACHE") {
        const cache = await caches.open(AUDIO_CACHE);
        await cache.keys().then((keys) => {
            keys.forEach((key) => cache.delete(key));
        });
    }
});
