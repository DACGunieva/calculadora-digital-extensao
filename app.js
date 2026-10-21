import {parseDecimal,inRange,calcBmi,bmiClass,gestationalAssessment,childBmiAssessment,olderAdultBmiClass,gestationalWeeklyAssessment,bestPef,pefRatio,personalBestZone,cffPredictedPfe,cffPreviewBand,waistAssessment} from './calculations.js';
import {BMI_WHO_LMS} from './bmi-who-data.js';
const $ = id=>document.getElementById(id);
const fmt=(x,d=1)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(x);
const fmt0=x=>fmt(x,0);
const INITIAL_IMC=$('imc-result').innerHTML;
const INITIAL_PFE=$('pfe-result').innerHTML;
const INITIAL_WAIST=$('waist-result').innerHTML;
const LATEST_SUMMARY={imc:null,pfe:null,waist:null};
const num=id=>parseDecimal($(id).value);
const showError=(id,t)=>{const e=$(id);e.textContent=t;e.hidden=!t;};
function detail(k,v){return `<div class="result-detail"><span>${k}</span><strong>${v}</strong></div>`;}
function result(heading,value,unit,pill,level,rows,notice){
  return `<div class="calculated-result"><span class="result-overline">${heading}</span><div class="result-figure"><strong>${value}</strong><span>${unit}</span></div><span class="result-pill pill-${level}">${pill}</span><div class="result-divider"></div><div class="result-details">${rows}</div><p class="result-caveat">${notice}</p></div>`;
}

function summaryFromResult(kind,title,main,rows,note){
  // Guarda apenas memória temporária; nunca usa localStorage, banco ou cookies.
  const lineRows=rows.replaceAll('</div>','\n').replace(/<[^>]+>/g,' ').replace(/[ \t]+/g,' ').trim();
  LATEST_SUMMARY[kind]=['DACG · Calculadora Digital de Extensão',title,main,lineRows,note,'Registro educativo: não é diagnóstico nem prontuário.'].join('\n');
}
function resultTools(kind){
  return '<div class="result-actions"><button type="button" data-copy-result="'+kind+'">Copiar resumo</button><button type="button" data-new-result="'+kind+'">Novo atendimento</button><p class="result-action-feedback" id="'+kind+'-action-feedback" role="status" aria-live="polite"></p></div>';
}
for(const kind of ['imc','pfe','waist']){
  $(kind+'-result').addEventListener('click',async event=>{
    const button=event.target.closest?.('button[data-copy-result], button[data-new-result]');
    if(!button)return;
    const newMode=button.dataset.newResult;
    if(newMode===kind){
      $(kind+'-form').reset();
      LATEST_SUMMARY[kind]=null;
      queueMicrotask(()=>(kind==='imc' ? $('weight') :kind==='pfe' ? $('effort1') : $('waist-cm')).focus?.());
      return;
    }
    if(button.dataset.copyResult!==kind||!LATEST_SUMMARY[kind])return;
    const feedback=$(kind+'-action-feedback');
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Área de transferência indisponível.');
      await navigator.clipboard.writeText(LATEST_SUMMARY[kind]);
      feedback.textContent='Resumo copiado. Confira antes de compartilhar.';
    }catch(err){
      feedback.textContent='Não foi possível copiar automaticamente neste navegador. O resumo permanece visível na tela.';
    }
  });
}
// Atalho de digitação: Enter avança entre campos de texto visíveis; no último envia.
for(const kind of ['imc','pfe','waist']){
  const form=$(kind+'-form');
  form.addEventListener('keydown',event=>{
    if(event.key!=='Enter'||event.isComposing||event.target?.tagName!=='INPUT'||event.target.type!=='text')return;
    const fields=[...form.querySelectorAll('input,select')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&el.getClientRects().length>0);
    const at=fields.indexOf(event.target);
    if(at===-1)return;
    event.preventDefault();
    if(at<fields.length-1)fields[at+1].focus();
    else form.requestSubmit();
  });
}

