import React from 'react';
import { Target, PiggyBank, Package, LayoutGrid } from 'lucide-react';

interface AdvancedGoalsConfigProps {
  settings: any;
  onChange: (field: string, value: any) => void;
}

export default function AdvancedGoalsConfig({ settings, onChange }: AdvancedGoalsConfigProps) {
  const positioningGoals = settings.positioningGoals || {};

  const handlePositioningChange = (field: string, value: string) => {
    onChange('positioningGoals', {
      ...positioningGoals,
      [field]: Number(value)
    });
  };

  return (
    <div className="vivo-panel p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center justify-center p-4 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-[1.5rem]">
          <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-full mb-2">
            <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
          </div>
          <label className="text-[0.60rem] font-bold text-indigo-400 uppercase tracking-wider block mb-1 text-center">Diaria (Disp.)</label>
          <input
            type="number"
            value={settings.dailyGoal || ''}
            onChange={(e) => onChange('dailyGoal', Number(e.target.value))}
            className="w-full bg-transparent text-indigo-900 dark:text-indigo-200 font-black outline-none text-center text-2xl"
          />
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-[1.5rem]">
          <div className="bg-blue-100 dark:bg-blue-500/20 p-2.5 rounded-full mb-2">
            <Target className="w-5 h-5 text-blue-500 dark:text-blue-300" />
          </div>
          <label className="text-[0.60rem] font-bold text-blue-400 uppercase tracking-wider block mb-1 text-center">Mensual (Disp.)</label>
          <input
            type="number"
            value={settings.monthlyGoal || ''}
            onChange={(e) => onChange('monthlyGoal', Number(e.target.value))}
            className="w-full bg-transparent text-blue-900 dark:text-blue-200 font-black outline-none text-center text-2xl"
          />
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-[1.5rem]">
          <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-full mb-2">
            <PiggyBank className="w-5 h-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <label className="text-[0.60rem] font-bold text-emerald-400 uppercase tracking-wider block mb-1 text-center">Meta Mensual Ingresos ($)</label>
          <input
            type="number"
            value={settings.commissionGoal || ''}
            onChange={(e) => onChange('commissionGoal', Number(e.target.value))}
            className="w-full bg-transparent text-emerald-900 dark:text-emerald-200 font-black outline-none text-center text-2xl"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-white/10">
        <h3 className="text-[0.65rem] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Package size={14} className="text-gray-400 dark:text-slate-500" />
          Reglas de Inventario
        </h3>
        <div className="flex flex-col gap-2">
          <div className="vivo-subtle rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-gray-800 dark:text-slate-100">Stock Mínimo Ideal</p>
              <p className="text-[0.65rem] text-gray-500 dark:text-slate-400 font-medium">Límite para alertas de reabastecimiento</p>
            </div>
            <input
              type="number"
              value={settings.minStockGoal || 2}
              onChange={(e) => onChange('minStockGoal', Number(e.target.value))}
              className="w-16 bg-white dark:bg-[var(--neo-surface)] border border-gray-200 dark:border-white/10 rounded-lg py-1 px-2 text-center text-sm font-black text-gray-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-white/10">
        <h3 className="text-[0.65rem] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <LayoutGrid size={14} className="text-gray-400 dark:text-slate-500" />
          Mix de Venta Ideal (Opcional %)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'premium', label: 'Premium' },
            { id: 'balance', label: 'Balance' },
            { id: 'volume', label: 'Volumen' },
            { id: 'entry', label: 'Entrada' }
          ].map(goal => (
            <div key={goal.id} className="vivo-subtle rounded-xl p-2.5 flex flex-col justify-between items-center gap-1">
              <span className="text-[0.60rem] text-gray-500 dark:text-slate-400 font-bold uppercase">{goal.label}</span>
              <div className="flex items-center gap-1 w-full justify-center">
                <input
                  type="number"
                  value={positioningGoals[goal.id as keyof typeof positioningGoals] || ''}
                  onChange={(e) => handlePositioningChange(goal.id, e.target.value)}
                  placeholder="-"
                  className="w-12 bg-white dark:bg-[var(--neo-surface)] border border-gray-200 dark:border-white/10 rounded text-center text-xs font-black text-gray-800 dark:text-slate-100 py-1"
                />
                <span className="text-[0.65rem] text-gray-400 dark:text-slate-500">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
