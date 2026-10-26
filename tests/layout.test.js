import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const styles=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('remove blocos destacados preservando calculadoras',()=>{
  for(const t of ['Cálculos simples.','Cuidados precisos.','Vamos calcular?'])assert.equal(html.includes(t),false,t);
  for(const id of ['panel-imc','panel-pfe','panel-waist'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes('aria-label="Calculadoras digitais"'));
});

test('replica os três contatos oficiais no rodapé',()=>{
  for(const t of ['+55 62 3310-6705','+55 62 3310-6684','daf.farmaciauni@gmail.com','@farmaciaunievangelica','@unievangelica','@daf.farmaciaunieva'])
    assert.ok(html.includes(t),t);
});

test('logotipos preservados estão incorporados para uso offline',()=>{
  assert.equal((html.match(/src="data:image\\/png;base64,/g)||[]).length,3);
  assert.equal(html.includes('src="https://certificados-dacg.onrender.com/assets/'),false);
  assert.ok(styles.includes('.institutional-footer .footer-inner'));
});

test('PFE usa Medicate ATS sem campos extras',()=>{
 assert.ok(html.includes('Medicate Peak Flow Meter'));
 assert.ok(html.includes('Escala ATS · 60 a 900 L/min'));
 assert.ok(!html.includes('id="table-reference"'));
 assert.ok(!html.includes('id="personal-best"'));
 for(const id of ['effort1','effort2','effort3'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('src="./app.js?v=2.8.6"'));
});

test('etapas 2 e 3: idoso, ganho gestacional e interface de atendimento',()=>{
 assert.ok(html.includes('<option value="older">Idoso (60+)'));
 assert.ok(html.includes('tabela semanal oficial'));
 assert.equal((html.match(/class="measurement-help"/g)||[]).length,3);
 assert.ok(styles.includes('.result-actions button'));
 assert.ok(styles.includes(':focus-visible'));
 assert.ok(styles.includes('prefers-reduced-motion'));
});

test('rodapé institucional sempre aberto em três áreas, como o portal DACG',()=>{
  assert.match(html,/class="footer-inner footer-three-columns"/);
  assert.doesNotMatch(html,/<details class="footer-contacts"|<summary>Contatos institucionais/);
  const left=html.indexOf('class="footer-section footer-section-contacts"');
  const center=html.indexOf('class="footer-section footer-section-center"');
  const right=html.indexOf('class="footer-section footer-section-partners"');
  assert.ok(left>0 && left<center && center<right);
  assert.match(html,/class="footer-heading" id="footer-contacts-heading">Contatos institucionais/);
  assert.match(html,/class="footer-caption">© 2026 · v2.8.6/);
  assert.match(html,/class="footer-heading" id="footer-partners-heading">Realização/);
  assert.match(styles,/\.institutional-footer \.footer-three-columns\{display:grid;grid-template-columns:/);
  assert.match(styles,/@media\(max-width:760px\)/);
  assert.match(styles,/@media\(max-width:540px\)/);
});

test('rodapé exibe os ícones e dois WhatsApps institucionais',()=>{
  for(const telefone of ['556233106705','556233106684']){
    assert.ok(html.includes('href="https://wa.me/'+telefone+'"'));
  }
  assert.equal((html.match(/class="contact-svg"/g)||[]).length,6);
  for(const perfil of ['farmaciaunievangelica','unievangelica','daf.farmaciaunieva']){
    assert.ok(html.includes('href="https://www.instagram.com/'+perfil+'/"'));
  }
  assert.ok(html.includes('href="mailto:daf.farmaciauni@gmail.com"'));
  assert.ok(styles.includes('.institutional-footer a:focus-visible'));
});

test('rodapé alinha contatos à esquerda, destaca centro e amplia marcas com divisórias',()=>{
  assert.match(html,/<h2 class="footer-heading" id="footer-contacts-heading">Contatos institucionais<\/h2>/);
  assert.match(html,/<h2 class="footer-heading" id="footer-partners-heading">Realização<\/h2>/);
  assert.match(styles,/\.institutional-footer \.footer-heading\{[^}]*font-size:16px;[^}]*text-align:left/);
  assert.match(styles,/\.institutional-footer \.footer-section-center strong\{[^}]*font-size:19px;[^}]*font-weight:800/);
  assert.match(styles,/\.institutional-footer \.footer-section:not\(:first-child\)::before\{[^}]*background:linear-gradient/);
  assert.match(styles,/\.institutional-footer \.footer-partners img\{[^}]*height:75px/);
  assert.match(styles,/\.institutional-footer \.footer-contact-grid\{[^}]*margin:0/);
  assert.match(styles,/@media\(max-width:760px\)\{[\s\S]*?\.institutional-footer \.footer-section-contacts \.footer-heading\{[^}]*text-align:left/);
  assert.match(html,/<span class="footer-caption">© 2026 · v2\.8\.6<\/span>/);
});


test('o resumo da aba IMC corresponde aos quatro perfis disponíveis',()=>{
  assert.match(html,/Índice de Massa Corporal<\/strong><small>IMC · 4 perfis<\/small>/);
  for(const p of ['adult','older','child','pregnant'])assert.match(html,new RegExp('<option value="'+p+'"'));
  assert.doesNotMatch(html,/IMC · 3 perfis/);
});

test('circunferência: terceira aba, formulário acessível e metodologia com fontes',()=>{
 for(const id of ['tab-waist','panel-waist','waist-form','waist-cm','waist-height','waist-age','waist-sex','waist-pregnant','waist-result','waist-error'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/aria-controls="panel-waist"/);
 assert.match(html,/id="panel-waist" role="tabpanel" aria-labelledby="tab-waist" hidden/);
 assert.match(html,/NICE/);
 assert.match(styles,/\.tool-tabs\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
 assert.match(html,/src="\.\/app\.js\?v=2\.8\.6"/);
});


test('ícone de privacidade usa raio SVG centrado sem depender de glifo da fonte',()=>{
 assert.match(html,/<span class="privacy-badge" aria-hidden="true"><svg viewBox="0 0 24 24"[^>]*><path d="M13\.5 2\.5 6\.5 12h5l-1 9\.5 7-10\.5h-5z"\/><\/svg><\/span>/);
 assert.doesNotMatch(html,/<span class="privacy-badge"[^>]*>⌁<\/span>/);
 assert.match(styles,/\.privacy-badge \{[^}]*display:grid;[^}]*place-items:center;[^}]*width:32px;[^}]*height:32px;/);
 assert.match(styles,/\.privacy-badge svg \{[^}]*width:17px;[^}]*height:17px;[^}]*display:block|\.privacy-badge svg \{[^}]*display:block;[^}]*width:17px;[^}]*height:17px;/);
});
