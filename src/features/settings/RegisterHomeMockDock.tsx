import React from 'react';

const DOCK_ITEMS = [
  { src: '/assets/dock/calendar.png', label: 'Registro', active: false },
  { src: '/assets/dock/catalog.png', label: 'Catálogo', active: false },
  { src: '/assets/dock/register.png', label: 'Cámara', active: true },
  { src: '/assets/dock/piggybank.png', label: 'Historial', active: false },
  { src: '/assets/dock/settings.png', label: 'Ajustes', active: false },
] as const;

export function RegisterHomeMockDock() {
  return (
    <div
      className="absolute bottom-0 left-0 z-30 flex w-full justify-center px-1.5 pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+4px)] pt-1 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="relative mx-auto flex w-auto max-w-full items-center justify-center gap-1 px-2.5 py-2.5 sm:gap-2 sm:px-3.5 rounded-[2.5rem]"
        style={{
          background: 'rgba(30, 32, 35, 0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        {DOCK_ITEMS.map((item) => (
          <div key={item.src} className="relative flex items-center justify-center">
            <div className="relative flex h-[3rem] w-[3rem] items-center justify-center sm:h-[3.4rem] sm:w-[3.4rem]">
              {item.active && (
                <div
                  className="absolute inset-[4px] rounded-full pointer-events-none z-0"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                />
              )}
              {item.active && (
                <div className="absolute -bottom-1.5 sm:-bottom-2 h-1 w-1 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
              <img
                src={item.src}
                alt=""
                className={`relative z-10 h-[85%] w-[85%] rounded-[1rem] object-cover drop-shadow-md sm:h-[90%] sm:w-[90%] sm:rounded-2xl ${
                  item.active ? 'brightness-110 opacity-100' : 'brightness-90 opacity-60'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
