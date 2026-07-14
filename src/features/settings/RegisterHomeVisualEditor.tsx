import React from 'react';
import { Image as ImageIcon, ListTree, Maximize2, Plus, Save, X } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import { normalizeTextKey } from '../../lib/officialDeviceCovers';
import { normalizePhoneModelsOrder, reorderModelsByIds, reorderVariantsByIds, sortBySortOrder } from '../../lib/modelOrdering';
import {
  formatRegisterModelDisplayName,
  getRegisterDefaultColorNameForModel,
  getRegisterModelHeroImage,
  getRegisterSelectableEntriesForModel,
  resolveRegisterSelectedColorForModel,
  resolveRegisterSelectedVariant,
} from '../../lib/registerHomeProjection';
import { useVariantImageSrc } from '../../lib/variantImages';
import { VariantMediaImage } from '../../components/ui/VariantMediaImage';
import { SortableVerticalList } from '../../components/ui/SortableVerticalList';
import { RegisterHomePreviewStage, RegisterHomePreviewPanel } from './RegisterHomePreviewStage';
import { RegisterHomeEditPanelSheet } from './RegisterHomeEditPanelSheet';
import { RegisterHomeFullscreenOverlay } from './RegisterHomeFullscreenOverlay';

type RegisterHomeVisualEditorProps = {
  models: PhoneModel[];
  isDirty: boolean;
  salesCountMap: Record<string, number>;
  variantSalesCountMap: Record<string, number>;
  onDraftChange: (models: PhoneModel[]) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddModel: () => void;
  onEditModel: (model: PhoneModel) => void;
  onAddVariant: (modelId: string) => void;
  onEditVariant: (variant: PhoneVariant) => void;
  onOpenAdvanced: () => void;
  onNotify: (msg: string) => void;
};

type ActivePanel = RegisterHomePreviewPanel;

const cloneModels = (models: PhoneModel[]) => normalizePhoneModelsOrder(models);

const getVariantSalesCount = (
  model: PhoneModel,
  variant: PhoneVariant,
  variantSalesCountMap: Record<string, number>,
) => {
  const fallbackKey = `${model.id}::${variant.colorName}`;
  return variantSalesCountMap[variant.id] || variantSalesCountMap[fallbackKey] || 0;
};

