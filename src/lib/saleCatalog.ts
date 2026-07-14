import { DeviceModel, PhoneModel, PhoneVariant } from '../types';
import { getActivePhoneModels } from './storage';
import { getActiveOrderedVariants } from './modelOrdering';
import { findPhoneVariantForColor } from './deviceImages';
import { normalizeTextKey } from './officialDeviceCovers';

export const loadManualSaleModels = (): PhoneModel[] => getActivePhoneModels();

export const getModelVariantColors = (model: PhoneModel): string[] =>
  getActiveOrderedVariants(model).map((variant) => variant.colorName);

export const resolveManualSaleVariant = (
  model: PhoneModel | undefined,
  colorName: string,
): PhoneVariant | undefined => {
  if (!model) return undefined;
  const activeVariants = getActiveOrderedVariants(model);
  if (activeVariants.length === 0) return undefined;

  const colorKey = normalizeTextKey(colorName);
  if (colorKey) {
    const exact = activeVariants.find((variant) => normalizeTextKey(variant.colorName) === colorKey);
    if (exact) return exact;
  }

  return findPhoneVariantForColor(model, colorName);
};

export const getVariantCommission = (variant: PhoneVariant | undefined): number =>
  variant?.commission ?? 0;

export { getModelDisplayPoints, getModelPointsPerUnit, calculateSalePoints } from './points';

export const findModelIndexByDeviceId = (models: PhoneModel[], deviceId: string): number =>
  models.findIndex((model) => model.id === deviceId);

export const getModelTotalStock = (model: PhoneModel): number =>
  getActiveOrderedVariants(model).reduce((sum, variant) => sum + (variant.stock || 0), 0);

export const getModelBestCommission = (model: PhoneModel): number =>
  getActiveOrderedVariants(model).reduce(
    (max, variant) => Math.max(max, variant.commission || 0),
    0,
  );

export const getModelMinStockThreshold = (model: PhoneModel): number => {
  const variants = getActiveOrderedVariants(model);
  if (variants.length === 0) return 1;
  return Math.min(...variants.map((variant) => variant.minStock ?? 1));
};

/** Vista compatible con coach/scripts a partir del catálogo unificado. */
export const toCoachDeviceView = (model: PhoneModel): DeviceModel => {
  const variants = getActiveOrderedVariants(model);
  return {
    id: model.id,
    name: model.name,
    margin: getModelBestCommission(model),
    stock: getModelTotalStock(model),
    minStock: getModelMinStockThreshold(model),
    colors: variants.map((variant) => variant.colorName),
    pitch: model.pitch,
    commercialProfile: model.commercialProfile,
    officialUrl: model.officialUrl,
    specs: model.specs,
    isActive: model.isActive,
  };
};
