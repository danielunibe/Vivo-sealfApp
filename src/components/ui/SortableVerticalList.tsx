import React from 'react';
import { GripVertical } from 'lucide-react';
import { motion } from 'motion/react';

type SortableVerticalListProps<T> = {
  items: T[];
  getItemId: (item: T) => string;
  onReorder: (nextItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

const getDropIndex = (clientY: number, itemElements: Array<{ id: string; element: HTMLDivElement }>) => {
  if (itemElements.length === 0) return 0;

  for (let index = 0; index < itemElements.length; index += 1) {
    const rect = itemElements[index].element.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) {
      return index;
    }
  }

  return itemElements.length - 1;
};

export function SortableVerticalList<T>({
  items,
  getItemId,
  onReorder,
  renderItem,
  className = '',
  itemClassName = '',
  disabled = false,
  ariaLabel = 'Lista ordenable',
}: SortableVerticalListProps<T>) {
  const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const finishDrag = React.useCallback((targetIndex: number | null) => {
    if (!draggingId || targetIndex === null) {
      setDraggingId(null);
      setOverIndex(null);
      return;
    }

    const fromIndex = items.findIndex((item) => getItemId(item) === draggingId);
    if (fromIndex < 0 || fromIndex === targetIndex) {
      setDraggingId(null);
      setOverIndex(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);

    setDraggingId(null);
    setOverIndex(null);
  }, [draggingId, getItemId, items, onReorder]);

  React.useEffect(() => {
    if (!draggingId) return;

    const handlePointerMove = (event: PointerEvent) => {
      const itemElements = items
        .map((item) => {
          const id = getItemId(item);
          const element = itemRefs.current.get(id);
          return element ? { id, element } : null;
        })
        .filter(Boolean) as Array<{ id: string; element: HTMLDivElement }>;

      setOverIndex(getDropIndex(event.clientY, itemElements));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const itemElements = items
        .map((item) => {
          const id = getItemId(item);
          const element = itemRefs.current.get(id);
          return element ? { id, element } : null;
        })
        .filter(Boolean) as Array<{ id: string; element: HTMLDivElement }>;

      finishDrag(getDropIndex(event.clientY, itemElements));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingId, finishDrag, getItemId, items]);

  return (
    <div className={className} role="list" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const itemId = getItemId(item);
        const isDragging = draggingId === itemId;
        const showDropMarker = overIndex === index && draggingId && draggingId !== itemId;

        return (
          <div key={itemId} className="relative">
            {showDropMarker && (
              <div className="absolute inset-x-0 -top-1 z-20 h-0.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
            )}
            <motion.div
              ref={(node) => {
                if (node) itemRefs.current.set(itemId, node);
                else itemRefs.current.delete(itemId);
              }}
              role="listitem"
              layout
              className={`relative flex items-stretch gap-2 ${itemClassName} ${
                isDragging ? 'z-30 opacity-80' : ''
              }`}
              animate={isDragging ? { scale: 1.015, boxShadow: '0 14px 28px rgba(15,23,42,0.16)' } : { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <button
                type="button"
                disabled={disabled}
                aria-label="Arrastrar para reordenar"
                className={`mt-0.5 flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-colors touch-none ${
                  disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
                } ${isDragging ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : ''}`}
                onPointerDown={(event) => {
                  if (disabled) return;
                  event.preventDefault();
                  event.stopPropagation();
                  setDraggingId(itemId);
                  setOverIndex(index);
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <GripVertical size={16} strokeWidth={2.4} />
              </button>
              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
