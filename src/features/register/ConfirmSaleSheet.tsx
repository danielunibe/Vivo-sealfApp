import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { getActiveOrderedVariants } from '../../lib/modelOrdering';

interface ConfirmSaleSheetProps {
  model: PhoneModel;
  selectedVariant: PhoneVariant;
  allModels: PhoneModel[];
  onConfirm: (payload: { model: PhoneModel; variant: PhoneVariant; quantity: number; totalCommission: number; commissionPerUnit: number; isCustomCommission: boolean; baseCommissionSnapshot: number }) => void;
  onCancel: () => void;
}

const getHexColor = (colorHex?: string) => {
  return colorHex || '#1ecca2';
};

export const ConfirmSaleSheet: React.FC<ConfirmSaleSheetProps> = ({ model, selectedVariant, allModels, onConfirm, onCancel }) => {
  const [localModel, setLocalModel] = useState<PhoneModel>(model);
  const [localVariant, setLocalVariant] = useState<PhoneVariant>(selectedVariant);
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<'device' | 'color' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isCustomCommission, setIsCustomCommission] = useState(false);
  
  const baseCommission = localVariant.commission || 0;
  
  const [customCommission, setCustomCommission] = useState(baseCommission);
  
  useEffect(() => {
    setCustomCommission(baseCommission);
  }, [baseCommission]);
  
  const commissionPerUnit = isCustomCommission ? customCommission : baseCommission;
  const totalCommission = commissionPerUnit * quantity;

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm({ 
      model: localModel, 
      variant: localVariant, 
      quantity, 
      totalCommission,
      commissionPerUnit,
      isCustomCommission,
      baseCommissionSnapshot: baseCommission
    });
  };

  const activeVariants = getActiveOrderedVariants(localModel);
  const accentColorHex = getHexColor(localVariant.colorHex);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md rounded-3xl"
        onClick={onCancel}
      />
      
      <motion.div 
        initial={{ y: '-100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '-100%' }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        style={{
          borderBottom: `1px solid ${accentColorHex}33`,
          boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.9), 0 0 40px -10px ${accentColorHex}15`
        }}
        className="absolute top-0 left-0 w-full z-50 bg-[#0d0f12] rounded-b-[2.5rem] p-6 pt-8 cursor-default flex flex-col max-h-[90vh]"
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5 shrink-0" />
        
        <div className="flex flex-col items-center mb-6 shrink-0">
          <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Confirmar Registro</h3>
          <div className="h-0.5 w-10 mt-1.5 rounded-full" style={{ backgroundColor: accentColorHex }} />
        </div>
        
        <div className="flex flex-col gap-3.5 mb-6 overflow-y-auto custom-scrollbar pr-1 shrink">
          
          {/* DEVICE SELECTION */}
          <div className="flex flex-col bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden transition-colors hover:border-white/10 shadow-sm">
            <button 
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'device' ? null : 'device')}
              className="p-4.5 w-full flex justify-between items-center outline-none cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-[34px] h-[50px] bg-[#18181b] rounded-lg flex items-center justify-center flex-shrink-0 p-1 border shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-colors"
                  style={{ borderColor: `${accentColorHex}25` }}
                >
                  <VivoPhoneIcon width="100%" height="100%" deviceId={localModel.id} colorName={localVariant.colorName} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[0.62rem] font-bold text-white/40 uppercase tracking-widest mb-1">Modelo de Equipo</span>
                  <span className="text-base font-black text-white font-display tracking-wide">{localModel.name}</span>
                </div>
              </div>
              <ChevronDown size={18} className={`text-white/40 transition-transform duration-300 ${expandedSection === 'device' ? 'rotate-180 text-white' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'device' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 flex flex-wrap gap-2">
                    {allModels.map(m => {
                      const isSelected = localModel.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setLocalModel(m);
                            const variants = getActiveOrderedVariants(m);
                            if (variants.length > 0) {
                              setLocalVariant(variants[0]);
                            }
                            setExpandedSection(null);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'text-black shadow-lg font-black' 
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                          style={isSelected ? { backgroundColor: accentColorHex, boxShadow: `0 4px 14px ${accentColorHex}45` } : undefined}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* COLOR SELECTION */}
          <div className="flex flex-col bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden transition-colors hover:border-white/10 shadow-sm">
            <button 
              type="button"
              onClick={() => setExpandedSection(expandedSection === 'color' ? null : 'color')}
              className="p-4.5 w-full flex justify-between items-center outline-none cursor-pointer"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-[0.62rem] font-bold text-white/40 uppercase tracking-widest mb-1">Variante Seleccionada</span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_currentColor]"
                    style={{ backgroundColor: accentColorHex, color: accentColorHex }}
                  />
                  <span 
                    className="text-base font-black uppercase tracking-wide font-display"
                    style={{ color: accentColorHex }}
                  >
                    {localVariant.colorName}
                  </span>
                  <span className="text-[0.65rem] font-bold text-white/45 normal-case ml-1.5">(Stock: {localVariant.stock})</span>
                </div>
              </div>
              <ChevronDown size={18} className={`text-white/40 transition-transform duration-300 ${expandedSection === 'color' ? 'rotate-180 text-white' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'color' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4 flex flex-col gap-2">
                    {activeVariants.map(variant => {
                      const isSelected = localVariant.id === variant.id;
                      const varHex = getHexColor(variant.colorHex);
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setLocalVariant(variant);
                            setExpandedSection(null);
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-white/[0.04]' 
                              : 'border-transparent hover:bg-white/[0.02]'
                          }`}
                          style={isSelected ? { borderColor: `${varHex}55` } : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${isSelected ? 'scale-110 shadow-[0_0_10px_currentColor]' : ''}`}
                              style={{ backgroundColor: varHex, color: varHex, outline: isSelected ? `2px solid ${varHex}` : 'none', outlineOffset: '2.5px' }}
                            />
                            <span className={`text-xs font-black uppercase transition-colors tracking-wide ${isSelected ? 'text-white' : 'text-white/70'}`}>
                              {variant.colorName}
                            </span>
                            <span className="text-[0.62rem] font-bold text-white/40 font-mono">Stock: {variant.stock}</span>
                          </div>
                          {isSelected && <Check size={16} style={{ color: varHex }} />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* QUANTITY & COMMISSION */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/[0.04] rounded-2xl border border-white/5 p-4 flex flex-col justify-center items-center shadow-inner">
                <span className="text-[0.68rem] font-black text-white/40 uppercase tracking-widest mb-2">Cantidad</span>
                <div className="flex items-center gap-3.5 bg-black/50 rounded-xl p-1 border border-white/5">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-black text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-sans font-black text-lg w-5 text-center text-white">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(localVariant.stock || 0, quantity + 1))}
                    disabled={quantity >= (localVariant.stock || 0)}
                    className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-black text-base disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-4 flex flex-col justify-center items-center relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full pointer-events-none" />
                 <span className="text-[0.68rem] font-black text-emerald-400 uppercase tracking-widest mb-2 relative z-10">Comisión Total</span>
                 <span className="text-3xl font-display font-black text-emerald-300 relative z-10">${totalCommission}</span>
              </div>
            </div>
            
            {/* Optional message if they try to select more than available */}
            {quantity >= (localVariant.stock || 0) && (
              <span className="text-xs text-orange-400 font-medium text-center bg-orange-500/10 py-1.5 rounded-md border border-orange-500/20">
                Límite de stock: {(localVariant.stock || 0)} disponibles
              </span>
            )}
            
            <div className="mt-2 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden transition-colors hover:border-white/10 flex flex-col shadow-sm">
              <button 
                type="button"
                onClick={() => setIsCustomCommission(!isCustomCommission)}
                className="w-full text-left px-4.5 py-3.5 flex items-center justify-between outline-none cursor-pointer"
              >
                <span className="text-[0.65rem] font-black text-white/50 uppercase tracking-widest">Editar comisión de esta venta</span>
                <div className={`w-8.5 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${isCustomCommission ? '' : 'bg-white/20'}`} style={isCustomCommission ? { backgroundColor: accentColorHex } : undefined}>
                  <motion.div 
                    initial={false}
                    animate={{ x: isCustomCommission ? 14 : 0 }}
                    className="w-3.5 h-3.5 bg-white rounded-full shadow-md"
                  />
                </div>
              </button>
              
              <AnimatePresence>
                {isCustomCommission && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4.5 pb-4.5 border-t border-white/5 pt-4">
                      <label className="text-[0.62rem] font-black text-white/40 uppercase tracking-widest mb-1.5 block">Comisión Unitaria ($)</label>
                      <input 
                        type="number"
                        min="0"
                        step="1"
                        value={customCommission}
                        onChange={(e) => setCustomCommission(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-white font-black font-sans text-base outline-none focus:border-white/25 transition-colors"
                      />
                      <p className="text-[0.58rem] text-white/35 mt-2 font-semibold leading-relaxed">Esta comisión aplicará solo para este registro. El catálogo mantendrá la comisión base de ${baseCommission}.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
        
        <div className="flex gap-3.5 shrink-0 mt-auto pt-4 border-t border-white/5">
          <button 
            type="button"
            onClick={onCancel} 
            disabled={isSubmitting}
            className="flex-1 min-h-12 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/80 font-black uppercase tracking-widest text-[0.68rem] transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleConfirm} 
            disabled={isSubmitting || quantity <= 0 || quantity > (localVariant.stock || 0)}
            className="flex-1 min-h-12 rounded-xl text-black font-black uppercase tracking-widest text-[0.68rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98]"
            style={{ 
              backgroundColor: accentColorHex,
              boxShadow: `0 4px 20px ${accentColorHex}35`
            }}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </motion.div>
    </>
  );
};