function profileToggle(){
  const profile=$('imc-profile').value;
  $('child-fields').hidden=profile!=='child';
  $('pregnant-fields').hidden=profile!=='pregnant';
  $('imc-profile-note').innerHTML=profile==='adult' ? '<strong>Adultos.</strong> O IMC é um indicador de triagem e não substitui avaliação clínica.'
    : profile==='older' ? '<strong>Pessoa idosa (60+).</strong> O SISVAN adota cortes específicos: ≤22 baixo peso, >22 e <27 eutrofia, ≥27 sobrepeso. O IMC não avalia massa muscular nem fragilidade.'
    : profile==='child' ? '<strong>0–19 anos completos.</strong> Classificação por idade e sexo. Não compare com limites de adultos; menores de 2 anos exigem comprimento deitado.'
    : '<strong>Gestação única em adultas.</strong> O ganho acumulado é comparado com a tabela oficial da 10ª à 40ª semana; valores fora desse período exigem avaliação pela equipe do pré-natal.';
  $('weight-label').innerHTML=profile==='pregnant'?'Peso atual <span>kg</span>':'Peso <span>kg</span>';
  showError('imc-error','');
  $('imc-result').innerHTML=INITIAL_IMC;
  LATEST_SUMMARY.imc=null;
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
    }else if(profile==='older'){
      bmi=calcBmi(weight,height);category=olderAdultBmiClass(bmi);
      rows=detail('Perfil','Pessoa idosa (60 anos ou mais)')
        +detail('Peso',fmt(weight)+' kg')
        +detail('Estatura',fmt(height)+' cm')
        +detail('Referência','SISVAN / Ministério da Saúde: IMC ≤22, >22 e <27, ≥27');
      note='Critério do SISVAN para pessoas idosas. O IMC não distingue gordura de massa muscular e não substitui avaliação nutricional, funcional e clínica.';
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
      const weekly=gestationalWeeklyAssessment(assessment.preBmi,assessment.weeks,assessment.gainKg);
      rows=detail('Peso anterior à gestação',`${fmt(num('pre-weight'))} kg`)
        +detail('Ganho acumulado até agora',`${fmt(assessment.gainKg)} kg`)
        +detail('Semana gestacional',`${assessment.weeks}ª semana`);
      if(weekly.available){
        const weeklyLabel=weekly.level==='below'?'Abaixo da faixa de referência':weekly.level==='above'?'Acima da faixa de referência':'Dentro da faixa de referência';
        rows+=detail('Referência de ganho acumulado na semana',`${fmt(weekly.lower)} a ${fmt(weekly.upper)} kg`)
          +detail('Situação na semana',weeklyLabel);
        note='Comparação conforme tabela semanal oficial do Ministério da Saúde (10–40 semanas, Kac et al. 2021), para gestação única em adultas. Valores fora da faixa demandam avaliação individual, não dieta ou intervenção automática.';
      }else{
        rows+=detail('Comparação semanal',weekly.reason);
        note='A tabela semanal do Ministério da Saúde cobre apenas de 10 a 40 semanas; sem classificação fora desse intervalo. O ganho de peso deve ser avaliado pela equipe do pré-natal.';
      }
      rows+=detail('Ganho total de referência até 40 semanas',`${fmt(assessment.totalGainKg[0])} a ${fmt(assessment.totalGainKg[1])} kg`);
    }
    $('imc-result').innerHTML=result(heading,fmt(bmi),'kg/m²',category.label,category.level,rows,note)+resultTools('imc');
    summaryFromResult('imc','Perfil: '+profile+' · '+heading,'IMC: '+fmt(bmi)+' kg/m² · '+category.label,rows,note);
  } catch(err){showError('imc-error',err instanceof RangeError?err.message:'Não foi possível obter a referência. Confira as informações.');}
});
$('imc-form').addEventListener('reset',()=>queueMicrotask(()=>{
  profileToggle();$('imc-result').innerHTML=INITIAL_IMC;LATEST_SUMMARY.imc=null;
}));

