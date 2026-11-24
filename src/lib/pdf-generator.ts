import jsPDF from 'jspdf';
import logoUrl from '@/assets/logo.png';
import { usefulResources } from './fitness-resources';
import type { PlanResults, UserInputs } from './calculations';
import { getProgramWeek, getWeekSessionMinutes, progressionRules, effortGuide, referenceLinks } from './program-guide';
import { trainingMinutes } from './training-engine';
import { getWeeklyMenu, shoppingList, menuNote } from './weekly-menu';

type RGB=[number,number,number];
const ink:RGB=[24,47,40], dark:RGB=[14,35,29], green:RGB=[39,89,66], lime:RGB=[197,239,129], muted:RGB=[75,99,90], paper:RGB=[246,249,245], line:RGB=[212,226,218], white:RGB=[255,255,255], amber:RGB=[120,83,30];
const M=16,W=178,H=297,BOTTOM=274;
const clean=(s:unknown)=>String(s??'').replace(/[\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u00d7/g,'x').replace(/\u2022/g,' / ').replace(/[^\x20-\x7E\n]/g,'').trim();
const fmt=(n:number)=>Math.round(n).toLocaleString('en-US');
const diff=(n:number)=>(n>0?'+':'')+n;
const dietLabel=(d:UserInputs['dietStyle'])=>({standard:'Balanced',vegetarian:'Vegetarian (eggs and dairy)',keto:'Low-carbohydrate example', 'high-protein':'Higher protein'}[d]);
const equipmentLabel=(e:UserInputs['equipmentAccess'])=>({gym:'Full gym',home:'Home gym',minimal:'Bodyweight'}[e]);
class Book {
 readonly doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 y=35;
 runningTitle='';
 runningLabel='';
 constructor(){this.doc.setProperties({title:'GearUpToFit - Personal Fitness Workbook',subject:'Private eight-week fitness program',author:'GearUpToFit',creator:'GearUpToFit Fitness Plan OS'});}
 fill(c:RGB){this.doc.setFillColor(...c);}
 color(c:RGB){this.doc.setTextColor(...c);}
 rect(x:number,y:number,w:number,h:number,c:RGB){this.fill(c);this.doc.roundedRect(x,y,w,h,2,2,'F');}
 text(s:unknown,x:number,y:number,size=10,bold=false,c:RGB=ink,align:'left'|'center'|'right'='left'){
  this.doc.setFont('helvetica',bold?'bold':'normal');this.doc.setFontSize(size);this.color(c);this.doc.text(clean(s),x,y,{align});
 }
 lines(s:unknown,width=W,size=10,bold=false):string[]{this.doc.setFont('helvetica',bold?'bold':'normal');this.doc.setFontSize(size);return this.doc.splitTextToSize(clean(s),width) as string[];}
 rule(y:number,x=M,w=W){this.doc.setDrawColor(...line);this.doc.setLineWidth(.25);this.doc.line(x,y,x+w,y);}
 page(label:string,title:string,subtitle?:string){
  this.doc.addPage();this.runningTitle=title;this.runningLabel=label;
  this.fill(dark);this.doc.rect(0,0,210,9,'F');
  this.text('GEARUPTOFIT  /  FITNESS PLAN OS',M,6.1,8,true,lime);
  this.text(label.toUpperCase(),194,6.1,8,true,white,'right');
  this.text(label.toUpperCase(),M,21,8,true,green);
  const ts=this.lines(title,W,22,true);
  ts.forEach((l,i)=>this.text(l,M,31+i*8,22,true));
  this.y=35+(ts.length-1)*8;
  if(subtitle)this.para(subtitle,10,muted,4);
  this.rule(this.y);this.y+=6;
 }
 ensure(h:number){if(this.y+h>BOTTOM)this.page(this.runningLabel,this.runningTitle+' / continued');}
 para(s:unknown,size=10,c:RGB=ink,after=3){const ls=this.lines(s,W,size);const lh=size*.43;this.ensure(ls.length*lh+after+2);ls.forEach((l,i)=>this.text(l,M,this.y+i*lh+size*.31,size,false,c));this.y+=ls.length*lh+after;}
 sub(s:string){this.ensure(13);this.text(s,M,this.y+4.5,12,true,green);this.y+=9;}
 callout(title:string,body:string){const ls=this.lines(body,W-12,10);const h=14+ls.length*4.3;this.ensure(h+3);this.rect(M,this.y,W,h,paper);this.fill(green);this.doc.rect(M,this.y,1.7,h,'F');this.text(title,M+6,this.y+6,10,true,green);ls.forEach((l,i)=>this.text(l,M+6,this.y+11+i*4.3,10,false,ink));this.y+=h+4;}
 table(headers:string[],widths:number[],rows:(string|number)[][],size=9){
  const headerH=9;
  const head=()=>{this.rect(M,this.y,W,headerH,dark);let x=M;headers.forEach((h,i)=>{this.text(h,x+2.4,this.y+5.8,8,true,white);x+=widths[i];});this.y+=headerH;};
  this.ensure(headerH+15);head();
  rows.forEach((row,idx)=>{
   const ls=row.map((v,i)=>this.lines(v,widths[i]-4.8,size,false));
   const lh=size*.43, height=Math.max(9,Math.max(...ls.map(l=>l.length))*lh+5);
   if(this.y+height>BOTTOM){this.page(this.runningLabel,this.runningTitle+' / continued');head();}
   if(idx%2===0)this.rect(M,this.y,W,height,paper);
   let x=M;ls.forEach((ls,i)=>{const yy=this.y+(height-ls.length*lh)/2+size*.31;ls.forEach((l,j)=>this.text(l,x+2.4,yy+j*lh,size,false,i===0?ink:muted));x+=widths[i];});
   this.rule(this.y+height);this.y+=height;
  });this.y+=5;
 }
 check(s:string){this.ensure(12);const ls=this.lines(s,W-11,10);this.doc.setDrawColor(...green);this.doc.setLineWidth(.35);this.doc.rect(M,this.y+1,3.5,3.5);ls.forEach((l,i)=>this.text(l,M+8,this.y+4+i*4.3,10,false));this.y+=Math.max(8,ls.length*4.3+3);}
 blank(label:string){this.ensure(13);this.text(label,M,this.y+4,9,true,muted);this.rule(this.y+10);this.y+=13;}
 finish(){const count=this.doc.getNumberOfPages();for(let i=2;i<=count;i++){this.doc.setPage(i);this.rule(281);this.text('PRIVATE PERSONAL WORKBOOK  /  gearuptofit.com',M,287,8,false,muted);this.text(String(i).padStart(2,'0')+' / '+count,194,287,8,true,green,'right');}return this.doc;}
}

export function buildPlanPDF(plan:PlanResults,inputs:UserInputs,logoData?:string):jsPDF{
 const b=new Book(),d=b.doc;
 const menu=getWeeklyMenu(plan,inputs),weeks=Array.from({length:8},(_,i)=>getProgramWeek(plan,inputs,i+1));
 // Cover - no heavy photographic background, sharp vector typography, printer-friendly interiors.
 b.fill(dark);d.rect(0,0,210,H,'F');b.fill(green);d.rect(166,0,44,297,'F');b.fill(lime);d.rect(16,17,11,2,'F');
 b.text('GEARUPTOFIT / PERSONAL FITNESS OS',16,27,11,true,lime);
 if(logoData){const props=d.getImageProperties(logoData);const ratio=props.width/props.height;const w=Math.min(29,29*ratio),h=w/ratio;b.rect(174,15,30,30,white);d.addImage(logoData,props.fileType,189-w/2,30-h/2,w,h);}
 b.text('YOUR PERSONAL',16,55,11,true,white);
 b.text('8-week',16,76,45,true,white);b.text('fitness',16,94,45,true,white);b.text('workbook.',16,112,45,true,lime);
 const goals=b.lines(plan.goalLabel,142,21,true);goals.forEach((l,i)=>b.text(l,16,130+i*7.8,21,true,white));
 b.text('TRAIN  /  EAT  /  RECOVER  /  PROGRESS',16,147,9,true,lime);
 b.rect(16,158,178,44,[32,61,49]);
 const stats=[['DAILY ENERGY',fmt(plan.calorieTarget)+' kcal'],['PROTEIN',plan.proteinGrams+' g'],['STRENGTH DAYS',weeks[0].strengthCount+' / week']];
 stats.forEach(([label,value],i)=>{const x=22+i*58;b.text(label,x,169,8,true,lime);b.text(value,x,184,18,true,white);});
 b.text(equipmentLabel(inputs.equipmentAccess)+'  /  '+(inputs.experience==='experienced'?'Experienced':'Beginner / returning')+'  /  '+(inputs.sessionMinutes??45)+' min strength budget',16,213,10,false,white);
 b.text('Prepared '+new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),16,220,10,false,white);
 const coverText=b.lines('A practical, evidence-informed starting plan for healthy adults. Estimates are not a medical prescription. Use the workbook to log actual effort, build consistency and review recovery.',142,11);
 coverText.forEach((l,i)=>b.text(l,16,235+i*5,11,false,white));
 b.text('fitness-plan.gearuptofit.com',16,280,10,true,lime);
 // Onboarding / roadmap
 b.page('01 / Start here','Your program at a glance','Read this page before starting. Keep your personal workbook private.');
 b.callout('YOUR STARTING PLAN',plan.quickSummary);
 b.table(['Profile','Your selection'],[63,115],[['Goal',plan.goalLabel],['Age / body weight / height',inputs.age+' years / '+inputs.weightKg+' kg / '+inputs.heightCm+' cm'],['Training setup',equipmentLabel(inputs.equipmentAccess)+' / '+(inputs.sessionMinutes??45)+' min / '+weeks[0].strengthCount+' strength days'],['Diet preference',dietLabel(inputs.dietStyle)],['Current daily steps',fmt(inputs.stepCount)+' (reported activity, not a compulsory target)']],10);
 b.sub('Your eight-week roadmap');
 b.table(['Weeks','Phase','How to progress'],[22,37,119],plan.trainingPlan.map(p=>[p.weekRange.replace('Weeks ',''),p.phase,p.volumeChange??'']),10);
 b.sub('Eight-week training volume');
 const setTotals=weeks.map(w=>w.days.reduce((n,day)=>n+(day.strength?.exercises.reduce((s,e)=>s+e.sets,0)??0),0));
 b.ensure(40);const chartY=b.y,maxSets=Math.max(1,...setTotals),barW=14,gap=7;
 setTotals.forEach((n,i)=>{const x=M+6+i*(barW+gap),h=22*n/maxSets;b.rect(x,chartY+24-h,barW,h,i>=6?[143,191,174]:i>=4?lime:[127,178,102]);b.text(String(n),x+barW/2,chartY+21-h,8,true,green,'center');b.text('W'+(i+1),x+barW/2,chartY+30,8,false,muted,'center');});b.y+=37;b.para('Planned working sets by week. This chart is not a prediction of muscle or strength gains.',9,muted,3);
 b.sub('How to use this workbook');b.para('Use the weekly calendars to know when to train and recover. Use the workout pages for prescribed sets and your own reps/load notes. Repeat the example meal rotation or substitute foods. Record weekly energy, sleep and training consistency.');
 b.callout('IMPORTANT SAFETY LIMIT','Adults with medical restrictions, pregnancy, an eating disorder, new symptoms, or injuries need individualized advice. Seek urgent help for severe symptoms. If a movement causes sharp pain, stop; do not train through it.');
 // nutrition
 b.page('02 / Nutrition','Your daily nutrition targets','Starting estimates. Adjust based on actual recovery and longer-term trends, not a single weigh-in.');
 b.table(['Daily target','Amount','Meaning'],[50,33,95],[['Energy',fmt(plan.calorieTarget)+' kcal','Estimated starting intake'],['Maintenance',fmt(plan.tdee)+' kcal','Estimated daily expenditure'],['Protein',plan.proteinGrams+' g','Starting protein target'],['Carbohydrate',plan.carbGrams+' g','Carbohydrate allowance'],['Fat',plan.fatGrams+' g','Dietary fat allowance'],['Fiber',plan.fiberGrams+' g','Gradually increase as tolerated']],10);
 b.sub('Energy distribution');
 const macros=[['Protein',plan.proteinPercent,green],['Carbs',plan.carbPercent,[112,147,136] as RGB],['Fat',plan.fatPercent,[197,170,103] as RGB]] as const;
 let x=M;macros.forEach(([,p,c])=>{const w=W*p/100;b.fill(c);d.rect(x,b.y,w,6,'F');x+=w;});b.y+=11;
 macros.forEach(([name,p],i)=>b.text(name+' '+p+'%',M+i*59,b.y,9,true,muted));b.y+=9;
 b.sub('Example meal allocation (targets, not measured food)');
 b.table(['Meal','kcal','Protein','Carbs','Fat'],[62,29,29,29,29],plan.mealTiming.map(m=>[m.meal,m.calories,m.protein+' g',m.carbs+' g',m.fat+' g']),10);
 b.para('Use meals that suit your schedule. Food composition varies by brand and preparation; the rotation on the next pages uses rounded typical estimates. Actual intake may differ from targets.',10,muted);
 if(inputs.dietStyle==='keto')b.callout('LOW-CARBOHYDRATE PREFERENCE','This example cannot guarantee ketosis. Low-carb eating is optional and not appropriate for everyone; consult a clinician if taking diabetes medication or managing a relevant condition.');
 // seven full menu pages, compact meal tables and prep
 menu.forEach(day=>{
  b.page('02 / Nutrition rotation','Day '+day.day+' / meal plan','Repeat this seven-day rotation as useful; quantities are approximate edible, cooked or drained weights as specified.');
  b.table(['Daily estimate','kcal','Protein','Carbs','Fat'],[62,29,29,29,29],[['Target',plan.calorieTarget,plan.proteinGrams+' g',plan.carbGrams+' g',plan.fatGrams+' g'],['Example menu',day.totals.calories,day.totals.protein+' g',day.totals.carbs+' g',day.totals.fat+' g'],['Difference',diff(day.gap.calories),diff(day.gap.protein)+' g',diff(day.gap.carbs)+' g',diff(day.gap.fat)+' g']],9);
  day.meals.forEach((meal,i)=>{
   const ingredients=meal.items.map(it=>it.name+' '+it.grams+' g'+(it.prep?' ('+it.prep+')':'')).join(' / ');
   const il=b.lines(ingredients,W,10),pl=b.lines(meal.prep,W,9);
   b.ensure(20+il.length*4.3+pl.length*3.87);
   b.sub(['Breakfast','Lunch','Snack','Dinner'][i]+' / '+meal.name);
   b.para(ingredients,10,ink,2);
   b.para('Prepare: '+meal.prep,9,muted,2);
   b.para('Est. '+meal.totals.calories+' kcal | P '+meal.totals.protein+' g | C '+meal.totals.carbs+' g | F '+meal.totals.fat+' g',9,green,4);
  });
  b.para(menuNote(day,plan),9,muted);
 });
 b.page('02 / Nutrition rotation','Seven-day shopping list','Totals are from the example rotation; cooked and edible quantities are not equivalent to raw purchase weights.');
 b.table(['Food','Quantity','Weight basis'],[86,34,58],shoppingList(menu).map(i=>[i.name,fmt(i.grams)+' g',i.prep||'edible weight']),9);
 b.sub('Meal preparation');b.para('Batch-cook grains and legumes, prepare vegetables, and portion protein for a few days at a time. Refrigerate promptly and follow safe storage and cooking guidance. Substitute suitable foods for allergies and preferences. No supplement is required.');
 // workout guidance
 b.page('03 / Training','How to execute a workout','Train with technique, manageable effort and repeatable progression.');
 b.sub('Every strength session');['Warm up for 5-7 minutes: easy walking or cycling and a light practice set of the first movements.','Complete the assigned exercises in order. The prescribed sets are working sets; rest between sets as listed.','For unilateral exercises, complete the prescribed reps on each side. If needed, split sets or reduce reps while maintaining technique.','Cool down with a few minutes of easy movement. Hydrate according to thirst and exercise conditions.'].forEach(s=>b.check(s));
 b.sub('Understanding effort (RPE)');
 b.table(['Target','What it means'],[37,141],effortGuide.map(x=>[x[0],x[1]]),10);
 b.sub('Progression rules');progressionRules.forEach(s=>b.para(s,10,ink,3));
 b.callout('TIME BUDGET','Estimated strength duration includes a short warm-up and typical set/rest timing. Actual time may differ; do not rush technique or shorten necessary rests. Cardio minutes are listed separately.');
 // actual 8 weekly schedules
 weeks.forEach(w=>{
  b.page('04 / Weekly program','Week '+String(w.week).padStart(2,'0')+' / '+w.phase,w.guidance);
  b.table(['Day','Strength','Aerobic','Est. total'],[28,70,48,32],w.days.map(day=>[day.day,day.strength?day.strength.focus:'No strength',day.cardioMinutes?day.cardioMinutes+' min easy/moderate':day.strength?'Recovery as needed':'Rest / gentle movement',getWeekSessionMinutes(day)?getWeekSessionMinutes(day)+' min':'Rest']),9);
  b.callout('AEROBIC ACTIVITY / '+w.cardioMinutes+' MINUTES PLANNED',inputs.runningInterest?'Walk or use an easy run/walk progression if brisk walking is comfortable. Begin with short jogging intervals, walk to recover, and increase only if well tolerated.':'Choose brisk walking, cycling or another low-impact activity. Keep conversational effort. Build gradually toward public-health activity guidance; planned sessions do not include incidental walking.');
  b.sub('Weekly focus');w.habit.forEach(h=>b.check(h));
  b.sub('Weekly check-in');b.blank('Strength sessions completed: ____ / '+w.strengthCount+'    |    Aerobic minutes completed: ____');b.blank('Average sleep / energy:');b.blank('One change for next week:');
  // Print-ready sessions. The exact week number is repeated even when phases share a prescription.
  b.page('04 / Week '+w.week,'Week '+String(w.week).padStart(2,'0')+' / workout log','Write actual reps and load after each working set. Do not force progression when recovery is poor.');
  w.days.filter(day=>day.strength).forEach(day=>{
   const s=day.strength!;const rows=s.exercises.map(ex=>[ex.name,ex.sets+' x '+ex.reps,'RPE '+(ex.rpe??'6-8'),ex.rest??'90s','____________']);
   // Keep a session title and its table together unless an exceptionally long row requires pagination.
   b.ensure(22+rows.length*14);
   b.sub(day.day+' / '+s.focus+' / ~'+trainingMinutes(s.exercises)+' min');
   b.table(['Exercise','Sets x reps','Effort','Rest','Actual reps / kg'],[56,31,25,21,45],rows,9);
   b.blank('Session completed / notes:');
  });
 });
 // library shared across weeks (unique exercises)
 b.page('05 / Technique library','Exercise execution guide','Use a controlled range of motion and an equipment-appropriate alternative. Stop when an exercise is painful.');
 const exercises=new Map<string,PlanResults['trainingPlan'][number]['days'][number]['exercises'][number]>();
 plan.trainingPlan.forEach(p=>p.days.forEach(day=>day.exercises.forEach(e=>exercises.set(e.name,e))));
 exercises.forEach(e=>{const cue=e.notes??'Use controlled technique and a comfortable range of motion.';b.ensure(20+b.lines(cue,W,10).length*4.3);b.sub(e.name);b.para(cue);if(e.alternative)b.para('Alternative: '+e.alternative+'. Match effort rather than load.',9,muted);});
 // recovery and review
 b.page('06 / Recovery','Recover and review','Consistency is more important than perfection. Treat all targets as flexible starting points.');
 b.sub('Daily recovery checklist');plan.recoveryChecklist.forEach(s=>b.check(s));
 b.sub('Eight-week habit focus');b.table(['Week','Focus','Action'],[20,43,115],plan.habitPlan.map(w=>[w.week,w.focus,w.habits.join(' / ')]),9);
 b.page('06 / Review','Your progress summary','Record trends using similar conditions. You do not need to weigh yourself or take photos to use this plan.');
 b.table(['Week','Strength done','Cardio min','Sleep / energy','Notes'],[20,34,28,43,53],weeks.map(w=>[w.week,'___ / '+w.strengthCount,'________','____________','____________']),10);
 b.sub('End-of-cycle reflection');['Which exercises became easier or stronger?','Which schedule was sustainable?','How did energy and sleep change?','What will you keep, adjust or discuss with a professional?'].forEach(s=>b.blank(s));
 b.callout('NEXT CYCLE','If training is comfortable and recovery is good, repeat the cycle with gradually progressed loads or variations. If fatigue or pain persists, reduce training demands and seek individual advice.');
 // methodology & references
 b.page('07 / Evidence','Method and limitations','Evidence informs the general guidance; this specific algorithm and its eight-week schedule are not clinically validated.');
 plan.scienceNotes.forEach(note=>{b.sub(note.title);b.para(note.explanation,10);b.para(note.citation,8.5,muted);});
 b.sub('Primary references and further reading');
 referenceLinks.forEach(ref=>{const detail=b.lines(ref.detail,W,9);b.ensure(16+detail.length*4);b.text(ref.title,M,b.y+3.5,10,true,green);b.y+=6;b.para(ref.detail,9,muted,1);b.doc.setFont('helvetica','normal');b.doc.setFontSize(8);b.color(green);const url=clean(ref.url);b.doc.textWithLink(url,M,b.y+3,{url:ref.url});b.y+=8;});
 b.page('08 / GearUpToFit resources','Keep learning. Keep moving.','Selected resources from the GearUpToFit website. Educational reading, not a replacement for individualized professional guidance.');
 usefulResources(inputs).forEach(resource=>{b.ensure(27);b.sub(resource.title);b.para(resource.description,10,muted,2);b.doc.setFont('helvetica','normal');b.doc.setFontSize(8);b.color(green);b.doc.textWithLink(resource.url,M,b.y+3,{url:resource.url});b.y+=10;});
 b.callout('RETURN TO YOUR FREE PLANNER','Rebuild or reopen your plan at fitness-plan.gearuptofit.com. Your private plan is not included in public links.');
 const finished=b.finish();
 if(logoData){const props=finished.getImageProperties(logoData);const ratio=props.width/props.height;const w=Math.min(8,8*ratio),h=w/ratio;for(let i=2;i<=finished.getNumberOfPages();i++){finished.setPage(i);finished.addImage(logoData,props.fileType,3+(8-w)/2,282+(8-h)/2,w,h);}}
 return finished;
}
export async function generatePlanPDF(plan:PlanResults,inputs:UserInputs){const res=await fetch(logoUrl);if(!res.ok)throw new Error('Brand asset unavailable');const blob=await res.blob();const logoData=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);});const doc=buildPlanPDF(plan,inputs,logoData);doc.save('GearUpToFit-8-Week-'+clean(plan.goalLabel).replace(/\s+/g,'-')+'-Workbook.pdf');}
