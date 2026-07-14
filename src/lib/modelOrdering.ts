import { PhoneModel, PhoneVariant } from '../types';

const asArray = <T>(items: T[] | undefined | null): T[] => {
  return Array.isArray(items) ? items : [];
};

const safeSortOrder = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

export const sortBySortOrder = <T extends { sortOrder?: number }>(items: T[] | undefined | null): T[] => {
  return asArray(items)
    .map((item, index) => ({
      ...item,
      sortOrder: safeSortOrder(item.sortOrder, index),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const normalizeSortOrder = <T extends { sortOrder?: number }>(items: T[] | undefined | null): T[] => {
  return sortBySortOrder(items).map((item, index) => ({
    ...item,
    sortOrder: index,
  }));
};

const normalizeVariantShape = (
  variant: Partial<PhoneVariant> | undefined | null,
  modelId: string,
  index: number,
): PhoneVariant | null => {
  if (!variant || typeof variant !== 'object') return null;
  const colorName = typeof variant.colorName === 'string' && variant.colorName.trim()
    ? variant.colorName
    : `Color ${index + 1}`;

  return {
    id: typeof variant.id === 'string' && variant.id.trim()
      ? variant.id
      : `${modelId}-${index}`,
    modelId: typeof variant.modelId === 'string' && variant.modelId.trim()
      ? variant.modelId
      : modelId,
    colorName,
    colorHex: typeof variant.colorHex === 'string' && variant.colorHex.trim()
      ? variant.colorHex
      : '#1ecca2',
    imagePath: variant.imagePath,
    catalogImagePath: variant.catalogImagePath,
    calendarImagePath: variant.calendarImagePath,
    stock: typeof variant.stock === 'number' && Number.isFinite(variant.stock) ? variant.stock : 0,
    minStock: typeof variant.minStock === 'number' && Number.isFinite(variant.minStock) ? variant.minStock : 1,
    commission: typeof variant.commission === 'number' && Number.isFinite(variant.commission) ? variant.commission : 0,
    isActive: variant.isActive ?? true,
    sortOrder: safeSortOrder(variant.sortOrder, index),
    imageGallery: Array.isArray(variant.imageGallery) ? variant.imageGallery : undefined,
    activeImageId: typeof variant.activeImageId === 'string' && variant.activeImageId.trim()
      ? variant.activeImageId
      : undefined,
  };
};

export const normalizePhoneModelsOrder = (models: PhoneModel[] | undefined | null): PhoneModel[] => {
  return normalizeSortOrder(asArray(models).filter((model) => model && typeof model === 'object')).map((model, index) => {
    const modelId = typeof model.id === 'string' && model.id.trim() ? model.id : `model-${index + 1}`;
    const modelName =
      typeof model.name === 'string' && model.name.trim()
        ? model.name
        : typeof model.shortName === 'string' && model.shortName.trim()
          ? model.shortName
          : `Modelo ${index + 1}`;
    const variants = asArray(model.variants)
      .map((variant, variantIndex) => normalizeVariantShape(variant, modelId, variantIndex))
      .filter(Boolean) as PhoneVariant[];

    return {
      ...model,
      id: modelId,
      name: modelName,
      shortName: typeof model.shortName === 'string' && model.shortName.trim() ? model.shortName : modelName,
      isActive: model.isActive ?? true,
      sortOrder: safeSortOrder(model.sortOrder, index),
      variants: normalizeSortOrder(variants),
    };
  });
};

export const getActiveOrderedVariants = (model: PhoneModel): PhoneVariant[] => {
  return sortBySortOrder(asArray(model.variants).filter((variant) => variant.isActive));
};

export const reorderModels = (
  models: PhoneModel[],
  modelId: string,
  direction: 'up' | 'down',
): PhoneModel[] => {
  const ordered = normalizePhoneModelsOrder(models);
  const index = ordered.findIndex((model) => model.id === modelId);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const reordered = [...ordered];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return normalizePhoneModelsOrder(reordered);
};

export const reorderVariants = (
  models: PhoneModel[],
  modelId: string,
  variantId: string,
  direction: 'up' | 'down',
): PhoneModel[] => {
  return normalizePhoneModelsOrder(models).map((model) => {
    if (model.id !== modelId) return model;

    const variants = normalizeSortOrder(model.variants);
    const index = variants.findIndex((variant) => variant.id === variantId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= variants.length) {
      return model;
    }

    const reordered = [...variants];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    return {
      ...model,
      variants: normalizeSortOrder(reordered),
    };
  });
};

export const moveItemToIndex = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const moveModelToIndex = (
  models: PhoneModel[],
  modelId: string,
  toIndex: number,
): PhoneModel[] => {
  const ordered = normalizePhoneModelsOrder(models);
  const fromIndex = ordered.findIndex((model) => model.id === modelId);
  if (fromIndex < 0) return ordered;
  return normalizePhoneModelsOrder(moveItemToIndex(ordered, fromIndex, toIndex));
};

export const moveVariantToIndex = (
  models: PhoneModel[],
  modelId: string,
  variantId: string,
  toIndex: number,
): PhoneModel[] => {
  return normalizePhoneModelsOrder(models).map((model) => {
    if (model.id !== modelId) return model;

    const variants = normalizeSortOrder(model.variants);
    const fromIndex = variants.findIndex((variant) => variant.id === variantId);
    if (fromIndex < 0) return model;

    return {
      ...model,
      variants: normalizeSortOrder(moveItemToIndex(variants, fromIndex, toIndex)),
    };
  });
};

export const reorderModelsByIds = (models: PhoneModel[], orderedIds: string[]): PhoneModel[] => {
  const byId = new Map(normalizePhoneModelsOrder(models).map((model) => [model.id, model]));
  const next = orderedIds.map((id) => byId.get(id)).filter(Boolean) as PhoneModel[];
  const missing = normalizePhoneModelsOrder(models).filter((model) => !orderedIds.includes(model.id));
  return normalizePhoneModelsOrder([...next, ...missing]);
};

export const reorderVariantsByIds = (
  models: PhoneModel[],
  modelId: string,
  orderedVariantIds: string[],
): PhoneModel[] => {
  return normalizePhoneModelsOrder(models).map((model) => {
    if (model.id !== modelId) return model;

    const byId = new Map(normalizeSortOrder(model.variants).map((variant) => [variant.id, variant]));
    const next = orderedVariantIds.map((id) => byId.get(id)).filter(Boolean) as PhoneVariant[];
    const missing = normalizeSortOrder(model.variants).filter((variant) => !orderedVariantIds.includes(variant.id));

    return {
      ...model,
      variants: normalizeSortOrder([...next, ...missing]),
    };
  });
};
