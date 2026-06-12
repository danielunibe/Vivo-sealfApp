'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CalendarGrid from './CalendarGrid';
import { Sale } from '@/types/sale';
import SectionCard from '../ui/SectionCard';

interface CalendarMonthViewProps {
  theme: 'light' | 'dark';
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  getCampaignEvent: (day: number) => string;
  sales?: Sale[];
  hasNewCalendarSale?: boolean;
}

const SPANISH_WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SPANISH_MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const monthVariants = {
  enter: (dir: number) => ({
    x: dir * 260,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(2px)'
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)'
  },
  exit: (dir: number) => ({
    x: -dir * 260,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(2px)'
  })
};

export default function CalendarMonthView({
  theme,
  selectedDay,
  setSelectedDay,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  getCampaignEvent,
  sales = [],
  hasNewCalendarSale
}: CalendarMonthViewProps) {
  
  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  const startOffset = React.useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday
    return firstDay === 0 ? 6 : firstDay - 1; // 0 = Monday, ..., 6 = Sunday
  }, [selectedYear, selectedMonth]);

  const getDayOfWeekIndex = (day: number) => {
    return (startOffset + (day - 1)) % 7;
  };

  const activeWeekday = SPANISH_WEEKDAYS[getDayOfWeekIndex(selectedDay)];

  const handlePrevMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    const maxDaysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const newDay = selectedDay > maxDaysInNewMonth ? maxDaysInNewMonth : selectedDay;
    setSelectedDay(newDay);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    const maxDaysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const newDay = selectedDay > maxDaysInNewMonth ? maxDaysInNewMonth : selectedDay;
    setSelectedDay(newDay);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      const prevMonthDays = new Date(newYear, newMonth + 1, 0).getDate();
      setSelectedDay(prevMonthDays);
      setSelectedMonth(newMonth);
      setSelectedYear(newYear);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < totalDays) {
      setSelectedDay(selectedDay + 1);
    } else {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setSelectedDay(1);
      setSelectedMonth(newMonth);
      setSelectedYear(newYear);
    }
  };

  // Direction state tracking for smooth horizontal transition (Derived State)
  const currentMonthValue = selectedYear * 12 + selectedMonth;
  const prevMonthValue = React.useRef(currentMonthValue);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
    if (currentMonthValue === prevMonthValue.current) return;
    setDirection(currentMonthValue > prevMonthValue.current ? 1 : -1);
    prevMonthValue.current = currentMonthValue;
  }, [currentMonthValue]);

  return (
    <SectionCard theme={theme} className="calendar-month-card overflow-hidden relative flex flex-col justify-between" heightClass="h-[340px] xs:h-[395px] max-h-full min-h-0 flex-1">
      <div className="flex-1 w-full h-full relative overflow-hidden select-none">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div 
            key={currentMonthValue}
            custom={direction}
            variants={monthVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.95
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                handleNextMonth();
              } else if (info.offset.x > swipeThreshold) {
                handlePrevMonth();
              }
            }}
            className="w-full h-full flex flex-col justify-between cursor-grab active:cursor-grabbing absolute inset-0 py-0.5"
          >
            {/* 1. Sleek Compact Header & Navigation Dashboard Row */}
            <div className="flex items-center justify-between mb-3 px-3">
              <div className="flex items-center gap-2">
                {/* Display Day Number */}
                <div className={`text-[28px] font-black leading-none tracking-tighter font-serif transition-colors duration-300 ${
                  theme === 'light' ? 'text-neutral-900' : 'text-white'
                }`}>
                  {selectedDay}
                </div>
                
                <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-850 pl-2">
                  {/* Month & Year Label */}
                  <span className={`text-[9.5px] font-black tracking-widest font-mono uppercase leading-none transition-colors duration-300 ${
                    theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
                  }`}>
                    {SPANISH_MONTHS[selectedMonth]} {selectedYear}
                  </span>
                  
                  {/* Weekday indicator */}
                  <span className="text-[8px] font-mono uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 mt-0.5 leading-none">
                    {activeWeekday}
                  </span>
                </div>
              </div>

              {/* Minimalist Navigation Chevrons integrated directly to the right */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevDay();
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'text-neutral-900 hover:bg-neutral-100/80 border-neutral-200' 
                      : 'text-neutral-100 hover:bg-neutral-900 border border-neutral-800/60'
                  }`}
                  title="Día Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextDay();
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'text-neutral-900 hover:bg-neutral-100/80 border-neutral-200' 
                      : 'text-neutral-100 hover:bg-neutral-900 border border-neutral-800/60'
                  }`}
                  title="Día Siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Calendar Grid Components */}
            <CalendarGrid 
              theme={theme}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              startOffset={startOffset}
              totalDays={totalDays}
              sales={sales}
              hasNewCalendarSale={hasNewCalendarSale}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
