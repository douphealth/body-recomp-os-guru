import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Dumbbell, HeartPulse, CalendarDays, ShieldCheck, Utensils, Activity } from 'lucide-react';
import { loadProfile } from '@/lib/plan-storage';
import { trackCTAClick } from '@/lib/tracking';
import heroImg from '@/assets/hero-gym.jpg';
import './fitness-home.css';

const days = [
  ['M','Full body A',true],['T','Recovery',false],['W','Full body B',true],
  ['T','Recovery',false],['F','Full body C',true],['S','Recovery',false],['S','Recovery',false],
] as const;

export default function FitnessHomeHero(){
  const saved=loadProfile();
  return <section className="fitness-home" aria-labelledby="fitness-home-title">
    <div className="fitness-home-shell">
      <div className="fitness-home-copy">
        <p className="fitness-eyebrow"><span/> GEARUPTOFIT / FITNESS PLAN OS</p>
        <h1 id="fitness-home-title">Your fitness.<br/>Your plan.<br/><em>Your progress.</em></h1>
        <p className="fitness-intro">A complete, free 8-week fitness program built around your goals, training experience, equipment and available time. Know what to do today, how to progress, and when to recover.</p>
        <div className="fitness-cta">
          <Link className="fitness-cta-primary" to={saved?'/build-my-plan/results':'/build-my-plan'} onClick={()=>trackCTAClick(saved?'resume_plan':'hero_cta','homepage')}>{saved?'Resume my plan':'Build my free plan'} <ArrowRight size={20}/></Link>
          {saved?<Link className="fitness-cta-secondary" to="/build-my-plan">Edit my plan</Link>:<a className="fitness-cta-secondary" href="#features">Explore the program</a>}
        </div>
        <div className="fitness-trust"><span><Check size={15}/> Free</span><span><Check size={15}/> No account required</span><span><ShieldCheck size={15}/> Optional device-only saving</span></div>
        <div className="fitness-path">
          <div><span>01</span><strong>Personalize</strong><small>Goal, time & equipment</small></div>
          <div><span>02</span><strong>Train</strong><small>Guided daily sessions</small></div>
          <div><span>03</span><strong>Progress</strong><small>Log, review & adapt</small></div>
        </div>
      </div>
      <div className="fitness-visual">
        <img src={heroImg} alt="" width={1280} height={720} fetchPriority="high" className="fitness-photo"/>
        <div className="fitness-visual-shade"/>
        <div className="fitness-visual-label"><Activity size={17}/> YOUR TRAINING JOURNEY</div>
        <article className="fitness-example" aria-label="Illustrative example of a three-day program">
          <div className="fitness-example-head"><div><span>EXAMPLE PROGRAM · WEEK 01</span><h2>Train with purpose.</h2></div><CalendarDays size={23}/></div>
          <div className="fitness-example-stats"><span><Dumbbell size={17}/> 3 strength days</span><span><Clock3 size={17}/> 45-min budget</span></div>
          <div className="fitness-example-week">{days.map(([day,focus,training],i)=><div key={i} className={training?'fitness-example-active':''}><small>{day}</small>{training?<Dumbbell size={16}/>:<HeartPulse size={16}/>}<span>{focus}</span></div>)}</div>
          <div className="fitness-example-session"><span className="fitness-session-icon"><Dumbbell size={21}/></span><div><strong>Monday · Full body A</strong><small>5 movements · technique cues · rest timer</small></div><ArrowRight size={18}/></div>
          <p className="fitness-example-caption">Illustrative schedule. Your actual plan adapts to your selections.</p>
        </article>
      </div>
    </div>
    <div className="fitness-home-features">
      <div><Dumbbell/><span><strong>Workout program</strong><small>2–6 days, gym or home</small></span></div>
      <div><Utensils/><span><strong>Nutrition targets</strong><small>Energy, protein and macros</small></span></div>
      <div><HeartPulse/><span><strong>Cardio & recovery</strong><small>Manageable effort and habits</small></span></div>
      <div><Activity/><span><strong>Progress journal</strong><small>Sets, load and weekly reviews</small></span></div>
    </div>
  </section>;
}
