import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BMI_WHO_LMS} from '../bmi-who-data.js';
import {childBmiAssessment} from '../calculations.js';
test('OMS tem série completa mês a mês de 0 a 228',()=>{
 assert.equal(BMI_WHO_LMS.length,229);
 for(let i=0;i<229;i++){
   const r=BMI_WHO_LMS[i];assert.equal(r[0],i);
   assert.equal(r.length,7);
   assert.ok(r.slice(1).every(Number.isFinite));
 }
});
test('referências OMS conferem nos pontos 0, 60, 61 e 228 meses',()=>{
 assert.equal(BMI_WHO_LMS[0][2],13.4069);
 assert.equal(BMI_WHO_LMS[60][5],15.2747);
 assert.equal(BMI_WHO_LMS[61][2],15.2641);
 assert.equal(BMI_WHO_LMS[228][5],21.4269);
});
test('classifica exatamente na mediana dos dois padrões OMS',()=>{
 const boy=childBmiAssessment(15.2641,5,1,'male',BMI_WHO_LMS);
 assert.ok(Math.abs(boy.z)<1e-9);
 assert.equal(boy.reference,'OMS 2007');
 const girl=childBmiAssessment(15.2747,5,0,'female',BMI_WHO_LMS);
 assert.ok(Math.abs(girl.z)<1e-9);
 assert.equal(girl.reference,'OMS 2006');
});