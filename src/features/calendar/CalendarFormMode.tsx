import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Smartphone, Palette, Check, Save } from 'lucide-react';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';

import { PhoneModel } from '../../types';
import {
  getModelVariantColors,
  getVariantCommission,
  resolveManualSaleVariant,
} from '../../lib/saleCatalog';

interface CalendarFormModeProps {
  models: PhoneModel[];
  editingSaleId: string | null;
  selectedDate: string;
  selectedDeviceIndex: number;
  selectedColor: string;
  minDate?: string;
  maxDate?: string;
  getHexForColorName: (colorName: string) => string;
  editingCommissionPerUnit?: number | null;
  onCancel: () => void;
  onDateChange: (date: string) => void;
  onDeviceChange: (index: number, color: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: () => void;
}

export function CalendarFormMode({
  models,
  editingSaleId,
  selectedDate,
  selectedDeviceIndex,
  selectedColor,
  minDate,
  maxDate,
  getHexForColorName,
  editingCommissionPerUnit,
  onCancel,
  onDateChange,
  onDeviceChange,
  onColorChange,
  onSubmit,
}: CalendarFormModeProps) {
  const selectedModel = models[selectedDeviceIndex];
  const selectedVariant = resolveManualSaleVariant(selectedModel, selectedColor);
  const selectedCommission = editingSaleId && editingCommissionPerUnit != null
    ? editingCommissionPerUnit
    : getVariantCommission(selectedVariant);
  const variantColors = selectedModel ? getModelVariantColors(selectedModel) : [];

  return (
    <motion.div
      key="form-view"
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[410px] flex flex-col z-20 h-full shrink-0 justify-start pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+140px)] pt-1 overflow-y-auto no-scrollbar relative"
    >
      <div className="bg-white/85 dark:bg-[var(--neo-surface)]/92 backdrop-blur-[20px] rounded-3xl p-5 border border-white/50 dark:border-white/10 shadow-xl flex flex-col gap-4 text-left">
        {/* Form Input: Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <Calendar size={12} className="text-violet-500 scale-90" />
            <span>Fecha de Venta</span>
          </label>
          <div className="relative">
            <input 
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full bg-gray-50/75 dark:bg-[var(--neo-surface-soft)] border border-gray-200/70 dark:border-white/10 rounded-2xl px-3.5 py-3 text-xs font-bold text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Form Input: Device Selection List */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <Smartphone size={12} className="text-violet-500 scale-90" />
            <span>Modelo de Dispositivo</span>
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-[145px] overflow-y-auto no-scrollbar bg-gray-50/50 p-2 rounded-2xl border border-gray-150">
            {models.map((model, idx) => {
              const isSelected = selectedDeviceIndex === idx;
              const firstColor = getModelVariantColors(model)[0] || '';
              const previewCommission = getVariantCommission(
                resolveManualSaleVariant(model, firstColor),
              );
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onDeviceChange(idx, firstColor)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-violet-500/10 border-violet-400 text-violet-950 shadow-sm font-black' 
                      : 'bg-white/80 border-gray-100 hover:border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-9 flex items-center justify-center transition-all ${isSelected ? 'scale-110 drop-shadow-md' : 'opacity-70 grayscale-[0.5]'}`}>
                      <VivoPhoneIcon width="100%" height="100%" deviceId={model.id} colorName={firstColor} />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold leading-none">{model.name}</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-semibold">{model.pitch}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black opacity-80 shrink-0">
                    +${previewCommission}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Input: Color selection circles based on selected device */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
            <Palette size={12} className="text-violet-500 scale-90" />
            <span>Color de Variante</span>
          </label>
          <div className="flex flex-wrap gap-2 bg-gray-50/55 p-2.5 rounded-2xl border border-gray-150">
            {variantColors.map((color) => {
              const isSelected = selectedColor === color;
              const variant = resolveManualSaleVariant(selectedModel, color);
              const swatchColor = variant?.colorHex || getHexForColorName(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onColorChange(color)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-violet-500 text-violet-700 shadow-sm' 
                      : 'bg-white/60 border-gray-200 hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: swatchColor }} />
                  <span>{color}</span>
                  {isSelected && <Check size={10} strokeWidth={3} className="text-violet-600 ml-0.5 scale-90" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commission Summary */}
        <div className="flex items-center justify-center p-3.5 bg-gradient-to-r from-violet-500/[0.07] to-indigo-500/[0.07] border border-violet-500/10 rounded-2xl mt-1 shrink-0 text-center">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Comisión Directa</p>
            <p className="text-lg font-black text-violet-700 tracking-tight mt-1 font-sans">
              +${selectedCommission}
            </p>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={onSubmit}
          className="w-full py-3.5 mt-2 rounded-2xl text-white font-black uppercase text-xs tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 active:scale-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save size={14} strokeWidth={2.5} />
          <span>{editingSaleId ? 'Confirmar Ajuste' : 'Registrar Venta'}</span>
        </button>
      </div>
    </motion.div>
  );
}
