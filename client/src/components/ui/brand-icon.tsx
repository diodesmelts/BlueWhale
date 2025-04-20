import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function BrandIcon({ className = "", size = "md", style = {} }: BrandIconProps) {
  const sizeMap = {
    sm: "h-12",
    md: "h-16 md:h-18",
    lg: "h-20"
  };

  return (
    <div className={`${sizeMap[size]} ${className}`} style={style}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" className="h-full w-auto">
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#9333ea" /> {/* purple-600 */}
          </linearGradient>
        </defs>
        <text x="20" y="65" fontFamily="Arial" fontSize="40" fontWeight="bold" fill="url(#brandGradient)">
          Blue Whale
        </text>
        <text x="230" y="65" fontFamily="Arial" fontSize="30" fontWeight="bold" fill="white">
          Competitions
        </text>
        <path d="M10,60 C30,40 50,80 70,60" stroke="#0ea5e9" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

export default BrandIcon;