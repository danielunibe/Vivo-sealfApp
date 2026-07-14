import React from 'react';
import { motion } from 'motion/react';
import { PhoneModel, PhoneVariant } from '../../types';
import { VariantMediaImage } from '../../components/ui/VariantMediaImage';
import { normalizeTextKey } from '../../lib/officialDeviceCovers';
import { formatRegisterModelDisplayName } from '../../lib/registerHomeProjection';

type SelectableEntry = {
  key: string;
  colorName: string;
  accentColor: string;
  imagePath: string;
  variant: PhoneVariant | null;
};

export type ThumbnailPanelCell = SelectableEntry & {
  model: PhoneModel;
};

type RegisterThumbnailSidePanelsProps = {
  models: PhoneModel[];
  selectedModelId: string;
  selectedColorName: string;
  getSelectableEntriesForModel: (model: PhoneModel) => SelectableEntry[];
  getHexColor: (colorHex?: string) => string;
  onSelect: (model: PhoneModel, colorName: string) => void;
};

function buildPanelColumn(
  modelList: PhoneModel[],
  getSelectableEntriesForModel: (model: PhoneModel) => SelectableEntry[],
  colorSlot: 0 | 1,
): ThumbnailPanelCell[] {
  return modelList.flatMap((model) => {
    const entries = getSelectableEntriesForModel(model);
    if (entries.length === 0) return [];

    const entryIndex = Math.min(colorSlot, entries.length - 1);
    const entry = entries[entryIndex];

    return [{ ...entry, model }];
  });
}

function getCellSizeClass(count: number) {
  if (count <= 4) return 'h-[2.5rem] w-[2.5rem] sm:h-[2.62rem] sm:w-[2.62rem]';
  if (count === 5) return 'h-[2.28rem] w-[2.28rem] sm:h-[2.4rem] sm:w-[2.4rem]';
  return 'h-[2.05rem] w-[2.05rem] sm:h-[2.18rem] sm:w-[2.18rem]';
}

const PANEL_SHELL_CLASS =
  'register-side-panel pointer-events-auto shrink-0 max-h-full rounded-[1.05rem] border border-white/14 bg-black/30 px-[3px] py-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_36px_rgba(0,0,0,0.38)] backdrop-blur-2xl flex flex-col justify-center gap-[2px]';

function SidePanel({
  side,
  cells,
  selectedModelId,
  selectedColorName,
  getHexColor,
  onSelect,
}: {
  side: 'left' | 'right';
  cells: ThumbnailPanelCell[];
  selectedModelId: string;
  selectedColorName: string;
  getHexColor: (colorHex?: string) => string;
  onSelect: (model: PhoneModel, colorName: string) => void;
}) {
  if (cells.length === 0) return null;

  const cellSizeClass = getCellSizeClass(cells.length);

  return (
    <div
      className={`${PANEL_SHELL_CLASS} ${
        side === 'left' ? 'rounded-r-[0.72rem] pr-[2px]' : 'rounded-l-[0.72rem] pl-[2px]'
      }`}
    >
      {cells.map((cell) => {
        const isActive =
          cell.model.id === selectedModelId
          && normalizeTextKey(cell.colorName) === normalizeTextKey(selectedColorName);
        const accent = getHexColor(cell.accentColor);

        return (
          <button
            type="button"
            key={`${side}-${cell.model.id}-${cell.key}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(cell.model, cell.colorName);
            }}
            className={`relative overflow-visible transition-all duration-300 pointer-events-auto shrink-0 ${cellSizeClass} ${
              isActive
                ? 'z-20 scale-[1.05] opacity-100'
                : 'opacity-70 hover:opacity-92'
            }`}
            aria-label={`${formatRegisterModelDisplayName(cell.model)} ${cell.colorName}`}
            aria-pressed={isActive}
          >
            <div
              className={`relative h-full w-full overflow-hidden ${
                side === 'left' ? 'rounded-l-[0.68rem] rounded-r-[0.42rem]' : 'rounded-r-[0.68rem] rounded-l-[0.42rem]'
              }`}
            >
              <VariantMediaImage
                variant={cell.variant}
                fallbackSrc={cell.imagePath}
                loading="lazy"
                decoding="async"
                alt={`${cell.model.name} ${cell.colorName}`}
                className="h-full w-full object-cover object-center"
                photoClassName="vivo-photo-cover"
              />
            </div>

            {isActive && (
              <>
                <motion.div
                  layoutId={`registerActiveThumb-${side}`}
                  className={`absolute -inset-[2px] z-20 pointer-events-none ${
                    side === 'left' ? 'rounded-l-[0.74rem] rounded-r-[0.48rem]' : 'rounded-r-[0.74rem] rounded-l-[0.48rem]'
                  }`}
                  style={{
                    border: `2px solid ${accent}`,
                    boxShadow: `0 0 16px ${accent}66, inset 0 0 10px ${accent}33`,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
                <span
                  className={`absolute top-1/2 z-30 h-5 w-[3px] -translate-y-1/2 rounded-full pointer-events-none ${
                    side === 'left' ? '-right-[5px]' : '-left-[5px]'
                  }`}
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                  aria-hidden="true"
                />
                <span className="absolute bottom-[2px] left-1/2 z-30 max-w-[95%] -translate-x-1/2 truncate rounded-full border border-white/20 bg-black/55 px-1.5 py-[1px] text-[5.5px] font-black uppercase tracking-[0.1em] text-white/92 backdrop-blur-md pointer-events-none">
                  {formatRegisterModelDisplayName(cell.model)}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function RegisterThumbnailSidePanels({
  models,
  selectedModelId,
  selectedColorName,
  getSelectableEntriesForModel,
  getHexColor,
  onSelect,
}: RegisterThumbnailSidePanelsProps) {
  const leftCells = React.useMemo(
    () => buildPanelColumn(models, getSelectableEntriesForModel, 0),
    [models, getSelectableEntriesForModel],
  );
  const rightCells = React.useMemo(
    () => buildPanelColumn(models, getSelectableEntriesForModel, 1),
    [models, getSelectableEntriesForModel],
  );

  return (
    <>
      <SidePanel
        side="left"
        cells={leftCells}
        selectedModelId={selectedModelId}
        selectedColorName={selectedColorName}
        getHexColor={getHexColor}
        onSelect={onSelect}
      />
      <SidePanel
        side="right"
        cells={rightCells}
        selectedModelId={selectedModelId}
        selectedColorName={selectedColorName}
        getHexColor={getHexColor}
        onSelect={onSelect}
      />
    </>
  );
}
