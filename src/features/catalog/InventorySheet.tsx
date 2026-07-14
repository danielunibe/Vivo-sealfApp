import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, X, Save } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { getPhoneModels, updatePhoneVariantStock } from '../../lib/storage';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { InventoryMovementList } from './InventoryMovementList';
import { getActiveOrderedVariants } from '../../lib/modelOrdering';
import { onInventoryUpdated } from '../../lib/events';

interface InventorySheetProps {
  onClose: () => void;
  models: PhoneModel[];
}

type EditableVariant = {
  modelId: string;
  modelName: string;
  variant: PhoneVariant;
};

const STOCK_REASONS = [
  'Reabastecimiento',
  'Correcci?n de conteo',
  'Devoluci?n',
  'Error de captura',
  'Otro',
];

export function InventorySheet({ onClose, models }: InventorySheetProps) {
  void onClose;
  const [currentModels, setCurrentModels] = useState<PhoneModel[]>(models);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVariant, setEditingVariant] = useState<EditableVariant | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>(STOCK_REASONS[0]);

  useEffect(() => {
    setCurrentModels(models);
  }, [models]);

  useEffect(() => {
    const unsubscribe = onInventoryUpdated(() => {
      setCurrentModels(getPhoneModels().filter((model) => model.isActive));
    });
    return unsubscribe;
  }, []);

  const inventoryRows = useMemo(
    () =>
      currentModels.flatMap((model) =>
        getActiveOrderedVariants(model).map((variant) => ({
          modelId: model.id,
          modelName: model.name,
          variant,
        })),
      ),
    [currentModels],
  );

  const filteredRows = inventoryRows.filter(({ modelName, variant }) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      modelName.toLowerCase().includes(term) ||
      variant.colorName.toLowerCase().includes(term)
    );
  });

  const updateQuantityQuick = (row: EditableVariant, delta: number) => {
    const current = row.variant.stock || 0;
    updatePhoneVariantStock(
      row.modelId,
      row.variant.id,
      Math.max(0, current + delta),
      delta > 0 ? 'Reabastecimiento r?pido' : 'Correcci?n r?pida',
      delta > 0 ? 'restock' : 'correction',
    );
  };

  const openEdit = (row: EditableVariant) => {
    setEditingVariant(row);
    setEditStock(row.variant.stock || 0);
    setEditReason(STOCK_REASONS[0]);
  };

  const handleSaveEdit = () => {
    if (!editingVariant) return;

    const previousStock = editingVariant.variant.stock || 0;
    const type = editStock > previousStock ? 'restock' : 'correction';
    updatePhoneVariantStock(editingVariant.modelId, editingVariant.variant.id, editStock, editReason, type);
    setEditingVariant(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="vivo-panel rounded-[1.4rem] p-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar modelo o color"
          className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-semibold text-[#343A43] outline-none focus:border-emerald-300"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredRows.map((row) => {
          const stock = row.variant.stock || 0;
          return (
            <div key={row.variant.id} className="vivo-panel rounded-[1.25rem] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 p-1 border border-gray-200/50">
                  <VivoPhoneIcon width="100%" height="100%" deviceId={row.modelId} colorName={row.variant.colorName} />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[0.76rem] font-black text-[#343A43] uppercase tracking-widest truncate">{row.modelName}</span>
                  <span className="text-[0.58rem] font-bold text-[#343A43]/55 uppercase mt-0.5 truncate">{row.variant.colorName}</span>
                  <span className="text-[0.55rem] font-bold text-[#343A43]/40 uppercase mt-0.5 tracking-[0.18em]">
                    Min {row.variant.minStock} ��� Com ${row.variant.commission}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mr-1 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantityQuick(row, -1)}
                  disabled={stock <= 0}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#343A43] hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={14} strokeWidth={3} />
                </motion.button>

                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="min-w-8 text-center text-base font-black text-[#343A43] hover:text-emerald-600 transition-colors"
                >
                  {stock}
                </button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantityQuick(row, 1)}
                  className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </motion.button>
              </div>
            </div>
          );
        })}

        {filteredRows.length === 0 && (
          <div className="text-center p-8 opacity-40 font-bold uppercase text-xs mt-4 text-[#343A43]">
            Ninguna variante coincide
          </div>
        )}

        <InventoryMovementList />
      </div>

      <AnimatePresence>
        {editingVariant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[var(--neo-surface)] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-[#343A43] uppercase tracking-tight">Ajustar Inventario</h3>
                <button onClick={() => setEditingVariant(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Modelo</span>
                <span className="text-base font-bold text-[#343A43]">{editingVariant.modelName}</span>
                <span className="block text-sm font-semibold text-[#343A43]/70 mt-1">{editingVariant.variant.colorName}</span>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cantidad Exacta</label>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-2 border border-gray-100">
                  <button onClick={() => setEditStock(Math.max(0, editStock - 1))} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xl">-</button>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="flex-1 text-center bg-transparent text-2xl font-black text-[#343A43] outline-none"
                  />
                  <button onClick={() => setEditStock(editStock + 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-xl">+</button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Motivo</label>
                <select
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#343A43] outline-none focus:border-emerald-400"
                >
                  {STOCK_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full bg-[#343A43] text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={16} /> Guardar Ajuste
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
