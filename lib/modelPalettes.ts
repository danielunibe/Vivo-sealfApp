export interface DeviceColor {

  name: string;
  hex: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  glowColor: string;
  bgClass: string;
}

export const DEVICE_PALETTES: Record<string, DeviceColor[]> = {
  'Y04': [
    {
      name: 'Lavanda cristal',
      hex: '#D6C4F0',
      accent: '#8B5CF6',
      bgLight: 'linear-gradient(135deg, #FAF7FF 0%, #F5ECFE 50%, #ECE1FC 100%)',
      bgDark: 'linear-gradient(135deg, #1A1325 0%, #130E1B 50%, #0E0A14 100%)',
      glowColor: 'rgba(139, 92, 246, 0.15)',
      bgClass: 'bg-lavanda-cristal'
    },
    {
      name: 'Negro jade',
      hex: '#203A30',
      accent: '#10B981',
      bgLight: 'linear-gradient(135deg, #F3F8F6 0%, #E9F4EE 50%, #DCEDE5 100%)',
      bgDark: 'linear-gradient(135deg, #0C1613 0%, #080F0C 50%, #040806 100%)',
      glowColor: 'rgba(16, 185, 129, 0.12)',
      bgClass: 'bg-negro-jade'
    }
  ],
  'Y21D': [
    {
      name: 'Morado Lavanda',
      hex: '#C9B5E8',
      accent: '#7C3AED',
      bgLight: 'linear-gradient(135deg, #F7F4FD 0%, #EDE3FE 50%, #E3D1FC 100%)',
      bgDark: 'linear-gradient(135deg, #181126 0%, #110C1B 50%, #0C0814 100%)',
      glowColor: 'rgba(124, 58, 237, 0.15)',
      bgClass: 'bg-morado-lavanda'
    }
  ],
  'Y29': [
    {
      name: 'Blanco Nube',
      hex: '#E0EEF7',
      accent: '#0EA5E9',
      bgLight: 'linear-gradient(135deg, #F4F9FC 0%, #EAF4F8 50%, #DDEDF4 100%)',
      bgDark: 'linear-gradient(135deg, #0E1317 0%, #0A0E10 50%, #06080A 100%)',
      glowColor: 'rgba(14, 165, 233, 0.15)',
      bgClass: 'bg-blanco-nube'
    },
    {
      name: 'Negro Espresso',
      hex: '#3B2E2A',
      accent: '#D97706',
      bgLight: 'linear-gradient(135deg, #FCFAF9 0%, #F6F1EE 50%, #EDE1DA 100%)',
      bgDark: 'linear-gradient(135deg, #16110F 0%, #0F0C0A 50%, #080605 100%)',
      glowColor: 'rgba(217, 119, 6, 0.12)',
      bgClass: 'bg-negro-espresso'
    }
  ],
  'V50 LITE': [
    {
      name: 'Negro Místico',
      hex: '#23232D',
      accent: '#6366F1',
      bgLight: 'linear-gradient(135deg, #F6F6F8 0%, #EEEEF2 50%, #DFDFEB 100%)',
      bgDark: 'linear-gradient(135deg, #101015 0%, #0A0A0D 50%, #050507 100%)',
      glowColor: 'rgba(99, 102, 241, 0.12)',
      bgClass: 'bg-negro-mistico'
    },
    {
      name: 'Lila Fantasía',
      hex: '#E2BCF7',
      accent: '#D946EF',
      bgLight: 'linear-gradient(135deg, #FCF8FE 0%, #F6EFFF 50%, #EEDCFF 100%)',
      bgDark: 'linear-gradient(135deg, #1C1125 0%, #130B1A 50%, #0B0610 100%)',
      glowColor: 'rgba(217, 70, 239, 0.15)',
      bgClass: 'bg-lila-fantasia'
    }
  ],
  'V60 LITE': [
    {
      name: 'Negro Urbano',
      hex: '#2D2D30',
      accent: '#14B8A6',
      bgLight: 'linear-gradient(135deg, #F7F8F8 0%, #EFF0F0 50%, #DFE2E2 100%)',
      bgDark: 'linear-gradient(135deg, #111313 0%, #0B0D0D 50%, #050606 100%)',
      glowColor: 'rgba(20, 184, 166, 0.12)',
      bgClass: 'bg-negro-urbano'
    },
    {
      name: 'Rosa Pop',
      hex: '#F9E2E8',
      accent: '#F472B6',
      bgLight: 'linear-gradient(135deg, #FCF5F7 0%, #F9E8EC 50%, #F4D3DD 100%)',
      bgDark: 'linear-gradient(135deg, #2A171D 0%, #1D0E13 50%, #12070A 100%)',
      glowColor: 'rgba(244, 114, 182, 0.15)',
      bgClass: 'bg-rosa-pop'
    }
  ]
};

import { Device } from '@/types/device';

export function getPaletteForDevice(deviceName: string, device?: Device): DeviceColor[] {
  // If the device has custom colors configured, map them dynamically!
  if (device && device.colors && device.colors.length > 0) {
    return device.colors.map(col => {
      const hex = col.hex || '#71717a';
      return {
        name: col.name || 'Personalizado',
        hex: hex,
        accent: hex,
        bgLight: `linear-gradient(135deg, ${hex}15 0%, ${hex}05 50%, #FAF9F5 100%)`,
        bgDark: `linear-gradient(135deg, ${hex}15 0%, ${hex}05 50%, #121413 100%)`,
        glowColor: `${hex}22`,
        bgClass: '' // Will use inline background color gradient
      };
    });
  }

  const key = deviceName.toUpperCase();
  if (key.includes('Y04')) return DEVICE_PALETTES['Y04'];
  if (key.includes('Y21D') || key.includes('Y21')) return DEVICE_PALETTES['Y21D'];
  if (key.includes('Y29')) return DEVICE_PALETTES['Y29'];
  if (key.includes('V50')) return DEVICE_PALETTES['V50 LITE'];
  if (key.includes('V60')) return DEVICE_PALETTES['V60 LITE'];
  return DEVICE_PALETTES['Y04'];
}
