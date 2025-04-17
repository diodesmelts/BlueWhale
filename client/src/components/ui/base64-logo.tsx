import React from 'react';

// Get the base64 data from the attached PNG
const logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACX"; // This is just the beginning, we'll use the full string

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function Base64Logo({ className = "", size = "md", style = {} }: LogoProps) {
  // We'll directly use the Blue Whale text logo component as a backup
  // since we only have the start of the base64 string
  
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

export default Base64Logo;