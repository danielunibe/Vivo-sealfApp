import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Check, AlertCircle, ChevronRight, Package } from 'lucide-react';
import { LiquidGlassSurface } from '../../components/ui/LiquidGlass';
import { PhoneModel, PhoneVariant, SaleRecord } from '../../types';
import { saveSaleWithInventory } from '../../lib/storage';
import { getOfficialCoverForColor } from '../../lib/officialDeviceCovers';
import { getNowForSaleRecording } from '../../lib/saleTimestamps';
import { isValidQuantity } from '../../lib/quantityValidation';

interface PurchaseBoxProps {
  models: PhoneModel[];
}

type PurchaseStatus = 'idle' | 'selecting' | 'confirming' | 'success' | 'error';

interface PurchaseFlowState {
  selectedModelId: string | null;
  selectedVariantId: string | null;
  quantity: number;
  status: PurchaseStatus;
  errorMessage?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function PurchaseBox({ models }: PurchaseBoxProps) {
  const [state, setState] = useState<PurchaseFlowState>({
    selectedModelId: null,
    selectedVariantId: null,
    quantity: 1,
    status: 'idle',
    errorMessage: undefined,
  });

  // Get selected model and variant
  const selectedModel = useMemo(() => 
    models.find(m => m.id === state.selectedModelId),
    [models, state.selectedModelId]
  );

  const activeVariants = useMemo(() => 
    selectedModel?.variants.filter(v => v.isActive) || [],
    [selectedModel]
  );

  const selectedVariant = useMemo(() =>
    activeVariants.find(v => v.id === state.selectedVariantId),
    [activeVariants, state.selectedVariantId]
  );

  // Validation
  const hasNoActiveVariants = selectedModel && activeVariants.length === 0;
  const isOutOfStock = selectedVariant && selectedVariant.stock === 0;
  const isQuantityValid = selectedVariant 
    ? isValidQuantity(state.quantity, selectedVariant.stock)
    : false;

  const canConfirm = selectedModel && 
                     selectedVariant && 
                     !hasNoActiveVariants && 
                     !isOutOfStock && 
                     isQuantityValid;

  // Handlers
  const handleSelectModel = (modelId: string) => {
    setState(prev => ({
      ...prev,
      selectedModelId: modelId,
      selectedVariantId: null,
      quantity: 1,
      status: 'selecting',
      errorMessage: undefined,
    }));
  };

  const handleSelectVariant = (variantId: string) => {
    const variant = activeVariants.find(v => v.id === variantId);
    setState(prev => ({
      ...prev,
      selectedVariantId: variantId,
      quantity: Math.min(1, variant?.stock || 0),
      errorMessage: undefined,
    }));
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setState(prev => ({ ...prev, quantity: 1 }));
      return;
    }
    setState(prev => ({ ...prev, quantity: num, errorMessage: undefined }));
  };

