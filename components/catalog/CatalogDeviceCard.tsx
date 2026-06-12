'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Device } from '@/types/device';
import { getDeviceAsset } from '@/lib/deviceAssets';
import ProductImageFrame from '@/components/ui/ProductImageFrame';
import { getDeviceKnowledge, getKnowledgeStatusLabel } from '@/lib/deviceKnowledge';

interface CatalogDeviceCardProps {
  device: Device;
  idx: number;
  onNavigateToSale?: (idx: number) => void;
}

// Display Name maps to proper official naming
const OFFICIAL_DISPLAY_NAMES: Record<string, string> = {
  'Y04': 'Y04',
  'Y21D': 'Y21D',
  'Y29': 'Y29',
  'V50 LITE': 'V50 lite 4G',
  'V60 LITE': 'V60 lite'
};

// Official Colors per model (user requirements)
const OFFICIAL_COLORS_CHIPS: Record<string, Array<{ hex: string; name: string }>> = {
  'Y04': [
    { hex: '#D6C4F0', name: 'Lavanda Cristal' },
    { hex: '#203A30', name: 'Negro Jade' }
  ],
  'Y21D': [
    { hex: '#C9B5E8', name: 'Morado Lavanda' },
    { hex: '#203A30', name: 'Negro Jade' }
  ],
  'Y29': [
    { hex: '#E0EEF7', name: 'Blanco Nube' },
    { hex: '#3B2E2A', name: 'Negro Espresso' }
  ],
  'V50 LITE': [
    { hex: '#23232D', name: 'Negro Místico' },
    { hex: '#E2BCF7', name: 'Lila Fantasía' }
  ],
  'V60 LITE': [
    { hex: '#F9E2E8', name: 'Rosa Pop' },
    { hex: '#2D2D30', name: 'Negro Urbano' }
  ]
};

// Helper to check brightness and apply border if color is too light
const needsSlightBorder = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 210;
};

// Common Arrow Icon for Action Click
const ArrowIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2.5" 
    stroke="currentColor" 
    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

