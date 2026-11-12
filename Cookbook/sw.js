'use strict';
const CACHE='grammys-kitchen-shell-v46',MEDIA='grammys-kitchen-media-v2';
const ASSETS=["./", "./index.html", "./styles.css?v=46", "./cookbook-store.js?v=46", "./boot.js?v=46", "./timer.js?v=46", "./checklists.js?v=46", "./app.js?v=46", "./share-recipe.js?v=46", "./recipe-navigation.js?v=46", "./data/catalog.v2.json", "./data/legacy-baseline.json", "./manifest.webmanifest", "./assets/cookie-icon.svg", "./assets/cookie-icon-v1-180.png", "./assets/cookie-icon-v1-192.png", "./assets/cookie-icon-v1-512.png", "./assets/cookie-icon-v1-maskable-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('grammys-kitchen-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(url.pathname.includes('/assets/')){event.respondWith(caches.open(MEDIA).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response}));return}
 event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;try{return await fetch(event.request)}catch(error){if(event.request.mode==='navigate')return cache.match('./index.html');throw error}}));
});
