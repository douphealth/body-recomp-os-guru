import {useState,useEffect} from 'react';
import {useNavigate,useLocation,Link} from 'react-router-dom';
import {LayoutDashboard,Dumbbell,Utensils,HeartPulse,BarChart3,BookOpen} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PrintButton from '@/components/results/PrintButton';
import PlanWorkspace from '@/components/results/PlanWorkspace';
import {ProgramOverview,NutritionStudio,EvidenceStudio} from '@/components/results/ProgramStudio';
import {calculatePlan,type UserInputs,type PlanResults} from '@/lib/calculations';
import {loadProfile,profileKey,loadJournal,emptyJournal,type Journal} from '@/lib/plan-storage';
import {trackResultView} from '@/lib/tracking';
import logo from '@/assets/logo.png';
type View='overview'|'training'|'nutrition'|'recovery'|'progress'|'evidence';
const nav=[{id:'overview',title:'Overview',icon:LayoutDashboard},{id:'training',title:'Workouts',icon:Dumbbell},{id:'nutrition',title:'Nutrition',icon:Utensils},{id:'recovery',title:'Recovery',icon:HeartPulse},{id:'progress',title:'Progress',icon:BarChart3},{id:'evidence',title:'Evidence',icon:BookOpen}] as const;
export default function Results(){
 const [plan,setPlan]=useState<PlanResults|null>(null),[inputs,setInputs]=useState<UserInputs|null>(null),[view,setView]=useState<View>('overview'),[week,setWeek]=useState(1),[journal,setJournal]=useState<Journal>(emptyJournal);
 const navigate=useNavigate(),location=useLocation();
 useEffect(()=>{const p=location.state?.inputs??loadProfile();if(!p){navigate('/build-my-plan',{replace:true});return;}try{setPlan(calculatePlan(p));setInputs(p);setJournal(loadJournal(p));trackResultView(p.goal);}catch{navigate('/build-my-plan',{replace:true});}},[navigate,location.state]);
 const change=(v:View)=>{setView(v);if(inputs)setJournal(loadJournal(inputs));};
 if(!plan||!inputs)return <main className="container py-12"><p>Opening your plan...</p><Link to="/build-my-plan">Build or reopen a plan</Link></main>;
 const coachView=view==='recovery'?'recovery':view==='progress'?'progress':'training';
 return <div className="min-h-screen flex flex-col"><SEOHead title="Your private fitness plan | GearUpToFit" description="Your personal workout, nutrition and recovery program." path="/build-my-plan/results" noindex/><Header/><main className="flex-1"><div className="studio">
  <header className="studio-header"><div><div className="studio-brand"><img src={logo} alt="GearUpToFit" width={36} height={36}/><span className="studio-eyebrow">YOUR PERSONAL FITNESS OS</span></div><h1>{plan.goalLabel}<br/>Your 8-week program.</h1><p>{inputs.workoutFrequency} strength days/week · {inputs.sessionMinutes??45} min per strength session · {inputs.equipmentAccess==='gym'?'Gym':inputs.equipmentAccess==='home'?'Home gym':'Bodyweight'} · {inputs.experience==='experienced'?'Experienced':'Beginner / returning'}</p></div><div className="studio-header-actions"><PrintButton plan={plan} inputs={inputs}/><Link to="/build-my-plan">Edit plan preferences</Link></div></header>
  <div className="studio-shell"><nav className="studio-nav" aria-label="Fitness program sections">{nav.map(n=><button key={n.id} aria-current={view===n.id?'page':undefined} onClick={()=>change(n.id)}><n.icon/>{n.title}</button>)}</nav><div className="studio-content">
   {view==='overview'&&<ProgramOverview plan={plan} inputs={inputs} week={week} setWeek={setWeek} journal={journal} openTraining={()=>change('training')} openRecovery={()=>change('recovery')}/>}
   {view==='nutrition'&&<NutritionStudio plan={plan} inputs={inputs}/>}
   {view==='evidence'&&<EvidenceStudio plan={plan} inputs={inputs}/>}
   <div hidden={!['training','recovery','progress'].includes(view)}><PlanWorkspace key={profileKey(inputs)} plan={plan} inputs={inputs} view={coachView} week={week} setWeek={setWeek} onJournalChange={setJournal}/></div>
  </div></div></div></main><Footer/></div>;
}
