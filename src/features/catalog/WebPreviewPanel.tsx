import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, AlertCircle, WifiOff } from 'lucide-react';
import { PhoneModel } from '../../types';
import { getWebArchiveRecord } from '../../lib/localMediaStore';
import { isValidHttpsUrl } from '../../lib/urlValidation';
import { emitImmersiveWebMode } from '../../lib/events';
import { getOfflineFallbackHtmlForModel } from '../../lib/offlineFallbackHtml';

interface WebPreviewPanelProps {
  model: PhoneModel;
  onClose: () => void;
}

export function WebPreviewPanel({ model, onClose }: WebPreviewPanelProps) {
  const [archive, setArchive] = useState<Awaited<ReturnType<typeof getWebArchiveRecord>>>();

  const hasOfficialUrl = typeof model.officialUrl === 'string' && model.officialUrl.length > 0;
  const hasValidUrl = hasOfficialUrl && isValidHttpsUrl(model.officialUrl as string);

  React.useEffect(() => {
    emitImmersiveWebMode(true);
    return () => emitImmersiveWebMode(false);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    getWebArchiveRecord(model.id)
      .then((record) => {
        if (mounted) setArchive(record);
      })
      .catch(() => {
        if (mounted) setArchive(undefined);
      });
    return () => {
      mounted = false;
    };
  }, [model.id]);

  const handleOpenExternal = () => {
    if (hasValidUrl) {
      window.open(model.officialUrl as string, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfigureUrl = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'settings', settingsSection: 'productos' } }));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[220] flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top Action Bar */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+12px)] inset-x-4 z-30 flex items-center justify-between pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-black/85 active:scale-95 transition-all"
          aria-label="Salir del modo web"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          Salir
        </button>

        {hasValidUrl && (
          <button
            onClick={handleOpenExternal}
            className="pointer-events-auto flex items-center gap-1.5 bg-sky-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-sky-700 active:scale-95 transition-all"
            aria-label="Ver web en línea"
          >
            <Globe size={15} />
            Ver en Línea
          </button>
        )}
      </div>

      <div className="flex-1 relative w-full h-full overflow-hidden bg-white pb-[env(safe-area-inset-bottom)]">
        {hasValidUrl ? (
          <iframe
            srcDoc={archive?.offlineHtml || getOfflineFallbackHtmlForModel(model)}
            className="w-full h-full border-none bg-white"
            title={`Copia local ${model.name}`}
          />
        ) : hasOfficialUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">La URL configurada es inválida</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs">
              Corrígelo en Productos y modelos para abrir la web oficial desde Catálogo.
            </p>
            <button
              onClick={handleConfigureUrl}
              className="mt-6 bg-[#343A43] text-white px-6 py-3 rounded-full font-bold shadow-md active:scale-95 transition-all"
            >
              Configurar URL oficial
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="bg-gray-200 text-gray-400 p-4 rounded-full mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Sin URL configurada</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs">
              Configúralo en Productos y modelos para abrir la web oficial desde Catálogo.
            </p>
            <button
              onClick={handleConfigureUrl}
              className="mt-6 bg-[#343A43] text-white px-6 py-3 rounded-full font-bold shadow-md active:scale-95 transition-all"
            >
              Configurar URL oficial
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
