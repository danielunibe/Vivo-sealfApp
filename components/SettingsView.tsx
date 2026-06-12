'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, CreditCard, Sparkles, History } from 'lucide-react';
import { Device } from '@/types/device';
import { Movement, Sale } from '@/types/sale';
import SectionCard from './ui/SectionCard';
import ScheduleSettings from './settings/ScheduleSettings';
import DeviceManagerSettings from './settings/DeviceManagerSettings';
import GoalsSettings from './settings/GoalsSettings';
import HistorySettings from './settings/HistorySettings';
import BackupSettings from './settings/BackupSettings';
import InteractionSettings from './settings/InteractionSettings';
import SettingsTabs, { type SettingsTabId } from './settings/SettingsTabs';
import { getWorkSchedule } from '@/lib/storage';
import { triggerFeedback } from '@/lib/nativeFeedback';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userName: string;
  setUserName: (val: string) => void;
  userStore: string;
  setUserStore: (val: string) => void;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  sales: Sale[];
  movements: Movement[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>;
}

const DEFAULT_SCHEDULE = [
  { day: 'Lun', active: true, start: '09:00', end: '18:00' },
  { day: 'Mar', active: true, start: '09:00', end: '18:00' },
  { day: 'Mié', active: true, start: '09:00', end: '18:00' },
  { day: 'Jue', active: true, start: '09:00', end: '18:00' },
  { day: 'Vie', active: true, start: '09:00', end: '17:00' },
  { day: 'Sáb', active: false, start: '10:00', end: '14:00' },
  { day: 'Dom', active: false, start: '10:00', end: '14:00' },
];

export default function SettingsView({
  theme,
  setTheme,
  userName,
  setUserName,
  userStore,
  setUserStore,
  devices,
  setDevices,
  sales,
  movements,
  setSales,
  setMovements
}: SettingsViewProps) {
  
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const activeDevices = useMemo(() => devices.filter(device => device.active !== false).length, [devices]);
  const totalSales = sales.length;
  const totalMovements = movements.length;
  const recentMovements = useMemo(() => movements.slice(0, 3), [movements]);

  // Sync schedule with localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = getWorkSchedule();
      if (saved) {
        setSchedule(saved);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');

  return (
    <SectionCard theme={theme} className="flex flex-1 min-h-0 flex-col overflow-hidden" heightClass="h-full min-h-0 w-full flex-1 pt-4">
      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 select-none scrollbar-none dock-safe-pb pb-6">
        <div className="space-y-6">
          
          {/* 1. PERFIL OPERATIVO */}
          {activeTab === 'profile' && (
            <div className="settings-profile-tall flex min-h-full flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-[var(--neo-text)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
                  Perfil Operativo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="neo-card-soft p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--neo-text)]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400">Activos</span>
                  </div>
                  <p className="text-lg font-black leading-none text-neutral-900 dark:text-white">{activeDevices}</p>
                  <p className="text-[9px] text-neutral-400 mt-1">Modelos listos para vender</p>
                </div>

                <div className="neo-card-soft p-3">
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400">Ventas</span>
                  </div>
                  <p className="text-lg font-black leading-none text-neutral-900 dark:text-white">{totalSales}</p>
                  <p className="text-[9px] text-neutral-400 mt-1">Registro acumulado</p>
                </div>

                <div className="neo-card-soft p-3">
                  <div className="flex items-center justify-between mb-2">
                    <History className="w-4 h-4 text-sky-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400">Movs.</span>
                  </div>
                  <p className="text-lg font-black leading-none text-neutral-900 dark:text-white">{totalMovements}</p>
                  <p className="text-[9px] text-neutral-400 mt-1">Entradas y salidas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1.5">Nombre</span>
                   <input
                     type="text"
                     value={userName}
                     onChange={(e) => setUserName(e.target.value)}
                     className="neo-input w-full px-3 py-2 text-xs font-bold transition-all focus:outline-none"
                   />
                 </div>
                 <div>
                   <span className="block text-[9px] font-mono font-bold text-neutral-400 mb-1.5">Región o Punto</span>
                   <input
                     type="text"
                     value={userStore}
                     onChange={(e) => setUserStore(e.target.value)}
                     className="neo-input w-full px-3 py-2 text-xs font-bold transition-all focus:outline-none"
                   />
                 </div>
              </div>

              <div className="neo-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Movimientos recientes</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] text-neutral-400">Últimos 3</span>
                </div>
                {recentMovements.length > 0 ? (
                  <div className="space-y-2">
                    {recentMovements.map((movement, index) => (
                      <div key={`${movement.id || index}-${movement.date || index}`} className="neo-card-soft flex items-center justify-between gap-3 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {movement.title || 'Movimiento registrado'}
                          </p>
                          <p className="text-[9px] text-neutral-400">
                            {movement.date || 'Sin fecha'} · {movement.source || 'origen'}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${movement.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {movement.type || 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-3 py-4 text-center">
                    <p className="text-xs font-medium text-neutral-500">Todavía no hay movimientos recientes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. HORARIOS */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ScheduleSettings
                theme={theme}
                schedule={schedule}
                setSchedule={setSchedule}
                selectedDayIdx={selectedDayIdx}
                setSelectedDayIdx={setSelectedDayIdx}
              />
            </div>
          )}

          {/* 3. DISPOSITIVOS Y GANANCIAS */}
          {activeTab === 'devices' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <DeviceManagerSettings
                theme={theme}
                devices={devices}
                setDevices={setDevices}
                sales={sales}
              />
            </div>
          )}

          {/* 4. METAS */}
          {activeTab === 'goals' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GoalsSettings theme={theme} devices={devices} />
            </div>
          )}

          {/* 4.5. HISTORIAL */}
          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <HistorySettings 
                theme={theme} 
                sales={sales} 
                setSales={setSales} 
                setMovements={setMovements} 
              />
            </div>
          )}

          {/* 5. RESPALDO */}
          {activeTab === 'backup' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <BackupSettings
                theme={theme}
                sales={sales}
                movements={movements}
                devices={devices}
              />
            </div>
          )}

          {/* 6. APARIENCIA */}
          {activeTab === 'appearance' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
                Apariencia
              </span>
              <div className="neo-inset flex rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    void triggerFeedback('selection');
                  }}
                  className={`neo-button flex-1 py-2 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all ${
                    theme === 'light' ? 'neo-button-pressed text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    void triggerFeedback('selection');
                  }}
                  className={`neo-button flex-1 py-2 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all ${
                    theme === 'dark' ? 'neo-button-pressed text-white' : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  Oscuro
                </button>
              </div>
            </div>
          )}

          {/* 7. INTERACCION */}
          {activeTab === 'interaction' && (
            <InteractionSettings theme={theme} />
          )}
          
        </div>
      </div>
    </SectionCard>
  );
}
