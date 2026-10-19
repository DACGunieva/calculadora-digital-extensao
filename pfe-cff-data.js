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
