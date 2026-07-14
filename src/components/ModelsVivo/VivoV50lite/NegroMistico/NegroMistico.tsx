import React from 'react';

export const NegroMistico = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="v50baseMystic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#252A30" />
        <stop offset="50%" stopColor="#15191C" />
        <stop offset="100%" stopColor="#0B0D0F" />
      </linearGradient>

      <linearGradient id="v50cameraMystic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3A3F45" />
        <stop offset="100%" stopColor="#1C1F22" />
      </linearGradient>

      <filter id="v50shadowMystic" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.4"/>
      </filter>

      <filter id="v50moduleShadowMystic" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
      </filter>

      <clipPath id="v50clipMystic">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
      
      <linearGradient id="v50glareMystic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>

    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#v50baseMystic)" filter="url(#v50shadowMystic)" stroke="#3E454C" strokeWidth="1.5" />

    <rect x="18" y="100" width="2" height="20" rx="1" fill="#4B535D" />
    <rect x="18" y="140" width="2" height="40" rx="1" fill="#4B535D" />

    <g clipPath="url(#v50clipMystic)">
      <rect x="20" y="20" width="160" height="360" fill="url(#v50baseMystic)" />
      <path d="M 20,40 Q 100,160 180,40" stroke="#ffffff" strokeWidth="20" fill="none" opacity="0.08" />
      <path d="M 20,240 Q 100,100 180,240" stroke="#ffffff" strokeWidth="30" fill="none" opacity="0.06" />
    </g>

    {/* V50 Premium camera panel */}
    <rect x="28" y="30" width="54" height="154" rx="27" fill="url(#v50cameraMystic)" stroke="#4E555C" strokeWidth="1" filter="url(#v50moduleShadowMystic)" />

    <circle cx="55" cy="62" r="19" fill="#0A0D0E" stroke="#5E676E" strokeWidth="1.5" />
    <circle cx="55" cy="62" r="8" fill="#020404" />
    <circle cx="53" cy="59" r="2" fill="#FFFFFF" opacity="0.75" />

    <circle cx="55" cy="110" r="19" fill="#0A0D0E" stroke="#5E676E" strokeWidth="1.5" />
    <circle cx="55" cy="110" r="8" fill="#020404" />
    <circle cx="53" cy="107" r="2" fill="#FFFFFF" opacity="0.75" />

    {/* Distinctive V50 Aura Ring */}
    <circle cx="55" cy="154" r="14" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="55" cy="154" r="14" fill="none" stroke="#E6F4F8" strokeWidth="4.5" opacity="0.3" />
    
    <g transform="translate(55, 154)">
      <path id="v50mysticAuraPath" d="M -11,0 A 11,11 0 1,1 11,0 A 11,11 0 1,1 -11,0" fill="none" />
      <text fontFamily="sans-serif" fontSize="1.8" fontWeight="bold" fill="#ffffff" textAnchor="middle" opacity="0.8">
        <textPath href="#v50mysticAuraPath" startOffset="50%">
          AURA LIGHT OIS SYSTEM
        </textPath>
      </text>
    </g>

    <g transform="translate(45, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#606B78" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);

