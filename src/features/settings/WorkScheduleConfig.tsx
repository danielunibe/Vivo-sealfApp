import React from 'react';
import { AppSettings } from '../../types';

interface WorkScheduleConfigProps {
  settings: AppSettings;
  onChange: (field: string, value: unknown) => void;
}

const DAYS = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
] as const;

const DEFAULT_WORK_SCHEDULE = {
  startTime: '11:00',
  endTime: '20:00',
  workingDays: [1, 2, 3, 4, 5, 6],
  fixedRestDays: [0],
  manualRestDates: [] as string[],
};

export default function WorkScheduleConfig({ settings, onChange }: WorkScheduleConfigProps) {
  const workSchedule = {
    ...DEFAULT_WORK_SCHEDULE,
    ...(settings.workSchedule ?? {}),
  };

  const toggleDay = (dayId: number) => {
    const fixedRestDays = [...(workSchedule.fixedRestDays ?? [])];
    const workingDays = [...(workSchedule.workingDays ?? [])];
    const isRestDay = fixedRestDays.includes(dayId);

    const nextFixedRestDays = isRestDay
      ? fixedRestDays.filter((day) => day !== dayId)
      : [...fixedRestDays, dayId].sort((a, b) => a - b);

    const nextWorkingDays = isRestDay
      ? [...new Set([...workingDays, dayId])].sort((a, b) => a - b)
      : workingDays.filter((day) => day !== dayId);

    onChange('workSchedule', {
      ...workSchedule,
      fixedRestDays: nextFixedRestDays,
      workingDays: nextWorkingDays,
    });
  };

  return (
    <div className="vivo-panel p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const isWorking = !(workSchedule.fixedRestDays ?? []).includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isWorking
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/25'
                  : 'bg-gray-50 text-gray-400 border border-gray-100 opacity-60 dark:bg-[var(--neo-surface-soft)] dark:text-slate-500 dark:border-white/8'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50 dark:border-white/8">
        <div>
          <label className="text-[0.60rem] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Entrada</label>
          <input
            type="time"
            value={workSchedule.startTime}
            onChange={(e) => onChange('workSchedule', { ...workSchedule, startTime: e.target.value })}
            className="w-full vivo-subtle p-2.5 rounded-xl text-sm font-black outline-none"
          />
        </div>
        <div>
          <label className="text-[0.60rem] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Salida</label>
          <input
            type="time"
            value={workSchedule.endTime}
            onChange={(e) => onChange('workSchedule', { ...workSchedule, endTime: e.target.value })}
            className="w-full vivo-subtle p-2.5 rounded-xl text-sm font-black outline-none"
          />
        </div>
      </div>
    </div>
  );
}
