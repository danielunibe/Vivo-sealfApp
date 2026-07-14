import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import type {PhoneModel} from '../../types';
import {DEFAULT_DEVICES} from '../constants';
import {normalizeDeviceId} from '../storage';

// Feature: catalog-purchase-experience, Property 5: Preservación idempotente de la URL oficial del usuario
// Para todo PhoneModel con una officialUrl configurada por el usuario, aplicar la siembra de defaults
// y la reparación del catálogo conserva el valor del usuario sin sobrescribirlo; aplicar la operación
// dos veces produce el mismo resultado que aplicarla una vez (idempotencia).
//
// **Validates: Requirements 3.8**

// Importamos las funciones internas necesarias para el test
// Para poder testear repairPhoneModelsCatalog sin depender de localStorage,
// necesitamos recrear las funciones críticas o acceder a ellas.
// Como repairPhoneModelsCatalog no está exportada, la reimplementamos aquí
// para propósitos de testing basándonos en el código de storage.ts

import {
  applyOfficialCoversToPhoneModel,
  normalizeOfficialModelId,
} from '../officialDeviceCovers';
import {normalizePhoneModelsOrder} from '../modelOrdering';
import {legacyCommercialToProfile} from '../commercialProfile';
import type {DeviceModel, PhoneVariant} from '../../types';
import {getDeviceHeroImage} from '../deviceImages';

// Reimplementación de createPhoneModelFromDevice basada en storage.ts
const createPhoneModelFromDevice = (dev: DeviceModel, index: number): PhoneModel => {
  const modelId = normalizeDeviceId(dev.id);
  const colors =
    Array.isArray(dev.colors) && dev.colors.length > 0 ? dev.colors : ['Color Base'];

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

  let variants: PhoneVariant[] = colors.map((c, i) => ({
    id: `${modelId}-${c.toLowerCase().replace(/\s+/g, '-')}`,
    modelId,
    colorName: c,
    colorHex: getOldHexColor(c),
    stock: i === 0 ? (dev.stock ?? 5) : 0,
    minStock: dev.minStock ?? 1,
    commission: dev.margin,
    isActive: true,
    sortOrder: i,
  }));

  return applyOfficialCoversToPhoneModel({
    id: modelId,
    name: dev.name,
    shortName: dev.name,
    accentColor: variants[0]?.colorHex || '#3b82f6',
    heroImagePath: dev.heroImagePath || dev.imagePath,
    thumbnailImagePath: dev.imagePath,
    isActive: dev.isActive ?? true,
    sortOrder: index,
    officialUrl: dev.officialUrl,
    pitch: dev.pitch,
    commercialProfile:
      dev.commercialProfile ?? legacyCommercialToProfile(dev.commercial),
    specs: dev.specs,
    variants,
  });
};

// Reimplementación de isGenericVariant basada en storage.ts
const isGenericVariant = (
  variant: Partial<PhoneVariant> | undefined | null,
) => {
  if (!variant) return false;
  const colorName = String(variant.colorName ?? '').trim().toLowerCase();
  const variantId = String(variant.id ?? '').trim().toLowerCase();
  return (
    colorName === 'variante principal' || variantId.includes('var-default')
  );
};

// Reimplementación de findStoredModelForDefault basada en storage.ts
const findStoredModelForDefault = (
  models: PhoneModel[],
  defaultDevice: DeviceModel,
) => {
  const defaultId = normalizeDeviceId(defaultDevice.id);
  return models.find((model) => {
    const candidateIds = [model.id, model.name, model.shortName]
      .filter(Boolean)
      .map((value) => normalizeDeviceId(String(value)));
    return candidateIds.includes(defaultId);
  });
};

