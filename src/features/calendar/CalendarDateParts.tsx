import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseLocalDateKey, toLocalDateKey } from '../../lib/date';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

type DatePart = 'day' | 'month' | 'year';

interface CalendarDatePartsProps {
  focusedDayIso: string;
  earliestIso: string;
  appTodayStr: string;
  onDateChange: (dateIso: string) => void;
  onOpenYearOverview?: () => void;
  isOnDarkSurface?: boolean;
  hasPrevMonth?: boolean;
  hasNextMonth?: boolean;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const clampDateParts = (
  year: number,
  month: number,
  day: number,
  earliestIso: string,
  appTodayStr: string,
) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), daysInMonth);
  let iso = toLocalDateKey(new Date(year, month, safeDay, 12, 0, 0));
  if (iso < earliestIso) iso = earliestIso;
  if (iso > appTodayStr) iso = appTodayStr;
  return iso;
};

export function CalendarDateParts({
  focusedDayIso,
  earliestIso,
  appTodayStr,
  onDateChange,
  onOpenYearOverview,
  isOnDarkSurface = false,
  hasPrevMonth = false,
  hasNextMonth = false,
  onPrevMonth,
  onNextMonth,
}: CalendarDatePartsProps) {
  const [activePart, setActivePart] = useState<DatePart | null>(null);
  const focusedDate = parseLocalDateKey(focusedDayIso);
  const earliestDate = parseLocalDateKey(earliestIso);
  const todayDate = parseLocalDateKey(appTodayStr);

  const year = focusedDate.getFullYear();
  const month = focusedDate.getMonth();
  const day = focusedDate.getDate();

  const yearOptions = useMemo(() => {
    const start = earliestDate.getFullYear();
    const end = todayDate.getFullYear();
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [earliestDate, todayDate]);

  const monthOptions = useMemo(() => {
    return MONTH_SHORT.map((label, monthIndex) => {
      const monthStart = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const monthEnd = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      const hasRange = monthEnd >= earliestIso && monthStart <= appTodayStr;
      return { monthIndex, label, disabled: !hasRange };
    });
  }, [year, earliestIso, appTodayStr]);

  const dayOptions = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const disabled = iso < earliestIso || iso > appTodayStr;
      return { dayNumber, iso, disabled };
    });
  }, [year, month, earliestIso, appTodayStr]);

  const applyPart = (part: DatePart, value: number) => {
    const nextYear = part === 'year' ? value : year;
    const nextMonth = part === 'month' ? value : month;
    const nextDay = part === 'day' ? value : day;
    onDateChange(clampDateParts(nextYear, nextMonth, nextDay, earliestIso, appTodayStr));
    setActivePart(null);
  };

  const segmentClass = (part: DatePart) => (
    `px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-black uppercase tracking-[0.08em] transition-all ${
      activePart === part
        ? isOnDarkSurface
          ? 'bg-white border-white text-[#343A43] shadow-sm'
          : 'bg-[#343A43] border-[#343A43] text-white shadow-sm'
        : isOnDarkSurface
          ? 'bg-white/12 border-white/18 text-white hover:bg-white/18'
          : 'vivo-inset-on-pattern text-[#343A43] hover:brightness-[1.03]'
    }`
  );

  const yearOverviewClass = isOnDarkSurface
    ? 'bg-white/12 border-white/18 text-white hover:bg-white/18'
    : 'vivo-inset-on-pattern text-[#343A43] hover:brightness-[1.03]';

  const monthNavClass = isOnDarkSurface
    ? 'text-white/80 hover:bg-white/10'
    : 'text-[#343A43] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10';

  return (
    <div className="relative z-20 pointer-events-auto w-full mb-1.5 flex flex-col items-center" onClick={(event) => event.stopPropagation()}>
      <div className="flex w-full items-center justify-center gap-1">
        <button
          type="button"
          onClick={onPrevMonth}
          disabled={!hasPrevMonth}
          aria-label="Mes anterior"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-0 disabled:pointer-events-none ${monthNavClass}`}
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 min-w-0">
        <button
          type="button"
          className={`${segmentClass('day')} min-w-[2.5rem] text-center`}
          onClick={() => setActivePart((current) => (current === 'day' ? null : 'day'))}
        >
          {day}
        </button>
        <span className={`text-[10px] font-black ${isOnDarkSurface ? 'text-white/45' : 'text-slate-400'}`}>·</span>
        <button
          type="button"
          className={`${segmentClass('month')} min-w-[4.25rem] text-center`}
          onClick={() => setActivePart((current) => (current === 'month' ? null : 'month'))}
        >
          {MONTH_NAMES[month]}
        </button>
        <span className={`text-[10px] font-black ${isOnDarkSurface ? 'text-white/45' : 'text-slate-400'}`}>·</span>
        <button
          type="button"
          className={`${segmentClass('year')} min-w-[3rem] text-center`}
          onClick={() => setActivePart((current) => (current === 'year' ? null : 'year'))}
        >
          {year}
        </button>
        {onOpenYearOverview && (
          <button
            type="button"
            onClick={onOpenYearOverview}
            className={`inline-flex items-center justify-center w-[2.125rem] h-[1.875rem] sm:h-[2rem] rounded-lg border transition-colors shrink-0 ${yearOverviewClass}`}
            aria-label="Vista anual del calendario"
            title="Vista anual"
          >
            <Calendar size={14} strokeWidth={2.3} />
          </button>
        )}
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          disabled={!hasNextMonth}
          aria-label="Mes siguiente"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-0 disabled:pointer-events-none ${monthNavClass}`}
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>

      <AnimatePresence>
        {activePart && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 w-full max-w-[280px] rounded-xl vivo-surface-on-pattern shadow-lg p-2 max-h-[132px] overflow-y-auto no-scrollbar"
          >
            {activePart === 'day' && (
              <div className="grid grid-cols-7 gap-1">
                {dayOptions.map((option) => (
                  <button
                    key={option.iso}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => applyPart('day', option.dayNumber)}
                    className={`h-7 rounded-md text-[10px] font-black ${
                      option.disabled
                        ? 'opacity-25 cursor-default text-slate-400'
                        : option.dayNumber === day
                          ? 'bg-[#343A43] text-white'
                          : 'bg-slate-100 text-[#343A43] hover:bg-slate-200 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    }`}
                  >
                    {option.dayNumber}
                  </button>
                ))}
              </div>
            )}

            {activePart === 'month' && (
              <div className="grid grid-cols-4 gap-1.5">
                {monthOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => applyPart('month', option.monthIndex)}
                    className={`h-8 rounded-lg text-[10px] font-black uppercase ${
                      option.disabled
                        ? 'opacity-25 cursor-default text-slate-400'
                        : option.monthIndex === month
                          ? 'bg-[#343A43] text-white'
                          : 'bg-slate-100 text-[#343A43] hover:bg-slate-200 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {activePart === 'year' && (
              <div className="grid grid-cols-3 gap-1.5">
                {yearOptions.map((optionYear) => (
                  <button
                    key={optionYear}
                    type="button"
                    onClick={() => applyPart('year', optionYear)}
                    className={`h-8 rounded-lg text-[10px] font-black ${
                      optionYear === year
                        ? 'bg-[#343A43] text-white'
                        : 'bg-slate-100 text-[#343A43] hover:bg-slate-200 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    }`}
                  >
                    {optionYear}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
