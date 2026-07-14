import { DeviceModel, PhoneModel, PhoneVariant } from '../types';

type OfficialDeviceCover = {
  colorName: string;
  colorHex: string;
  path: string;
  iconPath?: string;
  aliases?: string[];
};

const officialCoversByModel: Record<string, OfficialDeviceCover[]> = {
  y04: [
    {
      colorName: 'Verde Jade',
      colorHex: '#10b981',
      path: '/assets/devices/official/vivoY04_verde_jade.png',
      iconPath: '/assets/devices/official/vivoY04_verde_jade.svg',
    },
    {
      colorName: 'Lavanda Cristal',
      colorHex: '#8b5cf6',
      path: '/assets/devices/official/vivoY04_lavanda_cristal.png',
      iconPath: '/assets/devices/official/vivoY04_lavanda_cristal.svg',
    },
  ],
  y21d: [
    {
      colorName: 'Negro Jade',
      colorHex: '#1f2937',
      path: '/assets/devices/official/vivoy21d_negrto_jade.png',
      iconPath: '/assets/devices/official/vivoy21d_negrto_jade.svg',
      aliases: ['negrto jade'],
    },
    {
      colorName: 'Morado Lavanda',
      colorHex: '#8b5cf6',
      path: '/assets/devices/official/vivoy21d_morado_lavanda.png',
      iconPath: '/assets/devices/official/vivoy21d_morado_lavanda.svg',
    },
  ],
  y29: [
    {
      colorName: 'Black Expresso',
      colorHex: '#1f2937',
      path: '/assets/devices/official/vivoy29_black_exxpresso.png',
      iconPath: '/assets/devices/official/vivoy29_black_exxpresso.svg',
      aliases: ['black exxpresso', 'negro espresso', 'negro expresso'],
    },
    {
      colorName: 'Blanco Nube',
      colorHex: '#f8fafc',
      path: '/assets/devices/official/vivoy29_blanconube.png',
      iconPath: '/assets/devices/official/vivoy29_blanconube.svg',
      aliases: ['blanco nube'],
    },
  ],
  y31d: [
    {
      colorName: 'Gris Estelar',
      colorHex: '#64748b',
      path: '/assets/devices/official/vivoY31d_gris_estelar.png',
      iconPath: '/assets/devices/official/vivoY31d_gris_estelar.png',
    },
    {
      colorName: 'Blanco Brillante',
      colorHex: '#f8fafc',
      path: '/assets/devices/official/vivoY31d_blanco_brillante.png',
      iconPath: '/assets/devices/official/vivoY31d_blanco_brillante.svg',
    },
  ],
  'v50-lite': [
    {
      colorName: 'Negro Mistico',
      colorHex: '#1f2937',
      path: '/assets/devices/official/Vivov50lite_negromistico.png',
      iconPath: '/assets/devices/official/Vivov50lite_negromistico.svg',
      aliases: ['negro mistico', 'negro mistico'],
    },
    {
      colorName: 'Lila Fantasia',
      colorHex: '#8b5cf6',
      path: '/assets/devices/official/vivov50lite_lilafantasia.png',
      iconPath: '/assets/devices/official/vivov50lite_lilafantasia.svg',
      aliases: ['lila fantasia'],
    },
  ],
  'v60-lite': [
    {
      colorName: 'Negro Elegante',
      colorHex: '#111827',
      path: '/assets/devices/official/vivov60lite_negroelegante.png',
      iconPath: '/assets/devices/official/vivov60lite_negroelegante.svg',
      aliases: ['negro urbano'],
    },
    {
      colorName: 'Azul Titanio',
      colorHex: '#3b82f6',
      path: '/assets/devices/official/vivov60lite_azultitanio.png',
      iconPath: '/assets/devices/official/vivov60lite_azultitanio.svg',
      aliases: ['azul titanio', 'rosa pop'],
    },
  ],
};

export const normalizeTextKey = (value: string = '') => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export type CoverColorDiscrepancy = {
  hasDiscrepancy: boolean;
  variantId: string;
  declaredColor: string;
  derivedColor: string;
};

/**
 * Detecta una discrepancia entre el color DECLARADO (tabla de links / colors de
 * DEFAULT_DEVICES) y el color DERIVADO del nombre del archivo de portada.
 *
 * Función PURA: NO registra ni produce efectos secundarios (no llama a
 * `console.warn`). Reporta discrepancia SI Y SOLO SI el color declarado y el
 * derivado difieren tras `normalizeTextKey`.
 *
 * Retorna el objeto de discrepancia cuando difieren, o `null` cuando coinciden.
 * La imagen mostrada NO cambia por esta función (sigue al archivo); tampoco el
 * link oficial del modelo. Su único propósito es señalar la diferencia.
 *
 * Validates: Requirements 2.6
 */
export const detectCoverColorDiscrepancy = (params: {
  variantId: string;
  declaredColor: string;
  fileDerivedColor: string;
}): CoverColorDiscrepancy | null => {
  const { variantId, declaredColor, fileDerivedColor } = params;
  const hasDiscrepancy =
    normalizeTextKey(declaredColor) !== normalizeTextKey(fileDerivedColor);

  if (!hasDiscrepancy) return null;

  return {
    hasDiscrepancy: true,
    variantId,
    declaredColor,
    derivedColor: fileDerivedColor,
  };
};

