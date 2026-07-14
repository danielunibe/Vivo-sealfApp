import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpDown, Save, X } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { normalizeTextKey } from '../../lib/officialDeviceCovers';
import { emitImmersiveWebMode } from '../../lib/events';
import {
  formatRegisterModelDisplayName,
  getRegisterModelHeroImage,
  getRegisterSelectableEntriesForModel,
} from '../../lib/registerHomeProjection';
import { reorderModelsByIds, reorderVariantsByIds, sortBySortOrder } from '../../lib/modelOrdering';
import { VariantMediaImage } from '../../components/ui/VariantMediaImage';
import { SortableVerticalList } from '../../components/ui/SortableVerticalList';
import { RegisterHomePreviewStage, RegisterHomePreviewPanel } from './RegisterHomePreviewStage';
import { RegisterHomeEditPanelSheet } from './RegisterHomeEditPanelSheet';

type RegisterHomeFullscreenOverlayProps = {
  orderedModels: PhoneModel[];
  selectedModel: PhoneModel;
  selectedVariant: PhoneVariant;
  activeWallpaper: string;
  displayModelName: string;
  isDirty: boolean;
  activePanel: RegisterHomePreviewPanel;
  activeEntries: ReturnType<typeof getRegisterSelectableEntriesForModel>;
  onClose: () => void;
  onSave: () => void;
  onSelect: (model: PhoneModel, colorName: string) => void;
  onOpenPanel: (panel: Exclude<RegisterHomePreviewPanel, null>) => void;
  onClosePanel: () => void;
  onDraftChange: (models: PhoneModel[]) => void;
  onUpdateModel: (updater: (model: PhoneModel) => PhoneModel) => void;
  onUpdateVariant: (updater: (variant: PhoneVariant) => PhoneVariant) => void;
  onEditModel: (model: PhoneModel) => void;
  onEditVariant: (variant: PhoneVariant) => void;
  onToggleModel: () => void;
  onToggleVariant: () => void;
  onDeleteModel: () => void;
  onDeleteVariant: () => void;
  onNotify: (msg: string) => void;
};

