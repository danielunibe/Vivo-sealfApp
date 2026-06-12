import React from 'react';
import { SectionType } from '@/types/navigation';

interface TopHeaderBarProps {
  theme: 'light' | 'dark';
  activeTab: SectionType;
}

export default function TopHeaderBar({ activeTab }: TopHeaderBarProps) {
  return (
    <header className={`w-full max-w-xl mx-auto px-6 pt-6 flex items-center justify-between z-30 shrink-0 ${
      activeTab === 'register-sale' || activeTab === 'catalog' ? 'hidden' : ''
    }`}>
      <div className="flex items-center gap-1.5 opacity-90 select-none">
        <span className="text-[10px] uppercase font-black tracking-[0.25em] font-mono text-[var(--neo-text)]">
          {activeTab === 'calendar' ? 'CALENDARIO' :
           activeTab === 'catalog' ? 'CATÁLOGO' :
           activeTab === 'register-sale' ? '' :
           activeTab === 'piggy-bank' ? 'PUERQUITO' :
           activeTab === 'settings' ? 'AJUSTES' : 'VIVO PROMOTOR'}
        </span>
      </div>
    </header>
  );
}
