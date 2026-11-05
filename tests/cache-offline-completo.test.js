import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const app=readFileSync(new URL('../app.js', import.meta.url),'utf8');
const inicio=app.indexOf('async function cacheOfflineCompleto(');
const fim=app.indexOf('\nif(',inicio);
assert.ok(inicio>=0 && fim>inicio,'Função isolada deve permanecer testável');
const sandbox={URL};
runInNewContext(app.slice(inicio,fim)+'\nthis.check=cacheOfflineCompleto;',sandbox);
const check=sandbox.check;

const base='https://calculadora.test/';
const version='2.8.14';
const required=['./','./index.html','./styles.css?v='+version,'./app.js?v='+version,
  './calculations.js','./bmi-who-data.js','./assets/icon.svg','./manifest.webmanifest'];
const cached=new Set(required.map(a=>new URL(a,base).href));
const complete=(missing=null)=>({
  keys:async()=>['calculadora-extensao-static-v'+version],
  open:async()=>({match:async url=>cached.has(url)&&url!==missing?{}:null}),
});
const opts={controller:{state:'activated'},cachesApi:complete(),
  src:'./app.js?v='+version,baseUrl:base};

test('offline só confirmado quando todos os recursos desta versão existem no cache',async()=>{
  assert.equal(await check(opts),true);
  assert.equal(await check({...opts,cachesApi:complete(new URL('./app.js?v='+version,base).href)}),false);
  assert.equal(await check({...opts,cachesApi:complete(new URL('./bmi-who-data.js',base).href)}),false);
});

test('estado SW inválido, cache antigo ou versão ausente não dão falso positivo',async()=>{
  assert.equal(await check({...opts,controller:null}),false);
  assert.equal(await check({...opts,controller:{state:'installing'}}),false);
  assert.equal(await check({...opts,src:'./app.js'}),false);
  assert.equal(await check({...opts,cachesApi:{keys:async()=>['calculadora-extensao-static-v2.8.11'],open:async()=>{throw Error('Não abrir');}}}),false);
});

test('conferência é local e nunca transmite ou armazena dados de pacientes',()=>{
  const fonte=app.slice(inicio,fim);
  assert.ok(!fonte.includes('fetch('));
  assert.ok(!fonte.includes('localStorage'));
  assert.ok(app.includes("navigator.serviceWorker.addEventListener('controllerchange',conferir)"));
});
