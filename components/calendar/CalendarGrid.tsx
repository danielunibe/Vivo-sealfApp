import React, { useState } from 'react';
import CalendarDayCell from './CalendarDayCell';
import { Sale } from '@/types/sale';
import { getPiggyGoals, getWorkSchedule } from '@/lib/storage';
import { getCalendarDailySummary } from '@/lib/calendarDailySummary';

interface CalendarGridProps {
  theme: 'light' | 'dark';
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedMonth: number;
  selectedYear: number;
  startOffset: number;
  totalDays: number;
  sales: Sale[];
  hasNewCalendarSale?: boolean;
}

export default function CalendarGrid({
  theme,
  selectedDay,
  setSelectedDay,
  selectedMonth,
  selectedYear,
  startOffset,
  totalDays,
  sales,
  hasNewCalendarSale
}: CalendarGridProps) {
  const [goals, setGoals] = useState<any>(() => getPiggyGoals());
  const [schedule, setSchedule] = useState<any[] | null>(() => getWorkSchedule());

  return (
    <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center w-full flex-1 mb-2 px-1">
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((header, idx) => (
        <div key={idx} className="text-[10px] font-black text-neutral-400 font-mono pb-1">
          {header}
        </div>
      ))}

      {Array.from({ length: (startOffset + totalDays) > 35 ? 42 : 35 }).map((_, idx) => {
        const dayNumber = idx - startOffset + 1;
        const isValidDay = dayNumber >= 1 && dayNumber <= totalDays;
        const isSelected = selectedDay === dayNumber && isValidDay;
        
        let dayRecord = null;

        if (isValidDay) {
          const currentDayOfWeekIdx = idx % 7; 
          const dailyGoal = goals?.dailyDeviceGoal || 3; 
          
          dayRecord = getCalendarDailySummary(
            dayNumber,
            selectedMonth,
            selectedYear,
            schedule,
            sales,
            dailyGoal,
            currentDayOfWeekIdx
          );
        }

        return (
          <CalendarDayCell
            key={idx}
            theme={theme}
            dayNumber={dayNumber}
            isValidDay={isValidDay}
            isSelected={isSelected}
            record={dayRecord}
            hasNewCalendarSale={hasNewCalendarSale}
            onClick={() => {
              if (isValidDay) {
                setSelectedDay(dayNumber);
              }
            }}
          />
        );
      })}
    </div>
  );
}
