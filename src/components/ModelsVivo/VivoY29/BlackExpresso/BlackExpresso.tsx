import React from 'react';

export const BlackExpresso = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="expressoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A0A05" />
        <stop offset="100%" stopColor="#2B1309" />
      </linearGradient>

      <linearGradient id="moduleMetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4E2F1E" />
        <stop offset="100%" stopColor="#3E271D" />
      </linearGradient>

      <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A0A05" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#2B1309" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#1A0A05" stopOpacity="0.8" />
      </linearGradient>

      <linearGradient id="glareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.6"/>
      </filter>
      
      <filter id="moduleShadow">
        <feDropShadow dx="2" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.4"/>
      </filter>

      <clipPath id="phoneClip">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#expressoBodyGrad)" stroke="#1A0A05" strokeWidth="1.5" filter="url(#shadow)" />

    <g clipPath="url(#phoneClip)">
      <rect x="20" y="20" width="160" height="360" fill="url(#panelGrad)" />
      <path d="M20,180 L180,60 L180,20 L20,20 Z" fill="url(#glareGrad)" opacity="0.45" />
      <path d="M20,380 L180,260 L180,380 L20,380 Z" fill="url(#glareGrad)" opacity="0.45" />
    </g>

    <rect x="180" y="110" width="2" height="35" rx="1" fill="#1A0A05" />
    <rect x="180" y="155" width="2" height="18" rx="1" fill="#1A0A05" />

    <rect x="33" y="38" width="54" height="130" rx="27" fill="url(#moduleMetGrad)" stroke="#3E271D" strokeWidth="1" filter="url(#moduleShadow)" />

    <circle cx="60" cy="67" r="22" fill="#0D0D0D" stroke="#3E271D" strokeWidth="1.5" />
    <circle cx="60" cy="67" r="10" fill="#030303" />
    <circle cx="56" cy="63" r="3.5" fill="#ffffff" opacity="0.5" /> 
    <circle cx="60" cy="117" r="22" fill="#0D0D0D" stroke="#3E271D" strokeWidth="1.5" />
    <circle cx="60" cy="117" r="10" fill="#030303" />
    <circle cx="56" cy="113" r="3.5" fill="#ffffff" opacity="0.5" />

    <circle cx="60" cy="157" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
    <circle cx="60" cy="157" r="10" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity="0.2" />

    <circle cx="95" cy="55" r="2.5" fill="#FCEFCE" stroke="#3E271D" strokeWidth="0.5" />

    <g transform="translate(48, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#7A6051" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);

