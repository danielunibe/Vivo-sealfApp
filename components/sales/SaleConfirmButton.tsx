'use client';

import React from 'react';

interface SaleConfirmButtonProps {
  theme: 'light' | 'dark';
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export default function SaleConfirmButton({
  theme,
  onClick,
  label,
  disabled = false
}: SaleConfirmButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all z-30 cursor-pointer ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-neutral-300 text-neutral-500'
          : theme === 'light'
            ? 'bg-[#1C2C28] text-white hover:bg-neutral-800 active:scale-95 hover:shadow-md'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 hover:shadow-lg hover:shadow-emerald-900/20'
      }`}
    >
      {label}
    </button>
  );
}
