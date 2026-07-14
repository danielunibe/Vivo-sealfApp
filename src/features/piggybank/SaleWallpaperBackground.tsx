import React, { useMemo } from 'react';
import { SaleRecord, PhoneModel } from '../../types';
import { useVariantImageSrc } from '../../lib/variantImages';
import { resolveSaleWallpaperForModel } from '../../lib/saleWallpaper';
import { resolveManualSaleVariant } from '../../lib/saleCatalog';

type SaleWallpaperBackgroundProps = {
  sale: SaleRecord;
  model?: PhoneModel | null;
};

export function SaleWallpaperBackground({ sale, model }: SaleWallpaperBackgroundProps) {
  const colorName = sale.deviceColorSnapshot || sale.deviceColor || '';
  const variant = useMemo(
    () => (model ? resolveManualSaleVariant(model, colorName) : null),
    [model, colorName],
  );

  const fallbackWallpaper = useMemo(
    () => resolveSaleWallpaperForModel(sale, model),
    [sale, model],
  );

  const wallpaperSrc = useVariantImageSrc(variant, fallbackWallpaper);

  return (
    <>
      <img
        src={wallpaperSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center scale-[1.12] blur-[10px] vivo-photo"
      />
      <div className="absolute inset-0 bg-black/36" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/52 to-black/34" />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/78 via-black/42 to-transparent" />
    </>
  );
}
