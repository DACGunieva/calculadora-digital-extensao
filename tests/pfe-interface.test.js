import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
test('PFE simplificado sem referências obrigatórias',()=>{
  assert.doesNotMatch(html,/id="table-reference"|id="personal-best"/);
  assert.doesNotMatch(app,/'table-reference'|'personal-best'/);
  assert.match(sw,/fetch\(event\.request\)/);
});
test('clicar em calcular usa somente as três manobras',async()=>{
  const els=new Map();
  function element(id){
    if(id==='table-reference'||id==='personal-best')return null;
    if(!els.has(id)){
      const callbacks=new Map();
      els.set(id,{value:'',innerHTML:'',textContent:'',hidden:false,
        addEventListener(name,fn){callbacks.set(name,fn)},
        dispatch(name){assert.ok(callbacks.has(name));callbacks.get(name)({preventDefault(){}})},
        reset(){},scrollIntoView(){}
      });
    }
    return els.get(id);
  }
  globalThis.document={getElementById:element,querySelectorAll:()=>[]};
  globalThis.window={addEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});
  element('age').value='';
  element('height-pfe').value='';
  element('ref-sex').value='';
  element('effort1').value='420';
  element('effort2').value='530';
  element('effort3').value='490';
  await import('../app.js');
  element('pfe-form').dispatch('submit');
  assert.match(element('pfe-result').innerHTML,/MAIOR PFE VÁLIDO/);
  assert.match(element('pfe-result').innerHTML,/530/);
  assert.equal(element('pfe-error').hidden,true);
  element('effort2').value='59';
  element('pfe-form').dispatch('submit');
  assert.match(element('pfe-error').textContent,/60 a 900/);
  assert.equal(element('pfe-error').hidden,false);
});

test('faixa de três cores depende de melhor PFE pessoal estabelecido',async()=>{
  const {pefRatio,personalBestZone}=await import('../calculations.js');
  assert.equal(personalBestZone(pefRatio(490,700)).level,'warning');
  assert.equal(personalBestZone(pefRatio(490,1000)).level,'danger');
  assert.equal(personalBestZone(pefRatio(560,700)).level,'normal');
  assert.match(app,/latestPfeBest=null/);
  assert.match(app,/pfe-zone-status/);
  assert.match(app,/pfe-zone-marker/);
  assert.match(app,/pfe-zone-form/);
  assert.match(app,/Vermelho · ruim/);
  assert.match(app,/Verde · bom/);
});
