import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('remove blocos destacados preservando calculadoras',()=>{
  for(const t of ['Cálculos simples.','Cuidados precisos.','Vamos calcular?'])assert.equal(html.includes(t),false,t);
  for(const id of ['panel-imc','panel-pfe'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes('aria-label="Calculadoras digitais"'));
});

test('replica os três contatos oficiais no rodapé',()=>{
  for(const t of ['+55 62 3310-6705','+55 62 3310-6684','daf.farmaciauni@gmail.com','@farmaciaunievangelica','@unievangelica','@daf.farmaciaunieva'])
    assert.ok(html.includes(t),t);
});

test('inclui logos institucionais idênticos ao portal de certificados',()=>{
  for(const p of ['dacg-49899de.png','unievangelica-7fc02040.png','farmacia-9941e843.png'])
    assert.ok(html.includes('https://certificados-dacg.onrender.com/assets/'+p),p);
  assert.ok(styles.includes('.institutional-footer .footer-inner'));
});
