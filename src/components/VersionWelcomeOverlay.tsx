import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { getCurrentReleaseNotes, APP_VERSION } from '../lib/releaseNotes';

interface VersionWelcomeOverlayProps {
  onDismiss: () => void;
  onViewHistory: () => void;
}

export function VersionWelcomeOverlay({ onDismiss, onViewHistory }: VersionWelcomeOverlayProps) {
  const release = getCurrentReleaseNotes();

  if (!release) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] rounded-[2rem] border border-white/15 bg-[#101317]/95 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden"
      >
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute -top-8 right-6 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-400/15 border border-emerald-300/20 flex items-center justify-center text-emerald-300">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-emerald-300/90">
                Bienvenido a la versión {APP_VERSION}
              </p>
              <h2 className="text-xl font-black tracking-tight leading-tight mt-0.5">{release.title}</h2>
            </div>
          </div>
          <p className="text-sm text-white/72 leading-relaxed font-medium">{release.summary}</p>
        </div>

        <div className="px-6 pb-2 max-h-[42vh] overflow-y-auto no-scrollbar">
          <ul className="space-y-3">
            {release.highlights.map((item) => (
              <li key={item} className="flex gap-2.5 text-[0.86rem] leading-snug text-white/85">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 pt-3 flex flex-col gap-2 border-t border-white/10 bg-black/20">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full h-12 rounded-2xl bg-emerald-400 text-black font-black uppercase tracking-widest text-[0.72rem] active:scale-[0.98] transition-transform"
          >
            Empezar a usar la app
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="w-full h-11 rounded-2xl border border-white/12 text-white/85 font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            Ver historial de versiones
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
