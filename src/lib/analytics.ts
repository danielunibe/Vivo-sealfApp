import { SaleRecord, DeviceModel } from '../types';
import { getSales, getDevices } from './storage';
import { getAppToday, parseLocalDateKey } from './date';

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export type PeriodElapsedMeta = {
  percent: number;
  caption: string;
};

export type PeriodMoneyProjection = {
  period: 'week' | 'month' | 'year';
  currentCommission: number;
  currentPieces: number;
  avgCommissionPerPiece: number;
  projectedCommission: number;
  projectedPieces: number;
  projectedDeviceValue: number;
  elapsed: PeriodElapsedMeta;
};

const projectByElapsed = (currentValue: number, elapsedPercent: number) => {
  if (currentValue <= 0) return 0;
  if (elapsedPercent <= 0) return currentValue;
  const elapsedFraction = Math.min(1, elapsedPercent / 100);
  return Math.round(currentValue / Math.max(elapsedFraction, 0.04));
};

export const getPeriodMoneyProjection = (
  sales: SaleRecord[],
  period: 'week' | 'month' | 'year',
): PeriodMoneyProjection => {
  const periodSales = filterSalesByPeriod(sales, period);
  const elapsed = getPeriodElapsedMeta(period);
  const currentCommission = periodSales.reduce((sum, sale) => sum + sale.amountEarned, 0);
  const currentPieces = periodSales.reduce((sum, sale) => sum + (sale.quantity || 1), 0);
  const avgCommissionPerPiece = currentPieces > 0
    ? currentCommission / currentPieces
    : 0;
  const projectedCommission = projectByElapsed(currentCommission, elapsed.percent);
  const projectedPieces = projectByElapsed(currentPieces, elapsed.percent);
  const projectedDeviceValue = Math.round(projectedPieces * avgCommissionPerPiece);

  return {
    period,
    currentCommission,
    currentPieces,
    avgCommissionPerPiece,
    projectedCommission,
    projectedPieces,
    projectedDeviceValue: projectedDeviceValue > 0 ? projectedDeviceValue : projectedCommission,
    elapsed,
  };
};

export const getPeriodElapsedMeta = (period: 'week' | 'month' | 'year'): PeriodElapsedMeta => {
  const today = parseLocalDateKey(getAppToday());

  if (period === 'week') {
    const weekday = today.getDay();
    const mondayOffset = weekday === 0 ? 6 : weekday - 1;
    const daysElapsed = mondayOffset + 1;
    return {
      percent: Math.min(100, (daysElapsed / 7) * 100),
      caption: `Día ${daysElapsed} de 7`,
    };
  }

  if (period === 'month') {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    return {
      percent: Math.min(100, (dayOfMonth / daysInMonth) * 100),
      caption: `Día ${dayOfMonth} de ${daysInMonth}`,
    };
  }

  const year = today.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const totalDays = Math.round((endOfYear.getTime() - startOfYear.getTime()) / 86_400_000) + 1;
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000) + 1;

  return {
    percent: Math.min(100, (dayOfYear / totalDays) * 100),
    caption: `Día ${dayOfYear} de ${totalDays}`,
  };
};

export const filterSalesByPeriod = (sales: SaleRecord[], period: TimePeriod): SaleRecord[] => {
  const todayStr = getAppToday();
  const today = parseLocalDateKey(todayStr);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Calculate start of current week (Monday as start)
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  // Restore today after manipulation
  const todayObj = parseLocalDateKey(todayStr);

  return sales.filter(sale => {
    const saleDate = parseLocalDateKey(sale.date);
    
    switch (period) {
      case 'today':
        return sale.date === todayStr;
      case 'week':
        return saleDate >= startOfWeek && saleDate <= todayObj;
      case 'month':
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      case 'year':
        return saleDate.getFullYear() === currentYear;
      case 'all':
      default:
        return true;
    }
  });
};

export const getPeriodStats = (period: TimePeriod) => {
  const allSales = getSales();
  const filtered = filterSalesByPeriod(allSales, period);
  
  return calculateStats(filtered);
};

export const getAllTimeStats = () => {
  return calculateStats(getSales());
};

