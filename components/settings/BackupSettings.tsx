import React, { useState, useRef } from 'react';
import { Download, Upload, FileDown, ShieldAlert, CheckCircle2, AlertTriangle, HardDriveDownload, DatabaseZap } from 'lucide-react';
import { 
  createBackupFromCurrentStorage,
  getStorageStatusSummary,
  persistBackupExportRecord,
  restoreBackupToStorage,
  saveBackupFileToDevice,
  supportsFileSystemAccessApi,
  validateBackup,
  exportSalesCsv,
  type VivoPromotorBackup,
  type RestoreMode,
} from '@/lib/backup';
import { getPersistentStorageDiagnostics } from '@/lib/persistentStorage';

interface BackupSettingsProps {
  theme: 'light' | 'dark';
  sales: unknown[];
  movements: unknown[];
  devices: unknown[];
}

type Status = 'idle' | 'exporting' | 'importing' | 'validating' | 'ready' | 'error';

export default function BackupSettings({ theme, sales, movements, devices }: BackupSettingsProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);
  const [pendingBackup, setPendingBackup] = useState<VivoPromotorBackup | null>(null);
  const [storageLabel, setStorageLabel] = useState('Verificando...');
  const [lastExportLabel, setLastExportLabel] = useState('Aún no registrado');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const salesCount = Array.isArray(sales) ? sales.length : 0;
  const movementsCount = Array.isArray(movements) ? movements.length : 0;
  const devicesCount = Array.isArray(devices) ? devices.length : 0;

  const handleStateReset = () => {
    setStatus('idle');
    setMessage(null);
    setWarnings(null);
    setPendingBackup(null);
  };

  React.useEffect(() => {
    const loadStorageMeta = async () => {
      const [summary] = await Promise.all([
        getStorageStatusSummary(),
      ]);
      setStorageLabel(summary.modeLabel);
      setLastExportLabel(summary.lastExportLabel);
    };

    void loadStorageMeta();
  }, []);

  const handleExportBackup = async () => {
    try {
      setStatus('exporting');
      setMessage(null);
      setWarnings(null);

      const backup = await createBackupFromCurrentStorage();
      const date = new Date().toISOString().slice(0, 10);
      const filename = `vivo-promotor-backup-${date}.json`;

      if (typeof window === 'undefined') {
        throw new Error('No se puede exportar en entorno SSR.');
      }

      await persistBackupExportRecord(
        await saveBackupFileToDevice(filename, JSON.stringify(backup, null, 2))
      );
      const summary = await getStorageStatusSummary();
      setStorageLabel(summary.modeLabel);
      setLastExportLabel(summary.lastExportLabel);

      setMessage('Respaldo exportado correctamente al dispositivo.');
      setStatus('ready');
    } catch (err) {
      setMessage('No se pudo exportar el respaldo.');
      setStatus('error');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('validating');
      setMessage(null);
      setWarnings(null);
      setPendingBackup(null);

      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = validateBackup(parsed);

      if (!result.valid) {
        setMessage(result.error || 'Archivo inválido.');
        setStatus('error');
        return;
      }

      setPendingBackup(parsed as VivoPromotorBackup);
      setWarnings(result.warnings || null);
      setMessage(result.summary || null);
      setStatus('ready');
    } catch {
      setMessage('No se pudo leer el archivo. Asegúrate de seleccionar un JSON válido.');
      setStatus('error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = async (mode: RestoreMode) => {
    if (!pendingBackup) return;

    const confirmed = window.confirm(
      'Esta acción reemplazará los datos actuales de Vivo Promotor en este navegador. Exporta un respaldo antes de continuar.\n\n¿Deseas continuar?'
    );

    if (!confirmed) {
      handleStateReset();
      return;
    }

    try {
      setStatus('importing');
      setMessage('Restaurando datos...');
      setWarnings(null);

      const result = await restoreBackupToStorage(pendingBackup, mode);

      if (result.error) {
        setMessage(result.error);
        setStatus('error');
        return;
      }

      if (result.warnings.length > 0) {
        setWarnings(result.warnings);
      }

      setMessage('Datos restaurados correctamente. La app se recargará para reflejar el estado restaurado.');
      setStatus('ready');
      setPendingBackup(null);
      window.location.reload();
    } catch {
      setMessage('Ocurrió un error inesperado durante la restauración.');
      setStatus('error');
    }
  };

  const handleExportCsv = () => {
    try {
      setMessage(null);
      setWarnings(null);

      if (!sales || sales.length === 0) {
        setMessage('No hay ventas para exportar.');
        setStatus('ready');
        return;
      }

      exportSalesCsv(sales);
      setMessage('Exportación CSV iniciada.');
      setStatus('ready');
    } catch {
      setMessage('No se pudo exportar el CSV.');
      setStatus('error');
    }
  };

  const handleVerifyStorage = async () => {
    setStatus('validating');
    setWarnings(null);

    try {
      const diagnostics = await getPersistentStorageDiagnostics();
      const summary = await getStorageStatusSummary();
      setStorageLabel(summary.modeLabel);
      setLastExportLabel(summary.lastExportLabel);
      setMessage(
        `${diagnostics.salesCount} ventas · ${diagnostics.movementsCount} movimientos · ${diagnostics.devicesCount} dispositivos · migración ${diagnostics.migrationDone ? 'completa' : 'pendiente'}`
      );
      setStatus('ready');
    } catch {
      setMessage('No se pudo verificar el almacenamiento local.');
      setStatus('error');
    }
  };

  const isBusy = status === 'exporting' || status === 'importing' || status === 'validating';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
        Datos y respaldo
      </span>
      <p className="text-[9.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
        Guarda una copia de tus ventas en este dispositivo. Tus datos viven localmente; exporta un respaldo antes de borrar caché, cambiar de celular o reinstalar.
      </p>

      <div className="grid grid-cols-1 gap-3">
        <div className={`p-3 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-neutral-200/70' : 'bg-white/5 border-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                Datos actuales
              </p>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {salesCount} ventas · {movementsCount} movimientos · {devicesCount} dispositivos
              </p>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-1">
                Almacenamiento: {storageLabel}
              </p>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Última exportación: {lastExportLabel}
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-[var(--neo-text)] opacity-70" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={() => void handleExportBackup()}
            disabled={isBusy}
            className="w-full py-3 rounded-xl bg-[var(--neo-accent)] disabled:opacity-60 disabled:cursor-not-allowed text-[var(--neo-accent-contrast)] text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar respaldo JSON
          </button>

          <button
            type="button"
            onClick={() => void handleExportBackup()}
            disabled={isBusy}
            className="w-full py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            {supportsFileSystemAccessApi() ? 'Guardar respaldo en dispositivo' : 'Descargar respaldo al dispositivo'}
          </button>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="flex-1 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar respaldo
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isBusy}
              className="flex-1 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              Exportar ventas CSV
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleVerifyStorage()}
            disabled={isBusy}
            className="w-full py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <DatabaseZap className="w-3.5 h-3.5" />
            Verificar almacenamiento local
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl border text-[10px] font-medium leading-snug flex items-center gap-2 animate-in fade-in duration-200 ${
          status === 'error'
            ? 'bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400'
            : 'bg-neutral-100 dark:bg-white/5 border-neutral-200/70 dark:border-white/5 text-neutral-700 dark:text-neutral-200'
        }`}>
          {status === 'error' ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 text-[10px] font-medium leading-snug space-y-1 animate-in fade-in duration-200">
          {warnings.map((warning, index) => (
            <p key={`${warning}-${index}`}>• {warning}</p>
          ))}
        </div>
      )}

      {pendingBackup && status === 'ready' && (
        <div className={`p-3 rounded-2xl border space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          theme === 'light' ? 'bg-white border-neutral-200/70' : 'bg-white/5 border-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--neo-text)]">
                Respaldo listo para restaurar
              </p>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRestore('merge')}
              className="flex-1 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[var(--neo-text)] text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
            >
              Fusionar datos
            </button>
            <button
              type="button"
              onClick={() => handleRestore('replace')}
              className="flex-1 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
            >
              Reemplazar datos
            </button>
          </div>
          <button
            type="button"
            onClick={handleStateReset}
            className="w-full py-2 rounded-xl text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
