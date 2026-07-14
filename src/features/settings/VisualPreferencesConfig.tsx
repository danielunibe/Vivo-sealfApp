import React from 'react';
import { AppSettings, VisualPreferences } from '../../types';
import { Eye, Moon, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { getAppSettings, saveAppSettings } from '../../lib/storage';
import { applyVisualTheme } from '../../lib/theme';
import { emitSettingsUpdated } from '../../lib/events';

interface Props {
  settings: AppSettings;
  onChange: (field: string, value: unknown) => void;
}

export default function VisualPreferencesConfig({ settings, onChange }: Props) {
  const prefs: VisualPreferences = {
    reducedMotion: false,
    premiumVisualMode: true,
    darkMode: false,
    ...(settings.visualPreferences ?? {}),
  };

  const togglePref = (key: keyof VisualPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    onChange('visualPreferences', next);

    const current = getAppSettings();
    const updated = { ...current, visualPreferences: next };
    saveAppSettings(updated);
    applyVisualTheme(updated);
    emitSettingsUpdated();
  };

  const PreferenceToggle = ({ label, icon: Icon, stateKey }: { label: string; icon: React.ElementType; stateKey: keyof VisualPreferences }) => {
    const isActive = prefs[stateKey];
    return (
      <div className="flex items-center justify-between border-b border-gray-50 p-3 last:border-0 dark:border-white/8">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${isActive ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300' : 'vivo-inset-on-pattern text-gray-400 dark:text-slate-500'}`}>
            <Icon size={14} />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-slate-200">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => togglePref(stateKey)}
          aria-pressed={isActive}
          className={`flex h-5 w-10 cursor-pointer items-center rounded-full px-0.5 transition-colors ${isActive ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'}`}
        >
          <motion.div
            initial={false}
            animate={{ x: isActive ? 20 : 0 }}
            className="h-4 w-4 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-[2rem] vivo-surface-on-pattern p-2">
      <PreferenceToggle label="Modo oscuro" icon={Moon} stateKey="darkMode" />
      <PreferenceToggle label="Modo Visual Premium" icon={Eye} stateKey="premiumVisualMode" />
      <PreferenceToggle label="Reducir Animaciones" icon={Zap} stateKey="reducedMotion" />
      <div className="px-3.5 py-3 text-[0.68rem] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
        El modo oscuro adapta fondos, tarjetas y textos en toda la app. Registro conserva el wallpaper del equipo como fondo inmersivo.
      </div>
    </div>
  );
}
