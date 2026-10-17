import {parseDecimal,inRange,calcBmi,bmiClass,gestationalAssessment,childBmiAssessment,bestPef,pefRatio,personalBestZone,predictedPefBrazil} from './calculations.js';
import {BMI_WHO_LMS} from './bmi-who-data.js';
const $ = id=>document.getElementById(id);
const fmt=(x,d=1)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
const fmt0=x=>fmt(x,0);
const INITIAL_IMC=$('imc-result').innerHTML;
const INITIAL_PFE=$('pfe-result').innerHTML;
const num=id=>parseDecimal($(id).value);
const showError=(id,t)=>{const e=$(id);e.textContent=t;e.hidden=!t;};
function detail(k,v){return `<div class="result-detail"><span>${k}</span><strong>${v}</strong></div>`;}
function result(heading,value,unit,pill,level,rows,notice){
  return `<div class="calculated-result"><span class="result-overline">${heading}</span><div class="result-figure"><strong>${value}</strong><span>${unit}</span></div><span class="result-pill pill-${level}">${pill}</span><div class="result-divider"></div><div class="result-details">${rows}</div><p class="result-caveat">${notice}</p></div>`;
}
function profileToggle(){
  const profile=$('imc-profile').value;
  $('child-fields').hidden=profile!=='child';
  $('pregnant-fields').hidden=profile!=='pregnant';
  $('imc-profile-note').innerHTML=profile==='adult' ? '<strong>Adultos (18+).</strong> O IMC é um indicador de triagem e não substitui avaliação clínica.'
    : profile==='child' ? '<strong>0–19 anos completos.</strong> Classificação por idade e sexo. Não compare com limites de adultos; menores de 2 anos exigem comprimento deitado.'
    : '<strong>Gestação única em adultas.</strong> Faixas de ganho TOTAL não indicam se o ganho na semana atual está adequado: utilize as curvas de acompanhamento do Ministério da Saúde.';
  $('weight-label').innerHTML=profile==='pregnant'?'Peso atual <span>kg</span>':'Peso <span>kg</span>';
  showError('imc-error','');
  $('imc-result').innerHTML=INITIAL_IMC;
}
$('imc-profile').addEventListener('change',profileToggle);
$('imc-form').addEventListener('submit',e=>{
  e.preventDefault();showError('imc-error','');
  const profile=$('imc-profile').value,weight=num('weight'),height=num('height-imc');
  const pediatric=profile==='child';
  const minWeight=pediatric?1:20,minHeight=pediatric?40:100;
  if(!inRange(weight,minWeight,350)||!inRange(height,minHeight,230)){
    showError('imc-error',`Informe peso entre ${minWeight} e 350 kg e estatura entre ${minHeight} e 230 cm.`);return;
  }
  try {
    let bmi,category,rows,note,heading='ÍNDICE DE MASSA CORPORAL';
    if(profile==='adult'){
      bmi=calcBmi(weight,height);category=bmiClass(bmi);
      rows=detail('Peso',`${fmt(weight)} kg`)+detail('Estatura',`${fmt(height)} cm`);
      note='Classificação de rastreamento para adultos. Não aplicar na infância ou durante a gestação.';
    }else if(profile==='child'){
      const years=num('child-years'),months=num('child-months'),sex=$('child-sex').value;
      bmi=calcBmi(weight,height);
      const pediatricResult=childBmiAssessment(bmi,years,months,sex,BMI_WHO_LMS);
      category=pediatricResult.category;
      const z=pediatricResult.z;
      const zLabel=z===null?'não definido':z>5?'> +5':z< -5?'< −5':`${z>=0?'+':''}${fmt(z,2)}`;
      rows=detail('Idade',`${years} anos e ${months} meses`)+detail('Escore-z IMC/idade',zLabel)+detail('Referência',pediatricResult.reference);
      note='Pontos de corte OMS/SISVAN por idade e sexo. Medidas extremas e crianças pequenas requerem avaliação profissional; não use o IMC isolado para diagnóstico.';
    }else{
      const assessment=gestationalAssessment(num('pre-weight'),weight,height,num('gest-weeks'));
      bmi=assessment.preBmi;category=assessment.preClass;heading='IMC PRÉ-GESTACIONAL';
      rows=detail('Peso anterior à gestação',`${fmt(num('pre-weight'))} kg`)
        +detail('Ganho registrado até agora',`${fmt(assessment.gainKg)} kg`)
        +detail('Semana gestacional',`${assessment.weeks}ª semana`)
        +detail('Faixa de ganho TOTAL de referência',`${fmt(assessment.totalGainKg[0])} a ${fmt(assessment.totalGainKg[1])} kg`);
      note='Ministério da Saúde (2024), para gestação única em adultas. A faixa informada é para o ganho TOTAL gestacional, NÃO para a semana atual. Verifique as curvas semanais da Caderneta da Gestante no pré-natal.';
    }
    $('imc-result').innerHTML=result(heading,fmt(bmi),'kg/m²',category.label,category.level,rows,note);
  } catch(err){showError('imc-error',err instanceof RangeError?err.message:'Não foi possível obter a referência. Confira as informações.');}
});
$('imc-form').addEventListener('reset',()=>queueMicrotask(()=>{profileToggle();$('imc-result').innerHTML=INITIAL_IMC;}));

