import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('acessibilidade e conectividade sem coleta de dados',()=>{
  assert.match(html,/id="statusConexao"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.ok(app.includes("window.addEventListener('offline',atualizarConectividade)"));
  assert.ok(app.includes("window.addEventListener('online',atualizarConectividade)"));
  assert.ok(app.includes("navigator.onLine===false"));
  assert.ok(app.includes("Conexão sinalizada pelo navegador"));
  assert.ok(app.includes("LATEST_SUMMARY.imc=null;LATEST_SUMMARY.pfe=null;LATEST_SUMMARY.waist=null"));
});

test('copiar e imprimir IMC e cintura, sem PFE alterado',()=>{
  assert.ok(app.includes("kind==='imc'||kind==='waist'"));
  assert.ok(app.includes("data-print-result"));
  assert.ok(app.includes("function imprimirResumoLocal(kind)"));
  assert.ok(app.includes("if(!['imc','waist'].includes(kind)"));
  assert.ok(app.includes("window.print()"));
  assert.ok(app.includes("conteudo.textContent=LATEST_SUMMARY[kind]"));
  assert.ok(app.includes("resumo-copia-manual"));
  assert.ok(app.includes("Resumo educativo para cópia manual"));
  assert.ok(css.includes("#resumo-para-impressao"));
  assert.ok(css.includes("body:has(> #resumo-para-impressao)"));
});

test('PWA preserva cache exclusivamente de assets e versão coerente',()=>{
  const versao=pkg.version;
  assert.equal(versao,'2.8.12');
  assert.ok(html.includes('styles.css?v='+versao));
  assert.ok(html.includes('app.js?v='+versao));
  assert.ok(sw.includes('calculadora-extensao-static-v'+versao));
  assert.ok(sw.includes('ALLOWED_URLS'));
  assert.ok(sw.includes("event.request.method!=='GET'"));
  assert.ok(!sw.includes('LATEST_SUMMARY'));
  assert.ok(!sw.includes('localStorage'));
});
