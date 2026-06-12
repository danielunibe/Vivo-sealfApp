'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Device } from '@/types/device';
import { getPaletteForDevice } from '@/lib/modelPalettes';
import ProductImageStage from './ProductImageStage';
import SuccessSpinner from '../ui/SuccessSpinner';
import { triggerFeedback } from '@/lib/nativeFeedback';

interface DeviceCardProps {
  theme: 'light' | 'dark';
  device: Device;
  isFocused: boolean;
  onClick: () => void;
  diff: number;
  activeColorIndex: number;
  setActiveColorIndex: (idx: number) => void;

  // Inline holding state props
  confirmStage: 'idle' | 'holding';
  setConfirmStage: (stage: 'idle' | 'holding') => void;
  holdProgress: number;
  progressPercent: number;
  isHolding: boolean;
  startHolding: (e: React.MouseEvent | React.TouchEvent) => void;
  stopHolding: () => void;
  isConfirming: boolean;
}

export default function DeviceCard({
  theme,
  device,
  isFocused,
  onClick,
  diff,
  activeColorIndex,
  setActiveColorIndex,

  confirmStage,
  setConfirmStage,
  holdProgress,
  progressPercent,
  isHolding,
  startHolding,
  stopHolding,
  isConfirming
}: DeviceCardProps) {
  
  const palette = getPaletteForDevice(device.name);
  const activeColor = palette[activeColorIndex] || palette[0];
  const effectiveIsLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{
        opacity: isFocused ? 1 : 0.25,
        scale: isFocused ? 1 : 0.75,
        x: diff * 450,
        y: isFocused ? 0 : 70,
        zIndex: isFocused ? 20 : 5,
        pointerEvents: isFocused ? 'auto' : 'none'
      }}
      transition={{
        type: 'spring',
        stiffness: 160,
        damping: 22,
        mass: 0.8,
        velocity: 0
      }}
      onClick={!isFocused ? onClick : undefined}
      className="absolute w-full h-full flex flex-col items-center justify-between pointer-events-none"
    >
      {/* 
        CENTRAL STAGE: Reserved for vertical phone image & Vertical Color Selector
      */}
      <div className="flex-1 w-full flex items-center justify-center p-4 relative">
        {isFocused && (
          <>
            <ProductImageStage 
              deviceName={device.name}
              colorName={activeColor.name}
              accentColor={activeColor.accent}
              customSrc={device.imageDataUrl || device.imageUrl}
            />

            {/* Vertical Color Selector */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 rounded-full border border-[var(--neo-border)] bg-[var(--neo-surface)] p-2 shadow-[var(--neo-shadow-soft)] pointer-events-auto">
              {palette.map((colorTheme, idx) => {
                const isColorSelected = activeColorIndex === idx;
                return (
                  <button
                    key={colorTheme.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveColorIndex(idx);
                      void triggerFeedback('selection');
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
                      isColorSelected ? 'scale-110 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: colorTheme.hex,
                      outline: isColorSelected ? `2.5px solid ${colorTheme.accent}` : 'none',
                      outlineOffset: '2px',
                      boxShadow: isColorSelected ? '0 0 0 1px var(--neo-surface), 0 2px 8px rgba(0,0,0,0.18)' : 'none'
                    }}
                    title={colorTheme.name}
                  >
                    {isColorSelected && (
                      <Check 
                        className="w-4 h-4 stroke-[4]" 
                        style={{ color: '#000000' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 
        BOTTOM INFO AREA: Kept minimal, just the sell button.
      */}
      {isFocused && (
        <div className="w-full flex-shrink-0 px-6 pb-6 pointer-events-auto flex flex-col gap-5 relative z-30">
          
          <div className="flex flex-col gap-3.5 items-center">
            {/* Color name indicator */}
            <span className={`text-[10px] uppercase tracking-[0.15em] font-mono font-bold ${
              effectiveIsLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              {activeColor.name}
            </span>

            {/* Action button */}
            <div className="flex justify-center w-full min-h-[80px]">
              {isConfirming ? (
                <div className="flex items-center justify-center h-[52px]">
                  <SuccessSpinner />
                </div>
              ) : confirmStage === 'idle' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmStage('holding');
                    void triggerFeedback('tap');
                  }}
                  style={{ 
                    backgroundColor: 'var(--neo-accent)'
                  }}
                  className="w-full max-w-[220px] py-4 rounded-[14px] text-[12px] font-black tracking-widest uppercase transition-all z-30 cursor-pointer text-[var(--neo-accent-contrast)] shadow-[var(--neo-shadow-soft)] active:scale-[0.98]"
                >
                  Concretar venta
                </button>
              ) : (
                <div className="flex flex-col items-center w-full gap-2">
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); startHolding(e); }}
                    onMouseUp={(e) => { e.stopPropagation(); stopHolding(); }}
                    onMouseLeave={(e) => { e.stopPropagation(); stopHolding(); }}
                    onTouchStart={(e) => { e.stopPropagation(); startHolding(e); }}
                    onTouchEnd={(e) => { e.stopPropagation(); stopHolding(); }}
                    style={{ 
                      backgroundColor: '#10B981', // Emerald green as requested
                    }}
                    className="w-full max-w-[220px] py-4 rounded-[20px] text-[12px] font-black tracking-widest uppercase transition-all z-30 cursor-pointer text-white shadow-md active:scale-95 relative overflow-hidden select-none"
                  >
                    {/* Dynamic hold indicator background fill */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-75 pointer-events-none"
                      style={{ width: `${progressPercent * 100}%` }}
                    />
                    <span className="relative z-10 pointer-events-none">
                      {holdProgress > 0 
                        ? `Sostén: ${Math.ceil((3000 - holdProgress) / 1000)}s...` 
                        : 'Confirmar venta'}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmStage('idle');
                      void triggerFeedback('warning');
                    }}
                    className={`text-[10px] uppercase font-black tracking-widest cursor-pointer hover:underline transition-all ${
                      effectiveIsLight ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
