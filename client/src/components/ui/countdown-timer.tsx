import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | string | null | undefined;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  onExpire?: () => void;
  categoryTheme?: 'family' | 'appliances' | 'cash';
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
  onExpire,
  categoryTheme
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
        {showIcon && (
          <Clock className={`h-5 w-5 animate-pulse
            ${categoryTheme === 'family' ? 'text-amber-600' :
             categoryTheme === 'appliances' ? 'text-pink-600' :
             categoryTheme === 'cash' ? 'text-green-600' :
             'text-blue-600'}`} 
          />
        )}
        <div className="text-xl font-extrabold">
          {isExpired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <>
              <span className={
                categoryTheme === 'family' ? 'text-amber-700' :
                categoryTheme === 'appliances' ? 'text-pink-700' :
                categoryTheme === 'cash' ? 'text-green-700' :
                'text-blue-700'
              }>{days}d </span>
              <span className={
                categoryTheme === 'family' ? 'text-amber-600' :
                categoryTheme === 'appliances' ? 'text-pink-600' :
                categoryTheme === 'cash' ? 'text-green-600' :
                'text-indigo-600'
              }>{hours}h </span>
              <span className={
                categoryTheme === 'family' ? 'text-amber-500' :
                categoryTheme === 'appliances' ? 'text-pink-500' :
                categoryTheme === 'cash' ? 'text-green-500' :
                'text-purple-600'
              }>{minutes}m </span>
              <span className={`animate-pulse
                ${categoryTheme === 'family' ? 'text-amber-400' :
                 categoryTheme === 'appliances' ? 'text-pink-400' :
                 categoryTheme === 'cash' ? 'text-green-400' :
                 'text-rose-600'}`
              }>{seconds}s</span>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Standard display with all time components - SUPER exciting version with category colors
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {showIcon && (
          <Clock className={`h-7 w-7 animate-pulse
            ${categoryTheme === 'family' ? 'text-amber-600' :
             categoryTheme === 'appliances' ? 'text-pink-600' :
             categoryTheme === 'cash' ? 'text-green-600' :
             'text-blue-600'}`} 
          />
        )}
        <span className={`font-extrabold text-2xl text-transparent bg-clip-text 
          ${categoryTheme === 'family' ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600' :
           categoryTheme === 'appliances' ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500' :
           categoryTheme === 'cash' ? 'bg-gradient-to-r from-green-600 via-emerald-500 to-green-500' :
           'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`}>
          {isExpired ? 'COMPETITION CLOSED' : 'COUNTDOWN TO WIN!'}
        </span>
      </div>
      
      {!isExpired && (
        <>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <div className={`rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4
                ${categoryTheme === 'family' ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-400' :
                 categoryTheme === 'appliances' ? 'bg-gradient-to-b from-pink-500 to-pink-700 border-pink-400' :
                 categoryTheme === 'cash' ? 'bg-gradient-to-b from-green-500 to-green-700 border-green-400' :
                 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-400'}`}>
                {days}
              </div>
              <span className={`text-base mt-2 font-bold uppercase
                ${categoryTheme === 'family' ? 'text-amber-800' :
                 categoryTheme === 'appliances' ? 'text-pink-800' :
                 categoryTheme === 'cash' ? 'text-green-800' :
                 'text-blue-800'}`}>Days</span>
            </div>
            
            <div className="flex flex-col">
              <div className={`rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4
                ${categoryTheme === 'family' ? 'bg-gradient-to-b from-orange-500 to-orange-700 border-orange-400' :
                 categoryTheme === 'appliances' ? 'bg-gradient-to-b from-rose-500 to-rose-700 border-rose-400' :
                 categoryTheme === 'cash' ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-400' :
                 'bg-gradient-to-b from-indigo-500 to-indigo-700 border-indigo-400'}`}>
                {hours}
              </div>
              <span className={`text-base mt-2 font-bold uppercase
                ${categoryTheme === 'family' ? 'text-orange-800' :
                 categoryTheme === 'appliances' ? 'text-rose-800' :
                 categoryTheme === 'cash' ? 'text-emerald-800' :
                 'text-indigo-800'}`}>Hours</span>
            </div>
            
            <div className="flex flex-col">
              <div className={`rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg transform hover:scale-105 transition-transform border-4
                ${categoryTheme === 'family' ? 'bg-gradient-to-b from-yellow-500 to-yellow-700 border-yellow-400' :
                 categoryTheme === 'appliances' ? 'bg-gradient-to-b from-pink-400 to-pink-600 border-pink-300' :
                 categoryTheme === 'cash' ? 'bg-gradient-to-b from-lime-500 to-lime-700 border-lime-400' :
                 'bg-gradient-to-b from-purple-500 to-purple-700 border-purple-400'}`}>
                {minutes}
              </div>
              <span className={`text-base mt-2 font-bold uppercase
                ${categoryTheme === 'family' ? 'text-yellow-800' :
                 categoryTheme === 'appliances' ? 'text-pink-700' :
                 categoryTheme === 'cash' ? 'text-lime-800' :
                 'text-purple-800'}`}>Mins</span>
            </div>
            
            <div className="flex flex-col">
              <div className={`rounded-xl px-3 py-6 text-4xl font-extrabold text-white shadow-lg animate-pulse border-4
                ${categoryTheme === 'family' ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-300' :
                 categoryTheme === 'appliances' ? 'bg-gradient-to-b from-pink-300 to-pink-500 border-pink-200' :
                 categoryTheme === 'cash' ? 'bg-gradient-to-b from-green-400 to-green-600 border-green-300' :
                 'bg-gradient-to-b from-rose-500 to-rose-700 border-rose-400'}`}>
                {seconds}
              </div>
              <span className={`text-base mt-2 font-bold uppercase
                ${categoryTheme === 'family' ? 'text-amber-700' :
                 categoryTheme === 'appliances' ? 'text-pink-600' :
                 categoryTheme === 'cash' ? 'text-green-700' :
                 'text-rose-800'}`}>Secs</span>
            </div>
          </div>
          
          <div className="mt-5 text-center">
            <p className={`text-lg font-bold italic animate-pulse
              ${categoryTheme === 'family' ? 'text-amber-600' :
               categoryTheme === 'appliances' ? 'text-pink-600' :
               categoryTheme === 'cash' ? 'text-green-600' :
               'text-indigo-600'}`}>Don't miss your chance to win! Time is running out!</p>
          </div>
        </>
      )}
    </div>
  );
}