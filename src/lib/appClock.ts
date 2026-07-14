import { emitAppDayChanged } from './events';

const toLocalDateKeyInternal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TIME_SYNC_ENDPOINTS = [
  'https://www.google.com/generate_204',
  'https://www.vivo.com/favicon.ico',
];

const MAX_CLOCK_DRIFT_MS = 90_000;
const SYNC_TIMEOUT_MS = 8_000;

export type AppClockSource = 'device' | 'network';

export type AppClockSyncResult = {
  ok: boolean;
  source: AppClockSource;
  offsetMs: number;
  driftMs: number;
  syncedAt: number;
};

let clockOffsetMs = 0;
let clockSource: AppClockSource = 'device';
let lastSyncAt = 0;
let trackedToday = toLocalDateKeyInternal(new Date());
let watcherStarted = false;
let midnightTimer: number | null = null;

const readHttpDate = (response: Response, requestStartedAt: number, requestEndedAt: number) => {
  const header = response.headers.get('date');
  if (!header) return null;
  const serverTime = new Date(header).getTime();
  if (!Number.isFinite(serverTime)) return null;
  const rtt = Math.max(0, requestEndedAt - requestStartedAt);
  return serverTime + Math.floor(rtt / 2);
};

export const getClockOffsetMs = () => clockOffsetMs;

export const getClockSource = (): AppClockSource => clockSource;

export const getDeviceNow = (): Date => new Date(Date.now() + clockOffsetMs);

export const getTrackedAppToday = (): string => trackedToday;

export const refreshTrackedAppToday = (): string => {
  const nextToday = toLocalDateKeyInternal(getDeviceNow());
  if (nextToday !== trackedToday) {
    const previous = trackedToday;
    trackedToday = nextToday;
    emitAppDayChanged({ today: nextToday, previous });
  }
  return trackedToday;
};

export const syncInternetClock = async (): Promise<AppClockSyncResult> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    clockSource = 'device';
    clockOffsetMs = 0;
    lastSyncAt = Date.now();
    refreshTrackedAppToday();
    return {
      ok: true,
      source: 'device',
      offsetMs: 0,
      driftMs: 0,
      syncedAt: lastSyncAt,
    };
  }

  for (const endpoint of TIME_SYNC_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    try {
      const startedAt = Date.now();
      const response = await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      const endedAt = Date.now();
      const networkTime = readHttpDate(response, startedAt, endedAt);
      if (networkTime === null) continue;

      const deviceTime = endedAt;
      const driftMs = networkTime - deviceTime;
      const shouldApplyOffset = Math.abs(driftMs) > MAX_CLOCK_DRIFT_MS;

      clockOffsetMs = shouldApplyOffset ? driftMs : 0;
      clockSource = shouldApplyOffset ? 'network' : 'device';
      lastSyncAt = endedAt;
      refreshTrackedAppToday();

      return {
        ok: true,
        source: clockSource,
        offsetMs: clockOffsetMs,
        driftMs,
        syncedAt: lastSyncAt,
      };
    } catch {
      // Try next endpoint.
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  clockSource = 'device';
  clockOffsetMs = 0;
  lastSyncAt = Date.now();
  refreshTrackedAppToday();

  return {
    ok: false,
    source: 'device',
    offsetMs: 0,
    driftMs: 0,
    syncedAt: lastSyncAt,
  };
};

const scheduleMidnightRefresh = () => {
  if (midnightTimer !== null) {
    window.clearTimeout(midnightTimer);
    midnightTimer = null;
  }

  const now = getDeviceNow();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0,
  );
  const delay = Math.max(1_000, nextMidnight.getTime() - now.getTime());

  midnightTimer = window.setTimeout(() => {
    refreshTrackedAppToday();
    void syncInternetClock();
    scheduleMidnightRefresh();
  }, delay);
};

const handleVisibilityOrFocus = () => {
  refreshTrackedAppToday();
  void syncInternetClock();
};

export const startAppClockWatcher = () => {
  if (watcherStarted || typeof window === 'undefined') {
    return () => undefined;
  }

  watcherStarted = true;
  trackedToday = toLocalDateKeyInternal(getDeviceNow());
  void syncInternetClock();
  scheduleMidnightRefresh();

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      handleVisibilityOrFocus();
    }
  };

  window.addEventListener('focus', handleVisibilityOrFocus);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    watcherStarted = false;
    if (midnightTimer !== null) {
      window.clearTimeout(midnightTimer);
      midnightTimer = null;
    }
    window.removeEventListener('focus', handleVisibilityOrFocus);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
};
