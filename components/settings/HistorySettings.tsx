'use client';

import React, { useState } from 'react';
import { FileText, Clipboard, Download, Trash2, Smartphone, AlertTriangle } from 'lucide-react';
import { Movement, Sale } from '@/types/sale';

interface HistorySettingsProps {
  theme: 'light' | 'dark';
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>;
}

export default function HistorySettings({
  theme,
  sales,
  setSales,
  setMovements
}: HistorySettingsProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Compute total sales pieces and total commissions accumulated
  const totalPieces = sales.length;
  const totalEarned = sales.reduce((sum, s) => sum + s.amountEarned, 0);

  // CSV Export Logic
  const handleExportCSV = () => {
    if (sales.length === 0) return;
    
    const headers = ['ID de Venta', 'Fecha', 'ID Dispositivo', 'Modelo', 'Color', 'Comisión (MXN)', 'Creado Unix'];
    const rows = sales.map(s => [
      s.id,
      s.date,
      s.deviceId,
      s.deviceName,
      s.deviceColor || 'Sin Color',
      s.amountEarned,
      s.createdAt
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','), 
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `vivo-promotor-ventas-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (sales.length === 0) return;
    
    let summaryText = `RESUMEN DE VENTAS - VIVO PROMOTOR\n`;
    summaryText += `Fecha de reporte: ${new Date().toLocaleDateString()}\n`;
    summaryText += `Total Unidades Vendidas: ${totalPieces} uds\n`;
    summaryText += `Comisión Total Acumulada: $${totalEarned.toLocaleString('es-MX')} MXN\n`;
    summaryText += `--------------------------------------\n`;
    
    // Group by device name
    const grouped: Record<string, number> = {};
    sales.forEach(s => {
      grouped[s.deviceName] = (grouped[s.deviceName] || 0) + 1;
    });

    Object.entries(grouped).forEach(([model, count]) => {
      summaryText += `- ${model}: ${count} unidades\n`;
    });

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Safe reset double confirmation
  const handleClearHistory = () => {
    setSales([]);
    setMovements([]);
    setShowClearConfirm(false);
  };

  // Sort sales descending by timestamp
  const sortedSales = [...sales].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
          Historial de Registros
        </span>
        <span className="text-[8px] font-mono uppercase text-neutral-400 font-bold">
          {totalPieces} ventas
        </span>
      </div>

      {/* KPI Cards summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <span className="block text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-1">
            Total Ahorrado
          </span>
          <span className="text-lg font-black text-emerald-500 font-mono leading-none">
            ${totalEarned.toLocaleString('es-MX')} <span className="text-[8px] font-bold text-neutral-400 font-sans">MXN</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <span className="block text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-1">
            Piezas Vendidas
          </span>
          <span className="text-lg font-black text-neutral-800 dark:text-neutral-200 font-mono leading-none">
            {totalPieces} <span className="text-[8px] font-bold text-neutral-400 font-sans">uds</span>
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {sales.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleCopySummary}
            className={`flex-1 py-2 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 ${
              copySuccess 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : theme === 'light' 
                  ? 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100' 
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            {copySuccess ? 'Copiado!' : 'Copiar Resumen'}
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex-1 py-2 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 ${
              theme === 'light' 
                ? 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100' 
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Descargar CSV
          </button>
        </div>
      )}

      {/* History scroll list */}
      <div className="max-h-[170px] overflow-y-auto scrollbar-none space-y-1.5 pr-0.5">
        {sales.length === 0 ? (
          <div className="py-8 text-center bg-black/2 dark:bg-white/2 rounded-2xl border border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center p-4">
            <FileText className="w-8 h-8 text-neutral-400 mb-2 opacity-55" />
            <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 font-mono">Sin registros</span>
            <p className="text-[9px] text-neutral-500 mt-1 max-w-[200px] leading-tight">Completa una venta desde Registrar Venta para llenar la base de datos.</p>
          </div>
        ) : (
          sortedSales.map((sale) => (
            <div 
              key={sale.id}
              className="p-2.5 rounded-xl bg-black/2 dark:bg-white/2 border border-black/5 dark:border-white/5 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <div className="min-w-0">
                  <span className={`text-[10px] font-black block truncate leading-none ${
                    theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'
                  }`}>
                    {sale.deviceName}
                  </span>
                  <span className="text-[7.5px] text-neutral-450 uppercase font-mono tracking-wider">
                    {sale.deviceColor || 'General'} • {sale.date}
                  </span>
                </div>
              </div>
              <span className="text-emerald-500 font-black font-mono text-[10px] shrink-0">
                +${sale.amountEarned}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Safe Reset Panel */}
      {sales.length > 0 && (
        <div className="pt-2 border-t border-black/5 dark:border-white/5">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-2 text-[9px] font-black tracking-widest uppercase text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar Historial Completo
            </button>
          ) : (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="block text-[9.5px] font-black text-red-500 uppercase font-mono leading-none mb-1">¿Estás seguro?</span>
                  <p className="text-[9px] text-red-400 leading-tight">Esta acción eliminará de forma permanente todas las ventas e ingresos del Puerquito. No se puede deshacer.</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-neutral-250 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-300 dark:hover:bg-neutral-750 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
