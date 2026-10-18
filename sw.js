// O service worker só guarda arquivos do aplicativo, nunca entradas de pacientes.
const CACHE_NAME='calculadora-extensao-static-v2.1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./calculations.js','./bmi-who-data.js','./assets/icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('calculadora-extensao-static-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(v=>v||fetch(e.request)));});