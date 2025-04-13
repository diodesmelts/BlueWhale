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
        <div className="text-xs font-medium">
          {isExpired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <>
              <span>{days}d </span>
              <span>{hours}h </span>
              <span>{minutes}m</span>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Standard display with all time components
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {showIcon && <Clock className="h-4 w-4 text-blue-500" />}
        <span className="font-medium text-sm">
          {isExpired ? 'Competition closed' : 'Draw in:'}
        </span>
      </div>
      
      {!isExpired && (
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="flex flex-col">
            <div className="bg-blue-100 rounded px-2 py-1.5 text-lg font-semibold text-blue-800">
              {days}
            </div>
            <span className="text-xs mt-1">Days</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-blue-100 rounded px-2 py-1.5 text-lg font-semibold text-blue-800">
              {hours}
            </div>
            <span className="text-xs mt-1">Hours</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-blue-100 rounded px-2 py-1.5 text-lg font-semibold text-blue-800">
              {minutes}
            </div>
            <span className="text-xs mt-1">Mins</span>
          </div>
          
          <div className="flex flex-col">
            <div className="bg-blue-100 rounded px-2 py-1.5 text-lg font-semibold text-blue-800">
              {seconds}
            </div>
            <span className="text-xs mt-1">Secs</span>
          </div>
        </div>
      )}
    </div>
  );
}