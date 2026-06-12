import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { Device } from '@/types/device';
import { SectionType } from '@/types/navigation';
import { getPaletteForDevice } from '@/lib/modelPalettes';

interface AppOverlaysProps {
  theme: 'light' | 'dark';
  activeTab: SectionType;
  devices: Device[];
  activeCarouselIndex: number;
  setActiveCarouselIndex: (idx: number) => void;
  showCoin: boolean;
  submittedFeedback: string | null;
  activeColorIndex: number;
  activeTopNotification?: { deviceName: string; margin: number; colorName?: string; } | null;
}

export default function AppOverlays({
  theme,
  activeTab,
  devices,
  activeCarouselIndex,
  setActiveCarouselIndex,
  showCoin,
  submittedFeedback,
  activeColorIndex,
  activeTopNotification
}: AppOverlaysProps) {
  const activeDevices = devices.filter(d => d.active !== false);
  const safeCarouselIndex = Math.max(0, Math.min(activeCarouselIndex, activeDevices.length - 1));
  const activeDevice = activeDevices[safeCarouselIndex];
  const activePalette = activeDevice ? getPaletteForDevice(activeDevice.name, activeDevice) : [];
  const activeColor = activePalette[activeColorIndex] || activePalette[0];

  // Resolve the precise sold device color palette if activeTopNotification is showing
  const soldDevice = activeTopNotification ? devices.find(d => d.name === activeTopNotification.deviceName) : null;
  const soldPalette = soldDevice ? getPaletteForDevice(soldDevice.name, soldDevice) : [];
  const soldColor = activeTopNotification 
    ? (soldPalette.find(c => c.name === activeTopNotification.colorName) || soldPalette[0]) 
    : null;

  return (
    <>
      {/* PREMIUM TICKET STYLE TOP NOTIFICATION RECEIPT */}
      <AnimatePresence>
        {activeTopNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.94, x: '-50%' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              x: '-50%'
            }}
            exit={{ opacity: 0, y: -45, scale: 0.95, x: '-50%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className={`fixed top-6 left-1/2 w-full max-w-[316px] rounded-[24px] overflow-hidden border shadow-[0_20px_45px_rgba(0,0,0,0.35)] z-[100] px-5 py-3.5 transition-all outline-hidden select-none ${
              theme === 'light'
                ? 'bg-white/85 border-neutral-200/50 text-[#1C2C28] backdrop-blur-xl'
                : 'bg-neutral-950/90 border-neutral-850/60 text-white backdrop-blur-xl'
            }`}
            style={{
              boxShadow: theme === 'light'
                ? `0 15px 35px -8px rgba(0,0,0,0.1), 0 0 24px ${(soldColor?.accent || '#10B981')}18`
                : `0 24px 50px -10px rgba(0,0,0,0.8), 0 0 32px ${(soldColor?.accent || '#10B981')}24`
            }}
          >
            {/* Elegant vertical aesthetic accent brand strap matching the exact palette of sold model */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500"
              style={{ backgroundColor: soldColor?.accent || '#10B981' }}
            />

            <div className="pl-2 select-none flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-mono font-black uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
                  Ticket de Venta
                </span>
                {/* Minimal glowing status color active dot */}
                <motion.span 
                  className="w-1.5 h-1.5 rounded-full animate-pulse shadow-xs shrink-0"
                  style={{ 
                    backgroundColor: soldColor?.accent || '#10B981',
                    boxShadow: `0 0 8px ${soldColor?.accent || '#10B981'}`
                  }}
                />
              </div>

              {/* Classic double ticket divider dotted line */}
              <div className="border-t border-dashed border-neutral-200/70 dark:border-neutral-800/80 my-1 w-full" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12.5px] font-black font-serif tracking-tight truncate leading-tight">
                    {activeTopNotification.deviceName}
                  </h4>
                  <p className="text-[9.5px] text-neutral-400 dark:text-neutral-500 font-mono tracking-wide truncate mt-0.5">
                    {activeTopNotification.colorName || 'Default'}
                  </p>
                </div>
                
                <div className="text-right shrink-0">
                  <p 
                    className="text-xs font-black font-mono tracking-tight"
                    style={{ color: soldColor?.accent || '#10B981' }}
                  >
                    +${activeTopNotification.margin} MXN
                  </p>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-emerald-500 font-black mt-0.5">
                    Abonados
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FLOATING INDICATOR DOTS MOVED ABOVE THE MENU PILL */}
      <AnimatePresence>
        {activeTab === 'register-sale' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-[104px] inset-x-0 flex items-center justify-center gap-2.5 z-30 pointer-events-auto"
          >
            {activeDevices.map((_, idx) => {
              const isActive = idx === activeCarouselIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-6 shadow-sm' : 'w-1.5 bg-black/15 dark:bg-white/20 hover:bg-black/25 dark:hover:bg-white/30'
                  }`}
                  style={{
                    backgroundColor: isActive && activeColor ? activeColor.accent : undefined
                  }}
                  title={`Modelo ${idx + 1}`}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COIN FLIGHT ANIMATION OVERLAY */}
      <AnimatePresence>
        {showCoin && (
          <motion.div
            initial={{ x: 0, y: -40, scale: 0.1, opacity: 0, rotate: 0 }}
            animate={{
              x: [0, 0, 75],
              y: [-40, -180, 280],
              scale: [0.1, 1.8, 0.2],
              opacity: [0, 1, 0],
              rotate: [0, 270, 1080]
            }}
            transition={{
              duration: 1.25,
              times: [0, 0.35, 1],
              ease: 'easeInOut'
            }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -ml-6 -mt-6 w-12 h-12 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center border-2 border-yellow-200 shadow-2xl z-[100] pointer-events-none"
          >
            <span className="text-white font-extrabold text-sm drop-shadow-md">$</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK FEED TOAST - RE-ENGINEERED AS A HIGH-END MICRO-PILL WITH ZERO CLUTTER */}
      <AnimatePresence>
        {submittedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -8, scale: 0.95, x: '-50%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className={`fixed bottom-[108px] left-1/2 w-auto px-4 py-2 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.15)] z-50 text-[10px] font-black uppercase font-mono tracking-widest flex items-center gap-2 border transition-all pointer-events-none ${
              theme === 'light'
                ? 'bg-[#1C2C28] text-white border-white/10'
                : 'bg-neutral-900/95 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {/* Blinking mini coin glow */}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate max-w-[200px] font-mono">{submittedFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
