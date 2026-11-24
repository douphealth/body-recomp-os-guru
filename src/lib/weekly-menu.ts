import type { PlanResults, UserInputs } from './calculations';

type Food = {name:string; p:number;c:number;f:number; base:number; min:number;max:number; prep:string};
const f=(name:string,p:number,c:number,fat:number,base:number,min:number,max:number,prep='')=>({name,p,c,f:fat,base,min,max,prep});
const food = {
  yogurt:f('Plain Greek yogurt',10,4,2,200,100,350,'as sold'),
  cottage:f('Cottage cheese',12,3,4,150,80,300,'as sold'),
  egg:f('Eggs',13,1,10,100,50,200,'edible weight'),
  oats:f('Rolled oats',13,68,7,50,25,100,'dry'),
  berries:f('Berries',1,12,0.5,100,60,180,'fresh or frozen'),
  banana:f('Banana',1,23,0.3,120,60,180,'peeled'),
  apple:f('Apple',0.3,14,0.2,150,80,220,'edible weight'),
  almonds:f('Almonds',21,22,50,20,10,60,'unsalted'),
  bread:f('Wholegrain bread',10,45,4,70,35,140,'as sold'),
  chicken:f('Chicken breast',31,0,3.6,150,75,260,'cooked'),
  turkey:f('Turkey breast',29,0,2,150,75,260,'cooked'),
  salmon:f('Salmon',25,0,13,150,80,250,'cooked'),
  tuna:f('Light tuna',25,0,1,120,60,180,'canned in water, drained'),
  tofu:f('Firm tofu',15,3,9,180,90,300,'drained'),
  lentils:f('Lentils',9,20,0.4,160,80,270,'cooked'),
  chickpeas:f('Chickpeas',9,27,3,150,70,260,'cooked'),
  rice:f('Brown rice',2.6,23,0.9,150,60,300,'cooked'),
  quinoa:f('Quinoa',4.4,21,1.9,150,60,300,'cooked'),
  potato:f('Potatoes',2,20,0.1,200,80,350,'cooked'),
  veg:f('Mixed non-starchy vegetables',2,6,0.4,180,100,300,'cooked or raw'),
  greens:f('Leafy salad greens',1.5,3,0.3,120,70,220,'raw'),
  avocado:f('Avocado',2,9,15,80,40,180,'edible weight'),
  olive:f('Olive oil',0,0,100,10,5,35,'weighed'),
  cheese:f('Feta cheese',14,4,21,40,20,80,'as sold'),
} satisfies Record<string,Food>;
type Key=keyof typeof food;
type MealSpec={name:string; items:Key[]; prep:string};
type DaySpec=MealSpec[];
const m=(name:string,items:Key[],prep:string):MealSpec=>({name,items,prep});
const standard:DaySpec[]=[
  [m('Yogurt & oats',['yogurt','oats','berries','almonds'],'Combine yogurt, oats and berries; top with almonds.'),m('Chicken rice bowl',['chicken','rice','veg','olive'],'Cook chicken thoroughly; serve with rice, vegetables and oil.'),m('Fruit & cottage cheese',['cottage','apple'],'Serve chilled with sliced apple.'),m('Salmon & potatoes',['salmon','potato','greens','olive'],'Bake salmon and potatoes; serve with dressed greens.')],
  [m('Eggs & toast',['egg','bread','avocado'],'Cook eggs; serve on toast with avocado.'),m('Turkey quinoa bowl',['turkey','quinoa','veg','olive'],'Cook turkey thoroughly; combine with quinoa and vegetables.'),m('Yogurt & banana',['yogurt','banana','almonds'],'Mix yogurt with sliced banana and almonds.'),m('Lentil chicken salad',['chicken','lentils','greens','olive'],'Toss cooked chicken and lentils with greens and oil.')],
  [m('Overnight oats',['yogurt','oats','banana'],'Mix oats and yogurt; refrigerate, then add banana.'),m('Chickpea tuna bowl',['tuna','chickpeas','greens','olive'],'Drain tuna; toss with chickpeas, greens and oil.'),m('Cottage cheese & berries',['cottage','berries','almonds'],'Combine and serve.'),m('Turkey & potatoes',['turkey','potato','veg','olive'],'Roast potatoes and vegetables; add thoroughly cooked turkey.')],
  [m('Eggs with potatoes',['egg','potato','veg'],'Cook eggs and combine with cooked potatoes and vegetables.'),m('Chicken quinoa plate',['chicken','quinoa','greens','olive'],'Serve cooked chicken and quinoa with dressed greens.'),m('Yogurt & apple',['yogurt','apple','almonds'],'Serve together.'),m('Tofu rice bowl',['tofu','rice','veg','olive'],'Saute tofu and vegetables; serve over rice.')],
  [m('Yogurt berry bowl',['yogurt','oats','berries','almonds'],'Mix and serve.'),m('Turkey potato plate',['turkey','potato','veg','olive'],'Cook turkey thoroughly; serve with potatoes and vegetables.'),m('Cottage cheese & banana',['cottage','banana'],'Serve together.'),m('Salmon quinoa salad',['salmon','quinoa','greens','olive'],'Bake salmon; serve with quinoa and dressed greens.')],
  [m('Eggs & wholegrain toast',['egg','bread','greens','olive'],'Cook eggs; serve with toast and greens.'),m('Chicken lentil bowl',['chicken','lentils','veg','olive'],'Combine cooked chicken, lentils and vegetables.'),m('Yogurt & berries',['yogurt','berries','almonds'],'Mix and serve.'),m('Tofu & potatoes',['tofu','potato','greens','olive'],'Bake tofu and potatoes; serve with salad.')],
  [m('Banana oat bowl',['yogurt','oats','banana','almonds'],'Mix oats and yogurt; add fruit and almonds.'),m('Turkey rice bowl',['turkey','rice','veg','olive'],'Cook turkey thoroughly; serve with rice and vegetables.'),m('Cottage cheese & apple',['cottage','apple'],'Serve chilled.'),m('Chickpea feta plate',['chickpeas','cheese','greens','olive','bread'],'Toss chickpeas, feta and greens; serve with bread.')],
];
const vegetarian:DaySpec[]=standard.map((day,i)=>day.map((meal,j)=>{
 if(!meal.items.some(k=>['chicken','turkey','salmon','tuna'].includes(k)))return meal;
 const main:Key=(i+j)%2===0?'tofu':'egg';
 return m((main==='tofu'?'Tofu':'Egg')+' grain & vegetable plate',meal.items.map(k=>['chicken','turkey','salmon','tuna'].includes(k)?main:k),'Cook the protein and grain or legumes as needed; combine with vegetables and dressing.');
}));
const lowCarb:DaySpec[]=standard.map((day,i)=>[
 m('Egg & avocado plate',['egg','avocado','greens','olive'],'Cook eggs; serve with avocado and dressed greens.'),
 m('Protein salad',[(['chicken','turkey','tofu','chicken','turkey','tuna','chicken'] as Key[])[i],'greens','avocado','olive'],'Cook or drain protein; toss with greens and avocado.'),
 m('Yogurt & almonds',['yogurt','almonds'],'Serve plain yogurt with almonds.'),
 m('Protein & vegetables',[(['salmon','chicken','turkey','tofu','salmon','turkey','tofu'] as Key[])[i],'veg','cheese','olive'],'Cook protein and vegetables; finish with feta and oil.')
]);
export type MenuItem={name:string;grams:number;prep:string;protein:number;carbs:number;fat:number;calories:number};
export type Totals={calories:number;protein:number;carbs:number;fat:number};
export type MenuMeal={name:string;prep:string;items:MenuItem[];totals:Totals;target:Totals};
export type MenuDay={day:number;meals:MenuMeal[];totals:Totals;gap:Totals};
const zeros=():Totals=>({calories:0,protein:0,carbs:0,fat:0});
const add=(a:Totals,b:Totals):Totals=>({calories:a.calories+b.calories,protein:a.protein+b.protein,carbs:a.carbs+b.carbs,fat:a.fat+b.fat});
const values=(f:Food,g:number):Totals=>{const p=f.p*g/100,c=f.c*g/100,fa=f.f*g/100;return {calories:4*p+4*c+9*fa,protein:p,carbs:c,fat:fa};};
const round=(t:Totals):Totals=>({calories:Math.round(t.calories),protein:Math.round(t.protein),carbs:Math.round(t.carbs),fat:Math.round(t.fat)});
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function getWeeklyMenu(plan:PlanResults,inputs:UserInputs):MenuDay[]{
 const target={calories:plan.calorieTarget,protein:plan.proteinGrams,carbs:plan.carbGrams,fat:plan.fatGrams};
 const choices=inputs.dietStyle==='vegetarian'?vegetarian:inputs.dietStyle==='keto'?lowCarb:standard;
 return choices.map((spec,day)=>{
  const fs=spec.flatMap(meal=>meal.items.map(k=>food[k]));
  const gram=fs.map(v=>clamp(Math.round(v.base*target.calories/2100/5)*5,v.min,v.max));
  const sum=()=>fs.reduce((s,v,i)=>add(s,values(v,gram[i])),zeros());
  const error=()=>{const t=sum();return ((t.calories-target.calories)/Math.max(target.calories,1000))**2*5+((t.protein-target.protein)/Math.max(target.protein,60))**2*2+((t.carbs-target.carbs)/Math.max(target.carbs,40))**2+((t.fat-target.fat)/Math.max(target.fat,40))**2+gram.reduce((s,g,i)=>s+((g-fs[i].base)/Math.max(fs[i].base,20))**2,0)*0.001;};
  // Bounded coordinate search; realistic serving limits take precedence over exact targets.
  for(let pass=0;pass<30;pass++){let changed=false;for(let i=0;i<fs.length;i++){const original=gram[i];let best=original,loss=error();for(const step of [-10,-5,5,10]){gram[i]=clamp(original+step,fs[i].min,fs[i].max);const e=error();if(e<loss-1e-8){loss=e;best=gram[i];}}gram[i]=best;changed ||= best!==original;}if(!changed)break;}
  let offset=0;
  const meals=spec.map((meal,i):MenuMeal=>{
    const items=meal.items.map(k=>{const v=food[k],g=gram[offset++];return {name:v.name,grams:g,prep:v.prep,...round(values(v,g))};});
    const totals=items.reduce((s,v)=>add(s,v),zeros());
    const t=plan.mealTiming[i];
    return {name:meal.name,prep:meal.prep,items,totals,target:{calories:t.calories,protein:t.protein,carbs:t.carbs,fat:t.fat}};
  });
  const totals=meals.reduce((s,v)=>add(s,v.totals),zeros());
  return {day:day+1,meals,totals,gap:{calories:totals.calories-target.calories,protein:totals.protein-target.protein,carbs:totals.carbs-target.carbs,fat:totals.fat-target.fat}};
 });
}
export function shoppingList(menu:MenuDay[]):{name:string;grams:number;prep:string}[]{
 const list=new Map<string,{name:string;grams:number;prep:string}>();
 menu.forEach(day=>day.meals.forEach(meal=>meal.items.forEach(item=>{const old=list.get(item.name);list.set(item.name,{name:item.name,grams:(old?.grams??0)+item.grams,prep:item.prep});})));
 return [...list.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function menuNote(day:MenuDay,plan:PlanResults):string{
 return Math.abs(day.gap.calories)>plan.calorieTarget*.12||Math.abs(day.gap.protein)>plan.proteinGrams*.15?
 'This example differs materially from your target. Use the target values separately; adjust portions or seek individual nutrition guidance rather than forcing the menu.':
 'This is an approximate food example, not an exact prescription. Check product labels and adjust for appetite, allergies and dietary needs.';
}
