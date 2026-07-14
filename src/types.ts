export interface CommercialProfile {
  positioning?: "volumen" | "rentabilidad" | "equilibrio" | "premium" | "entrada";
  idealCustomer?: string;
  mainPitch?: string;
  keyStrengths?: string[];
  objections?: {
    objection: string;
    response: string;
  }[];
  closingPhrase?: string;
  competitorNotes?: string;
  salesTips?: string[];
  technicalHighlights?: {
    label: string;
    value: string;
  }[];
}

export type MediaAssetKind = "variant-image" | "web-html" | "web-asset";
export type MediaAssetSource = "user-upload" | "web-cache" | "official";

export interface VariantImageRef {
  id: string;
  mediaAssetId: string;
  label: string;
  createdAt: number;
  source: MediaAssetSource;
}

export interface MediaAsset {
  id: string;
  kind: MediaAssetKind;
  mimeType: string;
  dataUrl: string;
  size: number;
  createdAt: number;
  source: MediaAssetSource;
  modelId?: string;
  variantId?: string;
  url?: string;
  label?: string;
}

export type WebArchiveStatus = "sin_cache" | "cache_completo" | "cache_parcial" | "bloqueado";

export interface WebArchiveAssetRef {
  url: string;
  mediaAssetId: string;
  mimeType: string;
  size: number;
}

export interface WebArchiveRecord {
  modelId: string;
  url: string;
  capturedAt: number;
  status: WebArchiveStatus;
  bytesUsed: number;
  assets: WebArchiveAssetRef[];
  offlineHtml?: string;
  errors: string[];
}

export interface PhoneVariant {
  id: string;
  modelId: string;
  colorName: string;
  colorHex: string;
  imagePath?: string;
  catalogImagePath?: string;
  calendarImagePath?: string;
  stock: number;
  minStock: number;
  commission: number;
  isActive: boolean;
  sortOrder: number;
  imageGallery?: VariantImageRef[];
  activeImageId?: string;
}

export interface PhoneModel {
  id: string;
  name: string;
  shortName: string;
  seriesName?: string;
  accentColor?: string; 
  backgroundImagePath?: string;
  heroImagePath?: string;
  thumbnailImagePath?: string;
  svgIconPath?: string;
  officialUrl?: string;
  isActive: boolean;
  sortOrder: number;
  
  pitch?: string;
  commercialProfile?: CommercialProfile;
  specs?: {
    battery?: string;
    screen?: string;
    camera?: string;
  };
  
  variants: PhoneVariant[];
}

export type DeviceModel = {
  id: string;
  name: string;
  margin: number;
  points?: number;
  colors: string[];
  officialUrl?: string;
  specs?: {
    battery?: string;
    screen?: string;
    camera?: string;
  };
  pitch?: string;
  commercial?: {
    ventajas: string[];
    diferenciadores: string[];
    clienteIdeal: string;
    objeciones: { objecion: string; refutacion: string }[];
    guion: string;
  };
  commercialProfile?: CommercialProfile;
  
  isActive?: boolean;
  stock?: number;
  minStock?: number;
  
  // Custom image overrides
  imagePath?: string;
  calendarImagePath?: string;
  catalogImagePath?: string;
  heroImagePath?: string;
  carouselImages?: string[];
};

export type SaleRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  deviceId: string;
  deviceNameSnapshot: string;
  deviceColorSnapshot: string;
  deviceImageSnapshot: string;
  quantity: number;
  commissionPerUnit: number;
  amountEarned: number; // total commission
  createdAt: number;
  
  isCustomCommission?: boolean;
  baseCommissionSnapshot?: number;
  
  // Keep optional for backward compatibility until migrated
  deviceName?: string;
  deviceColor?: string;

  // New PhoneModel/PhoneVariant fields (Sprint 3)
  modelId?: string;
  variantId?: string;
  variantNameSnapshot?: string;
  variantColorHexSnapshot?: string;
  modelAccentColorSnapshot?: string;

  pointsPerUnitSnapshot?: number;
  pointsEarned?: number;

  /** Hora local exacta del registro HH:mm:ss */
  recordedTime?: string;
  /** Marca local para exportación y análisis YYYY-MM-DDTHH:mm:ss */
  recordedAtIso?: string;
};

export type InventoryMovement = {
  id: string;
  deviceId: string;
  deviceNameSnapshot: string;
  modelId?: string;
  variantId?: string;
  variantColorSnapshot?: string;
  saleDateSnapshot?: string;
  type: "sale" | "sale_deleted" | "manual_adjustment" | "restock" | "correction";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: number;
  relatedSaleId?: string;
};

export type WorkSchedule = {
  startTime: string; // e.g., "11:00"
  endTime: string;   // e.g., "20:00"
  workingDays: number[]; // 0 = Sunday, 1 = Monday...
  fixedRestDays: number[];
  manualRestDates: string[]; // YYYY-MM-DD
  notes?: string;
};

export type VisualPreferences = {
  reducedMotion: boolean;
  premiumVisualMode: boolean;
  darkMode: boolean;
};

export type PositioningGoals = {
  volume?: number;
  profitability?: number;
  balance?: number;
  premium?: number;
  entry?: number;
};

export type DemoSalesIntensity = 'light' | 'balanced' | 'strong';
export type DemoStockLevel = 'tight' | 'balanced' | 'generous';

export type DemoModeConfig = {
  anchorDate: string;
  promoterName: string;
  storeName: string;
  workStartTime: string;
  workEndTime: string;
  dailyGoal: number;
  monthlyGoal: number;
  commissionGoal: number;
  salesIntensity: DemoSalesIntensity;
  todaySalesCount: number;
  stockLevel: DemoStockLevel;
  includeChallenges: boolean;
  includePointBonuses: boolean;
  includeFullCatalog: boolean;
};

export type AppSettings = {
  useDemoDate: boolean;
  demoModeConfig?: DemoModeConfig;
  dailyGoal: number;
  monthlyGoal: number;
  commissionGoal: number;
  sellerName?: string;
  storeName?: string;
  brandName?: string;
  roleName?: string;
  city?: string;
  workSchedule?: WorkSchedule;
  visualPreferences?: VisualPreferences;
  // Advanced Goals
  minStockGoal?: number;
  positioningGoals?: PositioningGoals;
};

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  type: "daily_volume" | "daily_revenue" | "model_push" | "premium_push" | "inventory_rotation" | "commercial_training" | "objection_practice" | "monthly_gap";
  targetValue: number;
  currentValue: number;
  unit: "devices" | "commission" | "practice" | "sales";
  status: "active" | "completed" | "failed" | "dismissed";
  priority: "low" | "medium" | "high";
  relatedDeviceId?: string;
  relatedDeviceName?: string;
  createdAt: number;
  date?: string; // App date when created
  completedAt?: number;
  expiresAt: number;
  source: "goal" | "inventory" | "coach" | "commercial_profile" | "analytics";
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  target?: number;
};

export type PointsBonusRecord = {
  id: string;
  amount: number;
  reason: string;
  source: 'challenge' | 'practice' | 'achievement';
  relatedId?: string;
  date: string;
  createdAt: number;
};
