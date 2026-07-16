import { getAppSettings } from './storage';
import { getDeviceNow } from './appClock';
import { resolveDemoModeConfig } from './demoModeConfig';

export const DEMO_DATE = '2026-06-13';

export const isDemoMode = () => {
  return getAppSettings().useDemoDate;
};

export const getDemoAnchorDate = (): string => {
  if (!isDemoMode()) {
    return DEMO_DATE;
  }
  return resolveDemoModeConfig(getAppSettings().demoModeConfig).anchorDate;
};

/** Formato YYYY-MM-DD usando calendario local (medianoche local = nuevo día). */
export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAppToday = () => {
  if (isDemoMode()) {
    return getDemoAnchorDate();
  }
  return toLocalDateKey(getDeviceNow());
};

export const getAppNow = () => {
  if (isDemoMode()) {
    const anchorDate = getDemoAnchorDate();
    const [year, month, day] = anchorDate.split('-').map(Number);
    const deviceNow = getDeviceNow();
    return new Date(
      year,
      month - 1,
      day,
      deviceNow.getHours(),
      deviceNow.getMinutes(),
      deviceNow.getSeconds(),
      deviceNow.getMilliseconds(),
    );
  }
  return getDeviceNow();
};

export const parseLocalDateKey = (dateKey: string): Date => {
  return new Date(`${dateKey}T12:00:00`);
};

/** Meses hacia atrás navegables para revisar o cargar ventas fuera de fecha. */
export const CALENDAR_HISTORY_LOOKBACK_MONTHS = 24;

export const getFirstSaleDateKey = (sales: Array<{ date: string }>): string | null => {
  if (sales.length === 0) return null;
  let earliest = sales[0].date;
  for (let i = 1; i < sales.length; i += 1) {
    if (sales[i].date < earliest) earliest = sales[i].date;
  }
  return earliest;
};

/** Límite inferior del historial (hoy menos N meses). */
export const getCalendarHistoryFloor = (
  appToday: string = getAppToday(),
  lookbackMonths: number = CALENDAR_HISTORY_LOOKBACK_MONTHS,
): string => {
  const today = parseLocalDateKey(appToday);
  const floor = new Date(
    today.getFullYear(),
    today.getMonth() - lookbackMonths,
    today.getDate(),
    12,
    0,
    0,
  );
  return toLocalDateKey(floor);
};

/**
 * Fecha más antigua seleccionable para revisar o registrar ventas.
 * Permite ir atrás del primer registro (hasta el piso de historial)
 * y, si hay ventas más viejas que el piso, no las oculta.
 */
export const getEarliestSelectableDateKey = (
  sales: Array<{ date: string }>,
  appToday: string = getAppToday(),
): string => {
  const floor = getCalendarHistoryFloor(appToday);
  const firstSale = getFirstSaleDateKey(sales);
  if (!firstSale) return floor;
  return firstSale < floor ? firstSale : floor;
};

export const getEndOfAppDay = (): number => {
  const dateKey = getAppToday();
  const date = parseLocalDateKey(dateKey);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

export const isSameAppDay = (timestamp1: number, timestamp2: number): boolean => {
  const d1 = toLocalDateKey(new Date(timestamp1));
  const d2 = toLocalDateKey(new Date(timestamp2));
  return d1 === d2;
};

export const getCurrentMonth = () => {
  if (isDemoMode()) {
    const anchor = parseLocalDateKey(getDemoAnchorDate());
    return {
      month: anchor.getMonth(),
      year: anchor.getFullYear(),
    };
  }
  const now = getDeviceNow();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
};
