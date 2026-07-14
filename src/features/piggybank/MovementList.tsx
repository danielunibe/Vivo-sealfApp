import React, { useEffect, useMemo, useState } from 'react';
import {
  Pencil,
  Trash2,
  MoreVertical,
  ShoppingBag,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  BadgeCheck,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SaleRecord, PhoneModel } from '../../types';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { getActivePhoneModels } from '../../lib/storage';
import { formatSaleTimeLabel, compareSalesByRecordedAt, groupSalesByDay, takeSalesByCompleteDays, resolveSaleTimestamps } from '../../lib/saleTimestamps';
import { parseLocalDateKey } from '../../lib/date';
import { onInventoryUpdated, onSettingsUpdated } from '../../lib/events';
import { SaleWallpaperBackground } from './SaleWallpaperBackground';

type MovementListMode = 'recent' | 'full';

interface MovementListProps {
  sales: SaleRecord[];
  mode?: MovementListMode;
  initialLimit?: number;
  showSort?: boolean;
  onOpenAddMode?: () => void;
  onOpenEditMode: (sale: SaleRecord) => void;
  onDeleteSale?: (sale: SaleRecord) => void;
}

const textShadowStrong = 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.92)]';
const textShadowSoft = 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.82)]';
const textShadowOnBright = 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] drop-shadow-[0_0_10px_rgba(0,0,0,0.55)]';

