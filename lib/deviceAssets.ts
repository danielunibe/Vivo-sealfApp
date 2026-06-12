export interface DeviceAsset {
  deviceId: string;
  name: string;
  thumbnailSrc?: string;
  registerSrc?: string;
  catalogSrc?: string;
  fallbackLabel: string;
  hasRealAssets?: boolean;
}

export const DEVICE_ASSETS: Record<string, DeviceAsset> = {
  'dev-1': {
    deviceId: 'dev-1',
    name: 'Y04',
    thumbnailSrc: '/assets/devices/y04/thumb.webp',
    registerSrc: '/assets/devices/y04/register.webp',
    catalogSrc: '/assets/devices/y04/catalog.webp',
    fallbackLabel: 'Y04',
    hasRealAssets: true
  },
  'dev-2': {
    deviceId: 'dev-2',
    name: 'Y21D',
    thumbnailSrc: '/assets/devices/y21d/thumb.webp',
    registerSrc: '/assets/devices/y21d/register.webp',
    catalogSrc: '/assets/devices/y21d/catalog.webp',
    fallbackLabel: 'Y21D',
    hasRealAssets: true
  },
  'dev-3': {
    deviceId: 'dev-3',
    name: 'Y29',
    thumbnailSrc: '/assets/devices/y29/thumb.webp',
    registerSrc: '/assets/devices/y29/register.webp',
    catalogSrc: '/assets/devices/y29/catalog.webp',
    fallbackLabel: 'Y29',
    hasRealAssets: true
  },
  'dev-4': {
    deviceId: 'dev-4',
    name: 'V50 LITE',
    thumbnailSrc: '/assets/devices/v50-lite/thumb.webp',
    registerSrc: '/assets/devices/v50-lite/register.webp',
    catalogSrc: '/assets/devices/v50-lite/catalog.webp',
    fallbackLabel: 'V50',
    hasRealAssets: true
  },
  'dev-5': {
    deviceId: 'dev-5',
    name: 'V60 LITE',
    thumbnailSrc: '/assets/devices/v60-lite/thumb.webp',
    registerSrc: '/assets/devices/v60-lite/register.webp',
    catalogSrc: '/assets/devices/v60-lite/catalog.webp',
    fallbackLabel: 'V60',
    hasRealAssets: true
  }
};

export function getDeviceAsset(nameOrId: string): DeviceAsset {
  // First try by ID
  if (DEVICE_ASSETS[nameOrId]) {
    return DEVICE_ASSETS[nameOrId];
  }
  // Then try by name (exact match or partial matching)
  const normalizedName = nameOrId.toLowerCase().trim();
  for (const key in DEVICE_ASSETS) {
    if (DEVICE_ASSETS[key].name.toLowerCase() === normalizedName || DEVICE_ASSETS[key].fallbackLabel.toLowerCase() === normalizedName) {
      return DEVICE_ASSETS[key];
    }
  }
  
  // Return generic fallback if no match
  return {
    deviceId: 'unknown',
    name: nameOrId,
    fallbackLabel: nameOrId.substring(0, 4).toUpperCase()
  };
}
