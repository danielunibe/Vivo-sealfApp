import React from 'react';

export const AzulTitanio = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="v60baseTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A7596" />
        <stop offset="50%" stopColor="#2A4860" />
        <stop offset="100%" stopColor="#132433" />
      </linearGradient>

      <linearGradient id="v60cameraTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5E83A3" />
        <stop offset="100%" stopColor="#1F3345" />
      </linearGradient>

      <filter id="v60shadowTitanium" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.35"/>
      </filter>

      <filter id="v60moduleShadowTitanium" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.22"/>
      </filter>

      <clipPath id="v60clipTitanium">
        <rect x="22" y="20" width="156" height="360" rx="16" />
      </clipPath>
    </defs>

    <rect x="22" y="20" width="156" height="360" rx="16" fill="url(#v60baseTitanium)" filter="url(#v60shadowTitanium)" stroke="#527896" strokeWidth="1.5" />

    <rect x="20" y="95" width="2" height="15" rx="0.75" fill="#587F9D" />
    <rect x="20" y="125" width="2" height="30" rx="0.75" fill="#587F9D" />

    <g clipPath="url(#v60clipTitanium)">
      <rect x="22" y="20" width="156" height="360" fill="url(#v60baseTitanium)" />
      {/* Dynamic luxury gradient glow */}
      <circle cx="100" cy="200" r="140" fill="#3B82F6" opacity="0.15" filter="blur(40px)" />
      <path d="M 22,30 L 178,140 Q 100,280 22,30" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.12" />
    </g>

    {/* V60 Premium high-end camera panel */}
    <rect x="30" y="32" width="50" height="150" rx="25" fill="url(#v60cameraTitanium)" stroke="#668CAE" strokeWidth="1" filter="url(#v60moduleShadowTitanium)" />

    {/* Lenses */}
    <circle cx="55" cy="62" r="17" fill="#0C1014" stroke="#688EA8" strokeWidth="1" />
    <circle cx="55" cy="62" r="7" fill="#020305" />
    <circle cx="53" cy="60" r="1.5" fill="#FFFFFF" opacity="0.7" />

    <circle cx="55" cy="105" r="17" fill="#0C1014" stroke="#688EA8" strokeWidth="1" />
    <circle cx="55" cy="105" r="7" fill="#020305" />
    <circle cx="53" cy="103" r="1.5" fill="#FFFFFF" opacity="0.7" />

    {/* Halo ring for V60 Aura System */}
    <circle cx="55" cy="148" r="12" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="55" cy="148" r="12" fill="none" stroke="#D1E8F8" strokeWidth="3" opacity="0.35" />
    <circle cx="55" cy="148" r="3" fill="#D1E8F8" opacity="0.8" />

    <g transform="translate(55, 148)">
      <path id="v60titaAuraPath" d="M -9.5,0 A 9.5,9.5 0 1,1 9.5,0 A 9.5,9.5 0 1,1 -9.5,0" fill="none" />
      <text fontFamily="sans-serif" fontSize="1.5" fontWeight="bold" fill="#ffffff" textAnchor="middle" opacity="0.8">
        <textPath href="#v60titaAuraPath" startOffset="50%">
          AURA LIGHT OIS 2.0
        </textPath>
      </text>
    </g>

    <g transform="translate(43, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#4B7291" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);

