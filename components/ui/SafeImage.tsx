import React, { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  accentColor?: string;
  isThumbnail?: boolean;
}

export default function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallbackLabel = 'Modelo',
  accentColor = '#71717a',
  isThumbnail = false
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already broken on mount or update (solves SSR/hydration load race conditions)
  useEffect(() => {
    if (imgRef.current) {
      if (imgRef.current.complete && imgRef.current.naturalWidth === 0) {
        setError(true);
      }
    }
  }, [src]);

  if (!src || error) {
    if (isThumbnail) {
      return (
        <div 
          className={`flex items-center justify-center bg-transparent border-none overflow-hidden ${className}`}
          style={{ width: '100%', height: '100%' }}
        >
          <Smartphone 
            className="w-3/4 h-3/4 opacity-60" 
            style={{ color: accentColor }} 
            strokeWidth={1.5}
          />
        </div>
      );
    }
    
    return (
      <div 
        className={`flex flex-col items-center justify-center border border-dashed rounded-[20px] bg-neutral-100/5 dark:bg-white/5 opacity-50 ${className}`} 
        style={{ borderColor: `${accentColor}40` }}
      >
        <Smartphone 
          className="w-8 h-8 mb-2 opacity-40 animate-pulse"
          style={{ color: accentColor }}
          strokeWidth={1.5}
        />
        <span 
          className="text-[9px] font-black uppercase tracking-[0.2em] font-mono text-center opacity-60 px-2"
          style={{ color: accentColor }}
        >
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    // This primitive intentionally uses <img> because it must support data URLs, local assets, and SSR-safe fallback handling.
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      ref={imgRef}
      src={src} 
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      draggable={false}
    />
  );
}
