import { Sale, CalendarDayStatus } from '@/types/sale';

const GOAL_EXCEEDED_MULTIPLIER = 1.2;

export function getCalendarDayStatus(
  dayNumber: number,
  selectedMonth: number,
  selectedYear: number,
  schedule: any[] | null,
  sales: Sale[],
  dailyDeviceGoal: number,
  currentDayOfWeekIdx: number
): CalendarDayStatus {
  // Check if it's a rest day based on schedule (0 = Monday, 6 = Sunday based on CalendarGrid structure)
  const isRest = schedule && schedule[currentDayOfWeekIdx] && !schedule[currentDayOfWeekIdx].active;

  if (isRest) {
    return 'rest';
  }

  // Calculate daily unit count
  const dailyTotal = sales ? sales.reduce((sum, sale) => {
    const saleParts = sale.date.split('-');
    if (saleParts.length === 3) {
      const sYear = parseInt(saleParts[0]);
      const sMonth = parseInt(saleParts[1]) - 1; 
      const sDay = parseInt(saleParts[2]);
      if (sYear === selectedYear && sMonth === selectedMonth && sDay === dayNumber) {
        return sum + sale.amountEarned;
      }
    }
    return sum;
  }, 0) : 0;
  
  if (dailyTotal === 0) {
    return 'no-sale';
  } else if (dailyTotal > 0 && dailyTotal < dailyDeviceGoal) {
    return 'below-goal';
  } else if (dailyTotal >= dailyDeviceGoal && dailyTotal < dailyDeviceGoal * GOAL_EXCEEDED_MULTIPLIER) {
    return 'goal-met';
  } else if (dailyTotal >= dailyDeviceGoal * GOAL_EXCEEDED_MULTIPLIER) {
    return 'goal-exceeded';
  }

  return 'empty';
}
