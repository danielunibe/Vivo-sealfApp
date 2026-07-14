import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, History, Plus, Calendar, Pencil, Trash2, MoreVertical, Eye, ArrowDownNarrowWide, ArrowUpWideNarrow, ShoppingBag, BadgeCheck } from 'lucide-react';
import { SaleRecord } from '../../types';
import { parseLocalDateKey } from '../../lib/date';
import { compareSalesByRecordedAt, formatSaleTimeLabel, groupSalesByDay, takeSalesByCompleteDays, getSaleDayKey, resolveSaleTimestamps } from '../../lib/saleTimestamps';
import { getHexForColorName } from './calendarUtils';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { StatusGuideSheet } from './StatusGuideSheet';

interface CalendarAgendaModeProps {
  sales: SaleRecord[];
  showLegend: boolean;
  selectedFilterIso: string | null;
  onClose: () => void;
  onToggleLegend: (e: React.MouseEvent) => void;
  onClearFilter: () => void;
  onAddOldSale: () => void;
  onEditSale: (sale: SaleRecord) => void;
  onDeleteSale: (sale: SaleRecord) => void;
  onRedirectToRegister: () => void;
}

export function CalendarAgendaMode({
  sales,
  showLegend,
  selectedFilterIso,
  onClose,
  onToggleLegend,
  onClearFilter,
  onAddOldSale,
  onEditSale,
  onDeleteSale,
  onRedirectToRegister
}: CalendarAgendaModeProps) {
  const [sortOldest, setSortOldest] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setLimit(20);
  }, [selectedFilterIso, sortOldest]);

  const filteredSales = React.useMemo(() => selectedFilterIso
    ? sales.filter(s => getSaleDayKey(s) === selectedFilterIso)
    : sales, [sales, selectedFilterIso]);

  // Extend sales with parsed dates
  const salesWithDates = React.useMemo(() => filteredSales.map(sale => {
    const timestamps = resolveSaleTimestamps(sale);
    const dateObj = parseLocalDateKey(timestamps.date);
    const colorHex = getHexForColorName(sale.deviceColorSnapshot || sale.deviceColor || '');

    return {
      ...sale,
      date: timestamps.date,
      dateObj,
      dateDay: timestamps.date.split('-')[2],
      dateMonth: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(dateObj).toUpperCase() + '.',
      time: formatSaleTimeLabel(sale, false),
      colorHex
    };
  }), [filteredSales]);

  // Sort
  const sortedSales = React.useMemo(() => [...salesWithDates].sort((a, b) => {
    return sortOldest
      ? compareSalesByRecordedAt(a, b) * -1
      : compareSalesByRecordedAt(a, b);
  }), [salesWithDates, sortOldest]);

  const visibleSales = React.useMemo(
    () => takeSalesByCompleteDays(sortedSales, limit),
    [sortedSales, limit],
  );

  const groupedSalesByDay = React.useMemo(
    () => groupSalesByDay(visibleSales),
    [visibleSales],
  );

  // Manage menu toggle
  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  return (
    <motion.div 
      key="agenda-view"
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[410px] flex flex-col z-20 h-full shrink-0 justify-start pb-6 pt-1 overflow-hidden relative"
    >
      <div className="mb-4 shrink-0 px-1 vivo-surface-on-pattern rounded-[2rem] p-4 flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
            <History size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-[#2d3748] uppercase tracking-widest leading-none">
                {sales.length} registros
              </p>
              <button 
                onClick={onToggleLegend}
                className="w-5 h-5 rounded-full text-white hover:opacity-90 active:scale-90 transition-all font-black text-[10px] flex items-center justify-center cursor-pointer shadow-sm"
                style={{ backgroundColor: '#2B3138' }}
                title="Ver Leyenda de Colores"
              >
                ?
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-gray-500 font-bold text-sm">
              <CalendarDays size={13} strokeWidth={2.5} className="text-blue-500 shrink-0" />
              <span>Ventas por día</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onAddOldSale}
          className="px-3.5 py-2.5 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          title="Registrar venta fuera de fecha"
        >
          <Plus size={11} strokeWidth={3} />
          <span>Antigua</span>
        </button>
      </div>

      <div className="flex justify-end mb-1 px-2 relative z-20">
         {/* Sort Button */}
         <button 
            onClick={() => setSortOldest(!sortOldest)}
            className="flex items-center justify-center w-8 h-8 vivo-inset-on-pattern rounded-full text-blue-600 shadow-sm hover:brightness-[1.03] transition-colors"
            title={sortOldest ? "Ordenado más antiguo" : "Ordenado más reciente"}
          >
            {sortOldest ? <ArrowDownNarrowWide size={16} strokeWidth={2.5} /> : <ArrowUpWideNarrow size={16} strokeWidth={2.5} />}
         </button>
      </div>

      {/* Filter Indicator */}
      {selectedFilterIso && (
        <div className="flex items-center justify-between px-2.5 py-2 mb-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 text-xs text-blue-700 font-bold shrink-0 shadow-sm animate-fade-in relative z-20">
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarDays size={13} className="text-blue-500 shrink-0" />
            <span className="truncate">Filtrado: Día {parseInt(selectedFilterIso.split('-')[2], 10)} de Junio</span>
          </div>
          <button 
            onClick={onClearFilter}
            className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] uppercase font-black tracking-wider text-blue-700 hover:bg-blue-500/20 transition-all cursor-pointer select-none"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* List layout */}
      <div className="flex-1 w-full overflow-y-auto pr-1 no-scrollbar flex flex-col pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+140px)] relative min-h-[300px]">
        <AnimatePresence initial={false}>
          {(() => {
            if (sales.length === 0) {
              return (
                <motion.div 
                  key="empty-all"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full vivo-inset-on-pattern flex items-center justify-center text-gray-400 mb-4">
                    <ShoppingBag size={28} strokeWidth={2} />
                  </div>
                  <h3 className="font-extrabold text-[0.9rem] text-gray-800 uppercase tracking-widest">No hay contenidos registrados</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed font-semibold">Registra tu primera venta para ver el historial aquí.</p>
                  
                  <button 
                    onClick={onRedirectToRegister}
                    className="mt-6 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Nueva Venta</span>
                  </button>
                </motion.div>
              );
            }

            if (filteredSales.length === 0) {
              return (
                <motion.div 
                  key="empty-filter"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400/70 mb-3 border border-blue-500/10">
                    <Calendar size={22} />
                  </div>
                  <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-widest">Sin ventas este día</h3>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed font-semibold">No se encontraron ventas para la fecha seleccionada.</p>
                  
                  <div className="flex gap-2.5 justify-center mt-5">
                    <button 
                      onClick={onClearFilter}
                      className="px-3.5 py-2 rounded-xl vivo-inset-on-pattern text-[10px] font-black uppercase text-gray-600 active:scale-95 transition-all tracking-wider cursor-pointer"
                    >
                      Ver Todo
                    </button>
                    <button 
                      onClick={onRedirectToRegister}
                      className="px-3.5 py-2 rounded-xl bg-blue-500 text-[10px] font-black uppercase text-white shadow-md shadow-blue-500/15 active:scale-95 transition-all tracking-wider cursor-pointer"
                    >
                      Registrar
                    </button>
                  </div>
                </motion.div>
              );
            }

            return groupedSalesByDay.map(({ dateKey, label, sales: daySales }) => (
              <motion.div key={dateKey} className="mb-4" layout>
                <div className="flex items-center gap-4 px-3 mb-3 mt-1">
                  <h2 className="text-xs font-black text-gray-400 tracking-widest uppercase truncate">{label}</h2>
                  <div className="h-px bg-gray-200/80 flex-1"></div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{daySales.length} venta{daySales.length === 1 ? '' : 's'}</span>
                </div>

                <div className="rounded-[1.35rem] vivo-surface-on-pattern p-1.5">
                  <div className="flex flex-col gap-1.5">
                  {daySales.map((sale) => (
                    <motion.div 
                      key={sale.id} 
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center h-[76px] px-2 py-2 vivo-inset-on-pattern rounded-[1.25rem] transition-colors relative ${activeMenuId === sale.id ? 'z-50' : 'z-10'}`}
                    >
                      {/* Date & Time Column */}
                      <div className="flex flex-col items-center justify-center min-w-[55px] pr-1">
                        <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest">{sale.dateMonth}</span>
                        <span className="text-[1.35rem] font-black text-slate-800 leading-none my-0.5">{sale.dateDay}</span>
                        <span className="text-[8px] font-bold text-gray-400">{sale.time}</span>
                      </div>

                      <div className="flex items-center justify-center mr-1">
                        <BadgeCheck size={16} className="text-emerald-500" strokeWidth={2.5} />
                      </div>

                      {/* SVG Device Graphic */}
                      <div className="w-[32px] h-[48px] bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mx-2 p-1 border border-gray-200/50">
                        <VivoPhoneIcon width="100%" height="100%" deviceId={sale.deviceId} colorName={sale.deviceColor} />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-black text-[14px] text-slate-800 truncate tracking-tight py-0">{sale.deviceName}</span>
                          <div className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: sale.colorHex }}></div>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider">{sale.deviceColor}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-emerald-500 font-black text-[14px] whitespace-nowrap pr-2">
                        +${sale.amountEarned}
                      </div>

                      {/* Three Dots Menu Column */}
                      <div className="relative border-l border-gray-200/60 pl-1 ml-1 h-[60%] flex items-center">
                        <button 
                          onClick={(e) => toggleMenu(sale.id, e)}
                          className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={18} strokeWidth={2.5} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {activeMenuId === sale.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 5 }}
                              className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors" 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onRedirectToRegister(); }}
                              >
                                <Eye size={15} /> Detalles
                              </button>
                              <button 
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors" 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onEditSale(sale); }}
                              >
                                <Pencil size={15} /> Editar
                              </button>
                              <div className="h-px bg-gray-100 my-1 mx-2"></div>
                              <button 
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onDeleteSale(sale); }}
                              >
                                <Trash2 size={15} /> Eliminar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </div>

              </motion.div>
            ));
          })()}
        </AnimatePresence>

        {sales.length > 0 && filteredSales.length > 0 && visibleSales.length < sortedSales.length && (
          <div className="flex justify-center mt-6 mb-8">
            <button 
              onClick={() => setLimit(l => l + 20)}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>

      {/* Popovers Layer */}
      <AnimatePresence>
          {showLegend && (
            <StatusGuideSheet onClose={() => onToggleLegend({ stopPropagation: () => {} } as React.MouseEvent)} />
          )}
        </AnimatePresence>

      {/* Overlay invisible para cerrar el menú si haces clic afuera */}
      {activeMenuId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
        ></div>
      )}
    </motion.div>
  );
}
