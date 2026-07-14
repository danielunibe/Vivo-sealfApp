import { DailyChallenge, DemoModeConfig, InventoryMovement, PhoneModel, PhoneVariant, PointsBonusRecord, SaleRecord } from '../types';
import { DEFAULT_DEVICES } from './constants';
import { isDemoMode, parseLocalDateKey, toLocalDateKey } from './date';
import {
  getDemoDatasetVersion,
  getStockMultiplier,
  resolveDemoModeConfig,
} from './demoModeConfig';
import {
  buildSaleRecord,
  exportFullBackupJson,
  getAppSettings,
  getPhoneModels,
  getUserProfile,
  importFullBackupJson,
  replaceAllSales,
  replaceAllInventoryMovements,
  runPhoneModelMigrationIfNeeded,
  saveAppSettings,
  saveChallenges,
  savePhoneModels,
  savePointsBonuses,
  saveUserProfile,
} from './storage';
import { getPhoneModelHeroImage } from './deviceImages';
import { buildSaleRecordedAt } from './saleTimestamps';
import { emitChallengesUpdated, emitInventoryUpdated, emitPointsUpdated, emitSalesUpdated, emitSettingsUpdated } from './events';

const DEMO_BACKUP_KEY = 'vivo_demo_prebackup_v1';
const DEMO_DATASET_MARKER = 'vivo_demo_dataset_ready_v1';

const LIMITED_CATALOG_MODEL_IDS = new Set(['y04', 'y21d', 'y29', 'y31d']);

type DemoSalePlan = {
  date: string;
  hour: number;
  minute: number;
  modelId: string;
  colorName: string;
};

type DemoBackup = {
  version: 1;
  savedAt: number;
  profile: ReturnType<typeof getUserProfile>;
  settings: ReturnType<typeof getAppSettings>;
  payload: string;
};

const VARIANT_BASE_STOCK: Record<string, Record<string, number>> = {
  y04: { 'Verde Jade': 11, 'Lavanda Cristal': 9 },
  y21d: { 'Negro Jade': 10, 'Morado Lavanda': 8 },
  y29: { 'Black Expresso': 9, 'Blanco Nube': 7 },
  y31d: { 'Gris Estelar': 8, 'Blanco Brillante': 3 },
  'v50-lite': { 'Negro Mistico': 7, 'Lila Fantasia': 6 },
  'v60-lite': { 'Negro Elegante': 6, 'Azul Titanio': 5 },
};

const SALE_ROTATION: Array<{ modelId: string; colorName: string }> = [
  { modelId: 'y04', colorName: 'Verde Jade' },
  { modelId: 'y29', colorName: 'Blanco Nube' },
  { modelId: 'y21d', colorName: 'Negro Jade' },
  { modelId: 'v50-lite', colorName: 'Lila Fantasia' },
  { modelId: 'y31d', colorName: 'Gris Estelar' },
  { modelId: 'y04', colorName: 'Lavanda Cristal' },
  { modelId: 'v60-lite', colorName: 'Azul Titanio' },
  { modelId: 'y29', colorName: 'Black Expresso' },
  { modelId: 'y21d', colorName: 'Morado Lavanda' },
  { modelId: 'v50-lite', colorName: 'Negro Mistico' },
  { modelId: 'y31d', colorName: 'Blanco Brillante' },
  { modelId: 'v60-lite', colorName: 'Negro Elegante' },
];

const INTENSITY_PATTERNS: Record<DemoModeConfig['salesIntensity'], number[]> = {
  light: [0, 1, 1, 2, 0, 1],
  balanced: [1, 2, 2, 3, 0, 1, 3, 2],
  strong: [2, 3, 4, 4, 5, 3, 4, 5],
};

const SALE_HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19];

const getActiveDemoConfig = (): DemoModeConfig =>
  resolveDemoModeConfig(getAppSettings().demoModeConfig);

const readDemoMarker = () => {
  try {
    return localStorage.getItem(DEMO_DATASET_MARKER);
  } catch {
    return null;
  }
};

const writeDemoMarker = (config: DemoModeConfig) => {
  try {
    localStorage.setItem(DEMO_DATASET_MARKER, getDemoDatasetVersion(config));
  } catch {
    // Ignore marker failures.
  }
};

const clearDemoMarker = () => {
  try {
    localStorage.removeItem(DEMO_DATASET_MARKER);
  } catch {
    // Ignore marker failures.
  }
};

