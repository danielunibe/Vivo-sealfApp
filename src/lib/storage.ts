import { SaleRecord, DeviceModel, InventoryMovement, AppSettings, Achievement, DailyChallenge, PhoneModel, PhoneVariant, PointsBonusRecord } from '../types';
import { DEFAULT_DEVICES } from './constants';
import { getDeviceHeroImage, getDevicePlaceholder } from './deviceImages';
import { emitSalesUpdated, emitInventoryUpdated, emitSettingsUpdated, emitAchievementsUpdated, emitChallengesUpdated, emitPointsUpdated } from './events';
import { buildSalePointsSnapshot } from './points';
import { normalizeSaleRecordTimestamps } from './saleTimestamps';
import { applyOfficialCoversToDevice, applyOfficialCoversToPhoneModel, getOfficialCoverForColor, getOfficialIconForColor, normalizeOfficialModelId } from './officialDeviceCovers';
import { normalizePhoneModelsOrder } from './modelOrdering';
import { legacyCommercialToProfile } from './commercialProfile';
import { getAppToday } from './date';
import { resolveDemoModeConfig } from './demoModeConfig';

// --- FASE 2: Safe Storage Layer ---
export const corruptedKeys = new Set<string>();

export const quarantineCorruptStorage = (key: string, rawValue: string, error: unknown) => {
  console.error(`[STORAGE] Corrupt data detected for key: ${key}`, error);
  const backupKey = `${key}_corrupt_backup_${Date.now()}`;
  try {
    localStorage.setItem(backupKey, rawValue);
  } catch(e) {
    console.error(`[STORAGE] Failed to create backup for corrupt key: ${key}`);
  }
};

const safeReadString = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeReadArray = <T>(key: string, fallback: T[]): T[] => {
  const raw = safeReadString(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    throw new Error("Expected array but got something else");
  } catch (e) {
    quarantineCorruptStorage(key, raw, e);
    corruptedKeys.add(key);
    return fallback;
  }
};

const safeReadObject = <T>(key: string, fallback: T): T => {
  const raw = safeReadString(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T;
    throw new Error("Expected object but got something else");
  } catch (e) {
    quarantineCorruptStorage(key, raw, e);
    corruptedKeys.add(key);
    return fallback;
  }
};

