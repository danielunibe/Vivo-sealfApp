'use client';

import React, { useState, useMemo } from 'react';
import SavingsJar from '../piggybank/SavingsJar';
import PatternProgressBar from '../piggybank/PatternProgressBar';
import PiggyDailyGainPulse from '../piggybank/PiggyDailyGainPulse';
import AnimatedMoneyCounter from '../piggybank/AnimatedMoneyCounter';
import { Movement, Sale } from '@/types/sale';
import { getMonthlyVisualPattern } from '@/lib/monthlyVisualPatterns';
import { calculatePeriodEarnings, getProgressPercent, isMovementInPeriod } from '@/lib/piggyUtils';
import { getPiggyGoals } from '@/lib/storage';
import MovementHistory from '../piggybank/MovementHistory';

interface PiggyBankSectionProps {
  theme: 'light' | 'dark';
  movements: Movement[];
  sales: Sale[];
}

export default function PiggyBankSection({
  theme,
  movements = [],
  sales = []
}: PiggyBankSectionProps) {
  const [activePeriod, setActivePeriod] = useState<'Día' | 'Semana' | 'Mes' | 'Año'>('Día');
  const [goals, setGoals] = useState({
    'Día': 300,
    'Semana': 1500,
    'Mes': 6500,
    'Año': 78000
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = getPiggyGoals();
        if (saved) {
          setGoals({
            'Día': saved.daily || 300,
            'Semana': saved.weekly || 1500,
            'Mes': saved.monthly || 6500,
            'Año': saved.yearly || 78000
          });
        }
      } catch(e) {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const currentGoal = goals[activePeriod];

  const periodEarnings = useMemo(() => {
    return calculatePeriodEarnings(movements, activePeriod, sales);
  }, [movements, activePeriod, sales]);

  const periodMovements = useMemo(() => {
    const now = new Date();
    return movements.filter((movement) => isMovementInPeriod(movement, activePeriod, sales, now));
  }, [movements, activePeriod, sales]);

  const progressPercent = getProgressPercent(periodEarnings, currentGoal);

  const currentMonthIdx = new Date().getMonth();
  const currentMonthlyPattern = getMonthlyVisualPattern(currentMonthIdx);

  return (
    <div className="w-full h-full flex-1 flex flex-col pt-4 relative overflow-y-auto scrollbar-none dock-safe-pb">
      {/* Dynamic atmospheric backlights for glass reflection - shifted relative to screen */}
      <div 
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none mix-blend-screen transition-all duration-1000"
        style={{ 
          backgroundColor: currentMonthlyPattern.backgroundColor,
          opacity: 0.1 + (progressPercent / 100) * 0.4,
          transform: `translateX(-50%) scale(${1 + (progressPercent/100)*0.5})`
        }}
      />
      
      {/* Top Header - Hero Goal Card */}
      <div className="w-full relative z-20 px-4 mt-2">
        <div className={`rounded-3xl backdrop-blur-xl border p-4 shadow-lg transition-all duration-500 ${theme === 'light' ? 'bg-white/80 border-black/5 shadow-black/5' : 'bg-white/5 border-white/10 shadow-black/20'}`}>
          
          {/* Period Selector Optimized */}
          <div className="flex w-full mb-5 rounded-xl backdrop-blur-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-inner overflow-hidden p-1">
            {(['Día', 'Semana', 'Mes', 'Año'] as const).map((period) => (
              <button 
                key={period} 
                onClick={() => setActivePeriod(period)}
                className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                  activePeriod === period 
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Core Info */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Ahorrado</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter leading-none" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
                  <AnimatedMoneyCounter value={periodEarnings} />
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Meta {activePeriod}</span>
              <span className="text-lg font-bold text-neutral-600 dark:text-neutral-300 leading-none">
                ${currentGoal.toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2 mt-4" style={{ color: progressPercent >= 100 ? currentMonthlyPattern.accentColor : '#888' }}>
             <span>{progressPercent >= 100 ? '¡Meta Completada!' : `Avance ${Math.floor(progressPercent)}%`}</span>
             {progressPercent < 100 && (
               <span>Falta ${(currentGoal - periodEarnings).toLocaleString('es-MX')}</span>
             )}
          </div>

          {/* Video Game Style Energy Bar with Monthly Pattern */}
          <div className="w-full mt-1">
             <PatternProgressBar value={periodEarnings} goal={currentGoal} pattern={currentMonthlyPattern} />
          </div>
        </div>
      </div>

      {/* Hero Jar Component */}
      <div className="piggy-tall-jar-layout flex-1 w-full flex flex-col items-center justify-center relative z-10 mt-1 mb-2 min-h-[220px]">
        {/* A soft glowing base under the jar for presentation */}
        <div className="absolute bottom-6 w-3/4 h-12 blur-2xl rounded-full transition-all duration-1000" style={{ backgroundColor: currentMonthlyPattern.accentColor, opacity: 0.1 + (progressPercent / 100) * 0.2 }} />
        
        <div className="piggy-tall-jar-scale relative transform scale-[0.85] origin-center -mt-8">
          <PiggyDailyGainPulse movements={movements} sales={sales} className="-top-4 left-1/2 -translate-x-1/2" />
          <SavingsJar theme={theme} currentEarnings={periodEarnings} currentGoal={currentGoal} />
        </div>
      </div>

      {/* History / Empty State at the bottom */}
      <div className="w-full px-4 pb-4 mt-auto">
         {periodMovements.length === 0 ? (
           <div className={`w-full rounded-2xl border p-4 text-center transition-all ${theme === 'light' ? 'bg-white/60 border-black/5' : 'bg-white/5 border-white/5'}`}>
             <p className="text-xs font-bold text-neutral-400">Sin movimientos en {activePeriod}</p>
             <p className="text-[10px] text-neutral-500 mt-1">Tu próxima venta registrada sumará a tu puerquito y aparecerá aquí.</p>
           </div>
         ) : (
           <div className={`w-full rounded-2xl border p-3 transition-all ${theme === 'light' ? 'bg-white/60 border-black/5' : 'bg-white/5 border-white/5'}`}>
             <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Últimos Movimientos ({activePeriod})</h3>
             <MovementHistory theme={theme} movements={periodMovements.slice(0, 5)} sales={sales} />
           </div>
         )}
      </div>
    </div>
  );
}
