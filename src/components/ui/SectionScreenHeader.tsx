import React from 'react';
import clsx from 'clsx';

export type SectionHeaderVariant = 'default' | 'onDark' | 'immersive';

export type SectionScreenHeaderProps = {
  title: string;
  subtitle?: string;
  variant?: SectionHeaderVariant;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  compact?: boolean;
  className?: string;
};

export function SectionScreenHeader({
  title,
  subtitle,
  variant = 'default',
  leading,
  trailing,
  compact = false,
  className,
}: SectionScreenHeaderProps) {
  const titleClass = clsx(
    'truncate font-black uppercase tracking-[0.14em] leading-none shrink-0 transition-colors duration-500',
    compact ? 'text-[1.18rem]' : 'text-[1.35rem]',
    variant === 'onDark' && 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]',
    variant === 'immersive' && 'text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]',
    variant === 'default' && 'text-[var(--neo-text)] drop-shadow-sm',
  );

  const subtitleClass = clsx(
    'truncate text-[0.68rem] font-bold leading-tight',
    variant === 'onDark' && 'text-white/70',
    variant === 'immersive' && 'text-white/62',
    variant === 'default' && 'text-slate-500 dark:text-slate-400',
  );

  return (
    <header
      className={clsx(
        'w-full shrink-0 z-50 px-4 sm:px-5',
        compact
          ? 'pt-[calc(env(safe-area-inset-top)+6px)] pb-1 min-h-[44px]'
          : 'pt-[calc(env(safe-area-inset-top)+12px)] pb-2 min-h-[52px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {leading}
          <div className="min-w-0 flex flex-col gap-0.5">
            <h1 className={titleClass}>{title}</h1>
            {subtitle ? <p className={subtitleClass}>{subtitle}</p> : null}
          </div>
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
      </div>
    </header>
  );
}
