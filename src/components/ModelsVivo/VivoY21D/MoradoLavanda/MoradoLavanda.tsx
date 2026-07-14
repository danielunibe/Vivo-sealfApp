import React from 'react';

export const MoradoLavanda = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="baseLavender_Y21D" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E9D5FF" />
        <stop offset="50%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="cameraModule_Y21D" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DDD6FE" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="shadow_Y21D" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.4"/>
      </filter>
      <filter id="moduleShadow_Y21D" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
      <clipPath id="phoneClip_Y21D">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
      <linearGradient id="glareGrad_Y21D" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#baseLavender_Y21D)" filter="url(#shadow_Y21D)" stroke="#A78BFA" strokeWidth="1.5" />
    <rect x="18" y="100" width="2" height="20" rx="1" fill="#7C3AED" />
    <rect x="18" y="140" width="2" height="40" rx="1" fill="#7C3AED" />
    
    <g clipPath="url(#phoneClip_Y21D)">
      <rect x="20" y="20" width="160" height="360" fill="url(#baseLavender_Y21D)" />
      <path d="M20,180 L180,60 L180,20 L20,20 Z" fill="url(#glareGrad_Y21D)" opacity="0.4" />
      <path d="M20,380 L180,260 L180,380 L20,380 Z" fill="url(#glareGrad_Y21D)" opacity="0.4" />
    </g>

    <rect x="28" y="30" width="54" height="160" rx="27" fill="url(#cameraModule_Y21D)" stroke="#C4B5FD" strokeWidth="1" filter="url(#moduleShadow_Y21D)" />
    <circle cx="55" cy="62" r="20" fill="#0A0915" stroke="#A78BFA" strokeWidth="1.5" />
    <circle cx="55" cy="62" r="8" fill="#03020A" />
    <circle cx="55" cy="62" r="2" fill="#8B5CF6" /> 
    <circle cx="50" cy="57" r="3" fill="#ffffff" opacity="0.4" /> 
    
    <circle cx="55" cy="112" r="20" fill="#0A0915" stroke="#A78BFA" strokeWidth="1.5" />
    <circle cx="55" cy="112" r="8" fill="#03020A" />
    <circle cx="55" cy="112" r="2" fill="#8B5CF6" />
    <circle cx="50" cy="107" r="3" fill="#ffffff" opacity="0.4" />

    <circle cx="55" cy="162" r="15" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
    <circle cx="55" cy="162" r="15" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.1" />
    <circle cx="90" cy="55" r="2.5" fill="#FCEFCE" />
    <circle cx="90" cy="67" r="2.5" fill="#FCEFCE" />
    <g transform="translate(45, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#C4B5FD" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
