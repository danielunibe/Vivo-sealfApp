import { VIVO_STORAGE_KEYS, clearVivoPromotorStorage } from './storage';
import {
  getBackupExportMeta,
  getPersistentStorageDiagnostics,
  loadCriticalDataFromBestAvailableStorage,
  restoreCriticalDataToIndexedDb,
  saveBackupExportMeta,
  saveGeneratedBackupSnapshot,
} from './persistentStorage';

export interface VivoPromotorBackup {
  app: 'vivo-promotor';
  version: 1;
  exportedAt: string;
  source: 'indexeddb' | 'localStorage' | 'hybrid';
  payload: {
    sales?: unknown[];
    movements?: unknown[];
    devices?: unknown[];
    goals?: unknown;
    profile?: unknown;
    schedule?: unknown;
    settings?: unknown;
    theme?: unknown;
    raw?: Record<string, unknown>;
  };
}

export type RestoreMode = 'merge' | 'replace';

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
  summary?: string;
}

export interface BackupSummary {
  salesCount: number;
  movementsCount: number;
  devicesCount: number;
  goalsCount: number;
  exportedAt?: string;
  version?: number;
  source?: string;
}

export interface BackupDeviceSaveResult {
  filename: string;
  method: 'download' | 'file-system-access';
}

function safeGetRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetRaw(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`Backup restore error for key "${key}":`, err);
    return false;
  }
}

function collectLocalStorageRaw(): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const key of VIVO_STORAGE_KEYS) {
    const raw = safeGetRaw(key);
    if (raw === null) continue;

    try {
      payload[key] = JSON.parse(raw);
    } catch {
      payload[key] = raw;
    }
  }

  return payload;
}

function getLocalStorageSettingRaw(key: string): unknown {
  const raw = safeGetRaw(key);
  if (raw === null) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function mergeById(existing: unknown[], incoming: unknown[]): unknown[] {
  const merged = new Map<string, unknown>();

  for (const item of existing) {
    const id = typeof item === 'object' && item !== null && 'id' in item ? String((item as { id: unknown }).id) : JSON.stringify(item);
    merged.set(id, item);
  }

  for (const item of incoming) {
    const id = typeof item === 'object' && item !== null && 'id' in item ? String((item as { id: unknown }).id) : JSON.stringify(item);
    merged.set(id, item);
  }

  return Array.from(merged.values());
}

export async function createBackupFromCurrentStorage(): Promise<VivoPromotorBackup & { summary: BackupSummary }> {
  const diagnostics = await getPersistentStorageDiagnostics();
  const critical = await loadCriticalDataFromBestAvailableStorage();
  const raw = collectLocalStorageRaw();
  const exportedAt = new Date().toISOString();

  const backup: VivoPromotorBackup & { summary: BackupSummary } = {
    app: 'vivo-promotor',
    version: 1,
    exportedAt,
    source: diagnostics.mode === 'indexeddb' ? 'hybrid' : 'localStorage',
    payload: {
      sales: critical.sales,
      movements: critical.movements,
      devices: critical.devices,
      goals: getLocalStorageSettingRaw('vivo_piggy_goals'),
      profile: getLocalStorageSettingRaw('vivo_user_profile'),
      schedule: getLocalStorageSettingRaw('vivo_work_schedule'),
      settings: {
        userName: getLocalStorageSettingRaw('vivo_userName'),
        userStore: getLocalStorageSettingRaw('vivo_userStore'),
        selectedDay: getLocalStorageSettingRaw('vivo_selectedDay'),
        selectedMonth: getLocalStorageSettingRaw('vivo_selectedMonth'),
        selectedYear: getLocalStorageSettingRaw('vivo_selectedYear'),
        activeCarouselIndex: getLocalStorageSettingRaw('vivo_activeCarouselIndex'),
        manualDayRecords: getLocalStorageSettingRaw('vivo_manual_day_records'),
        messages: getLocalStorageSettingRaw('vivo_messages'),
        notifications: getLocalStorageSettingRaw('vivo_notifications'),
        storageDriver: getLocalStorageSettingRaw('vivo_storage_driver'),
        migrationDone: getLocalStorageSettingRaw('vivo_indexeddb_migration_v1_done'),
      },
      theme: getLocalStorageSettingRaw('vivo_theme'),
      raw,
    },
    summary: {
      salesCount: critical.sales.length,
      movementsCount: critical.movements.length,
      devicesCount: critical.devices.length,
      goalsCount: getLocalStorageSettingRaw('vivo_piggy_goals') ? 1 : 0,
      exportedAt,
      version: 1,
      source: diagnostics.mode === 'indexeddb' ? 'hybrid' : 'localStorage',
    },
  };

  await saveGeneratedBackupSnapshot(backup);

  return backup;
}

export function validateBackup(data: unknown): BackupValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Archivo inválido o vacío.' };
  }

  const record = data as Record<string, unknown>;
  if (record.app !== 'vivo-promotor') {
    return { valid: false, error: 'Este respaldo no pertenece a Vivo Promotor.' };
  }

  if (record.version !== 1) {
    return { valid: false, error: 'Versión de respaldo no soportada.' };
  }

  const payload = record.payload as VivoPromotorBackup['payload'] | undefined;
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'El archivo no contiene una carga útil de respaldo válida.' };
  }

  const sales = Array.isArray(payload.sales) ? payload.sales : [];
  const movements = Array.isArray(payload.movements) ? payload.movements : [];
  const devices = Array.isArray(payload.devices) ? payload.devices : [];

  const warnings: string[] = [];
  if (sales.length === 0) warnings.push('No se encontraron ventas en el respaldo.');
  if (movements.length === 0) warnings.push('No se encontraron movimientos en el respaldo.');
  if (devices.length === 0) warnings.push('No se encontraron dispositivos en el respaldo.');

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    summary: `${sales.length} ventas · ${movements.length} movimientos · ${devices.length} dispositivos`,
  };
}