export default function CatalogDeviceCard({
  device,
  idx,
  onNavigateToSale
}: CatalogDeviceCardProps) {
  const nameKey = device.name.toUpperCase();
  const displayName = OFFICIAL_DISPLAY_NAMES[device.name] || device.name;
  const knowledge = getDeviceKnowledge(device);
  const shortTag = knowledge.shortCardLine || knowledge.summary;
  const strengthChips = (knowledge.topStrengths || knowledge.keySpecs || []).slice(0, 3);
  const statusLabel = getKnowledgeStatusLabel(knowledge.confidence);
  const colors = device.colors?.length ? device.colors : OFFICIAL_COLORS_CHIPS[device.name] || [];
  const asset = getDeviceAsset(device.name);

  // Visual layout division: Card 5 (V60 LITE) is a horizontal billboard, others are half-width grids
  const isHorizontalBillboard = device.name === 'V60 LITE';

  if (isHorizontalBillboard) {
    return (
      <motion.div
        id={`catalog-card-${device.id}`}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => onNavigateToSale?.(idx)}
        className="col-span-2 rounded-[20px] bg-[var(--neo-surface-soft)] p-3 pb-2 md:p-4 md:pb-3 border border-[var(--neo-border)] shadow-[var(--neo-shadow-soft)] flex items-center justify-between cursor-pointer relative overflow-hidden group transition-all duration-300 h-full min-h-0"
      >
        {/* Detail Body (Left) */}
        <div className="flex-1 pr-3 text-[var(--neo-text)] z-10 flex flex-col justify-between h-full py-0.5 min-h-0">
          <div className="min-h-0 flex flex-col justify-start">
            <span className="text-[7px] xs:text-[8px] font-bold tracking-wider text-[var(--neo-muted)] uppercase font-mono mb-0.5 block">
              Dispositivo Premium
            </span>
            <h3 className="text-lg xs:text-xl font-black mb-0.2 md:mb-0.5 tracking-tight leading-none">
              {displayName}
            </h3>
            <p className="text-[var(--neo-muted)] text-[9px] xs:text-[10px] font-medium leading-tight max-w-[200px] truncate-2-lines">
              {shortTag}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {strengthChips.map((chip) => (
                <span key={chip} className="rounded-md border border-black/5 bg-black/5 px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-[var(--neo-muted)] dark:border-white/10 dark:bg-white/5">
                  {chip}
                </span>
              ))}
              {knowledge.confidence !== 'confirmed' && (
                <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-amber-100">
                  {statusLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mt-1">
            {/* Color chips list */}
            <div className="flex gap-1.5 shrink-0">
              {colors.map((color, colorIdx) => (
                <span
                  key={colorIdx}
                  className={`w-3 h-3 xs:w-3.5 xs:h-3.5 rounded-full border shadow-sm block ${
                    needsSlightBorder(color.hex) ? 'border-neutral-500/25' : 'border-black/10 dark:border-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Commission */}
            <div className="border-l border-black/10 dark:border-white/10 pl-2.5 md:pl-3">
              <span className="text-[7px] xs:text-[7.5px] font-bold tracking-wider text-[var(--neo-muted)] uppercase font-mono block leading-none">
                Comisión
              </span>
              <span className="text-emerald-400 font-extrabold text-[13px] xs:text-[15px] leading-none font-mono">
                +${device.margin} <span className="text-[7px] xs:text-[8px] font-bold text-[var(--neo-muted)]">MXN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Device Image (Right) */}
        <div className="w-28 xs:w-36 h-28 xs:h-40 relative flex items-center justify-center shrink-0 z-10 group-hover:scale-[1.06] transition-transform duration-500 select-none">
          <ProductImageFrame
            src={device.imageDataUrl || device.imageUrl || (asset.hasRealAssets ? (asset.catalogSrc || asset.thumbnailSrc) : undefined)}
            alt={displayName} 
            variant="card"
            className="w-full h-full"
            imageClassName="drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
            isThumbnail={false}
            accentColor="#ffffff"
            fallbackLabel={displayName}
          />
        </div>

        {/* Embedded action arrow */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 text-[var(--neo-text)] opacity-40 group-hover:opacity-100 transition-opacity">
          <ArrowIcon />
        </div>
      </motion.div>
    );
  }

  // Half-Width Asymmetric Bento Card for other models (Y04, Y21D, Y29, V50 Lite)
  return (
    <motion.div
      id={`catalog-card-${device.id}`}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onNavigateToSale?.(idx)}
      className="col-span-1 rounded-[20px] bg-[var(--neo-surface-soft)] p-3 pb-2 md:p-4 md:pb-3 border border-[var(--neo-border)] shadow-[var(--neo-shadow-soft)] flex flex-col justify-between cursor-pointer relative overflow-hidden group transition-all duration-300 h-full min-h-0"
    >
      {/* Top Header Block inside Card */}
      <div className="text-[var(--neo-text)] z-10 min-h-0 flex flex-col justify-start">
        <span className="text-[7px] xs:text-[8px] font-bold tracking-wider text-[var(--neo-muted)] uppercase font-mono block mb-0.5">
          Serie {device.name.startsWith('V') ? 'V' : 'Y'}
        </span>
        <h3 className="text-base xs:text-lg font-bold tracking-tight leading-tight">
          {displayName}
        </h3>
        <p className="text-[var(--neo-muted)] text-[8px] xs:text-[9px] font-medium leading-none mt-0.5 max-w-[95%]">
          {shortTag}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {strengthChips.slice(0, 2).map((chip) => (
            <span key={chip} className="rounded-md border border-black/5 bg-black/5 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-[var(--neo-muted)] dark:border-white/10 dark:bg-white/5">
              {chip}
            </span>
          ))}
          {knowledge.confidence !== 'confirmed' && (
            <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-amber-100">
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Center Image Slot */}
      <div className="h-20 xs:h-24 md:h-32 w-full my-1 md:my-2 flex items-center justify-center relative z-10 select-none min-h-0">
        <div className="w-full h-full flex items-center justify-center group-hover:scale-[1.08] transition-transform duration-500 ease-out">
          <ProductImageFrame
            src={device.imageDataUrl || device.imageUrl || (asset.hasRealAssets ? (asset.catalogSrc || asset.thumbnailSrc) : undefined)}
            alt={displayName} 
            variant="thumb"
            className="w-full h-full"
            imageClassName="drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
            isThumbnail
            accentColor="#ffffff"
            fallbackLabel={displayName}
          />
        </div>
      </div>

      {/* Bottom specs & comisiones */}
      <div className="border-t border-black/10 dark:border-white/10 pt-1.5 md:pt-2 z-10 shrink-0">
        <div className="flex justify-between items-end">
          {/* Colors */}
          <div className="flex gap-1 shrink-0">
            {colors.map((color, colorIdx) => (
              <span
                key={colorIdx}
                className={`w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full border shadow-xs block ${
                  needsSlightBorder(color.hex) ? 'border-neutral-500/25' : 'border-black/10 dark:border-white/10'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Profit Commission */}
          <div className="text-right">
            <span className="text-[7.5px] font-bold tracking-wider text-[var(--neo-muted)] uppercase font-mono block mb-0.2 leading-none">
              Comisión
            </span>
            <span className="text-emerald-400 font-black text-[11px] xs:text-[13px] leading-none font-mono">
              +${device.margin} <span className="text-[7px] xs:text-[8px] font-semibold text-[var(--neo-muted)]">MXN</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Click Arrow Indicator */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 text-[var(--neo-text)] opacity-30 group-hover:opacity-100 transition-opacity">
        <ArrowIcon />
      </div>
    </motion.div>
  );
}
