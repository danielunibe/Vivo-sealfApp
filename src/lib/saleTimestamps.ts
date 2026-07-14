import { SaleRecord } from '../types';
import { getAppToday, getAppNow, parseLocalDateKey, toLocalDateKey } from './date';

export type SaleRecordedAt = {
  date: string;
  createdAt: number;
  recordedTime: string;
  recordedAtIso: string;
};

const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatLocalTime = (date: Date): string =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;

export const formatLocalDateTimeIso = (date: Date): string =>
  `${toLocalDateKey(date)}T${formatLocalTime(date)}`;

export const buildSaleRecordedAt = (date: Date): SaleRecordedAt => ({
  date: toLocalDateKey(date),
  createdAt: date.getTime(),
  recordedTime: formatLocalTime(date),
  recordedAtIso: formatLocalDateTimeIso(date),
});

export const getNowForSaleRecording = (): SaleRecordedAt => buildSaleRecordedAt(getAppNow());

export const buildSaleRecordedAtForDate = (
  dateKey: string,
  clockSource: Date = new Date(),
): SaleRecordedAt => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return buildSaleRecordedAt(new Date(
    year,
    month - 1,
    day,
    clockSource.getHours(),
    clockSource.getMinutes(),
    clockSource.getSeconds(),
    clockSource.getMilliseconds(),
  ));
};

export const resolveSaleTimestamps = (sale: Pick<SaleRecord, 'date' | 'createdAt' | 'recordedTime' | 'recordedAtIso'>): SaleRecordedAt => {
  if (sale.recordedTime && sale.recordedAtIso && sale.createdAt) {
    return {
      date: sale.date,
      createdAt: sale.createdAt,
      recordedTime: sale.recordedTime,
      recordedAtIso: sale.recordedAtIso,
    };
  }

  const createdAt = sale.createdAt || parseLocalDateKey(sale.date).getTime();
  const rebuilt = buildSaleRecordedAtForDate(sale.date, new Date(createdAt));

  return {
    date: sale.date,
    createdAt,
    recordedTime: sale.recordedTime || rebuilt.recordedTime,
    recordedAtIso: sale.recordedAtIso || rebuilt.recordedAtIso,
  };
};

export const normalizeSaleRecordTimestamps = (
  base: Pick<SaleRecord, 'date' | 'createdAt'> & Partial<Pick<SaleRecord, 'recordedTime' | 'recordedAtIso'>>,
): SaleRecordedAt => {
  if (base.createdAt) {
    const rebuilt = buildSaleRecordedAtForDate(base.date, new Date(base.createdAt));
    return {
      date: base.date,
      createdAt: rebuilt.createdAt,
      recordedTime: base.recordedTime || rebuilt.recordedTime,
      recordedAtIso: base.recordedAtIso || rebuilt.recordedAtIso,
    };
  }

  const now = getNowForSaleRecording();
  if (base.date !== now.date) {
    return buildSaleRecordedAtForDate(base.date);
  }

  return now;
};

export const formatSaleTimeLabel = (sale: Pick<SaleRecord, 'date' | 'createdAt' | 'recordedTime' | 'recordedAtIso'>, use24h = true): string => {
  const timestamps = resolveSaleTimestamps(sale);
  if (use24h) return timestamps.recordedTime.slice(0, 5);

  const date = new Date(timestamps.createdAt);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const compareSalesByRecordedAt = (a: SaleRecord, b: SaleRecord): number =>
  resolveSaleTimestamps(b).createdAt - resolveSaleTimestamps(a).createdAt;

export const getSaleDayKey = (
  sale: Pick<SaleRecord, 'date' | 'createdAt' | 'recordedTime' | 'recordedAtIso'>,
): string => resolveSaleTimestamps(sale).date;

export type SalesDayGroup<T extends SaleRecord = SaleRecord> = {
  dateKey: string;
  label: string;
  sales: T[];
};

export const formatSaleDayGroupLabel = (dateKey: string): string => {
  const todayDate = parseLocalDateKey(getAppToday());
  const saleDate = parseLocalDateKey(dateKey);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((todayDate.getTime() - saleDate.getTime()) / dayMs);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';

  const label = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(saleDate);

  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const groupSalesByDay = <T extends SaleRecord>(
  sales: T[],
  labelFormatter: (dateKey: string) => string = formatSaleDayGroupLabel,
): SalesDayGroup<T>[] => {
  const groups = sales.reduce<Record<string, T[]>>((acc, sale) => {
    const dayKey = getSaleDayKey(sale);
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(sale);
    return acc;
  }, {});

  return Object.entries(groups)
    .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
    .map(([dateKey, daySales]) => ({
      dateKey,
      label: labelFormatter(dateKey),
      sales: [...daySales].sort((a, b) => compareSalesByRecordedAt(a, b)),
    }));
};

/** Pagina ventas sin partir un mismo día en varias cajas. */
export const takeSalesByCompleteDays = <T extends SaleRecord>(
  sortedSales: T[],
  limit: number,
): T[] => {
  if (sortedSales.length <= limit) return sortedSales;

  const groups = groupSalesByDay(sortedSales);
  const taken: T[] = [];

  for (const group of groups) {
    if (taken.length > 0 && taken.length + group.sales.length > limit) {
      break;
    }
    taken.push(...group.sales);
  }

  return taken.length > 0 ? taken : sortedSales.slice(0, limit);
};