/**
 * Wrapper con efecto: usa la función pura `detectCoverColorDiscrepancy` y, solo
 * cuando hay discrepancia real, registra un aviso con `console.warn` que incluye
 * la Variant afectada, el color declarado y el color derivado del nombre de
 * archivo. Retorna `true` si emitió el aviso, `false` si no había discrepancia.
 *
 * Validates: Requirements 2.6
 */
export const logCoverColorDiscrepancy = (params: {
  variantId: string;
  declaredColor: string;
  fileDerivedColor: string;
}): boolean => {
  const discrepancy = detectCoverColorDiscrepancy(params);
  if (!discrepancy) return false;

  console.warn(
    '[officialDeviceCovers] Discrepancia de color declarado vs. derivado del archivo. ' +
      'La imagen mostrada sigue al archivo; el link oficial no cambia.',
    {
      variantId: discrepancy.variantId,
      colorDeclarado: discrepancy.declaredColor,
      colorDerivado: discrepancy.derivedColor,
    },
  );
  return true;
};

export const normalizeOfficialModelId = (modelId: string = '') => {
  const key = normalizeTextKey(modelId);
  if (key === 'v50-lite' || key === 'v50lite') return 'v50-lite';
  if (key === 'v60-lite' || key === 'v60lite') return 'v60-lite';
  return key;
};

const getCoverKeyCandidates = (cover: OfficialDeviceCover) => {
  return [cover.colorName, ...(cover.aliases ?? [])].map(normalizeTextKey);
};

export const getOfficialCoversForModel = (modelId: string = '') => {
  return officialCoversByModel[normalizeOfficialModelId(modelId)] ?? [];
};

export const getOfficialCoverForColor = (modelId: string = '', colorName: string = '') => {
  const colorKey = normalizeTextKey(colorName);
  return getOfficialCoversForModel(modelId).find((cover) =>
    getCoverKeyCandidates(cover).includes(colorKey),
  );
};

export const getOfficialIconForColor = (modelId: string = '', colorName: string = '') => {
  const cover = getOfficialCoverForColor(modelId, colorName);
  return cover?.iconPath ?? cover?.path;
};

export const getOfficialIconForCover = (cover: OfficialDeviceCover) => {
  return cover.iconPath ?? cover.path;
};

export const getFirstOfficialCoverForModel = (modelId: string = '') => {
  return getOfficialCoversForModel(modelId)[0];
};

export const applyOfficialCoversToDevice = (device: DeviceModel): DeviceModel => {
  const covers = getOfficialCoversForModel(device.id);
  if (covers.length === 0) return device;

  const firstCover = covers[0];

  return {
    ...device,
    id: normalizeOfficialModelId(device.id),
    colors: covers.map((cover) => cover.colorName),
    imagePath: firstCover.path,
    heroImagePath: firstCover.path,
    catalogImagePath: firstCover.path,
    calendarImagePath: getOfficialIconForCover(firstCover),
    carouselImages: covers.map((cover) => cover.path),
  };
};

export const applyOfficialCoversToPhoneModel = (model: PhoneModel): PhoneModel => {
  const modelId = normalizeOfficialModelId(model.id);
  const covers = getOfficialCoversForModel(modelId);
  if (covers.length === 0) return model;

  const existingByColor = new Map(
    model.variants.map((variant) => [normalizeTextKey(variant.colorName), variant]),
  );
  const coverKeys = new Set(covers.flatMap(getCoverKeyCandidates));

  const variants: PhoneVariant[] = covers.map((cover, index) => {
    const existing =
      existingByColor.get(normalizeTextKey(cover.colorName)) ??
      (cover.aliases ?? [])
        .map((alias) => existingByColor.get(normalizeTextKey(alias)))
        .find(Boolean) ??
      model.variants[index];

    const resolvedId = existing?.id ?? `${modelId}-${normalizeTextKey(cover.colorName)}`;

    // Registro de discrepancia (Req 2.6): si el color declarado en el catálogo
    // difiere del color derivado del nombre del archivo, se emite un aviso una
    // sola vez al aplicar las portadas. La imagen resuelta sigue al archivo
    // (`cover.path`) y el `officialUrl` del modelo no cambia.
    if (existing?.colorName) {
      logCoverColorDiscrepancy({
        variantId: resolvedId,
        declaredColor: existing.colorName,
        fileDerivedColor: cover.colorName,
      });
    }

    return {
      id: resolvedId,
      modelId,
      colorName: cover.colorName,
      colorHex: existing?.colorHex ?? cover.colorHex,
      imagePath: cover.path,
      catalogImagePath: cover.path,
      calendarImagePath: getOfficialIconForCover(cover),
      stock: existing?.stock ?? (index === 0 ? 5 : 0),
      minStock: existing?.minStock ?? 1,
      commission: existing?.commission ?? model.variants[0]?.commission ?? 0,
      isActive: existing?.isActive ?? true,
      sortOrder: existing?.sortOrder ?? index,
      imageGallery: existing?.imageGallery,
      activeImageId: existing?.activeImageId,
    };
  });

  const firstCover = covers[0];

  return {
    ...model,
    id: modelId,
    accentColor: model.accentColor ?? firstCover.colorHex,
    heroImagePath: firstCover.path,
    thumbnailImagePath: firstCover.path,
    backgroundImagePath: firstCover.path,
    svgIconPath: firstCover.iconPath ?? firstCover.path,
    variants,
  };
};
