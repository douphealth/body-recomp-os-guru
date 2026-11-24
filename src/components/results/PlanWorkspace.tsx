import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Dumbbell, Download, Flame, HeartPulse, ShieldCheck, Timer, Utensils } from 'lucide-react';
import type { PlanResults, UserInputs } from '@/lib/calculations';
import { trainingMinutes, weekdays } from '@/lib/training-engine';
import { emptyJournal, isRemembered, loadJournal, rememberPlan, storeJournal, type Journal, type SetEntry, type CheckIn } from '@/lib/plan-storage';
import './coach.css';

const defaultSet: SetEntry = {count:0,reps:'',load:''};
const defaultReview: CheckIn = {energy:'okay',sleep:'',note:''};
const evidence = [
  ['ACSM 2026 resistance training position stand','https://doi.org/10.1249/MSS.0000000000003897'],
  ['CDC adult activity guidelines','https://www.cdc.gov/physical-activity-basics/guidelines/adults.html'],
  ['Morton et al. protein meta-analysis','https://pubmed.ncbi.nlm.nih.gov/28698222/'],
  ['Mifflin-St Jeor energy equation','https://pubmed.ncbi.nlm.nih.gov/2305711/'],
];
function useRestTimer(){
  const [deadline,setDeadline]=useState<number|null>(null);
  const [seconds,setSeconds]=useState(0);
  useEffect(()=>{
    if(deadline===null)return;
    const tick=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setSeconds(left);if(left===0)setDeadline(null);};
    tick(); const id=window.setInterval(tick,250);
    return ()=>window.clearInterval(id);
  },[deadline]);
  return {seconds, active:deadline!==null,start:(n:number)=>{setSeconds(n);setDeadline(Date.now()+n*1000);},stop:()=>{setDeadline(null);setSeconds(0);}};
}