const calculateStats = (sales: SaleRecord[]) => {
  const totalCommission = sales.reduce((sum, sale) => sum + sale.amountEarned, 0);
  const totalPieces = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  const modelCommissions: Record<string, number> = {};
  const modelPieces: Record<string, number> = {};
  const dailyCommissions: Record<string, number> = {};
  const monthlyCommissions: Record<string, number> = {};
  const monthlyPieces: Record<string, number> = {};

  sales.forEach(sale => {
    modelCommissions[sale.deviceNameSnapshot] = (modelCommissions[sale.deviceNameSnapshot] || 0) + sale.amountEarned;
    modelPieces[sale.deviceNameSnapshot] = (modelPieces[sale.deviceNameSnapshot] || 0) + sale.quantity;
    
    dailyCommissions[sale.date] = (dailyCommissions[sale.date] || 0) + sale.amountEarned;
    
    const monthKey = sale.date.substring(0, 7); // YYYY-MM
    monthlyCommissions[monthKey] = (monthlyCommissions[monthKey] || 0) + sale.amountEarned;
    monthlyPieces[monthKey] = (monthlyPieces[monthKey] || 0) + sale.quantity;
  });

  let topModelByCommission = '';
  let maxModelCommission = 0;
  Object.entries(modelCommissions).forEach(([model, comm]) => {
    if (comm > maxModelCommission) { maxModelCommission = comm; topModelByCommission = model; }
  });

  let topModelByPieces = '';
  let maxModelPieces = 0;
  Object.entries(modelPieces).forEach(([model, pcs]) => {
    if (pcs > maxModelPieces) { maxModelPieces = pcs; topModelByPieces = model; }
  });

  let bestDay = '';
  let maxDailyCommission = 0;
  Object.entries(dailyCommissions).forEach(([date, comm]) => {
    if (comm > maxDailyCommission) { maxDailyCommission = comm; bestDay = date; }
  });
  
  let bestMonth = '';
  let maxMonthlyCommission = 0;
  Object.entries(monthlyCommissions).forEach(([month, comm]) => {
    if (comm > maxMonthlyCommission) { maxMonthlyCommission = comm; bestMonth = month; }
  });

  const uniqueMonths = Object.keys(monthlyCommissions).length;
  const avgMonthlyCommission = uniqueMonths > 0 ? totalCommission / uniqueMonths : 0;
  const avgMonthlyPieces = uniqueMonths > 0 ? totalPieces / uniqueMonths : 0;
  
  const avgPerSale = sales.length > 0 ? totalCommission / sales.length : 0;

  return {
    totalCommission,
    totalPieces,
    totalSalesCount: sales.length,
    topModelByCommission,
    maxModelCommission,
    topModelByPieces,
    maxModelPieces,
    bestDay,
    maxDailyCommission,
    bestMonth,
    maxMonthlyCommission,
    avgMonthlyCommission,
    avgMonthlyPieces,
    avgPerSale
  };
};

export const getComparisonStats = () => {
  const allSales = getSales();
  const todayStr = getAppToday();
  const today = parseLocalDateKey(todayStr);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Last month
  const prevMonthDate = parseLocalDateKey(todayStr);
  prevMonthDate.setMonth(currentMonth - 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();
  
  const currentMonthSales = allSales.filter(s => {
    const d = parseLocalDateKey(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const prevMonthSales = allSales.filter(s => {
    const d = parseLocalDateKey(s.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const currMonthPieces = currentMonthSales.reduce((sum, s) => sum + s.quantity, 0);
  const prevMonthPieces = prevMonthSales.reduce((sum, s) => sum + s.quantity, 0);
  
  const currMonthComm = currentMonthSales.reduce((sum, s) => sum + s.amountEarned, 0);
  const prevMonthComm = prevMonthSales.reduce((sum, s) => sum + s.amountEarned, 0);
  
  // Weekly comparison (simplified)
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const startOfCurrentWeek = new Date(today.setDate(diff));
  startOfCurrentWeek.setHours(0, 0, 0, 0);
  
  const startOfPrevWeek = new Date(startOfCurrentWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
  
  const endOfPrevWeek = new Date(startOfCurrentWeek);
  endOfPrevWeek.setDate(endOfPrevWeek.getDate() - 1);
  endOfPrevWeek.setHours(23, 59, 59, 999);
  
  const currWeekSales = allSales.filter(s => {
    const d = parseLocalDateKey(s.date);
    return d >= startOfCurrentWeek && d <= parseLocalDateKey(todayStr);
  });
  
  const prevWeekSales = allSales.filter(s => {
    const d = parseLocalDateKey(s.date);
    return d >= startOfPrevWeek && d <= endOfPrevWeek;
  });
  
  const currWeekPieces = currWeekSales.reduce((sum, s) => sum + s.quantity, 0);
  const prevWeekPieces = prevWeekSales.reduce((sum, s) => sum + s.quantity, 0);

  return {
    month: {
      currentComm: currMonthComm,
      prevComm: prevMonthComm,
      currentPieces: currMonthPieces,
      prevPieces: prevMonthPieces,
      changeCommPercent: prevMonthComm > 0 ? ((currMonthComm - prevMonthComm) / prevMonthComm) * 100 : 0,
      changePieces: currMonthPieces - prevMonthPieces
    },
    week: {
      currentPieces: currWeekPieces,
      prevPieces: prevWeekPieces,
      changePieces: currWeekPieces - prevWeekPieces
    }
  };
};
