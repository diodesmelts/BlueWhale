import { mascots, getMascotById } from './MascotSelector';

interface MascotDisplayProps {
  mascotId: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export default function MascotDisplay({ 
  mascotId, 
  size = 'md', 
  className = '',
  showName = false
}: MascotDisplayProps) {
  const mascot = getMascotById(mascotId);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-4xl'
  };
  
  return (
    <div className={`flex ${showName ? 'flex-col items-center' : ''} ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${mascot.color} transition-all`}
      >
        <span>{mascot.emoji}</span>
      </div>
      
      {showName && (
        <span className="mt-2 text-sm text-gray-300">{mascot.name}</span>
      )}
    </div>
  );
}