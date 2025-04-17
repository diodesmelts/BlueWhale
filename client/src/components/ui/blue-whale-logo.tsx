import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BlueWhaleLogo({ className = "", width = 180, height = 48 }: LogoProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0099ff" />
            <stop offset="100%" stopColor="#0066cc" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g>
          {/* Whale body with gradient */}
          <path
            d="M24 25C20 25 16.5 27 15 30C12 28 8 28 5 31C2 34 2 38 3 41C1 41.5 0 43.5 0 45.5C0 48 2 50 4.5 50H50C56 50 60 46 60 40C60 34 56 30 50 30C48 30 46 30.5 44 31.5C43 28 41 25 37 25H24Z"
            fill="url(#blueGradient)"
            filter="url(#glow)"
            transform="translate(15, 5) scale(0.9)"
          />
          
          {/* Eye */}
          <circle cx="55" cy="38" r="2.5" fill="white" />
          
          {/* Water spout */}
          <path
            d="M63 25C63 25 66 20 70 25C74 30 70 35 70 35"
            stroke="#60a5fa"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Tail fin */}
          <path
            d="M5 40C0 35 0 45 5 43"
            fill="url(#blueGradient)"
            transform="translate(10, 0)"
            filter="url(#glow)"
          />
          
          {/* Text with glow effect */}
          <g filter="url(#glow)">
            <text x="95" y="40" style={{ fontFamily: 'Arial', fontSize: '22px', fontWeight: 'bold', fill: 'white' }}>
              Blue Whale
            </text>
            <text x="95" y="60" style={{ fontFamily: 'Arial', fontSize: '16px', fontWeight: 'normal', fill: 'white' }}>
              Competitions
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}