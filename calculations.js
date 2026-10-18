/** Cálculos locais. Interpretação educacional; não diagnóstica. */
export function parseDecimal(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : NaN;
  const s = String(input ?? '').trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
export const inRange = (n, low, high) => Number.isFinite(n) && n >= low && n <= high;
export function calcBmi(weightKg, heightCm) {
  if (!inRange(weightKg, 1, 350) || !inRange(heightCm, 40, 230)) throw new RangeError('Peso ou estatura fora da faixa informada.');
  return weightKg / (heightCm / 100) ** 2;
}
export function bmiClass(bmi) {
  if (!Number.isFinite(bmi) || bmi <= 0) throw new RangeError('IMC inválido.');
  if (bmi < 18.5) return {label:'Baixo peso',level:'under'};
  if (bmi < 25) return {label:'Eutrofia',level:'normal'};
  if (bmi < 30) return {label:'Sobrepeso',level:'over'};
  if (bmi < 35) return {label:'Obesidade grau I',level:'obese'};
  if (bmi < 40) return {label:'Obesidade grau II',level:'obese'};
  return {label:'Obesidade grau III',level:'obese'};
}

/** Gestantes adultas, gestação única: Ministério da Saúde, cartaz 2024.
 * Faixas são ganho TOTAL aproximado até o fim da gestação, não meta semanal.
 */
export function gestationalAssessment(preWeight, currentWeight, heightCm, weeks) {
  if (!inRange(preWeight, 25, 300) || !inRange(currentWeight, 25, 350) || !inRange(heightCm, 120, 220)
      || !Number.isInteger(weeks) || !inRange(weeks, 1, 42)) throw new RangeError('Verifique pesos, altura e semanas de gestação.');
  const preBmi = calcBmi(preWeight, heightCm);
  const preClass = bmiClass(preBmi);
  const totalGainKg = preBmi < 18.5 ? [9.7, 12.2] : preBmi < 25 ? [8.0, 12.0] : preBmi < 30 ? [7.0, 9.0] : [5.0, 7.2];
  return {preBmi, preClass, weeks, gainKg:currentWeight-preWeight, totalGainKg};
}

/** OMS 2006 (0–60 meses), OMS 2007 (61–228); LMS tabela local indexada por mês.
 * Retorna comparação pelos pontos de corte transformados, evitando classificação incorreta
 * em valores extremos em que a transformação Box-Cox pode ficar indefinida.
 */
export function childBmiAssessment(bmi, years, extraMonths, sex, whoLms) {
  if (!Number.isFinite(bmi) || bmi <= 0 || !Number.isInteger(years) || !inRange(years, 0, 19)
      || !Number.isInteger(extraMonths) || !inRange(extraMonths, 0, 11) || !['male','female'].includes(sex)) {
    throw new RangeError('Dados pediátricos inválidos.');
  }
  const months=years*12+extraMonths;
  if (months>228) throw new RangeError('Curvas OMS disponíveis até 19 anos completos (228 meses).');
  const rec=whoLms?.[months];
  if (!Array.isArray(rec) || rec[0]!==months) throw new Error('Parâmetros OMS indisponíveis para esta idade.');
  const [L,M,S] = sex==='male' ? rec.slice(1,4) : rec.slice(4,7);
  if (![L,M,S].every(Number.isFinite) || !(M>0&&S>0)) throw new Error('Dados LMS inválidos.');
  const cutoff=(z)=>Math.abs(L)<1e-8 ? M*Math.exp(S*z) : M * Math.pow(1+L*S*z,1/L);
  const rawZ=Math.abs(L)<1e-8 ? Math.log(bmi/M)/S : (Math.pow(bmi/M,L)-1)/(L*S);
  const z=Number.isFinite(rawZ) ? rawZ : null;
  const young=months<=60;
  let category;
  if (bmi<cutoff(-3)) category={label:'Magreza acentuada',level:'under'};
  else if (bmi<cutoff(-2)) category={label:'Magreza',level:'under'};
  else if (bmi<=cutoff(1)) category={label:'Eutrofia',level:'normal'};
  else if (young && bmi<=cutoff(2)) category={label:'Risco de sobrepeso',level:'over'};
  else if (young && bmi<=cutoff(3)) category={label:'Sobrepeso',level:'over'};
  else if (young) category={label:'Obesidade',level:'obese'};
  else if (bmi<=cutoff(2)) category={label:'Sobrepeso',level:'over'};
  else if (bmi<=cutoff(3)) category={label:'Obesidade',level:'obese'};
  else category={label:'Obesidade grave',level:'obese'};
  return {months,reference:young?'OMS 2006':'OMS 2007',z,median:M,category,limits:[-3,-2,1,2,3].map(cutoff)};
}

export function bestPef(readings) {
  if (!Array.isArray(readings) || readings.length!==3 || !readings.every(v=>Number.isInteger(v)&&inRange(v,60,900))) {
    throw new RangeError('Informe três leituras Medicate ATS válidas entre 60 e 900 L/min.');
  }
  return Math.max(...readings);
}
export function pefRatio(measured,ref) {
  if (!inRange(measured,1,900) || !inRange(ref,1,1000)) throw new RangeError('Referência de PFE inválida.');
  return 100*measured/ref;
}
export function personalBestZone(percent) {
  if (!inRange(percent,0,1000)) throw new RangeError('Percentual inválido.');
  if (percent<50) return {name:'Zona vermelha',level:'danger',description:'Se houver plano de ação para asma, siga as orientações individuais para este patamar e procure atendimento urgente, conforme sintomas.'};
  if (percent<80) return {name:'Zona amarela',level:'warning',description:'Siga o plano individual e solicite orientação clínica; o valor não substitui avaliação dos sintomas.'};
  return {name:'Zona verde',level:'normal',description:'Considere também os sintomas e o plano individual de acompanhamento.'};
}

/** Boaventura et al., Arq Med ABC 2007;32(Supl2):S30–34, tabelas por idade e altura,
 * escolares 12–18 anos de Minas Gerais, medidor Wright (Healthscan).
 * Preferimos a interpolação nas tabelas à regressão no artigo porque há divergências entre elas.
 */
const PFE_STUDENT_MALE = [
 [203.46,221.83,241.86,263.69,287.50,313.46,341.46,372.61,406.25],
 [216.75,236.32,257.66,280.92,306.28,333.93,364.08,396.95,432.79],
 [230.91,251.76,274.49,299.27,326.29,355.75,387.86,422.88,461.06],
 [245.99,268.20,292.42,318.82,347.60,378.99,413.20,450.51,491.18],
 [262.06,285.72,311.52,339.65,370.31,403.74,440.20,479.94,523.27],
 [279.18,304.39,331.87,361.83,394.50,430.12,468.95,511.29,557.45],
 [297.42,324.27,353.55,385.47,420.27,458.22,499.58,544.69,593.87]
];
const PFE_STUDENT_FEMALE = [
 [194.79,216.08,237.36,258.64,279.92,301.20,322.48,343.77,365.05],
 [200.73,222.01,243.29,264.57,285.86,307.14,328.42,349.70,370.98],
 [206.66,227.95,249.23,270.51,291.79,313.07,334.35,355.64,376.92],
 [212.60,233.88,255.16,276.44,297.73,319.01,340.29,361.57,382.85],
 [218.53,239.82,261.10,282.38,303.66,324.94,346.22,367.51,388.79],
 [224.47,245.75,267.03,288.31,309.60,330.88,352.16,373.44,394.72],
 [230.40,251.69,272.97,294.25,315.53,336.81,358.09,379.38,400.66]
];
function lerp(a,b,t){return a+(b-a)*t;}
export function predictedPefBrazil(age, heightCm, sex, device) {
  if (!Number.isInteger(age) || !inRange(age,5,100) || !inRange(heightCm,80,220)
      || !['male','female'].includes(sex)) throw new RangeError('Idade, altura ou sexo inválidos.');
  if (device==='wright' && inRange(age,12,18) && inRange(heightCm,120,200)) {
    const values=(sex==='male'?PFE_STUDENT_MALE:PFE_STUDENT_FEMALE)[age-12];
    const idx=Math.min(7,Math.floor((heightCm-120)/10));
    const estimated=lerp(values[idx],values[idx+1],(heightCm-(120+idx*10))/10);
    return {predicted:estimated,source:'Boaventura et al. (2007), escolares de MG, medidor Wright',kind:'regional'};
  }
  if (device==='assess' && sex==='male' && inRange(age,50,80) && inRange(heightCm,150,190)) {
    // Teymeny et al., Fisioterapia Brasil 2008;9(6): Eq altura em METROS.
    return {predicted:-140.438-2.351*age+409.689*(heightCm/100),source:'Teymeny et al. (2008), homens de 50–80 anos, aparelho ASSESS',kind:'regional'};
  }
  return null;
}