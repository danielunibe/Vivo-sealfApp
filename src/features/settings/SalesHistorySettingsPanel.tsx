import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Pencil, 
  Trash2, 
  RotateCcw,
  Smartphone,
  MoreVertical,
  ShoppingBag,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  Eye,
  BadgeCheck
} from 'lucide-react';
import { SaleRecord } from '../../types';
import { parseLocalDateKey } from '../../lib/date';
import { compareSalesByRecordedAt, formatSaleTimeLabel, groupSalesByDay, takeSalesByCompleteDays, resolveSaleTimestamps } from '../../lib/saleTimestamps';
import { getSales, deleteSale } from '../../lib/storage';

interface SalesHistorySettingsPanelProps {}

export function SalesHistorySettingsPanel({}: SalesHistorySettingsPanelProps) {
  const [sales, setSales] = useState<SaleRecord[]>(getSales());
  const [sortOldest, setSortOldest] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setLimit(20);
  }, [sortOldest]);

  const handleDeleteSale = (sale: SaleRecord) => {
    if (confirm(`¿Seguro que deseas eliminar el registro de venta del ${sale.deviceNameSnapshot || sale.deviceName || sale.deviceId} (${sale.deviceColorSnapshot || sale.deviceColor || 'Color Base'})?`)) {
      deleteSale(sale.id);
      setSales(getSales());
      setActiveMenuId(null);
    }
  };

  // Ordenar
  const sortedSales = React.useMemo(() => [...sales].sort((a, b) => {
    return sortOldest
      ? compareSalesByRecordedAt(a, b) * -1
      : compareSalesByRecordedAt(a, b);
  }), [sales, sortOldest]);

  const visibleSales = React.useMemo(
    () => takeSalesByCompleteDays(sortedSales, limit),
    [sortedSales, limit],
  );

  const groupedSalesByDay = React.useMemo(
    () => groupSalesByDay(visibleSales),
    [visibleSales],
  );

  const getMonthYearLabel = (dateKey: string) =>
    parseLocalDateKey(dateKey).toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const getVariantColor = (variant: string) => {
    const varUpper = variant.toUpperCase();
    if (varUpper.includes('NEGRO')) return 'bg-gray-800';
    if (varUpper.includes('VERDE')) return 'bg-green-500';
    if (varUpper.includes('LAVANDA') || varUpper.includes('MORADO')) return 'bg-purple-400';
    if (varUpper.includes('AZUL')) return 'bg-blue-500';
    if (varUpper.includes('ORO') || varUpper.includes('DORADO')) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  const formatShortTime = (sale: SaleRecord) =>
    formatSaleTimeLabel(sale, false);

  const formatDay = (sale: SaleRecord) => {
    const dateKey = resolveSaleTimestamps(sale).date;
    return parseLocalDateKey(dateKey).getDate().toString().padStart(2, '0');
  };

  const formatMonthShort = (sale: SaleRecord) => {
    const dateKey = resolveSaleTimestamps(sale).date;
    return parseLocalDateKey(dateKey).toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
  };

  return (
    <div className="w-full flex flex-col relative h-full">
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center vivo-panel rounded-2xl p-3">
        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest pl-2">
          <ShoppingBag size={16} />
          <span>{sales.length} registros</span>
        </div>
        
        <button 
          onClick={() => setSortOldest(!sortOldest)}
          className="bg-gray-100 dark:bg-white/8 p-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/12 transition-colors flex items-center gap-2 text-xs font-bold uppercase"
        >
          {sortOldest ? <><ArrowUpWideNarrow size={14} strokeWidth={2.5} /> Más antiguo</> : <><ArrowDownNarrowWide size={14} strokeWidth={2.5} /> Más reciente</>}
        </button>
      </div>

      {/* List of Sales Grouped by Day */}
      <div className="flex-1 pb-10">
        {groupedSalesByDay.length === 0 ? (
          <div className="vivo-surface-on-pattern border border-dashed border-gray-300/70 dark:border-white/15 rounded-[1.5rem] p-8 mt-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full vivo-inset-on-pattern flex items-center justify-center mb-4">
               <ShoppingBag size={28} className="text-gray-300 dark:text-slate-600" strokeWidth={2} />
            </div>
            <h3 className="text-[#343A43] dark:text-slate-100 font-black text-lg mb-1 uppercase tracking-widest text-[0.9rem]">No hay contenidos registrados</h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs font-semibold px-4 mt-1">Registra tu primera venta para ver el historial aquí.</p>
          </div>
        ) : (
          groupedSalesByDay.map(({ dateKey, label, sales: daySales }, index) => {
            const monthYear = getMonthYearLabel(dateKey);
            const previousMonth = index > 0 ? getMonthYearLabel(groupedSalesByDay[index - 1].dateKey) : null;
            const showMonthHeader = monthYear !== previousMonth;

            return (
            <div key={dateKey} className="mb-5">
              {showMonthHeader && (
                <div className="flex items-center gap-4 px-3 mb-3 mt-2">
                  <h2 className="text-[11px] font-black text-gray-400 tracking-widest">{monthYear}</h2>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
              )}

              <div className="flex items-center gap-3 px-3 mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</h3>
                <div className="h-px flex-1 bg-gray-200/80" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{daySales.length} venta{daySales.length === 1 ? '' : 's'}</span>
              </div>

              <div className="flex flex-col vivo-panel rounded-[1.5rem] p-1">
                {daySales.map((sale) => (
                  <div 
                    key={sale.id} 
                    className={`flex items-center h-[76px] px-2 py-2 border-b border-gray-100 dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors relative ${activeMenuId === sale.id ? 'z-50' : 'z-10'}`}
                  >
                    {/* Date & Time Column */}
                    <div className="flex flex-col items-center justify-center min-w-[55px] pr-1">
                      <span className="text-[9px] font-black text-gray-400 leading-none mb-0.5">{formatMonthShort(sale)}</span>
                      <span className="text-2xl font-black text-[#343A43] dark:text-slate-100 leading-none mb-0.5">{formatDay(sale)}</span>
                      <span className="text-[8px] font-bold text-gray-400 mt-0.5 whitespace-nowrap">{formatShortTime(sale)}</span>
                    </div>

                    <div className="flex items-center justify-center mr-1">
                      <BadgeCheck size={16} className="text-emerald-500" strokeWidth={2.5} />
                    </div>

                    {/* Rectángulo Vertical */}
                    <div className="w-8 h-12 bg-gray-100 dark:bg-white/8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 mx-2">
                      <Smartphone size={16} className="text-gray-400" strokeWidth={2} />
                    </div>

                    {/* Product Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[14px] text-[#343A43] dark:text-slate-100 truncate">{sale.deviceNameSnapshot || sale.deviceName || sale.deviceId}</span>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getVariantColor(sale.deviceColorSnapshot || sale.deviceColor || '')}`}></div>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[11px] font-bold text-gray-500 truncate uppercase">{sale.deviceColorSnapshot || sale.deviceColor || 'Color Base'}</span>
                      </div>
                    </div>

                    {/* Amount Column */}
                    <div className="text-emerald-500 font-black text-[14px] whitespace-nowrap pr-1">
                      +${sale.amountEarned}
                    </div>

                    {/* Three Dots Menu Column */}
                    <div className="relative">
                      <button 
                        onClick={(e) => toggleMenu(sale.id, e)}
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                      >
                        <MoreVertical size={20} strokeWidth={2.5} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === sale.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, transformOrigin: "top right" }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[var(--neo-surface)] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-white/10 py-1.5 z-50 overflow-hidden"
                          >
                            <button 
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleDeleteSale(sale); }}
                            >
                              <Trash2 size={16} /> Eliminar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            );
          })
        )}

        {sales.length > 0 && visibleSales.length < sortedSales.length && (
          <div className="flex justify-center mt-6 mb-8">
            <button 
              onClick={() => setLimit(l => l + 20)}
              className="px-6 py-2.5 bg-white dark:bg-[var(--neo-surface)] border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>

      {/* Overlay invisible para cerrar el menú si haces clic afuera */}
      {activeMenuId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenuId(null)}
        ></div>
      )}
    </div>
  );
}
