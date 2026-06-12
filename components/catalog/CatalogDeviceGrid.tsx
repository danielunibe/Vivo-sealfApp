'use client';

import React from 'react';
import { Device } from '@/types/device';
import CatalogDeviceCard from './CatalogDeviceCard';

interface CatalogDeviceGridProps {
  devices: Device[];
  onNavigateToSale?: (idx: number) => void;
}

export default function CatalogDeviceGrid({
  devices,
  onNavigateToSale
}: CatalogDeviceGridProps) {
  // Filter devices to only show active ones
  const activeDevices = devices.filter(d => d.active !== false);

  return (
    <div className="px-5 grid grid-cols-2 grid-rows-[1.1fr_1.1fr_0.8fr] gap-3 w-full h-full max-h-full flex-1 overflow-y-auto pb-32 pt-1">
      {activeDevices.map((device) => (
        <CatalogDeviceCard
          key={device.id}
          device={device}
          idx={devices.indexOf(device)}
          onNavigateToSale={onNavigateToSale}
        />
      ))}
    </div>
  );
}
