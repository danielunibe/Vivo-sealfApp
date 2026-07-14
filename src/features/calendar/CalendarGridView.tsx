import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Info, Smartphone } from 'lucide-react';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { SaleRecord } from '../../types';
import { GoalUnit, PeriodGoalProgress } from '../../lib/goalBreakdown';
import { getDayStyle, getCardTheme, getTodayCardRingGradient, getNoRecordDayStyle, getPendingDayStyle } from './calendarUtils';
import { StatusGuideSheet } from './StatusGuideSheet';
import { CalendarDateParts } from './CalendarDateParts';
import { ColoredGoalProgressBar } from './ColoredGoalProgressBar';
import { GoalPeriodCards } from './GoalPeriodCards';

type CalendarDayDevice = {
  key: string;
  deviceId: string;
  deviceName: string;
  colorName: string;
  imagePath: string;
};

interface CalendarGridViewProps {
  salesFocusedDay: SaleRecord[];
  ventasDia: number;
  metaHoy: number;
  calendarDays: Array<{
    id: string;
    day: string;
    state: string;
    dateIso: string;
    salesCount: number;
    soldDevices: CalendarDayDevice[];
    hasCompletedChallenge?: boolean;
    hasActiveChallenge?: boolean;
  }>;
  dayState: string;
  focusedDayIso: string;
  isFocusedToday: boolean;
  isTodayGoalMet: boolean;
  showLegend: boolean;
  earliestIso: string;
  appTodayStr: string;
  dayGoalUnits: GoalUnit[];
  periodGoals: PeriodGoalProgress[];
  hasPrevMonth: boolean;
  hasNextMonth: boolean;
  canPrevDay: boolean;
  canNextDay: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToggleLegend: (e: React.MouseEvent) => void;
  onSelectDay: (dateIso: string) => void;
  onFocusedDateChange: (dateIso: string) => void;
  onShowAgenda: () => void;
  onOpenYearOverview: () => void;
}


