'use client';

import React, { useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'motion/react';
import DeviceCard from './DeviceCard';
import { Device } from '@/types/device';
import { triggerFeedback } from '@/lib/nativeFeedback';

interface DeviceCarouselProps {
  theme: 'light' | 'dark';
  devices: Device[];
  activeCarouselIndex: number;
  setActiveCarouselIndex: (index: number) => void;
  activeColorIndex: number;
  setActiveColorIndex: (idx: number) => void;

  // Inline holding states propagated from parent
  confirmStage: 'idle' | 'holding';
  setConfirmStage: (stage: 'idle' | 'holding') => void;
  holdProgress: number;
  progressPercent: number;
  isHolding: boolean;
  startHolding: (e: React.MouseEvent | React.TouchEvent) => void;
  stopHolding: () => void;
  isConfirming: boolean;
}

export default function DeviceCarousel({
  theme,
  devices,
  activeCarouselIndex,
  setActiveCarouselIndex,
  activeColorIndex,
  setActiveColorIndex,

  // Inline holding states
  confirmStage,
  setConfirmStage,
  holdProgress,
  progressPercent,
  isHolding,
  startHolding,
  stopHolding,
  isConfirming
}: DeviceCarouselProps) {
  
  // Keyboard arrow keys navigation for accessible AAA control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveCarouselIndex((activeCarouselIndex - 1 + devices.length) % devices.length);
        void triggerFeedback('selection');
      } else if (e.key === 'ArrowRight') {
        setActiveCarouselIndex((activeCarouselIndex + 1) % devices.length);
        void triggerFeedback('selection');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCarouselIndex, devices.length, setActiveCarouselIndex]);

  // Drag threshold for swipe gesture recognition
  const swipeThreshold = 35;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offsetX = info.offset.x;
    if (offsetX < -swipeThreshold) {
      // Swipe left -> Next
      setActiveCarouselIndex((activeCarouselIndex + 1) % devices.length);
      void triggerFeedback('selection');
    } else if (offsetX > swipeThreshold) {
      // Swipe right -> Prev
      setActiveCarouselIndex((activeCarouselIndex - 1 + devices.length) % devices.length);
      void triggerFeedback('selection');
    }
  };

  const activeDevice = devices[activeCarouselIndex];
  return (
    <div className="w-full flex-1 flex flex-col justify-between pt-4 pb-2 select-none relative overflow-visible">
      
      {/* Giant Active Model Title Header at the very top */}
      <div className="text-center mt-2 flex-shrink-0 relative z-20 h-[48px] flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={activeDevice?.name || 'loading'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="text-4xl font-extrabold font-serif tracking-normal text-[var(--neo-text)] transition-colors duration-300">
              {activeDevice ? activeDevice.name : 'Cargando...'}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Touch and cursor responsive draggable viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-visible w-full mt-4">
        
        {/* Transparent invisible helper bounds to guide drag/swipe with touch or mouse */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="flex gap-4 items-center cursor-grab active:cursor-grabbing w-full justify-center absolute inset-0 z-10"
          style={{ touchAction: 'none' }}
        >
          {devices.map((device, idx) => {
            const isFocused = idx === activeCarouselIndex;
            const diff = idx - activeCarouselIndex;
            
            return (
              <DeviceCard
                key={device.id}
                theme={theme}
                device={device}
                isFocused={isFocused}
                diff={diff}
                activeColorIndex={activeColorIndex}
                setActiveColorIndex={setActiveColorIndex}
                onClick={() => {
                  if (!isFocused) {
                    setActiveCarouselIndex(idx);
                    void triggerFeedback('selection');
                  }
                }}
                
                // Inline holding state props
                confirmStage={confirmStage}
                setConfirmStage={setConfirmStage}
                holdProgress={holdProgress}
                progressPercent={progressPercent}
                isHolding={isHolding}
                startHolding={startHolding}
                stopHolding={stopHolding}
                isConfirming={isConfirming}
              />
            );
          })}
        </motion.div>

      </div>

    </div>
  );
}