export default function RegisterHomeVisualEditor({
  models,
  isDirty,
  salesCountMap,
  variantSalesCountMap,
  onDraftChange,
  onSave,
  onCancel,
  onAddModel,
  onEditModel,
  onAddVariant,
  onEditVariant,
  onOpenAdvanced,
  onNotify,
}: RegisterHomeVisualEditorProps) {
  const orderedModels = React.useMemo(() => cloneModels(models), [models]);
  const [selectedModelId, setSelectedModelId] = React.useState<string | null>(orderedModels[0]?.id ?? null);
  const [selectedColorName, setSelectedColorName] = React.useState<string | null>(orderedModels[0] ? getRegisterDefaultColorNameForModel(orderedModels[0]) : null);
  const [activePanel, setActivePanel] = React.useState<ActivePanel>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const selectedModel = orderedModels.find((model) => model.id === selectedModelId) ?? orderedModels[0] ?? null;
  const selectedVariant = React.useMemo(
    () => (selectedModel ? resolveRegisterSelectedVariant(selectedModel, selectedColorName) : null),
    [selectedModel, selectedColorName],
  );
  const fallbackWallpaper = selectedModel && selectedVariant ? getRegisterModelHeroImage(selectedModel, selectedVariant) : '';
  const activeWallpaper = useVariantImageSrc(selectedVariant, fallbackWallpaper);
  const displayModelName = selectedModel ? formatRegisterModelDisplayName(selectedModel) : 'Vivo';

  React.useEffect(() => {
    if (!selectedModel && orderedModels[0]) {
      setSelectedModelId(orderedModels[0].id);
      setSelectedColorName(getRegisterDefaultColorNameForModel(orderedModels[0]));
      return;
    }

    if (selectedModel) {
      const resolvedColor = resolveRegisterSelectedColorForModel(selectedModel, selectedColorName);
      if (resolvedColor !== selectedColorName) {
        setSelectedColorName(resolvedColor);
      }
    }
  }, [orderedModels, selectedModel, selectedColorName]);

  const updateModel = (modelId: string, updater: (model: PhoneModel) => PhoneModel) => {
    onDraftChange(orderedModels.map((model) => model.id === modelId ? updater(model) : model));
  };

  const updateVariant = (modelId: string, variantId: string, updater: (variant: PhoneVariant) => PhoneVariant) => {
    onDraftChange(orderedModels.map((model) => {
      if (model.id !== modelId) return model;
      return {
        ...model,
        variants: model.variants.map((variant) => variant.id === variantId ? updater(variant) : variant),
      };
    }));
  };

  const handleSelect = (model: PhoneModel, colorName: string) => {
    setSelectedModelId(model.id);
    setSelectedColorName(colorName);
    setActivePanel(null);
  };

  const handleToggleModel = () => {
    if (!selectedModel) return;
    updateModel(selectedModel.id, (model) => ({ ...model, isActive: !model.isActive }));
  };

  const handleToggleVariant = () => {
    if (!selectedModel || !selectedVariant) return;
    updateVariant(selectedModel.id, selectedVariant.id, (variant) => ({ ...variant, isActive: !variant.isActive }));
  };

  const handleDeleteModel = () => {
    if (!selectedModel) return;
    const hasSales = (salesCountMap[selectedModel.id] || 0) > 0;
    if (hasSales) {
      updateModel(selectedModel.id, (model) => ({ ...model, isActive: false }));
      onNotify('Modelo con ventas: se desactivo en el borrador');
      return;
    }

    const nextModels = orderedModels.filter((model) => model.id !== selectedModel.id);
    onDraftChange(nextModels);
    const nextModel = nextModels[0] ?? null;
    setSelectedModelId(nextModel?.id ?? null);
    setSelectedColorName(nextModel ? getRegisterDefaultColorNameForModel(nextModel) : null);
    onNotify('Modelo eliminado del borrador');
  };

  const handleDeleteVariant = () => {
    if (!selectedModel || !selectedVariant) return;
    if (selectedModel.variants.length <= 1) {
      onNotify('El modelo debe conservar al menos una variante');
      return;
    }

    const hasSales = getVariantSalesCount(selectedModel, selectedVariant, variantSalesCountMap) > 0;
    if (hasSales) {
      updateVariant(selectedModel.id, selectedVariant.id, (variant) => ({ ...variant, isActive: false }));
      onNotify('Variante con ventas: se desactivo en el borrador');
      return;
    }

    const nextModels = orderedModels.map((model) => {
      if (model.id !== selectedModel.id) return model;
      return { ...model, variants: model.variants.filter((variant) => variant.id !== selectedVariant.id) };
    });
    onDraftChange(nextModels);
    const nextModel = nextModels.find((model) => model.id === selectedModel.id);
    setSelectedColorName(nextModel ? getRegisterDefaultColorNameForModel(nextModel) : null);
    onNotify('Variante eliminada del borrador');
  };

  const handleSave = () => {
    onSave();
  };

  if (!selectedModel || !selectedVariant) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white dark:bg-[var(--neo-surface)] p-5 text-center">
        <p className="text-sm font-black text-slate-700">No hay modelos disponibles para editar Inicio.</p>
        <button
          type="button"
          onClick={onAddModel}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-black uppercase tracking-widest text-white"
        >
          <Plus size={14} /> Agregar modelo
        </button>
      </div>
    );
  }

  const activeEntries = getRegisterSelectableEntriesForModel(selectedModel);
  const orderedVariants = sortBySortOrder<PhoneVariant>(selectedModel.variants);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[1.35rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--neo-surface)] p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-3 text-[0.62rem] font-black uppercase tracking-widest text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-500"
          >
            <Save size={14} /> Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={!isDirty}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] px-3 text-[0.62rem] font-black uppercase tracking-widest text-slate-600 disabled:opacity-45"
          >
            <X size={14} /> Cancelar
          </button>
        </div>
        <div className="mt-2 grid grid-cols-[1fr_1fr] gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 text-[0.62rem] font-black uppercase tracking-widest text-emerald-700"
          >
            <Maximize2 size={15} /> Editar en pantalla completa
          </button>
          <button
            type="button"
            onClick={onAddModel}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-[0.58rem] font-black uppercase tracking-widest text-slate-600"
          >
            <Plus size={13} /> Modelo
          </button>
          <button
            type="button"
            onClick={onOpenAdvanced}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-[0.58rem] font-black uppercase tracking-widest text-slate-600"
          >
            <ListTree size={13} /> Avanzado
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-dashed border-emerald-300 bg-[#0d0f12] p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
        <div className="relative mx-auto h-[35rem] max-h-[calc(100dvh-11rem)] min-h-[31rem] w-full max-w-[25rem] overflow-hidden rounded-[1.55rem]">
          <RegisterHomePreviewStage
            layout="embedded"
            orderedModels={orderedModels}
            selectedModel={selectedModel}
            selectedVariant={selectedVariant}
            activeWallpaper={activeWallpaper}
            onSelect={handleSelect}
            onOpenPanel={setActivePanel}
          />
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--neo-surface)] p-3 shadow-sm">
        <div className="mb-2 text-[0.62rem] font-black uppercase tracking-widest text-slate-400">Orden en Inicio</div>
        <p className="mb-3 text-[0.58rem] font-semibold leading-relaxed text-slate-500">
          Arrastra con el icono lateral para reordenar modelos y colores. El orden se refleja en los paneles de Inicio.
        </p>

        <SortableVerticalList<PhoneModel>
          items={orderedModels}
          getItemId={(model) => model.id}
          onReorder={(nextModels) => onDraftChange(reorderModelsByIds(orderedModels, nextModels.map((model) => model.id)))}
          className="space-y-2"
          itemClassName="items-center"
          ariaLabel="Orden de modelos en Inicio"
          renderItem={(model) => {
            const previewEntry = getRegisterSelectableEntriesForModel(model)[0];
            const isSelected = model.id === selectedModel.id;

            return (
              <button
                type="button"
                onClick={() => previewEntry && handleSelect(model, previewEntry.colorName)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                  isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] hover:bg-white dark:bg-[var(--neo-surface)]'
                }`}
              >
                <div className="h-12 w-10 overflow-hidden rounded-lg bg-white dark:bg-[var(--neo-surface)] shadow-sm">
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
                  <div className="truncate text-[0.78rem] font-black text-slate-800 dark:text-slate-100">{formatRegisterModelDisplayName(model)}</div>
                  <div className="truncate text-[0.58rem] font-bold uppercase tracking-wider text-slate-500">{model.name}</div>
                </div>
              </button>
            );
          }}
        />

        <div className="mt-4 mb-2 text-[0.58rem] font-black uppercase tracking-widest text-slate-400">
          Colores de {displayModelName}
        </div>

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
                onClick={() => handleSelect(selectedModel, variant.colorName)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                  isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)] hover:bg-white dark:bg-[var(--neo-surface)]'
                }`}
              >
                <div className="h-12 w-10 overflow-hidden rounded-lg bg-white dark:bg-[var(--neo-surface)] shadow-sm">
                  <VariantMediaImage
                    variant={variant}
                    fallbackSrc={entry?.imagePath || getRegisterModelHeroImage(selectedModel, variant)}
                    alt={variant.colorName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.76rem] font-black text-slate-800 dark:text-slate-100">{variant.colorName}</div>
                  <div className="text-[0.56rem] font-bold uppercase tracking-wider text-slate-500">Stock {variant.stock}</div>
                </div>
                <span className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: variant.colorHex }} />
              </button>
            );
          }}
        />

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setActivePanel('modelActions')} className="min-h-10 rounded-xl bg-slate-900 text-[0.56rem] font-black uppercase tracking-widest text-white">
            Acciones
          </button>
          <button type="button" onClick={() => onAddVariant(selectedModel.id)} className="min-h-10 rounded-xl border border-slate-200 dark:border-white/10 text-[0.56rem] font-black uppercase tracking-widest text-slate-600">
            Variante
          </button>
          <button type="button" onClick={() => setActivePanel('image')} className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 text-[0.56rem] font-black uppercase tracking-widest text-slate-600">
            <ImageIcon size={13} /> Imagen
          </button>
        </div>
      </div>

      {activePanel && !isFullscreen && (
        <RegisterHomeEditPanelSheet
          activePanel={activePanel}
          selectedModel={selectedModel}
          selectedVariant={selectedVariant}
          displayModelName={displayModelName}
          onClose={() => setActivePanel(null)}
          onUpdateModel={(updater) => updateModel(selectedModel.id, updater)}
          onUpdateVariant={(updater) => updateVariant(selectedModel.id, selectedVariant.id, updater)}
          onEditModel={onEditModel}
          onEditVariant={onEditVariant}
          onToggleModel={handleToggleModel}
          onToggleVariant={handleToggleVariant}
          onDeleteModel={handleDeleteModel}
          onDeleteVariant={handleDeleteVariant}
          onNotify={onNotify}
        />
      )}

      {isFullscreen && (
        <RegisterHomeFullscreenOverlay
          orderedModels={orderedModels}
          selectedModel={selectedModel}
          selectedVariant={selectedVariant}
          activeWallpaper={activeWallpaper}
          displayModelName={displayModelName}
          isDirty={isDirty}
          activePanel={activePanel}
          activeEntries={activeEntries}
          onClose={() => setIsFullscreen(false)}
          onSave={() => {
            handleSave();
            setIsFullscreen(false);
          }}
          onSelect={handleSelect}
          onOpenPanel={setActivePanel}
          onClosePanel={() => setActivePanel(null)}
          onDraftChange={onDraftChange}
          onUpdateModel={(updater) => updateModel(selectedModel.id, updater)}
          onUpdateVariant={(updater) => updateVariant(selectedModel.id, selectedVariant.id, updater)}
          onEditModel={onEditModel}
          onEditVariant={onEditVariant}
          onToggleModel={handleToggleModel}
          onToggleVariant={handleToggleVariant}
          onDeleteModel={handleDeleteModel}
          onDeleteVariant={handleDeleteVariant}
          onNotify={onNotify}
        />
      )}

      {activeEntries.length > 0 && (
        <div className="rounded-[1.35rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--neo-surface)] p-3 shadow-sm">
          <div className="mb-2 text-[0.62rem] font-black uppercase tracking-widest text-slate-400">Variantes de este modelo</div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {activeEntries.map((entry) => (
              <button
                type="button"
                key={entry.key}
                onClick={() => handleSelect(selectedModel, entry.colorName)}
                className={`min-w-[5.25rem] rounded-2xl border p-2 text-left ${normalizeTextKey(entry.colorName) === normalizeTextKey(selectedVariant.colorName) ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[var(--neo-surface-soft)]'}`}
              >
                <div className="h-16 overflow-hidden rounded-xl bg-white dark:bg-[var(--neo-surface)]">
                  <VariantMediaImage variant={entry.variant} fallbackSrc={entry.imagePath} alt={entry.colorName} className="h-full w-full object-cover" />
                </div>
                <div className="mt-1 truncate text-[0.56rem] font-black uppercase tracking-widest text-slate-600">{entry.colorName}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
