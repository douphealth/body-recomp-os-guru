import { validateInputs, type UserInputs } from './calculations';

const PROFILE = 'recomp-inputs';
const SAVED = 'recomp-saved-profile-v1';
const JOURNAL = 'recomp-journal-v1';
const LOCAL_JOURNAL = 'recomp-saved-journal-v1';

function read(storage: Storage, key: string): string | null {
  try { return storage.getItem(key); } catch { return null; }
}
function write(storage: Storage, key: string, value: string | null): boolean {
  try { if (value === null) storage.removeItem(key); else storage.setItem(key,value); return true; } catch { return false; }
}
function profile(raw: string | null): UserInputs | null {
  try {
    if (!raw) return null;
    const p = JSON.parse(raw) as UserInputs;
    validateInputs(p);
    return {...p, workoutFrequency:Math.min(6,p.workoutFrequency),experience:p.experience ?? 'beginner',sessionMinutes:p.sessionMinutes ?? 45};
  } catch { return null; }
}
export function loadProfile(): UserInputs | null {
  return profile(read(sessionStorage,PROFILE)) ?? profile(read(localStorage,SAVED));
}
export function profileKey(p: UserInputs): string {
  return JSON.stringify([p.age,p.sex,p.heightCm,p.weightKg,p.bodyFatPercent,p.goal,Math.min(6,p.workoutFrequency),p.stepCount,p.dietStyle,p.equipmentAccess,p.runningInterest,p.experience ?? 'beginner',p.sessionMinutes ?? 45]);
}
export function isRemembered(p: UserInputs): boolean {
  const saved=profile(read(localStorage,SAVED));
  return !!saved && profileKey(saved)===profileKey(p);
}
export function storeProfile(p: UserInputs): boolean {
  return write(sessionStorage,PROFILE,JSON.stringify(p));
}
export type SetEntry = { count: number; reps: string; load: string };
export type CheckIn = { energy: 'good'|'okay'|'low'; sleep: string; note: string };
export type Journal = { sets: Record<string,SetEntry>; completed: Record<string,boolean>; reviews: Record<string,CheckIn> };
export const emptyJournal=():Journal=>({sets:{},completed:{},reviews:{}});
export function loadJournal(p: UserInputs): Journal {
  for (const [storage,key] of [[sessionStorage,JOURNAL],[localStorage,LOCAL_JOURNAL]] as const) {
    try {
      const raw=read(storage,key);
      if (!raw) continue;
      const data=JSON.parse(raw);
      if (data.key===profileKey(p) && data.journal && typeof data.journal.sets==='object' && data.journal.sets && typeof data.journal.completed==='object' && data.journal.completed && typeof data.journal.reviews==='object' && data.journal.reviews) return data.journal;
    } catch { /* malformed or unavailable storage */ }
  }
  return emptyJournal();
}
export function storeJournal(p: UserInputs,journal:Journal,remember:boolean): boolean {
  const value=JSON.stringify({key:profileKey(p),journal});
  const session=write(sessionStorage,JOURNAL,value);
  return remember ? write(localStorage,LOCAL_JOURNAL,value) && session : session;
}
export function rememberPlan(p:UserInputs,journal:Journal,remember:boolean):boolean {
  if (remember) {
    const ok=write(localStorage,SAVED,JSON.stringify(p));
    const saved=ok && write(localStorage,LOCAL_JOURNAL,JSON.stringify({key:profileKey(p),journal}));
    if(!saved){write(localStorage,SAVED,null);write(localStorage,LOCAL_JOURNAL,null);}
    return saved;
  }
  const a=write(localStorage,SAVED,null), b=write(localStorage,LOCAL_JOURNAL,null);
  return a && b;
}
