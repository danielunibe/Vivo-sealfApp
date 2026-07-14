import React from 'react';
import { Trophy, CalendarDays, DollarSign, Smartphone } from 'lucide-react';
import { getAllTimeStats } from '../../lib/analytics';

export function AllTimeStatsPanel() {
  const stats = getAllTimeStats();

  return (
    <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5">
      <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Trophy size={14} className="text-yellow-400" />
        Salón de la Fama
      </h3>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
          <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-1">Mejor Mes</span>
          <span className="text-sm font-black text-white">{stats.bestMonth || '-'}</span>
          <div className="text-xs text-white/60 mt-1">${stats.maxMonthlyCommission}</div>
        </div>
        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
          <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-1">Mejor Día</span>
          <span className="text-sm font-black text-white">{stats.bestDay || '-'}</span>
          <div className="text-xs text-white/60 mt-1">${stats.maxDailyCommission}</div>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-0.5">Promedio x Venta</span>
          <span className="text-sm font-black text-white">${stats.avgPerSale.toFixed(0)}</span>
        </div>
        <div>
          <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-0.5">Promedio Mes</span>
          <span className="text-sm font-black text-white">${stats.avgMonthlyCommission.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