// Reimplementación de repairPhoneModelsCatalog basada en storage.ts
const repairPhoneModelsCatalog = (models: PhoneModel[]): PhoneModel[] => {
  const normalizedModels = normalizePhoneModelsOrder(models);
  const repairedDefaults = DEFAULT_DEVICES.map((defaultDevice, index) => {
    const canonicalModel = createPhoneModelFromDevice(defaultDevice, index);
    const storedModel = findStoredModelForDefault(
      normalizedModels,
      defaultDevice,
    );
    if (!storedModel) return canonicalModel;

    const donorVariants =
      normalizePhoneModelsOrder([storedModel])[0]?.variants ?? [];
    const genericDonor = donorVariants.find(isGenericVariant) ?? donorVariants[0];

    const variants = canonicalModel.variants.map(
      (canonicalVariant, variantIndex) => {
        const matchedVariant =
          donorVariants.find(
            (variant) =>
              normalizeDeviceId(variant.colorName) ===
              normalizeDeviceId(canonicalVariant.colorName),
          ) ??
          donorVariants.find(
            (variant) =>
              normalizeDeviceId(variant.id) ===
              normalizeDeviceId(canonicalVariant.id),
          );
        const operationalVariant =
          matchedVariant ?? (variantIndex === 0 ? genericDonor : undefined);

        return {
          ...canonicalVariant,
          stock: operationalVariant?.stock ?? canonicalVariant.stock,
          minStock: operationalVariant?.minStock ?? canonicalVariant.minStock,
          commission:
            operationalVariant?.commission ?? canonicalVariant.commission,
          isActive: operationalVariant?.isActive ?? canonicalVariant.isActive,
          sortOrder:
            typeof operationalVariant?.sortOrder === 'number'
              ? operationalVariant.sortOrder
              : canonicalVariant.sortOrder,
          imageGallery:
            matchedVariant?.imageGallery ?? canonicalVariant.imageGallery,
          activeImageId:
            matchedVariant?.activeImageId ?? canonicalVariant.activeImageId,
        };
      },
    );

    return {
      ...canonicalModel,
      seriesName: storedModel.seriesName ?? canonicalModel.seriesName,
      officialUrl: storedModel.officialUrl ?? canonicalModel.officialUrl,
      isActive: storedModel.isActive ?? canonicalModel.isActive,
      sortOrder:
        typeof storedModel.sortOrder === 'number'
          ? storedModel.sortOrder
          : canonicalModel.sortOrder,
      variants,
    };
  });

  const customModels = normalizedModels.filter(
    (model) =>
      !DEFAULT_DEVICES.some((device) =>
        findStoredModelForDefault([model], device),
      ),
  );
  return normalizePhoneModelsOrder([...repairedDefaults, ...customModels]);
};

describe('Property 5: Preservación idempotente de la URL oficial del usuario', () => {
  it('conserva la officialUrl configurada por el usuario y es idempotente', () => {
    fc.assert(
      fc.property(
        // Generador: selecciona un modelo DEFAULT_DEVICES y una URL personalizada
        fc.constantFrom(...DEFAULT_DEVICES),
        fc.webUrl({withFragments: false, withQueryParameters: false}),
        (defaultDevice, customUrl) => {
          // 1. Crear un modelo con officialUrl personalizada del usuario
          const modelWithCustomUrl = createPhoneModelFromDevice(
            {...defaultDevice, officialUrl: customUrl},
            0,
          );

          // 2. Aplicar repairPhoneModelsCatalog UNA vez
          const repairedOnce = repairPhoneModelsCatalog([modelWithCustomUrl]);

          // 3. Encontrar el modelo reparado correspondiente
          const repairedModel = repairedOnce.find(
            (m) => normalizeDeviceId(m.id) === normalizeDeviceId(defaultDevice.id),
          );

          // Verificación 1: El modelo existe después de la reparación
          expect(repairedModel).toBeDefined();

          // Verificación 2: La officialUrl del usuario se conserva (no se sobrescribe)
          expect(repairedModel!.officialUrl).toBe(customUrl);

          // 4. Aplicar repairPhoneModelsCatalog DOS veces (idempotencia)
          const repairedTwice = repairPhoneModelsCatalog(repairedOnce);

          // 5. Encontrar el modelo después de la segunda aplicación
          const repairedModelTwice = repairedTwice.find(
            (m) => normalizeDeviceId(m.id) === normalizeDeviceId(defaultDevice.id),
          );

          // Verificación 3: La officialUrl sigue siendo la del usuario después de dos aplicaciones
          expect(repairedModelTwice!.officialUrl).toBe(customUrl);

          // Verificación 4: Idempotencia - aplicar una vez == aplicar dos veces
          expect(JSON.stringify(repairedOnce)).toBe(
            JSON.stringify(repairedTwice),
          );

          return true;
        },
      ),
      {numRuns: 100},
    );
  });
});
