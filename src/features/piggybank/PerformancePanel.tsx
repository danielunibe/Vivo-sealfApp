import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, DollarSign, Smartphone, AlertCircle, Award, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getMonthlyPerformanceInsights, generateCommercialInsights } from '../../lib/insights';
import { getPeriodStats, getComparisonStats, TimePeriod } from '../../lib/analytics';
import { Achievement } from '../../types';

interface PerformancePanelProps {
  insights: ReturnType<typeof getMonthlyPerformanceInsights>;
  commercialInsights: string[];
  achievements: Achievement[];
}

export function PerformancePanel({ insights, commercialInsights, achievements }: PerformancePanelProps) {
  const [period, setPeriod] = useState<TimePeriod>('month');
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const periodStats = getPeriodStats(period);
  const compStats = getComparisonStats();

  const renderComparison = () => {
    if (period === 'month' && compStats.month.prevComm > 0) {
      const isUp = compStats.month.changeCommPercent >= 0;
      return (
        <div className={`text-[0.6rem] flex items-center gap-1 mt-2 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(compStats.month.changeCommPercent).toFixed(1)}% vs mes pasado
        </div>
      );
    }
    if (period === 'week' && compStats.week.prevPieces > 0) {
      const change = compStats.week.changePieces;
      const isUp = change >= 0;
      return (
        <div className={`text-[0.6rem] flex items-center gap-1 mt-2 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(change)} piezas {isUp ? 'más' : 'menos'} que semana pasada
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Resumen con Filtro */}
      <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <TrendingUp size={100} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest">
            Rendimiento
          </h3>
          <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
            {(['today', 'week', 'month', 'year', 'all'] as TimePeriod[]).map((p) => {
              const labels: Record<TimePeriod, string> = { today: 'Hoy', week: 'Semana', month: 'Mes', year: 'Año', all: 'Todo' };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-[0.6rem] font-bold px-2.5 py-1 rounded-full transition-colors ${period === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase mb-1 flex items-center gap-1">
              <DollarSign size={12} className="text-[#1ECCA2]" /> Comisión
            </span>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-white">${periodStats.totalCommission}</span>
            </div>
            {renderComparison()}
            {period === 'month' && insights.commissionGoal > 0 && (
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#1ECCA2]" 
                  style={{ width: `${Math.min(100, (periodStats.totalCommission / insights.commissionGoal) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase mb-1 flex items-center gap-1">
              <Smartphone size={12} className="text-[#6C5DD3]" /> Equipos
            </span>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-white">{periodStats.totalPieces}</span>
            </div>
            {period === 'month' && insights.piecesGoal > 0 && (
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#6C5DD3]" 
                  style={{ width: `${Math.min(100, (periodStats.totalPieces / insights.piecesGoal) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex-shrink-0 bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-[0.6rem] text-white/50 uppercase tracking-widest">Estrella:</span>
            <span className="text-xs font-black text-white">{periodStats.topModelByCommission || '-'}</span>
          </div>
          <div className="flex-shrink-0 bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-[0.6rem] text-white/50 uppercase tracking-widest">Piezas:</span>
            <span className="text-xs font-black text-white">{periodStats.topModelByPieces || '-'}</span>
          </div>
        </div>
      </div>

      {/* Coach Comercial */}
      {commercialInsights.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5">
          <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-500" />
            Coach Comercial
          </h3>
          <div className="flex flex-col gap-2">
            {commercialInsights.map((insight, idx) => (
              <div key={idx} className="bg-black/30 rounded-xl p-3 border border-white/5">
                <p className="text-xs text-white/80 font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros */}
      {unlockedAchievements.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5">
          <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Award size={14} className="text-yellow-400" />
            Logros Obtenidos
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {unlockedAchievements.map(ach => (
              <div key={ach.id} className="flex-shrink-0 w-32 bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Award size={20} className="text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-[0.65rem] font-black text-white">{ach.title}</h4>
                  <p className="text-[0.55rem] text-white/50 mt-1 line-clamp-2">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

