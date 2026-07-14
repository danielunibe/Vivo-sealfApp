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