$('pfe-form').addEventListener('submit',e=>{
  e.preventDefault();showError('pfe-error','');
  const age=num('age'),height=num('height-pfe'),sex=$('ref-sex').value,device=$('meter-scale').value;
  const readings=[num('effort1'),num('effort2'),num('effort3')];
  const rawPersonal=$('personal-best').value.trim(),personal=rawPersonal?parseDecimal(rawPersonal):null;
  if(!Number.isInteger(age)||!inRange(age,5,100)||!inRange(height,80,220)||!['male','female'].includes(sex)){
    showError('pfe-error','Informe idade inteira de 5 a 100 anos, altura de 80 a 220 cm e referência de sexo.');return;
  }
  if(!readings.every(v=>Number.isInteger(v)&&inRange(v,30,900))){
    showError('pfe-error','Informe três medições válidas, entre 30 e 900 L/min (números inteiros).');return;
  }
  if(personal!==null&&(!Number.isInteger(personal)||!inRange(personal,30,900))){
    showError('pfe-error','O melhor valor pessoal deve ser inteiro, entre 30 e 900 L/min.');return;
  }
  const best=bestPef(readings);
  const ref=predictedPefBrazil(age,height,sex,device);
  const zone=personal===null?null:personalBestZone(pefRatio(best,personal));
  const rows=detail('Três manobras',`${readings.map(fmt0).join(' / ')} L/min`)
    +(ref?detail('Referência regional do estudo',`${fmt0(ref.predicted)} L/min`)+detail('Medido / referência',`${fmt(pefRatio(best,ref.predicted))}%`)+detail('Estudo e equipamento',ref.source)
      :detail('Referência regional','Indisponível para este perfil/aparelho'))
    +(zone?detail('Medido / melhor pessoal',`${fmt(pefRatio(best,personal))}%`)+`<div class="zone-bar" aria-label="Zonas de referência do melhor valor pessoal"><span class="zone-red"></span><span class="zone-yellow"></span><span class="zone-green"></span></div><span class="result-pill pill-${zone.level}">${zone.name} · melhor pessoal</span><p class="zone-explainer">${zone.description}</p>`
      :detail('Comparação com melhor pessoal','Não informado'));
  const note=(ref?'Estimativa de estudo regional brasileiro, não validada como referência nacional; use somente com aparelho e perfil compatíveis.':'Não existe estimativa brasileira compatível selecionada; o site não substitui por equações estrangeiras.')
    +' Valores previstos e zonas pessoais não diagnosticam doenças; considerar sintomas e protocolos profissionais.';
  $('pfe-result').innerHTML=result('MAIOR PFE VÁLIDO',fmt0(best),'L/min','Maior das três tentativas','normal',rows,note);
});
$('pfe-form').addEventListener('reset',()=>{showError('pfe-error','');$('pfe-result').innerHTML=INITIAL_PFE;});
const tabs=[...document.querySelectorAll('[role="tab"]')];
function activateTab(name,focus=false){
  tabs.forEach(tab=>{const active=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;tab.classList.toggle('active',active);if(active&&focus)tab.focus();});
  $('panel-imc').hidden=name!=='imc';$('panel-pfe').hidden=name!=='pfe';
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateTab(tab.dataset.tab));tab.addEventListener('keydown',e=>{const step=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(step){e.preventDefault();activateTab(tabs[(index+step+tabs.length)%tabs.length].dataset.tab,true);}if(e.key==='Home'){e.preventDefault();activateTab(tabs[0].dataset.tab,true);}if(e.key==='End'){e.preventDefault();activateTab(tabs[tabs.length-1].dataset.tab,true);}});});
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.addEventListener('pageshow',()=>{ $('imc-form').reset();$('pfe-form').reset();profileToggle();$('imc-result').innerHTML=INITIAL_IMC;$('pfe-result').innerHTML=INITIAL_PFE;showError('imc-error','');showError('pfe-error','');});