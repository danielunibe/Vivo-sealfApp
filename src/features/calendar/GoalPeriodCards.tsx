import React, { useState } from 'react';
import { PeriodGoalProgress } from '../../lib/goalBreakdown';
import { ColoredGoalProgressBar } from './ColoredGoalProgressBar';
import { GoalDeviceBreakdownSheet } from './GoalDeviceBreakdownSheet';

type GoalPeriodCardsProps = {
  periods: PeriodGoalProgress[];
  isOnDark?: boolean;
};

export function GoalPeriodCards({
  periods,
  isOnDark = false,
}: GoalPeriodCardsProps) {
  const [activePeriod, setActivePeriod] = useState<PeriodGoalProgress | null>(null);

  const cardShell = isOnDark
    ? 'border-white/12 bg-white/8 hover:bg-white/12'
    : 'border-black/6 vivo-surface-on-pattern hover:brightness-[1.02]';

  const labelClass = isOnDark ? 'text-white/65' : 'text-slate-500 dark:text-slate-400';
  const valueClass = isOnDark ? 'text-white' : 'text-[#343A43] dark:text-slate-100';
  const subClass = isOnDark ? 'text-white/55' : 'text-slate-500 dark:text-slate-400';

  return (
    <>
      <div className="mt-2 flex flex-col gap-2">
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => setActivePeriod(period)}
            className={`w-full rounded-2xl border px-3.5 py-2.5 text-left transition-colors active:scale-[0.99] ${cardShell}`}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <span className={`text-[9px] font-black uppercase tracking-[0.14em] ${labelClass}`}>
                  {period.label} · Equipos
                </span>
                <p className={`mt-1 text-[1.12rem] font-black leading-none ${valueClass}`}>
                  {period.projected > 0 ? period.projected : period.current}
                  <span className="ml-1 text-[0.72rem] font-black uppercase tracking-[0.12em] opacity-70">
                    {period.projected > period.current ? 'proy.' : 'eq.'}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${labelClass}`}>
                  Avance
                </span>
                <p className={`text-sm font-black ${valueClass}`}>{period.percent}%</p>
                <p className={`text-[9px] font-semibold ${subClass}`}>{period.elapsedCaption}</p>
              </div>
            </div>

            <ColoredGoalProgressBar
              goal={period.goal}
              units={period.units}
              percent={period.percent}
              mode="stacked"
              isOnDark={isOnDark}
            />

            <p className={`mt-1.5 text-[10px] font-semibold leading-snug ${subClass}`}>
              <span className={`font-black ${valueClass}`}>{period.current}</span>
              <span> de {period.goal} equipos vendidos</span>
              {period.projected > period.current && (
                <span className="opacity-85"> · ~{period.projected} proyectados</span>
              )}
              {period.segments.length > 0 && (
                <span className="opacity-80"> · {period.segments.length} variantes</span>
              )}
            </p>
          </button>
        ))}
      </div>

      <GoalDeviceBreakdownSheet
        progress={activePeriod}
        isOnDark={isOnDark}
        onClose={() => setActivePeriod(null)}
      />
    </>
  );
}
