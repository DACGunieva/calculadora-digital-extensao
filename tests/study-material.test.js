import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('cartão do material de estudo corresponde ao padrão do portal e fica após a metodologia',()=>{
  const metodo=html.indexOf('id="metodologia"');
  const estudo=html.indexOf('id="material-de-estudo"');
  const footer=html.indexOf('<footer class="footer institutional-footer">');
  assert.ok(metodo>0 && metodo<estudo && estudo<footer);
  assert.match(html,/<h2 id="study-resources-title">Material de Estudo<\/h2>/);
  assert.match(html,/Parâmetros de Estudo às Atividades de Extensão/);
  assert.match(html,/PFE, oximetria, tipagem sanguínea e IMC/);
  assert.match(css,/\.study-resource-card\s*\{/);
  assert.match(css,/:root\[data-theme="dark"\] \.study-resource-card/);
  assert.match(css,/@media\(max-width:640px\)/);
});

test('o link de material é uma âncora acessível que abre o PDF em outra aba',()=>{
  assert.match(html,/<a class="study-resource-card" href="\.\/materiais\/parametros-de-estudo-extensao-revisao-2026\.pdf"/);
  assert.match(html,/target="_blank" rel="noopener noreferrer" type="application\/pdf"/);
  assert.match(html,/aria-label="Abrir Parâmetros de Estudo às Atividades de Extensão, PDF de 21 páginas, em nova aba"/);
  assert.match(css,/\.study-resource-card:focus-visible/);
  assert.doesNotMatch(html,/<iframe[^>]+parametros-de-estudo-extensao/i);
});

test('o cartão de estudo não acrescenta coleta de dados ou script de terceiros',()=>{
  assert.equal((html.match(/class="study-resource-card"/g)||[]).length,1);
  assert.match(css,/:root\[data-theme="dark"\] \.study-resource-card\s*\{[^}]*background:\s*#0f1712/);
});
