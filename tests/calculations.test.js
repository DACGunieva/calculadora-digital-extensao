import { test } from 'node:test';
import assert from 'node:assert/strict';
import {parseDecimal,calcBmi,bmiClass,gestationalAssessment,childBmiAssessment,bestPef,pefRatio,personalBestZone,predictedPefBrazil,waistAssessment} from '../calculations.js';
const WHO_EXAMPLE = Array.from({length:229},(_,month)=>[month,-0.5,15,0.09,-0.5,15,0.09]);
test('decimais pt-BR e validação',()=>{
 assert.equal(parseDecimal(' 68,5 '),68.5);
 assert.equal(parseDecimal('68.5'),68.5);
 assert.ok(Number.isNaN(parseDecimal('68,5abc')));
 assert.ok(Number.isNaN(parseDecimal('')));
});
test('IMC adultos: cálculo e fronteiras',()=>{
 assert.ok(Math.abs(calcBmi(66,160)-25.78125)<1e-10);
 assert.equal(bmiClass(18.499).label,'Baixo peso');
 assert.equal(bmiClass(18.5).label,'Eutrofia');
 assert.equal(bmiClass(25).label,'Sobrepeso');
 assert.equal(bmiClass(30).label,'Obesidade grau I');
 assert.equal(bmiClass(40).label,'Obesidade grau III');
});
test('gestante utiliza peso pré-gestacional; total NÃO é semanal',()=>{
 const x=gestationalAssessment(60,67,165,22);
 assert.equal(x.gainKg,7);
 assert.deepEqual(x.totalGainKg,[8,12]);
 assert.equal(x.preClass.label,'Eutrofia');
 assert.deepEqual(gestationalAssessment(48,52,165,20).totalGainKg,[9.7,12.2]);
 assert.deepEqual(gestationalAssessment(80,84,165,20).totalGainKg,[7,9]);
 assert.deepEqual(gestationalAssessment(100,104,165,20).totalGainKg,[5,7.2]);
 assert.throws(()=>gestationalAssessment(60,67,165,0),RangeError);
});
test('criança OMS: extremos e regras diferentes aos 5 anos',()=>{
 const median=15;
 assert.equal(childBmiAssessment(median,3,0,'female',WHO_EXAMPLE).category.label,'Eutrofia');
 const one=15*Math.pow(1-0.5*0.09*1,(-2));
 const two=15*Math.pow(1-0.5*0.09*2,(-2));
 const three=15*Math.pow(1-0.5*0.09*3,(-2));
 assert.equal(childBmiAssessment((one+two)/2,4,10,'female',WHO_EXAMPLE).category.label,'Risco de sobrepeso');
 assert.equal(childBmiAssessment((one+two)/2,5,1,'female',WHO_EXAMPLE).category.label,'Sobrepeso');
 assert.equal(childBmiAssessment((two+three)/2,4,10,'male',WHO_EXAMPLE).category.label,'Sobrepeso');
 assert.equal(childBmiAssessment((two+three)/2,5,1,'male',WHO_EXAMPLE).category.label,'Obesidade');
 assert.throws(()=>childBmiAssessment(17,19,1,'female',WHO_EXAMPLE),RangeError);
 assert.throws(()=>childBmiAssessment(17,9,0,'other',WHO_EXAMPLE),RangeError);
});
test('PFE: maior valor, zonas apenas pelo melhor pessoal',()=>{
 assert.equal(bestPef([440,500,460]),500);
 assert.equal(pefRatio(400,500),80);
 assert.equal(personalBestZone(79.9).level,'warning');
 assert.equal(personalBestZone(80).level,'normal');
 assert.equal(personalBestZone(49.9).level,'danger');
 assert.throws(()=>bestPef([440,500]),RangeError);
 assert.throws(()=>bestPef([59,120,180]),RangeError);
 assert.equal(bestPef([60,120,900]),900);
});
test('referência brasileira Wright: tabelas do artigo',()=>{
 assert.ok(Math.abs(predictedPefBrazil(12,120,'female','wright').predicted-194.79)<1e-8);
 assert.ok(Math.abs(predictedPefBrazil(18,200,'male','wright').predicted-593.87)<1e-8);
 assert.ok(Math.abs(predictedPefBrazil(15,155,'female','wright').predicted-287.085)<1e-8);
 assert.equal(predictedPefBrazil(10,140,'male','wright'),null);
 assert.equal(predictedPefBrazil(15,160,'male','assess'),null);
});
test('ASSESS homens 50-80 e indisponibilidade explícita para demais',()=>{
 const expected=-140.438-2.351*60+409.689*1.75;
 assert.equal(predictedPefBrazil(60,175,'male','assess').predicted,expected);
 assert.equal(predictedPefBrazil(60,175,'female','assess'),null);
 assert.equal(predictedPefBrazil(30,175,'male','assess'),null);
 assert.equal(predictedPefBrazil(35,170,'female','unknown'),null);
});
test('limites físicos e formais',()=>{
 assert.throws(()=>calcBmi(0,180),RangeError);
 assert.throws(()=>calcBmi(60,0),RangeError);
 assert.throws(()=>bmiClass(NaN),RangeError);
 assert.throws(()=>predictedPefBrazil(4,150,'female','wright'),RangeError);
});
test('IMC da pessoa idosa utiliza pontos de corte do SISVAN (<=22, <27, >=27)',async()=>{
 const {olderAdultBmiClass}=await import('../calculations.js');
 assert.equal(olderAdultBmiClass(21.99).label,'Baixo peso');
 assert.equal(olderAdultBmiClass(22).label,'Baixo peso');
 assert.equal(olderAdultBmiClass(22.001).label,'Eutrofia');
 assert.equal(olderAdultBmiClass(26.999).label,'Eutrofia');
 assert.equal(olderAdultBmiClass(27).label,'Sobrepeso');
 assert.throws(()=>olderAdultBmiClass(NaN),RangeError);
});
test('ganho gestacional semanal: 31 semanas e limites oficiais 10, 13, 27 e 40',async()=>{
 const {GESTATIONAL_WEEKLY_GAIN,gestationalWeeklyAssessment}=await import('../calculations.js');
 assert.equal(GESTATIONAL_WEEKLY_GAIN.length,31);
 assert.ok(GESTATIONAL_WEEKLY_GAIN.every((row,i)=>row.length===9&&row[0]===i+10));
 for(const [week,bounds] of [
  [10,[-0.7,0.3,-2.4,0,-2.3,-1.3,-1.8,-0.8]],
  [13,[0.2,1.2,-1.8,0.7,-1.6,-0.5,-1.7,-0.5]],
  [27,[5.6,7.2,3.1,6.3,2.3,3.7,1.1,2.7]],
  [40,[9.7,12.2,8,12,7,9,5,7.2]]
 ])assert.deepEqual(GESTATIONAL_WEEKLY_GAIN[week-10].slice(1),bounds);
 assert.deepEqual([gestationalWeeklyAssessment(17,40,10).lower,gestationalWeeklyAssessment(17,40,10).upper],[9.7,12.2]);
 assert.equal(gestationalWeeklyAssessment(22,20,2).level,'within');
 assert.equal(gestationalWeeklyAssessment(22,20,-1).level,'below');
 assert.equal(gestationalWeeklyAssessment(22,20,4).level,'above');
 assert.equal(gestationalWeeklyAssessment(22,10,-2.4).level,'within');
 assert.equal(gestationalWeeklyAssessment(22,10,0).level,'within');
 assert.equal(gestationalWeeklyAssessment(22,9,0).available,false);
 assert.equal(gestationalWeeklyAssessment(22,41,11).available,false);
 assert.throws(()=>gestationalWeeklyAssessment(23,43,0),RangeError);
});

