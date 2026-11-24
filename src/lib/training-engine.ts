import type { UserInputs, TrainingDay, TrainingWeek } from './calculations';

type Exercise = TrainingDay['exercises'][number];
type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'vertical' | 'shoulder' | 'core' | 'calf';
type Move = { name: string; cue: string; alternative: string };
const catalog: Record<UserInputs['equipmentAccess'], Record<Pattern, Move>> = {
  gym: {
    squat: { name: 'Goblet squat', cue: 'Brace your trunk; sit between your hips, knees tracking toes; use a comfortable depth.', alternative: 'Leg press' },
    hinge: { name: 'Dumbbell Romanian deadlift', cue: 'Soft knees; push hips back with weights close; stop before your back rounds.', alternative: 'Machine hamstring curl' },
    push: { name: 'Dumbbell bench press', cue: 'Feet planted, shoulder blades supported; lower slowly, press smoothly.', alternative: 'Machine chest press' },
    pull: { name: 'Seated cable row', cue: 'Stay tall; draw elbows back without rocking your torso.', alternative: 'Chest-supported dumbbell row' },
    vertical: { name: 'Lat pulldown', cue: 'Pull elbows toward ribs; return slowly without leaning back.', alternative: 'Assisted pull-up' },
    shoulder: { name: 'Dumbbell shoulder press', cue: 'Keep ribs down; press through a comfortable range.', alternative: 'Machine shoulder press' },
    core: { name: 'Dead bug', cue: 'Exhale and keep lower back supported as opposite arm and leg extend.', alternative: 'Bird dog' },
    calf: { name: 'Standing calf raise', cue: 'Hold a stable support; rise and lower with control.', alternative: 'Seated calf raise' },
  },
  home: {
    squat: { name: 'Dumbbell goblet squat', cue: 'Hold weight at chest; descend with control and keep knees aligned.', alternative: 'Bodyweight sit-to-stand' },
    hinge: { name: 'Dumbbell Romanian deadlift', cue: 'Hinge at hips, soft knees, neutral back; keep weights close.', alternative: 'Glute bridge' },
    push: { name: 'Dumbbell floor press', cue: 'Keep elbows slightly tucked; pause gently on floor before pressing.', alternative: 'Incline push-up on a stable counter' },
    pull: { name: 'One-arm dumbbell row', cue: 'Support yourself on a stable surface; pull elbow toward hip.', alternative: 'Seated band row with band around feet' },
    vertical: { name: 'Chest-supported dumbbell row', cue: 'Support your chest on a stable bench and pull elbows back.', alternative: 'One-arm dumbbell row' },
    shoulder: { name: 'Dumbbell shoulder press', cue: 'Keep ribs down; press through a comfortable shoulder range.', alternative: 'Incline push-up' },
    core: { name: 'Bird dog', cue: 'Keep hips level; reach opposite arm and leg slowly.', alternative: 'Dead bug' },
    calf: { name: 'Standing calf raise', cue: 'Use wall for balance; pause at the top and lower slowly.', alternative: 'Seated calf raise' },
  },
  minimal: {
    squat: { name: 'Bodyweight squat', cue: 'Sit hips back and down; use a comfortable range.', alternative: 'Sit-to-stand from a stable chair' },
    hinge: { name: 'Glute bridge', cue: 'Feet flat; squeeze glutes without arching your lower back.', alternative: 'Bodyweight hip hinge' },
    push: { name: 'Wall or incline push-up', cue: 'Use a fixed stable surface; keep body aligned; lower slowly.', alternative: 'Knee push-up' },
    pull: { name: 'Prone W raise', cue: 'Lie face down; gently draw shoulder blades together; no neck strain. Limited pulling load without equipment.', alternative: 'Self-resisted row' },
    vertical: { name: 'Prone lat sweep', cue: 'Lie face down; sweep arms toward hips with control in a pain-free range.', alternative: 'Prone W raise' },
    shoulder: { name: 'Wall slide', cue: 'Slide arms upward against a wall without shrugging or arching.', alternative: 'Wall push-up' },
    core: { name: 'Dead bug', cue: 'Keep back supported; move opposite arm and leg without arching.', alternative: 'Bird dog' },
    calf: { name: 'Standing calf raise', cue: 'Hold wall for balance; rise slowly and lower under control.', alternative: 'Seated calf raise' },
  },
};

