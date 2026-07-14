import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function LiquidGlassPill({ children, className, active }: any) {
  return (
    <div
      className={cn(
        "relative transition-all duration-200 ease-out overflow-hidden rounded-full inline-flex items-center justify-center shadow-[var(--glass-shadow)]",
        className
      )}
      style={{ 
        backgroundColor: 'var(--glass-bg)', 
        backdropFilter: 'blur(var(--glass-blur))', 
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)' 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent z-0" />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function LiquidGlassDockShell({ children, className }: any) {
  return (
    <div
      className={cn(
        "relative transition-all duration-200 ease-out overflow-hidden rounded-[2.5rem] shadow-[var(--glass-shadow)]",
        className
      )}
      style={{ 
        backgroundColor: 'var(--glass-bg)', 
        backdropFilter: 'blur(var(--glass-blur))', 
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)' 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent z-0" />
      <div className="relative z-10 flex items-center justify-between w-full h-full">
        {children}
      </div>
    </div>
  );
}


// Single mounting point for the SVG filter
export function LiquidGlassFilter() {
  return (
    <svg style={{ display: 'none' }}>
      <filter id="liquid-glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" seed="4" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.1 0" in="noise" result="coloredNoise" />
        <feOffset dx="0" dy="0" in="coloredNoise" result="offsetNoise" />
        <feDisplacementMap in="SourceGraphic" in2="offsetNoise" scale="5" xChannelSelector="R" yChannelSelector="G" result="distortion" />
      </filter>
    </svg>
  );
}

export function LiquidGlassSurface({ children, className, variant = 'surface', pressed = false, onClick, ...props }: any) {
  return (
    <div
      onClick={onClick}
      {...props}
      className={cn(
        "relative transition-all duration-300 ease-out overflow-hidden",
        variant === 'pill' ? "rounded-full" : "rounded-[24px]",
        pressed ? "shadow-[var(--neo-shadow-inset)] scale-[0.98]" : "shadow-[var(--neo-shadow-parallel)]",
        "text-[var(--neo-text)]",
        className
      )}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--neo-surface) 42%, transparent)',
        border: '1px solid color-mix(in srgb, var(--neo-text) 10%, transparent)',
        ...props.style,
      }}
    >
      <div className="relative z-10 text-[var(--neo-text)]">{children}</div>
    </div>
  );
}

export function LiquidGlassButton({ children, onClick, className, variant = 'default', pressedState, ...props }: any) {
  const [internalPressed, setInternalPressed] = useState(false);
  const isPressed = pressedState !== undefined ? pressedState : internalPressed;

  return (
    <button
      onPointerDown={() => setInternalPressed(true)}
      onPointerUp={() => setInternalPressed(false)}
      onPointerLeave={() => setInternalPressed(false)}
      onClick={onClick}
      className={cn(
        "w-full px-6 min-h-[56px] rounded-full font-bold tracking-wide relative overflow-hidden transition-all duration-300 ease-out outline-none select-none",
        isPressed ? "shadow-[var(--neo-shadow-inset)] scale-[0.96] opacity-90" : "shadow-[var(--neo-shadow-raised)]",
        variant === 'primary' ? 'text-white' : 'text-[var(--neo-text)]',
        className
      )}
      style={{ 
        backgroundColor: variant === 'primary' ? 'var(--neo-accent)' : 'var(--neo-surface)',
        ...props.style
      }}
      {...props}
    >
      <div className="relative z-20 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
}
