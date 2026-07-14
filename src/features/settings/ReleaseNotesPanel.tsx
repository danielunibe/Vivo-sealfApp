import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  APP_VERSION,
  getReleaseHistory,
  hasUnseenReleaseNotes,
  markReleaseNotesSeen,
  ReleaseNoteEntry,
} from '../../lib/releaseNotes';

const formatReleaseDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

function ReleaseCard({ entry, isCurrent }: { entry: ReleaseNoteEntry; isCurrent: boolean }) {
  return (
    <article className={`rounded-[1.4rem] border p-4 shadow-sm ${isCurrent ? 'border-emerald-200/80 bg-emerald-50/45 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'vivo-surface-on-pattern'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-400">
            Versión {entry.version}
            {isCurrent && <span className="ml-2 text-emerald-600">Actual</span>}
          </p>
          <h3 className="text-[0.95rem] font-black text-slate-800 dark:text-slate-100 leading-tight mt-1">{entry.title}</h3>
        </div>
        <span className="text-[0.58rem] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          {formatReleaseDate(entry.date)}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-3">{entry.summary}</p>
      <ul className="space-y-2">
        {entry.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2 text-[0.82rem] leading-snug text-slate-700 dark:text-slate-300">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ReleaseNotesPanel() {
  const [history, setHistory] = useState<ReleaseNoteEntry[]>([]);

  useEffect(() => {
    setHistory(getReleaseHistory());
    if (hasUnseenReleaseNotes()) {
      markReleaseNotesSeen();
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="rounded-[1.5rem] vivo-surface-on-pattern p-4">
        <div className="flex items-start gap-3">
          <div className="vivo-inset-on-pattern p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Historial de actualizaciones</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Aquí puedes revisar qué cambió en cada versión de Vivo Promotor. La versión instalada ahora es <strong>{APP_VERSION}</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((entry) => (
          <div key={entry.version}>
            <ReleaseCard entry={entry} isCurrent={entry.version === APP_VERSION} />
          </div>
        ))}
      </div>
    </div>
  );
}
