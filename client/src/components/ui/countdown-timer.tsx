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
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Clock className="h-5 w-5 text-blue-600 animate-pulse" />}
        <div className="text-xl font-extrabold">
          {isExpired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <>
              <span className="text-blue-700">{days}d </span>
              <span className="text-indigo-600">{hours}h </span>
              <span className="text-purple-600">{minutes}m </span>
              <span className="text-rose-600 animate-pulse">{seconds}s</span>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Standard display with all time components - SUPER exciting version
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {showIcon && <Clock className="h-7 w-7 text-blue-600 animate-pulse" />}
        <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          {isExpired ? 'COMPETITION CLOSED' : 'COUNTDOWN TO WIN!'}
        </span>
      </div>
      
      {!isExpired && (
        <>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4 border-blue-400">
                {days}
              </div>
              <span className="text-base mt-2 font-bold text-blue-800 uppercase">Days</span>
            </div>
            
            <div className="flex flex-col">
              <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4 border-indigo-400">
                {hours}
              </div>
              <span className="text-base mt-2 font-bold text-indigo-800 uppercase">Hours</span>
            </div>
            
            <div className="flex flex-col">
              <div className="bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4 border-purple-400">
                {minutes}
              </div>
              <span className="text-base mt-2 font-bold text-purple-800 uppercase">Mins</span>
            </div>
            
            <div className="flex flex-col">
              <div className="bg-gradient-to-b from-rose-500 to-rose-700 rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg animate-pulse border-4 border-rose-400">
                {seconds}
              </div>
              <span className="text-base mt-2 font-bold text-rose-800 uppercase">Secs</span>
            </div>
          </div>
          
          <div className="mt-5 text-center">
            <p className="text-lg font-bold text-indigo-600 italic animate-pulse">Don't miss your chance to win! Time is running out!</p>
          </div>
        </>
      )}
    </div>
  );
}