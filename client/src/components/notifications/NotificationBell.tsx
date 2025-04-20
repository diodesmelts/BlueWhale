import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";

export function NotificationBell() {
  const [showDot, setShowDot] = useState(true);
  
  const handleOpenChange = (open: boolean) => {
    // When opening the notifications, we clear the notification indicator
    if (open) {
      setShowDot(false);
    }
  };
  
  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger className="relative">
        <Bell className="h-6 w-6 text-cyan-400" />
        {showDot && (
          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-purple-500 animate-pulse"></span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gray-900 border-gray-800 text-white" align="end">
        <div className="border-b border-gray-800 p-4">
          <h3 className="text-lg font-medium flex items-center text-cyan-400">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </h3>
        </div>
          
        <div className="px-4 py-2 space-y-4">
          <NotificationItem 
            icon="gift"
            title="New competition available!"
            description="£500 Google Play gift card giveaway"
            time="Just now"
            isNew={true}
          />
            
          <NotificationItem 
            icon="check-circle"
            title="Your entry was approved"
            description="Dream Vacation Giveaway"
            time="1 hour ago"
            isNew={false}
          />
        </div>
          
        <div className="border-t border-gray-800 p-2">
          <a
            href="#" 
            className={buttonVariants({
              variant: "ghost",
              className: "w-full text-cyan-400 hover:text-cyan-300 hover:bg-gray-800"
            })}
          >
            View all notifications
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

function NotificationItem({ icon, title, description, time, isNew }: NotificationItemProps) {
  let iconElement;
  let bgColor;

  switch (icon) {
    case 'gift':
      iconElement = <i className="fas fa-gift"></i>;
      bgColor = 'bg-cyan-500';
      break;
    case 'check-circle':
      iconElement = <i className="fas fa-check-circle"></i>; 
      bgColor = 'bg-green-500';
      break;
    case 'trophy':
      iconElement = <i className="fas fa-trophy"></i>;
      bgColor = 'bg-purple-500';
      break;
    default:
      iconElement = <i className="fas fa-bell"></i>;
      bgColor = 'bg-blue-500';
  }

  return (
    <div className={`flex items-start gap-3 py-2 ${isNew ? 'bg-gray-800/30 rounded-lg p-2' : ''}`}>
      <div className={`${bgColor} text-white p-2 rounded-full flex items-center justify-center h-10 w-10 flex-shrink-0`}>
        {iconElement}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <i className="far fa-clock mr-1"></i> {time}
        </p>
      </div>
    </div>
  );
}