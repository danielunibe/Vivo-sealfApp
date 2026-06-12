'use client';

import React from 'react';
import { CalendarDays, Compass, PiggyBank, Settings2, Smartphone } from 'lucide-react';

interface TactileIconProps {
  isActive: boolean;
  theme?: 'light' | 'dark';
}

type SimpleNeoIconProps = TactileIconProps & {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

function SimpleNeoIcon({ isActive, theme = 'light', icon: Icon }: SimpleNeoIconProps) {
  const baseSurface = theme === 'dark' ? '#15181b' : '#edf0f2';
  const innerSurface = theme === 'dark' ? '#1b1f23' : '#f7f8f9';
  const inactiveColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const activeColor = theme === 'dark' ? '#f5f6f7' : '#111315';

  return (
    <span
      className="neo-nav-icon"
      style={{
        background: isActive
          ? `linear-gradient(145deg, ${innerSurface}, ${baseSurface})`
          : baseSurface,
        boxShadow: isActive
          ? 'inset 3px 3px 7px rgba(0,0,0,0.18), inset -3px -3px 7px rgba(255,255,255,0.12)'
          : undefined,
        color: isActive ? activeColor : inactiveColor,
      }}
      aria-hidden="true"
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.45 : 2} />
      {isActive ? <span className="neo-nav-icon-dot" style={{ backgroundColor: activeColor }} /> : null}
    </span>
  );
}

export function TactileCalendarIcon(props: TactileIconProps) {
  return <SimpleNeoIcon {...props} icon={CalendarDays} />;
}

export function TactilePiggyIcon(props: TactileIconProps) {
  return <SimpleNeoIcon {...props} icon={PiggyBank} />;
}

export function TactileCatalogIcon(props: TactileIconProps) {
  return <SimpleNeoIcon {...props} icon={Compass} />;
}

export function TactileRegisterIcon(props: TactileIconProps) {
  return <SimpleNeoIcon {...props} icon={Smartphone} />;
}

export function TactileSettingsIcon(props: TactileIconProps) {
  return <SimpleNeoIcon {...props} icon={Settings2} />;
}