// Cintura: avaliação local, sem compartilhamento ou armazenamento.
const WAIST_LEVEL={below:['Abaixo do ponto de corte de risco aumentado','normal'],increased:['Risco aumentado · cintura','over'],high:['Risco substancialmente aumentado · cintura','obese']};
const RATIO_LEVEL={belowRange:'Abaixo de 0,40 · fora do intervalo inferior descrito pela NICE',below:'0,40 a menos de 0,50 · sem adiposidade central aumentada pela RCE',increased:'0,50 a menos de 0,60 · adiposidade central aumentada',high:'≥0,60 · adiposidade central elevada'};
$('waist-form').addEventListener('submit',e=>{
 e.preventDefault();showError('waist-error','');
 try{
  const a=waistAssessment(num('waist-cm'),num('waist-height'),num('waist-age'),$('waist-sex').value,$('waist-pregnant').checked);
  const [classification,level]=WAIST_LEVEL[a.waistLevel];
  const rows=detail('Estatura',fmt(a.heightCm)+' cm')
    +detail('Idade',a.age+' anos')
    +detail('Referência populacional',a.sex==='female'?'Feminina':'Masculina')
    +detail('Risco aumentado a partir de',fmt0(a.increasedCutoff)+' cm')
    +detail('Risco substancialmente aumentado a partir de',fmt0(a.highCutoff)+' cm')
    +detail('Relação cintura/estatura (RCE)',fmt(a.ratio,2))
    +detail('Interpretação da RCE',RATIO_LEVEL[a.ratioLevel]);
  const note='Triagem em adultos não gestantes: Ministério da Saúde (cintura) e NICE NG246 (RCE). Pontos de corte por sexo variam com a população; classificação de RCE particularmente recomendada quando IMC inferior a 35 kg/m². Medidas isoladas não são diagnósticas nem excluem outros riscos cardiometabólicos.';
  $('waist-result').innerHTML=result('CIRCUNFERÊNCIA DA CINTURA',fmt(a.waistCm),'cm',classification,level,rows,note)+resultTools('waist');
  summaryFromResult('waist','Circunferência da cintura · avaliação de adulto','Cintura: '+fmt(a.waistCm)+' cm · '+classification,rows,note);
 }catch(err){showError('waist-error',err instanceof RangeError?err.message:'Não foi possível avaliar a cintura. Confira os dados.');}
});
$('waist-form').addEventListener('reset',()=>queueMicrotask(()=>{showError('waist-error','');LATEST_SUMMARY.waist=null;$('waist-result').innerHTML=INITIAL_WAIST;}));