export function RegisterHomeFullscreenOverlay({
  orderedModels,
  selectedModel,
  selectedVariant,
  activeWallpaper,
  displayModelName,
  isDirty,
  activePanel,
  activeEntries,
  onClose,
  onSave,
  onSelect,
  onOpenPanel,
  onClosePanel,
  onDraftChange,
  onUpdateModel,
  onUpdateVariant,
  onEditModel,
  onEditVariant,
  onToggleModel,
  onToggleVariant,
  onDeleteModel,
  onDeleteVariant,
  onNotify,
}: RegisterHomeFullscreenOverlayProps) {
  const [showOrderDrawer, setShowOrderDrawer] = React.useState(false);
  const orderedVariants = sortBySortOrder<PhoneVariant>(selectedModel.variants);

  React.useEffect(() => {
    emitImmersiveWebMode(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      emitImmersiveWebMode(false);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] overflow-hidden bg-[#0d0f12]">
      <RegisterHomePreviewStage
        layout="fullscreen"
        orderedModels={orderedModels}
        selectedModel={selectedModel}
        selectedVariant={selectedVariant}
        activeWallpaper={activeWallpaper}
        onSelect={onSelect}
        onOpenPanel={onOpenPanel}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/12 bg-black/72 px-4 text-[0.68rem] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-xl active:scale-[0.98]"
        >
          <X size={16} strokeWidth={2.5} /> Salir
        </button>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOrderDrawer((open) => !open)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl active:scale-[0.98] ${
              showOrderDrawer
                ? 'border-emerald-300/70 bg-emerald-400/25 text-emerald-100'
                : 'border-white/12 bg-black/72 text-white/88'
            }`}
            title="Ordenar modelos y colores"
            aria-label="Ordenar modelos y colores"
          >
            <ArrowUpDown size={17} />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!isDirty}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-[0.68rem] font-black uppercase tracking-widest text-white shadow-lg active:scale-[0.98] disabled:bg-black/55 disabled:text-white/35"
          >
            <Save size={16} strokeWidth={2.5} /> Guardar
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.25rem)] z-30 flex justify-center px-4">
          <span className="rounded-full border border-amber-300/45 bg-black/55 px-3 py-1 text-[0.54rem] font-black uppercase tracking-[0.16em] text-amber-100 backdrop-blur-md">
            Cambios sin guardar
          </span>
        </div>
      )}

      {showOrderDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-[230] max-h-[58dvh] overflow-y-auto rounded-t-[1.75rem] border border-white/10 bg-white dark:bg-[var(--neo-surface)] p-4 shadow-[0_-18px_50px_rgba(0,0,0,0.35)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[0.58rem] font-black uppercase tracking-widest text-slate-400">Orden en Inicio</p>
              <p className="text-sm font-black text-slate-900">Arrastra para reordenar</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOrderDrawer(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            >
              <X size={15} />
            </button>
          </div>

          <SortableVerticalList<PhoneModel>
            items={orderedModels}
            getItemId={(model) => model.id}
            onReorder={(nextModels) => onDraftChange(reorderModelsByIds(orderedModels, nextModels.map((model) => model.id)))}
            className="space-y-2"
            itemClassName="items-center"
            ariaLabel="Orden de modelos en pantalla completa"
            renderItem={(model) => {
              const previewEntry = getRegisterSelectableEntriesForModel(model)[0];
              const isSelected = model.id === selectedModel.id;

              return (
                <button
                  type="button"
                  onClick={() => previewEntry && onSelect(model, previewEntry.colorName)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left ${
                    isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="h-12 w-10 overflow-hidden rounded-lg bg-white shadow-sm">
                    {previewEntry && (
                      <VariantMediaImage
                        variant={previewEntry.variant}
                        fallbackSrc={previewEntry.imagePath}
                        alt={model.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.78rem] font-black text-slate-800">{formatRegisterModelDisplayName(model)}</div>
                    <div className="truncate text-[0.58rem] font-bold uppercase tracking-wider text-slate-500">{model.name}</div>
                  </div>
                </button>
              );
            }}
          />

          <p className="mb-2 mt-4 text-[0.58rem] font-black uppercase tracking-widest text-slate-400">
            Colores de {displayModelName}
          </p>

          <SortableVerticalList<PhoneVariant>
            items={orderedVariants}
            getItemId={(variant) => variant.id}
            onReorder={(nextVariants) => {
              onDraftChange(reorderVariantsByIds(orderedModels, selectedModel.id, nextVariants.map((variant) => variant.id)));
            }}
            className="space-y-2"
            itemClassName="items-center"
            ariaLabel={`Orden de colores de ${displayModelName}`}
            renderItem={(variant) => {
              const entry = activeEntries.find((item) => normalizeTextKey(item.colorName) === normalizeTextKey(variant.colorName));
              const isSelected = normalizeTextKey(variant.colorName) === normalizeTextKey(selectedVariant.colorName);

              return (
                <button
                  type="button"
                  onClick={() => onSelect(selectedModel, variant.colorName)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left ${
                    isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="h-12 w-10 overflow-hidden rounded-lg bg-white shadow-sm">
                    <VariantMediaImage
                      variant={variant}
                      fallbackSrc={entry?.imagePath || getRegisterModelHeroImage(selectedModel, variant)}
                      alt={variant.colorName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.76rem] font-black text-slate-800">{variant.colorName}</div>
                    <div className="text-[0.56rem] font-bold uppercase tracking-wider text-slate-500">Stock {variant.stock}</div>
                  </div>
                  <span className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: variant.colorHex }} />
                </button>
              );
            }}
          />
        </div>
      )}

      {activePanel && (
        <RegisterHomeEditPanelSheet
          activePanel={activePanel}
          selectedModel={selectedModel}
          selectedVariant={selectedVariant}
          displayModelName={displayModelName}
          onClose={onClosePanel}
          onUpdateModel={onUpdateModel}
          onUpdateVariant={onUpdateVariant}
          onEditModel={onEditModel}
          onEditVariant={onEditVariant}
          onToggleModel={onToggleModel}
          onToggleVariant={onToggleVariant}
          onDeleteModel={onDeleteModel}
          onDeleteVariant={onDeleteVariant}
          onNotify={onNotify}
          zIndexClass="z-[240]"
        />
      )}
    </div>,
    document.body,
  );
}
