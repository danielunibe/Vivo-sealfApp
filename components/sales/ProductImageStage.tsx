import React from 'react';
import { getDeviceAsset } from '@/lib/deviceAssets';
import ProductImageFrame from '../ui/ProductImageFrame';

interface ProductImageStageProps {
  deviceName: string;
  colorName: string;
  accentColor: string;
  customSrc?: string;
}

export default function ProductImageStage({
  deviceName,
  colorName,
  accentColor,
  customSrc
}: ProductImageStageProps) {
  const asset = getDeviceAsset(deviceName);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[160px] pointer-events-none">
      <div className="w-full max-w-[260px] flex items-center justify-center transition-all duration-300 relative compact-scale-phone">
        <ProductImageFrame
          src={customSrc || (asset.hasRealAssets ? asset.registerSrc : undefined)}
          alt={`${deviceName} ${colorName}`}
          fallbackLabel={asset.fallbackLabel}
          accentColor={accentColor}
          variant="hero"
          className="w-full"
          imageClassName="transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
    </div>
  );
}
