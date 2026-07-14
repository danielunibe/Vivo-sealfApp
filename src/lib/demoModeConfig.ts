import { DemoModeConfig, DemoSalesIntensity, DemoStockLevel } from '../types';

export const DEMO_DATE_DEFAULT = '2026-06-13';

export const DEFAULT_DEMO_MODE_CONFIG: DemoModeConfig = {
  anchorDate: DEMO_DATE_DEFAULT,
  promoterName: 'María García',
  storeName: 'Sucursal GDL Centro',
  workStartTime: '11:00',
  workEndTime: '20:00',
  dailyGoal: 3,
  monthlyGoal: 38,
  commissionGoal: 8500,
  salesIntensity: 'balanced',
  todaySalesCount: 2,
  stockLevel: 'balanced',
  includeChallenges: true,
  includePointBonuses: true,
  includeFullCatalog: true,
};

export const DEMO_SALES_INTENSITY_OPTIONS: { value: DemoSalesIntensity; label: string }[] = [
  { value: 'light', label: 'Ligero' },
  { value: 'balanced', label: 'Equilibrado' },
  { value: 'strong', label: 'Intenso' },
];

export const DEMO_STOCK_LEVEL_OPTIONS: { value: DemoStockLevel; label: string }[] = [
  { value: 'tight', label: 'Ajustado' },
  { value: 'balanced', label: 'Equilibrado' },
  { value: 'generous', label: 'Generoso' },
];

export const resolveDemoModeConfig = (partial?: Partial<DemoModeConfig>): DemoModeConfig => ({
  ...DEFAULT_DEMO_MODE_CONFIG,
  ...(partial ?? {}),
});

export const getStockMultiplier = (level: DemoStockLevel): number => {
  switch (level) {
    case 'tight':
      return 0.55;
    case 'generous':
      return 1.45;
    default:
      return 1;
  }
};

export const getDemoDatasetVersion = (config: DemoModeConfig): string =>
  [
    'demo-v3',
    config.anchorDate,
    config.salesIntensity,
    config.todaySalesCount,
    config.stockLevel,
    config.includeChallenges ? 1 : 0,
    config.includePointBonuses ? 1 : 0,
    config.includeFullCatalog ? 1 : 0,
    config.dailyGoal,
    config.monthlyGoal,
    config.commissionGoal,
    config.promoterName,
    config.storeName,
  ].join('|');