const full: Pattern[] = ['squat','hinge','push','pull','core'];
const upper: Pattern[] = ['push','pull','vertical','shoulder','core'];
const lower: Pattern[] = ['squat','hinge','calf','core'];
const layouts: Record<number, { days: number[]; focuses: string[]; patterns: Pattern[][] }> = {
  2: { days: [0,3], focuses: ['Full body A','Full body B'], patterns: [full, ['hinge','squat','pull','push','core']] },
  3: { days: [0,2,4], focuses: ['Full body A','Full body B','Full body C'], patterns: [full,['hinge','push','pull','squat','core'],['squat','pull','hinge','push','calf']] },
  4: { days: [0,1,3,5], focuses: ['Upper A','Lower A','Upper B','Lower B'], patterns: [upper,lower,['pull','push','vertical','shoulder','core'],['hinge','squat','calf','core']] },
  5: { days: [0,1,3,4,5], focuses: ['Upper A','Lower A','Push & core','Pull & core','Lower B'], patterns: [upper,lower,['push','shoulder','core'],['pull','vertical','core'],['hinge','squat','calf','core']] },
  6: { days: [0,1,2,4,5,6], focuses: ['Push A','Pull A','Lower A','Push B','Pull B','Lower B'], patterns: [['push','shoulder','core'],['pull','vertical','core'],lower,['push','shoulder','core'],['pull','vertical','core'],['hinge','squat','calf','core']] },
};
export const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export function trainingMinutes(exercises: Exercise[]): number {
  return Math.ceil(7 + exercises.reduce((sum, ex) => sum + ex.sets * (45 + Number.parseInt(ex.rest || '90', 10)), 0) / 60);
}
export function buildTraining(inputs: UserInputs): TrainingWeek[] {
  const count = Math.max(2, Math.min(6, Math.round(inputs.workoutFrequency)));
  const layout = layouts[count];
  const beginner = inputs.experience !== 'experienced';
  const budget = inputs.sessionMinutes ?? 45;
  const phases = [
    { weekRange: 'Weeks 1-2', phase: 'Foundation', sets: beginner ? 2 : 3, rpe: '6-7', volumeChange: 'Learn each movement; leave 3-4 repetitions in reserve.' },
    { weekRange: 'Weeks 3-4', phase: 'Build', sets: beginner ? 2 : 3, rpe: '7-8', volumeChange: 'Add reps before increasing load; only progress when technique is consistent.' },
    { weekRange: 'Weeks 5-6', phase: 'Progress', sets: beginner ? 3 : 4, rpe: '7-8', volumeChange: 'Add a set where time and recovery allow; avoid training to failure.' },
    { weekRange: 'Weeks 7-8', phase: 'Consolidate', sets: beginner ? 1 : 2, rpe: '5-6', volumeChange: 'Reduce sets and effort; review results and prepare the next cycle.', deload: true },
  ];
  return phases.map(p => ({
    weekRange: p.weekRange, phase: p.phase, deload: p.deload, volumeChange: p.volumeChange,
    intensityGuideline: 'RPE ' + p.rpe + ' (stop before form breaks). If sore or unusually fatigued, reduce load or sets.',
    days: layout.days.map((day, i) => {
      const exercises: Exercise[] = layout.patterns[i].map((pattern) => {
        const move = catalog[inputs.equipmentAccess][pattern];
        const accessory = pattern === 'core' || pattern === 'calf';
        const reps = pattern === 'core' ? '6-10 each side' : pattern === 'calf' ? '10-15' : inputs.equipmentAccess === 'minimal' ? '8-15' : inputs.goal === 'lean-muscle' && !beginner ? '8-12' : '8-12';
        return { name: move.name, sets: Math.max(1, p.sets - (accessory && p.sets > 2 ? 1 : 0)), reps, rpe: p.rpe, rest: accessory ? '60s' : '90s', notes: move.cue, alternative: move.alternative };
      });
      while (trainingMinutes(exercises) > budget && exercises.some(ex => ex.sets > 1)) {
        const max = Math.max(...exercises.map(ex => ex.sets));
        const idx = exercises.map(ex => ex.sets).lastIndexOf(max);
        exercises[idx] = { ...exercises[idx], sets: exercises[idx].sets - 1 };
      }
      return { day: weekdays[day], focus: layout.focuses[i], exercises };
    }),
  }));
}
