import React from 'react';

export const NegroElegante = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="v60baseBlack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22252A" />
        <stop offset="50%" stopColor="#111215" />
        <stop offset="100%" stopColor="#08080A" />
      </linearGradient>

      <linearGradient id="v60cameraGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#AA7C11" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#5B4006" stopOpacity="0.95" />
      </linearGradient>

      <filter id="v60shadowBlack" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.45"/>
      </filter>

      <filter id="v60moduleShadowGold" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35"/>
      </filter>

      <clipPath id="v60clipBlack">
        <rect x="22" y="20" width="156" height="360" rx="16" />
      </clipPath>
    </defs>

    <rect x="22" y="20" width="156" height="360" rx="16" fill="url(#v60baseBlack)" filter="url(#v60shadowBlack)" stroke="#AA7C11" strokeWidth="1" opacity="0.9" />

    <rect x="20" y="95" width="2" height="15" rx="0.75" fill="#C5A038" />
    <rect x="20" y="125" width="2" height="30" rx="0.75" fill="#C5A038" />

    <g clipPath="url(#v60clipBlack)">
      <rect x="22" y="20" width="156" height="360" fill="url(#v60baseBlack)" />
      <path d="M 22,30 L 178,140" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.15" />
    </g>

    {/* V60 Premium high-end gold camera panel */}
    <rect x="30" y="32" width="50" height="150" rx="25" fill="url(#v60cameraGold)" stroke="#D4AF37" strokeWidth="0.8" filter="url(#v60moduleShadowGold)" />

    {/* Lenses */}
    <circle cx="55" cy="62" r="17" fill="#0C1014" stroke="#D4AF37" strokeWidth="1" />
    <circle cx="55" cy="62" r="7" fill="#020305" />
    <circle cx="53" cy="60" r="1.5" fill="#FFFFFF" opacity="0.8" />

    <circle cx="55" cy="105" r="17" fill="#0C1014" stroke="#D4AF37" strokeWidth="1" />
    <circle cx="55" cy="105" r="7" fill="#020305" />
    <circle cx="53" cy="103" r="1.5" fill="#FFFFFF" opacity="0.8" />

    {/* Halo ring for V60 Aura System */}
    <circle cx="55" cy="148" r="12" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="55" cy="148" r="12" fill="none" stroke="#FFEAA7" strokeWidth="3" opacity="0.3" />
    <circle cx="55" cy="148" r="3" fill="#FFEAA7" opacity="0.85" />

    <g transform="translate(55, 148)">
      <path id="v60elegAuraPath" d="M -9.5,0 A 9.5,9.5 0 1,1 9.5,0 A 9.5,9.5 0 1,1 -9.5,0" fill="none" />
      <text fontFamily="sans-serif" fontSize="1.5" fontWeight="bold" fill="#ffffff" textAnchor="middle" opacity="0.85">
        <textPath href="#v60elegAuraPath" startOffset="50%">
          AURA LIGHT OIS 2.0
        </textPath>
      </text>
    </g>

    <g transform="translate(43, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#917220" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);

