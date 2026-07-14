import React, { useCallback, useEffect, useState } from 'react';
import { DownloadCloud, Globe, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { PhoneModel, WebArchiveRecord } from '../../types';
import { getActivePhoneModels } from '../../lib/storage';
import { getAllWebArchiveRecords } from '../../lib/localMediaStore';
import { onWebArchivesUpdated } from '../../lib/events';
import {
  DEFAULT_WEB_SYNC_HOUR,
  getLastWebSyncAt,
  getWebSyncHour,
  isWifiConnection,
  setWebSyncHour,
  syncAllModelWebArchives,
} from '../../lib/webArchiveSync';
import { isValidHttpsUrl } from '../../lib/urlValidation';
import { toast } from '../../lib/toast';

const statusLabel = (status?: WebArchiveRecord['status']) => {
  switch (status) {
    case 'cache_completo':
      return 'Descargada';
    case 'cache_parcial':
      return 'Parcial';
    case 'bloqueado':
      return 'Bloqueada';
    case 'sin_cache':
      return 'Sin copia';
    default:
      return 'Pendiente';
  }
};

const statusClass = (status?: WebArchiveRecord['status']) => {
  switch (status) {
    case 'cache_completo':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
    case 'cache_parcial':
      return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
    case 'bloqueado':
      return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-[var(--neo-surface-soft)] dark:text-slate-400 dark:border-white/10';
  }
};

const formatBytes = (bytes: number) => {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return 'Aún no se ha sincronizado';
  return new Date(timestamp).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type ModelCacheRow = {
  model: PhoneModel;
  archive?: WebArchiveRecord;
  hasValidUrl: boolean;
};

export default function WebCacheSettingsPanel() {
  const [rows, setRows] = useState<ModelCacheRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncHour, setSyncHourState] = useState(getWebSyncHour());
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(getLastWebSyncAt());
  const [onWifi, setOnWifi] = useState(isWifiConnection());

  const refreshRows = useCallback(async () => {
    const models = getActivePhoneModels();
    const archives = await getAllWebArchiveRecords().catch(() => [] as WebArchiveRecord[]);
    const archiveMap = new Map(archives.map((record) => [record.modelId, record]));

    setRows(models.map((model) => ({
      model,
      archive: archiveMap.get(model.id),
      hasValidUrl: typeof model.officialUrl === 'string'
        && model.officialUrl.length > 0
        && isValidHttpsUrl(model.officialUrl),
    })));
    setLastSyncAt(getLastWebSyncAt());
    setOnWifi(isWifiConnection());
  }, []);

  useEffect(() => {
    void refreshRows();
    return onWebArchivesUpdated(() => {
      void refreshRows();
    });
  }, [refreshRows]);

  useEffect(() => {
    const updateNetwork = () => setOnWifi(isWifiConnection());
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  const downloadedCount = rows.filter((row) =>
    row.archive?.status === 'cache_completo' || row.archive?.status === 'cache_parcial'
  ).length;

  const handleManualSync = async () => {
    if (!onWifi) {
      toast('Conéctate a WiFi para descargar las webs oficiales.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const summary = await syncAllModelWebArchives({ force: true });
      if (summary.reason === 'no_wifi') {
        toast('Se requiere WiFi para descargar las webs.', 'error');
        return;
      }
      toast(`Webs actualizadas: ${summary.updated} de ${summary.attempted}`, 'success');
      await refreshRows();
    } catch {
      toast('No se pudo completar la descarga de webs.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncHourChange = (value: string) => {
    const hour = Number.parseInt(value.split(':')[0] ?? '', 10);
    if (!Number.isFinite(hour)) return;
    setWebSyncHour(hour);
    setSyncHourState(getWebSyncHour());
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="vivo-panel rounded-[1.5rem] p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="bg-sky-50 dark:bg-sky-500/10 p-2.5 rounded-xl">
            <Globe className="w-5 h-5 text-sky-600 dark:text-sky-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Webs oficiales en el dispositivo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              La app descarga automáticamente cada día en WiFi. Aquí puedes revisar qué modelos ya tienen copia local y forzar una actualización manual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl vivo-subtle border border-slate-100 dark:border-white/10 p-3">
            <p className="text-[0.58rem] font-bold uppercase tracking-widest text-slate-400">Descargadas</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{downloadedCount}/{rows.length}</p>
          </div>
          <div className="rounded-xl vivo-subtle border border-slate-100 dark:border-white/10 p-3">
            <p className="text-[0.58rem] font-bold uppercase tracking-widest text-slate-400">Última sync</p>
            <p className="text-[0.72rem] font-bold text-slate-700 dark:text-slate-200 mt-1 leading-snug">{formatDateTime(lastSyncAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-white/10 vivo-subtle px-3 py-2.5">
          {onWifi ? <Wifi size={16} className="text-emerald-600" /> : <WifiOff size={16} className="text-amber-600" />}
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {onWifi ? 'WiFi disponible: la descarga automática está habilitada.' : 'Sin WiFi: la descarga automática se pausa.'}
          </span>
        </div>

        <div>
          <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Hora diaria de actualización
          </label>
          <input
            type="time"
            value={`${String(syncHour).padStart(2, '0')}:00`}
            onChange={(event) => handleSyncHourChange(event.target.value)}
            className="w-full vivo-subtle p-2.5 rounded-xl text-sm font-black outline-none"
          />
          <p className="text-[0.62rem] text-slate-400 font-medium mt-1">
            Por defecto {DEFAULT_WEB_SYNC_HOUR}:00. Solo se ejecuta una vez al día con WiFi activo.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white py-3 rounded-2xl font-black text-sm shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
          {isSyncing ? 'Descargando webs...' : 'Descargar webs ahora'}
        </button>
      </div>

      <div className="vivo-panel rounded-[1.5rem] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
          <h4 className="text-[0.72rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Modelos</h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {rows.map(({ model, archive, hasValidUrl }) => (
            <div key={model.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{model.name}</p>
                <p className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                  {hasValidUrl ? (archive ? formatBytes(archive.bytesUsed) : 'Sin copia local') : 'Sin URL válida'}
                </p>
              </div>
              <span className={`shrink-0 text-[0.58rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusClass(archive?.status)}`}>
                {hasValidUrl ? statusLabel(archive?.status) : 'Sin URL'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
