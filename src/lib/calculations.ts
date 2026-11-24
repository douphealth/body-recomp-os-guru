import { buildTraining } from './training-engine';

export interface UserInputs {
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number;
  goal: 'fat-loss' | 'lean-muscle' | 'recomp';
  workoutFrequency: number; // 3-6 days
  stepCount: number;
  dietStyle: 'standard' | 'keto' | 'high-protein' | 'vegetarian';
  equipmentAccess: 'gym' | 'home' | 'minimal';
  runningInterest: boolean;
  experience?: 'beginner' | 'experienced';
  sessionMinutes?: 20 | 30 | 45 | 60;
}

export interface PlanResults {
  tdee: number;
  bmr: number;
  calorieTarget: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterLiters: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  leanBodyMass: number;
  trainingPlan: TrainingWeek[];
  cardioPlan: CardioBlock;
  recoveryChecklist: string[];
  habitPlan: HabitWeek[];
  quickSummary: string;
  goalLabel: string;
  weeklyCalorieRange?: { low: number; high: number };
  scienceNotes: ScienceNote[];
  mealTiming: MealTimingBlock[];
  proteinPerKgLBM: number;
  deficitOrSurplus: number;
  neat: number;
  tef: number;
}

export interface ScienceNote {
  title: string;
  explanation: string;
  citation: string;
}

export interface MealTimingBlock {
  meal: string;
  timing: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
}

export interface TrainingDay {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; rpe?: string; rest?: string; notes?: string; alternative?: string }[];
}

export interface TrainingWeek {
  weekRange: string;
  phase: string;
  days: TrainingDay[];
  deload?: boolean;
  volumeChange?: string;
  intensityGuideline?: string;
}

export interface CardioBlock {
  type: string;
  sessionsPerWeek: number;
  duration: string;
  intensity: string;
  notes: string;
  runningPlan?: string;
  heartRateZones?: { zone: string; bpm: string; purpose: string }[];
}

export interface HabitWeek {
  week: number;
  habits: string[];
  focus: string;
}

