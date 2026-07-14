import React from 'react';

export const NegroJade = ({ width = "100%", height = "100%", className = "" }: { width?: string | number, height?: string | number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" width={width} height={height} className={className}>
    <defs>
      <linearGradient id="baseGreen_N" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1B4D43" />
        <stop offset="100%" stopColor="#10332B" />
      </linearGradient>
      <linearGradient id="cameraModule_N" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#235A50" />
        <stop offset="100%" stopColor="#18433A" />
      </linearGradient>
      <filter id="shadow_N" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.4"/>
      </filter>
      <filter id="moduleShadow_N" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
      <clipPath id="phoneClip_N">
        <rect x="20" y="20" width="160" height="360" rx="18" />
      </clipPath>
    </defs>
    <rect x="20" y="20" width="160" height="360" rx="18" fill="url(#baseGreen_N)" filter="url(#shadow_N)" stroke="#226658" strokeWidth="1.5" />
    <rect x="18" y="100" width="2" height="20" rx="1" fill="#143A32" />
    <rect x="18" y="140" width="2" height="40" rx="1" fill="#143A32" />
    <g clipPath="url(#phoneClip_N)">
      <rect x="20" y="20" width="160" height="360" fill="url(#baseGreen_N)" />
      <polygon points="20,20 100,20 100,120 20,200" fill="#ffffff" opacity="0.04" />
      <polygon points="100,20 180,20 180,200 100,120" fill="#000000" opacity="0.1" />
      <polygon points="20,200 100,120 180,200 100,300" fill="#ffffff" opacity="0.08" />
      <polygon points="20,200 100,300 100,380 20,380" fill="#000000" opacity="0.15" />
      <polygon points="180,200 180,380 100,380 100,300" fill="#ffffff" opacity="0.02" />
    </g>
    <rect x="28" y="30" width="54" height="160" rx="27" fill="url(#cameraModule_N)" stroke="#2E7567" strokeWidth="1" filter="url(#moduleShadow_N)" />
    <circle cx="55" cy="62" r="20" fill="#0D1A17" stroke="#317A6B" strokeWidth="1.5" />
    <circle cx="55" cy="62" r="8" fill="#050A09" />
    <circle cx="55" cy="62" r="2" fill="#296A85" /> 
    <circle cx="50" cy="57" r="3" fill="#ffffff" opacity="0.4" /> 
    <circle cx="55" cy="112" r="20" fill="#0D1A17" stroke="#317A6B" strokeWidth="1.5" />
    <circle cx="55" cy="112" r="8" fill="#050A09" />
    <circle cx="55" cy="112" r="2" fill="#296A85" />
    <circle cx="50" cy="107" r="3" fill="#ffffff" opacity="0.4" />
    <circle cx="55" cy="162" r="15" fill="none" stroke="#F4F4F4" strokeWidth="2.5" />
    <circle cx="55" cy="162" r="15" fill="none" stroke="#ffffff" strokeWidth="5" opacity="0.1" />
    <circle cx="90" cy="55" r="2.5" fill="#FCEFCE" />
    <circle cx="90" cy="67" r="2.5" fill="#FCEFCE" />
    <g transform="translate(45, 335) rotate(-90)">
      <text x="0" y="0" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="600" fill="#95B5AD" letterSpacing="3.5">vivo</text>
    </g>
  </svg>
);
