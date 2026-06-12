'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionType } from '@/types/navigation';
import { TactileCalendarIcon, TactilePiggyIcon, TactileCatalogIcon, TactileRegisterIcon, TactileSettingsIcon } from '@/components/ui/TactileIcons';
import { triggerFeedback } from '@/lib/nativeFeedback';

interface SectionIconGridProps {
  theme: 'light' | 'dark';
  activeTab: SectionType;
  handleTabChange: (tab: SectionType) => void;
  coinFeedbackAmount?: number | null;
  hasNewCalendarSale?: boolean;
}

export default function SectionIconGrid({
  theme,
  activeTab,
  handleTabChange,
  coinFeedbackAmount,
  hasNewCalendarSale
}: SectionIconGridProps) {
  // Navigation tabs configuration corresponding to OriginOS style grid
  const items = [
    {
      id: 'calendar' as SectionType,
      label: 'Calendario',
      color: 'var(--neo-text)'
    },
    {
      id: 'catalog' as SectionType,
      label: 'Catálogo',
      color: 'var(--neo-text)'
    },
    {
      id: 'register-sale' as SectionType,
      label: 'Registrar',
      color: 'var(--neo-text)'
    },
    {
      id: 'piggy-bank' as SectionType,
      label: 'Puerquito',
      color: 'var(--neo-text)'
    },
    {
      id: 'settings' as SectionType,
      label: 'Ajustes',
      color: 'var(--neo-text)'
    }
  ];

  return (
    <div className="absolute bottom-[calc(0.5rem+env(safe-area-inset-bottom))] xs:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] inset-x-0 flex justify-center z-40 px-4 xs:px-6 pointer-events-none">
      <div className="neo-dock max-w-[360px] w-full p-2 rounded-[22px] flex items-center justify-between gap-1.5 transition-all duration-300 pointer-events-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          
          let borderRadiusClass = 'rounded-[22px]';
          if (isActive) {
            borderRadiusClass = (item.id === 'catalog' || item.id === 'register-sale') 
              ? 'rounded-xl' // squircle
              : 'rounded-xl';
          }
          
          let inactiveColorClass = '';
          if (!isActive) {
            inactiveColorClass = theme === 'light'
              ? 'bg-transparent text-neutral-500 hover:text-neutral-800'
              : 'bg-transparent text-neutral-400 hover:text-neutral-100';
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                void triggerFeedback('navigation');
                handleTabChange(item.id);
              }}
              className="flex-1 flex flex-col items-center focus:outline-hidden group cursor-pointer relative"
              title={item.label}
            >
              <AnimatePresence>
                {item.id === 'piggy-bank' && coinFeedbackAmount != null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -25, scale: 1 }}
                    exit={{ opacity: 0, y: -35, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="absolute -top-1 pointer-events-none z-50 text-[11px] font-black font-mono tracking-tighter"
                    style={{ color: item.color, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  >
                    +${coinFeedbackAmount} MXN
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Neumorphic simple icon container */}
              <motion.div
                whileTap={{ scale: 0.92 }}
                animate={item.id === 'piggy-bank' && coinFeedbackAmount != null ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={`h-[48px] w-[48px] ${borderRadiusClass} flex items-center justify-center transition-all duration-300 relative ${
                  isActive ? 'scale-105' : inactiveColorClass
                }`}
              >
                {item.id === 'calendar' && hasNewCalendarSale && (
                  <motion.div
                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center border border-white dark:border-neutral-900 z-30 text-[9px] font-black text-white"
                    animate={{
                      scale: [1, 1.25, 1],
                      boxShadow: [
                        '0 0 0 0px rgba(16,185,129,0.5)',
                        '0 0 0 6px rgba(16,185,129,0)',
                        '0 0 0 0px rgba(16,185,129,0.5)'
                      ]
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ★
                  </motion.div>
                )}
                
                {item.id === 'calendar' ? (
                  <TactileCalendarIcon isActive={isActive} theme={theme} />
                ) : item.id === 'piggy-bank' ? (
                  <TactilePiggyIcon isActive={isActive} theme={theme} />
                ) : item.id === 'catalog' ? (
                  <TactileCatalogIcon isActive={isActive} theme={theme} />
                ) : item.id === 'register-sale' ? (
                  <TactileRegisterIcon isActive={isActive} theme={theme} />
                ) : (
                  <TactileSettingsIcon isActive={isActive} theme={theme} />
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
