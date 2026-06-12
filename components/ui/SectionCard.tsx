'use client';

import React from 'react';

interface SectionCardProps {
  theme: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
  heightClass?: string;
}

export default function SectionCard({
  theme,
  children,
  className = '',
  heightClass = 'h-[385px]'
}: SectionCardProps) {
  const baseStyle = `neo-section w-full min-h-0 p-0 transition-all duration-300 flex flex-col ${heightClass} ${className}`;
  const themeStyle = theme === 'light'
    ? 'text-[#1C2C28]'
    : 'text-[#E5EAE7]';

  return (
    <div className={`${baseStyle} ${themeStyle}`}>
      {children}
    </div>
  );
}
