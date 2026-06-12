'use client';

import React from 'react';
import CalendarMonthView from '../calendar/CalendarMonthView';
import MissedDayPrompt from '../calendar/MissedDayPrompt';
import CalendarDaySummaryTop from '../calendar/CalendarDaySummaryTop';
import { Sale } from '@/types/sale';
import { getMonthlyVisualPattern } from '@/lib/monthlyVisualPatterns';

interface CalendarSectionProps {
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

export default function CalendarSection({
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
}: CalendarSectionProps) {
  const visualPattern = getMonthlyVisualPattern(selectedMonth);

  return (
    <div className="w-full flex-1 flex flex-col relative select-none h-full">
      <div 
        className="absolute inset-0 z-0 pointer-events-none rounded-[40px] opacity-25 dark:opacity-40 transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(ellipse at top, ${visualPattern.calendarTint} 0%, transparent 80%)`
        }}
      />
      <div className="relative z-10 w-full flex-1 overflow-y-auto scrollbar-none pt-1 flex flex-col dock-safe-pb">
        <MissedDayPrompt theme={theme} sales={sales} />
        
        <CalendarDaySummaryTop 
          theme={theme}
          selectedDay={selectedDay}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          sales={sales}
        />
        
        <CalendarMonthView
          theme={theme}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          getCampaignEvent={getCampaignEvent}
          sales={sales}
          hasNewCalendarSale={hasNewCalendarSale}
        />
      </div>
    </div>
  );
}
