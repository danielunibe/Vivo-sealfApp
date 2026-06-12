'use client';

import React from 'react';
import SettingsView from '../SettingsView';
import { Device } from '@/types/device';
import { Movement, Sale } from '@/types/sale';

interface SettingsSectionProps {
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

export default function SettingsSection({
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
}: SettingsSectionProps) {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <SettingsView
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        setUserName={setUserName}
        userStore={userStore}
        setUserStore={setUserStore}
        devices={devices}
        setDevices={setDevices}
        sales={sales}
        movements={movements}
        setSales={setSales}
        setMovements={setMovements}
      />
    </div>
  );
}
