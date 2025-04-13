import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | string | null | undefined;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({ 
  targetDate, 
  className = '', 
  showIcon = true,
  compact = false,
  onExpire
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  
  useEffect(() => {
    if (!targetDate) {
      return;
    }
    
    const targetDateTime = new Date(targetDate).getTime();
    
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const difference = targetDateTime - now;
      
      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        
        if (onExpire) {
          onExpire();
        }
        
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };
    
    // Initial calculation
    calculateTimeRemaining();
    
    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);
  
  if (!targetDate) {
    return null;
  }
  
  const { days, hours, minutes, seconds, isExpired } = timeRemaining;
  
  // Format display based on compact mode
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showIcon && <Clock className="h-3.5 w-3.5 text-blue-500" />}
        <div className="text-sm font-bold">
          {isExpired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <>
              <span className="text-blue-700">{days}d </span>
              <span className="text-indigo-600">{hours}h </span>
              <span className="text-purple-600">{minutes}m </span>
              <span className="text-rose-600">{seconds}s</span>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Standard display with all time components - more exciting version
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {showIcon && <Clock className="h-5 w-5 text-blue-600 animate-pulse" />}
        <span className="font-bold text-lg text-blue-700">
          {isExpired ? 'Competition closed' : 'COUNTDOWN TO DRAW!'}
        </span>
      </div>
      
      {!isExpired && (
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="flex flex-col">
            <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg px-2 py-3 text-2xl font-bold text-white shadow-md transform hover:scale-105 transition-transform">
              {days}
            </div>
            <span className="text-sm mt-2 font-semibold text-blue-800">Days</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-lg px-2 py-3 text-2xl font-bold text-white shadow-md transform hover:scale-105 transition-transform">
              {hours}
            </div>
            <span className="text-sm mt-2 font-semibold text-indigo-800">Hours</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-gradient-to-b from-purple-500 to-purple-700 rounded-lg px-2 py-3 text-2xl font-bold text-white shadow-md transform hover:scale-105 transition-transform">
              {minutes}
            </div>
            <span className="text-sm mt-2 font-semibold text-purple-800">Mins</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-gradient-to-b from-rose-500 to-rose-700 rounded-lg px-2 py-3 text-2xl font-bold text-white shadow-md animate-pulse">
              {seconds}
            </div>
            <span className="text-sm mt-2 font-semibold text-rose-800">Secs</span>
          </div>
        </div>
      )}
    </div>
  );
}