import React, { useMemo } from 'react';
import { getDevices, getSales, getAppSettings, getChallenges, corruptedKeys, getInventoryMovements, getPhoneModels } from '../../lib/storage';
import { getAppToday, parseLocalDateKey } from '../../lib/date';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DataHealth() {
  const issues = useMemo(() => {
    const devices = getDevices();
    const sales = getSales();
    const inventoryMovements = getInventoryMovements();
    const settings = getAppSettings();
    const challenges = getChallenges();
    const phoneModels = getPhoneModels();
    
    const foundIssues: { type: 'warning' | 'error', msg: string }[] = [];
    
    // Check Storage Corruption
    if (corruptedKeys.size > 0) {
      corruptedKeys.forEach(key => {
        foundIssues.push({ type: 'error', msg: `Storage corrupto detectado en: ${key}. Los datos fueron resguardados en un backup y bloqueados.` });
      });
    }

    // Check devices
    const deviceIds = new Set<string>();
    devices.forEach(d => {
      if (deviceIds.has(d.id)) {
        foundIssues.push({ type: 'error', msg: `Dispositivo duplicado detectado: '${d.id}'.` });
      }
      deviceIds.add(d.id);

      if (d.isActive) {
        if (!d.imagePath && (!d.carouselImages || d.carouselImages.length === 0)) {
          foundIssues.push({ type: 'warning', msg: `Dispositivo '${d.name}' no tiene imágenes configuradas.` });
        }
        if ((d.stock || 0) <= 0) {
          foundIssues.push({ type: 'warning', msg: `Dispositivo '${d.name}' está sin stock.` });
        }
        if ((d.stock || 0) < 0) {
          foundIssues.push({ type: 'error', msg: `Dispositivo '${d.name}' tiene stock negativo.` });
        }
      }
    });

    // Check sales
    sales.forEach(s => {
      if (!s.quantity) {
         foundIssues.push({ type: 'error', msg: `Venta sin quantity detectada (ID: ${s.id.slice(0,6)}...).` });
      }
      if (!devices.find(d => d.id === s.deviceId)) {
        foundIssues.push({ type: 'warning', msg: `Venta huérfana detectada: dispositivo '${s.deviceNameSnapshot}' ya no existe.` });
      }
      if (!s.deviceImageSnapshot || !s.deviceNameSnapshot) {
        foundIssues.push({ type: 'error', msg: `Venta sin snapshot detectada (ID: ${s.id.slice(0,6)}...).` });
      }
      if (!s.modelId || !s.variantId) {
        foundIssues.push({ type: 'warning', msg: `Venta sin identidad completa de modelo/variante (ID: ${s.id.slice(0,6)}...).` });
      }
    });

    inventoryMovements.forEach(m => {
      if ((m.type === 'sale' || m.type === 'sale_deleted') && !m.relatedSaleId) {
        foundIssues.push({ type: 'warning', msg: `Movimiento de venta sin relación a venta detectado (ID: ${m.id.slice(0,6)}...).` });
      }

      if (m.modelId) {
        const model = phoneModels.find(pm => pm.id === m.modelId);
        if (!model) {
          foundIssues.push({ type: 'warning', msg: `Movimiento apunta a un modelo inexistente: '${m.deviceNameSnapshot}'.` });
        } else if (m.variantId && !model.variants.some(v => v.id === m.variantId)) {
          foundIssues.push({ type: 'warning', msg: `Movimiento apunta a una variante inexistente: '${m.deviceNameSnapshot}'.` });
        }
      }

      if (m.newStock < 0 || m.previousStock < 0) {
        foundIssues.push({ type: 'error', msg: `Movimiento con stock negativo detectado: '${m.deviceNameSnapshot}'.` });
      }
    });
    
    // Check challenges
    const now = parseLocalDateKey(getAppToday()).getTime();
    challenges.forEach(c => {
       if (c.status === 'active' && c.expiresAt < now) {
         foundIssues.push({ type: 'warning', msg: `Reto expirado sigue activo: '${c.title}'.` });
       }
    });

    // Check Settings
    if (!settings.workSchedule || settings.workSchedule.workingDays.length === 0) {
      foundIssues.push({ type: 'error', msg: `No hay días laborales configurados.` });
    }

    return foundIssues;
  }, []);

  return (
    <div className="vivo-panel p-4 shadow-sm mb-4">
      <h3 className="text-[0.65rem] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Activity size={14} className="text-gray-400 dark:text-slate-500" />
        Salud de Datos
      </h3>
      
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold">Todo parece estar en orden. Datos saludables.</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar pr-1">
          {issues.slice(0, 50).map((issue, i) => (
            <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium ${issue.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{issue.msg}</span>
            </div>
          ))}
          {issues.length > 50 && (
            <div className="text-center text-xs font-medium text-gray-500 dark:text-slate-400 pt-2">
              + {issues.length - 50} problemas más omitidos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
