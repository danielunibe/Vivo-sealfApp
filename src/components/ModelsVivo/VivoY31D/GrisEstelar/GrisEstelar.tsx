import React from 'react';

export const GrisEstelar = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="stellarGreyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60636A" />
        <stop offset="50%" stopColor="#404349" />
        <stop offset="100%" stopColor="#26282E" />
      </linearGradient>

      <linearGradient id="moduleGreyGrad_Y31D_G" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#555860" />
        <stop offset="100%" stopColor="#3A3D44" />
      </linearGradient>

      <linearGradient id="glareGrad_Y31D_G" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id="shadow_Y31D_G" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.5"/>
      </filter>

      <filter id="moduleShadow_Y31D_G" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
      </filter>

      <clipPath id="phoneClip_Y31D_G">
        <rect x="25" y="20" width="150" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="25" y="20" width="150" height="360" rx="18" fill="url(#stellarGreyGrad)" filter="url(#shadow_Y31D_G)" stroke="#6C7078" strokeWidth="1.5" />

    <rect x="23" y="100" width="2" height="40" rx="1" fill="#35373D" />
    <rect x="23" y="155" width="2" height="20" rx="1" fill="#35373D" />

    <g clipPath="url(#phoneClip_Y31D_G)">
      <path d="M-20,150 L180,-50 L180,80 L-20,280 Z" fill="url(#glareGrad_Y31D_G)" />
    </g>

    <rect x="34" y="32" width="65" height="92" rx="20" fill="url(#moduleGreyGrad_Y31D_G)" stroke="#6C7078" strokeWidth="1" filter="url(#moduleShadow_Y31D_G)" />

    <circle cx="55" cy="55" r="16" fill="#0A0B0E" stroke="#2A2C32" strokeWidth="2" />
    <circle cx="55" cy="55" r="6" fill="#030405" />
    <circle cx="55" cy="55" r="1.5" fill="#296A85" />
    <circle cx="51" cy="51" r="2.5" fill="#ffffff" opacity="0.4" />

    <circle cx="55" cy="98" r="16" fill="#0A0B0E" stroke="#2A2C32" strokeWidth="2" />
    <circle cx="55" cy="98" r="6" fill="#030405" />
    <circle cx="55" cy="98" r="1.5" fill="#296A85" />
    <circle cx="51" cy="94" r="2.5" fill="#ffffff" opacity="0.4" />

    <circle cx="82" cy="55" r="3.5" fill="#FFFBE6" stroke="#4A4D54" strokeWidth="0.5" />
    
    <circle cx="82" cy="98" r="4.5" fill="none" stroke="#E0E2E6" strokeWidth="1.8" />

    <g transform="translate(50, 340) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="600" fill="#9CA0A8" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
