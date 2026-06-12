import { Sale, CalendarDayStatus, CalendarDayRecord, CalendarSoldDeviceSummary, WorkDayStatus, SalesDayStatus } from '@/types/sale';
import { getManualDayRecords, saveManualDayRecord } from './storage';

const GOAL_EXCEEDED_MULTIPLIER = 1.2;

export function getCalendarDailySummary(
  dayNumber: number,
  selectedMonth: number,
  selectedYear: number,
  schedule: any[] | null,
  sales: Sale[],
  dailyDeviceGoal: number,
  currentDayOfWeekIdx: number
): CalendarDayRecord {
  const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
  
  // 1. Check if there are manual records first
  const manualRecords = getManualDayRecords();
  if (manualRecords[dateKey]) {
    // We already have a manual state. Recalculate sales just in case it changed (though usually manual means no sales initially, but they could have added sales later).
    // It's better to always recalculate sales to ensure amounts are up to date.
  }

  // Calculate daily sales logic
  const dailySales = sales.filter(sale => {
    const saleParts = sale.date.split('-');
    if (saleParts.length === 3) {
      const sYear = parseInt(saleParts[0]);
      const sMonth = parseInt(saleParts[1]) - 1; 
      const sDay = parseInt(saleParts[2]);
      return sYear === selectedYear && sMonth === selectedMonth && sDay === dayNumber;
    }
    return false;
  });

  const totalEarned = dailySales.reduce((sum, sale) => sum + sale.amountEarned, 0);
  const totalDevicesSold = dailySales.length;

  // Group devices sold
  const soldDevicesMap = new Map<string, CalendarSoldDeviceSummary>();
  dailySales.forEach(sale => {
    const key = `${sale.deviceId}-${sale.deviceColor || 'default'}`;
    if (soldDevicesMap.has(key)) {
      const existing = soldDevicesMap.get(key)!;
      existing.quantity += 1;
      existing.totalEarned += sale.amountEarned;
    } else {
      soldDevicesMap.set(key, {
        deviceId: sale.deviceId,
        deviceName: sale.deviceName,
        colorName: sale.deviceColor || '',
        quantity: 1,
        totalEarned: sale.amountEarned
      });
    }
  });

  const soldDevices = Array.from(soldDevicesMap.values());

  // Determine standard work day status based on schedule
  let workDayStatus: WorkDayStatus = 'worked';
  const isRestFromSchedule = schedule && schedule[currentDayOfWeekIdx] && !schedule[currentDayOfWeekIdx].active;
  if (isRestFromSchedule) {
    workDayStatus = 'rest';
  }

  // Determine sales day status based on earnings
  let salesDayStatus: SalesDayStatus = 'empty';
  if (totalDevicesSold > 0) {
    if (totalDevicesSold >= dailyDeviceGoal * GOAL_EXCEEDED_MULTIPLIER) {
      salesDayStatus = 'goal-exceeded';
    } else if (totalDevicesSold >= dailyDeviceGoal) {
      salesDayStatus = 'goal-met';
    } else {
      salesDayStatus = 'below-goal';
    }
  } else {
    salesDayStatus = 'no-sale';
  }

  // If there's a manual record, it overrides the workDayStatus
  const manualRecord = manualRecords[dateKey];
  if (manualRecord && manualRecord.manualStatus) {
    workDayStatus = manualRecord.workDayStatus;
  }

  return {
    date: dateKey,
    workDayStatus,
    salesDayStatus,
    manualStatus: manualRecord?.manualStatus || false,
    totalEarned,
    soldDevices,
    updatedAt: new Date().toISOString()
  };
}

export function getDayStatusColor(record: CalendarDayRecord | null): string {
  if (!record) return '';

  if (record.workDayStatus === 'rest') return 'rest';
  if (record.workDayStatus === 'not-attended') return 'not-attended';
  if (record.workDayStatus === 'worked' && record.totalEarned === 0) return 'no-sale';
  
  return record.salesDayStatus; // 'below-goal', 'goal-met', 'goal-exceeded'
}