function writeStructuredPayloadToLocalStorage(payload: VivoPromotorBackup['payload'], mode: RestoreMode): string[] {
  const warnings: string[] = [];
  const raw = payload.raw as Record<string, unknown> | undefined;

  if (mode === 'replace') {
    clearVivoPromotorStorage();
  }

  if (raw) {
    const currentRaw = collectLocalStorageRaw();

    for (const [key, value] of Object.entries(raw)) {
      let nextValue = value;

      if (mode === 'merge') {
        const currentValue = currentRaw[key];
        if ((key === 'vivo_real_sales' || key === 'vivo_real_movements' || key === 'vivo_devices')
          && Array.isArray(currentValue)
          && Array.isArray(value)
        ) {
          nextValue = mergeById(currentValue, value);
        } else if (
          currentValue &&
          value &&
          typeof currentValue === 'object' &&
          typeof value === 'object' &&
          !Array.isArray(currentValue) &&
          !Array.isArray(value)
        ) {
          nextValue = { ...currentValue as Record<string, unknown>, ...value as Record<string, unknown> };
        }
      }

      const serialized = typeof nextValue === 'string' ? nextValue : JSON.stringify(nextValue);
      const ok = safeSetRaw(key, serialized);
      if (!ok) warnings.push(`No se pudo escribir la clave "${key}".`);
    }
    return warnings;
  }

  const structuredEntries: Array<[string, unknown]> = [
    ['vivo_real_sales', payload.sales ?? []],
    ['vivo_real_movements', payload.movements ?? []],
    ['vivo_devices', payload.devices ?? []],
    ['vivo_piggy_goals', payload.goals ?? null],
    ['vivo_user_profile', payload.profile ?? null],
    ['vivo_work_schedule', payload.schedule ?? null],
    ['vivo_theme', payload.theme ?? 'light'],
  ];

  const settings = payload.settings as Record<string, unknown> | undefined;
  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined) {
        structuredEntries.push([`vivo_${key}`, value]);
      }
    }
  }

  for (const [key, value] of structuredEntries) {
    if (value === undefined) continue;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const ok = safeSetRaw(key, serialized);
    if (!ok) warnings.push(`No se pudo escribir la clave "${key}".`);
  }

  return warnings;
}