test('cintura feminina: limites 80 / 88 inclusivos e RCE',()=>{
 assert.equal(waistAssessment(79.9,165,25,'female').waistLevel,'below');
 assert.equal(waistAssessment(80,165,25,'female').waistLevel,'increased');
 assert.equal(waistAssessment(87.9,165,25,'female').waistLevel,'increased');
 const a=waistAssessment(88,165,25,'female');
 assert.equal(a.waistLevel,'high');assert.ok(Math.abs(a.ratio-88/165)<1e-12);
});
test('cintura masculina: limites 94 / 102 inclusivos',()=>{
 for(const [waist,level] of [[93.9,'below'],[94,'increased'],[101.9,'increased'],[102,'high']])
  assert.equal(waistAssessment(waist,170,40,'male').waistLevel,level);
});
test('RCE: fronteiras 0,40, 0,50, 0,60 e abaixo do intervalo NICE',()=>{
 for(const [waist,level] of [[60,'belowRange'],[72,'below'],[90,'increased'],[108,'high']])
  assert.equal(waistAssessment(waist,180,18,'male').ratioLevel,level);
});
test('cintura rejeita pediatria, gestação e dados inválidos',()=>{
 assert.throws(()=>waistAssessment(80,160,17,'female'),RangeError);
 assert.throws(()=>waistAssessment(80,160,27,'female',true),RangeError);
 assert.throws(()=>waistAssessment(80,160,27,'other'),RangeError);
 assert.throws(()=>waistAssessment(NaN,160,27,'female'),RangeError);
 assert.throws(()=>waistAssessment(80,0,27,'female'),RangeError);
 assert.throws(()=>waistAssessment(80,160,27.5,'female'),RangeError);
});
