'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import DeviceCarousel from '../sales/DeviceCarousel';
import { Device } from '@/types/device';
import { getPaletteForDevice } from '@/lib/modelPalettes';
import { triggerFeedback } from '@/lib/nativeFeedback';
import { getTodayDateKey } from '@/lib/dateUtils';

interface RegisterSaleSectionProps {
  theme: 'light' | 'dark';
  devices: Device[];
  activeCarouselIndex: number;
  setActiveCarouselIndex: (idx: number) => void;
  onConfirmSale: (device: Device, colorName: string | undefined, saleDate: string) => void;
  activeColorIndex: number;
  setActiveColorIndex: (idx: number) => void;
}

export default function RegisterSaleSection({
  theme,
  devices,
  activeCarouselIndex,
  setActiveCarouselIndex,
  onConfirmSale,
  activeColorIndex,
  setActiveColorIndex
}: RegisterSaleSectionProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmStage, setConfirmStage] = useState<'idle' | 'holding'>('idle');
  const [saleDate, setSaleDate] = useState(getTodayDateKey);
  
  const [holdProgress, _setHoldProgress] = useState(0);
  const holdProgressRef = useRef(0);
  const setHoldProgress = (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      _setHoldProgress(prev => {
        const next = val(prev);
        holdProgressRef.current = next;
        return next;
      });
    } else {
      holdProgressRef.current = val;
      _setHoldProgress(val);
    }
  };

  const [isHolding, setIsHolding] = useState(false);
  const HOLD_UPDATE_MS = 50;

  const handleFinalConfirm = React.useCallback(() => {
    const targetDevice = devices[activeCarouselIndex];
    const activePaletteInner = targetDevice ? getPaletteForDevice(targetDevice.name) : [];
    const activeColorInner = activePaletteInner[activeColorIndex] || activePaletteInner[0];
    
    setIsConfirming(true);
    if (targetDevice) {
      void triggerFeedback('sale-confirm');
      onConfirmSale(targetDevice, activeColorInner?.name, saleDate || getTodayDateKey());
    }
    
    // Simulate a brief success state then reset
    setTimeout(() => {
      setIsConfirming(false);
      setConfirmStage('idle');
      setHoldProgress(0);
      setIsHolding(false);
    }, 1000);
  }, [activeCarouselIndex, devices, activeColorIndex, onConfirmSale, saleDate]);

  // Safe ref for trigger confirmation
  const handleFinalConfirmRef = useRef(handleFinalConfirm);
  useEffect(() => {
    handleFinalConfirmRef.current = handleFinalConfirm;
  }, [handleFinalConfirm]);

  // Holding continuous interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isHolding) {
      const startTime = Date.now() - holdProgressRef.current;
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 3000) {
          setHoldProgress(3000);
          clearInterval(intervalId);
          handleFinalConfirmRef.current();
        } else {
          setHoldProgress(elapsed);
        }
      }, HOLD_UPDATE_MS);
    } else if (holdProgressRef.current > 0) {
      const drainStartTime = Date.now();
      const startProgress = holdProgressRef.current;
      intervalId = setInterval(() => {
        const timePassed = Date.now() - drainStartTime;
        const current = startProgress - timePassed * 2.5; // drain at 2.5x speed
        if (current <= 0) {
          setHoldProgress(0);
          clearInterval(intervalId);
        } else {
          setHoldProgress(current);
        }
      }, HOLD_UPDATE_MS);
    }
    return () => clearInterval(intervalId);
  }, [isHolding]);

  const startHolding = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsHolding(true);
    void triggerFeedback('tap');
  };

  const stopHolding = () => {
    setIsHolding(false);
  };

  // Automatically reset the hold state when sliding to another model or color safely after paint
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setConfirmStage('idle');
      _setHoldProgress(0);
      holdProgressRef.current = 0;
      setIsHolding(false);
    });
    return () => cancelAnimationFrame(handle);
  }, [activeCarouselIndex, activeColorIndex]);

  const progressPercent = holdProgress / 3000; // 0 to 1

      // Layer opacities:
      return (
        <div className="w-full h-full flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto scrollbar-none pb-32">

          <div className="relative z-30 mx-auto mt-1 flex w-full max-w-[330px] items-center gap-2 rounded-[14px] border border-[var(--neo-border)] bg-[var(--neo-surface)] px-3 py-2 shadow-[var(--neo-shadow-soft)]">
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--neo-muted)]" />
            <label className="sr-only" htmlFor="sale-date">Fecha de venta</label>
            <input
              id="sale-date"
              type="date"
              required
              value={saleDate}
              onInput={(event) => setSaleDate(event.currentTarget.value)}
              onChange={(event) => setSaleDate(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-[var(--neo-text)] outline-none"
            />
            <button
              type="button"
              onClick={() => setSaleDate(getTodayDateKey())}
              className="neo-button px-3 py-1.5 text-[9px] font-black uppercase text-[var(--neo-text)]"
            >
              Hoy
            </button>
          </div>

          <AnimatePresence>
            {confirmStage === 'holding' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 pointer-events-none -z-10 bg-black"
              >
                <div 
                  className="absolute inset-0 bg-white transition-opacity duration-150"
                  style={{ opacity: Math.min(0.12, progressPercent * 0.12) }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <DeviceCarousel
            theme={theme}
            devices={devices}
            activeCarouselIndex={activeCarouselIndex}
            setActiveCarouselIndex={setActiveCarouselIndex}
            activeColorIndex={activeColorIndex}
            setActiveColorIndex={setActiveColorIndex}
            
            // Propagate safe inline confirmation state to the active card
            confirmStage={confirmStage}
            setConfirmStage={setConfirmStage}
            holdProgress={holdProgress}
            progressPercent={progressPercent}
            isHolding={isHolding}
            startHolding={startHolding}
            stopHolding={stopHolding}
            isConfirming={isConfirming}
          />
        </div>
      );
}