export default function PlanWorkspace({plan,inputs}:{plan:PlanResults;inputs:UserInputs}){
  const [journal,setJournal]=useState<Journal>(()=>loadJournal(inputs));
  const [remember,setRemember]=useState(()=>isRemembered(inputs));
  const [storageError,setStorageError]=useState(false);
  const [week,setWeek]=useState(1);
  const [dayIndex,setDayIndex]=useState(0);
  const [confirmReset,setConfirmReset]=useState(false);
  const timer=useRestTimer();
  const phase=plan.trainingPlan[Math.floor((week-1)/2)];
  const session=phase.days[dayIndex] ?? phase.days[0];
  const sessionId=week+':'+session.day;
  const keyFor=(i:number)=>sessionId+':'+i;
  const completedCount=Array.from({length:8},(_,i)=>plan.trainingPlan[Math.floor(i/2)].days.filter(d=>journal.completed[(i+1)+':'+d.day]).length).reduce((a,b)=>a+b,0);
  const total=plan.trainingPlan.reduce((sum,p)=>sum+p.days.length*2,0);
  const weeklyCompleted=phase.days.filter(d=>journal.completed[week+':'+d.day]).length;
  const totalSets=session.exercises.reduce((n,e)=>n+e.sets,0);
  const doneSets=session.exercises.reduce((n,e,i)=>n+Math.min(e.sets,Math.max(0,Number(journal.sets[keyFor(i)]?.count)||0)),0);
  const review=journal.reviews[String(week)]??defaultReview;

  useEffect(()=>{setStorageError(!storeJournal(inputs,journal,remember));},[inputs,journal,remember]);
  const selectWeek=(w:number)=>{setWeek(w);setDayIndex(0);timer.stop();};
  const updateSet=(index:number,patch:Partial<SetEntry>)=>{
    const key=keyFor(index),target=session.exercises[index].sets;
    setJournal(prev=>{
      const entry={...(prev.sets[key]??defaultSet),...patch};
      entry.count=Math.min(target,Math.max(0,Math.round(Number(entry.count)||0)));
      return {...prev,sets:{...prev.sets,[key]:entry},completed:entry.count<target?{...prev.completed,[sessionId]:false}:prev.completed};
    });
  };
  const changeReview=(patch:Partial<CheckIn>)=>setJournal(prev=>({...prev,reviews:{...prev.reviews,[String(week)]:{...(prev.reviews[String(week)]??defaultReview),...patch}}}));
  const toggleRemember=()=>{
    const next=!remember;
    if(rememberPlan(inputs,journal,next)){setRemember(next);setStorageError(false);}else setStorageError(true);
  };
  const exportJournal=()=>{
    const payload=JSON.stringify({schema:1,profile:inputs,journal},null,2);
    const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='gearuptofit-fitness-journal.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const allDone=doneSets===totalSets;
  const minutes=trainingMinutes(session.exercises);
  return <section className="coach" aria-label="Your fitness workspace">
    <div className="coach-hero">
      <div className="coach-hero-content">
        <p className="coach-kicker"><span className="coach-dot"/> YOUR PERSONAL WORKSPACE · 8 WEEKS</p>
        <h2>Build momentum.<br/><span>One session at a time.</span></h2>
        <p>{plan.goalLabel} · {inputs.equipmentAccess==='gym'?'Gym':inputs.equipmentAccess==='home'?'Home gym':'Bodyweight'} · {phase.days.length} sessions/week · {inputs.sessionMinutes??45} min budget</p>
        <div className="coach-progress-label"><span>Program completion</span><strong>{completedCount} / {total} sessions</strong></div>
        <progress aria-label="Completed program sessions" value={completedCount} max={total}/>
        <Link className="coach-textlink" to="/build-my-plan">Edit plan preferences <ArrowRight size={15}/></Link>
      </div>
      <div className="coach-week-badge"><span>WEEK</span><strong>{String(week).padStart(2,'0')}</strong><small>OF 08</small></div>
    </div>
    <div className="coach-metrics">
      <div><Flame/><span>Starting energy</span><strong>{plan.calorieTarget.toLocaleString()} <small>kcal</small></strong><p>Daily estimate, not a measured need</p></div>
      <div><Utensils/><span>Protein</span><strong>{plan.proteinGrams} <small>g</small></strong><p>{plan.carbGrams}g carbs · {plan.fatGrams}g fat</p></div>
      <div><Dumbbell/><span>This week</span><strong>{weeklyCompleted}/{phase.days.length} <small>done</small></strong><p>{phase.phase} · consistent effort</p></div>
    </div>
    <div className="coach-section">
      <div className="coach-heading"><div><p className="coach-kicker">01 / TRAINING</p><h3>Your weekly plan</h3></div><CalendarDays aria-hidden="true"/></div>
      <div className="coach-weeks" aria-label="Select program week">{Array.from({length:8},(_,i)=><button type="button" key={i} aria-pressed={week===i+1} onClick={()=>selectWeek(i+1)}><small>W</small>{i+1}</button>)}</div>
      <p className="coach-muted">{phase.phase} — {phase.volumeChange}</p>
      <div className="coach-calendar" aria-label="Weekly training schedule">{weekdays.map((day)=>{
        const index=phase.days.findIndex(d=>d.day===day),isTraining=index!==-1,done=!!journal.completed[week+':'+day];
        return <button type="button" key={day} disabled={!isTraining} aria-pressed={isTraining&&session.day===day} onClick={()=>{setDayIndex(index);timer.stop();}} className={done?'coach-done':''}><small>{day.slice(0,3)}</small><span>{done?<Check size={17}/>:isTraining?<Dumbbell size={17}/>:<HeartPulse size={17}/>}</span><span>{isTraining?phase.days[index].focus:'Recovery'}</span></button>;
      })}</div>
      <div className="coach-session-head"><div><p className="coach-kicker">WEEK {week} / {session.day.toUpperCase()}</p><h3>{session.focus}</h3><p className="coach-muted">{session.exercises.length} movements · {totalSets} working sets · approx. {minutes} min</p></div><div className="coach-count">{doneSets}/{totalSets}<small>SETS</small></div></div>
      <progress aria-label="Sets completed in selected workout" value={doneSets} max={totalSets}/>
      <div className="coach-instruction"><Activity size={19}/><div><strong>Warm-up · 5–7 min</strong><p>Easy movement and lighter practice sets. Start with a comfortable load; stop for sharp pain, dizziness or unusual breathlessness. RPE 6–7 means about 3–4 reps left.</p></div></div>
      <div className="coach-timer"><Timer size={18}/><span>Rest timer</span><strong role="timer">{Math.floor(timer.seconds/60)}:{String(timer.seconds%60).padStart(2,'0')}</strong>{timer.active?<button onClick={timer.stop}>Stop</button>:<span className="coach-muted">Start from an exercise</span>}</div>
      <div className="coach-exercises">{session.exercises.map((ex,i)=>{
        const entry=journal.sets[keyFor(i)]??defaultSet, count=Math.min(ex.sets,Number(entry.count)||0);
        return <article key={keyFor(i)} className={'coach-exercise'+(count>=ex.sets?' coach-exercise-complete':'')}>
          <div className="coach-ex-title"><span className="coach-number">{String(i+1).padStart(2,'0')}</span><div><h4>{ex.name}</h4><p>{ex.sets} sets × {ex.reps} · RPE {ex.rpe} · {ex.rest} rest</p></div>{count>=ex.sets&&<Check size={19}/>}</div>
          <details><summary>Technique & alternative <ChevronDown size={15}/></summary><p>{ex.notes}</p>{ex.alternative&&<p><strong>Swap:</strong> {ex.alternative} if more comfortable; match effort, not weight.</p>}</details>
          <div className="coach-set-row">
            <div className="coach-set-buttons" aria-label={'Completed sets for '+ex.name}>{Array.from({length:ex.sets},(_,j)=><button key={j} aria-label={'Set '+(j+1)+' of '+ex.name} aria-pressed={j<count} onClick={()=>{updateSet(i,{count:j===count-1?j:j+1});if(j>=count)timer.start(Number.parseInt(ex.rest??'90',10));}}>{j<count?<Check size={16}/>:j+1}</button>)}</div>
            <button className="coach-outline" onClick={()=>timer.start(Number.parseInt(ex.rest??'90',10))}><Clock3 size={14}/> Rest</button>
          </div>
          <div className="coach-logfields"><label>Last set reps<input value={entry.reps} maxLength={20} inputMode="text" placeholder="e.g. 10 / side" onChange={e=>updateSet(i,{reps:e.target.value})}/></label><label>Load (kg or note)<input value={entry.load} maxLength={24} placeholder="e.g. 12 or bodyweight" onChange={e=>updateSet(i,{load:e.target.value})}/></label></div>
        </article>;
      })}</div>
      <div className="coach-instruction"><HeartPulse size={19}/><div><strong>Cool-down · easy movement</strong><p>Take a few minutes to recover. If all sets felt controlled for two sessions, add reps within the range, then the smallest available load. Do not force progression when recovery is poor.</p></div></div>
      <button className="coach-primary" disabled={!allDone&&!journal.completed[sessionId]} onClick={()=>setJournal(prev=>({...prev,completed:{...prev.completed,[sessionId]:!prev.completed[sessionId]}}))}>{journal.completed[sessionId]?'Undo session completion':allDone?'Mark workout complete':'Log all prescribed sets to complete'} {journal.completed[sessionId]?<Check size={18}/>:<ArrowRight size={18}/>}</button>
    </div>
    <div className="coach-section">
      <div className="coach-heading"><div><p className="coach-kicker">02 / RECOVERY & NUTRITION</p><h3>Make the rest of the week count.</h3></div><HeartPulse aria-hidden="true"/></div>
      <div className="coach-two"><article><h4>Aerobic activity</h4><p>{plan.cardioPlan.sessionsPerWeek} sessions · {plan.cardioPlan.duration}</p><p>{plan.cardioPlan.intensity}</p><p>{plan.cardioPlan.notes}</p>{plan.cardioPlan.runningPlan&&<p>{plan.cardioPlan.runningPlan}</p>}</article><article><h4>Daily nutrition</h4><p>Use the detailed nutrition tab for meal ideas and exact macro allocations. Targets are starting estimates.</p><p>Choose protein-rich foods, vegetables or fruit, carbohydrate sources and unsaturated fats as appropriate to your preferences. Adjust portions using food labels.</p><p>Regular sleep, fluids according to thirst and activity, and manageable movement are more important than perfect adherence.</p></article></div>
      <h4 className="coach-check-title">Week {week} check-in</h4>
      <div className="coach-logfields"><label>Energy<select value={review.energy} onChange={e=>changeReview({energy:e.target.value as CheckIn['energy']})}><option value="good">Good</option><option value="okay">Manageable</option><option value="low">Low / unusually tired</option></select></label><label>Average sleep (hours)<input type="number" min="0" max="24" step=".5" value={review.sleep} onChange={e=>changeReview({sleep:e.target.value})}/></label></div>
      <label className="coach-notes">What went well? What needs changing?<textarea maxLength={500} value={review.note} placeholder="Optional private note" onChange={e=>changeReview({note:e.target.value})}/></label>
      <p className="coach-advice" aria-live="polite">{review.energy==='low'||(review.sleep!==''&&Number(review.sleep)<6)?'Recovery first: keep intensity easy, consider reducing sets or taking a rest day. If fatigue persists, seek professional advice before changing calorie intake.':weeklyCompleted<phase.days.length?'Focus on the next manageable session. Do not try to cram missed sessions into one day.':'You completed the scheduled sessions. Review technique, recovery and consistency before adding load.'}</p>
    </div>
    <div className="coach-section coach-privacy">
      <div className="coach-heading"><div><p className="coach-kicker">03 / YOUR DATA</p><h3>Keep your progress yours.</h3></div><ShieldCheck aria-hidden="true"/></div>
      <p>Journal entries stay in this browser session unless you choose to remember them on this device. No account or cloud sync. Exports contain your profile and private notes; share only with people you trust.</p>
      <div className="coach-actions"><button className="coach-outline" aria-pressed={remember} onClick={toggleRemember}>{remember?'Forget saved plan on this device':'Remember plan on this device'}</button><button className="coach-outline" onClick={exportJournal}><Download size={15}/> Export journal</button><button className="coach-outline" onClick={()=>setConfirmReset(!confirmReset)}>Reset journal</button></div>
      {confirmReset&&<div role="alert" className="coach-reset"><p>Delete this plan’s workout and check-in history?</p><button className="coach-outline" onClick={()=>{setJournal(emptyJournal());setConfirmReset(false);}}>Delete journal</button><button className="coach-outline" onClick={()=>setConfirmReset(false)}>Cancel</button></div>}
      {storageError&&<p role="alert">Browser storage is unavailable or full. Your changes may not survive reload. Export your journal before leaving.</p>}
      <details><summary>Evidence and limitations <ChevronDown size={15}/></summary><p>This is a general healthy-adult program, not a medical prescription. Energy estimates, volume and session timing are planning heuristics. No clinical or professional review is claimed. If pregnant, under 18, recovering from injury or experiencing new symptoms, seek appropriate individualized guidance.</p>{evidence.map(([label,url])=><p key={url}><a href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a></p>)}</details>
    </div>
  </section>;
}
