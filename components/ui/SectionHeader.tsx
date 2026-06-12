'use client';

import React from 'react';

interface SectionHeaderProps {
  theme: 'light' | 'dark';
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function SectionHeader({
  theme,
  title,
  description,
  icon,
  iconBgColor
}: SectionHeaderProps) {
  // Use a refined icon container bg depending on theme
  const iconContainerBg = theme === 'light'
    ? 'bg-[#1C2C28]/10 text-[#1C2C28]'
    : 'bg-[#222825] text-neutral-250';

  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-850/60 flex-shrink-0 select-none">
      <div className={`p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center ${iconContainerBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className={`text-xs font-black uppercase tracking-wider font-mono ${
          theme === 'light' ? 'text-neutral-900' : 'text-white'
        }`}>
          {title}
        </h2>
        <p className="text-[10px] text-neutral-400 font-sans truncate leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