export function MovementList({
  sales,
  mode = 'full',
  initialLimit = 20,
  showSort = true,
  onOpenAddMode,
  onOpenEditMode,
  onDeleteSale
}: MovementListProps) {
  const [sortOldest, setSortOldest] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [limit, setLimit] = useState(initialLimit);
  const [catalogVersion, setCatalogVersion] = useState(0);

  const phoneModels = useMemo(() => {
    void catalogVersion;
    return getActivePhoneModels();
  }, [catalogVersion]);

  useEffect(() => {
    const unsubscribeInventory = onInventoryUpdated(() => {
      setCatalogVersion((version) => version + 1);
    });
    const unsubscribeSettings = onSettingsUpdated(() => {
      setCatalogVersion((version) => version + 1);
    });
    return () => {
      unsubscribeInventory();
      unsubscribeSettings();
    };
  }, []);

  const modelByDeviceId = useMemo(() => {
    const map = new Map<string, PhoneModel>();
    phoneModels.forEach((model) => map.set(model.id, model));
    return map;
  }, [phoneModels]);

  useEffect(() => {
    setLimit(initialLimit);
  }, [initialLimit, mode, sortOldest]);

  const salesWithDates = useMemo(() => sales.map(sale => {
    const timestamps = resolveSaleTimestamps(sale);
    const dateObj = parseLocalDateKey(timestamps.date);
    const [, , day] = timestamps.date.split('-');
    const colorName = sale.deviceColorSnapshot || sale.deviceColor || '';

    return {
      ...sale,
      date: timestamps.date,
      dateObj,
      dateDay: day,
      dateMonth: new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(dateObj).toUpperCase(),
      colorName,
    };
  }), [sales]);

  const sortedSales = useMemo(() => [...salesWithDates].sort((a, b) => {
    return sortOldest
      ? compareSalesByRecordedAt(a, b) * -1
      : compareSalesByRecordedAt(a, b);
  }), [salesWithDates, sortOldest]);

  const visibleSales = useMemo(
    () => takeSalesByCompleteDays(sortedSales, limit),
    [sortedSales, limit],
  );

  const groupedSalesByDay = useMemo(
    () => groupSalesByDay(visibleSales),
    [visibleSales],
  );

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleDelete = (sale: SaleRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    onDeleteSale?.(sale);
  };

  const renderSaleCard = (sale: typeof sortedSales[number]) => (
    <div
      key={sale.id}
      onClick={() => onOpenEditMode(sale)}
      className="relative flex h-[92px] items-center overflow-hidden rounded-[1.15rem] border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-all cursor-pointer"
    >
      <SaleWallpaperBackground
        sale={sale}
        model={modelByDeviceId.get(sale.deviceId)}
      />
      <div className="absolute inset-0 border border-white/10 rounded-[1.15rem] pointer-events-none" />

      <div className="relative z-10 flex w-full items-center px-2.5 py-2">
        <div className="mr-2 flex min-w-[58px] flex-col items-center justify-center rounded-xl border border-white/16 bg-black/28 px-2 py-1 backdrop-blur-md">
          <span className={`text-[9px] font-black uppercase tracking-widest text-white/85 ${textShadowSoft}`}>{sale.dateMonth}</span>
          <span className={`text-2xl font-black leading-none text-white ${textShadowStrong}`}>{sale.dateDay}</span>
          <span className={`mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/75 ${textShadowSoft}`}>
            {formatSaleTimeLabel(sale)}
          </span>
        </div>

        <div className="mr-2 flex items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/14 p-1 backdrop-blur-md">
            <BadgeCheck size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <div className="mx-1 flex h-[70px] w-12 flex-shrink-0 items-center justify-center drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]">
          <VivoPhoneIcon width="100%" height="100%" deviceId={sale.deviceId} colorName={sale.deviceColorSnapshot || sale.deviceColor} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-2">
          <span className={`truncate text-[16px] font-black text-white ${textShadowOnBright}`}>
            {sale.deviceNameSnapshot || sale.deviceName}
          </span>
          <div className="mt-0.5 inline-flex min-w-0 items-center gap-1.5">
            <span className={`truncate rounded-full border border-white/22 bg-black/48 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${textShadowSoft}`}>
              {sale.colorName.toUpperCase()}
            </span>
            {(sale.quantity || 1) > 1 && (
              <span className="rounded-full border border-white/25 bg-white/90 px-2 py-0.5 text-[9px] font-bold text-[#1f2937] shadow-sm">
                x{sale.quantity}
              </span>
            )}
          </div>
        </div>

        <div className="mr-1 flex shrink-0 items-center justify-center rounded-xl border border-white/18 bg-black/48 px-3.5 py-2.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <span className={`text-[18px] font-black leading-none whitespace-nowrap text-white ${textShadowOnBright}`}>
            +${sale.amountEarned}
          </span>
        </div>

        {mode === 'full' && (
          <div className="relative ml-1 flex h-[60%] items-center border-l border-white/20 pl-1">
            <button
              type="button"
              onClick={(e) => toggleMenu(sale.id, e)}
              className="rounded-full p-2 text-white/85 transition-colors hover:bg-black/20 hover:text-white"
              title="Opciones"
            >
              <MoreVertical size={20} strokeWidth={2.5} />
            </button>

            <AnimatePresence>
              {activeMenuId === sale.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(null);
                      onOpenEditMode(sale);
                    }}
                  >
                    <Pencil size={16} /> Editar
                  </button>
                  <div className="mx-2 my-1 h-px bg-slate-100 dark:bg-slate-700" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={(e) => handleDelete(sale, e)}
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
  const renderDayGroups = (showHeaderActions = false) => (
    <div className={`flex flex-col ${mode === 'recent' ? 'gap-2.5' : 'mt-1 pb-16 font-sans'}`}>
      {groupedSalesByDay.map(({ dateKey, label, sales: daySales }, index) => (
        <div key={dateKey} className={mode === 'full' ? 'mb-5' : ''}>
          <div className={`flex items-center gap-3 ${mode === 'full' ? 'mb-3 mt-1 px-2' : 'mb-1.5 px-1'}`}>
            <h2 className={`font-black uppercase tracking-widest text-slate-400 ${mode === 'full' ? 'text-sm' : 'text-[0.62rem]'}`}>
              {label}
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
            {showHeaderActions && showSort && index === 0 && (
              <button
                type="button"
                onClick={() => setSortOldest(!sortOldest)}
                className="rounded-full border border-gray-100 bg-white p-2 text-indigo-600 shadow-sm outline-none transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-indigo-400"
                title={sortOldest ? 'Ordenado más antiguo' : 'Ordenado más reciente'}
              >
                {sortOldest ? <ArrowDownNarrowWide size={16} strokeWidth={2.5} /> : <ArrowUpWideNarrow size={16} strokeWidth={2.5} />}
              </button>
            )}
          </div>

          <div className={`rounded-[1.35rem] vivo-surface-on-pattern p-2 ${mode === 'recent' ? 'gap-2' : ''}`}>
            <div className="flex flex-col gap-2.5">
              {daySales.map((sale) => renderSaleCard(sale))}
            </div>
          </div>
        </div>
      ))}

      {mode === 'full' && visibleSales.length < sortedSales.length && (
        <div className="mb-8 mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((current) => current + initialLimit)}
            className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );

  if (sales.length === 0) {
    if (mode === 'recent') {
      return (
        <div className="min-h-[58px] rounded-[1.25rem] border border-dashed border-[var(--glass-border)] vivo-inset-on-pattern px-3 py-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full vivo-inset-on-pattern flex items-center justify-center text-slate-300 dark:text-slate-600 shrink-0">
            <ShoppingBag size={17} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-black uppercase text-[0.68rem] tracking-widest text-slate-500 dark:text-slate-300">
              Sin ventas registradas
            </p>
            <p className="text-[0.68rem] font-semibold text-slate-400 truncate">Agrega una venta para ver actividad aquí.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-5 mt-1 gap-2.5 vivo-surface-on-pattern rounded-[1.5rem] border border-dashed border-[var(--glass-border)]">
        <div className="w-12 h-12 rounded-full vivo-inset-on-pattern flex items-center justify-center text-slate-300 dark:text-slate-600">
          <ShoppingBag size={22} strokeWidth={2} />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-black uppercase text-[0.75rem] tracking-widest text-slate-500 dark:text-slate-300">
            Sin ventas registradas
          </p>
          <p className="text-xs font-semibold text-slate-400">Registra una venta para alimentar tus ingresos.</p>
        </div>
        {onOpenAddMode && mode === 'full' && (
          <button
            type="button"
            onClick={onOpenAddMode}
            className="min-h-[44px] px-4 rounded-full bg-[var(--neo-accent)] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} /> Agregar venta
          </button>
        )}
      </div>
    );
  }

  if (mode === 'recent') {
    return renderDayGroups(false);
  }

  return (
    <>
      <div className="relative flex-1 custom-scrollbar">
        {renderDayGroups(true)}
      </div>

      {activeMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
        />
      )}
    </>
  );
}
