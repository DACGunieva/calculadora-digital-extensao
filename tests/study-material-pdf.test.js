import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const expectedHash = '49c4537d9f9cbad22a176e1a323d2409dfa338920bdc1281aed14aab73ff496c';
const source = readFileSync(new URL('../materiais/parametros-de-estudo-extensao.pdf', import.meta.url));
const published = readFileSync(new URL('../dist/materiais/parametros-de-estudo-extensao.pdf', import.meta.url));
const html = readFileSync(new URL('../index.html', import.meta.url),'utf8');
const worker = readFileSync(new URL('../sw.js', import.meta.url),'utf8');

test('publica exatamente o PDF enviado, sem alterações de bytes',()=>{
  assert.equal(source.length,582347);
  assert.equal(published.length,582347);
  assert.equal(source.subarray(0,8).toString('latin1'),'%PDF-1.7');
  assert.ok(source.equals(published),'PDF publicado deve coincidir bit a bit com o original');
  assert.equal(createHash('sha256').update(source).digest('hex'),expectedHash);
  assert.equal(createHash('sha256').update(published).digest('hex'),expectedHash);
});

test('o link do cartão aponta para o arquivo efetivamente distribuído em dist',()=>{
  assert.match(html,/href="\.\/materiais\/parametros-de-estudo-extensao\.pdf"/);
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
  assert.match(html,/Material didático de consulta/);
  assert.doesNotMatch(html,/https:\/\/drive\.google\.com\/file\/d\//);
});

test('o PDF não é adicionado compulsoriamente ao cache offline',()=>{
  assert.match(worker,/calculadora-extensao-static-v2\.8\.9/);
  assert.doesNotMatch(worker,/parametros-de-estudo-extensao\.pdf/);
});