/* ─── BMR Calculation ─── 
   Mifflin-St Jeor (1990) — validated as the most accurate predictive equation 
   for resting metabolic rate in healthy adults.
   Reference: Mifflin et al., Am J Clin Nutr, 1990;51(2):241-7
*/
function calculateBMR_MifflinStJeor(sex: string, weightKg: number, heightCm: number, age: number): number {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

// Mifflin-St Jeor is used directly; self-reported body fat does not affect resting energy.

/* ─── Activity Multiplier ───
   Based on Cunningham (1991) activity factor classifications
   with step-count NEAT adjustments per Levine et al. (2005)
*/
function getActivityMultiplier(workoutFrequency: number, stepCount: number): number {
  // Base multiplier from NEAT (Non-Exercise Activity Thermogenesis)
  let neatFactor = 1.2; // Sedentary baseline
  if (stepCount >= 12000) neatFactor = 1.35;
  else if (stepCount >= 10000) neatFactor = 1.30;
  else if (stepCount >= 7000) neatFactor = 1.25;
  else if (stepCount >= 5000) neatFactor = 1.22;

  // Exercise Activity Thermogenesis (EAT)
  let eatFactor = 0;
  if (workoutFrequency >= 6) eatFactor = 0.40;
  else if (workoutFrequency >= 5) eatFactor = 0.33;
  else if (workoutFrequency >= 4) eatFactor = 0.25;
  else if (workoutFrequency >= 3) eatFactor = 0.18;
  else eatFactor = 0.10;

  return neatFactor + eatFactor;
}

function getGoalLabel(goal: string): string {
  switch (goal) {
    case 'fat-loss': return 'Fat Loss';
    case 'lean-muscle': return 'Lean Muscle Gain';
    case 'recomp': return 'Body Recomposition';
    default: return '';
  }
}

function generateCardioPlan(inputs: UserInputs): CardioBlock {
  const beginner = inputs.experience !== 'experienced';
  const sessionsPerWeek = inputs.workoutFrequency >= 5 ? 2 : 3;
  const duration = beginner ? '15-25 minutes' : '25-40 minutes';
  return {
    type: inputs.runningInterest ? 'Walk / easy run-walk' : 'Brisk walking, cycling or low-impact cardio',
    sessionsPerWeek, duration,
    intensity: 'Moderate talk-test pace: you can talk but not sing. Start easier if returning to activity.',
    notes: 'Build gradually toward 150 minutes of moderate aerobic activity per week, including brisk walks. Short sessions count; there is no need for HIIT. Keep at least one low-load recovery day and avoid hard cardio before lower-body sessions.',
    runningPlan: inputs.runningInterest ? 'If you can already walk briskly for 20-30 minutes comfortably: warm up for 5 min, alternate 1 min easy jogging with 2 min walking for 6 rounds, then cool down. Repeat until comfortable before increasing jogging time; do not force continuous running by a deadline.' : undefined,
  };
}

function generateRecoveryChecklist(inputs: UserInputs): string[] {
  const waterOz = Math.round(inputs.weightKg * 2.2 * 0.5);
  const checklist = [
    `Sleep 7-9 hours per night -- prioritize consistent sleep/wake times (Walker, 2017)`,
    `Drink ${waterOz}+ oz water daily (${Math.round(waterOz * 29.574 / 1000 * 10) / 10}L) -- adjust for exercise and climate`,
    `Stretch or foam roll for 10 minutes post-workout to improve recovery (Pearcey et al., 2015)`,
    `Take 1-2 full rest days per week -- active recovery walks are encouraged`,
    `Eat whole, minimally processed foods for 80%+ of calories`,
    `Track progress weekly: weight (same time/conditions), measurements, photos`,
    `Practice 5 minutes of mindfulness or deep breathing daily for cortisol management`,
    `Consume 25-35g fiber daily for gut health and satiety`,
  ];

  if (inputs.workoutFrequency >= 5) {
    checklist.push('If recovery deteriorates, reduce sets or replace a session with rest.');
  }
  if (inputs.goal === 'fat-loss') {
    checklist.push('Monitor hunger and energy; if persistently exhausted, pause the deficit and seek guidance');
  }
  if (inputs.goal === 'lean-muscle') {
    checklist.push('Spread protein across meals; eat when convenient around training');
  }

  return checklist;
}

function generateHabitPlan(): HabitWeek[] {
  return [
    { week: 1, focus: 'Foundation', habits: ['Track all meals in a food log', 'Set a consistent wake-up time', 'Prep meals for 3 days ahead'] },
    { week: 2, focus: 'Movement', habits: ['Hit your step count target every day', 'Complete all scheduled workouts', 'Add 5 min morning mobility routine'] },
    { week: 3, focus: 'Nutrition Quality', habits: ['Replace one processed snack with whole food', 'Eat protein at every meal', 'Drink water before every meal'] },
    { week: 4, focus: 'Recovery', habits: ['Implement a wind-down routine before bed', 'Foam roll after every workout', 'Take one full rest day with zero guilt'] },
    { week: 5, focus: 'Consistency', habits: ['Batch cook meals for the week', 'Review and adjust calorie targets', 'Track your training weights to ensure progression'] },
    { week: 6, focus: 'Mindset', habits: ['Journal 3 things you are grateful for daily', 'Celebrate one non-scale victory', 'Set a process goal (not outcome goal) for the week'] },
    { week: 7, focus: 'Optimization', habits: ['Experiment with meal timing around workouts', 'Add one new healthy recipe', 'Test going to bed 30 minutes earlier'] },
    { week: 8, focus: 'Sustainability', habits: ['Create your next 4-week plan', 'Identify your top 3 habits to keep long-term', 'Reassess your body composition and goals'] },
  ];
}

function generateScienceNotes(inputs: UserInputs, plan: { bmr: number; tdee: number; calorieTarget: number; proteinGrams: number; leanBodyMass: number; proteinPerKgLBM: number }): ScienceNote[] {
  return [
    { title: 'Resting energy estimate', explanation: 'Mifflin-St Jeor estimates resting energy expenditure from age, sex, height and weight. Self-reported body fat is used only for the approximate lean-mass display. Activity multipliers are planning heuristics, not direct measurements.', citation: 'Mifflin et al. 1990 (PMID 2305711); Frankenfield et al. 2005 (PMID 15883556)' },
    { title: 'Starting energy target', explanation: 'Your estimated maintenance is ' + plan.tdee + ' kcal/day; your starting target is ' + plan.calorieTarget + ' kcal/day. The app uses a conservative deficit or surplus when appropriate; actual energy needs vary. Review recovery, hunger, performance and trends after 2-3 weeks. No guaranteed weight change.', citation: 'Energy target adjustment is an app heuristic; not a clinically validated individual prescription.' },
    { title: 'Protein and macronutrients', explanation: 'Your starting target is ' + plan.proteinGrams + ' g/day. The app uses 1.6-2.0 g/kg total body mass (subject to the energy budget), not an assumed lean-mass requirement. The calorie target and grams are reconciled. Higher intake is not automatically better. Seek individual advice for kidney disease or other medical dietary restrictions.', citation: 'Morton et al. Br J Sports Med 2018;52:376-384. doi:10.1136/bjsports-2017-097608' },
    { title: 'Resistance training', explanation: 'Train consistently with manageable effort, cover major muscle groups and increase difficulty only when recovery and technique permit. The 8-week schedule adjusts sets and effort; the specific cycle is an app design choice, not a proven optimal schedule.', citation: 'ACSM Position Stand 2026. doi:10.1249/MSS.0000000000003897' },
    { title: 'Aerobic activity', explanation: 'Work gradually toward at least 150 minutes of moderate aerobic activity weekly plus strength training on at least two days. Walking, cycling and short bouts count. Heart-rate targets are not inferred from an assumed resting pulse.', citation: 'CDC Adult Activity: An Overview (2023), cdc.gov/physical-activity-basics/guidelines/adults.html' },
    ...(inputs.dietStyle === 'keto' ? [{ title: 'Low-carbohydrate preference', explanation: 'A low-carbohydrate pattern is optional, not required for fat loss; the app cannot guarantee ketosis. Speak with a clinician before using it if pregnant, taking diabetes medication, or managing a medical condition.', citation: 'General safety guidance; individualized clinical advice is outside this app.' }] : []),
  ];
}

function generateMealTiming(plan: { calorieTarget: number; proteinGrams: number; carbGrams: number; fatGrams: number }, goal: string): MealTimingBlock[] {
  const shares = goal === 'lean-muscle' ? [0.25,0.25,0.30,0.20] : [0.25,0.30,0.20,0.25];
  const split = (total: number) => {
    const parts = shares.slice(0,3).map(s => Math.floor(total*s));
    return [...parts, total-parts.reduce((a,b)=>a+b,0)];
  };
  const p=split(plan.proteinGrams), c=split(plan.carbGrams), f=split(plan.fatGrams);
  return ['Breakfast','Lunch','Snack / around training','Dinner'].map((meal,i) => ({
    meal, timing: ['Morning','Midday','When convenient','Evening'][i], protein:p[i], carbs:c[i], fat:f[i],
    calories:4*p[i]+4*c[i]+9*f[i], notes: 'Flexible example; shift meal timing and foods to suit your schedule.'
  }));
}

export function validateInputs(inputs: UserInputs): void {
  const within = (x: number, min: number, max: number) => Number.isFinite(x) && x >= min && x <= max;
  if (!inputs || !within(inputs.age,18,100) || !within(inputs.heightCm,100,250) || !within(inputs.weightKg,30,300) || !within(inputs.bodyFatPercent,3,60) ||
      !within(inputs.workoutFrequency,2,7) || !Number.isInteger(inputs.workoutFrequency) || !within(inputs.stepCount,0,40000) ||
      !['male','female'].includes(inputs.sex) || !['fat-loss','lean-muscle','recomp'].includes(inputs.goal) ||
      !['standard','high-protein','keto','vegetarian'].includes(inputs.dietStyle) || !['gym','home','minimal'].includes(inputs.equipmentAccess) ||
      (inputs.experience !== undefined && !['beginner','experienced'].includes(inputs.experience)) ||
      (inputs.sessionMinutes !== undefined && ![20,30,45,60].includes(inputs.sessionMinutes))) {
    throw new Error('Please enter a valid adult profile and schedule.');
  }
}

export function calculatePlan(raw: UserInputs): PlanResults {
  validateInputs(raw);
  const inputs = { ...raw, workoutFrequency: Math.min(raw.workoutFrequency,6) };
  const leanBodyMass = inputs.weightKg * (1-inputs.bodyFatPercent/100);
  const bmr = Math.max(500,Math.round(calculateBMR_MifflinStJeor(inputs.sex,inputs.weightKg,inputs.heightCm,inputs.age)));
  const activityMultiplier = getActivityMultiplier(inputs.workoutFrequency,inputs.stepCount);
  const tdee = Math.round(bmr*activityMultiplier);
  const bmi = inputs.weightKg / ((inputs.heightCm/100)**2);
  // No automated deficit for low BMI, very low reported body fat or low estimated expenditure.
  const eligibleDeficit = bmi >= 18.5 && inputs.bodyFatPercent >= (inputs.sex === 'female' ? 15 : 8) && tdee >= 1500;
  const intended = inputs.goal === 'fat-loss' && eligibleDeficit ? Math.max(bmr,1500,Math.round(tdee*0.85)) :
    inputs.goal === 'lean-muscle' ? Math.round(tdee*1.05) : tdee;
  const goalLabel = getGoalLabel(inputs.goal);
  const factor = inputs.dietStyle === 'high-protein' || inputs.goal === 'fat-loss' ? 2 : 1.6;
  const proteinGrams = Math.min(Math.round(inputs.weightKg*factor),Math.floor(intended*0.35/4));
  const proteinCals = proteinGrams*4;
  const carbGrams = inputs.dietStyle === 'keto' ? Math.max(0,Math.round(intended*0.05/4)) :
    Math.max(0,Math.round((intended-proteinCals-Math.round(intended*0.30/9)*9)/4));
  const fatGrams = Math.max(0,Math.round((intended-proteinCals-carbGrams*4)/9));
  const calorieTarget = proteinCals+carbGrams*4+fatGrams*9;
  const proteinPercent = Math.round(proteinCals/calorieTarget*100);
  const carbPercent = Math.round(carbGrams*4/calorieTarget*100);
  const fatPercent = 100-proteinPercent-carbPercent;
  const proteinPerKgLBM = Math.round(proteinGrams/leanBodyMass*10)/10;
  const roundedLBM = Math.round(leanBodyMass*10)/10;
  const deficitOrSurplus = calorieTarget-tdee;
  const scienceNotes = generateScienceNotes(inputs,{bmr,tdee,calorieTarget,proteinGrams,leanBodyMass:roundedLBM,proteinPerKgLBM});
  const restriction = inputs.goal === 'fat-loss' && !eligibleDeficit ? ' An automated deficit is not appropriate for this profile; seek individualized guidance before changing intake.' : '';
  return {
    tdee,bmr,calorieTarget,proteinGrams,carbGrams,fatGrams,proteinPercent,carbPercent,fatPercent,leanBodyMass:roundedLBM,proteinPerKgLBM,deficitOrSurplus,
    fiberGrams:Math.round(calorieTarget/1000*14),waterLiters:Math.round(inputs.weightKg*0.035*10)/10,
    neat:Math.round(bmr*(activityMultiplier-1)*0.6),tef:Math.round(tdee*0.1),
    trainingPlan:buildTraining(inputs),cardioPlan:generateCardioPlan(inputs),recoveryChecklist:generateRecoveryChecklist(inputs),habitPlan:generateHabitPlan(),
    goalLabel,scienceNotes,mealTiming:generateMealTiming({calorieTarget,proteinGrams,carbGrams,fatGrams},inputs.goal),
    quickSummary: 'Start with ' + calorieTarget + ' estimated kcal/day, ' + proteinGrams + ' g protein, and ' + inputs.workoutFrequency + ' strength sessions per week. Track how you feel and perform before progressing. These are estimates for healthy adults, not guarantees.' + restriction,
  };
}

export function getContextualLinks(inputs: UserInputs) {
  const links = [
    { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training Plans, Workouts & Weight Loss Guides', description: 'Explore our full library of training plans, workout routines, and sustainable weight-loss strategies.' },
    { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit — Expert Fitness Guidance You Can Trust', description: 'Learn about our mission to help you achieve your fitness goals with evidence-based guidance.' },
  ];

  if (inputs.runningInterest) {
    links.push({
      url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/',
      title: 'How to Choose the Right Running Shoes',
      description: 'Your plan includes running — learn how to choose comfortable shoes.',
    });
    links.push({
      url: 'https://gearuptofit.com/review/running-shoes/',
      title: 'Best Running Shoes — Expert Reviews & Comparisons',
      description: 'Compare top-rated running shoes with our in-depth reviews and buyer guides.',
    });
  }

  return links;
}
