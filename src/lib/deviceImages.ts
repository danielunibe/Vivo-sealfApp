import { DeviceModel, PhoneModel, PhoneVariant, SaleRecord } from '../types';
import { getWallpaperFor } from './deviceUtils';
import { getFirstOfficialCoverForModel, getOfficialCoverForColor, getOfficialIconForColor, normalizeTextKey } from './officialDeviceCovers';
import { resolveSaleWallpaperForModel } from './saleWallpaper';

export const getDevicePlaceholder = (deviceId: string, color: string = '') => {
  return getOfficialCoverForColor(deviceId, color)?.path ?? getFirstOfficialCoverForModel(deviceId)?.path ?? getWallpaperFor(deviceId, color);
};

export const getDeviceHeroImage = (device: DeviceModel, color: string = '') => {
  const officialCover = getOfficialCoverForColor(device.id, color || device.colors?.[0] || '');
  if (officialCover) return officialCover.path;
  if (device.heroImagePath) return device.heroImagePath;
  if (device.imagePath) return device.imagePath;
  if (device.catalogImagePath) return device.catalogImagePath;
  return getDevicePlaceholder(device.id, color || device.colors?.[0] || '');
};

export const getDeviceCatalogImage = (device: DeviceModel) => {
  if (device.catalogImagePath) return device.catalogImagePath;
  if (device.imagePath) return device.imagePath;
  if (device.heroImagePath) return device.heroImagePath;
  return null; // For catalog, we fallback to VivoPhoneIcon SVG if null
};

export const getPhoneModelCalendarImage = (model: PhoneModel, colorName: string = '') => {
  const variant = findPhoneVariantForColor(model, colorName);
  const resolvedColor = colorName || variant?.colorName || '';
  const officialIcon = getOfficialIconForColor(model.id, resolvedColor);
  if (officialIcon) return officialIcon;
  if (variant?.calendarImagePath) return variant.calendarImagePath;
  if (variant?.imagePath) return variant.imagePath;
  if (variant?.catalogImagePath) return variant.catalogImagePath;
  if (model.thumbnailImagePath) return model.thumbnailImagePath;
  if (model.heroImagePath) return model.heroImagePath;
  return getDevicePlaceholder(model.id, resolvedColor);
};

export const getPhoneModelHeroImage = (model: PhoneModel, colorName: string = '') => {
  const variant = findPhoneVariantForColor(model, colorName);
  const resolvedColor = colorName || variant?.colorName || '';
  const officialCover = getOfficialCoverForColor(model.id, resolvedColor);
  if (officialCover) return officialCover.path;
  if (variant?.imagePath) return variant.imagePath;
  if (variant?.catalogImagePath) return variant.catalogImagePath;
  if (model.heroImagePath) return model.heroImagePath;
  if (model.thumbnailImagePath) return model.thumbnailImagePath;
  if (model.backgroundImagePath) return model.backgroundImagePath;
  return getDevicePlaceholder(model.id, resolvedColor);
};

export const getDeviceCalendarImage = (device: DeviceModel, color: string = '') => {
  const officialIcon = getOfficialIconForColor(device.id, color || device.colors?.[0] || '');
  if (officialIcon) return officialIcon;
  if (device.calendarImagePath) return device.calendarImagePath;
  if (device.imagePath) return device.imagePath;
  if (device.catalogImagePath) return device.catalogImagePath;
  return getDevicePlaceholder(device.id, color || device.colors?.[0] || '');
};

export const getDeviceCarouselImages = (device: DeviceModel) => {
  if (device.carouselImages && device.carouselImages.length > 0) return device.carouselImages;
  if (device.heroImagePath) return [device.heroImagePath];
  if (device.imagePath) return [device.imagePath];
  return [];
};

export const findPhoneVariantForColor = (model: PhoneModel, colorName: string = ''): PhoneVariant | undefined => {
  const colorKey = normalizeTextKey(colorName);
  if (colorKey) {
    const exactVariant = model.variants.find((variant) => normalizeTextKey(variant.colorName) === colorKey);
    if (exactVariant) return exactVariant;
  }

  return model.variants.find((variant) => variant.isActive) ?? model.variants[0];
};

export const getPhoneVariantCatalogImage = (model: PhoneModel, colorName: string = '') => {
  const variant = findPhoneVariantForColor(model, colorName);
  const resolvedColor = colorName || variant?.colorName || '';
  const officialCover = getOfficialCoverForColor(model.id, resolvedColor);
  if (officialCover) return officialCover.path;

  return (
    variant?.catalogImagePath ||
    variant?.imagePath ||
    model.thumbnailImagePath ||
    model.heroImagePath ||
    model.backgroundImagePath ||
    null
  );
};

export const resolveSaleWallpaper = (sale: SaleRecord): string =>
  resolveSaleWallpaperForModel(sale);
