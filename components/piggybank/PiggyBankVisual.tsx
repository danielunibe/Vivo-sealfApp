'use client';

import React from 'react';
import { PiggyBank, Target, Sparkles } from 'lucide-react';
import SavingsJar from './SavingsJar';

interface PiggyBankVisualProps {
  theme: 'light' | 'dark';
  currentEarnings: number;
  targetEarnings?: number;
}

export default function PiggyBankVisual({
  theme,
  currentEarnings,
  targetEarnings = 1200
}: PiggyBankVisualProps) {
  const percentage = Math.min(100, Math.round((currentEarnings / targetEarnings) * 100));

  return (
    <div className="flex flex-col gap-2.5 mb-3 select-none pb-2 border-b border-neutral-100/60 dark:border-neutral-800/40 shrink-0">
      
      {/* Visual Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 animate-fade-in">
          <PiggyBank className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[9.5px] font-black uppercase text-neutral-400 font-mono tracking-widest leading-none">
            Alcancia Digital
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono shrink-0">
          <Target className="w-3 h-3 text-[#3B82F6]" />
          <span className="text-[8.5px] text-neutral-400 uppercase tracking-widest font-semibold">
            Meta: ${targetEarnings} MXN
          </span>
        </div>
      </div>

      {/* Main split showcase: Left 3D Jar, Right statistics */}
      <div className="grid grid-cols-5 gap-3.5 items-center">
        {/* Left Column: Premium 3D crystal jar */}
        <div className="col-span-2 h-[125px] flex items-center justify-center relative overflow-hidden rounded-xl bg-neutral-100/30 dark:bg-neutral-900/10 border border-neutral-150/40 dark:border-neutral-850/20">
          <SavingsJar 
            theme={theme}
            currentEarnings={currentEarnings}
            currentGoal={targetEarnings}
          />
        </div>

        {/* Right Column: Earnings Summary */}
        <div className="col-span-3 flex flex-col justify-center h-[125px] py-1">
          <div className="flex flex-col mb-1.5">
            <span className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
              Balance Acumulado
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl.8 font-extrabold font-mono tracking-tight leading-none ${
                theme === 'light' ? 'text-neutral-900' : 'text-white'
              }`}>
                ${currentEarnings}
              </span>
              <span className="text-[10px] text-neutral-400 font-black font-semibold font-mono">MXN</span>
            </div>
          </div>

          {/* Sparkles / Progress info */}
          <div className="flex items-center gap-1 mt-auto">
            <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-bold font-mono">
              {percentage}% Completado
            </span>
          </div>

          {/* Full track of progress with subtle glow indicator */}
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800/80 relative mt-2 shrink-0">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
