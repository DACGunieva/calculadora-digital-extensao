import { test } from 'node:test';
import assert from 'node:assert/strict';
import {parseDecimal,calcBmi,bmiClass,gestationalAssessment,childBmiAssessment,bestPef,pefRatio,personalBestZone,predictedPefBrazil} from '../calculations.js';
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