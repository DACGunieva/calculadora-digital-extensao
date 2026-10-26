// Cache apenas dos arquivos públicos; não armazena dados preenchidos.
const CACHE_NAME='calculadora-extensao-static-v2.8.6';
// Os três PNGs oficiais estão incorporados ao HTML e disponíveis offline com ele.
const ASSETS=['./','./index.html','./styles.css?v=2.8.6','./app.js?v=2.8.6','./calculations.js','./bmi-who-data.js','./assets/icon.svg','./manifest.webmanifest'];
// Somente recursos estáticos da versão oficial podem entrar no cache.
// URLs de formulário, consulta ou navegação com parâmetros nunca são armazenadas.
const ALLOWED_URLS=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('calculadora-extensao-static-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const assetEstatico=ALLOWED_URLS.has(new URL(event.request.url).href);
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&assetEstatico){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    }
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return caches.match('./index.html');
    return Response.error();
  }));
});
