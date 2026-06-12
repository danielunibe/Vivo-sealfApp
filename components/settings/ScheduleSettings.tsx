'use client';

import React from 'react';
import { Clock, Sun, Moon, Calendar, Coffee, AlertCircle } from 'lucide-react';
import { saveWorkSchedule } from '@/lib/storage';

interface ScheduleItem {
  day: string;
  active: boolean;
  start: string;
  end: string;
}

interface ScheduleSettingsProps {
  theme: 'light' | 'dark';
  schedule: ScheduleItem[];
  setSchedule: (schedule: ScheduleItem[]) => void;
  selectedDayIdx: number;
  setSelectedDayIdx: (idx: number) => void;
}

const DAY_NAMES_FULL: Record<string, string> = {
  'Lun': 'Lunes',
  'Mar': 'Martes',
  'Mié': 'Miércoles',
  'Jue': 'Jueves',
  'Vie': 'Viernes',
  'Sáb': 'Sábado',
  'Dom': 'Domingo'
};

export default function ScheduleSettings({
  theme,
  schedule,
  setSchedule,
  selectedDayIdx,
  setSelectedDayIdx
}: ScheduleSettingsProps) {
  
  const toggleDayActive = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
    saveWorkSchedule(newSchedule);
  };

  const updateTime = (index: number, field: 'start' | 'end', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
    saveWorkSchedule(newSchedule);
  };

  const activeDayConf = schedule[selectedDayIdx];

  // Calculate duration in hours and minutes
  const getDuration = (start: string, end: string): string => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60; // Handle overnight wrap
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} h`;
  };

  // Weekly stats
  const laborableCount = schedule.filter(s => s.active).length;
  const descansoCount = schedule.filter(s => !s.active).length;

  const getWeeklyAverage = (): string => {
    const activeDays = schedule.filter(s => s.active);
    if (activeDays.length === 0) return 'Sin días laborables';
    let totalStartMins = 0;
    let totalEndMins = 0;
    activeDays.forEach(d => {
      const [sh, sm] = d.start.split(':').map(Number);
      const [eh, em] = d.end.split(':').map(Number);
      totalStartMins += sh * 60 + sm;
      totalEndMins += eh * 60 + em;
    });
    const avgStartMins = Math.round(totalStartMins / activeDays.length);
    const avgEndMins = Math.round(totalEndMins / activeDays.length);
    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${pad(Math.floor(avgStartMins / 60))}:${pad(avgStartMins % 60)}`;
    const endStr = `${pad(Math.floor(avgEndMins / 60))}:${pad(avgEndMins % 60)}`;
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Header útil */}
      <div className="flex flex-col space-y-0.5 border-b border-black/5 dark:border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
          Horarios Laborales
        </span>
        <span className="text-[8.5px] font-medium text-neutral-400">
          Define tus días activos de campo y el rango de tu jornada
        </span>
        <div className="text-[9px] font-bold text-neutral-500 pt-1.5 flex items-center gap-1">
          Día seleccionado: <span className="text-[var(--neo-text)] font-black uppercase font-mono">{activeDayConf ? DAY_NAMES_FULL[activeDayConf.day] : ''}</span>
        </div>
      </div>

      {/* 2. Selector de días elegante */}
      <div className="grid grid-cols-7 gap-1.5 py-1">
        {schedule.map((item, idx) => {
          const isSelected = selectedDayIdx === idx;
          const isActive = item.active;
          
          let btnClass = '';
          if (isSelected) {
            btnClass = isActive 
              ? 'bg-[var(--neo-accent)] text-[var(--neo-accent-contrast)] shadow-sm scale-102'
              : 'bg-neutral-600 text-white shadow-xs';
          } else {
            btnClass = isActive
              ? theme === 'light'
                ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200/40'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/5'
              : 'border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 opacity-60';
          }

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`relative h-9 rounded-xl flex flex-col items-center justify-center font-mono font-black text-[9.5px] transition-all cursor-pointer ${btnClass}`}
              title={`${DAY_NAMES_FULL[item.day]}: ${isActive ? `${item.start} - ${item.end}` : 'Descanso'}`}
            >
              <span>{item.day}</span>
              {isActive && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
              )}
              {!isActive && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-neutral-400/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tarjeta de jornada del día seleccionado */}
      {activeDayConf && (
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3.5 relative overflow-hidden">
          {/* Decorative subtle background icon */}
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none select-none">
            {activeDayConf.active ? <Sun className="w-20 h-20" /> : <Coffee className="w-20 h-20" />}
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <div className="flex flex-col">
              <span className={`text-[11px] font-black uppercase tracking-wider ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-100'}`}>
                Jornada de {DAY_NAMES_FULL[activeDayConf.day]}
              </span>
              <span className="text-[8px] font-mono text-neutral-450 font-bold uppercase mt-0.5">
                {activeDayConf.active ? 'Día de Activación' : 'Día de Descanso'}
              </span>
            </div>

            {/* Premium toggle switch style button */}
            <button
              onClick={() => toggleDayActive(selectedDayIdx)}
              className={`py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeDayConf.active
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 shadow-xs'
                  : 'bg-neutral-200 text-neutral-500 border-neutral-300 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-750'
              }`}
            >
              {activeDayConf.active ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Laborable
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  Descanso
                </>
              )}
            </button>
          </div>

          {/* Time pickers / Rest state card body */}
          <div className="z-10 relative">
            {activeDayConf.active ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Entrada (Start) */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                    <Sun className="w-2.5 h-2.5 text-amber-500" />
                    Hora de Entrada
                  </span>
                  <input
                    type="time"
                    value={activeDayConf.start}
                    onChange={(e) => updateTime(selectedDayIdx, 'start', e.target.value)}
                    className={`w-full py-2 px-3 text-center text-xs font-black tracking-wide rounded-xl border focus:outline-hidden transition-all ${
                      theme === 'light'
                        ? 'bg-white border-black/10 focus:border-neutral-400 text-neutral-800 shadow-xs'
                        : 'bg-white/5 border-white/10 focus:border-neutral-500 text-white'
                    }`}
                  />
                </div>

                {/* Salida (End) */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1">
                    <Moon className="w-2.5 h-2.5 text-neutral-400" />
                    Hora de Salida
                  </span>
                  <input
                    type="time"
                    value={activeDayConf.end}
                    onChange={(e) => updateTime(selectedDayIdx, 'end', e.target.value)}
                    className={`w-full py-2 px-3 text-center text-xs font-black tracking-wide rounded-xl border focus:outline-hidden transition-all ${
                      theme === 'light'
                        ? 'bg-white border-black/10 focus:border-neutral-400 text-neutral-800 shadow-xs'
                        : 'bg-white/5 border-white/10 focus:border-neutral-500 text-white'
                    }`}
                  />
                </div>
              </div>
            ) : (
              /* Rest day message */
              <div className="py-4 px-3 rounded-xl bg-neutral-100/50 dark:bg-white/2 border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                <Coffee className="w-6 h-6 text-neutral-400 mb-1.5 opacity-60" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                  Día Libre Programado
                </span>
                <p className="text-[8.5px] text-neutral-500 mt-1 max-w-[220px] leading-tight">
                  Las ventas en este día no se asocian a una jornada de campo activa por defecto.
                </p>
              </div>
            )}
          </div>

          {/* Support helper and Duration */}
          {activeDayConf.active && (
            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3.5 z-10 relative">
              <span className="text-[8.5px] text-neutral-500 leading-tight flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-neutral-400 shrink-0" />
                Jornada ideal para activaciones de campo.
              </span>
              <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-black/5 dark:border-white/10">
                <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--neo-text)] font-mono leading-none">
                  Duración
                </span>
                <span className="text-[10px] font-black text-[var(--neo-text)] font-mono leading-none">
                  {getDuration(activeDayConf.start, activeDayConf.end)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Resumen semanal compacto */}
      <div className="p-3 rounded-xl bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="flex flex-col">
            <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-250'}`}>
              Semana Configurada
            </span>
            <span className="text-[8px] font-semibold text-neutral-500 leading-none mt-0.5">
              {laborableCount} días laborables · {descansoCount} de descanso
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="block text-[7px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-0.5">
            Rango Promedio
          </span>
          <span className="text-[9.5px] font-bold text-neutral-600 dark:text-neutral-350 font-mono leading-none">
            {getWeeklyAverage()}
          </span>
        </div>
      </div>
    </div>
  );
}
