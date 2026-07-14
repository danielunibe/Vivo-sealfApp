import React from 'react';
import { motion } from 'motion/react';
import { Calendar, RefreshCw, Target, Package, Sparkles } from 'lucide-react';
import { AppSettings, DemoModeConfig } from '../../types';
import {
  DEMO_SALES_INTENSITY_OPTIONS,
  DEMO_STOCK_LEVEL_OPTIONS,
  resolveDemoModeConfig,
} from '../../lib/demoModeConfig';

interface Props {
  settings: Pick<AppSettings, 'useDemoDate' | 'demoModeConfig'>;
  onChange: (field: string, value: unknown) => void;
  onRegenerate?: () => void;
}

export default function DemoModeConfigPanel({ settings, onChange, onRegenerate }: Props) {
  const config = resolveDemoModeConfig(settings.demoModeConfig);

  const patchConfig = (patch: Partial<DemoModeConfig>) => {
    onChange('demoModeConfig', { ...config, ...patch });
  };

  const ToggleRow = ({
    label,
    description,
    checked,
    onToggle,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between border-b border-gray-50 p-3 last:border-0 dark:border-white/8">
      <div className="min-w-0 pr-3">
        <span className="text-xs font-bold text-gray-700 dark:text-slate-200">{label}</span>
        {description ? (
          <p className="mt-0.5 text-[0.65rem] font-medium leading-relaxed text-gray-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={`flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}
      >
        <motion.div
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          className="h-4 w-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.62rem] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );

  const inputClass =
    'vivo-input w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 dark:text-slate-100';

  return (
    <div className="flex flex-col gap-3">
      <div className="vivo-panel rounded-[2rem] p-1.5 shadow-sm">
        <ToggleRow
          label="Modo demo"
          description="Fija la fecha de la app y carga un escenario con ventas, stock, retos y perfil de demostración."
          checked={settings.useDemoDate}
          onToggle={() => onChange('useDemoDate', !settings.useDemoDate)}
        />
      </div>

      <div className="vivo-panel rounded-[2rem] p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800 dark:text-slate-100">Escenario demo</h3>
            <p className="text-[0.65rem] font-medium text-gray-500 dark:text-slate-400">
              Personaliza el perfil, metas e historial antes de activar o regenerar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Fecha del escenario">
            <input
              type="date"
              className={inputClass}
              value={config.anchorDate}
              onChange={(e) => patchConfig({ anchorDate: e.target.value })}
            />
          </Field>

          <Field label="Ventas registradas hoy">
            <input
              type="number"
              min={0}
              max={8}
              className={inputClass}
              value={config.todaySalesCount}
              onChange={(e) => patchConfig({ todaySalesCount: Math.max(0, Math.min(8, Number(e.target.value) || 0)) })}
            />
          </Field>

          <Field label="Nombre del promotor">
            <input
              type="text"
              className={inputClass}
              value={config.promoterName}
              onChange={(e) => patchConfig({ promoterName: e.target.value })}
            />
          </Field>

          <Field label="Sede / tienda">
            <input
              type="text"
              className={inputClass}
              value={config.storeName}
              onChange={(e) => patchConfig({ storeName: e.target.value })}
            />
          </Field>

          <Field label="Horario inicio">
            <input
              type="time"
              className={inputClass}
              value={config.workStartTime}
              onChange={(e) => patchConfig({ workStartTime: e.target.value })}
            />
          </Field>

          <Field label="Horario fin">
            <input
              type="time"
              className={inputClass}
              value={config.workEndTime}
              onChange={(e) => patchConfig({ workEndTime: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="vivo-panel rounded-[2rem] p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-500 dark:bg-blue-500/15 dark:text-blue-300">
            <Target size={16} />
          </div>
          <h3 className="text-sm font-black text-gray-800 dark:text-slate-100">Metas del escenario</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Meta diaria">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={config.dailyGoal}
              onChange={(e) => patchConfig({ dailyGoal: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>

          <Field label="Meta mensual">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={config.monthlyGoal}
              onChange={(e) => patchConfig({ monthlyGoal: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>

          <Field label="Meta comisiones ($)">
            <input
              type="number"
              min={1000}
              step={500}
              className={inputClass}
              value={config.commissionGoal}
              onChange={(e) => patchConfig({ commissionGoal: Math.max(1000, Number(e.target.value) || 1000) })}
            />
          </Field>
        </div>
      </div>

      <div className="vivo-panel rounded-[2rem] p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-500 dark:bg-amber-500/15 dark:text-amber-300">
            <Package size={16} />
          </div>
          <h3 className="text-sm font-black text-gray-800 dark:text-slate-100">Historial e inventario</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Intensidad del historial">
            <select
              className={inputClass}
              value={config.salesIntensity}
              onChange={(e) => patchConfig({ salesIntensity: e.target.value as DemoModeConfig['salesIntensity'] })}
            >
              {DEMO_SALES_INTENSITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nivel de stock base">
            <select
              className={inputClass}
              value={config.stockLevel}
              onChange={(e) => patchConfig({ stockLevel: e.target.value as DemoModeConfig['stockLevel'] })}
            >
              {DEMO_STOCK_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-[2rem] vivo-surface-on-pattern p-2">
        <ToggleRow
          label="Incluir retos activos"
          description="Carga retos diarios y de mes alineados con las metas demo."
          checked={config.includeChallenges}
          onToggle={() => patchConfig({ includeChallenges: !config.includeChallenges })}
        />
        <ToggleRow
          label="Incluir puntos bonus"
          description="Agrega movimientos de puntos por retos y práctica comercial."
          checked={config.includePointBonuses}
          onToggle={() => patchConfig({ includePointBonuses: !config.includePointBonuses })}
        />
        <ToggleRow
          label="Catálogo completo"
          description="Activa los 6 modelos con stock. Si se apaga, solo quedan 4 modelos demo."
          checked={config.includeFullCatalog}
          onToggle={() => patchConfig({ includeFullCatalog: !config.includeFullCatalog })}
        />
      </div>

      {settings.useDemoDate && onRegenerate ? (
        <button
          type="button"
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-600"
        >
          <RefreshCw size={16} />
          Regenerar escenario demo
        </button>
      ) : null}

      <div className="flex items-start gap-2 rounded-[1.25rem] bg-gray-50 px-3.5 py-3 text-[0.68rem] font-semibold leading-relaxed text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-emerald-500" />
        <span>
          Guarda los cambios para activar el demo. Si ya está activo, usa regenerar para aplicar una nueva configuración sin desactivar el modo.
        </span>
      </div>
    </div>
  );
}
