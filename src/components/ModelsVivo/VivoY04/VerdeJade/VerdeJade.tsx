import React from 'react';

export const VerdeJade = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="phoneBodyGrad_VJade" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C2F0E3" />
        <stop offset="50%" stopColor="#76D7C4" />
        <stop offset="100%" stopColor="#48C9B0" />
      </linearGradient>

      <linearGradient id="glareGrad_VJade" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id="dropShadow_VJade" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.2"/>
      </filter>
      
      <filter id="islandShadow_VJade">
        <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.15"/>
      </filter>

      <clipPath id="screenClip_VJade">
        <rect x="25" y="20" width="150" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="25" y="20" width="150" height="360" rx="18" fill="url(#phoneBodyGrad_VJade)" stroke="#76D7C4" strokeWidth="2" filter="url(#dropShadow_VJade)" />

    <rect x="176" y="110" width="3" height="35" rx="1.5" fill="#45B39D" />
    <rect x="176" y="155" width="3" height="18" rx="1.5" fill="#45B39D" />

    <g clipPath="url(#screenClip_VJade)">
      <rect x="25" y="20" width="150" height="360" fill="url(#phoneBodyGrad_VJade)" />
      <path d="M25,300 L175,90 L175,20 L25,20 Z" fill="url(#glareGrad_VJade)" opacity="0.3"/>
      <line x1="10" y1="300" x2="180" y2="100" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
      <line x1="80" y1="20" x2="185" y2="280" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
    </g>

    <rect x="38" y="38" width="48" height="126" rx="24" fill="#A2D9CE" stroke="#D1F2EB" strokeWidth="1.5" filter="url(#islandShadow_VJade)"/>

    <circle cx="62" cy="65" r="16" fill="#1A1A1A" stroke="#4D4D4D" strokeWidth="2" />
    <circle cx="62" cy="65" r="7" fill="#050505" />
    <circle cx="58" cy="61" r="2.5" fill="#FFFFFF" opacity="0.7" /> 
    <circle cx="62" cy="105" r="16" fill="#1A1A1A" stroke="#4D4D4D" strokeWidth="2" />
    <circle cx="62" cy="105" r="7" fill="#050505" />
    <circle cx="58" cy="101" r="2.5" fill="#FFFFFF" opacity="0.7" /> 
    <circle cx="62" cy="144" r="8" fill="#FFFBE6" stroke="#EAE2CA" strokeWidth="1.5" />
    <circle cx="62" cy="144" r="3" fill="#FFFFFF" />

    <g transform="translate(52, 350) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="700" fill="#17A589" letterSpacing="3">vivo</text>
    </g>
  </svg>
);

