import { useState, useEffect } from "react";
import { BrandIcon } from "./brand-icon";
import { useQuery } from "@tanstack/react-query";

interface LogoDisplayProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function LogoDisplay({ className = "", size = "md", style = {} }: LogoDisplayProps) {
  const [showFallback, setShowFallback] = useState(false);
  
  // Fetch logo from the settings API
  const { data: logoSettings } = useQuery<{ imageUrl: string | null }>({
    queryKey: ["/api/settings/logo"],
  });
  
  // If we need to use the fallback logo
  if (showFallback || !logoSettings?.imageUrl) {
    return <BrandIcon className={className} size={size} style={style} />;
  }
  
  // Use the uploaded logo if available
  return (
    <img 
      src={logoSettings.imageUrl}
      alt="Blue Whale Competitions" 
      className={`${className} transition-all duration-300`} 
      style={{ height: size === "sm" ? "40px" : size === "md" ? "50px" : "64px", ...style }}
      onError={() => setShowFallback(true)}
    />
  );
}

export default LogoDisplay;