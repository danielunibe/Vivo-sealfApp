import { Sale, Movement } from '@/types/sale';
import { Device } from '@/types/device';
import { INITIAL_DEVICES } from './constants';

export const VIVO_INDEXED_DB_NAME = 'vivo-promotor-db';
export const VIVO_INDEXED_DB_VERSION = 1;
export const VIVO_INDEXED_DB_MIGRATION_FLAG = 'vivo_indexeddb_migration_v1_done';
export const VIVO_STORAGE_DRIVER_KEY = 'vivo_storage_driver';
export const VIVO_LAST_BACKUP_EXPORT_KEY = 'vivo_last_backup_export_at';

type PersistentStoreName = 'sales' | 'movements' | 'devices' | 'settings' | 'backups';
type PersistentStorageMode = 'indexeddb' | 'localstorage-fallback';

type StoredRecord<T> = {
  id: string;
  value: T;
  updatedAt: string;
};

type BackupExportMeta = {
  exportedAt: string;
  filename: string;
  method: 'download' | 'file-system-access';
};

const STORE_NAMES: PersistentStoreName[] = ['sales', 'movements', 'devices', 'settings', 'backups'];

const CURRENT_RECORD_IDS = {
  sales: 'current-sales',
  movements: 'current-movements',
  devices: 'current-devices',
} as const;

const APP_SETTING_KEYS = [
  'vivo_piggy_goals',
  'vivo_work_schedule',
  'vivo_manual_day_records',
  'vivo_user_profile',
  'vivo_theme',
  'vivo_userName',
  'vivo_userStore',
  'vivo_messages',
  'vivo_notifications',
  'vivo_selectedDay',
  'vivo_selectedMonth',
  'vivo_selectedYear',
  'vivo_activeCarouselIndex',
  VIVO_INDEXED_DB_MIGRATION_FLAG,
  VIVO_STORAGE_DRIVER_KEY,
  VIVO_LAST_BACKUP_EXPORT_KEY,
] as const;

function canUseIndexedDb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function readLocalStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return fallback;
  }
}

function writeLocalStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Failed to write localStorage key "${key}"`, error);
  }
}

async function openPersistentDatabase(): Promise<IDBDatabase | null> {
  if (!canUseIndexedDb()) return null;

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(VIVO_INDEXED_DB_NAME, VIVO_INDEXED_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        for (const storeName of STORE_NAMES) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open failed:', request.error);
        resolve(null);
      };
    } catch (error) {
      console.warn('IndexedDB open threw unexpectedly:', error);
      resolve(null);
    }
  });
}

async function readStoreRecord<T>(storeName: PersistentStoreName, id: string): Promise<T | null> {
  const db = await openPersistentDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredRecord<T> | undefined;
        resolve(result?.value ?? null);
      };
      request.onerror = () => {
        console.warn(`IndexedDB read failed for ${storeName}/${id}`, request.error);
        resolve(null);
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
      tx.onabort = () => db.close();
    } catch (error) {
      console.warn(`IndexedDB read threw for ${storeName}/${id}`, error);
      db.close();
      resolve(null);
    }
  });
}

async function writeStoreRecord<T>(storeName: PersistentStoreName, id: string, value: T): Promise<boolean> {
  const db = await openPersistentDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record: StoredRecord<T> = {
        id,
        value,
        updatedAt: new Date().toISOString(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.warn(`IndexedDB write failed for ${storeName}/${id}`, request.error);
        resolve(false);
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
      tx.onabort = () => db.close();
    } catch (error) {
      console.warn(`IndexedDB write threw for ${storeName}/${id}`, error);
      db.close();
      resolve(false);
    }
  });
}

async function clearStoreRecord(storeName: PersistentStoreName, id: string): Promise<boolean> {
  const db = await openPersistentDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
      tx.onabort = () => db.close();
    } catch {
      db.close();
      resolve(false);
    }
  });
}

function localSales(): Sale[] {
  return readLocalStorageValue<Sale[]>('vivo_real_sales', []);
}

function localMovements(): Movement[] {
  return readLocalStorageValue<Movement[]>('vivo_real_movements', []);
}

function localDevices(): Device[] {
  return readLocalStorageValue<Device[]>('vivo_devices', INITIAL_DEVICES);
}

export async function getPersistentStorageMode(): Promise<PersistentStorageMode> {
  const db = await openPersistentDatabase();
  if (db) {
    db.close();
    writeLocalStorageValue(VIVO_STORAGE_DRIVER_KEY, 'indexeddb');
    return 'indexeddb';
  }

  writeLocalStorageValue(VIVO_STORAGE_DRIVER_KEY, 'localstorage-fallback');
  return 'localstorage-fallback';
}

export async function ensurePersistentMigration(): Promise<{
  mode: PersistentStorageMode;
  migrated: boolean;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const mode = await getPersistentStorageMode();

  if (mode !== 'indexeddb') {
    return { mode, migrated: false, warnings };
  }

  const alreadyMigrated = readLocalStorageValue<boolean>(VIVO_INDEXED_DB_MIGRATION_FLAG, false);
  if (alreadyMigrated) {
    return { mode, migrated: false, warnings };
  }

  const existingSales = await readStoreRecord<Sale[]>('sales', CURRENT_RECORD_IDS.sales);
  const existingMovements = await readStoreRecord<Movement[]>('movements', CURRENT_RECORD_IDS.movements);
  const existingDevices = await readStoreRecord<Device[]>('devices', CURRENT_RECORD_IDS.devices);

  const sales = localSales();
  const movements = localMovements();
  const devices = localDevices();

  if ((!existingSales || existingSales.length === 0) && sales.length > 0) {
    const ok = await writeStoreRecord('sales', CURRENT_RECORD_IDS.sales, sales);
    if (!ok) warnings.push('No se pudieron migrar las ventas a IndexedDB.');
  }

  if ((!existingMovements || existingMovements.length === 0) && movements.length > 0) {
    const ok = await writeStoreRecord('movements', CURRENT_RECORD_IDS.movements, movements);
    if (!ok) warnings.push('No se pudieron migrar los movimientos a IndexedDB.');
  }

  if ((!existingDevices || existingDevices.length === 0) && devices.length > 0) {
    const ok = await writeStoreRecord('devices', CURRENT_RECORD_IDS.devices, devices);
    if (!ok) warnings.push('No se pudieron migrar los dispositivos a IndexedDB.');
  }

  for (const key of APP_SETTING_KEYS) {
    const raw = readLocalStorageValue<unknown>(key, null);
    if (raw !== null) {
      const ok = await writeStoreRecord('settings', key, raw);
      if (!ok) warnings.push(`No se pudo migrar el ajuste "${key}".`);
    }
  }

  writeLocalStorageValue(VIVO_INDEXED_DB_MIGRATION_FLAG, true);
  await writeStoreRecord('settings', VIVO_INDEXED_DB_MIGRATION_FLAG, true);
  await writeStoreRecord('settings', VIVO_STORAGE_DRIVER_KEY, 'indexeddb');

  return { mode, migrated: true, warnings };
}

export async function mirrorAppKeyToIndexedDb<T>(key: string, value: T): Promise<boolean> {
  const mode = await getPersistentStorageMode();
  if (mode !== 'indexeddb') return false;

  if (key === 'vivo_real_sales') {
    return writeStoreRecord('sales', CURRENT_RECORD_IDS.sales, value);
  }

  if (key === 'vivo_real_movements') {
    return writeStoreRecord('movements', CURRENT_RECORD_IDS.movements, value);
  }

  if (key === 'vivo_devices') {
    return writeStoreRecord('devices', CURRENT_RECORD_IDS.devices, value);
  }

  if (APP_SETTING_KEYS.includes(key as (typeof APP_SETTING_KEYS)[number])) {
    return writeStoreRecord('settings', key, value);
  }

  return false;
}

export async function loadCriticalDataFromBestAvailableStorage(): Promise<{
  mode: PersistentStorageMode;
  sales: Sale[];
  movements: Movement[];
  devices: Device[];
}> {
  await ensurePersistentMigration();
  const mode = await getPersistentStorageMode();

  if (mode !== 'indexeddb') {
    return {
      mode,
      sales: localSales(),
      movements: localMovements(),
      devices: localDevices(),
    };
  }

  const [sales, movements, devices] = await Promise.all([
    readStoreRecord<Sale[]>('sales', CURRENT_RECORD_IDS.sales),
    readStoreRecord<Movement[]>('movements', CURRENT_RECORD_IDS.movements),
    readStoreRecord<Device[]>('devices', CURRENT_RECORD_IDS.devices),
  ]);

  return {
    mode,
    sales: sales ?? localSales(),
    movements: movements ?? localMovements(),
    devices: devices ?? localDevices(),
  };
}

export async function getPersistentStorageDiagnostics(): Promise<{
  mode: PersistentStorageMode;
  indexedDbAvailable: boolean;
  migrationDone: boolean;
  salesCount: number;
  movementsCount: number;
  devicesCount: number;
  lastBackupExportAt: string | null;
}> {
  const { mode, sales, movements, devices } = await loadCriticalDataFromBestAvailableStorage();
  const migrationDone = readLocalStorageValue<boolean>(VIVO_INDEXED_DB_MIGRATION_FLAG, false);
  const lastBackupExportAt = readLocalStorageValue<string | null>(VIVO_LAST_BACKUP_EXPORT_KEY, null);

  return {
    mode,
    indexedDbAvailable: canUseIndexedDb(),
    migrationDone,
    salesCount: sales.length,
    movementsCount: movements.length,
    devicesCount: devices.length,
    lastBackupExportAt,
  };
}

export async function getBackupExportMeta(): Promise<BackupExportMeta | null> {
  const mode = await getPersistentStorageMode();
  if (mode !== 'indexeddb') {
    const exportedAt = readLocalStorageValue<string | null>(VIVO_LAST_BACKUP_EXPORT_KEY, null);
    return exportedAt
      ? { exportedAt, filename: '', method: 'download' }
      : null;
  }

  return readStoreRecord<BackupExportMeta>('backups', 'last-export-meta');
}

export async function saveBackupExportMeta(meta: BackupExportMeta): Promise<void> {
  writeLocalStorageValue(VIVO_LAST_BACKUP_EXPORT_KEY, meta.exportedAt);
  writeLocalStorageValue(VIVO_STORAGE_DRIVER_KEY, await getPersistentStorageMode());
  await writeStoreRecord('backups', 'last-export-meta', meta);
}

export async function saveGeneratedBackupSnapshot(backup: unknown): Promise<void> {
  await writeStoreRecord('backups', 'last-generated-backup', backup);
}

export async function restoreCriticalDataToIndexedDb(payload: {
  sales?: Sale[];
  movements?: Movement[];
  devices?: Device[];
  settingsRaw?: Record<string, unknown>;
}): Promise<void> {
  const mode = await getPersistentStorageMode();
  if (mode !== 'indexeddb') return;

  if (payload.sales) {
    await writeStoreRecord('sales', CURRENT_RECORD_IDS.sales, payload.sales);
  } else {
    await clearStoreRecord('sales', CURRENT_RECORD_IDS.sales);
  }

  if (payload.movements) {
    await writeStoreRecord('movements', CURRENT_RECORD_IDS.movements, payload.movements);
  } else {
    await clearStoreRecord('movements', CURRENT_RECORD_IDS.movements);
  }

  if (payload.devices) {
    await writeStoreRecord('devices', CURRENT_RECORD_IDS.devices, payload.devices);
  } else {
    await clearStoreRecord('devices', CURRENT_RECORD_IDS.devices);
  }

  if (payload.settingsRaw) {
    for (const [key, value] of Object.entries(payload.settingsRaw)) {
      await writeStoreRecord('settings', key, value);
    }
  }
}

