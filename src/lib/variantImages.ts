import React from 'react';
import { PhoneVariant } from '../types';
import { getMediaAsset } from './localMediaStore';

export const getActiveVariantImageRef = (variant?: PhoneVariant | null) => {
  if (!variant?.activeImageId || !Array.isArray(variant.imageGallery)) return null;
  return variant.imageGallery.find((image) => image.id === variant.activeImageId) ?? null;
};

export const useVariantImageSrc = (variant: PhoneVariant | null | undefined, fallbackSrc: string | null | undefined) => {
  const [src, setSrc] = React.useState(fallbackSrc ?? '');
  const activeRef = getActiveVariantImageRef(variant);
  const mediaAssetId = activeRef?.mediaAssetId;

  React.useEffect(() => {
    let isMounted = true;
    setSrc(fallbackSrc ?? '');

    if (!mediaAssetId) return () => {
      isMounted = false;
    };

    getMediaAsset(mediaAssetId)
      .then((asset) => {
        if (isMounted && asset?.dataUrl) {
          setSrc(asset.dataUrl);
        }
      })
      .catch(() => {
        if (isMounted) setSrc(fallbackSrc ?? '');
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackSrc, mediaAssetId]);

  return src;
};