export async function restoreBackupToStorage(
  data: VivoPromotorBackup,
  mode: RestoreMode = 'replace'
): Promise<{ success: boolean; warnings: string[]; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, warnings: [], error: 'No se puede restaurar en entorno SSR.' };
  }

  try {
    const warnings = writeStructuredPayloadToLocalStorage(data.payload || {}, mode);
    const mergedRaw = collectLocalStorageRaw();

    await restoreCriticalDataToIndexedDb({
      sales: Array.isArray(mergedRaw.vivo_real_sales) ? (mergedRaw.vivo_real_sales as VivoPromotorBackup['payload']['sales'] as unknown as import('@/types/sale').Sale[]) : [],
      movements: Array.isArray(mergedRaw.vivo_real_movements) ? (mergedRaw.vivo_real_movements as VivoPromotorBackup['payload']['movements'] as unknown as import('@/types/sale').Movement[]) : [],
      devices: Array.isArray(mergedRaw.vivo_devices) ? (mergedRaw.vivo_devices as VivoPromotorBackup['payload']['devices'] as unknown as import('@/types/device').Device[]) : [],
      settingsRaw: mergedRaw,
    });

    return { success: true, warnings };
  } catch (error) {
    console.warn('Unexpected restore failure:', error);
    return { success: false, warnings: [], error: 'Ocurrió un error inesperado durante la restauración.' };
  }
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function supportsFileSystemAccessApi(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export async function saveBackupFileToDevice(
  filename: string,
  content: string
): Promise<BackupDeviceSaveResult> {
  if (typeof window === 'undefined') {
    throw new Error('No se puede guardar en entorno SSR.');
  }

  if (supportsFileSystemAccessApi()) {
    const picker = await (window as typeof window & {
      showSaveFilePicker: (options: {
        suggestedName: string;
        types: Array<{ description: string; accept: Record<string, string[]> }>;
      }) => Promise<{
        createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>;
      }>;
    }).showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: 'JSON Backup',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });

    const writable = await picker.createWritable();
    await writable.write(content);
    await writable.close();

    return { filename, method: 'file-system-access' };
  }

  downloadTextFile(filename, content, 'application/json');
  return { filename, method: 'download' };
}

export async function persistBackupExportRecord(meta: BackupDeviceSaveResult): Promise<void> {
  await saveBackupExportMeta({
    exportedAt: new Date().toISOString(),
    filename: meta.filename,
    method: meta.method,
  });
}

export async function getStorageStatusSummary(): Promise<{
  modeLabel: string;
  lastExportLabel: string;
}> {
  const diagnostics = await getPersistentStorageDiagnostics();
  const exportMeta = await getBackupExportMeta();

  return {
    modeLabel: diagnostics.mode === 'indexeddb' ? 'IndexedDB activo con fallback localStorage' : 'Fallback localStorage',
    lastExportLabel: exportMeta?.exportedAt ? new Date(exportMeta.exportedAt).toLocaleString('es-MX') : 'Aún no registrado',
  };
}

export function getSummaryFromBackup(backup: VivoPromotorBackup): BackupSummary {
  const salesCount = Array.isArray(backup.payload?.sales) ? backup.payload.sales.length : 0;
  const movementsCount = Array.isArray(backup.payload?.movements) ? backup.payload.movements.length : 0;
  const devicesCount = Array.isArray(backup.payload?.devices) ? backup.payload.devices.length : 0;

  return {
    salesCount,
    movementsCount,
    devicesCount,
    goalsCount: backup.payload?.goals ? 1 : 0,
    exportedAt: backup.exportedAt,
    version: backup.version,
    source: backup.source,
  };
}

function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildSalesCsv(sales: unknown[]): string {
  const headers = ['id', 'date', 'deviceId', 'deviceName', 'deviceColor', 'amountEarned', 'createdAt'];
  const rows = sales.map((sale) => {
    const record = sale as Record<string, unknown>;
    return headers.map((header) => escapeCsvValue(String(record[header] ?? ''))).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportSalesCsv(sales: unknown[], filename?: string): void {
  if (!sales || sales.length === 0) return;

  const date = new Date().toISOString().slice(0, 10);
  const targetFilename = filename || `vivo-promotor-ventas-${date}.csv`;
  const content = buildSalesCsv(sales);
  downloadTextFile(targetFilename, content, 'text/csv');
}
