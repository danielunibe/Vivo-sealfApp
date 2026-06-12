import { safeGetItem, safeSetItem } from '@/lib/storage';

export const CURRENT_DATA_SCHEMA_VERSION = 1;
const SCHEMA_VERSION_KEY = 'vivo_schema_version';

export interface MigrationResult {
  previousVersion: number;
  currentVersion: number;
  changed: boolean;
}

export function runDataMigrations(): MigrationResult {
  const previousVersion = safeGetItem<number>(SCHEMA_VERSION_KEY, 0);

  if (previousVersion >= CURRENT_DATA_SCHEMA_VERSION) {
    return {
      previousVersion,
      currentVersion: CURRENT_DATA_SCHEMA_VERSION,
      changed: false,
    };
  }

  safeSetItem(SCHEMA_VERSION_KEY, CURRENT_DATA_SCHEMA_VERSION);

  return {
    previousVersion,
    currentVersion: CURRENT_DATA_SCHEMA_VERSION,
    changed: true,
  };
}
