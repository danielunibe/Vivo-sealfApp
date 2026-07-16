import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, CalendarRange } from 'lucide-react';
import { DailyChallenge, PhoneModel, SaleRecord } from '../../types';
import { parseLocalDateKey } from '../../lib/date';
import { buildCalendarYearOverview } from './buildCalendarYearOverview';
import { getStateDotColor, YEAR_STATE_LABELS } from './calendarUtils';

interface CalendarYearOverviewProps {
  isOpen: boolean;
  sales: SaleRecord[];
  challenges: DailyChallenge[];
  goal: number;
  phoneModels: PhoneModel[];
  appTodayStr: string;
  earliestIso: string;
  firstSaleIso?: string | null;
  focusedDayIso: string;
  onClose: () => void;
  onSelectDay: (dateIso: string) => void;
}

export function CalendarYearOverview({
  isOpen,
  sales,
  challenges,
  goal,
  phoneModels,
  appTodayStr,
  earliestIso,
  firstSaleIso = null,
  focusedDayIso,
  onClose,
  onSelectDay,
}: CalendarYearOverviewProps) {
  const focusedDate = parseLocalDateKey(focusedDayIso);
  const earliestDate = parseLocalDateKey(earliestIso);
  const todayDate = parseLocalDateKey(appTodayStr);
  const [viewYear, setViewYear] = useState(focusedDate.getFullYear());

  React.useEffect(() => {
    if (!isOpen) return;
    setViewYear(parseLocalDateKey(focusedDayIso).getFullYear());
  }, [isOpen, focusedDayIso]);

  const hasPrevYear = viewYear > earliestDate.getFullYear();
  const hasNextYear = viewYear < todayDate.getFullYear();

  const { months, counts } = useMemo(
    () => buildCalendarYearOverview({
      year: viewYear,
      sales,
      challenges,
      goal,
      phoneModels,
      appTodayStr,
      earliestIso,
      firstSaleIso,
    }),
    [viewYear, sales, challenges, goal, phoneModels, appTodayStr, earliestIso, firstSaleIso],
  );

  const totalTracked = (Object.values(counts) as number[]).reduce((sum, value) => sum + value, 0);
  const historyFromDate = parseLocalDateKey(firstSaleIso || earliestIso);
  const firstRecordLabel = historyFromDate.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar vista anual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-[#0f1217]/55 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Vista anual del calendario"
            initial={{ opacity: 0, y: -28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[calc(env(safe-area-inset-top)+3.15rem)] z-[220] w-[calc(100%-2rem)] sm:w-[min(360px,calc(100%-2rem))] max-h-[min(58vh,480px)] flex flex-col rounded-[1.5rem] border border-white/14 bg-[#f6f7f9]/97 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.22)] overflow-hidden"
          >
            <div className="shrink-0 px-3.5 pt-3 pb-2 border-b border-black/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white border border-black/8 flex items-center justify-center shrink-0">
                    <CalendarRange size={14} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 leading-none">
                      Vista anual
                    </p>
                    <h3 className="text-base font-black tracking-tight leading-none mt-0.5">{viewYear}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewYear((current) => current - 1)}
                    disabled={!hasPrevYear}
                    className={`p-1.5 rounded-full transition-colors ${hasPrevYear ? 'text-[#343A43] hover:bg-black/5' : 'text-slate-300 pointer-events-none'}`}
                    aria-label="Año anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewYear((current) => current + 1)}
                    disabled={!hasNextYear}
                    className={`p-1.5 rounded-full transition-colors ${hasNextYear ? 'text-[#343A43] hover:bg-black/5' : 'text-slate-300 pointer-events-none'}`}
                    aria-label="Año siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white border border-black/8 text-slate-500 hover:text-[#343A43] flex items-center justify-center ml-0.5"
                    aria-label="Cerrar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <p className="text-[9px] font-semibold text-slate-500 mt-1.5 leading-snug truncate">
                Desde {firstRecordLabel} · {totalTracked} días
              </p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-2 space-y-1.5 min-h-0">
              {months.map((monthRow) => (
                <div key={monthRow.month} className="flex items-center gap-2 min-h-[18px]">
                  <span className="w-7 shrink-0 text-[9px] font-black uppercase tracking-wide text-slate-500">
                    {monthRow.label}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-[2px] min-h-[12px]">
                    {monthRow.dots.length === 0 ? (
                      <span className="text-[8px] font-semibold text-slate-300">—</span>
                    ) : (
                      monthRow.dots.map((dot) => (
                        <button
                          key={dot.dateIso}
                          type="button"
                          title={`${dot.day} · ${dot.state}`}
                          onClick={() => onSelectDay(dot.dateIso)}
                          className={`w-[6px] h-[6px] rounded-full transition-transform hover:scale-125 ${
                            dot.dateIso === focusedDayIso ? 'ring-2 ring-[#343A43]/35 ring-offset-[1px]' : ''
                          }`}
                          style={{ backgroundColor: getStateDotColor(dot.state) }}
                          aria-label={`Día ${dot.day}`}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-black/5 px-3.5 py-2 bg-white/50">
              <div className="flex flex-wrap gap-1.5">
                {YEAR_STATE_LABELS.map(({ state, label }) => (
                  <div
                    key={state}
                    className="inline-flex items-center gap-1 rounded-full border border-black/8 bg-white px-2 py-0.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getStateDotColor(state) }}
                    />
                    <span className="text-[9px] font-black text-[#343A43]">{label}</span>
                    <span className="text-[9px] font-black text-slate-500">{counts[state] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
