import { SaleRecord, PhoneModel } from '../types';
import { getOfficialCoverForColor, getFirstOfficialCoverForModel } from './officialDeviceCovers';
import { getRegisterModelHeroImage } from './registerHomeProjection';
import { findPhoneVariantForColor } from './deviceImages';
import { resolveManualSaleVariant } from './saleCatalog';

export const isSvgImagePath = (path: string) => {
  if (!path) return false;
  if (path.startsWith('data:image/svg')) return true;
  return /\.svg($|[?#])/i.test(path);
};

export const resolveSaleWallpaperForModel = (
  sale: SaleRecord,
  model?: PhoneModel | null,
): string => {
  const colorName = sale.deviceColorSnapshot || sale.deviceColor || '';
  const snapshot = sale.deviceImageSnapshot || '';

  if (snapshot && !isSvgImagePath(snapshot)) {
    return snapshot;
  }

  if (model) {
    const variant = resolveManualSaleVariant(model, colorName) || findPhoneVariantForColor(model, colorName);
    const hero = getRegisterModelHeroImage(model, variant);
    if (hero && !isSvgImagePath(hero)) {
      return hero;
    }
  }

  const officialCover = getOfficialCoverForColor(sale.deviceId, colorName);
  if (officialCover?.path) {
    return officialCover.path;
  }

  return getFirstOfficialCoverForModel(sale.deviceId)?.path ?? snapshot;
};
