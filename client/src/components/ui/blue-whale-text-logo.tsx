import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function BlueWhaleTextLogo({ className = "", style = {} }: LogoProps) {
  return (
    <div 
      className={`text-white font-bold flex items-center ${className}`} 
      style={style}
    >
      <span className="text-cyan-300">Blue</span>
      <span className="mx-1 text-white">Whale</span>
      <span className="text-purple-300">Competitions</span>
    </div>
  );
}

export default BlueWhaleTextLogo;