// As zonas baseiam-se exclusivamente no MELHOR PFE PESSOAL previamente estabelecido.
// Sem essa referência, a faixa é uma legenda, sem atribuição clínica.
let latestPfeBest=null;
function pefZonesMarkup(best,reference){
  const pct=reference?pefRatio(best,reference.predicted):null;
  const band=reference?cffPreviewBand(pct):null;
  const label=reference
    ?band.label+' — '+fmt(pct)+'% do previsto CFF ('+fmt0(reference.predicted)+' L/min).'
    :'Referência indisponível: faixa sem classificação automática.';
  const marker=reference?'style="left:'+Math.max(0,Math.min(100,pct))+'%"':'hidden';
  return `<section class="pfe-zones" aria-label="Faixa comparativa do PFE entre 0 e 100%">
    <h4 id="pfe-zone-heading">Comparação com a tabela de referência (0–100%)</h4>
    <div class="pfe-zone-status ${band?'pfe-zone-status-'+band.level:''}" id="pfe-zone-status" role="status">${label}</div>
    <div class="pfe-zone-bar" role="img" aria-label="Escala educativa de 0 a 100% do previsto. Vermelho abaixo de 50%; amarelo 50% a menos de 80%; verde a partir de 80%.">
      <span class="pfe-zone-segment pfe-zone-segment-red"></span>
      <span class="pfe-zone-segment pfe-zone-segment-yellow"></span>
      <span class="pfe-zone-segment pfe-zone-segment-green"></span>
      <span class="pfe-zone-marker" id="pfe-zone-marker" ${marker} aria-hidden="true"></span>
    </div>
    <div class="pfe-zone-labels" aria-hidden="true"><span>0%</span><span>50%</span><span>80%</span><span>100%</span></div>
    <div class="pfe-zone-legend">
      <span><i class="pfe-key pfe-key-red" aria-hidden="true"></i>Vermelho · abaixo de 50%</span>
      <span><i class="pfe-key pfe-key-yellow" aria-hidden="true"></i>Amarelo · alerta (50–&lt;80%)</span>
      <span><i class="pfe-key pfe-key-green" aria-hidden="true"></i>Verde · a partir de 80%</span>
    </div>
    <p class="pfe-zone-caution"><strong>Atenção:</strong> as tabelas do CFF não têm equivalência confirmada com a calibração ATS do Medicate. As cores mostram faixas DIDÁTICAS do percentual previsto, não diagnóstico, nem risco de crise. ${pct>100?'O percentual pode ultrapassar 100%, mas a barra termina em 100%.':''}</p>
    <details class="pfe-zone-comparison">
      <summary>Comparar com meu melhor PFE pessoal (plano de asma)</summary>
      <p>As zonas clínicas de asma usam o melhor PFE pessoal estabelecido com acompanhamento profissional — <strong>não</strong> o valor previsto da tabela. Informe o seu melhor PFE pessoal, se conhecido.</p>
      <form id="pfe-zone-form" novalidate>
        <label for="pfe-zone-input">Melhor PFE pessoal conhecido (L/min)</label>
        <div class="pfe-zone-form-row">
          <input id="pfe-zone-input" type="text" inputmode="numeric" autocomplete="off" placeholder="Ex.: 600" aria-describedby="pfe-zone-form-hint">
          <button type="submit">Comparar</button>
        </div>
        <small id="pfe-zone-form-hint">Opcional, dentro do plano individual. Os dados não são armazenados.</small>
      </form>
      <p class="pfe-zone-error" id="pfe-zone-error" role="alert" hidden></p>
    </details>
    <p class="pfe-zone-caution">Sintomas respiratórios intensos exigem avaliação imediata independentemente de faixa verde, amarela ou vermelha.</p>
  </section>`;
}
$('pfe-result').addEventListener('submit',e=>{
  if(e.target?.id!=='pfe-zone-form')return;
  e.preventDefault();
  const field=$('pfe-zone-input'),error=$('pfe-zone-error');
  error.hidden=true;
  error.textContent='';
  if(latestPfeBest===null)return;
  const personal=parseDecimal(field.value);
  if(!Number.isInteger(personal)||!inRange(personal,60,900)){
    error.textContent='Informe um melhor PFE pessoal válido entre 60 e 900 L/min.';
    error.hidden=false;
    return;
  }
  const pct=pefRatio(latestPfeBest,personal);
  const zone=personalBestZone(pct);
  const status=$('pfe-zone-status'),pointer=$('pfe-zone-marker');
  const shortZone=zone.level==='danger'?'ZONA PESSOAL VERMELHA · perigo no plano de asma'
    :zone.level==='warning'?'ZONA PESSOAL AMARELA · atenção':'ZONA PESSOAL VERDE · acompanhamento';
  status.textContent=shortZone+' — '+fmt(pct)+'% do melhor PFE pessoal ('+fmt0(personal)+' L/min).';
  status.className='pfe-zone-status pfe-zone-status-'+zone.level;
  $('pfe-zone-heading').textContent='Zona de acompanhamento pessoal (plano de asma)';
  pointer.hidden=false;
  pointer.style.left=Math.min(99,Math.max(1,pct))+'%';
  if(pct>100){
    status.textContent+=' O valor atual supera a referência; confirme se ela permanece atual.';
  }
});
$('pfe-form').addEventListener('submit',e=>{
  e.preventDefault();
  latestPfeBest=null;
  showError('pfe-error','');
  // O maior PFE não depende de dados demográficos ou referência normativa.
  const readings=[num('effort1'),num('effort2'),num('effort3')];
  try {
    const best=bestPef(readings);
    latestPfeBest=best;
    const age=num('age'),heightCm=num('height-pfe'),sex=$('ref-sex').value;
    const reference=cffPredictedPfe(age,heightCm,sex);
    let rows=detail('1ª tentativa',fmt0(readings[0])+' L/min')
      +detail('2ª tentativa',fmt0(readings[1])+' L/min')
      +detail('3ª tentativa',fmt0(readings[2])+' L/min')
      +detail('Aparelho','Medicate · ATS · 60–900 L/min');
    if(reference){
      rows+=detail('Valor previsto · tabela CFF',fmt0(reference.predicted)+' L/min')
        +detail('Percentual do previsto',fmt(pefRatio(best,reference.predicted))+'%')
        +detail('Entrada usada da tabela',reference.group+' · '+(reference.ageUsed===null?'':'idade '+reference.ageUsed+' anos · ')+'altura '+reference.heightUsed+' cm');
    }else{
      rows+=detail('Referência da tabela','Indisponível ou fora da faixa coberta. O maior PFE continua válido.');
    }
    const note='Comparação educativa segundo CFF (2020). A equivalência dessas tabelas com a calibração do aparelho Medicate ATS não foi estabelecida. Percentual previsto não representa zonas clínicas da asma. Considere sintomas e acompanhamento profissional.';
    $('pfe-result').innerHTML=result('MAIOR PFE VÁLIDO',fmt0(best),'L/min','Maior das três tentativas','normal',rows,note)+pefZonesMarkup(best,reference)+resultTools('pfe');
    summaryFromResult('pfe','Pico de fluxo expiratório','Maior PFE: '+fmt0(best)+' L/min',rows,note);
    $('pfe-result').scrollIntoView?.({behavior:'smooth',block:'nearest'});
  }catch(error){
    showError('pfe-error',error instanceof RangeError
      ?'Informe as três leituras em números inteiros de 60 a 900 L/min. Confira cada tentativa.'
      :'Não foi possível calcular o PFE. Atualize a página e tente novamente.');
  }
});
$('pfe-form').addEventListener('reset',()=>queueMicrotask(()=>{
  latestPfeBest=null;
  LATEST_SUMMARY.pfe=null;
  showError('pfe-error','');
  $('pfe-result').innerHTML=INITIAL_PFE;
}));
const tabs=[...document.querySelectorAll('[role="tab"]')];
function activateTab(name,focus=false){
  tabs.forEach(tab=>{const active=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;tab.classList.toggle('active',active);if(active&&focus)tab.focus();});
  $('panel-imc').hidden=name!=='imc';$('panel-pfe').hidden=name!=='pfe';$('panel-waist').hidden=name!=='waist';
  if(name==='waist'&&!$('waist-height').value&&['adult','older'].includes($('imc-profile').value)){
    const fromImc=num('height-imc');if(inRange(fromImc,100,230))$('waist-height').value=String(fromImc).replace('.',',');
  }
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateTab(tab.dataset.tab));tab.addEventListener('keydown',e=>{const step=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(step){e.preventDefault();activateTab(tabs[(index+step+tabs.length)%tabs.length].dataset.tab,true);}if(e.key==='Home'){e.preventDefault();activateTab(tabs[0].dataset.tab,true);}if(e.key==='End'){e.preventDefault();activateTab(tabs[tabs.length-1].dataset.tab,true);}});});
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.addEventListener('pageshow',()=>{ $('imc-form').reset();$('pfe-form').reset();$('waist-form').reset();profileToggle();$('imc-result').innerHTML=INITIAL_IMC;$('pfe-result').innerHTML=INITIAL_PFE;$('waist-result').innerHTML=INITIAL_WAIST;LATEST_SUMMARY.waist=null;showError('imc-error','');showError('pfe-error','');showError('waist-error','');});