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

test('PFE usa Medicate ATS sem campos extras',()=>{
 assert.ok(html.includes('Medicate Peak Flow Meter'));
 assert.ok(html.includes('Escala ATS · 60 a 900 L/min'));
 assert.ok(!html.includes('id="table-reference"'));
 assert.ok(!html.includes('id="personal-best"'));
 for(const id of ['effort1','effort2','effort3'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('src="./app.js?v=2.6.1"'));
});

test('etapas 2 e 3: idoso, ganho gestacional e interface de atendimento',()=>{
 assert.ok(html.includes('<option value="older">Idoso (60+)'));
 assert.ok(html.includes('tabela semanal oficial'));
 assert.equal((html.match(/class="measurement-help"/g)||[]).length,2);
 assert.ok(styles.includes('.result-actions button'));
 assert.ok(styles.includes(':focus-visible'));
 assert.ok(styles.includes('prefers-reduced-motion'));
});

test('rodapé usa ícones correspondentes aos canais oficiais e mantém links úteis',()=>{
  assert.match(html,/class="footer-contact-link" href="tel:\+556233106705"/);
  assert.match(html,/class="footer-contact-icon-link" href="https:\/\/wa\.me\/556233106684"/);
  assert.match(html,/href="tel:\+556233106684"/);
  assert.equal((html.match(/class="contact-svg"/g)||[]).length,6);
  for(const perfil of ['farmaciaunievangelica','unievangelica','daf.farmaciaunieva']){
    assert.ok(html.includes('href="https://www.instagram.com/'+perfil+'/"'));
  }
  assert.match(html,/href="mailto:daf\.farmaciauni@gmail\.com"/);
  assert.doesNotMatch(html,/wa\.me\/556233106705/);
  assert.ok(styles.includes('.institutional-footer .footer-contact-link'));
  assert.ok(styles.includes('.institutional-footer a:focus-visible'));
});
