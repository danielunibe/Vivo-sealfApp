import React from 'react';
import { Edit2, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { RegisterHomePreviewPanel } from './RegisterHomePreviewStage';
import VariantImageGallery from './VariantImageGallery';

type RegisterHomeEditPanelSheetProps = {
  activePanel: Exclude<RegisterHomePreviewPanel, null>;
  selectedModel: PhoneModel;
  selectedVariant: PhoneVariant;
  displayModelName: string;
  onClose: () => void;
  onUpdateModel: (updater: (model: PhoneModel) => PhoneModel) => void;
  onUpdateVariant: (updater: (variant: PhoneVariant) => PhoneVariant) => void;
  onEditModel: (model: PhoneModel) => void;
  onEditVariant: (variant: PhoneVariant) => void;
  onToggleModel: () => void;
  onToggleVariant: () => void;
  onDeleteModel: () => void;
  onDeleteVariant: () => void;
  onNotify: (msg: string) => void;
  zIndexClass?: string;
};

export function RegisterHomeEditPanelSheet({
  activePanel,
  selectedModel,
  selectedVariant,
  displayModelName,
  onClose,
  onUpdateModel,
  onUpdateVariant,
  onEditModel,
  onEditVariant,
  onToggleModel,
  onToggleVariant,
  onDeleteModel,
  onDeleteVariant,
  onNotify,
  zIndexClass = 'z-[70]',
}: RegisterHomeEditPanelSheetProps) {
  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-end bg-black/42 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-sm`} role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[86dvh] w-full max-w-[28rem] overflow-y-auto rounded-[1.65rem] bg-white dark:bg-[var(--neo-surface)] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[0.58rem] font-black uppercase tracking-widest text-emerald-500">Editar Inicio</div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              {activePanel === 'name' && 'Textos visibles en Inicio'}
              {activePanel === 'stock' && 'Existencias'}
              {activePanel === 'image' && 'Imagen de fondo'}
              {activePanel === 'modelActions' && 'Acciones del producto'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {activePanel === 'name' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5">
              <p className="text-[0.58rem] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Vista previa en Inicio</p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">{displayModelName}</p>
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{selectedVariant.colorName}</p>
            </div>
            <label className="block text-[0.62rem] font-black uppercase tracking-widest text-slate-500">Nombre completo</label>
            <input
              value={selectedModel.name}
              onChange={(event) => onUpdateModel((model) => ({ ...model, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-400"
            />
            <label className="block text-[0.62rem] font-black uppercase tracking-widest text-slate-500">Nombre corto (titulo en Inicio)</label>
            <input
              value={selectedModel.shortName}
              onChange={(event) => onUpdateModel((model) => ({ ...model, shortName: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-400"
            />
            <p className="text-[0.58rem] font-semibold text-slate-500">
              Se mostrara como: <span className="font-black text-slate-800">{displayModelName}</span>
            </p>
            <label className="block text-[0.62rem] font-black uppercase tracking-widest text-slate-500">Color visible</label>
            <input
              value={selectedVariant.colorName}
              onChange={(event) => onUpdateVariant((variant) => ({ ...variant, colorName: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-400"
            />
            <button type="button" onClick={() => onEditModel(selectedModel)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white">
              <Edit2 size={14} /> Editar avanzado
            </button>
          </div>
        )}

        {activePanel === 'stock' && (
          <div className="space-y-3">
            <label className="block text-[0.62rem] font-black uppercase tracking-widest text-slate-500">
              Stock de {selectedVariant.colorName}
            </label>
            <input
              type="number"
              min={0}
              value={selectedVariant.stock}
              onChange={(event) => onUpdateVariant((variant) => ({ ...variant, stock: Math.max(0, Number(event.target.value)) }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-lg font-black outline-none focus:border-emerald-400"
            />
            <button type="button" onClick={() => onEditVariant(selectedVariant)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white">
              <Edit2 size={14} /> Editar variante completa
            </button>
          </div>
        )}

        {activePanel === 'image' && (
          <VariantImageGallery
            model={selectedModel}
            variant={selectedVariant}
            onChange={(variant) => onUpdateVariant(() => variant)}
            onNotify={onNotify}
          />
        )}

        {activePanel === 'modelActions' && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onToggleModel} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-[0.62rem] font-black uppercase tracking-widest text-slate-700">
              {selectedModel.isActive ? <EyeOff size={14} /> : <Eye size={14} />} {selectedModel.isActive ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" onClick={onToggleVariant} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-[0.62rem] font-black uppercase tracking-widest text-slate-700">
              {selectedVariant.isActive ? <EyeOff size={14} /> : <Eye size={14} />} Variante
            </button>
            <button type="button" onClick={onDeleteModel} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-[0.62rem] font-black uppercase tracking-widest text-red-500">
              <Trash2 size={14} /> Modelo
            </button>
            <button type="button" onClick={onDeleteVariant} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-[0.62rem] font-black uppercase tracking-widest text-red-500">
              <Trash2 size={14} /> Variante
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
