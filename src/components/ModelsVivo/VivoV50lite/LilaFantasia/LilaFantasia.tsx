import React from 'react';

export const LilaFantasiaV50 = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="v50baseLilac" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EDE1FB" />
        <stop offset="50%" stopColor="#CCA0EB" />
        <stop offset="100%" stopColor="#AD6CDB" />
      </linearGradient>

      <linearGradient id="v50cameraModule" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DFBCF5" />
        <stop offset="100%" stopColor="#8E46C7" />
      </linearGradient>

      <filter id="v50shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.25"/>
      </filter>

      <filter id="v50moduleShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.18"/>
      </filter>

      <clipPath id="v50clip">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
      
      <linearGradient id="v50glare" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>

    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#v50baseLilac)" filter="url(#v50shadow)" stroke="#BC92E6" strokeWidth="1.5" />

    <rect x="18" y="100" width="2" height="20" rx="1" fill="#8E46C7" />
    <rect x="18" y="140" width="2" height="40" rx="1" fill="#8E46C7" />

    <g clipPath="url(#v50clip)">
      <rect x="20" y="20" width="160" height="360" fill="url(#v50baseLilac)" />
      <path d="M 20,40 Q 100,160 180,40" stroke="#ffffff" strokeWidth="20" fill="none" opacity="0.18" />
      <path d="M 20,240 Q 100,100 180,240" stroke="#ffffff" strokeWidth="30" fill="none" opacity="0.12" />
      <path d="M -10,120 Q 90,320 210,120" stroke="#ffffff" strokeWidth="22" fill="none" opacity="0.15" />
    </g>

    {/* V50 Premium camera panel */}
    <rect x="28" y="30" width="54" height="154" rx="27" fill="url(#v50cameraModule)" stroke="#EACDFA" strokeWidth="1" filter="url(#v50moduleShadow)" />

    <circle cx="55" cy="62" r="19" fill="#0E1212" stroke="#EACDFA" strokeWidth="1.5" />
    <circle cx="55" cy="62" r="8" fill="#040606" />
    <circle cx="53" cy="59" r="2" fill="#FFFFFF" opacity="0.6" />

    <circle cx="55" cy="110" r="19" fill="#0E1212" stroke="#EACDFA" strokeWidth="1.5" />
    <circle cx="55" cy="110" r="8" fill="#040606" />
    <circle cx="53" cy="107" r="2" fill="#FFFFFF" opacity="0.6" />

    {/* Distinctive V50 Aura Ring */}
    <circle cx="55" cy="154" r="14" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="55" cy="154" r="14" fill="none" stroke="#ffffff" strokeWidth="4.5" opacity="0.25" />
    
    <g transform="translate(55, 154)">
      <path id="v50lilaAuraPath" d="M -11,0 A 11,11 0 1,1 11,0 A 11,11 0 1,1 -11,0" fill="none" />
      <text fontFamily="sans-serif" fontSize="1.8" fontWeight="bold" fill="#ffffff" textAnchor="middle" opacity="0.75">
        <textPath href="#v50lilaAuraPath" startOffset="50%">
          AURA LIGHT OIS SYSTEM
        </textPath>
      </text>
    </g>

    <g transform="translate(45, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#7C3BBD" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);

