import { SaleRecord, PointsBonusRecord } from '../types';
import { DEFAULT_DEVICES } from './constants';
import { getAppSettings } from './storage';
import { getAppToday, parseLocalDateKey } from './date';
import { filterSalesByPeriod } from './analytics';

export const PROMOTER_LEVELS = [
  { min: 0, label: 'Promotor Nuevo', shortLabel: 'Nuevo', color: '#94a3b8' },
  { min: 100, label: 'Promotor Activo', shortLabel: 'Activo', color: '#38bdf8' },
  { min: 300, label: 'Promotor Pro', shortLabel: 'Pro', color: '#a78bfa' },
  { min: 600, label: 'Promotor Elite', shortLabel: 'Elite', color: '#fbbf24' },
] as const;

export const CHALLENGE_POINTS_BY_PRIORITY = {
  high: 25,
  medium: 15,
  low: 10,
} as const;

export const PRACTICE_POINTS = 8;
export const ACHIEVEMENT_POINTS = 20;

export const getModelPointsPerUnit = (modelId: string): number =>
  DEFAULT_DEVICES.find((device) => device.id === modelId)?.points ?? 0;

export const getModelDisplayPoints = (modelId: string): number =>
  getModelPointsPerUnit(modelId);

export const calculateSalePoints = (modelId: string, quantity = 1): number =>
  getModelPointsPerUnit(modelId) * Math.max(quantity, 1);

export const getSalePoints = (sale: SaleRecord): number => {
  if (typeof sale.pointsEarned === 'number') return sale.pointsEarned;
  return calculateSalePoints(sale.deviceId, sale.quantity || 1);
};

export const getMonthlyPointsGoal = (): number => {
  const settings = getAppSettings();
  const dailyGoal = Math.max(settings.dailyGoal || 3, 1);
  return Math.max(300, dailyGoal * 18 * 22);
};

export const getPromoterLevel = (totalPoints: number) => {
  const level = [...PROMOTER_LEVELS].reverse().find((entry) => totalPoints >= entry.min);
  return level ?? PROMOTER_LEVELS[0];
};

export const getNextPromoterLevel = (totalPoints: number) => {
  return PROMOTER_LEVELS.find((entry) => entry.min > totalPoints) ?? null;
};

export const sumSalePoints = (sales: SaleRecord[]): number =>
  sales.reduce((sum, sale) => sum + getSalePoints(sale), 0);

export const sumBonusPoints = (bonuses: PointsBonusRecord[]): number =>
  bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

export const getPointsSummary = (
  sales: SaleRecord[],
  bonuses: PointsBonusRecord[],
) => {
  const monthlySales = filterSalesByPeriod(sales, 'month');
  const monthPrefix = getAppToday().slice(0, 7);
  const monthlyBonuses = bonuses.filter((bonus) => bonus.date.startsWith(monthPrefix));

  const lifetimeFromSales = sumSalePoints(sales);
  const lifetimeFromBonuses = sumBonusPoints(bonuses);
  const totalPoints = lifetimeFromSales + lifetimeFromBonuses;

  const monthlyFromSales = sumSalePoints(monthlySales);
  const monthlyFromBonuses = sumBonusPoints(monthlyBonuses);
  const monthlyPoints = monthlyFromSales + monthlyFromBonuses;
  const monthlyGoal = getMonthlyPointsGoal();
  const monthlyProgressPercent = monthlyGoal > 0
    ? Math.min(100, Math.round((monthlyPoints / monthlyGoal) * 100))
    : 0;

  const level = getPromoterLevel(totalPoints);
  const nextLevel = getNextPromoterLevel(totalPoints);
  const pointsToNextLevel = nextLevel ? Math.max(nextLevel.min - totalPoints, 0) : 0;

  return {
    totalPoints,
    monthlyPoints,
    monthlyGoal,
    monthlyProgressPercent,
    monthlyFromSales,
    monthlyFromBonuses,
    level,
    nextLevel,
    pointsToNextLevel,
  };
};

export const getChallengeBonusPoints = (priority: keyof typeof CHALLENGE_POINTS_BY_PRIORITY): number =>
  CHALLENGE_POINTS_BY_PRIORITY[priority] ?? CHALLENGE_POINTS_BY_PRIORITY.low;

export const buildSalePointsSnapshot = (deviceId: string, quantity = 1) => {
  const pointsPerUnitSnapshot = getModelPointsPerUnit(deviceId);
  return {
    pointsPerUnitSnapshot,
    pointsEarned: pointsPerUnitSnapshot * Math.max(quantity, 1),
  };
};

export const formatPoints = (value: number) => `${Math.round(value).toLocaleString('es-MX')} pts`;
