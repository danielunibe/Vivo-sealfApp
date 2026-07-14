import React from 'react';

export const BlancoBrillante = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="glossyWhiteGrad_Y31D" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#F4F6F9" />
        <stop offset="100%" stopColor="#E2E7ED" />
      </linearGradient>

      <linearGradient id="moduleWhiteGrad_Y31D" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E8ECEF" />
      </linearGradient>

      <linearGradient id="glareGrad_Y31D_B" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id="shadow_Y31D_B" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.2"/>
      </filter>

      <filter id="moduleShadow_Y31D_B" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.12"/>
      </filter>

      <clipPath id="phoneClip_Y31D_B">
        <rect x="25" y="20" width="150" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="25" y="20" width="150" height="360" rx="18" fill="url(#glossyWhiteGrad_Y31D)" filter="url(#shadow_Y31D_B)" stroke="#CFD5DF" strokeWidth="1.5" />

    <rect x="23" y="100" width="2" height="40" rx="1" fill="#C0C6D0" />
    <rect x="23" y="155" width="2" height="20" rx="1" fill="#C0C6D0" />

    <g clipPath="url(#phoneClip_Y31D_B)">
      <path d="M-20,100 L180,-100 L180,120 L-20,320 Z" fill="url(#glareGrad_Y31D_B)" />
    </g>

    <rect x="34" y="32" width="65" height="92" rx="20" fill="url(#moduleWhiteGrad_Y31D)" stroke="#D4DBE4" strokeWidth="1.5" filter="url(#moduleShadow_Y31D_B)" />

    <circle cx="55" cy="55" r="16" fill="#0A0B0E" stroke="#C0C6CE" strokeWidth="1.5" />
    <circle cx="55" cy="55" r="6" fill="#030405" />
    <circle cx="55" cy="55" r="1.5" fill="#296A85" />
    <circle cx="51" cy="51" r="2.5" fill="#ffffff" opacity="0.6" />

    <circle cx="55" cy="98" r="16" fill="#0A0B0E" stroke="#C0C6CE" strokeWidth="1.5" />
    <circle cx="55" cy="98" r="6" fill="#030405" />
    <circle cx="55" cy="98" r="1.5" fill="#296A85" />
    <circle cx="51" cy="94" r="2.5" fill="#ffffff" opacity="0.6" />

    <circle cx="82" cy="55" r="3.5" fill="#FFFBE6" stroke="#B0B6C0" strokeWidth="0.5" />
    
    <circle cx="82" cy="98" r="4.5" fill="none" stroke="#A3ABB5" strokeWidth="1.8" />

    <g transform="translate(50, 340) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="600" fill="#9CA3AF" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
