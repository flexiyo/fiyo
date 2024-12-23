import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, NetworkFirst } from "workbox-strategies";
import { CacheFirst, NetworkOnly } from "workbox-strategies";
import { openDB } from "idb";

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'music-cache-v1';
const DB_NAME = "MusicCacheDB";
const DB_VERSION = 1;
const TRACK_STORE_NAME = "tracks";

//Create a database
const openDatabase = async () => {
    return openDB(DB_NAME,DB_VERSION,{
        upgrade(db){
            if(!db.objectStoreNames.contains(TRACK_STORE_NAME)){
                const trackStore = db.createObjectStore(TRACK_STORE_NAME,{keyPath:"id"});
                trackStore.createIndex("by_track_id","id");
            }
        }
    })
};

const getCachedBlob = async (db, trackId) => {
   const cachedTrack = await db.get(TRACK_STORE_NAME,trackId)
   return cachedTrack?.audioBlob;
};

const cacheAndStoreBlob = async (db,trackId,response) => {
    try{
        const blob = await response.blob();
        const trackData = {
            id: trackId,
            audioBlob : blob
        }
        await db.put(TRACK_STORE_NAME,trackData)
        return blob
    } catch(error){
       throw new Error(`Error while saving track ${error}`)
    }
}


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

registerRoute(
    ({request}) => request.destination === "audio",
    async ({request}) =>{
        try{
            const url = new URL(request.url);
            const trackId = url.pathname.split("/").pop();
            const db = await openDatabase();
            const cachedBlob = await getCachedBlob(db,trackId);
           
            if(cachedBlob){
              return new Response(cachedBlob);
            }
            const networkResponse = await fetch(request)
            if(networkResponse.ok){
                const blob = await cacheAndStoreBlob(db,trackId,networkResponse.clone());
                return new Response(blob);
            }
          }
        catch (e){
            console.error("Error in fetching audio",e)
        }
    return new NetworkOnly().handle({request})
    }
)

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    const db = await openDatabase();
    await db.clear(TRACK_STORE_NAME);
      const keys = await caches.keys()
       for(const cache of keys){
         if(cache === "static-assets"){
           continue;
         }
        await caches.delete(cache)
       }
  }
});