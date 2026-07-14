import { PhoneModel } from '../types';
import { toLocalDateKey } from './date';
import { emitWebArchivesUpdated } from './events';
import { getActivePhoneModels } from './storage';
import { captureWebArchiveForModel } from './webArchive';
import { isValidHttpsUrl } from './urlValidation';

const LAST_SYNC_DATE_KEY = 'vivo_web_archive_last_sync_date';
const SYNC_HOUR_KEY = 'vivo_web_archive_sync_hour';
const LAST_SYNC_AT_KEY = 'vivo_web_archive_last_sync_at';

export const DEFAULT_WEB_SYNC_HOUR = 6;

let syncInFlight: Promise<WebArchiveSyncSummary> | null = null;

export type WebArchiveSyncSummary = {
  attempted: number;
  updated: number;
  skipped: number;
  reason?: 'no_wifi' | 'already_synced_today' | 'in_progress';
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    type?: string;
  };
};

export const isWifiConnection = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.onLine) return false;

  const connection = (navigator as NavigatorWithConnection).connection;
  if (!connection?.type) {
    return true;
  }

  return connection.type === 'wifi' || connection.type === 'ethernet' || connection.type === 'wimax';
};

export const getWebSyncHour = (): number => {
  const stored = localStorage.getItem(SYNC_HOUR_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : DEFAULT_WEB_SYNC_HOUR;
  if (!Number.isFinite(parsed)) return DEFAULT_WEB_SYNC_HOUR;
  return Math.max(0, Math.min(23, parsed));
};

export const setWebSyncHour = (hour: number) => {
  localStorage.setItem(SYNC_HOUR_KEY, String(Math.max(0, Math.min(23, hour))));
};

export const getLastWebSyncAt = (): number | null => {
  const stored = localStorage.getItem(LAST_SYNC_AT_KEY);
  if (!stored) return null;
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const shouldRunDailyWebSync = (now = new Date()): boolean => {
  const todayKey = toLocalDateKey(now);
  const lastSyncDate = localStorage.getItem(LAST_SYNC_DATE_KEY);
  if (lastSyncDate === todayKey) return false;
  return now.getHours() >= getWebSyncHour();
};

const getSyncableModels = (): PhoneModel[] => {
  return getActivePhoneModels().filter((model) => {
    return typeof model.officialUrl === 'string'
      && model.officialUrl.length > 0
      && isValidHttpsUrl(model.officialUrl);
  });
};

const markSyncCompleted = () => {
  const now = new Date();
  localStorage.setItem(LAST_SYNC_DATE_KEY, toLocalDateKey(now));
  localStorage.setItem(LAST_SYNC_AT_KEY, String(now.getTime()));
};

export const syncAllModelWebArchives = async (options?: { force?: boolean }): Promise<WebArchiveSyncSummary> => {
  if (syncInFlight) {
    return { attempted: 0, updated: 0, skipped: 0, reason: 'in_progress' };
  }

  if (!isWifiConnection()) {
    return { attempted: 0, updated: 0, skipped: 0, reason: 'no_wifi' };
  }

  if (!options?.force && !shouldRunDailyWebSync()) {
    return { attempted: 0, updated: 0, skipped: 0, reason: 'already_synced_today' };
  }

  const models = getSyncableModels();
  if (models.length === 0) {
    if (options?.force) markSyncCompleted();
    return { attempted: 0, updated: 0, skipped: 0 };
  }

  const run = async (): Promise<WebArchiveSyncSummary> => {
    let updated = 0;
    let skipped = 0;

    for (const model of models) {
      try {
        const record = await captureWebArchiveForModel(model);
        if (record.status === 'cache_completo' || record.status === 'cache_parcial') {
          updated += 1;
        } else {
          skipped += 1;
        }
      } catch {
        skipped += 1;
      }
    }

    markSyncCompleted();
    emitWebArchivesUpdated();
    return { attempted: models.length, updated, skipped };
  };

  syncInFlight = run().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
};

export const runDailyWebArchiveSyncIfDue = async (): Promise<WebArchiveSyncSummary | null> => {
  if (!shouldRunDailyWebSync()) return null;
  return syncAllModelWebArchives();
};

let schedulerCleanup: (() => void) | null = null;

export const startWebArchiveScheduler = () => {
  if (schedulerCleanup) return schedulerCleanup;

  const tick = () => {
    void runDailyWebArchiveSyncIfDue();
  };

  tick();
  const intervalId = window.setInterval(tick, 60_000);
  window.addEventListener('online', tick);

  schedulerCleanup = () => {
    window.clearInterval(intervalId);
    window.removeEventListener('online', tick);
    schedulerCleanup = null;
  };

  return schedulerCleanup;
};
