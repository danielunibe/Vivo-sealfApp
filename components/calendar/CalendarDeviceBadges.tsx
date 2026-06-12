import React from 'react';
import { CalendarSoldDeviceSummary } from '@/types/sale';
import { DEVICE_PALETTES } from '@/lib/modelPalettes';
import { getDeviceAsset } from '@/lib/deviceAssets';
import SafeImage from '../ui/SafeImage';

interface CalendarDeviceBadgesProps {
  devices: CalendarSoldDeviceSummary[];
  maxVisible?: number;
  theme: 'light' | 'dark';
}

function getAbbreviation(name: string): string {
  // Try to extract something like "V50", "Y29", "V50 lite", but keeping it very short
  const upper = name.toUpperCase();
  const match = upper.match(/([V|Y]\d+)/);
  if (match) {
    return match[1];
  }
  // Fallback to first 3 chars
  return upper.substring(0, 3);
}

export default function CalendarDeviceBadges({ devices, maxVisible = 2, theme }: CalendarDeviceBadgesProps) {
  if (devices.length === 0) return null;

  const visibleDevices = devices.slice(0, maxVisible);
  const remainingCount = devices.length - maxVisible;

  // Render a single device badge
  const renderBadge = (device: CalendarSoldDeviceSummary, idx: number) => {
    // Determine color from modelPalette if possible
    let color = '#71717a'; // default neutral
    
    // Find matching palette
    const key = Object.keys(DEVICE_PALETTES).find(k => k.includes(device.deviceName.toUpperCase()) || device.deviceName.toUpperCase().includes(k));
    if (key) {
      const paletteArr = DEVICE_PALETTES[key as keyof typeof DEVICE_PALETTES];
      const matchColor = paletteArr.find(c => c.name.toLowerCase() === device.colorName.toLowerCase());
      if (matchColor) {
        color = matchColor.hex;
      } else {
        // Fallback to first color in palette
        color = paletteArr[0].hex;
      }
    }

    const asset = getDeviceAsset(device.deviceName);
    const abbreviation = getAbbreviation(device.deviceName);

    return (
      <div 
        key={`${device.deviceId}-${idx}`} 
        className="flex items-center justify-center rounded-[4px] border px-[3px] py-[1px] shadow-sm relative overflow-hidden"
        style={{ 
          backgroundColor: theme === 'light' ? `${color}20` : `${color}35`,
          borderColor: theme === 'light' ? `${color}40` : `${color}60`,
          minWidth: asset.hasRealAssets && asset.thumbnailSrc ? '16px' : 'auto',
          height: '16px'
        }}
        title={`${device.quantity}x ${device.deviceName} ${device.colorName}`}
      >
        {asset.hasRealAssets && asset.thumbnailSrc ? (
          <div className="flex items-center gap-[1.5px]">
            <SafeImage 
              src={asset.thumbnailSrc} 
              alt={abbreviation} 
              className="w-3 h-[12px] object-cover opacity-100"
              isThumbnail={true}
              accentColor={color}
            />
            {device.quantity > 1 && <span className="text-[7.5px] font-black font-mono leading-none tracking-tighter opacity-90" style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>×{device.quantity}</span>}
          </div>
        ) : (
          <span 
            className="text-[7.5px] font-black font-mono leading-none tracking-tighter"
            style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
          >
             {abbreviation}
             {device.quantity > 1 && <span className="opacity-70 ml-[0.5px]">×{device.quantity}</span>}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-[3px] items-center justify-center flex-wrap max-w-full my-0.5">
      {visibleDevices.map(renderBadge)}
      {remainingCount > 0 && (
        <span className="text-[7.5px] font-bold text-neutral-600 dark:text-neutral-300 leading-none bg-neutral-200/80 dark:bg-white/20 px-[3px] py-[1.5px] rounded-[3px]">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
