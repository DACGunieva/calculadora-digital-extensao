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

/** Cintura em adultos não gestantes — Ministério da Saúde (quadro 12); RCE NICE NG246 §1.9.14. */
export function waistAssessment(waistCm,heightCm,age,sex,isPregnant=false){
 if(!inRange(waistCm,30,250)||!inRange(heightCm,100,230)||!Number.isInteger(age)||!inRange(age,18,120)||!['female','male'].includes(sex)||typeof isPregnant!=='boolean')
   throw new RangeError('Informe cintura (30–250 cm), estatura (100–230 cm), idade adulta e referência de pontos de corte válidas.');
 if(isPregnant)throw new RangeError('Os pontos de corte para adultos não gestantes não se aplicam durante a gravidez. Consulte a equipe do pré-natal.');
 const [increasedCutoff,highCutoff]=sex==='female'?[80,88]:[94,102];
 const waistLevel=waistCm>=highCutoff?'high':waistCm>=increasedCutoff?'increased':'below';
 const ratio=waistCm/heightCm;
 const ratioLevel=ratio<0.4?'belowRange':ratio<0.5?'below':ratio<0.6?'increased':'high';
 return {waistCm,heightCm,age,sex,ratio,increasedCutoff,highCutoff,waistLevel,ratioLevel};
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

/**
 * Conselho Federal de Farmácia (2020), Pico de Fluxo Expiratório, Tabelas 1–3,
 * páginas 11–12: pediatria Polgar/Promadhat (1971), adultos Leiner (1963).
 * Estimativas de valor previsto para comparação EDUCATIVA. NÃO validadas 
 * especificamente para a calibração/escala ATS do Medicate.
 * Escolhe entradas MAIS PRÓXIMAS, como no texto do CFF, sem extrapolar.
 */
const PEDIATRIC=[[110,147],[112,160],[114,173],[117,187],[119,200],[122,214],[124,227],[127,240],[130,254],[132,267],[135,280],[137,293],[140,307],[142,320],[145,334],[147,347],[150,360],[152,373],[155,387],[157,400],[160,413],[163,427],[165,440],[168,454],[170,467]];
const AGES=[20,25,30,35,40,45,50,55,60,65,70];
const ADULT={
 male:{
  heights:[155,160,165,170,175,180],
  vals:[
   [564,583,601,620,639,657],
   [553,571,589,608,626,644],
   [541,559,577,594,612,630],
   [530,547,565,582,599,617],
   [518,535,552,569,586,null],
   [507,523,540,557,573,590],
   [494,511,527,543,560,576],
   [483,499,515,531,547,563],
   [471,486,502,518,533,549],
   [460,475,490,505,520,536],
   [448,462,477,492,507,521]
  ]
 },
 female:{
  heights:[145,150,155,160,165,170],
  vals:[
   [404,418,431,445,459,473],
   [399,412,426,440,453,467],
   [394,407,421,434,447,461],
   [389,402,415,428,442,455],
   [383,396,409,422,435,448],
   [378,391,404,417,430,442],
   [373,386,398,411,423,436],
   [368,380,393,405,418,430],
   [363,375,387,399,411,424],
   [358,370,382,394,406,418],
   [352,364,376,388,399,411]
  ]
 }
};
// Célula de homens idade 40 / estatura 180 cm impressa como 630,
// inconsistente com a sequência etária (617 na idade 35, 590 na 45).
// Para impedir uma interpretação potencialmente errada, não geramos previsto nela.
const near=(arr,v)=>arr.reduce((a,b)=>Math.abs(v-b)<Math.abs(v-a)?b:a);
export function cffPredictedPfe(age,heightCm,sex){
  if(!Number.isInteger(age)||!Number.isFinite(heightCm))return null;
  if(age>=5&&age<20){
    if(heightCm<110||heightCm>170)return null;
    const match=PEDIATRIC.reduce((a,b)=>Math.abs(b[0]-heightCm)<Math.abs(a[0]-heightCm)?b:a);
    return {predicted:match[1],group:'Infantil/adolescente',heightUsed:match[0],ageUsed:null,scaleVerified:false};
  }
  if(age<20||age>70||!['female','male'].includes(sex))return null;
  const data=ADULT[sex];
  if(heightCm<data.heights[0]||heightCm>data.heights.at(-1))return null;
  const ageUsed=near(AGES,age),heightUsed=near(data.heights,heightCm);
  const predicted=data.vals[AGES.indexOf(ageUsed)][data.heights.indexOf(heightUsed)];
  if(!Number.isFinite(predicted))return null;
  return {predicted,group:'Adulto',ageUsed,heightUsed,scaleVerified:false};
}
export function cffPreviewBand(pct){
  if(!Number.isFinite(pct)||pct<0)return null;
  if(pct<50)return {level:'danger',label:'Vermelho · abaixo da referência'};
  if(pct<80)return {level:'warning',label:'Amarelo · alerta'};
  return {level:'normal',label:'Verde · a partir de 80% do previsto'};
}


/** SISVAN, Guia para a Organização da Vigilância Alimentar e Nutricional,
 * pessoa idosa (60 anos ou mais), quadro de IMC. Limites: <=22; >22 e <27; >=27.
 * Não identifica sarcopenia nem determina estado nutricional isoladamente.
 */
export function olderAdultBmiClass(bmi){
  if(!Number.isFinite(bmi)||bmi<=0)throw new RangeError('IMC inválido.');
  if(bmi<=22)return {label:'Baixo peso',level:'under'};
  if(bmi<27)return {label:'Eutrofia',level:'normal'};
  return {label:'Sobrepeso',level:'over'};
}
/** Fonte: Ministério da Saúde, Guia para a Organização da VAN na APS (2023),
 * anexo p.50 (Kac et al., 2021): ganho cumulativo por SEMANA de 10 a 40,
 * respectivamente [semana, BP inf/sup, eutrofia inf/sup, sobrepeso inf/sup, obesidade inf/sup].
 * Dados transcritos integralmente dos 31 registros do anexo oficial.
 */
export const GESTATIONAL_WEEKLY_GAIN = [[10,-0.7,0.3,-2.4,0,-2.3,-1.3,-1.8,-0.8],[11,-0.4,0.6,-2.2,0.2,-2.1,-1,-1.7,-0.7],[12,-0.1,0.9,-2,0.4,-1.8,-0.8,-1.7,-0.6],[13,0.2,1.2,-1.8,0.7,-1.6,-0.5,-1.7,-0.5],[14,0.5,1.6,-1.6,0.9,-1.4,-0.2,-1.6,-0.4],[15,0.8,1.9,-1.3,1.2,-1.1,0,-1.5,-0.2],[16,1.2,2.3,-1.1,1.5,-0.9,0.3,-1.4,-0.1],[17,1.5,2.7,-0.8,1.8,-0.6,0.6,-1.3,0.1],[18,1.9,3.1,-0.4,2.2,-0.3,0.9,-1.2,0.3],[19,2.3,3.6,0,2.7,-0.1,1.2,-1,0.5],[20,2.7,4,0.4,3.1,0.2,1.5,-0.8,0.7],[21,3.1,4.5,0.8,3.6,0.5,1.8,-0.6,0.9],[22,3.5,4.9,1.2,4.1,0.8,2.1,-0.4,1.2],[23,4,5.4,1.6,4.5,1.1,2.4,-0.1,1.4],[24,4.4,5.9,2,5,1.4,2.7,0.2,1.7],[25,4.8,6.3,2.4,5.4,1.7,3.1,0.5,2],[26,5.2,6.8,2.7,5.9,2,3.4,0.8,2.4],[27,5.6,7.2,3.1,6.3,2.3,3.7,1.1,2.7],[28,6,7.7,3.4,6.7,2.6,4.1,1.4,3],[29,6.3,8.1,3.8,7.1,3,4.4,1.7,3.4],[30,6.7,8.5,4.1,7.5,3.3,4.8,2,3.7],[31,7.1,8.9,4.5,7.9,3.7,5.2,2.3,4],[32,7.4,9.3,4.8,8.3,4,5.6,2.7,4.4],[33,7.7,9.7,5.2,8.8,4.4,6,3,4.7],[34,8.1,10.1,5.5,9.2,4.8,6.4,3.3,5.1],[35,8.4,10.4,5.9,9.7,5.2,6.8,3.6,5.4],[36,8.6,10.8,6.3,10.1,5.5,7.2,4,5.7],[37,8.9,11.1,6.7,10.6,5.9,7.6,4.3,6.1],[38,9.2,11.5,7,11,6.4,8,4.6,6.4],[39,9.5,11.8,7.4,11.5,6.8,8.5,4.9,6.8],[40,9.7,12.2,8,12,7,9,5,7.2]];
export const GESTATIONAL_GAIN_SOURCE='Ministério da Saúde, Guia VAN na APS (2023), Anexo: Ganho de Peso Gestacional Cumulativo, p. 50; Kac et al. (2021).';
export function gestationalWeeklyAssessment(preBmi,gestWeeks,gainKg){
  if(!Number.isFinite(preBmi)||preBmi<=0||!Number.isInteger(gestWeeks)||gestWeeks<1||gestWeeks>42||!Number.isFinite(gainKg)){
    throw new RangeError('Dados gestacionais inválidos.');
  }
  const type=preBmi<18.5?'under':preBmi<25?'normal':preBmi<30?'over':'obese';
  if(gestWeeks<10||gestWeeks>40)return {available:false,week:gestWeeks,profile:type,reason:'Tabela oficial disponível somente da 10ª à 40ª semana.'};
  const row=GESTATIONAL_WEEKLY_GAIN[gestWeeks-10];
  if(!row||row[0]!==gestWeeks)throw new Error('Referência semanal não encontrada.');
  const index={under:1,normal:3,over:5,obese:7}[type];
  const lower=row[index],upper=row[index+1];
  const level=gainKg<lower?'below':gainKg>upper?'above':'within';
  return {available:true,week:gestWeeks,profile:type,lower,upper,level,source:GESTATIONAL_GAIN_SOURCE};
}
