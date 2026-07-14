import { SaleRecord, AppSettings } from '../types';
import { filterSalesByPeriod, getPeriodElapsedMeta } from './analytics';
import { getHexForColorName } from '../features/calendar/calendarUtils';

export type DeviceGoalSegment = {
  key: string;
  deviceId: string;
  deviceName: string;
  colorName: string;
  colorHex: string;
  count: number;
};

export type GoalUnit = {
  colorHex: string;
  deviceId: string;
  deviceName: string;
  colorName: string;
};

export type PeriodGoalProgress = {
  id: 'week' | 'month' | 'year';
  label: string;
  current: number;
  goal: number;
  projected: number;
  percent: number;
  projectedPercent: number;
  elapsedPercent: number;
  elapsedCaption: string;
  segments: DeviceGoalSegment[];
  units: GoalUnit[];
};

export type PeriodGoalsConfig = {
  weeklyGoal: number;
  monthlyGoal: number;
  annualGoal: number;
  commissionGoal: number;
};

export const resolveSaleColorHex = (sale: SaleRecord): string =>
  sale.variantColorHexSnapshot
  || getHexForColorName(sale.deviceColorSnapshot || sale.deviceColor || '');

export const expandSalesToUnits = (sales: SaleRecord[]): GoalUnit[] => {
  const units: GoalUnit[] = [];

  sales.forEach((sale) => {
    const qty = Math.max(sale.quantity || 1, 1);
    const colorHex = resolveSaleColorHex(sale);
    const deviceName = sale.deviceNameSnapshot || sale.deviceName || sale.deviceId;
    const colorName = sale.deviceColorSnapshot || sale.deviceColor || '';

    for (let i = 0; i < qty; i += 1) {
      units.push({
        colorHex,
        deviceId: sale.deviceId,
        deviceName,
        colorName,
      });
    }
  });

  return units;
};

export const groupUnitsToSegments = (units: GoalUnit[]): DeviceGoalSegment[] => {
  const map = new Map<string, DeviceGoalSegment>();

  units.forEach((unit) => {
    const key = `${unit.deviceId}::${unit.colorName}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }
    map.set(key, {
      key,
      deviceId: unit.deviceId,
      deviceName: unit.deviceName,
      colorName: unit.colorName,
      colorHex: unit.colorHex,
      count: 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

export const derivePeriodGoals = (settings: AppSettings): PeriodGoalsConfig => {
  const dailyGoal = Math.max(settings.dailyGoal || 3, 1);
  const monthlyGoal = Math.max(settings.monthlyGoal || 30, 1);
  const weeklyGoal = Math.max(Math.ceil(monthlyGoal / 4), dailyGoal * 5);
  const annualGoal = monthlyGoal * 12;

  return {
    weeklyGoal,
    monthlyGoal,
    annualGoal,
    commissionGoal: Math.max(settings.commissionGoal || 0, 0),
  };
};

export const projectDevicesByElapsed = (current: number, elapsedPercent: number) => {
  if (current <= 0) return 0;
  if (elapsedPercent <= 0) return current;
  const elapsedFraction = Math.min(1, elapsedPercent / 100);
  return Math.round(current / Math.max(elapsedFraction, 0.04));
};

export const buildPeriodGoalProgress = (
  sales: SaleRecord[],
  period: 'week' | 'month' | 'year',
  goal: number,
): PeriodGoalProgress => {
  const periodSales = filterSalesByPeriod(sales, period);
  const units = expandSalesToUnits(periodSales);
  const current = units.length;
  const safeGoal = Math.max(goal, 1);
  const elapsed = getPeriodElapsedMeta(period);
  const projected = projectDevicesByElapsed(current, elapsed.percent);
  const percent = Math.min(100, Math.round((current / safeGoal) * 100));
  const projectedPercent = Math.min(100, Math.round((projected / safeGoal) * 100));

  const labels: Record<typeof period, string> = {
    week: 'Meta semanal',
    month: 'Meta mensual',
    year: 'Meta anual',
  };

  return {
    id: period,
    label: labels[period],
    current,
    goal: safeGoal,
    projected,
    percent,
    projectedPercent,
    elapsedPercent: elapsed.percent,
    elapsedCaption: elapsed.caption,
    segments: groupUnitsToSegments(units),
    units,
  };
};

export const buildDayGoalUnits = (sales: SaleRecord[]): GoalUnit[] =>
  expandSalesToUnits(sales);
