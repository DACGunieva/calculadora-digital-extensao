import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const marker='/* Tema da Calculadora Digital DACG';
const offset=app.indexOf(marker);
assert.ok(offset>0,'rotina do tema no JS distribuído');
const themeCode=app.slice(offset);

function fixture({saved=null,osDark=false,blocked=false}={}){
  const data=new Map();
  if(saved!==null)data.set('dacg-tema',saved);
  const events={},buttonEvents={},systemEvents={},attributes={},buttonAttrs={};
  const icon={textContent:'☾'};
  const label={textContent:'Tema escuro'};
  const button={title:'',setAttribute:(k,v)=>{buttonAttrs[k]=v;},addEventListener:(type,fn)=>{buttonEvents[type]=fn;},querySelector:(selector)=>selector==='.theme-symbol'?icon:selector==='.theme-toggle-label'?label:null};
  const root={style:{},setAttribute:(k,v)=>{attributes[k]=v;}};
  const themeMeta={setAttribute:(k,v)=>{themeMeta[k]=v;}};
  const document={
    documentElement:root,readyState:'loading',
    getElementById:id=>id==='btnTemaCalculadora'?button:null,
    querySelector:selector=>selector==='meta[name="theme-color"]'?themeMeta:null,
    addEventListener:(type,fn)=>{events[type]=fn;}
  };
  const media={matches:osDark,addEventListener:(type,fn)=>{systemEvents[type]=fn;}};
  const storage={
    getItem:key=>{if(blocked)throw new Error('Storage blocked');return data.get(key)??null;},
    setItem:(key,value)=>{if(blocked)throw new Error('Storage blocked');data.set(key,value);}
  };
  const window={matchMedia:()=>media,localStorage:storage,addEventListener:(type,fn)=>{events[type]=fn;}};
  runInNewContext(themeCode,{window,document});
  events.DOMContentLoaded?.();
  return {data,events,button,buttonAttrs,buttonEvents,icon,label,root,attributes,themeMeta,media,systemEvents};
}

test('tema claro padrão e preferência escura do sistema',()=>{
 const light=fixture();
 assert.equal(light.attributes['data-theme'],'light');
 assert.equal(light.buttonAttrs['aria-label'],'Ativar tema escuro');
 assert.equal(light.buttonAttrs['aria-pressed'],'false');
 const dark=fixture({osDark:true});
 assert.equal(dark.attributes['data-theme'],'dark');
 assert.equal(dark.root.style.colorScheme,'dark');
 assert.equal(dark.themeMeta.content,'#0f1512');
 assert.equal(dark.buttonAttrs['aria-label'],'Ativar tema claro');
});

test('preferência explícita clara vence modo escuro do sistema',()=>{
 const x=fixture({saved:'light',osDark:true});
 assert.equal(x.attributes['data-theme'],'light');
 assert.equal(x.themeMeta.content,'#123f34');
 x.media.matches=false;x.systemEvents.change();
 assert.equal(x.attributes['data-theme'],'light');
});

test('botão alterna, persiste apenas preferência visual e atualiza acessibilidade',()=>{
 const x=fixture();
 x.buttonEvents.click();
 assert.equal(x.attributes['data-theme'],'dark');
 assert.equal(x.data.get('dacg-tema'),'dark');
 assert.equal(x.buttonAttrs['aria-pressed'],'true');
 assert.equal(x.buttonAttrs['aria-label'],'Ativar tema claro');
 assert.equal(x.icon.textContent,'☀');
 assert.equal(x.label.textContent,'Tema claro');
 assert.deepEqual([...x.data.keys()],['dacg-tema']);
 x.buttonEvents.click();
 assert.equal(x.data.get('dacg-tema'),'light');
 assert.equal(x.buttonAttrs['aria-pressed'],'false');
});

test('funciona sem armazenamento e responde a alterações de tema do sistema',()=>{
 const x=fixture({blocked:true});
 x.media.matches=true;x.systemEvents.change();
 assert.equal(x.attributes['data-theme'],'dark');
 x.buttonEvents.click();
 assert.equal(x.attributes['data-theme'],'light');
 x.media.matches=false;x.systemEvents.change();
 assert.equal(x.attributes['data-theme'],'light');
});

test('outras abas da calculadora sincronizam preferência por storage',()=>{
 const x=fixture({saved:'dark'});
 x.events.storage({key:'dacg-tema',newValue:'light'});
 assert.equal(x.attributes['data-theme'],'light');
 x.events.storage({key:'dacg-tema',newValue:null});
 x.media.matches=true;x.systemEvents.change();
 assert.equal(x.attributes['data-theme'],'dark');
});

test('tema está integrado aos assets servidos e cache PWA v2.8.4',()=>{
 assert.match(html,/id="btnTemaCalculadora"/);
 assert.match(html,/class="theme-toggle-label">Tema escuro/);
 assert.match(html,/Criador: Erick de Oliveira Martins · Coordenador de Extensões \(DACG\)/);
 assert.doesNotMatch(html,/Transparência sobre o que a calculadora faz/);
 assert.match(css,/@media\(max-width:660px\)/);
 assert.match(html,/class="header-actions"/);
 assert.match(html,/aria-pressed="false"/);
 assert.match(html,/content="light dark"/);
 assert.match(html,/styles\.css\?v=2\.8\.4/);
 assert.match(html,/app\.js\?v=2\.8\.4/);
 assert.match(html,/footer-caption">© 2026 · v2\.8\.4/);
 assert.match(sw,/calculadora-extensao-static-v2\.8\.4/);
 assert.match(sw,/styles\.css\?v=2\.8\.4/);
 assert.match(sw,/app\.js\?v=2\.8\.4/);
 for(const selector of [
  ':root[data-theme="dark"]','.tool-tab.active','.result-side',
  '.institutional-footer','.pfe-zone-status-danger','.pfe-zone-status-warning',
  '.pfe-zone-status-normal','.method-waist-card','.input-wrap input',
  '.measurement-help','.privacy-strip','.result-actions button','.theme-toggle'
 ]) assert.ok(css.includes(selector),selector);
 assert.ok(!html.includes('theme.css')&&!html.includes('theme.js'),'Render só distribui assets preexistentes');
 assert.match(css,/@media print/);
});

test('crédito do criador é sempre uma linha e nunca é omitido ou cortado',()=>{
 assert.match(html,/Criador: Erick de Oliveira Martins · Coordenador de Extensões \(DACG\)/);
 assert.match(css,/\.brand-creator\{[^}]*max-width:none;[^}]*white-space:nowrap;[^}]*overflow:visible;/);
 assert.match(css,/@media\(max-width:660px\)[\s\S]*?\.brand-creator\{[^}]*white-space:nowrap;/);
 assert.doesNotMatch(css,/\.brand-creator\{[^}]*text-overflow:ellipsis;/);
});