const buildSalePlan = (config: DemoModeConfig): DemoSalePlan[] => {
  const anchor = parseLocalDateKey(config.anchorDate);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const lastDay = anchor.getDate();
  const pattern = INTENSITY_PATTERNS[config.salesIntensity];
  const workingDays = new Set([1, 2, 3, 4, 5, 6]);
  const plans: DemoSalePlan[] = [];
  let rotationIndex = 0;
  let patternIndex = 0;

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day);
    if (!workingDays.has(date.getDay())) continue;

    const dateKey = toLocalDateKey(date);
    const isAnchorDay = dateKey === config.anchorDate;
    const count = isAnchorDay
      ? Math.max(0, Math.min(8, config.todaySalesCount))
      : pattern[patternIndex % pattern.length];
    patternIndex += 1;

    for (let i = 0; i < count; i += 1) {
      const entry = SALE_ROTATION[rotationIndex % SALE_ROTATION.length];
      rotationIndex += 1;
      plans.push({
        date: dateKey,
        hour: SALE_HOURS[i % SALE_HOURS.length],
        minute: (8 + i * 23 + patternIndex * 7) % 60,
        modelId: entry.modelId,
        colorName: entry.colorName,
      });
    }
  }

  return plans;
};

const findVariant = (models: PhoneModel[], modelId: string, colorName: string): { model: PhoneModel; variant: PhoneVariant } | null => {
  const model = models.find((item) => item.id === modelId);
  if (!model) return null;
  const variant =
    model.variants.find((item) => item.colorName === colorName) ??
    model.variants.find((item) => item.colorName.toLowerCase() === colorName.toLowerCase()) ??
    model.variants[0];
  if (!variant) return null;
  return { model, variant };
};

const getVariantBaseStock = (modelId: string, colorName: string, multiplier: number): number => {
  const base =
    VARIANT_BASE_STOCK[modelId]?.[colorName] ??
    VARIANT_BASE_STOCK[modelId]?.[Object.keys(VARIANT_BASE_STOCK[modelId] ?? {})[0]] ??
    8;
  return Math.max(1, Math.round(base * multiplier));
};

const buildDemoSale = (
  plan: DemoSalePlan,
  index: number,
  models: PhoneModel[],
): SaleRecord | null => {
  const match = findVariant(models, plan.modelId, plan.colorName);
  if (!match) return null;

  const { model, variant } = match;
  const device = DEFAULT_DEVICES.find((item) => item.id === plan.modelId);
  const recordedDate = parseLocalDateKey(plan.date);
  recordedDate.setHours(plan.hour, plan.minute, 0, 0);
  const timestamps = buildSaleRecordedAt(recordedDate);
  const commissionPerUnit = variant.commission || device?.margin || 0;

  return buildSaleRecord({
    id: `demo-sale-${plan.date}-${index}`,
    date: plan.date,
    deviceId: model.id,
    deviceNameSnapshot: model.name,
    deviceColorSnapshot: variant.colorName,
    deviceImageSnapshot: getPhoneModelHeroImage(model, variant.colorName),
    quantity: 1,
    commissionPerUnit,
    amountEarned: commissionPerUnit,
    createdAt: timestamps.createdAt,
    recordedTime: timestamps.recordedTime,
    recordedAtIso: timestamps.recordedAtIso,
    modelId: model.id,
    variantId: variant.id,
    variantNameSnapshot: variant.colorName,
    variantColorHexSnapshot: variant.colorHex,
    modelAccentColorSnapshot: model.accentColor,
  });
};

const applyVariantStocks = (
  models: PhoneModel[],
  sales: SaleRecord[],
  config: DemoModeConfig,
): PhoneModel[] => {
  const soldByVariant = new Map<string, number>();
  sales.forEach((sale) => {
    if (!sale.modelId || !sale.variantId) return;
    const key = `${sale.modelId}::${sale.variantId}`;
    soldByVariant.set(key, (soldByVariant.get(key) ?? 0) + (sale.quantity || 1));
  });

  const stockMultiplier = getStockMultiplier(config.stockLevel);

  return models.map((model) => {
    const isCatalogModel = config.includeFullCatalog || LIMITED_CATALOG_MODEL_IDS.has(model.id);
    return {
      ...model,
      isActive: isCatalogModel,
      variants: model.variants.map((variant) => {
        const baseStock = getVariantBaseStock(model.id, variant.colorName, stockMultiplier);
        const sold = soldByVariant.get(`${model.id}::${variant.id}`) ?? 0;
        return {
          ...variant,
          isActive: isCatalogModel,
          stock: isCatalogModel ? Math.max(0, baseStock - sold) : 0,
          minStock: variant.minStock ?? 2,
        };
      }),
    };
  });
};

