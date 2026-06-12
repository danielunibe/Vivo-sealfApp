'use client';

import React, { useState } from 'react';
import CatalogDeviceGrid from '@/components/catalog/CatalogDeviceGrid';
import DeviceCommercialGuide from '@/components/catalog/DeviceCommercialGuide';
import { Device } from '@/types/device';

interface CatalogSectionProps {
  theme: 'light' | 'dark';
  devices: Device[];
  onNavigateToSale?: (index: number) => void;
}

export default function CatalogSection({
  theme,
  devices,
  onNavigateToSale
}: CatalogSectionProps) {
  const [selectedDevice, setSelectedDevice] = useState<{ device: Device, index: number } | null>(null);

  const handleDeviceClick = (index: number) => {
    // Show the Ficha Comercial instead of navigating immediately
    setSelectedDevice({ device: devices[index], index });
  };

  const handleRegisterSale = () => {
    if (selectedDevice && onNavigateToSale) {
      onNavigateToSale(selectedDevice.index);
      setSelectedDevice(null);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col pt-1 select-none h-full overflow-hidden relative">
      {/* Structured Layout grid with proper padding to clear the Dock */}
      <CatalogDeviceGrid devices={devices} onNavigateToSale={handleDeviceClick} />

      {/* Commercial Sales Guide Modal/Overlay */}
      <DeviceCommercialGuide 
        device={selectedDevice?.device || null}
        isOpen={selectedDevice !== null}
        onClose={() => setSelectedDevice(null)}
        onRegisterSale={handleRegisterSale}
      />
    </div>
  );
}
