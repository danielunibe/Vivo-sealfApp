import React from 'react';
import { Sale, CalendarSoldDeviceSummary } from '@/types/sale';
import { getPiggyGoals, getWorkSchedule } from '@/lib/storage';

interface CalendarDaySummaryTopProps {
  theme: 'light' | 'dark';
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  sales: Sale[];
}

export default function CalendarDaySummaryTop({
  theme,
  selectedDay,
  selectedMonth,
  selectedYear,
  sales
}: CalendarDaySummaryTopProps) {
  const [dailyDeviceGoal, setDailyDeviceGoal] = React.useState<number>(3);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const goals = getPiggyGoals();
      if (goals && goals.dailyDeviceGoal) {
        setDailyDeviceGoal(goals.dailyDeviceGoal);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { totalDevicesSold, soldDevices } = React.useMemo(() => {
    const dailySales = sales.filter(sale => {
      const saleParts = sale.date.split('-');
      if (saleParts.length === 3) {
        const sYear = parseInt(saleParts[0]);
        const sMonth = parseInt(saleParts[1]) - 1; 
        const sDay = parseInt(saleParts[2]);
        return sYear === selectedYear && sMonth === selectedMonth && sDay === selectedDay;
      }
      return false;
    });

    const soldDevicesMap = new Map<string, CalendarSoldDeviceSummary>();
    let count = 0;
    
    dailySales.forEach(sale => {
      const key = `${sale.deviceId}-${sale.deviceColor || 'default'}`;
      count += 1;
      if (soldDevicesMap.has(key)) {
        const existing = soldDevicesMap.get(key)!;
        existing.quantity += 1;
        existing.totalEarned += sale.amountEarned;
      } else {
        soldDevicesMap.set(key, {
          deviceId: sale.deviceId,
          deviceName: sale.deviceName,
          colorName: sale.deviceColor || '',
          quantity: 1,
          totalEarned: sale.amountEarned
        });
      }
    });

    return { totalDevicesSold: count, soldDevices: Array.from(soldDevicesMap.values()) };
  }, [selectedDay, selectedMonth, selectedYear, sales]);

  // Progress calculations
  const progressRaw = (totalDevicesSold / dailyDeviceGoal) * 100;
  const progressPercent = Math.min(100, Math.max(0, progressRaw));
  
  const isGoalMet = totalDevicesSold >= dailyDeviceGoal;
  const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  const schedule = getWorkSchedule();
  const jsDay = selectedDate.getDay();
  const mondayFirstIndex = jsDay === 0 ? 6 : jsDay - 1;
  const isFuture = selectedDate.getTime() > today.getTime();
  const isRestDay = !!schedule?.[mondayFirstIndex] && !schedule[mondayFirstIndex].active;
  const dayState = isFuture
    ? 'future'
    : isRestDay && totalDevicesSold === 0
      ? 'rest'
      : totalDevicesSold === 0
        ? 'no-sale'
        : totalDevicesSold >= dailyDeviceGoal * 1.2
          ? 'goal-exceeded'
          : isGoalMet
            ? 'goal-met'
            : 'below-goal';

  const stateCopy = {
    future: { label: 'Día futuro', text: 'Aún sin evaluación', bar: 'bg-neutral-300 dark:bg-neutral-700' },
    rest: { label: 'Descanso', text: 'Día no laborable', bar: 'bg-neutral-300 dark:bg-neutral-700' },
    'no-sale': { label: 'Sin venta', text: 'No hay unidades registradas', bar: 'bg-neutral-300 dark:bg-neutral-700' },
    'below-goal': { label: 'Avance parcial', text: 'Faltan unidades para la meta', bar: 'bg-amber-400 dark:bg-amber-500' },
    'goal-met': { label: 'Meta cumplida', text: 'Objetivo diario alcanzado', bar: 'bg-emerald-400 dark:bg-emerald-500' },
    'goal-exceeded': { label: 'Meta superada', text: 'Rendimiento arriba de meta', bar: 'bg-violet-400 dark:bg-violet-500' },
  }[dayState];

  const stateClass = {
    future: theme === 'light' ? 'bg-white/60 border-neutral-200/70' : 'bg-white/4 border-white/5',
    rest: theme === 'light' ? 'bg-neutral-50/70 border-neutral-200/70' : 'bg-white/4 border-white/5',
    'no-sale': theme === 'light' ? 'bg-neutral-50/80 border-neutral-200/80' : 'bg-white/4 border-white/5',
    'below-goal': theme === 'light' ? 'bg-amber-50/85 border-amber-200/80 shadow-amber-100/50' : 'bg-amber-500/8 border-amber-400/20',
    'goal-met': theme === 'light' ? 'bg-emerald-50/85 border-emerald-200/80 shadow-emerald-100/50' : 'bg-emerald-500/8 border-emerald-400/20',
    'goal-exceeded': theme === 'light' ? 'bg-violet-50/85 border-violet-200/80 shadow-violet-100/50' : 'bg-violet-500/8 border-violet-400/20',
  }[dayState];

  return (
    <div className={`mb-2 mx-4 p-3 rounded-2xl border shadow-sm ${stateClass} backdrop-blur-xl transition-all duration-300`}>
      <div className="flex flex-col gap-1.5">
        {/* Device summary text */}
        <div className="flex justify-between items-center">
           <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[var(--neo-text)] leading-none mb-1">
               {stateCopy.label}
             </span>
             <div className="flex items-center gap-1.5 min-h-[16px]">
               {totalDevicesSold === 0 ? (
                 <span className="text-[9.5px] font-semibold text-neutral-400 dark:text-neutral-500 leading-none">
                   {stateCopy.text}
                 </span>
               ) : (
                 <div className="flex items-center gap-1 flex-wrap">
                   {soldDevices.map(d => (
                     <span key={`${d.deviceId}-${d.colorName}`} className="inline-flex items-center text-[9px] font-bold bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/30 dark:border-neutral-800/40 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded-md leading-none">
                       {d.deviceName} <span className="text-neutral-400 dark:text-neutral-500 font-mono ml-1 font-semibold">×{d.quantity}</span>
                     </span>
                   ))}
                 </div>
               )}
             </div>
           </div>
           
           <div className="flex flex-col items-end shrink-0">
             <span className="text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500 leading-none mb-1">
               Meta Unidades
             </span>
             <span className={`text-[12px] font-mono font-black tracking-tight leading-none ${isGoalMet ? 'text-emerald-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
               {totalDevicesSold} <span className="text-[9.5px] text-neutral-400 dark:text-neutral-600 font-normal">/ {dailyDeviceGoal} uds</span>
             </span>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden mt-1.5 relative">
           <div 
             className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${stateCopy.bar}`}
             style={{ width: `${progressPercent}%` }}
           />
        </div>
      </div>
    </div>
  );
}
