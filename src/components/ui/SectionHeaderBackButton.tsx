import React from 'react';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

type SectionHeaderBackButtonProps = {
  onClick: () => void;
  label?: string;
  variant?: 'default' | 'onDark' | 'immersive';
  className?: string;
};

export function SectionHeaderBackButton({
  onClick,
  label,
  variant = 'default',
  className,
}: SectionHeaderBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label || 'Volver'}
      className={clsx(
        'w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm outline-none transition-colors',
        variant === 'onDark' && 'border border-white/15 bg-white/10 text-white hover:bg-white/16',
        variant === 'immersive' && 'border border-white/18 bg-black/28 text-white hover:bg-black/36 backdrop-blur-md',
        variant === 'default' && 'border border-[var(--glass-border)] bg-white text-[var(--neo-text)] dark:bg-slate-800',
        className,
      )}
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
    </button>
  );
}