export const CalendarGridView = React.memo(function CalendarGridView({
  salesFocusedDay,
  ventasDia,
  metaHoy,
  calendarDays,
  dayState,
  focusedDayIso,
  isFocusedToday,
  isTodayGoalMet,
  showLegend,
  earliestIso,
  appTodayStr,
  dayGoalUnits,
  periodGoals,
  hasPrevMonth,
  hasNextMonth,
  canPrevDay,
  canNextDay,
  onPrevMonth,
  onNextMonth,
  onPrevDay,
  onNextDay,
  onToggleLegend,
  onSelectDay,
  onFocusedDateChange,
  onShowAgenda,
  onOpenYearOverview,
}: CalendarGridViewProps) {
  const isFocusedDayGoalMet = ventasDia >= metaHoy && metaHoy > 0;
  const currentTheme = getCardTheme(dayState);
  const reducedMotion = typeof document !== 'undefined'
    && document.documentElement.dataset.reducedMotion === 'true';
  const [daySwipeDirection, setDaySwipeDirection] = useState<'left' | 'right' | null>(null);
  const swipeDayChangeRef = useRef(false);

  const handleDaySwipeEnd = useCallback((offsetX: number) => {
    if (offsetX < -36 && canNextDay) {
      swipeDayChangeRef.current = true;
      setDaySwipeDirection('left');
      onNextDay();
      return;
    }
    if (offsetX > 36 && canPrevDay) {
      swipeDayChangeRef.current = true;
      setDaySwipeDirection('right');
      onPrevDay();
    }
  }, [canNextDay, canPrevDay, onNextDay, onPrevDay]);

  useEffect(() => {
    if (!swipeDayChangeRef.current) {
      setDaySwipeDirection(null);
    }
    swipeDayChangeRef.current = false;
  }, [focusedDayIso]);

  const daySlideVariants = {
    enter: (direction: 'left' | 'right' | null) => ({
      opacity: 0,
      x: direction === 'left' ? 42 : direction === 'right' ? -42 : 0,
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction: 'left' | 'right' | null) => ({
      opacity: 0,
      x: direction === 'left' ? -42 : direction === 'right' ? 42 : 0,
    }),
  };

  return (
    <motion.div
      key="calendar-view"
      initial={{ opacity: 0, scale: 0.95, y: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[410px] flex flex-col gap-2.5 sm:gap-3 z-20 justify-start pb-5"
    >

      {/* Selector de fecha + tarjeta meta diaria — deslizar izq/der cambia el día */}
      <motion.div
        className="relative mb-1 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        dragMomentum={false}
        onDragEnd={(_, { offset }) => handleDaySwipeEnd(offset.x)}
      >
        <AnimatePresence mode="wait" custom={daySwipeDirection} initial={false}>
          <motion.div
            key={focusedDayIso}
            custom={daySwipeDirection}
            variants={daySlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1.5"
          >
            <CalendarDateParts
              focusedDayIso={focusedDayIso}
              earliestIso={earliestIso}
              appTodayStr={appTodayStr}
              onDateChange={onFocusedDateChange}
              onOpenYearOverview={onOpenYearOverview}
              isOnDarkSurface={isTodayGoalMet}
              hasPrevMonth={hasPrevMonth}
              hasNextMonth={hasNextMonth}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
            />

            <motion.div
          className="relative overflow-hidden rounded-[1.75rem] p-3.5 sm:p-5 flex items-center justify-between shadow-2xl w-full group transition-all duration-300 ease-out border cursor-pointer active:scale-95"
          style={{ 
            background: currentTheme.bg, 
            borderColor: currentTheme.barBorder || 'rgba(255,255,255,0.1)',
            boxShadow: dayState === 'logrado' || dayState === 'superado' 
              ? '0 12px 30px rgba(0,0,0,0.15), 0 0 40px rgba(16,185,129,0.2)' 
              : '0 8px 20px rgba(0,0,0,0.06)' 
          }}
          onClick={onShowAgenda}
        >
          {/* Efectos decorativos de fondo (Brillos y sombras) */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black opacity-15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Inner Highlight Overlay for Logrado/Superado */}
          { (dayState === 'logrado' || dayState === 'superado') && (
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          )}

          {isFocusedToday && (
          <motion.div
            className="calendar-today-inner-ring absolute inset-[4px] sm:inset-[5px] rounded-[1.72rem] sm:rounded-[1.82rem] pointer-events-none z-[6]"
            style={{
              background: getTodayCardRingGradient(dayState),
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '2px',
            }}
            animate={reducedMotion ? { opacity: 0.58 } : { opacity: [0.22, 0.82, 0.22] }}
            transition={reducedMotion
              ? { duration: 0 }
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
          )}

          <div className="flex flex-col z-20 w-[55%] pointer-events-none pl-2">
            <div className="relative flex items-center justify-end mb-1 sm:mb-2 z-10 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLegend(e);
                }}
                className="transition-colors focus:outline-none hover:opacity-100 shrink-0"
                title="Más información"
                style={{ color: currentTheme.text, opacity: 0.6 }}
              >
                <Info size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* --- Cuerpo Principal: Estadísticas Centrales --- */}
            <div className="relative flex items-center justify-start z-10 py-1">
              {/* Progreso */}
              <div className="flex items-baseline" style={{ color: currentTheme.text }}>
                <span 
                  className="text-[3.4rem] sm:text-[4.4rem] font-black tracking-tighter leading-none drop-shadow-md"
                  style={{
                    textShadow: dayState === 'logrado' || dayState === 'superado' 
                      ? '0 2px 10px rgba(0,0,0,0.3)' 
                      : '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  {ventasDia}
                </span>
                <span className="text-2xl sm:text-3xl font-bold ml-1 sm:ml-2 opacity-50">
                  /{metaHoy}
                </span>
              </div>
            </div>

            <div className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] mt-0 sm:mt-1 mb-2 uppercase z-10" style={{ color: currentTheme.text, opacity: 0.78 }}>
              Meta diaria
            </div>

            {/* --- Extra UX: Barra de Progreso Visual Segmentada por color --- */}
            <ColoredGoalProgressBar
              goal={metaHoy}
              units={dayGoalUnits}
              percent={metaHoy > 0 ? Math.min(100, Math.round((ventasDia / metaHoy) * 100)) : 0}
              mode="discrete"
              isOnDark={dayState === 'logrado' || dayState === 'superado'}
              className="relative z-10 mt-1 sm:mt-2 pr-2 sm:pr-4"
            />
            
          </div>

        <div className="w-[45%] flex flex-col items-center justify-center relative z-10 pointer-events-none h-full pl-2 pr-0 sm:pr-2">
          {/* Trophy Pedestal & Glow Structure */}
          { (dayState === 'logrado' || dayState === 'superado') && (
            <div className="absolute top-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-2xl z-0 mix-blend-plus-lighter pointer-events-none" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}></div>
          )}
          
          <div className="relative flex flex-col items-center justify-end w-full max-w-full h-[78px] sm:h-[88px] mt-1 pointer-events-none">
            <div className="flex items-end justify-center z-10 w-full">
              {ventasDia > 0 ? (
                salesFocusedDay.slice(-4).map((sale, i, arr) => {
                  const total = arr.length;
                  const isSingle = total === 1;
                  
                  // Clean horizontal lineup
                  const scale = isSingle ? 1.15 : 1;
                  const overlapClass = i > 0 ? "-ml-[12px] sm:-ml-[16px]" : "";
                  
                      return (
                        <motion.div 
                          key={`phone-${sale.id || i}`} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.1 }}
                          className={`relative flex flex-col items-center justify-end ${overlapClass}`}
                          style={{ zIndex: i }}
                        >
                          <motion.div 
                            className="transition-all duration-300 relative flex items-end justify-center"
                            animate={{ scale }}
                          >
                            <VivoPhoneIcon 
                              deviceId={sale.deviceId} 
                              colorName={sale.deviceColorSnapshot || sale.deviceColor || ''} 
                              className="h-[75px] sm:h-[85px] w-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" 
                            />
                          </motion.div>
                          {isSingle && (
                            <span className="absolute -bottom-4 sm:-bottom-5 text-[6.5px] sm:text-[7px] font-black uppercase text-white/95 bg-black/40 px-1.5 py-[2px] rounded border border-white/10 tracking-widest leading-none shadow-sm backdrop-blur-md z-10 whitespace-nowrap">
                              {(sale.deviceNameSnapshot || sale.deviceId).replace('_lite', 'L').toUpperCase()}
                            </span>
                          )}
                        </motion.div>
                      );
                })
              ) : (
                <div className="flex flex-col items-center justify-center opacity-35 select-none px-2 text-white/80 pb-4">
                  <Target size={18} className="mb-1" />
                  <span className="text-[0.55rem] uppercase tracking-wider font-extrabold">Cero</span>
                </div>
              )}
            </div>
            
            {/* Shared base shadow for grounded feel */}
            { (dayState === 'logrado' || dayState === 'superado') && ventasDia > 0 && (
              <>
                <div className="absolute bottom-0 w-[80%] max-w-[120px] h-[4px] rounded-[100%] bg-black/30 blur-[2px] z-0 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute bottom-0 w-[50%] max-w-[80px] h-[2px] rounded-[100%] bg-emerald-300/40 blur-[1px] z-0"></div>
              </>
            )}
          </div>
        </div>

        </motion.div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showLegend && (
            <StatusGuideSheet onClose={() => onToggleLegend({ stopPropagation: () => {} } as React.MouseEvent)} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid mensual — deslizar izq/der también cambia el día enfocado */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={(_, { offset }) => handleDaySwipeEnd(offset.x)}
        className="w-full flex flex-col shrink-0"
      >
        
        {/* Days of week labels */}
        <div className="grid grid-cols-7 text-center text-[10px] sm:text-[11px] font-black mb-3 shrink-0">
          <div className={`${isTodayGoalMet ? 'text-pink-400' : 'text-pink-500 dark:text-pink-400'}`}>D</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>L</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>M</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>M</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>J</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>V</div>
          <div className={`${isTodayGoalMet ? 'text-white/60' : 'text-slate-400'}`}>S</div>
        </div>

        {/* Grid list container */}
        <div className="w-full grid grid-cols-7 gap-2 sm:gap-2.5 pb-1">
          {calendarDays.map((item, index) => {
            const isPaddingCell = item.state === 'vacio' && !item.day;
            const soldDevices = Array.isArray(item.soldDevices) ? item.soldDevices : [];
            const isFocusedDay = item.dateIso === focusedDayIso && !isPaddingCell;
            const isBeforeFirstRecord = Boolean(item.dateIso && item.dateIso < earliestIso);
            const hasSales = item.salesCount > 0;

            const dayStyle = isPaddingCell
              ? { cls: 'bg-transparent border-none', css: {} }
              : hasSales
                ? getDayStyle(item.state)
                : item.state === 'pendiente'
                  ? getPendingDayStyle(isTodayGoalMet)
                  : getNoRecordDayStyle(isTodayGoalMet);

            return (
              <div 
                key={`day-${item.id}-${index}`} 
                className={`relative w-full aspect-square rounded-xl sm:rounded-2xl ${dayStyle.cls} ${
                  isPaddingCell
                    ? 'pointer-events-none'
                    : isBeforeFirstRecord
                      ? 'pointer-events-none opacity-85'
                      : 'cursor-pointer active:scale-95 transition-all duration-100'
                } ${isFocusedDay ? 'z-10 ring-2 ring-[#343A43]/25 ring-offset-1 ring-offset-transparent' : ''}`}
                style={{
                  ...dayStyle.css
                }}
                onClick={() => {
                  if (!item.dateIso || isBeforeFirstRecord) return;
                  onSelectDay(item.dateIso);
                  onShowAgenda();
                }}
              >
                {item.day && (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] sm:text-[12px] font-black pointer-events-none">
                    {item.day}
                  </span>
                )}

                {item.hasCompletedChallenge && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-black/10" title="Reto cumplido" />
                )}
                {item.hasActiveChallenge && !item.hasCompletedChallenge && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 border border-black/10" title="Reto pendiente" />
                )}
                
                {soldDevices.length > 0 && item.day && (
                  <div className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 pointer-events-none">
                    <span className="text-[8px] sm:text-[9px] font-black leading-none tracking-wide" style={{ color: '#343A43' }}>
                      x{item.salesCount}
                    </span>
                    <Smartphone
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]"
                      strokeWidth={2.4}
                      style={{ color: '#343A43' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </motion.div>

      <GoalPeriodCards
        periods={periodGoals}
        isOnDark={isTodayGoalMet}
      />
    </motion.div>
  );
});
