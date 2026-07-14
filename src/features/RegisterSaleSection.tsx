import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { PhoneModel, PhoneVariant, SaleRecord } from '../types';
import { getActivePhoneModels, saveSaleWithInventory, runStorageMigrations } from '../lib/storage';
import { toast } from '../lib/toast';
import { ConfirmSaleSheet } from './register/ConfirmSaleSheet';
import { RegisterThumbnailSidePanels } from './register/RegisterThumbnailSidePanels';
import { getAppToday } from '../lib/date';
import { getNowForSaleRecording, buildSaleRecordedAtForDate } from '../lib/saleTimestamps';
import { emitSaleConfirmed, onInventoryUpdated } from '../lib/events';
import { normalizeTextKey } from '../lib/officialDeviceCovers';
import { useVariantImageSrc } from '../lib/variantImages';
import {
  getRegisterDefaultColorNameForModel,
  getRegisterHexColor,
  getRegisterModelHeroImage,
  getRegisterSelectableEntriesForModel,
  getRegisterWallpaperAccentColor,
  formatRegisterModelDisplayName,
  resolveRegisterSelectedColorForModel,
  resolveRegisterSelectedVariant,
} from '../lib/registerHomeProjection';

export default function RegisterSaleSection() {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down'>('left');
  const [catalogLoadError, setCatalogLoadError] = useState<string | null>(null);

  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const selectedVariant = React.useMemo(
    () => (selectedModel ? resolveRegisterSelectedVariant(selectedModel, selectedColorName) : null),
    [selectedModel, selectedColorName],
  );
  const fallbackWallpaper = selectedModel && selectedVariant ? getRegisterModelHeroImage(selectedModel, selectedVariant) : '';
  const activeWallpaper = useVariantImageSrc(selectedVariant, fallbackWallpaper);

  const applyLoadedModels = React.useCallback((loaded: PhoneModel[]) => {
    setModels(loaded);
    if (loaded.length > 0) {
      const y04Model = loaded.find(d => d.shortName.toLowerCase() === 'y04' || d.name.toLowerCase() === 'y04') || loaded[0];
      setSelectedModel(y04Model);
      setSelectedColorName(getRegisterDefaultColorNameForModel(y04Model));
      setCatalogLoadError(null);
      return;
    }

    setSelectedModel(null);
    setSelectedColorName(null);
    setCatalogLoadError('No hay modelos activos disponibles.');
  }, []);

  const reloadCatalogState = React.useCallback(() => {
    try {
      const loaded = getActivePhoneModels();
      applyLoadedModels(loaded);
    } catch (error) {
      console.error('[REGISTER] Catalog load failed', error);
      setCatalogLoadError('No se pudo cargar el catalogo local.');
      setModels([]);
      setSelectedModel(null);
      setSelectedColorName(null);
    }
  }, [applyLoadedModels]);

  const repairCatalogState = React.useCallback(() => {
    runStorageMigrations();
    reloadCatalogState();
  }, [reloadCatalogState]);
  
  useEffect(() => {
    reloadCatalogState();
    
    // We keep this event listener compatible with the dynamic island, mapped to model id
    const handleSelectDevice = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const currentModels = getActivePhoneModels();
        const modelToSelect = currentModels.find(d => d.id === customEvent.detail);
        if (modelToSelect) {
          setSelectedModel(modelToSelect);
          setSelectedColorName(getRegisterDefaultColorNameForModel(modelToSelect));
        }
      }
    };
    window.addEventListener('select-device', handleSelectDevice);
    
    const unsubscribe = onInventoryUpdated(() => {
      const updatedModels = getActivePhoneModels();
      setModels(updatedModels);
      setSelectedModel(prev => {
        if (!prev) return updatedModels[0] || null;
        const freshModel = updatedModels.find(d => d.id === prev.id) || updatedModels[0] || null;
        if (freshModel) {
          setSelectedColorName(prevColor => resolveRegisterSelectedColorForModel(freshModel, prevColor));
        }
        return freshModel;
      });
    });
    
    return () => {
      window.removeEventListener('select-device', handleSelectDevice);
      unsubscribe();
    };
  }, [reloadCatalogState]);

  // Dispatch state change events to SmartPill to keep color dots and states in premium sync
  useEffect(() => {
    if (selectedModel && selectedVariant) {
      window.dispatchEvent(
        new CustomEvent('register-state-changed', {
          detail: {
            selectedColor: selectedVariant.colorName,
            colors: getRegisterSelectableEntriesForModel(selectedModel).map((entry) => entry.colorName),
            deviceName: selectedModel.name,
          },
        })
      );
    }
  }, [selectedModel, selectedVariant]);

  // Handle color change coming from clicking dots in the top SmartPill
  useEffect(() => {
    const handleSetColor = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.color && selectedModel) {
        setSelectedColorName(resolveRegisterSelectedColorForModel(selectedModel, customEvent.detail.color));
      }
    };
    window.addEventListener('change-device-color', handleSetColor);
    return () => window.removeEventListener('change-device-color', handleSetColor);
  }, [selectedModel]);

  const handleConfirmSale = React.useCallback((payload: { model: PhoneModel; variant: PhoneVariant; quantity: number; totalCommission: number; commissionPerUnit: number; isCustomCommission: boolean; baseCommissionSnapshot: number }) => {
    const { model, variant, quantity, totalCommission, commissionPerUnit, isCustomCommission, baseCommissionSnapshot } = payload;
    if (!model || !variant) return;
    
    const recordedAt = getNowForSaleRecording();
    const newSale: SaleRecord = {
      id: crypto.randomUUID(),
      date: recordedAt.date,
      // Backward compat mappings
      deviceId: model.id,
      deviceNameSnapshot: model.name,
      deviceColorSnapshot: variant.colorName,
      deviceImageSnapshot: activeWallpaper || getRegisterModelHeroImage(model, variant),
      quantity,
      commissionPerUnit,
      amountEarned: totalCommission,
      createdAt: recordedAt.createdAt,
      recordedTime: recordedAt.recordedTime,
      recordedAtIso: recordedAt.recordedAtIso,
      isCustomCommission,
      baseCommissionSnapshot,
      
      // Sprint 3: New Fields
      modelId: model.id,
      variantId: variant.id,
      variantNameSnapshot: variant.colorName,
      variantColorHexSnapshot: variant.colorHex,
      modelAccentColorSnapshot: model.accentColor
    };
    
    saveSaleWithInventory(newSale);
    
    emitSaleConfirmed({
      deviceName: model.name,
      amountEarned: totalCommission,
      deviceColor: variant.colorName
    });

    toast(`Venta registrada con éxito`, 'success');
    setShowConfirmSheet(false);
  }, [activeWallpaper]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const gestureLayerRef = useRef<HTMLDivElement>(null);

  const selectModelByDelta = React.useCallback((delta: number, direction: 'up' | 'down') => {
    if (!selectedModel || models.length === 0) return;
    const currentIdx = models.findIndex((model) => model.id === selectedModel.id);
    if (currentIdx === -1) return;

    setSwipeDirection(direction);
    const nextModel = models[(currentIdx + delta + models.length) % models.length];
    setSelectedModel(nextModel);
    setSelectedColorName(getRegisterDefaultColorNameForModel(nextModel));
  }, [models, selectedModel]);

  const selectLateralColor = React.useCallback((direction: 'left' | 'right') => {
    if (!selectedModel || !selectedVariant) return;
    const entries = getRegisterSelectableEntriesForModel(selectedModel);
    if (entries.length === 0) return;

    const leftEntry = entries[0];
    const rightEntry = entries[Math.min(1, entries.length - 1)];
    const isOnLeftSlot = normalizeTextKey(selectedVariant.colorName) === normalizeTextKey(leftEntry.colorName);

    if (direction === 'right') {
      if (!isOnLeftSlot || entries.length === 1) return;
      setSwipeDirection('left');
      setSelectedColorName(rightEntry.colorName);
      return;
    }

    if (isOnLeftSlot && entries.length > 1) return;
    setSwipeDirection('right');
    setSelectedColorName(leftEntry.colorName);
  }, [selectedModel, selectedVariant]);

  const applyRegisterGesture = React.useCallback((diffX: number, diffY: number) => {
    if (!selectedModel || !selectedVariant || models.length === 0) return;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) < 36) return;
      selectLateralColor(diffX > 0 ? 'right' : 'left');
      return;
    }

    if (Math.abs(diffY) < 36) return;
    if (diffY > 0) {
      selectModelByDelta(1, 'up');
    } else {
      selectModelByDelta(-1, 'down');
    }
  }, [models.length, selectLateralColor, selectModelByDelta, selectedModel, selectedVariant]);

  // Wheel: vertical = modelos, horizontal = columna lateral izquierda/derecha
  const handleWheelChange = React.useCallback((e: WheelEvent | React.WheelEvent) => {
    if (!selectedModel || !selectedVariant) return;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) >= 24) {
      e.preventDefault();
      selectLateralColor(e.deltaX > 0 ? 'right' : 'left');
      return;
    }

    if (Math.abs(e.deltaY) < 24) return;
    e.preventDefault();
    if (e.deltaY > 0) {
      selectModelByDelta(1, 'up');
    } else {
      selectModelByDelta(-1, 'down');
    }
  }, [selectLateralColor, selectModelByDelta, selectedModel, selectedVariant]);

  useEffect(() => {
    const layer = gestureLayerRef.current;
    if (!layer) return;

    const onWheel = (event: WheelEvent) => handleWheelChange(event);
    layer.addEventListener('wheel', onWheel, { passive: false });
    return () => layer.removeEventListener('wheel', onWheel);
  }, [handleWheelChange]);

  const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setTouchStartX(e.clientX);
    setTouchStartY(e.clientY);
  }, []);

  const handlePointerUp = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (touchStartX === null || touchStartY === null) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Pointer may already be released.
    }

    const diffX = touchStartX - e.clientX;
    const diffY = touchStartY - e.clientY;
    applyRegisterGesture(diffX, diffY);

    setTouchStartX(null);
    setTouchStartY(null);
  }, [applyRegisterGesture, touchStartX, touchStartY]);

  const handlePointerCancel = React.useCallback(() => {
    setTouchStartX(null);
    setTouchStartY(null);
  }, []);

  const handleSelectModelColor = React.useCallback((model: PhoneModel, colorName: string) => {
    setSelectedModel(model);
    setSelectedColorName(colorName);
  }, []);

  if (!selectedModel || !selectedVariant) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0f12] px-6 pb-[140px] text-white">
        <div className="w-full max-w-[320px] rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mx-auto mb-4 h-14 w-14 rounded-[1.1rem] border border-emerald-300/30 bg-emerald-300/10 shadow-[0_0_24px_rgba(45,212,191,0.18)]" />
          <h1 className="text-lg font-black uppercase tracking-wide">Preparando catalogo</h1>
          <p className="mt-2 text-sm font-semibold leading-snug text-white/65">
            {catalogLoadError ?? 'Estamos validando los modelos oficiales guardados en este telefono.'}
          </p>
          <button
            type="button"
            onClick={repairCatalogState}
            className="mt-5 h-12 w-full rounded-2xl bg-emerald-400 text-sm font-black uppercase tracking-widest text-black shadow-[0_12px_30px_rgba(45,212,191,0.25)] active:scale-[0.98]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const activeAccentColor = getRegisterWallpaperAccentColor(selectedModel, selectedVariant);
  const currentVariantInventory = selectedVariant.stock || 0;
  const canRegisterSale = currentVariantInventory > 0;
  const accentHex = getRegisterHexColor(activeAccentColor);

  const handleOpenConfirmSale = (event?: React.SyntheticEvent) => {
    event?.stopPropagation();
    event?.preventDefault();
    if (canRegisterSale) {
      setShowConfirmSheet(true);
      return;
    }
    toast(`Agotado: No hay stock de ${selectedModel.name} - ${selectedVariant.colorName}`, 'error');
  };

  return (
    <div 
      className="flex flex-col h-full justify-between px-0 pt-0 pb-0 overflow-hidden relative select-none w-full"
    >
      {createPortal(
        <div className="fixed inset-0 z-0 bg-[#0d0f12] overflow-hidden pointer-events-none">
          <AnimatePresence initial={false}>
            {activeWallpaper && (
              <motion.img
                key={activeWallpaper}
                src={activeWallpaper}
                alt={selectedVariant.colorName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full object-cover object-center vivo-photo"
              />
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}

      <div
        ref={gestureLayerRef}
        className="absolute inset-0 z-[8] touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-hidden="true"
      />

      {/* Side thumbnail panels — vertical columns at screen edges */}
      <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+8.25rem)] bottom-[calc(var(--dock-height)+var(--dock-bottom-gap)+env(safe-area-inset-bottom)+12px)] z-10 pointer-events-none flex items-center justify-between px-1 sm:px-1.5">
        <RegisterThumbnailSidePanels
          models={models}
          selectedModelId={selectedModel.id}
          selectedColorName={selectedVariant.colorName}
          getSelectableEntriesForModel={getRegisterSelectableEntriesForModel}
          getHexColor={getRegisterHexColor}
          onSelect={handleSelectModelColor}
        />
      </div>

      {/* Selection summary — aligned with side device panels */}
      <div className="relative z-20 w-full px-4 pt-2 pointer-events-none">
        <div className="relative z-10 w-full pointer-events-auto">
          <motion.button
            type="button"
            layout
            whileTap={canRegisterSale ? { scale: 0.985 } : {}}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleOpenConfirmSale}
            aria-label={
              canRegisterSale
                ? `Registrar venta de ${formatRegisterModelDisplayName(selectedModel)} ${selectedVariant.colorName}`
                : `Sin stock de ${formatRegisterModelDisplayName(selectedModel)} ${selectedVariant.colorName}`
            }
            style={{
              touchAction: 'manipulation',
              boxShadow: canRegisterSale
                ? `inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 34px rgba(0,0,0,0.36), 0 0 0 1px ${accentHex}44`
                : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.28)',
            }}
            className={`register-selection-card relative flex w-full min-h-[64px] items-stretch overflow-hidden rounded-[1.2rem] border text-left transition-all duration-300 outline-none focus:outline-none ${
              canRegisterSale
                ? 'cursor-pointer border-white/16 bg-black/34 hover:bg-black/40 active:bg-black/44'
                : 'cursor-not-allowed border-red-400/25 bg-red-950/28 opacity-90'
            } backdrop-blur-2xl`}
          >
            <motion.div
              animate={{ backgroundColor: canRegisterSale ? accentHex : '#f87171' }}
              transition={{ duration: 0.3 }}
              className="w-[4px] shrink-0"
              aria-hidden="true"
            />

            <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={selectedModel.id}
                    initial={{ opacity: 0, y: swipeDirection === 'up' ? -12 : (swipeDirection === 'down' ? 12 : 0) }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: swipeDirection === 'up' ? 12 : (swipeDirection === 'down' ? -12 : 0) }}
                    transition={{ duration: 0.2 }}
                    className="truncate text-[1.2rem] sm:text-[1.32rem] font-black tracking-tight text-white uppercase leading-none"
                  >
                    {formatRegisterModelDisplayName(selectedModel)}
                  </motion.h2>
                </AnimatePresence>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedVariant.id}
                      initial={{
                        opacity: 0,
                        x: swipeDirection === 'left' ? 14 : (swipeDirection === 'right' ? -14 : 0),
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: swipeDirection === 'left' ? -14 : (swipeDirection === 'right' ? 14 : 0),
                      }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-white/90 backdrop-blur-md"
                    >
                      {selectedVariant.colorName}
                    </motion.span>
                  </AnimatePresence>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.12em] text-white/78">
                    <span className="text-white/45">Stock</span>
                    <span className="text-white">{currentVariantInventory}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-center justify-center gap-1 pr-0.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-[0.95rem] border backdrop-blur-md ${
                    canRegisterSale
                      ? 'border-white/20 bg-white/12 text-white'
                      : 'border-red-300/25 bg-red-500/20 text-red-100'
                  }`}
                  style={canRegisterSale ? { boxShadow: `0 0 18px ${accentHex}44` } : undefined}
                  aria-hidden="true"
                >
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[0.48rem] font-black uppercase tracking-[0.16em] text-white/58">
                  {canRegisterSale ? 'Vender' : 'Agotado'}
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmSheet && (
          <ConfirmSaleSheet 
            model={selectedModel}
            selectedVariant={selectedVariant}
            allModels={models}
            onConfirm={handleConfirmSale}
            onCancel={() => setShowConfirmSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
