import { describe, it, expect } from 'vitest';
import { calculatePlan, type UserInputs } from '../lib/calculations';
import { trainingMinutes } from '../lib/training-engine';
const profile: UserInputs = { age:35, sex:'male', heightCm:180, weightKg:80, bodyFatPercent:20, goal:'recomp', workoutFrequency:3, stepCount:7000, dietStyle:'standard', equipmentAccess:'gym', runningInterest:false };
describe('fitness plan invariants', () => {
  it('uses the Mifflin formula and reconciles meal targets', () => {
    const p=calculatePlan(profile);
    expect(p.bmr).toBe(1755);
    expect(p.proteinPercent+p.carbPercent+p.fatPercent).toBe(100);
    expect(p.calorieTarget).toBe(4*p.proteinGrams+4*p.carbGrams+9*p.fatGrams);
    expect(p.mealTiming.reduce((s,m)=>s+m.calories,0)).toBe(p.calorieTarget);
    expect(p.mealTiming.reduce((s,m)=>s+m.protein,0)).toBe(p.proteinGrams);
  });
  it('honors all supported schedules, equipment and time limits', () => {
    for (const equipmentAccess of ['gym','home','minimal'] as const) for (const sessionMinutes of [20,30,45,60] as const) for(let workoutFrequency=2;workoutFrequency<=7;workoutFrequency++) {
      const p=calculatePlan({...profile,equipmentAccess,sessionMinutes,workoutFrequency});
      for(const phase of p.trainingPlan){
        expect(phase.days.length).toBe(Math.min(workoutFrequency,6));
        expect(new Set(phase.days.map(d=>d.day)).size).toBe(phase.days.length);
        for(const day of phase.days) {
          expect(day.exercises.length).toBeGreaterThan(0);
          expect(trainingMinutes(day.exercises)).toBeLessThanOrEqual(sessionMinutes);
          if(equipmentAccess==='minimal') expect(day.exercises.map(e=>e.name).join(' ')).not.toMatch(/dumbbell|barbell|cable|band|machine/i);
        }
      }
      expect(p.trainingPlan[0].days[0].exercises[0].rpe).not.toBe(p.trainingPlan[3].days[0].exercises[0].rpe);
    }
  });
  it('rejects minors and malformed profiles', () => {
    expect(()=>calculatePlan({...profile,age:16})).toThrow();
    expect(()=>calculatePlan({...profile,weightKg:NaN})).toThrow();
  });
  it('does not prescribe a deficit to an underweight adult', () => {
    const p=calculatePlan({...profile,weightKg:53,goal:'fat-loss'});
    expect(Math.abs(p.calorieTarget-p.tdee)).toBeLessThanOrEqual(4);
    expect(p.quickSummary).toContain('not appropriate');
  });
  it('reconciles macros for all preferences and goals', () => {
    for(const dietStyle of ['standard','high-protein','vegetarian','keto'] as const) for(const goal of ['fat-loss','lean-muscle','recomp'] as const){
      const p=calculatePlan({...profile,dietStyle,goal});
      expect(p.calorieTarget).toBe(4*p.proteinGrams+4*p.carbGrams+9*p.fatGrams);
      expect(p.mealTiming.reduce((s,m)=>s+m.calories,0)).toBe(p.calorieTarget);
      expect(p.fatGrams).toBeGreaterThan(0);
    }
  });
});