const buildInventoryMovements = (
  sales: SaleRecord[],
  models: PhoneModel[],
  config: DemoModeConfig,
): InventoryMovement[] => {
  const stockMultiplier = getStockMultiplier(config.stockLevel);
  const stockLedger = new Map<string, number>();

  models.forEach((model) => {
    model.variants.forEach((variant) => {
      const baseStock = getVariantBaseStock(model.id, variant.colorName, stockMultiplier);
      stockLedger.set(`${model.id}::${variant.id}`, baseStock);
    });
  });

  return sales.flatMap((sale) => {
    if (!sale.modelId || !sale.variantId) return [];
    const key = `${sale.modelId}::${sale.variantId}`;
    const previousStock = stockLedger.get(key) ?? 0;
    const quantity = sale.quantity || 1;
    const newStock = Math.max(0, previousStock - quantity);
    stockLedger.set(key, newStock);

    return [{
      id: `demo-move-${sale.id}`,
      deviceId: sale.modelId,
      deviceNameSnapshot: `${sale.deviceNameSnapshot} (${sale.deviceColorSnapshot})`,
      modelId: sale.modelId,
      variantId: sale.variantId,
      variantColorSnapshot: sale.deviceColorSnapshot,
      saleDateSnapshot: sale.date,
      type: 'sale' as const,
      quantityChange: -quantity,
      previousStock,
      newStock,
      reason: 'Venta registrada',
      createdAt: sale.createdAt,
      relatedSaleId: sale.id,
    }];
  });
};

const buildDemoChallenges = (sales: SaleRecord[], config: DemoModeConfig): DailyChallenge[] => {
  const anchorDate = config.anchorDate;
  const todaySales = sales.filter((sale) => sale.date === anchorDate);
  const todayPieces = todaySales.reduce((sum, sale) => sum + (sale.quantity || 1), 0);
  const monthCommission = sales.reduce((sum, sale) => sum + sale.amountEarned, 0);
  const expiresAt = parseLocalDateKey(anchorDate).getTime() + (12 * 60 * 60 * 1000);
  const monthEnd = new Date(parseLocalDateKey(anchorDate));
  monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
  const monthEndKey = toLocalDateKey(monthEnd);
  const midMonthDate = new Date(parseLocalDateKey(anchorDate));
  midMonthDate.setDate(10);
  const midMonthKey = toLocalDateKey(midMonthDate);

  return [
    {
      id: `vol-${anchorDate}`,
      title: 'Arranca el día',
      description: `Vende ${config.dailyGoal} equipos hoy.`,
      type: 'daily_volume',
      targetValue: config.dailyGoal,
      currentValue: todayPieces,
      unit: 'devices',
      status: todayPieces >= config.dailyGoal ? 'completed' : 'active',
      priority: 'high',
      createdAt: parseLocalDateKey(anchorDate).getTime(),
      date: anchorDate,
      completedAt: todayPieces >= config.dailyGoal ? parseLocalDateKey(anchorDate).getTime() : undefined,
      expiresAt,
      source: 'goal',
    },
    {
      id: `premium-${anchorDate}`,
      title: 'Impulsa gama alta',
      description: 'Cierra una venta de V60 Lite hoy.',
      type: 'premium_push',
      targetValue: 1,
      currentValue: todaySales.some((sale) => sale.deviceId === 'v60-lite') ? 1 : 0,
      unit: 'sales',
      status: 'active',
      priority: 'medium',
      createdAt: parseLocalDateKey(anchorDate).getTime(),
      date: anchorDate,
      expiresAt,
      source: 'coach',
      relatedDeviceId: 'v60-lite',
      relatedDeviceName: 'V60 Lite',
    },
    {
      id: `demo-month-gap-${anchorDate.slice(0, 7)}`,
      title: 'Cierra el mes fuerte',
      description: `Llevas $${monthCommission.toLocaleString('es-MX')} en comisiones del mes.`,
      type: 'monthly_gap',
      targetValue: config.commissionGoal,
      currentValue: monthCommission,
      unit: 'commission',
      status: monthCommission >= config.commissionGoal ? 'completed' : 'active',
      priority: 'medium',
      createdAt: parseLocalDateKey(midMonthKey).getTime(),
      date: midMonthKey,
      completedAt: monthCommission >= config.commissionGoal ? parseLocalDateKey(anchorDate).getTime() : undefined,
      expiresAt: parseLocalDateKey(monthEndKey).getTime(),
      source: 'analytics',
    },
  ];
};

const buildDemoPointBonuses = (config: DemoModeConfig): PointsBonusRecord[] => {
  const anchor = parseLocalDateKey(config.anchorDate);
  const bonusDay = new Date(anchor);
  bonusDay.setDate(Math.max(1, anchor.getDate() - 4));
  const practiceDay = new Date(anchor);
  practiceDay.setDate(Math.max(1, anchor.getDate() - 2));

  const bonusDate = toLocalDateKey(bonusDay);
  const practiceDate = toLocalDateKey(practiceDay);
  const bonusAt = parseLocalDateKey(bonusDate);
  bonusAt.setHours(18, 30, 0, 0);
  const practiceAt = parseLocalDateKey(practiceDate);
  practiceAt.setHours(12, 15, 0, 0);

  return [
    {
      id: 'demo-bonus-challenge-1',
      amount: 25,
      reason: 'Reto completado: Impulsa Y29',
      source: 'challenge',
      relatedId: 'demo-challenge-complete-1',
      date: bonusDate,
      createdAt: bonusAt.getTime(),
    },
    {
      id: 'demo-bonus-practice-1',
      amount: 8,
      reason: 'Práctica comercial registrada',
      source: 'practice',
      date: practiceDate,
      createdAt: practiceAt.getTime(),
    },
  ];
};

