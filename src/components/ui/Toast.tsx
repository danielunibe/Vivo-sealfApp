import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LiquidGlassSurface } from './LiquidGlass';
import { ToastType } from '../../lib/toast';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
      const newToast = { ...customEvent.detail, id: crypto.randomUUID() };
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full max-w-[var(--app-max-width)]"
          >
            <LiquidGlassSurface className="px-6 py-3 border-l-4 pointer-events-auto rounded-xl flex items-center shadow-lg" style={{ 
                borderLeftColor: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : 'var(--neo-accent)' 
            }}>
                <span className="font-bold text-sm tracking-wide">{t.message}</span>
            </LiquidGlassSurface>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
