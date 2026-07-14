import React from 'react';

export const BlancoNube = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="cloudBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F8F8F8" />
        <stop offset="100%" stopColor="#EBEBEB" />
      </linearGradient>

      <linearGradient id="cloudModuleMetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#E0E0E0" />
      </linearGradient>

      <linearGradient id="cloudPanelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F8F8F8" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#EBEBEB" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F8F8F8" stopOpacity="0.9" />
      </linearGradient>

      <linearGradient id="cloudGlareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id="cloudShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
      
      <filter id="cloudModuleShadow">
        <feDropShadow dx="2" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.2"/>
      </filter>

      <clipPath id="cloudPhoneClip">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
    </defs>

    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#cloudBodyGrad)" stroke="#C0C0C0" strokeWidth="1.5" filter="url(#cloudShadow)" />

    <g clipPath="url(#cloudPhoneClip)">
      <rect x="20" y="20" width="160" height="360" fill="url(#cloudPanelGrad)" />
      <path d="M20,180 L180,60 L180,20 L20,20 Z" fill="url(#cloudGlareGrad)" opacity="0.3" />
      <path d="M20,380 L180,260 L180,380 L20,380 Z" fill="url(#cloudGlareGrad)" opacity="0.3" />
      <path d="M100,20 L180,100 L180,20 Z" fill="#EBEBEB" opacity="0.1" />
      <path d="M100,380 L180,300 L180,380 Z" fill="#EBEBEB" opacity="0.1" />
    </g>

    <rect x="180" y="110" width="2" height="35" rx="1" fill="#C0C0C0" />
    <rect x="180" y="155" width="2" height="18" rx="1" fill="#C0C0C0" />

    <rect x="33" y="38" width="54" height="130" rx="27" fill="url(#cloudModuleMetGrad)" stroke="#C0C0C0" strokeWidth="1" filter="url(#cloudModuleShadow)" />

    <circle cx="60" cy="67" r="22" fill="#0D0D0D" stroke="#C0C0C0" strokeWidth="1.5" />
    <circle cx="60" cy="67" r="10" fill="#030303" />
    <circle cx="56" cy="63" r="3.5" fill="#ffffff" opacity="0.5" /> 
    <circle cx="60" cy="117" r="22" fill="#0D0D0D" stroke="#C0C0C0" strokeWidth="1.5" />
    <circle cx="60" cy="117" r="10" fill="#030303" />
    <circle cx="56" cy="113" r="3.5" fill="#ffffff" opacity="0.5" />

    <circle cx="60" cy="157" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
    <circle cx="60" cy="157" r="10" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity="0.2" />

    <circle cx="95" cy="55" r="2.5" fill="#FCEFCE" stroke="#C0C0C0" strokeWidth="0.5" />

    <g transform="translate(48, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#A9A9A9" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
