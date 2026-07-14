import { PhoneModel, PhoneVariant } from '../types';
import {
  getFirstOfficialCoverForModel,
  getOfficialCoverForColor,
  getOfficialCoversForModel,
  normalizeTextKey,
} from './officialDeviceCovers';
import { getActiveOrderedVariants } from './modelOrdering';

export type RegisterSelectableEntry = {
  key: string;
  colorName: string;
  accentColor: string;
  imagePath: string;
  variant: PhoneVariant | null;
};

export const getRegisterHexColor = (colorHex?: string) => {
  return colorHex || '#1ecca2';
};

export const formatRegisterModelDisplayName = (model: PhoneModel): string => {
  const base = (model.shortName || model.name || '').trim();
  const withoutBrand = base.replace(/^vivo\s*/i, '').trim();
  return withoutBrand ? `Vivo ${withoutBrand}` : 'Vivo';
};

export const getRegisterWallpaperAccentColor = (model: PhoneModel, variant?: PhoneVariant | null) => {
  const officialCover = getOfficialCoverForColor(model.id, variant?.colorName ?? '');
  return officialCover?.colorHex || variant?.colorHex || model.accentColor || '#1ecca2';
};

export const getRegisterModelHeroImage = (model: PhoneModel, variant?: PhoneVariant | null) => {
  const officialCover = getOfficialCoverForColor(model.id, variant?.colorName ?? '');
  if (officialCover) return officialCover.path;
  if (variant?.imagePath) return variant.imagePath;
  if (model.heroImagePath) return model.heroImagePath;
  if (model.backgroundImagePath) return model.backgroundImagePath;
  return getFirstOfficialCoverForModel(model.id)?.path ?? '/assets/devices/official/vivoY04_verde_jade.png';
};

export const getRegisterModelThumbnailImage = (model: PhoneModel, variant?: PhoneVariant | null) => {
  const officialCover = getOfficialCoverForColor(model.id, variant?.colorName ?? '');
  if (officialCover) return officialCover.path;
  if (variant?.catalogImagePath) return variant.catalogImagePath;
  if (model.thumbnailImagePath) return model.thumbnailImagePath;
  if (variant?.imagePath) return variant.imagePath;
  if (model.heroImagePath) return model.heroImagePath;
  return getFirstOfficialCoverForModel(model.id)?.path ?? '/assets/devices/official/vivoY04_verde_jade.png';
};

export const getRegisterSelectableEntriesForModel = (model: PhoneModel): RegisterSelectableEntry[] => {
  const officialCovers = getOfficialCoversForModel(model.id);
  if (officialCovers.length > 0) {
    return officialCovers.map((cover, index) => ({
      key: `${model.id}-${cover.colorName}`,
      colorName: cover.colorName,
      accentColor: cover.colorHex,
      imagePath: cover.path,
      variant:
        model.variants.find((variant) => normalizeTextKey(variant.colorName) === normalizeTextKey(cover.colorName)) ??
        model.variants[index] ??
        null,
    }));
  }

  return getActiveOrderedVariants(model).map((variant) => ({
    key: `${model.id}-${variant.id}`,
    colorName: variant.colorName,
    accentColor: getRegisterWallpaperAccentColor(model, variant),
    imagePath: getRegisterModelThumbnailImage(model, variant),
    variant,
  }));
};

export const getRegisterDefaultColorNameForModel = (model: PhoneModel) => {
  return getRegisterSelectableEntriesForModel(model)[0]?.colorName ?? null;
};

export const resolveRegisterSelectedColorForModel = (model: PhoneModel, preferredColorName?: string | null) => {
  const entries = getRegisterSelectableEntriesForModel(model);
  if (entries.length === 0) return null;
  if (!preferredColorName) return entries[0].colorName;

  return (
    entries.find((entry) => normalizeTextKey(entry.colorName) === normalizeTextKey(preferredColorName))?.colorName ??
    entries[0].colorName
  );
};

export const resolveRegisterSelectedVariant = (model: PhoneModel, colorName?: string | null) => {
  const activeVariants = getActiveOrderedVariants(model);
  if (activeVariants.length === 0) return null;

  const resolvedColorName = resolveRegisterSelectedColorForModel(model, colorName) ?? activeVariants[0].colorName;
  const officialCover = getOfficialCoverForColor(model.id, resolvedColorName);
  const matchedVariant =
    activeVariants.find((variant) => normalizeTextKey(variant.colorName) === normalizeTextKey(resolvedColorName)) ??
    activeVariants[0];

  if (!officialCover) return matchedVariant;

  return {
    ...matchedVariant,
    colorName: officialCover.colorName,
    colorHex: officialCover.colorHex,
    imagePath: officialCover.path,
    catalogImagePath: officialCover.path,
    calendarImagePath: officialCover.iconPath ?? officialCover.path,
  };
};
