import type { PlanResults, UserInputs, TrainingDay } from './calculations';
import { weekdays, trainingMinutes } from './training-engine';

export type DayPlan = { day: string; strength?: TrainingDay; cardioMinutes: number; cardio: string; recovery: string };
export type WeekPlan = { week: number; phase: string; guidance: string; days: DayPlan[]; strengthCount: number; cardioMinutes: number; habit: string[] };
export function getProgramWeek(plan:PlanResults,inputs:UserInputs,week:number):WeekPlan {
  const w=Math.max(1,Math.min(8,Math.floor(week)||1)),phase=plan.trainingPlan[Math.floor((w-1)/2)];
  const n=phase.days.length, experienced=inputs.experience==='experienced';
  const minutes=(experienced?[25,25,30,30,35,35,25,25]:[15,15,20,20,25,25,20,20])[w-1];
  const recoveryIndices=weekdays.map((_,i)=>i).filter(i=>!phase.days.some(d=>d.day===weekdays[i]));
  // Preserve at least one non-strength day without prescribed aerobic work.
  const restIndex=recoveryIndices[recoveryIndices.length-1];
  const candidates=[...recoveryIndices.filter(i=>i!==restIndex),...weekdays.map((_,i)=>i).filter(i=>phase.days.some(d=>d.day===weekdays[i]&&!/lower|leg/i.test(d.focus))),...weekdays.map((_,i)=>i).filter(i=>i!==restIndex)];
  const cardioDays=[...new Set(candidates)].slice(0,n>=5?2:3);
  const days=weekdays.map((day,i)=>{
    const strength=phase.days.find(d=>d.day===day), cardioMinutes=cardioDays.includes(i)?minutes:0;
    const cardio=cardioMinutes?(inputs.runningInterest?'Easy walk or run/walk, including warm-up and cool-down. Jog only if brisk walking is comfortable.':'Brisk walk, cycle or other low-impact activity at conversational effort.'):'';
    const recovery=(!strength&&!cardioMinutes)?'Rest from planned exercise; gentle movement if comfortable.':strength?'Warm up for 5-7 min including practice sets; cool down easily.':'Start and finish at an easy pace.';
    return {day,strength,cardioMinutes,cardio,recovery};
  });
  return {week:w,phase:phase.phase,guidance:phase.volumeChange||'',days,strengthCount:n,cardioMinutes:days.reduce((s,d)=>s+d.cardioMinutes,0),habit:plan.habitPlan.find(h=>h.week===w)?.habits??[]};
}
export function getWeekSessionMinutes(day:DayPlan):number{return (day.strength?trainingMinutes(day.strength.exercises):0)+day.cardioMinutes;}
export const effortGuide = [
  ['RPE 5-6','Finish with about 4-5 reps left; use easy, controlled technique.'],
  ['RPE 6-7','Finish with about 3-4 reps left; learn the movement.'],
  ['RPE 7-8','Finish with about 2-3 reps left; challenging but controlled.'],
];
export const progressionRules = [
  'Begin with a load that lets you complete the lower end of the prescribed rep range with the intended effort.',
  'When every set reaches the upper end of the range with good technique on two sessions, add the smallest available load or make the bodyweight movement slightly harder.',
  'If effort exceeds the target, technique deteriorates or recovery is poor, reduce load, reps or sets. Never make up missed workouts by doubling the next session.',
  'Stop exercise for chest pain, faintness, severe breathlessness or sharp pain; seek urgent help for severe or persistent symptoms. This is a healthy-adult program, not rehabilitation.',
];
export const referenceLinks = [
  {title:'ACSM resistance training position stand (2026)',detail:'Progressive resistance exercise; flexible prescription and no requirement to train to failure.',url:'https://pubmed.ncbi.nlm.nih.gov/41843416/'},
  {title:'CDC adult physical activity guidelines',detail:'Aim over time for 150 minutes of moderate activity per week and at least two strength days; begin gradually.',url:'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html'},
  {title:'Morton et al. protein meta-analysis (2018)',detail:'Protein intake supports resistance-training adaptations; higher intake is not necessarily better.',url:'https://pubmed.ncbi.nlm.nih.gov/28698222/'},
  {title:'Mifflin et al. resting energy equation (1990)',detail:'Resting energy estimate, not a measured daily requirement.',url:'https://pubmed.ncbi.nlm.nih.gov/2305711/'},
  {title:'USDA FoodData Central',detail:'Reference for checking food composition; example food values in the app are rounded typical estimates, not live USDA lookups.',url:'https://fdc.nal.usda.gov/'},
];
