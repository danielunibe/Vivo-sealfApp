'use client';

import React from 'react';
import { Clock, History, Palette, ShieldAlert, SlidersHorizontal, Smartphone, Target, User } from 'lucide-react';
import { triggerFeedback } from '@/lib/nativeFeedback';

export type SettingsTabId = 'profile' | 'schedule' | 'devices' | 'goals' | 'history' | 'backup' | 'appearance' | 'interaction';

const tabs: Array<{
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'schedule', label: 'Horario', icon: Clock },
  { id: 'devices', label: 'Equipos', icon: Smartphone },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'backup', label: 'Backup', icon: ShieldAlert },
  { id: 'appearance', label: 'Tema', icon: Palette },
  { id: 'interaction', label: 'Interaccion', icon: SlidersHorizontal },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
}

export default React.memo(function SettingsTabs({ activeTab, onChange }: SettingsTabsProps) {
  return (
    <div className="neo-inset mb-5 grid grid-cols-4 gap-1 rounded-[24px] p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              onChange(tab.id);
              void triggerFeedback('selection');
            }}
            className={`neo-button flex min-h-[50px] flex-col items-center justify-center gap-1 px-1 py-2 text-[8px] font-black uppercase leading-none tracking-wide transition-all ${
              isActive ? 'neo-button-pressed text-[var(--neo-accent)]' : 'text-[var(--neo-muted)]'
            }`}
            aria-pressed={isActive}
            aria-label={tab.label}
            title={tab.label}
          >
            <Icon className="h-4 w-4" />
            <span className="max-w-full truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
});
