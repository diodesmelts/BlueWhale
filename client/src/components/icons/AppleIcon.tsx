import React from 'react';

interface AppleIconProps {
  className?: string;
  size?: number;
}

const AppleIcon: React.FC<AppleIconProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      {/* More accurate Apple Pay icon */}
      <path d="M6.382 5.968A3.368 3.368 0 0 1 8.53 4.72c.06 1.35-.394 2.683-1.196 3.639-.793.975-2.058 1.727-3.314 1.629a3.616 3.616 0 0 1-.078-2.243c.229-.947.793-1.825 1.528-2.426.736-.601 1.642-.998 2.546-1.177.366.975.098 1.905-.634 2.826zm5.411 1.426c-.267-.04-.537-.06-.806-.06-1.807 0-3.236.995-4.217 2.66-.98 1.664-.415 4.741 1.499 7.37.791 1.093 1.76 2.309 3.077 2.309 1.317 0 1.805-.85 3.39-.85 1.585 0 1.925.83 3.293.83 1.367 0 2.445-1.4 3.254-2.494a9.103 9.103 0 0 0 1.267-2.59c-3.3-1.236-3.139-3.618-3.104-3.693.02-.041 2.27-1.733 2.27-5.236 0-4.086-3.533-4.86-5.338-4.86-2.316 0-3.976 1.283-4.585 1.284.117-3.153 2.04-4.55 2.079-4.58.04-.03-1.318-.61-1.746-.61-.43 0-2.7.61-3.61 2.243-.908 1.633-.604 3.74-.604 3.74.04.305.078.547.18.547z"/>
    </svg>
  );
};

export default AppleIcon;