  const handleConfirmPurchase = async () => {
    if (!canConfirm || !selectedModel || !selectedVariant) return;

    setState(prev => ({ ...prev, status: 'confirming' }));

    try {
      // Get official cover for the variant
      const officialCover = getOfficialCoverForColor(selectedModel.id, selectedVariant.colorName);
      const deviceImageSnapshot = officialCover?.path || selectedVariant.imagePath || '';

      const recordedAt = getNowForSaleRecording();

      // Construct SaleRecord
      const sale: SaleRecord = {
        id: crypto.randomUUID(),
        date: recordedAt.date,
        deviceId: selectedModel.id,
        deviceNameSnapshot: selectedModel.name,
        deviceColorSnapshot: selectedVariant.colorName,
        deviceImageSnapshot,
        quantity: state.quantity,
        commissionPerUnit: selectedVariant.commission,
        amountEarned: selectedVariant.commission * state.quantity,
        createdAt: recordedAt.createdAt,
        recordedTime: recordedAt.recordedTime,
        recordedAtIso: recordedAt.recordedAtIso,
        modelId: selectedModel.id,
        variantId: selectedVariant.id,
      };

      // Save using existing storage function (does NOT modify it)
      saveSaleWithInventory(sale);

      // Success!
      setState(prev => ({
        ...prev,
        status: 'success',
        errorMessage: undefined,
      }));

      // Reset after showing success
      setTimeout(() => {
        setState({
          selectedModelId: null,
          selectedVariantId: null,
          quantity: 1,
          status: 'idle',
          errorMessage: undefined,
        });
      }, 3000);
    } catch (error) {
      // Error: abort without decrementing stock, preserve state
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Error al procesar la compra',
      }));
    }
  };

  const handleReset = () => {
    setState({
      selectedModelId: null,
      selectedVariantId: null,
      quantity: 1,
      status: 'idle',
      errorMessage: undefined,
    });
  };

  // Render success state
  if (state.status === 'success') {
    return (
      <motion.div variants={itemVariants} className="col-span-2">
        <LiquidGlassSurface className="relative flex flex-col items-center justify-center p-6 gap-4 min-h-[12rem] border border-emerald-500/30 bg-emerald-500/5">
          <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/30">
            <Check size={32} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="font-extrabold text-sm tracking-tight text-white mb-1">
              ¡Compra confirmada!
            </h3>
            <p className="text-xs text-white/70">
              {selectedModel?.name} • {selectedVariant?.colorName} • {state.quantity} {state.quantity === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>
        </LiquidGlassSurface>
      </motion.div>
    );
  }

  // Render error state
  if (state.status === 'error') {
    return (
      <motion.div variants={itemVariants} className="col-span-2">
        <LiquidGlassSurface className="relative flex flex-col items-center justify-center p-6 gap-4 min-h-[12rem] border border-red-500/30 bg-red-500/5">
          <div className="p-3 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <div className="text-center">
            <h3 className="font-extrabold text-sm tracking-tight text-white mb-1">
              Error en la compra
            </h3>
            <p className="text-xs text-white/70 mb-3">
              {state.errorMessage || 'No se pudo completar la compra'}
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </LiquidGlassSurface>
      </motion.div>
    );
  }

  // Render main purchase interface
  return (
    <motion.div variants={itemVariants} className="col-span-2">
      <LiquidGlassSurface className="relative flex flex-col p-4 gap-4 border border-dashed border-[var(--neo-accent)]/30 bg-[var(--neo-accent)]/[0.02] min-h-[16rem]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--neo-accent)]/10 backdrop-blur-md rounded-lg border border-[var(--neo-accent)]/20">
              <ShoppingCart size={16} className="text-[var(--neo-accent)]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">
                Compra Directa
              </h3>
              <p className="text-[0.5rem] uppercase tracking-[0.18em] text-white/50 font-bold">
                Catálogo de equipos
              </p>
            </div>
          </div>
          {state.status !== 'idle' && (
            <button
              onClick={handleReset}
              className="text-[0.5rem] uppercase tracking-[0.16em] text-white/50 hover:text-white/80 font-bold transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>

        {/* Step 1: Select Model */}
        {!state.selectedModelId && (
          <div className="flex flex-col gap-2">
            <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[var(--neo-accent)]/90">
              Paso 1: Selecciona un modelo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-[var(--neo-accent)]/30 transition-all text-left"
                >
                  <p className="text-xs font-bold text-white truncate">{model.name}</p>
                  <p className="text-[0.5rem] text-white/50 uppercase tracking-wider">
                    {model.variants.filter(v => v.isActive).length} {model.variants.filter(v => v.isActive).length === 1 ? 'color' : 'colores'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Variant */}
        {state.selectedModelId && !state.selectedVariantId && (
          <div className="flex flex-col gap-2">
            <p className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[var(--neo-accent)]/90">
              Paso 2: Selecciona un color
            </p>
            <div className="text-xs text-white/70 mb-1">
              {selectedModel?.name}
            </div>
            
            {hasNoActiveVariants ? (
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30 text-center">
                <p className="text-xs text-orange-400 font-bold">
                  No hay variantes disponibles para este modelo
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeVariants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant.id)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-[var(--neo-accent)]/30 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/20" 
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{variant.colorName}</p>
                        <p className="text-[0.5rem] text-white/50 uppercase tracking-wider">
                          Stock: {variant.stock}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/30" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 & 4: Show Details and Quantity Input */}
        {state.selectedVariantId && selectedVariant && (
          <div className="flex flex-col gap-3">
            {/* Variant details */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white/20 shrink-0" 
                  style={{ backgroundColor: selectedVariant.colorHex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedModel?.name}</p>
                  <p className="text-[0.52rem] text-white/70">{selectedVariant.colorName}</p>
                </div>
              </div>
              
              {/* Stock badge */}
              <div className="flex items-center gap-2 mt-2">
                <Package size={12} className="text-white/50" />
                <span className="text-[0.5rem] font-bold uppercase tracking-wider">
                  Stock disponible: 
                  <span className={`ml-1 ${selectedVariant.stock === 0 ? 'text-red-400' : selectedVariant.stock <= 2 ? 'text-orange-400' : 'text-white/80'}`}>
                    {selectedVariant.stock}
                  </span>
                </span>
              </div>
            </div>

            {/* Out of stock message */}
            {isOutOfStock && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                  Agotado
                </p>
              </div>
            )}

            {/* Quantity input */}
            {!isOutOfStock && (
              <div className="flex flex-col gap-2">
                <label className="text-[0.52rem] font-black uppercase tracking-[0.2em] text-[var(--neo-accent)]/90">
                  Paso 3: Cantidad
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedVariant.stock}
                    value={state.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--neo-accent)]/50 focus:border-[var(--neo-accent)]/30"
                  />
                  <div className="text-[0.5rem] text-white/50 uppercase tracking-wider font-bold">
                    Máx: {selectedVariant.stock}
                  </div>
                </div>
                
                {/* Validation message */}
                {!isQuantityValid && (
                  <p className="text-[0.5rem] text-orange-400 font-bold">
                    La cantidad debe ser entre 1 y {selectedVariant.stock}
                  </p>
                )}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirmPurchase}
              disabled={!canConfirm || state.status === 'confirming'}
              className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                canConfirm && state.status !== 'confirming'
                  ? 'bg-[var(--neo-accent)] text-black hover:bg-[var(--neo-accent)]/90 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              {state.status === 'confirming' ? 'Procesando...' : 'Confirmar compra'}
            </button>
          </div>
        )}
      </LiquidGlassSurface>
    </motion.div>
  );
}
