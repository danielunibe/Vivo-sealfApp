import { Sale, Movement } from '@/types/sale';
import { Device } from '@/types/device';
import { INITIAL_DEVICES } from './constants';
import { mirrorAppKeyToIndexedDb } from './persistentStorage';

export const VIVO_STORAGE_KEYS = [
  'vivo_real_sales',
  'vivo_real_movements',
  'vivo_piggy_goals',
  'vivo_work_schedule',
  'vivo_manual_day_records',
  'vivo_user_profile',
  'vivo_devices',
  'vivo_theme',
  'vivo_userName',
  'vivo_userStore',
  'vivo_messages',
  'vivo_notifications',
  'vivo_selectedDay',
  'vivo_selectedMonth',
  'vivo_selectedYear',
  'vivo_activeCarouselIndex',
  'vivo_indexeddb_migration_v1_done',
  'vivo_storage_driver',
  'vivo_last_backup_export_at',
  'vivo_schema_version',
  'vivo_sounds_enabled',
  'vivo_haptics_enabled',
  'vivo_reduced_motion',
  'vivo_feedback_intensity',
  'vivo_intro_enabled',
] as const;

/**
 * Safe local storage manager that is fully SSR compatible.
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  } catch (err) {
    console.warn(`LocalStorage reading error for key "${key}":`, err);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, valueToStore);
    if (key.startsWith('vivo_')) {
      void mirrorAppKeyToIndexedDb(key, value);
    }
  } catch (err) {
    console.warn(`LocalStorage writing error for key "${key}":`, err);
  }
}

export function getPersistedSales(): Sale[] {
  return safeGetItem<Sale[]>('vivo_real_sales', []);
}

export function savePersistedSales(sales: Sale[]): void {
  safeSetItem('vivo_real_sales', sales);
}

export function getPersistedMovements(): Movement[] {
  return safeGetItem<Movement[]>('vivo_real_movements', []);
}

export function savePersistedMovements(movements: Movement[]): void {
  safeSetItem('vivo_real_movements', movements);
}

// System Settings
export function getPiggyGoals(): any {
  return safeGetItem('vivo_piggy_goals', {
    daily: 300,
    weekly: 1500,
    monthly: 6500,
    yearly: 78000,
    dailyDeviceGoal: 3
  });
}

export function savePiggyGoals(goals: any): void {
  safeSetItem('vivo_piggy_goals', goals);
}

export function getWorkSchedule(): any[] | null {
  return safeGetItem<any[] | null>('vivo_work_schedule', null);
}

export function saveWorkSchedule(schedule: any[]): void {
  safeSetItem('vivo_work_schedule', schedule);
}

export function getManualDayRecords(): Record<string, import('@/types/sale').CalendarDayRecord> {
  return safeGetItem<Record<string, import('@/types/sale').CalendarDayRecord>>('vivo_manual_day_records', {});
}

export function saveManualDayRecord(date: string, record: import('@/types/sale').CalendarDayRecord): void {
  const records = getManualDayRecords();
  records[date] = record;
  safeSetItem('vivo_manual_day_records', records);
}

export function getUserProfile(): { name: string, store: string } {
  return safeGetItem('vivo_user_profile', { name: '', store: '' });
}

export function saveUserProfile(profile: { name: string, store: string }): void {
  safeSetItem('vivo_user_profile', profile);
}

const ENRICHED_DEFAULTS: Record<string, Partial<Device>> = {
  'Y04': {
    series: 'Y',
    description: 'Entrada confiable para uso diario.',
    specs: 'Pantalla 6.74", 5150 mAh Mexico, 44W, IP64.',
    colors: [
      { name: 'Lavanda cristal', hex: '#D6C4F0' },
      { name: 'Negro jade', hex: '#203A30' }
    ]
  },
  'Y21D': {
    series: 'Y',
    description: 'Resistencia y bateria para trabajo pesado.',
    specs: '6500 mAh, 44W, IP68/IP69/IP69+, camara 50 MP.',
    colors: [
      { name: 'Morado Lavanda', hex: '#C9B5E8' },
      { name: 'Negro jade', hex: '#203A30' }
    ]
  },
  'Y29': {
    series: 'Y',
    description: 'Equilibrio entre bateria, pantalla y uso diario.',
    specs: 'Y29 4G, 6500 mAh, 44W, Snapdragon 685, 8+256 GB.',
    colors: [
      { name: 'Blanco Nube', hex: '#E0EEF7' },
      { name: 'Negro Espresso', hex: '#3B2E2A' }
    ]
  },
  'V50 LITE': {
    series: 'V',
    description: 'Pantalla, camara y carga rapida en gama media.',
    specs: 'AMOLED 120 Hz, 6500 mAh, 90W, camara 50 MP.',
    colors: [
      { name: 'Negro Místico', hex: '#23232D' },
      { name: 'Lila Fantasía', hex: '#E2BCF7' }
    ]
  },
  'V60 LITE': {
    series: 'V',
    description: 'Opcion premium ligera con IA y AMOLED.',
    specs: 'AMOLED 120 Hz, 6500 mAh, 90W, Snapdragon 6s 4G Gen 2, IP65.',
    colors: [
      { name: 'Rosa Pop', hex: '#F9E2E8' },
      { name: 'Negro Urbano', hex: '#2D2D30' }
    ]
  }
};

export function getPersistedDevices(): Device[] {
  const list = safeGetItem<Device[]>('vivo_devices', INITIAL_DEVICES);
  let changed = false;
  const migrated = list.map(d => {
    const defaultData = ENRICHED_DEFAULTS[d.name.toUpperCase()];
    const initialMatch = INITIAL_DEVICES.find(initial => initial.name.toUpperCase() === d.name.toUpperCase());
    
    let updatedDevice = { ...d };
    
    if (defaultData && (!d.colors || d.colors.length === 0 || !d.specs)) {
      changed = true;
      updatedDevice = {
        ...updatedDevice,
        series: d.series || defaultData.series,
        description: d.description || defaultData.description,
        specs: d.specs || defaultData.specs,
        colors: d.colors && d.colors.length > 0 ? d.colors : defaultData.colors
      };
    }
    
    if (!updatedDevice.knowledge && initialMatch?.knowledge) {
      changed = true;
      updatedDevice.knowledge = initialMatch.knowledge;
    }
    
    return updatedDevice;
  });
  
  if (changed) {
    safeSetItem('vivo_devices', migrated);
  }
  return migrated;
}

export function savePersistedDevices(devices: Device[]): void {
  safeSetItem('vivo_devices', devices);
}

export function clearVivoPromotorStorage(): string[] {
  if (typeof window === 'undefined') return [];

  const cleared: string[] = [];

  for (const key of VIVO_STORAGE_KEYS) {
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
      cleared.push(key);
    }
  }

  return cleared;
}

export function resetDevicesToDefault(): Device[] {
  // Return default devices fully enriched
  const enriched = INITIAL_DEVICES.map(d => {
    const defaultData = ENRICHED_DEFAULTS[d.name.toUpperCase()];
    if (defaultData) {
      return {
        ...d,
        series: defaultData.series,
        description: defaultData.description,
        specs: defaultData.specs,
        colors: defaultData.colors
      };
    }
    return d;
  });
  savePersistedDevices(enriched);
  return enriched;
}
