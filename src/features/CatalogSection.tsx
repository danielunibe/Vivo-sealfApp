import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { LiquidGlassSurface } from '../components/ui/LiquidGlass';
import { PhoneModel, PhoneVariant } from '../types';
import { getActivePhoneModels } from '../lib/storage';
import { onInventoryUpdated, onSalesUpdated } from '../lib/events';
import { VivoPhoneIcon } from '../components/icons/VivoPhoneIcon';
import { WebPreviewPanel } from './catalog/WebPreviewPanel';
import { getActiveOrderedVariants } from '../lib/modelOrdering';
import { getModelStockAndMarginSummary, formatMarginRange } from '../lib/catalogAggregation';
import { Browser } from '@capacitor/browser';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
};

const ensureVariants = (variants: PhoneVariant[] | undefined | null): PhoneVariant[] => {
  return Array.isArray(variants) ? variants : [];
};

const getPrimaryVariant = (model: PhoneModel, activeVariants: PhoneVariant[]): PhoneVariant | null => {
  if (activeVariants.length > 0) return activeVariants[0];
  return Array.isArray(model.variants) && model.variants.length > 0 ? model.variants[0] : null;
};

export default function CatalogSection() {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [previewModel, setPreviewModel] = useState<PhoneModel | null>(null);

  useEffect(() => {
    const refresh = () => {
      setModels(getActivePhoneModels());
    };
    refresh();
    const unsubInventory = onInventoryUpdated(refresh);
    const unsubSales = onSalesUpdated(refresh);
    return () => {
      unsubInventory();
      unsubSales();
    };
  }, []);

  const handleCardClick = async (model: PhoneModel) => {
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    
    if (isOffline) {
      // Offline mode: Load our preloaded offline fallback template in WebPreviewPanel iframe
      setPreviewModel(model);
    } else {
      // Online mode: Open Chrome Custom Tab / Safari View Controller directly in-app
      if (model.officialUrl) {
        try {
          await Browser.open({ url: model.officialUrl });
        } catch {
          // Fallback to WebPreviewPanel or window.open if Capacitor Browser fails
          setPreviewModel(model);
        }
      } else {
        setPreviewModel(model);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${previewModel ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'} relative`}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3 px-3 pt-2 pb-6"
      >
        <AnimatePresence>
          {models.map(model => {
            const activeVariants = ensureVariants(getActiveOrderedVariants(model));
            const primaryVariant = getPrimaryVariant(model, activeVariants);
            const { totalStock, minMargin, maxMargin } = getModelStockAndMarginSummary(activeVariants);
            const marginText = formatMarginRange(minMargin, maxMargin);
            const colorSummary = activeVariants.map(v => v.colorName).join(' • ') || 'Sin variantes';

            return (
              <motion.div 
                variants={itemVariants} 
                key={model.id} 
                layoutId={model.id} 
                exit={{ opacity: 0, scale: 0.8 }} 
                whileTap={{ scale: 0.98 }}
              >
                <LiquidGlassSurface 
                  onClick={() => handleCardClick(model)} 
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir web oficial de ${model.name}`}
                  onKeyDown={(event: React.KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleCardClick(model);
                    }
                  }}
                  className="relative flex flex-row items-center justify-between p-3 gap-3 overflow-hidden group cursor-pointer w-full min-h-[4.5rem]"
                >
                  {model.officialUrl && (
                    <div className="absolute top-1.5 right-1.5 z-10 bg-black/5 dark:bg-white/10 p-1 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)] backdrop-blur-md">
                      <ExternalLink size={9} className="text-slate-600 dark:text-white/80" />
                    </div>
                  )}
                  
                  {/* Left Side: Phone Thumbnail */}
                  <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center p-0.5 group-hover:scale-[1.03] transition-transform duration-300 relative bg-black/[0.03] dark:bg-black/25 overflow-hidden border border-black/[0.05] dark:border-white/5">
                    <div className="absolute inset-x-1 bottom-0.5 h-1 rounded-full bg-black/15 blur-xs" />
                    <div className="relative flex h-full w-full items-center justify-center">
                      <VivoPhoneIcon
                        deviceId={model.id}
                        colorName={primaryVariant?.colorName || model.name}
                        className="h-[3.8rem] w-auto drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
                      />
                    </div>
                  </div>
                  
                  {/* Middle and Right: Everything aligned horizontally */}
                  <div className="flex-1 flex flex-row items-center justify-between gap-2 min-w-0">
                    {/* Column 1: Name and Series */}
                    <div className="flex flex-col min-w-[3.8rem] shrink-0 text-left">
                      <h3 className="font-extrabold text-[0.82rem] tracking-tight leading-none text-slate-800 dark:text-white truncate">{model.name}</h3>
                      <span className="text-[0.42rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                        {model.seriesName || 'Serie Y'}
                      </span>
                    </div>

                    {/* Column 2: Colors summary */}
                    <div className="text-[0.44rem] font-black text-gray-500 dark:text-gray-400 truncate uppercase max-w-[5.5rem] text-left shrink-0">
                      {colorSummary}
                    </div>

                    {/* Column 3: Margin and Stock Badges side-by-side */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[0.46rem] font-black py-0.5 px-1.5 rounded bg-[var(--neo-accent)]/10 dark:bg-[var(--neo-accent)]/15 text-[var(--neo-accent)] border border-[var(--neo-accent)]/20 dark:border-[var(--neo-accent)]/25 uppercase tracking-[0.12em] truncate w-fit">
                        {marginText} Margen
                      </span>
                      <span className={`text-[0.42rem] font-bold py-0.5 px-1.5 rounded uppercase tracking-[0.12em] w-fit border ${totalStock > 0 ? (totalStock <= 2 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30' : 'bg-black/5 text-slate-600 border-black/10 dark:bg-white/10 dark:text-white/80 dark:border-white/10') : 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'}`}>
                        {totalStock > 0 ? `${totalStock} Disp.` : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </LiquidGlassSurface>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      
      {/* Spacer for bottom dock to guarantee scrolling past it */}
      <div className="w-full min-h-[calc(env(safe-area-inset-bottom)+180px)] shrink-0 pointer-events-none" aria-hidden="true" />
      
      {models.length === 0 && (
         <div className="text-center p-8 opacity-40 font-bold uppercase text-xs mt-10">
            No se encontraron modelos.
         </div>
      )}

      {/* Web Preview Panel */}
      <AnimatePresence>
        {previewModel && typeof document !== 'undefined' && createPortal(
          <WebPreviewPanel model={previewModel} onClose={() => setPreviewModel(null)} />,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
