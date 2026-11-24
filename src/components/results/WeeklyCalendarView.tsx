import type { TrainingDay } from '@/lib/calculations';
import { weekdays } from '@/lib/training-engine';
const WeeklyCalendarView = ({trainingDays,onDayClick}:{trainingDays:TrainingDay[];onDayClick?:(index:number)=>void}) => (
  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4" aria-label="Weekly strength schedule">
    {weekdays.map(day=>{
      const index=trainingDays.findIndex(d=>d.day===day),match=trainingDays[index];
      return <div className={'rounded-lg p-3 border text-center '+(match?'bg-primary/10 border-primary/30':'bg-secondary/30 border-border')} key={day}>
        <p className="text-xs font-semibold">{day.slice(0,3)}</p>
        {match&&onDayClick?<button onClick={()=>onDayClick(index)} className="text-sm text-primary min-h-11">{match.focus}</button>:<p className="text-xs mt-1 text-muted-foreground">{match?.focus??'Recovery'}</p>}
      </div>;
    })}
  </div>
);
export default WeeklyCalendarView;
