import React from 'react';
import clsx from 'clsx';
import { PhoneVariant } from '../../types';
import { useVariantImageSrc } from '../../lib/variantImages';

interface VariantMediaImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  variant?: PhoneVariant | null;
  fallbackSrc: string;
  photoClassName?: string;
}

export function VariantMediaImage({
  variant,
  fallbackSrc,
  alt,
  className,
  photoClassName,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: VariantMediaImageProps) {
  const src = useVariantImageSrc(variant, fallbackSrc);

  return (
    <img
      {...props}
      src={src || undefined}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={clsx('vivo-photo', photoClassName, className)}
    />
  );
}
