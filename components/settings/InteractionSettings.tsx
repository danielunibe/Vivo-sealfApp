'use client';

import React from 'react';
import { Gauge, Info, Play, Sparkles, Vibrate, Volume2, VolumeX } from 'lucide-react';
import { APP_BUILD_CHANNEL, APP_RELEASE_NOTES, APP_VERSION_NAME } from '@/lib/appVersion';
import {
  getInteractionPreferences,
  saveInteractionPreference,
  type FeedbackIntensity,
  type InteractionPreferences,
} from '@/lib/interactionPreferences';
import { triggerFeedback } from '@/lib/nativeFeedback';

interface InteractionSettingsProps {
  theme: 'light' | 'dark';
}

const intensityLabels: Array<{ value: FeedbackIntensity; label: string }> = [
  { value: 'soft', label: 'Suave' },
  { value: 'normal', label: 'Normal' },
  { value: 'strong', label: 'Fuerte' },
];

export default function InteractionSettings({ theme }: InteractionSettingsProps) {
  const [preferences, setPreferences] = React.useState<InteractionPreferences>(() => getInteractionPreferences());

  const updatePreference = <K extends keyof InteractionPreferences>(key: K, value: InteractionPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    saveInteractionPreference(key, value);
    void triggerFeedback(key === 'soundEnabled' && value === true ? 'success' : 'selection');
  };

  const cardClass = theme === 'light'
    ? 'neo-card text-[var(--neo-text)]'
    : 'neo-card text-[var(--neo-text)]';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-accent)]">
          Interaccion y version
        </span>
        <p className="mt-1 text-[9.5px] leading-snug text-[var(--neo-muted)]">
          Ajusta el feedback sensorial sin hacer la app mas pesada. El sonido inicia apagado para no incomodar.
        </p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {preferences.soundEnabled ? <Volume2 className="h-4 w-4 text-[var(--neo-accent)]" /> : <VolumeX className="h-4 w-4 text-[var(--neo-muted)]" />}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider">Sonidos sutiles</p>
              <p className="text-[9px] leading-snug text-[var(--neo-muted)]">Microtonos breves. Se desbloquean al tocar un boton.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
            className={`neo-toggle ${preferences.soundEnabled ? 'neo-toggle-on' : ''}`}
            aria-pressed={preferences.soundEnabled}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Vibrate className="h-4 w-4 text-[var(--neo-accent)]" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider">Vibracion Android</p>
              <p className="text-[9px] leading-snug text-[var(--neo-muted)]">Pulso tactil ligero para sentirse mas nativo en telefono.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updatePreference('hapticsEnabled', !preferences.hapticsEnabled)}
            className={`neo-toggle ${preferences.hapticsEnabled ? 'neo-toggle-on' : ''}`}
            aria-pressed={preferences.hapticsEnabled}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Gauge className="h-4 w-4 text-[var(--neo-accent)]" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider">Reducir animaciones</p>
              <p className="text-[9px] leading-snug text-[var(--neo-muted)]">Util si tu celular se siente lento o se calienta.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updatePreference('reducedMotion', !preferences.reducedMotion)}
            className={`neo-toggle ${preferences.reducedMotion ? 'neo-toggle-on' : ''}`}
            aria-pressed={preferences.reducedMotion}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[var(--neo-accent)]" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider">Intro de marca</p>
              <p className="text-[9px] leading-snug text-[var(--neo-muted)]">Permite mostrar u omitir el video inicial.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updatePreference('introEnabled', !preferences.introEnabled)}
            className={`neo-toggle ${preferences.introEnabled ? 'neo-toggle-on' : ''}`}
            aria-pressed={preferences.introEnabled}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-muted)]">Intensidad</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {intensityLabels.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => updatePreference('feedbackIntensity', option.value)}
              className={`neo-button py-2 text-[9px] font-black uppercase tracking-wider ${
                preferences.feedbackIntensity === option.value ? 'neo-button-pressed text-[var(--neo-accent)]' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!preferences.soundEnabled) {
              updatePreference('soundEnabled', true);
            }
            void triggerFeedback('sale-confirm');
          }}
          className="neo-button neo-button-primary mt-3 flex w-full items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest"
        >
          <Play className="h-3.5 w-3.5" />
          Probar sonido
        </button>
      </div>

      <div className={cardClass}>
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neo-accent)]" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider">{APP_VERSION_NAME}</p>
            <p className="mt-1 text-[9px] leading-snug text-[var(--neo-muted)]">
              Canal: {APP_BUILD_CHANNEL}. Version de trabajo para APK debug y pruebas controladas.
            </p>
            <ul className="mt-2 space-y-1">
              {APP_RELEASE_NOTES.map(note => (
                <li key={note} className="text-[9px] leading-snug text-[var(--neo-muted)]">- {note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
