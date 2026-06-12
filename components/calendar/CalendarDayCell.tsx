'use client';

import React from 'react';
import { CalendarDayRecord } from '@/types/sale';
import { getDayStatusColor } from '@/lib/calendarDailySummary';
import CalendarDeviceBadges from './CalendarDeviceBadges';

interface CalendarDayCellProps {
  theme: 'light' | 'dark';
  dayNumber: number;
  isValidDay: boolean;
  isSelected: boolean;
  onClick: () => void;
  record: CalendarDayRecord | null;
  hasNewCalendarSale?: boolean;
}

export default function CalendarDayCell({
  theme,
  dayNumber,
  isValidDay,
  isSelected,
  onClick,
  record,
  hasNewCalendarSale
}: CalendarDayCellProps) {
  if (!isValidDay) {
    return (
      <div
        className={`aspect-square w-full rounded-xl border flex items-center justify-center transition-all duration-350 mx-auto ${
          theme === 'light'
            ? 'border-neutral-200/40 bg-transparent'
            : 'border-neutral-800/40 bg-transparent'
        }`}
      />
    );
  }

  const statusColor = getDayStatusColor(record);
  
  let bgClass = '';
  
  if (statusColor === 'rest') {
    bgClass = theme === 'light' ? 'bg-neutral-50/20 border border-neutral-200/40 opacity-45' : 'bg-white/2 border border-white/5 opacity-35';
  } else if (statusColor === 'not-attended') {
    bgClass = theme === 'light' ? 'bg-red-500/5 border border-red-500/15 text-red-700 opacity-80' : 'bg-red-500/8 border border-red-500/15 text-red-400 opacity-85';
  } else if (statusColor === 'no-sale') {
    bgClass = theme === 'light' ? 'bg-neutral-100/35 border border-neutral-200/35 text-neutral-400' : 'bg-neutral-900/45 border border-neutral-850/50 text-neutral-500';
  } else if (statusColor === 'below-goal') {
    bgClass = theme === 'light' 
      ? 'bg-amber-100/40 hover:bg-amber-200/45 border border-amber-300 text-amber-900 shadow-xs' 
      : 'bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-250 shadow-[inset_0_1px_1px_rgba(251,191,36,0.1)]';
  } else if (statusColor === 'goal-met') {
    bgClass = theme === 'light' 
      ? 'bg-emerald-150/45 hover:bg-emerald-200/50 border border-emerald-300/85 text-emerald-950 shadow-xs' 
      : 'bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-250 shadow-[inset_0_1px_1px_rgba(16,185,129,0.1)]';
  } else if (statusColor === 'goal-exceeded') {
    bgClass = theme === 'light' 
      ? 'bg-purple-100/40 hover:bg-purple-150/45 border border-purple-300 text-purple-950 shadow-xs' 
      : 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 text-purple-250 shadow-[inset_0_1px_1px_rgba(139,92,246,0.1)]';
  } else {
    // fallback or future days
    bgClass = theme === 'light' ? 'bg-transparent border border-neutral-200/35' : 'bg-transparent border border-neutral-850/35';
  }

  const selectedStyle = isSelected
    ? (theme === 'light'
        ? 'scale-[1.03] border-neutral-900 shadow-md ring-1 ring-neutral-900/35 z-10'
        : 'scale-[1.03] border-white/90 shadow-[0_4px_12px_rgba(255,255,255,0.08)] ring-1 ring-white/20 z-10')
    : 'border-neutral-200/40 dark:border-neutral-850/40';

  // Has content
  const hasContent = record && record.totalEarned > 0;

  const formatAmount = (amt: number) => {
    if (amt >= 1000) {
      const k = amt / 1000;
      return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
    }
    return `$${amt}`;
  };

  return (
    <button
      onClick={onClick}
      className={`aspect-square w-full rounded-xl p-1 transition-all duration-300 relative cursor-pointer group focus:outline-none mx-auto overflow-hidden flex flex-col compact-calendar-cell ${bgClass} ${selectedStyle}`}
      title={`Día ${dayNumber}`}
    >
      {/* Background Watermark Date */}
      <span className={`absolute top-0.5 left-1.5 text-[20px] tracking-tighter font-black leading-none pointer-events-none select-none z-0 transition-opacity ${
        ['goal-met', 'goal-exceeded', 'below-goal'].includes(statusColor)
          ? 'opacity-[0.14] text-current'
          : (theme === 'light' ? 'text-neutral-400/40' : 'text-neutral-600/30')
      }`}>
        {dayNumber}
      </span>

      {/* Pulsing/Blinking Gold Indicator representing the newly registered sale event */}
      {hasNewCalendarSale && isSelected && hasContent && (
        <span className="absolute top-1 right-1 flex h-2 w-2 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400 border border-white dark:border-neutral-900 shadow-sm"></span>
        </span>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center pb-[1px]">
        {/* Device badges */}
        {hasContent && record.soldDevices.length > 0 && (
          <div className="w-full flex justify-center mb-0.5">
            <CalendarDeviceBadges 
              devices={record.soldDevices} 
              theme={theme} 
              maxVisible={2}
            />
          </div>
        )}

        {/* Money */}
        {hasContent && (
          <div className="w-full text-center mt-auto">
            <span className="text-[9px] font-extrabold tracking-tighter opacity-95 leading-none">
              {formatAmount(record.totalEarned)}
            </span>
          </div>
        )}
      </div>

      {/* Selected Indicator for empty/rest days */}
      {isSelected && !hasContent && statusColor !== 'not-attended' && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-40 animate-pulse shadow-sm" />
      )}
    </button>
  );
}
