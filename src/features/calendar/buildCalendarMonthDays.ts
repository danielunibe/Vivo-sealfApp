import { DailyChallenge, PhoneModel, SaleRecord } from '../../types';
import { getPhoneModels, getAppSettings } from '../../lib/storage';
import { getPhoneModelCalendarImage } from '../../lib/deviceImages';
import { toLocalDateKey } from '../../lib/date';
import { getSaleDayKey } from '../../lib/saleTimestamps';

export type CalendarDayDevice = {
  key: string;
  deviceId: string;
  deviceName: string;
  colorName: string;
  imagePath: string;
};

export type CalendarMonthDay = {
  id: string;
  day: string;
  state: string;
  dateIso: string;
  salesCount: number;
  soldDevices: CalendarDayDevice[];
  hasCompletedChallenge?: boolean;
  hasActiveChallenge?: boolean;
  isSelectable?: boolean;
};

type BuildMonthParams = {
  year: number;
  month: number;
  sales: SaleRecord[];
  challenges: DailyChallenge[];
  goal: number;
  phoneModels?: PhoneModel[];
  appTodayStr: string;
  earliestIso: string;
};

export function buildCalendarMonthDays({
  year,
  month,
  sales,
  challenges,
  goal,
  phoneModels,
  appTodayStr,
  earliestIso,
}: BuildMonthParams): CalendarMonthDay[] {
  const catalogModels = phoneModels ?? getPhoneModels();
  const list: CalendarMonthDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const appSettings = getAppSettings();
  const workSchedule = appSettings.workSchedule;
  const todaySimulated = new Date(`${appTodayStr}T12:00:00`);
  const isCurrentMonth = year === todaySimulated.getFullYear() && month === todaySimulated.getMonth();
  const currentDayStr = appTodayStr.split('-')[2];

  for (let i = 0; i < firstDayIndex; i++) {
    list.push({ id: `start-e${i}`, day: '', state: 'vacio', dateIso: '', salesCount: 0, soldDevices: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d);
    const dayIso = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const isBeforeFirstRecord = dayIso < earliestIso;
    const isAfterToday = isCurrentMonth ? d > parseInt(currentDayStr, 10) : false;
    const isSelectable = !isBeforeFirstRecord && !isAfterToday;

    if (isBeforeFirstRecord) {
      list.push({
        id: dayStr,
        day: dayStr,
        state: 'vacio',
        dateIso: dayIso,
        salesCount: 0,
        soldDevices: [],
        isSelectable: false,
      });
      continue;
    }

    const daySales = sales.filter((sale) => getSaleDayKey(sale) === dayIso);
    const salesCount = daySales.reduce((acc, sale) => acc + (sale.quantity || 1), 0);
    const soldDevices: CalendarDayDevice[] = daySales.flatMap((sale, saleIndex) => {
      const qty = Math.max(sale.quantity || 1, 1);
      const modelFallback = catalogModels.find((model) => model.id === sale.deviceId);
      const imagePath =
        sale.deviceImageSnapshot ||
        (modelFallback
          ? getPhoneModelCalendarImage(modelFallback, sale.deviceColorSnapshot || sale.deviceColor || '')
          : '');

      return Array.from({ length: qty }, (_, unitIndex) => ({
        key: `${sale.id || dayIso}-${saleIndex}-${unitIndex}`,
        deviceId: sale.deviceId,
        deviceName: sale.deviceNameSnapshot || sale.deviceName || sale.deviceId,
        colorName: sale.deviceColorSnapshot || sale.deviceColor || '',
        imagePath,
      }));
    });

    const dayChallenges = challenges.filter((challenge) => {
      const cDate = toLocalDateKey(new Date(challenge.createdAt));
      return cDate === dayIso;
    });
    const hasCompletedChallenge = dayChallenges.some((c) => c.status === 'completed');
    const hasActiveChallenge = dayChallenges.some((c) => c.status === 'active');

    const dayOfWeek = new Date(year, month, d).getDay();
    let isRestDay = false;
    if (workSchedule) {
      if (workSchedule.fixedRestDays.includes(dayOfWeek)) isRestDay = true;
      if (workSchedule.manualRestDates.includes(dayIso)) isRestDay = true;
    } else {
      isRestDay = dayOfWeek === 0;
    }

    let state = 'pendiente';
    if (isRestDay) {
      state = 'libre';
    } else if (isAfterToday) {
      state = 'pendiente';
    } else if (salesCount > goal) {
      state = 'superado';
    } else if (salesCount === goal) {
      state = 'logrado';
    } else if (salesCount > 0) {
      state = 'parcial';
    } else {
      state = 'falta';
    }

    list.push({
      id: dayStr,
      day: dayStr,
      state,
      dateIso: dayIso,
      salesCount,
      soldDevices,
      hasCompletedChallenge,
      hasActiveChallenge,
      isSelectable,
    });
  }

  let emptyCounter = 1;
  const totalCells = Math.ceil(list.length / 7) * 7;
  while (list.length < totalCells) {
    list.push({
      id: `end-e${emptyCounter++}`,
      day: '',
      state: 'vacio',
      dateIso: '',
      salesCount: 0,
      soldDevices: [],
      isSelectable: false,
    });
  }

  return list;
}
