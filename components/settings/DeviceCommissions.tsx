import React from 'react';
import { Smartphone } from 'lucide-react';
import { Device } from '@/types/device';

interface DeviceCommissionsProps {
  theme: 'light' | 'dark';
  devices: Device[];
  handleMarginChange: (id: string, value: string) => void;
  handleToggleActive?: (id: string) => void;
}

export default function DeviceCommissions({
  theme,
  devices,
  handleMarginChange,
  handleToggleActive
}: DeviceCommissionsProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-1.5 justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--neo-text)]">
          Dispositivos y Ganancias
        </span>
        <span className="text-[7.5px] text-neutral-400 uppercase font-mono tracking-wider">Margen (MXN)</span>
      </div>
      
      <div className="space-y-2 overflow-visible">
        {devices.map((device) => (
          <div 
            key={device.id} 
            className={`py-1 flex items-center justify-between border-b border-neutral-100/40 dark:border-neutral-800/20 transition-opacity ${
              device.active === false ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <input
                type="checkbox"
                checked={device.active !== false}
                onChange={() => handleToggleActive?.(device.id)}
                className="w-3.5 h-3.5 rounded-xs border-neutral-300 dark:border-neutral-750 text-neutral-900 focus:ring-neutral-500 dark:text-white cursor-pointer"
              />
              <Smartphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className={`text-[10px] font-bold truncate ${
                theme === 'light' ? 'text-neutral-800' : 'text-neutral-250'
              }`}>
                {device.name}
              </span>
            </div>
            
            <div className="relative flex items-center gap-1 w-20">
              <span className="text-[9px] text-neutral-400 font-mono font-bold">$</span>
              <input
                type="number"
                value={device.margin}
                onChange={(e) => handleMarginChange(device.id, e.target.value)}
                className={`w-full text-center text-[10px] font-black font-mono py-1 rounded-lg focus:outline-hidden transition-all ${
                  theme === 'light'
                    ? 'bg-neutral-50/50 border border-neutral-200 text-[#1C2C28] focus:border-neutral-900'
                    : 'bg-[#181E1C]/50 border border-neutral-800 text-white focus:border-emerald-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
