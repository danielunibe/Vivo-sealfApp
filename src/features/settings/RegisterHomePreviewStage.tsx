import React from 'react';
import { Plus } from 'lucide-react';
import { PhoneModel, PhoneVariant } from '../../types';
import {
  formatRegisterModelDisplayName,
  getRegisterHexColor,
  getRegisterSelectableEntriesForModel,
  getRegisterWallpaperAccentColor,
} from '../../lib/registerHomeProjection';
import { RegisterThumbnailSidePanels } from '../register/RegisterThumbnailSidePanels';
import { RegisterHomeMockDock } from './RegisterHomeMockDock';

export type RegisterHomePreviewPanel = 'name' | 'stock' | 'image' | 'modelActions' | null;

type RegisterHomePreviewStageProps = {
  layout: 'embedded' | 'fullscreen';
  orderedModels: PhoneModel[];
  selectedModel: PhoneModel;
  selectedVariant: PhoneVariant;
  activeWallpaper: string;
  onSelect: (model: PhoneModel, colorName: string) => void;
  onOpenPanel: (panel: Exclude<RegisterHomePreviewPanel, null>) => void;
};

export function RegisterHomePreviewStage({
  layout,
  orderedModels,
  selectedModel,
  selectedVariant,
  activeWallpaper,
  onSelect,
  onOpenPanel,
}: RegisterHomePreviewStageProps) {
  const accentHex = getRegisterHexColor(getRegisterWallpaperAccentColor(selectedModel, selectedVariant));
  const selectedVariantStock = selectedVariant.stock ?? 0;
  const canRegisterSale = selectedVariantStock > 0;
  const displayModelName = formatRegisterModelDisplayName(selectedModel);
  const isFullscreen = layout === 'fullscreen';

  const sidePanelClass = isFullscreen
    ? 'absolute inset-x-0 top-[calc(env(safe-area-inset-top)+8.25rem)] bottom-[calc(var(--dock-height)+var(--dock-bottom-gap)+env(safe-area-inset-bottom)+12px)] z-20 flex items-center justify-between px-1 sm:px-1.5 pointer-events-none'
    : 'absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] bottom-[5.7rem] z-20 flex items-center justify-between px-1 pointer-events-none';

  const selectionCard = (
    <div
      className="register-selection-card relative flex w-full min-h-[64px] items-stretch overflow-hidden rounded-[1.2rem] border border-white/16 bg-black/34 backdrop-blur-2xl"
      style={{
        boxShadow: canRegisterSale
          ? `inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 34px rgba(0,0,0,0.36), 0 0 0 1px ${accentHex}44`
          : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 28px rgba(0,0,0,0.28)',
      }}
    >
      <div
        className="w-[4px] shrink-0"
        style={{ backgroundColor: canRegisterSale ? accentHex : '#f87171' }}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={() => onOpenPanel('name')}
          className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-dashed border-white/28 bg-black/10 px-2 py-1.5 text-left"
        >
          <h4 className={`truncate font-black uppercase leading-none tracking-tight text-white ${isFullscreen ? 'text-[1.2rem] sm:text-[1.32rem]' : 'text-[1.2rem]'}`}>
            {displayModelName}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
              {selectedVariant.colorName}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenPanel('stock');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-2 py-0.5 text-[0.54rem] font-black uppercase tracking-[0.12em] text-white/78"
            >
              <span className="text-white/45">Stock</span>
              <span className="text-white">{selectedVariantStock}</span>
            </button>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenPanel('stock')}
          className="flex shrink-0 flex-col items-center justify-center gap-1 pr-0.5"
          aria-label="Editar stock"
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-[0.95rem] border backdrop-blur-md ${
              canRegisterSale
                ? 'border-white/20 bg-white/12 text-white'
                : 'border-red-300/25 bg-red-500/20 text-red-100'
            }`}
            style={canRegisterSale ? { boxShadow: `0 0 18px ${accentHex}44` } : undefined}
          >
            <Plus size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[0.48rem] font-black uppercase tracking-[0.16em] text-white/58">
            {canRegisterSale ? 'Vender' : 'Agotado'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#0d0f12] text-white ${isFullscreen ? 'min-h-0' : ''}`}>
      {activeWallpaper && (
        <img
          src={activeWallpaper}
          alt={selectedVariant.colorName}
          className="absolute inset-0 h-full w-full object-cover object-center vivo-photo"
        />
      )}

      <button
        type="button"
        onClick={() => onOpenPanel('image')}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label="Editar imagen de fondo"
      />


      {!isFullscreen && (
        <div className="absolute inset-x-0 top-4 z-30 flex justify-center px-3">
          <div className="rounded-full border border-emerald-300/60 bg-black/40 px-3 py-1 text-[0.55rem] font-black uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-md">
            Modo edicion · igual que Inicio
          </div>
        </div>
      )}

      <div className={sidePanelClass}>
        <RegisterThumbnailSidePanels
          models={orderedModels}
          selectedModelId={selectedModel.id}
          selectedColorName={selectedVariant.colorName}
          getSelectableEntriesForModel={getRegisterSelectableEntriesForModel}
          getHexColor={getRegisterHexColor}
          onSelect={onSelect}
        />
      </div>

      {isFullscreen ? (
        <div className="relative z-20 w-full px-4 pt-2">
          <div className="relative z-10 w-full">{selectionCard}</div>
        </div>
      ) : (
        <div className="absolute left-4 right-4 top-[4.25rem] z-30">{selectionCard}</div>
      )}

      {isFullscreen && <RegisterHomeMockDock />}
    </div>
  );
}
