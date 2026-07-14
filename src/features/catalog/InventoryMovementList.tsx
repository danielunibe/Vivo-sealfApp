import React, { useState, useEffect } from 'react';
import { getInventoryMovements } from '../../lib/storage';
import { InventoryMovement } from '../../types';
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, RotateCcw, AlertCircle, ChevronDown } from 'lucide-react';

export function InventoryMovementList() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = () => {
      const all = getInventoryMovements().reverse();
      setTotal(all.length);
      setMovements(all.slice(0, limit));
    };
    load();
    
    window.addEventListener('inventory-updated', load);
    return () => window.removeEventListener('inventory-updated', load);
  }, [limit]);

  if (movements.length === 0) return null;

  return (
    <div className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-200">
      <h3 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-gray-400" />
          Últimos Movimientos
        </div>
        <span className="text-[0.55rem] text-gray-400 font-medium">{total} total</span>
      </h3>
      
      <div className="flex flex-col gap-2">
        {movements.map((m) => {
          const isPositive = m.quantityChange > 0;
          const isSale = m.type === 'sale';
          
          let Icon = isPositive ? ArrowUpRight : ArrowDownRight;
          let colorClass = isPositive ? 'text-blue-500' : 'text-orange-500';
          let bgClass = isPositive ? 'bg-blue-100' : 'bg-orange-100';
          let typeLabel = 'Movimiento';
          
          if (m.type === 'sale') {
            Icon = CheckCircle2;
            colorClass = 'text-emerald-500';
            bgClass = 'bg-emerald-100';
            typeLabel = 'Venta';
          } else if (m.type === 'sale_deleted') {
            Icon = RotateCcw;
            colorClass = 'text-rose-500';
            bgClass = 'bg-rose-100';
            typeLabel = 'Venta revertida';
          } else if (m.type === 'correction') {
            Icon = AlertCircle;
            colorClass = 'text-amber-500';
            bgClass = 'bg-amber-100';
            typeLabel = 'Corrección';
          } else if (m.type === 'restock') {
            typeLabel = 'Reabastecimiento';
          } else if (m.type === 'manual_adjustment') {
            typeLabel = 'Ajuste manual';
          }

          const date = new Date(m.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

          return (
            <div key={m.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
                  <Icon size={14} strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#343A43] uppercase tracking-tight">{m.deviceNameSnapshot}</span>
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${bgClass} ${colorClass}`}>
                      {m.quantityChange > 0 ? '+' : ''}{m.quantityChange}
                    </span>
                  </div>
                  <div className="text-[0.55rem] font-medium text-gray-400 mt-0.5 flex flex-col">
                    <span className="text-gray-500">{typeLabel}{m.saleDateSnapshot ? ` • Venta ${m.saleDateSnapshot}` : ''}</span>
                    <span>Stock: {m.previousStock} → {m.newStock}</span>
                    <span className="truncate max-w-[120px] text-gray-500">{m.reason}</span>
                  </div>
                </div>
              </div>
              <div className="text-[0.55rem] font-bold text-gray-400 text-right">
                {date}
              </div>
            </div>
          );
        })}
      </div>
      
      {movements.length < total && (
        <button 
          onClick={() => setLimit(l => l + 20)}
          className="mt-3 w-full py-2 bg-white border border-gray-200 rounded-xl text-[0.6rem] font-bold text-gray-500 uppercase tracking-widest flex justify-center items-center gap-1 hover:bg-gray-50 transition-colors"
        >
          Cargar más <ChevronDown size={12} />
        </button>
      )}
    </div>
  );
}