const safeWriteStorage = (key: string, value: unknown): boolean => {
  if (corruptedKeys.has(key)) {
    console.warn(`[STORAGE] Write blocked for ${key} because it was read as corrupt to prevent data loss.`);
    return false;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[STORAGE] Failed to write to ${key}`, e);
    return false;
  }
};

export const isStorageWriteBlocked = (key: string) => corruptedKeys.has(key);
// --- End FASE 2 ---

// --- FASE 6: Normalize IDs ---
const LEGACY_DEVICE_ID_ALIASES: Record<string, string> = {
  'dev-1': 'y04',
  'dev-2': 'y21d',
  'dev-3': 'y29',
  'dev-4': 'y31d',
  'dev-5': 'v60-lite',
  'dev-6': 'v50-lite',
};

export const normalizeDeviceId = (id: string = ''): string => {
  const normalizedId = normalizeOfficialModelId(id);
  return LEGACY_DEVICE_ID_ALIASES[normalizedId] ?? normalizedId;
};

const DEFAULT_STOCK = {
  'y04': 5,
  'y21d': 5,
  'y29': 5,
  'y31d': 5,
  'v50-lite': 3,
  'v60-lite': 3
};

const getOldHexColor = (colorName: string): string => {
  const c = colorName.toLowerCase();
  if (c.includes('jade')) return '#10b981';
  if (c.includes('lavanda') || c.includes('morado') || c.includes('lila')) return '#8b5cf6';
  if (c.includes('black') || c.includes('negro') || c.includes('expresso')) return '#1f2937';
  if (c.includes('gris') || c.includes('estelar')) return '#64748b';
  if (c.includes('blanco') || c.includes('brillante')) return '#f8fafc';
  if (c.includes('azul') || c.includes('titanio')) return '#3b82f6';
  if (c.includes('rosa') || c.includes('pop')) return '#ec4899';
  return '#3b82f6';
};

type LegacyDeviceModel = Partial<DeviceModel> & {
  id: string;
  active?: boolean;
};

type LegacySaleRecord = Partial<SaleRecord> & {
  deviceId?: string;
  deviceName?: string;
  deviceColor?: string;
};

const findDefaultDevice = (id: string = '') => {
  const normalizedId = normalizeDeviceId(id);
  return DEFAULT_DEVICES.find(d => normalizeDeviceId(d.id) === normalizedId);
};

const toFiniteNumber = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const getLocalDateFromTimestamp = (timestamp: unknown): string => {
  const time = toFiniteNumber(timestamp, Date.now());
  const parsed = new Date(time);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const normalizeStoredDevice = (device: LegacyDeviceModel): DeviceModel => {
  const normalizedId = normalizeDeviceId(device.id);
  const defaultDevice = findDefaultDevice(normalizedId);
  const colors =
    Array.isArray(device.colors) && device.colors.length > 0
      ? device.colors
      : (defaultDevice?.colors ?? []);

  const normalizedDevice: DeviceModel = {
    ...(defaultDevice ?? {
      id: normalizedId,
      name: device.name ?? normalizedId.toUpperCase(),
      margin: device.margin ?? 0,
      colors,
    }),
    ...device,
    id: normalizedId,
    officialUrl: defaultDevice?.officialUrl ?? device.officialUrl,
    name: device.name ?? defaultDevice?.name ?? normalizedId.toUpperCase(),
    margin: device.margin ?? defaultDevice?.margin ?? 0,
    colors,
    specs: defaultDevice?.specs ?? device.specs,
    commercial: defaultDevice?.commercial ?? device.commercial,
    commercialProfile:
      defaultDevice?.commercialProfile ??
      device.commercialProfile ??
      legacyCommercialToProfile(defaultDevice?.commercial ?? device.commercial),
    isActive: device.isActive ?? device.active ?? true,
    stock: device.stock ?? DEFAULT_STOCK[normalizedId as keyof typeof DEFAULT_STOCK] ?? 5,
    minStock: device.minStock ?? 1,
  };

  return applyOfficialCoversToDevice(normalizedDevice);
};

// --- FASE 3: Getters Puros ---
export const getInventoryMovements = (): InventoryMovement[] => {
  return safeReadArray<InventoryMovement>('vivo_inventory_movements_v1', []);
};

export const getAppSettings = (): AppSettings => {
  const settings = safeReadObject<Partial<AppSettings>>('vivo_app_settings_v1', {});
  const oldDaily = safeReadString('vivo_daily_goal');
  const oldSavings = safeReadString('vivo_savings_goal');

  return {
    useDemoDate: settings.useDemoDate ?? false,
    demoModeConfig: resolveDemoModeConfig(settings.demoModeConfig),
    dailyGoal: settings.dailyGoal ?? (oldDaily ? parseInt(oldDaily, 10) : 3),
    monthlyGoal: settings.monthlyGoal ?? 30,
    commissionGoal: settings.commissionGoal ?? (oldSavings ? parseInt(oldSavings, 10) : 5000),
    workSchedule: settings.workSchedule ?? {
      startTime: "11:00",
      endTime: "20:00",
      workingDays: [1, 2, 3, 4, 5, 6],
      fixedRestDays: [0],
      manualRestDates: []
    },
    visualPreferences: {
      reducedMotion: false,
      premiumVisualMode: true,
      darkMode: false,
      ...(settings.visualPreferences ?? {}),
    },
    minStockGoal: settings.minStockGoal ?? 2,
    positioningGoals: settings.positioningGoals ?? {}
  };
};

export const getSales = (): SaleRecord[] => {
  return safeReadArray<SaleRecord>('vivo_sales_history_v3', []);
};

export const getDevices = (): DeviceModel[] => {
  const storedStr = safeReadString('vivo_devices');
  let devices: LegacyDeviceModel[] = [];
  if (!storedStr) {
    devices = DEFAULT_DEVICES.map(d => ({
      ...d,
      isActive: true,
      stock: DEFAULT_STOCK[d.id as keyof typeof DEFAULT_STOCK] ?? 5,
      minStock: 1
    }));
  } else {
    devices = safeReadArray<DeviceModel>('vivo_devices', []);
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  return devices.map(normalizeStoredDevice).filter(d => {
    const normalizedId = normalizeDeviceId(d.id);
    if (seen.has(normalizedId)) return false;
    seen.add(normalizedId);
    return true;
  });
};

export const getAchievements = (): Achievement[] => {
  return safeReadArray<Achievement>('vivo_achievements_v1', []);
};

export const getPointsBonuses = (): PointsBonusRecord[] => {
  return safeReadArray<PointsBonusRecord>('vivo_points_bonus_v1', []);
};

export const savePointsBonuses = (bonuses: PointsBonusRecord[]): boolean => {
  const saved = safeWriteStorage('vivo_points_bonus_v1', bonuses);
  if (saved) emitPointsUpdated();
  return saved;
};

export const addPointsBonus = (entry: Omit<PointsBonusRecord, 'id' | 'createdAt' | 'date'> & { date?: string }): boolean => {
  const bonuses = getPointsBonuses();
  const relatedId = entry.relatedId;
  if (relatedId && bonuses.some((bonus) => bonus.relatedId === relatedId && bonus.source === entry.source)) {
    return true;
  }

  const nextEntry: PointsBonusRecord = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    date: entry.date ?? getAppToday(),
    amount: entry.amount,
    reason: entry.reason,
    source: entry.source,
    relatedId,
  };

  return savePointsBonuses([nextEntry, ...bonuses]);
};

export const getChallenges = (): DailyChallenge[] => {
  return safeReadArray<DailyChallenge>('vivo_challenges_v1', []);
};

export const getUserProfile = () => {
  return {
    name: safeReadString('vivo_user_name') || '',
    location: safeReadString('vivo_user_location') || '',
    schedule: safeReadString('vivo_user_schedule') || ''
  };
};

// --- FASE 4: Migraciones Separadas ---
let hasRunMigrations = false;

const migrateSalesIfNeeded = () => {
  const sales = getSales();
  if (sales.length === 0) return;
  
  let migrated = false;
  const newSales = sales.map(sale => {
    let changed = false;
    const qty = sale.quantity || 1;
    let commPerUnit = sale.commissionPerUnit;
    const normId = normalizeDeviceId(sale.deviceId);
    
    if (normId !== sale.deviceId) changed = true;

    if (!commPerUnit) {
      const device = DEFAULT_DEVICES.find(d => d.id === normId);
      commPerUnit = device ? device.margin : ((sale.amountEarned || 0) / qty);
      changed = true;
    }
    
    const deviceNameSnapshot = sale.deviceNameSnapshot || sale.deviceName || 'Modelo Desconocido';
    const deviceColorSnapshot = sale.deviceColorSnapshot || sale.deviceColor || 'Color Base';
    const devRef = getDevices().find(d => d.id === normId) || DEFAULT_DEVICES.find(d => d.id === normId);
    const deviceImageSnapshot = sale.deviceImageSnapshot || (devRef ? getDeviceHeroImage(devRef, deviceColorSnapshot) : getDevicePlaceholder(normId, deviceColorSnapshot));
    const phoneModel = getPhoneModels().find(model => model.id === normId);
    const matchedVariant = phoneModel?.variants.find(variant =>
      normalizeDeviceId(variant.colorName) === normalizeDeviceId(deviceColorSnapshot)
    );

    if (!sale.deviceNameSnapshot || !sale.quantity || !sale.commissionPerUnit || !sale.deviceImageSnapshot) {
      changed = true;
    }
    if ((!sale.modelId || !sale.variantId) && phoneModel && matchedVariant) {
      changed = true;
    }

    if (changed) {
      migrated = true;
      return {
        ...sale,
        deviceId: normId,
        quantity: qty,
        commissionPerUnit: commPerUnit,
        deviceNameSnapshot,
        deviceColorSnapshot,
        deviceImageSnapshot,
        amountEarned: sale.amountEarned || (commPerUnit * qty),
        modelId: sale.modelId || phoneModel?.id,
        variantId: sale.variantId || matchedVariant?.id,
        variantNameSnapshot: sale.variantNameSnapshot || matchedVariant?.colorName || deviceColorSnapshot,
        variantColorHexSnapshot: sale.variantColorHexSnapshot || matchedVariant?.colorHex,
        modelAccentColorSnapshot: sale.modelAccentColorSnapshot || phoneModel?.accentColor,
      };
    }
    return sale;
  });

  if (migrated) {
    safeWriteStorage('vivo_sales_history_v3', newSales);
  }
};

const migrateInventoryMovementsIfNeeded = () => {
  const movements = getInventoryMovements();
  if (movements.length === 0) return;

  const salesById = new Map(getSales().map((sale) => [sale.id, sale]));
  const models = getPhoneModels();
  let migrated = false;

  const updatedMovements = movements.map((movement) => {
    let changed = false;
    const relatedSale = movement.relatedSaleId ? salesById.get(movement.relatedSaleId) : undefined;

    let modelId = movement.modelId;
    let variantId = movement.variantId;
    let variantColorSnapshot = movement.variantColorSnapshot;
    let saleDateSnapshot = movement.saleDateSnapshot;
    let deviceNameSnapshot = movement.deviceNameSnapshot;

    if (relatedSale) {
      const inferredModelId = relatedSale.modelId || normalizeDeviceId(relatedSale.deviceId);
      const inferredVariantId = relatedSale.variantId;
      const inferredColor = relatedSale.variantNameSnapshot || relatedSale.deviceColorSnapshot || relatedSale.deviceColor;
      const inferredDate = relatedSale.date;
      const inferredName = `${relatedSale.deviceNameSnapshot || relatedSale.deviceName || movement.deviceNameSnapshot} (${inferredColor || 'Color Base'})`;

      if (!modelId && inferredModelId) {
        modelId = inferredModelId;
        changed = true;
      }
      if (!variantId && inferredVariantId) {
        variantId = inferredVariantId;
        changed = true;
      }
      if (!variantColorSnapshot && inferredColor) {
        variantColorSnapshot = inferredColor;
        changed = true;
      }
      if (!saleDateSnapshot && inferredDate) {
        saleDateSnapshot = inferredDate;
        changed = true;
      }
      if (movement.type === 'sale' || movement.type === 'sale_deleted') {
        if (deviceNameSnapshot !== inferredName) {
          deviceNameSnapshot = inferredName;
          changed = true;
        }
      }
    }

    if ((!modelId || !variantId || !variantColorSnapshot) && movement.deviceId) {
      const inferredModel = models.find((model) => model.id === normalizeDeviceId(movement.deviceId) || model.id === movement.modelId);
      if (inferredModel) {
        const inferredVariant = inferredModel.variants.find((variant) =>
          normalizeDeviceId(variant.colorName) === normalizeDeviceId(variantColorSnapshot || '')
          || movement.deviceNameSnapshot.includes(`(${variant.colorName})`)
        );
        if (!modelId) {
          modelId = inferredModel.id;
          changed = true;
        }
        if (!variantId && inferredVariant) {
          variantId = inferredVariant.id;
          changed = true;
        }
        if (!variantColorSnapshot && inferredVariant) {
          variantColorSnapshot = inferredVariant.colorName;
          changed = true;
        }
      }
    }

    if (!changed) return movement;
    migrated = true;
    return {
      ...movement,
      deviceNameSnapshot,
      modelId,
      variantId,
      variantColorSnapshot,
      saleDateSnapshot,
    };
  });

  if (migrated) {
    safeWriteStorage('vivo_inventory_movements_v1', updatedMovements);
  }
};

const migrateLegacyRealSalesIfNeeded = () => {
  if (getSales().length > 0) return;

  const legacySales = safeReadArray<LegacySaleRecord>('vivo_real_sales', []);
  if (legacySales.length === 0) return;

  const devices = getDevices();
  const migratedSales: SaleRecord[] = legacySales.map((sale, index) => {
    const normalizedId = normalizeDeviceId(sale.deviceId ?? '');
    const device = devices.find(d => d.id === normalizedId) ?? findDefaultDevice(normalizedId);
    const quantity = Math.max(1, toFiniteNumber(sale.quantity, 1));
    const amountFromLegacy = toFiniteNumber(sale.amountEarned, 0);
    const commissionPerUnit = toFiniteNumber(
      sale.commissionPerUnit,
      amountFromLegacy > 0 ? amountFromLegacy / quantity : (device?.margin ?? 0),
    );
    const amountEarned = toFiniteNumber(sale.amountEarned, commissionPerUnit * quantity);
    const deviceColorSnapshot =
      sale.deviceColorSnapshot ??
      sale.deviceColor ??
      device?.colors?.[0] ??
      'Color Base';
    const deviceNameSnapshot =
      sale.deviceNameSnapshot ??
      sale.deviceName ??
      device?.name ??
      'Modelo Desconocido';
    const deviceImageSnapshot =
      sale.deviceImageSnapshot ??
      (device
        ? getDeviceHeroImage(device, deviceColorSnapshot)
        : getDevicePlaceholder(normalizedId, deviceColorSnapshot));

    return {
      id: sale.id ?? `legacy-sale-${index}-${Date.now()}`,
      date: sale.date ?? getLocalDateFromTimestamp(sale.createdAt),
      deviceId: normalizedId,
      deviceNameSnapshot,
      deviceColorSnapshot,
      deviceImageSnapshot,
      quantity,
      commissionPerUnit,
      amountEarned,
      createdAt: toFiniteNumber(sale.createdAt, Date.now()),
      isCustomCommission: sale.isCustomCommission,
      baseCommissionSnapshot: sale.baseCommissionSnapshot,
      deviceName: sale.deviceName,
      deviceColor: sale.deviceColor,
    };
  });

  safeWriteStorage('vivo_sales_history_v3', migratedSales);
};

const migrateDevicesIfNeeded = () => {
  const storedStr = safeReadString('vivo_devices');
  if (!storedStr) {
    const defaultDevs = getDevices();
    safeWriteStorage('vivo_devices', defaultDevs);
    return;
  }
  
  const devices = getDevices();
  let migrated = false;
  
  const migratedDevices = devices.map(dev => {
    const normId = normalizeDeviceId(dev.id);
    const original = DEFAULT_DEVICES.find(d => normalizeDeviceId(d.id) === normId);
    let changed = false;
    
    if (normId !== dev.id) changed = true;

    let newStock = dev.stock;
    if (newStock === undefined) {
      newStock = DEFAULT_STOCK[normId as keyof typeof DEFAULT_STOCK] ?? 5;
      changed = true;
    }
    
    let isActive = dev.isActive;
    if (isActive === undefined) {
      isActive = true;
      changed = true;
    }

    if (changed || original) {
      migrated = true;
      return {
        ...applyOfficialCoversToDevice(dev),
        id: normId,
        colors: original?.colors || dev.colors,
        specs: original?.specs || dev.specs,
        commercial: original?.commercial || dev.commercial,
        isActive,
        stock: newStock,
        minStock: dev.minStock ?? 1
      };
    }
    return dev;
  });
  
  // Ensure default devices exist
  DEFAULT_DEVICES.forEach(defaultDev => {
    const defaultId = normalizeDeviceId(defaultDev.id);
    if (!migratedDevices.find(d => d.id === defaultId)) {
      migratedDevices.push({
        ...applyOfficialCoversToDevice(defaultDev),
        id: defaultId,
        isActive: true,
        stock: DEFAULT_STOCK[defaultId as keyof typeof DEFAULT_STOCK] ?? 5,
        minStock: 1
      });
      migrated = true;
    }
  });

  if (migrated) {
    const seen = new Set<string>();
    const deduplicatedDevices = migratedDevices.filter(d => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    safeWriteStorage('vivo_devices', deduplicatedDevices);
  }
};

const migrateSettingsIfNeeded = () => {
  const storedStr = safeReadString('vivo_app_settings_v1');
  if (!storedStr) {
    const current = getAppSettings();
    safeWriteStorage('vivo_app_settings_v1', current);
  }

  const realClockMigrationKey = 'vivo_real_clock_default_v1';
  if (!safeReadString(realClockMigrationKey)) {
    const current = getAppSettings();
    if (current.useDemoDate) {
      saveAppSettings({ ...current, useDemoDate: false });
    }
    try {
      localStorage.setItem(realClockMigrationKey, '1');
    } catch {
      // Ignore migration marker failures.
    }
  }
};

export const getPhoneModels = (): PhoneModel[] => {
  return normalizePhoneModelsOrder(safeReadArray<PhoneModel>('vivo_phone_models_v1', [])).map(applyOfficialCoversToPhoneModel);
};

export const getActivePhoneModels = (): PhoneModel[] => {
  return getPhoneModels().filter(m => m.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getActiveVariantsByModel = (modelId: string): PhoneVariant[] => {
  const model = getPhoneModels().find(m => m.id === modelId);
  if (!model) return [];
  return model.variants.filter(v => v.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const savePhoneModels = (models: PhoneModel[]): boolean => {
  return safeWriteStorage('vivo_phone_models_v1', normalizePhoneModelsOrder(models));
};

const createPhoneModelFromDevice = (dev: DeviceModel, index: number): PhoneModel => {
    const modelId = normalizeDeviceId(dev.id);
    const defaultDevice = findDefaultDevice(modelId);
    const colors =
      Array.isArray(dev.colors) && dev.colors.length > 0
        ? dev.colors
        : (defaultDevice?.colors ?? []);
    let variants: PhoneVariant[] = colors.map((c, i) => ({
      id: `${modelId}-${c.toLowerCase().replace(/\s+/g, '-')}`,
      modelId,
      colorName: c,
      colorHex: getOldHexColor(c),
      imagePath: getOfficialCoverForColor(modelId, c)?.path,
      catalogImagePath: getOfficialCoverForColor(modelId, c)?.path,
      calendarImagePath: getOfficialIconForColor(modelId, c),
      stock: i === 0 ? (dev.stock ?? 5) : 0, 
      minStock: dev.minStock ?? 1,
      commission: dev.margin,
      isActive: true,
      sortOrder: i
    }));

    if (modelId === 'y31d' && !variants.some(v => v.colorName.includes('Gris'))) {
      variants = [
        {
          id: 'y31d-gris-estelar',
          modelId: 'y31d',
          colorName: 'Gris Estelar',
          colorHex: '#64748b',
          stock: dev.stock ?? 5,
          minStock: 1,
          commission: dev.margin,
          isActive: true,
          sortOrder: 0
        },
        {
          id: 'y31d-blanco-brillante',
          modelId: 'y31d',
          colorName: 'Blanco Brillante',
          colorHex: '#f8fafc',
          stock: 0,
          minStock: 1,
          commission: dev.margin,
          isActive: true,
          sortOrder: 1
        }
      ];
    }

    return applyOfficialCoversToPhoneModel({
      id: modelId,
      name: dev.name,
      shortName: dev.name,
      accentColor: variants[0]?.colorHex || '#3b82f6',
      heroImagePath: dev.heroImagePath || dev.imagePath,
      thumbnailImagePath: dev.imagePath,
      isActive: dev.isActive ?? true,
      sortOrder: index,
      officialUrl: dev.officialUrl ?? defaultDevice?.officialUrl,
      pitch: dev.pitch,
      commercialProfile: dev.commercialProfile ?? legacyCommercialToProfile(dev.commercial),
      specs: dev.specs,
      variants
    });
};

const isGenericVariant = (variant: Partial<PhoneVariant> | undefined | null) => {
  if (!variant) return false;
  const colorName = String(variant.colorName ?? '').trim().toLowerCase();
  const variantId = String(variant.id ?? '').trim().toLowerCase();
  return colorName === 'variante principal' || variantId.includes('var-default');
};

const findStoredModelForDefault = (models: PhoneModel[], defaultDevice: DeviceModel) => {
  const defaultId = normalizeDeviceId(defaultDevice.id);
  return models.find((model) => {
    const candidateIds = [model.id, model.name, model.shortName]
      .filter(Boolean)
      .map((value) => normalizeDeviceId(String(value)));
    return candidateIds.includes(defaultId);
  });
};

const repairPhoneModelsCatalog = (models: PhoneModel[]): PhoneModel[] => {
  const normalizedModels = normalizePhoneModelsOrder(models);
  const repairedDefaults = DEFAULT_DEVICES.map((defaultDevice, index) => {
    const canonicalModel = createPhoneModelFromDevice(defaultDevice, index);
    const storedModel = findStoredModelForDefault(normalizedModels, defaultDevice);
    if (!storedModel) return canonicalModel;

    const donorVariants = normalizePhoneModelsOrder([storedModel])[0]?.variants ?? [];
    const genericDonor = donorVariants.find(isGenericVariant) ?? donorVariants[0];

    const variants = canonicalModel.variants.map((canonicalVariant, variantIndex) => {
      const matchedVariant =
        donorVariants.find((variant) => normalizeDeviceId(variant.colorName) === normalizeDeviceId(canonicalVariant.colorName)) ??
        donorVariants.find((variant) => normalizeDeviceId(variant.id) === normalizeDeviceId(canonicalVariant.id));
      const operationalVariant = matchedVariant ?? (variantIndex === 0 ? genericDonor : undefined);

      return {
        ...canonicalVariant,
        stock: operationalVariant?.stock ?? canonicalVariant.stock,
        minStock: operationalVariant?.minStock ?? canonicalVariant.minStock,
        commission: operationalVariant?.commission ?? canonicalVariant.commission,
        isActive: operationalVariant?.isActive ?? canonicalVariant.isActive,
        sortOrder: typeof operationalVariant?.sortOrder === 'number' ? operationalVariant.sortOrder : canonicalVariant.sortOrder,
        imageGallery: matchedVariant?.imageGallery ?? canonicalVariant.imageGallery,
        activeImageId: matchedVariant?.activeImageId ?? canonicalVariant.activeImageId,
      };
    });

    return {
      ...canonicalModel,
      seriesName: storedModel.seriesName ?? canonicalModel.seriesName,
      officialUrl: canonicalModel.officialUrl || storedModel.officialUrl,
      isActive: storedModel.isActive ?? canonicalModel.isActive,
      sortOrder: typeof storedModel.sortOrder === 'number' ? storedModel.sortOrder : canonicalModel.sortOrder,
      variants,
    };
  });

  const customModels = normalizedModels.filter((model) => !DEFAULT_DEVICES.some((device) => findStoredModelForDefault([model], device)));
  return normalizePhoneModelsOrder([...repairedDefaults, ...customModels]);
};

export const migrateDevicesToPhoneModelsIfNeeded = () => {
  const storedStr = safeReadString('vivo_phone_models_v1');
  if (storedStr) return; // Ya existe, no migrar desde cero

  const oldDevices = getDevices();
  const newModels: PhoneModel[] = oldDevices.map(createPhoneModelFromDevice);

  safeWriteStorage('vivo_phone_models_v1', normalizePhoneModelsOrder(newModels));
};

const ensureDefaultPhoneModels = (models: PhoneModel[]): PhoneModel[] => {
  const normalizedModels = normalizePhoneModelsOrder(models);
  const existingIds = new Set(normalizedModels.map((model) => normalizeDeviceId(model.id)));
  const missingModels = DEFAULT_DEVICES
    .filter((device) => !existingIds.has(normalizeDeviceId(device.id)))
    .map((device, index) => createPhoneModelFromDevice(device, normalizedModels.length + index));

  if (missingModels.length === 0) {
    return normalizedModels;
  }
  return normalizePhoneModelsOrder([...normalizedModels, ...missingModels]);
};

export const runPhoneModelMigrationIfNeeded = () => {
  migrateDevicesToPhoneModelsIfNeeded();

  const currentModels = getPhoneModels();
  const shouldRepairCatalog =
    currentModels.length < DEFAULT_DEVICES.length ||
    currentModels.some((model) =>
      String(model.id).toLowerCase().startsWith('model_') ||
      model.variants.some(isGenericVariant),
    );

  if (shouldRepairCatalog) {
    safeWriteStorage('vivo_phone_models_v1', repairPhoneModelsCatalog(currentModels));
  }

  const ensuredModels = ensureDefaultPhoneModels(getPhoneModels());
  const repairedModels = repairPhoneModelsCatalog(ensuredModels);
  if (JSON.stringify(ensuredModels) !== JSON.stringify(repairedModels)) {
    safeWriteStorage('vivo_phone_models_v1', repairedModels);
  }

  const currentOfficialModels = ensureDefaultPhoneModels(getPhoneModels());
  const officialModels = normalizePhoneModelsOrder(currentOfficialModels.map(applyOfficialCoversToPhoneModel));
  if (JSON.stringify(currentOfficialModels) !== JSON.stringify(officialModels)) {
    safeWriteStorage('vivo_phone_models_v1', officialModels);
  }
};

export const runStorageMigrations = (): boolean => {
  if (hasRunMigrations) return true;
  try {
    migrateSettingsIfNeeded();
    migrateDevicesIfNeeded();
    migrateLegacyRealSalesIfNeeded();
    runPhoneModelMigrationIfNeeded();
    migrateSalesIfNeeded();
    migrateInventoryMovementsIfNeeded();
    hasRunMigrations = true;
    return true;
  } catch (error) {
    console.error('[STORAGE] Migration failed without data deletion', error);
    hasRunMigrations = true;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vivo-storage-migration-failed', { detail: { error } }));
    }
    return false;
  }
};

// --- FASE 5: Destructive Actions ---
export const clearSalesHistory = () => {
  corruptedKeys.delete('vivo_sales_history_v3');
  safeWriteStorage('vivo_sales_history_v3', []);
  emitSalesUpdated();
};

export const clearInventoryMovements = () => {
  corruptedKeys.delete('vivo_inventory_movements_v1');
  safeWriteStorage('vivo_inventory_movements_v1', []);
  emitInventoryUpdated();
};

export const clearChallenges = () => {
  corruptedKeys.delete('vivo_challenges_v1');
  safeWriteStorage('vivo_challenges_v1', []);
  emitChallengesUpdated();
};

export const clearAchievements = () => {
  corruptedKeys.delete('vivo_achievements_v1');
  safeWriteStorage('vivo_achievements_v1', []);
  emitAchievementsUpdated();
};

export const resetAllData = (options?: { keepCommercialCatalog: boolean }) => {
  clearSalesHistory();
  clearInventoryMovements();
  clearChallenges();
  clearAchievements();
  if (!options?.keepCommercialCatalog) {
    try { localStorage.removeItem('vivo_devices'); } catch(e){}
    corruptedKeys.delete('vivo_devices');
    migrateDevicesIfNeeded(); 
    emitInventoryUpdated();
  }
  emitSettingsUpdated(); 
};

export const prepareForRealUse = (options?: { keepCommercialCatalog: boolean }) => {
  resetAllData(options);
  const settings = getAppSettings();
  settings.useDemoDate = false;
  saveAppSettings(settings);
};

// --- Setters / Mutations ---
export const saveInventoryMovement = (movement: InventoryMovement) => {
  const movements = getInventoryMovements();
  movements.push(movement);
  safeWriteStorage('vivo_inventory_movements_v1', movements);
};

export const saveAppSettings = (settings: AppSettings) => {
  safeWriteStorage('vivo_app_settings_v1', settings);
  try {
    localStorage.setItem('vivo_daily_goal', settings.dailyGoal.toString());
    localStorage.setItem('vivo_savings_goal', settings.commissionGoal.toString());
  } catch(e) {}
  emitSettingsUpdated();
};

export const saveSale = (sale: SaleRecord): boolean => {
  const sales = getSales();
  sales.push(sale);
  if (!safeWriteStorage('vivo_sales_history_v3', sales)) {
    return false;
  }
  emitSalesUpdated();
  return true;
};

export const replaceAllSales = (sales: SaleRecord[]): boolean => {
  if (!safeWriteStorage('vivo_sales_history_v3', sales)) {
    return false;
  }
  emitSalesUpdated();
  return true;
};

export const replaceAllInventoryMovements = (movements: InventoryMovement[]): boolean => {
  if (!safeWriteStorage('vivo_inventory_movements_v1', movements)) {
    return false;
  }
  emitInventoryUpdated();
  return true;
};

export const getAvailableVariantStockForSale = (
  deviceId: string,
  colorName?: string,
  editingSaleId?: string | null,
) => {
  const { variant } = resolvePhoneVariantForSale(deviceId, colorName);
  if (!variant) return Number.POSITIVE_INFINITY;

  let available = variant.stock || 0;
  if (editingSaleId) {
    const existingSale = getSales().find((sale) => sale.id === editingSaleId);
    if (existingSale?.variantId === variant.id) {
      available += existingSale.quantity || 1;
    }
  }
  return available;
};

export const canRegisterSaleStock = (
  deviceId: string,
  colorName: string,
  quantity: number = 1,
  editingSaleId?: string | null,
) => {
  const available = getAvailableVariantStockForSale(deviceId, colorName, editingSaleId);
  if (!Number.isFinite(available)) return { ok: true, available };
  return { ok: available >= quantity, available };
};

export const resolvePhoneVariantForSale = (deviceId: string, colorName?: string) => {
  const normalizedModelId = normalizeDeviceId(deviceId);
  const model = getPhoneModels().find((item) => item.id === normalizedModelId);
  if (!model) return { model: undefined, variant: undefined };

  const normalizedColor = normalizeDeviceId(colorName || '');
  const variant =
    model.variants.find((item) => normalizeDeviceId(item.colorName) === normalizedColor) ||
    model.variants[0];

  return { model, variant };
};

export const buildSaleRecord = (
  base: Pick<SaleRecord, 'id' | 'date' | 'deviceId' | 'deviceNameSnapshot' | 'deviceColorSnapshot' | 'deviceImageSnapshot' | 'quantity' | 'commissionPerUnit' | 'amountEarned' | 'createdAt'> &
    Partial<SaleRecord>,
) => {
  const { model, variant } = resolvePhoneVariantForSale(base.deviceId, base.deviceColorSnapshot);
  const quantity = base.quantity || 1;
  const pointsSnapshot = buildSalePointsSnapshot(base.deviceId, quantity);
  const timestamps = normalizeSaleRecordTimestamps(base);

  return {
    ...base,
    date: timestamps.date,
    createdAt: timestamps.createdAt,
    recordedTime: timestamps.recordedTime,
    recordedAtIso: timestamps.recordedAtIso,
    modelId: base.modelId || model?.id,
    variantId: base.variantId || variant?.id,
    variantNameSnapshot: base.variantNameSnapshot || variant?.colorName || base.deviceColorSnapshot,
    variantColorHexSnapshot: base.variantColorHexSnapshot || variant?.colorHex,
    modelAccentColorSnapshot: base.modelAccentColorSnapshot || model?.accentColor,
    pointsPerUnitSnapshot: base.pointsPerUnitSnapshot ?? pointsSnapshot.pointsPerUnitSnapshot,
    pointsEarned: base.pointsEarned ?? pointsSnapshot.pointsEarned,
  } satisfies SaleRecord;
};

export const saveSaleWithInventory = (sale: SaleRecord): boolean => {
  const normalizedSale = buildSaleRecord(sale);
  if (!saveSale(normalizedSale)) {
    return false;
  }

  if (normalizedSale.modelId && normalizedSale.variantId) {
    decrementPhoneVariantStock(
      normalizedSale.modelId,
      normalizedSale.variantId,
      normalizedSale.quantity || 1,
      'Venta registrada',
      'sale',
      normalizedSale.id,
    );
  }
  return true;
};

export const replaceSaleWithInventory = (saleId: string, nextSale: SaleRecord): boolean => {
  const currentSale = getSales().find((sale) => sale.id === saleId);
  if (!currentSale) return false;

  const normalizedNext = buildSaleRecord({
    ...nextSale,
    id: nextSale.id,
    createdAt: nextSale.createdAt,
  });

  const updatedSales = getSales().map((sale) => (sale.id === saleId ? normalizedNext : sale));
  if (!safeWriteStorage('vivo_sales_history_v3', updatedSales)) {
    return false;
  }

  const oldQty = currentSale.quantity || 1;
  const newQty = normalizedNext.quantity || 1;
  const sameVariant =
    currentSale.modelId === normalizedNext.modelId
    && currentSale.variantId === normalizedNext.variantId;

  if (currentSale.modelId && currentSale.variantId) {
    if (sameVariant && oldQty !== newQty) {
      if (newQty > oldQty) {
        decrementPhoneVariantStock(
          normalizedNext.modelId!,
          normalizedNext.variantId!,
          newQty - oldQty,
          'Ajuste de venta',
          'correction',
          saleId,
        );
      } else if (oldQty > newQty) {
        incrementPhoneVariantStock(
          currentSale.modelId,
          currentSale.variantId,
          oldQty - newQty,
          'Ajuste de venta',
          'correction',
          saleId,
        );
      }
    } else if (!sameVariant) {
      incrementPhoneVariantStock(
        currentSale.modelId,
        currentSale.variantId,
        oldQty,
        'Ajuste de venta (restaura)',
        'correction',
        saleId,
      );
      if (normalizedNext.modelId && normalizedNext.variantId) {
        decrementPhoneVariantStock(
          normalizedNext.modelId,
          normalizedNext.variantId,
          newQty,
          'Venta ajustada',
          'correction',
          saleId,
        );
      }
    }
  } else if (normalizedNext.modelId && normalizedNext.variantId) {
    decrementPhoneVariantStock(
      normalizedNext.modelId,
      normalizedNext.variantId,
      newQty,
      'Venta ajustada',
      'correction',
      saleId,
    );
  }

  emitSalesUpdated();
  return true;
};

export const saveSales = (sales: SaleRecord[]) => {
  safeWriteStorage('vivo_sales_history_v3', sales);
  emitSalesUpdated();
};

export const updateSale = (saleId: string, updates: Partial<SaleRecord>) => {
  const sales = getSales();
  const updated = sales.map(s => s.id === saleId ? { ...s, ...updates } : s);
  safeWriteStorage('vivo_sales_history_v3', updated);
  emitSalesUpdated();
};

export const saveDevices = (devices: DeviceModel[]) => {
  safeWriteStorage('vivo_devices', devices);
};

export const updateDeviceStock = (deviceId: string, newStock: number, reason: string = 'Ajuste manual', type: InventoryMovement['type'] = 'manual_adjustment', relatedSaleId?: string) => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index !== -1) {
    const previousStock = devices[index].stock || 0;
    const finalStock = Math.max(0, newStock);
    devices[index].stock = finalStock;
    saveDevices(devices);
    
    saveInventoryMovement({
      id: crypto.randomUUID(),
      deviceId,
      deviceNameSnapshot: devices[index].name,
      modelId: deviceId,
      type,
      quantityChange: finalStock - previousStock,
      previousStock,
      newStock: finalStock,
      reason,
      createdAt: Date.now(),
      relatedSaleId
    });
    
    emitInventoryUpdated();
  }
};

export const updatePhoneVariantStock = (
  modelId: string,
  variantId: string,
  newStock: number,
  reason: string = 'Ajuste manual',
  type: InventoryMovement['type'] = 'manual_adjustment',
  relatedSaleId?: string,
) => {
  const models = getPhoneModels();
  const modelIndex = models.findIndex(m => m.id === modelId);
  if (modelIndex === -1) return;

  const model = models[modelIndex];
  const variantIndex = model.variants.findIndex(v => v.id === variantId);
  if (variantIndex === -1) return;

  const variant = model.variants[variantIndex];
  const previousStock = variant.stock || 0;
  const finalStock = Math.max(0, newStock);

  const updatedModels = [...models];
  updatedModels[modelIndex] = {
    ...model,
    variants: [
      ...model.variants.slice(0, variantIndex),
      { ...variant, stock: finalStock },
      ...model.variants.slice(variantIndex + 1),
    ],
  };
  savePhoneModels(updatedModels);

  saveInventoryMovement({
    id: crypto.randomUUID(),
    deviceId: modelId,
    deviceNameSnapshot: `${model.name} (${variant.colorName})`,
    modelId,
    variantId,
    variantColorSnapshot: variant.colorName,
    type,
    quantityChange: finalStock - previousStock,
    previousStock,
    newStock: finalStock,
    reason,
    createdAt: Date.now(),
    relatedSaleId,
  });

  emitInventoryUpdated();
};

export const decrementDeviceStock = (deviceId: string, quantity: number, reason: string = 'Venta', type: InventoryMovement['type'] = 'sale', relatedSaleId?: string) => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index !== -1) {
    const previousStock = devices[index].stock || 0;
    const finalStock = Math.max(0, previousStock - quantity);
    devices[index].stock = finalStock;
    saveDevices(devices);
    
    saveInventoryMovement({
      id: crypto.randomUUID(),
      deviceId,
      deviceNameSnapshot: devices[index].name,
      modelId: deviceId,
      type,
      quantityChange: -quantity,
      previousStock,
      newStock: finalStock,
      reason,
      createdAt: Date.now(),
      relatedSaleId
    });
    
    emitInventoryUpdated();
  }
};

export const decrementPhoneVariantStock = (modelId: string, variantId: string, quantity: number, reason: string = 'Venta', type: InventoryMovement['type'] = 'sale', relatedSaleId?: string) => {
  const models = getPhoneModels();
  const modelIndex = models.findIndex(m => m.id === modelId);
  if (modelIndex !== -1) {
    const model = models[modelIndex];
    const variantIndex = model.variants.findIndex(v => v.id === variantId);
    if (variantIndex !== -1) {
      const variant = model.variants[variantIndex];
      const previousStock = variant.stock || 0;
      const finalStock = Math.max(0, previousStock - quantity);
      
      const updatedModels = [...models];
      updatedModels[modelIndex] = {
        ...model,
        variants: [
          ...model.variants.slice(0, variantIndex),
          { ...variant, stock: finalStock },
          ...model.variants.slice(variantIndex + 1)
        ]
      };
      savePhoneModels(updatedModels);
      
      saveInventoryMovement({
        id: crypto.randomUUID(),
        deviceId: modelId,
        deviceNameSnapshot: `${model.name} (${variant.colorName})`,
        modelId,
        variantId,
        variantColorSnapshot: variant.colorName,
        type,
        quantityChange: -quantity,
        previousStock,
        newStock: finalStock,
        reason,
        createdAt: Date.now(),
        relatedSaleId
      });
      
      emitInventoryUpdated();
    }
  }
};

export const incrementDeviceStock = (deviceId: string, quantity: number, reason: string = 'Entrada', type: InventoryMovement['type'] = 'restock', relatedSaleId?: string) => {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index !== -1) {
    const previousStock = devices[index].stock || 0;
    const finalStock = previousStock + quantity;
    devices[index].stock = finalStock;
    saveDevices(devices);
    
    saveInventoryMovement({
      id: crypto.randomUUID(),
      deviceId,
      deviceNameSnapshot: devices[index].name,
      modelId: deviceId,
      type,
      quantityChange: quantity,
      previousStock,
      newStock: finalStock,
      reason,
      createdAt: Date.now(),
      relatedSaleId
    });
    
    emitInventoryUpdated();
  }
};

export const incrementPhoneVariantStock = (
  modelId: string,
  variantId: string,
  quantity: number,
  reason: string = 'Entrada',
  type: InventoryMovement['type'] = 'restock',
  relatedSaleId?: string,
) => {
  const models = getPhoneModels();
  const model = models.find(m => m.id === modelId);
  const variant = model?.variants.find(v => v.id === variantId);
  if (!model || !variant) return;

  updatePhoneVariantStock(modelId, variantId, (variant.stock || 0) + quantity, reason, type, relatedSaleId);
};

export const getDailyGoal = (): number => {
  return getAppSettings().dailyGoal;
};

export const saveDailyGoal = (goal: number) => {
  const settings = getAppSettings();
  settings.dailyGoal = goal;
  saveAppSettings(settings);
};

export const getSavingsGoal = (): number => {
  return getAppSettings().commissionGoal;
};

export const saveSavingsGoal = (goal: number) => {
  const settings = getAppSettings();
  settings.commissionGoal = goal;
  saveAppSettings(settings);
};

export const saveAchievements = (achievements: Achievement[]) => {
  safeWriteStorage('vivo_achievements_v1', achievements);
  emitAchievementsUpdated();
};

export const saveChallenges = (challenges: DailyChallenge[]) => {
  safeWriteStorage('vivo_challenges_v1', challenges);
  emitChallengesUpdated();
};

export const upsertChallenge = (challenge: DailyChallenge) => {
  const challenges = getChallenges();
  const idx = challenges.findIndex(c => c.id === challenge.id);
  if (idx !== -1) {
    challenges[idx] = challenge;
  } else {
    challenges.push(challenge);
  }
  saveChallenges(challenges);
};

export const dismissChallenge = (challengeId: string) => {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  if (challenge) {
    challenge.status = 'dismissed';
    saveChallenges(challenges);
  }
};

export const completeChallenge = (challengeId: string) => {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  if (challenge) {
    challenge.status = 'completed';
    challenge.completedAt = Date.now();
    saveChallenges(challenges);
  }
};

export const saveUserProfile = (name: string, location: string, schedule: string) => {
  try {
    localStorage.setItem('vivo_user_name', name);
    localStorage.setItem('vivo_user_location', location);
    localStorage.setItem('vivo_user_schedule', schedule);
  } catch(e) {}
};

export const deleteSale = (saleId: string): boolean => {
  const sales = getSales();
  const saleToDelete = sales.find(s => s.id === saleId);
  const updated = sales.filter(s => s.id !== saleId);
  if (!safeWriteStorage('vivo_sales_history_v3', updated)) {
    return false;
  }

  if (saleToDelete) {
    if (saleToDelete.modelId && saleToDelete.variantId) {
      incrementPhoneVariantStock(
        saleToDelete.modelId,
        saleToDelete.variantId,
        saleToDelete.quantity || 1,
        'Venta eliminada / corrección',
        'sale_deleted',
        saleId,
      );
    } else {
      incrementDeviceStock(saleToDelete.deviceId, saleToDelete.quantity || 1, 'Venta eliminada / corrección', 'sale_deleted', saleId);
    }
  }

  emitSalesUpdated();
  return true;
};

export const exportFullBackupJson = (): string => {
  const data = {
    settings: getAppSettings(),
    sales: getSales(),
    devices: getDevices(),
    phoneModels: getPhoneModels(),
    movements: getInventoryMovements(),
    achievements: getAchievements(),
    challenges: getChallenges(),
    pointsBonuses: getPointsBonuses(),
    exportedAt: Date.now()
  };
  return JSON.stringify(data, null, 2);
};

export const validateBackupJson = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings && data.sales && data.devices && data.movements && data.achievements) {
      return true;
    }
  } catch (e) {}
  return false;
};

export const importFullBackupJson = (jsonString: string): boolean => {
  if (!validateBackupJson(jsonString)) return false;
  
  try {
    const data = JSON.parse(jsonString);
    saveAppSettings(data.settings);
    safeWriteStorage('vivo_sales_history_v3', data.sales);
    saveDevices(data.devices);
    if (data.phoneModels && Array.isArray(data.phoneModels)) {
      savePhoneModels(data.phoneModels);
    } else {
      // Si no trae phoneModels, se forzará la migración en el próximo inicio (o se puede invocar manualmente)
      try { localStorage.removeItem('vivo_phone_models_v1'); } catch(e){}
    }
    safeWriteStorage('vivo_inventory_movements_v1', data.movements);
    saveAchievements(data.achievements);
    if (data.challenges) saveChallenges(data.challenges);
    if (data.pointsBonuses) savePointsBonuses(data.pointsBonuses);
    
    // Forzamos migraciones por si faltaba vivo_phone_models_v1
    let temp = hasRunMigrations;
    hasRunMigrations = false;
    runStorageMigrations();
    hasRunMigrations = temp;

    emitSalesUpdated();
    emitInventoryUpdated();
    emitChallengesUpdated();
    emitPointsUpdated();
    
    return true;
  } catch (e) {
    return false;
  }
};
