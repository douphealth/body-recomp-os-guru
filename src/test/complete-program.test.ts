import {describe,it,expect} from 'vitest';
import {calculatePlan,type UserInputs} from '../lib/calculations';
import {getProgramWeek} from '../lib/program-guide';
import {getWeeklyMenu,shoppingList} from '../lib/weekly-menu';
const p:UserInputs={age:35,sex:'male',heightCm:180,weightKg:80,bodyFatPercent:20,goal:'recomp',workoutFrequency:3,stepCount:7000,dietStyle:'standard',equipmentAccess:'gym',runningInterest:false,experience:'beginner',sessionMinutes:45};
describe('complete program',()=>{
 it('schedules seven days, all requested strength sessions and at least one rest day',()=>{for(let n=2;n<=6;n++)for(let w=1;w<=8;w++){const i={...p,workoutFrequency:n};const a=getProgramWeek(calculatePlan(i),i,w);expect(a.days.length).toBe(7);expect(a.days.filter(d=>d.strength).length).toBe(n);expect(a.days.some(d=>!d.strength&&!d.cardioMinutes)).toBe(true);expect(a.cardioMinutes).toBe(a.days.reduce((s,d)=>s+d.cardioMinutes,0));}});
 it('reconciles weekly menu and grocery list; vegetarian menus exclude meat and fish',()=>{for(const dietStyle of ['standard','vegetarian','high-protein','keto'] as const){const i={...p,dietStyle};const plan=calculatePlan(i);const menu=getWeeklyMenu(plan,i);expect(menu.length).toBe(7);for(const day of menu){expect(day.meals.length).toBe(4);expect(day.totals.calories).toBe(day.meals.reduce((s,m)=>s+m.totals.calories,0));expect(day.gap.calories).toBe(day.totals.calories-plan.calorieTarget);expect(day.meals.flatMap(m=>m.items).every(x=>x.grams>0&&Number.isFinite(x.calories))).toBe(true);}const list=shoppingList(menu);expect(list.reduce((s,x)=>s+x.grams,0)).toBe(menu.flatMap(d=>d.meals).flatMap(m=>m.items).reduce((s,x)=>s+x.grams,0));if(dietStyle==='vegetarian')expect(list.map(x=>x.name).join(' ')).not.toMatch(/chicken|turkey|salmon|tuna/i);}});
});
