import React, { useState, useEffect } from 'react';
import { Target, Smartphone } from 'lucide-react';
import { PiggyGoal } from '@/types/piggy';
import { getPiggyGoals, savePiggyGoals } from '@/lib/storage';
import { Device } from '@/types/device';

interface GoalsSettingsProps {
  theme: 'light' | 'dark';
  devices: Device[];
}

const DEFAULT_GOALS: PiggyGoal = {
  daily: 300,
  weekly: 1500,
  monthly: 6500,
  yearly: 78000,
  dailyDeviceGoal: 3
};

export default function GoalsSettings({ theme, devices }: GoalsSettingsProps) {
  const [goals, setGoals] = useState<PiggyGoal>(DEFAULT_GOALS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGoals(getPiggyGoals());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field: keyof PiggyGoal, value: string) => {
    const parsed = parseInt(value, 10);
    const newGoals = { ...goals, [field]: isNaN(parsed) ? 0 : parsed };
    setGoals(newGoals);
    savePiggyGoals(newGoals);
  };

  // Helper to render device equivalents
  const renderEquivalent = (amount: number) => {
    if (!amount || amount <= 0 || !devices || devices.length === 0) return null;
    
    // Pick two representative devices, eg the first two with valid margins > 0
    const validDevices = devices.filter(d => d.margin > 0);
    if (validDevices.length === 0) return null;

    const repDivs = validDevices.slice(0, 2);
    
    return (
      <div className="flex flex-col gap-1 mt-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
        <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
          Equivale aprox. a:
        </span>
        {repDivs.map(d => {
          const qty = Math.ceil(amount / d.margin);
          return (
            <div key={d.id} className="flex items-center gap-1.5 opacity-80 text-[10px]">
              <Smartphone className="w-3 h-3" />
              <span>{qty} ventas de <span className="font-bold">{d.name}</span></span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2 pb-4">
      {/* Unit Goals (for Calendar) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
            Metas de Unidades (Calendario)
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold text-neutral-400 mb-1.5">Meta Diaria (Celulares)</span>
          <div className="relative flex items-center gap-1.5 max-w-[200px]">
            <input
              type="number"
              value={goals.dailyDeviceGoal || 0}
              onChange={(e) => handleChange('dailyDeviceGoal', e.target.value)}
              className={`w-full px-3 py-2.5 text-[12px] font-mono font-bold rounded-xl border transition-all focus:outline-none ${
                theme === 'light' 
                  ? 'bg-white border-black/10 focus:border-neutral-500 shadow-sm' 
                  : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white shadow-sm'
              }`}
            />
          </div>
          <span className="text-[9px] text-neutral-500 mt-1">Usada para la barra de progreso en el Calendario.</span>
        </div>
      </div>

      {/* Monetary Goals (for Piggy Bank) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
            Metas Monetarias (Puerquito)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'daily', label: 'Diaria' },
            { key: 'weekly', label: 'Semanal' },
            { key: 'monthly', label: 'Mensual' },
            { key: 'yearly', label: 'Anual' }
          ].map((item) => (
            <div key={item.key} className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-neutral-400 mb-1.5">{item.label}</span>
              <div className="relative flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-neutral-500 absolute left-3">$</span>
                <input
                  type="number"
                  value={goals[item.key as keyof PiggyGoal]}
                  onChange={(e) => handleChange(item.key as keyof PiggyGoal, e.target.value)}
                  className={`w-full pl-6 pr-3 py-2.5 text-[12px] font-mono font-bold rounded-xl border transition-all focus:outline-none ${
                    theme === 'light' 
                      ? 'bg-white border-black/10 focus:border-neutral-500 shadow-sm' 
                      : 'bg-neutral-900 border-white/10 focus:border-neutral-400 text-white shadow-sm'
                  }`}
                />
              </div>
              {renderEquivalent((goals[item.key as keyof PiggyGoal] as number) || 0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
