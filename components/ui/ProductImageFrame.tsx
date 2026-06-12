import React from 'react';
import { Smartphone } from 'lucide-react';
import SafeImage from './SafeImage';

type ProductImageVariant = 'hero' | 'catalog' | 'card' | 'thumb' | 'preview';

interface ProductImageFrameProps {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  accentColor?: string;
  variant?: ProductImageVariant;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  isThumbnail?: boolean;
}

const VARIANT_STYLES: Record<ProductImageVariant, { frame: string; image: string; fallback: string }> = {
  hero: {
    frame: 'rounded-[30px] p-3 sm:p-4 aspect-[3/4] max-w-[260px] sm:max-w-[280px]',
    image: 'object-contain drop-shadow-[0_18px_32px_rgba(0,0,0,0.34)]',
    fallback: 'min-h-[260px]'
  },
  catalog: {
    frame: 'rounded-[24px] p-2 aspect-[4/5]',
    image: 'object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.28)]',
    fallback: 'min-h-[140px]'
  },
  card: {
    frame: 'rounded-[22px] p-2.5 aspect-[4/5]',
    image: 'object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.28)]',
    fallback: 'min-h-[120px]'
  },
  thumb: {
    frame: 'rounded-[16px] p-1.5 aspect-[4/5]',
    image: 'object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.24)]',
    fallback: 'min-h-[64px]'
  },
  preview: {
    frame: 'rounded-[18px] p-2 aspect-[4/5]',
    image: 'object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.24)]',
    fallback: 'min-h-[128px]'
  }
};

export default function ProductImageFrame({
  src,
  alt,
  fallbackLabel,
  accentColor = '#6B7280',
  variant = 'catalog',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  isThumbnail = false
}: ProductImageFrameProps) {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <div
      className={[
        'relative overflow-hidden border border-white/10 bg-white/5 dark:bg-black/20 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm',
        variantStyle.frame,
        className
      ].join(' ')}
      style={{
        backgroundImage: `radial-gradient(circle at top, color-mix(in srgb, ${accentColor} 18%, transparent) 0%, transparent 60%)`,
        borderColor: `${accentColor}26`
      }}
    >
      <div
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 12%, transparent) 0%, transparent 45%, color-mix(in srgb, #ffffff 5%, transparent) 100%)`
        }}
      />
      <div className="absolute inset-[1px] rounded-[inherit] border border-white/5 pointer-events-none" />
      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden">
        {src ? (
          <SafeImage
            src={src}
            alt={alt}
            accentColor={accentColor}
            fallbackLabel={fallbackLabel || alt}
            isThumbnail={isThumbnail}
            className={[
              'w-full h-full',
              variantStyle.image,
              imageClassName
            ].join(' ')}
          />
        ) : (
          <div
            className={[
              'flex h-full w-full flex-col items-center justify-center text-center gap-2',
              variantStyle.fallback,
              fallbackClassName
            ].join(' ')}
          >
            <div
              className="flex items-center justify-center rounded-full border border-dashed px-3 py-3"
              style={{ borderColor: `${accentColor}33` }}
            >
              <Smartphone className="h-6 w-6 opacity-70" style={{ color: accentColor }} />
            </div>
            <span
              className="max-w-[80%] text-[10px] font-black uppercase tracking-[0.22em] text-center"
              style={{ color: accentColor }}
            >
              {fallbackLabel || alt}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