export const hasDemoDatasetReady = () => {
  if (!isDemoMode()) return false;
  return readDemoMarker() === getDemoDatasetVersion(getActiveDemoConfig());
};

export const backupBeforeDemo = () => {
  if (typeof window === 'undefined') return;
  try {
    const backup: DemoBackup = {
      version: 1,
      savedAt: Date.now(),
      profile: getUserProfile(),
      settings: {
        ...getAppSettings(),
        useDemoDate: false,
        demoModeConfig: getActiveDemoConfig(),
      },
      payload: exportFullBackupJson(),
    };
    localStorage.setItem(DEMO_BACKUP_KEY, JSON.stringify(backup));
  } catch (error) {
    console.error('[DEMO] Backup failed', error);
  }
};

export const seedDemoExperience = () => {
  const config = getActiveDemoConfig();
  runPhoneModelMigrationIfNeeded();
  const catalog = getPhoneModels();
  const salePlan = buildSalePlan(config);
  const sales = salePlan
    .map((plan, index) => buildDemoSale(plan, index, catalog))
    .filter((sale): sale is SaleRecord => Boolean(sale));

  const stockedModels = applyVariantStocks(catalog, sales, config);
  const movements = buildInventoryMovements(sales, stockedModels, config);
  const challenges = config.includeChallenges ? buildDemoChallenges(sales, config) : [];
  const pointsBonuses = config.includePointBonuses ? buildDemoPointBonuses(config) : [];
  const scheduleLabel = `${config.workStartTime} - ${config.workEndTime}`;

  saveUserProfile(config.promoterName, config.storeName, scheduleLabel);
  saveAppSettings({
    ...getAppSettings(),
    dailyGoal: config.dailyGoal,
    monthlyGoal: config.monthlyGoal,
    commissionGoal: config.commissionGoal,
    minStockGoal: 2,
    demoModeConfig: config,
    useDemoDate: true,
    workSchedule: {
      startTime: config.workStartTime,
      endTime: config.workEndTime,
      workingDays: [1, 2, 3, 4, 5, 6],
      fixedRestDays: [0],
      manualRestDates: [],
    },
    positioningGoals: {
      premium: 20,
      balance: 35,
      volume: 30,
      entry: 15,
    },
    visualPreferences: getAppSettings().visualPreferences,
  });
  savePhoneModels(stockedModels);
  replaceAllSales(sales);
  replaceAllInventoryMovements(movements);
  saveChallenges(challenges);
  savePointsBonuses(pointsBonuses);

  writeDemoMarker(config);
  emitSettingsUpdated();
  emitSalesUpdated();
  emitInventoryUpdated();
  emitChallengesUpdated();
  emitPointsUpdated();
};

export const activateDemoMode = (options?: { skipBackup?: boolean }) => {
  if (!options?.skipBackup) {
    backupBeforeDemo();
  }
  seedDemoExperience();
};

export const deactivateDemoMode = () => {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(DEMO_BACKUP_KEY);
    if (raw) {
      const backup = JSON.parse(raw) as DemoBackup;
      if (backup.payload && importFullBackupJson(backup.payload)) {
        saveUserProfile(backup.profile.name, backup.profile.location, backup.profile.schedule);
        saveAppSettings({
          ...backup.settings,
          useDemoDate: false,
          demoModeConfig: resolveDemoModeConfig(backup.settings.demoModeConfig),
        });
      }
      localStorage.removeItem(DEMO_BACKUP_KEY);
    } else {
      saveAppSettings({ ...getAppSettings(), useDemoDate: false });
    }
    clearDemoMarker();
    emitSettingsUpdated();
    emitSalesUpdated();
    emitInventoryUpdated();
    emitChallengesUpdated();
    emitPointsUpdated();
    return true;
  } catch (error) {
    console.error('[DEMO] Restore failed', error);
    saveAppSettings({ ...getAppSettings(), useDemoDate: false });
    clearDemoMarker();
    return false;
  }
};

export const ensureDemoDatasetIfNeeded = () => {
  if (!isDemoMode()) return;
  if (hasDemoDatasetReady()) return;
  activateDemoMode({ skipBackup: true });
};

export const regenerateDemoExperience = () => {
  if (!isDemoMode()) return;
  seedDemoExperience();
};
