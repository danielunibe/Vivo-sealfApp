import React from 'react';

export const LilaFantasia = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="baseLilac_LF" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F2E6FE" />
        <stop offset="50%" stopColor="#DEBFF5" />
        <stop offset="100%" stopColor="#C796E8" />
      </linearGradient>

      <linearGradient id="cameraModule_LF" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DAB2F2" />
        <stop offset="100%" stopColor="#BA80DE" />
      </linearGradient>

      <filter id="shadow_LF" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.2"/>
      </filter>

      <filter id="moduleShadow_LF" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.15"/>
      </filter>

      <clipPath id="phoneClip_LF">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#baseLilac_LF)" filter="url(#shadow_LF)" stroke="#CFA5F0" strokeWidth="1.5" />

    <rect x="18" y="100" width="2" height="20" rx="1" fill="#B386D9" />
    <rect x="18" y="140" width="2" height="40" rx="1" fill="#B386D9" />

    <g clipPath="url(#phoneClip_LF)">
      <rect x="20" y="20" width="160" height="360" fill="url(#baseLilac_LF)" />
      <path d="M -10,60 Q 80,140 210,20" stroke="#ffffff" strokeWidth="25" fill="none" opacity="0.25" />
      <path d="M -20,180 C 70,280 130,110 220,220" stroke="#ffffff" strokeWidth="35" fill="none" opacity="0.2" />
      <path d="M -10,300 C 110,240 70,390 210,310" stroke="#ffffff" strokeWidth="20" fill="none" opacity="0.2" />
      <path d="M 50,-10 Q 120,200 10,410" stroke="#ffffff" strokeWidth="45" fill="none" opacity="0.15" />
      <path d="M 150,-10 Q 70,220 190,410" stroke="#EEDDFF" strokeWidth="50" fill="none" opacity="0.3" />
      <path d="M 90,-10 C 180,140 20,270 130,410" stroke="#ffffff" strokeWidth="15" fill="none" opacity="0.3" />
    </g>

    <rect x="28" y="30" width="54" height="160" rx="27" fill="url(#cameraModule_LF)" stroke="#E3CCF8" strokeWidth="1.5" filter="url(#moduleShadow_LF)" />

    <circle cx="55" cy="62" r="20" fill="#0A1010" stroke="#E3CCF8" strokeWidth="2" />
    <circle cx="55" cy="62" r="8" fill="#050A0A" />
    <circle cx="55" cy="62" r="2" fill="#296A85" /> 
    <circle cx="50" cy="57" r="3" fill="#ffffff" opacity="0.4" /> 
    
    <circle cx="55" cy="112" r="20" fill="#0A1010" stroke="#E3CCF8" strokeWidth="2" />
    <circle cx="55" cy="112" r="8" fill="#050A0A" />
    <circle cx="55" cy="112" r="2" fill="#296A85" />
    <circle cx="50" cy="107" r="3" fill="#ffffff" opacity="0.4" />

    <circle cx="55" cy="162" r="15" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
    <circle cx="55" cy="162" r="15" fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.4" />

    <g transform="translate(55, 162)">
      <path id="auraTextPath_LF" d="M -13,0 A 13,13 0 1,1 13,0 A 13,13 0 1,1 -13,0" fill="none" />
      <text fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="2.2" fontWeight="600" fill="#ffffff" textAnchor="middle" opacity="0.8">
        <textPath href="#auraTextPath_LF" startOffset="50%">
          AURA LIGHT ON OIS PORTRAIT
        </textPath>
      </text>
    </g>

    <g transform="translate(45, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#A47BC9" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
