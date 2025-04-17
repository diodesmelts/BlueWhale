import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EntryProgress from "./EntryProgress";
import { CompetitionWithEntryStatus } from "@shared/types";
import { usePaymentContext } from "@/components/payments/PaymentProvider";
import { useAuth } from "@/hooks/use-auth";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";
import { useLocation } from "wouter";
import { CountdownTimer } from "@/components/ui/countdown-timer";

interface CompetitionCardProps {
  competition: CompetitionWithEntryStatus;
  onEnter: (id: number) => void;
  onBookmark: (id: number) => void;
  onLike: (id: number) => void;
  onCompleteEntry: (id: number) => void;
  categoryTheme?: 'family' | 'appliances' | 'cash';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function CompetitionCard({ 
  competition, 
  onEnter, 
  onBookmark, 
  onLike, 
  onCompleteEntry,
  categoryTheme
}: CompetitionCardProps) {
  const { user } = useAuth();
  const { showPaymentModal } = usePaymentContext();
  const [isPaying, setIsPaying] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  
  const {
    id,
    title,
    organizer,
    description,
    image,
    platform,
    type,
    prize,
    entries,
    eligibility,
    endDate,
    drawTime,
    entrySteps,
    isVerified,
    isEntered,
    entryProgress,
    isBookmarked,
    isLiked,
    ticketPrice,
    totalTickets,
    soldTickets,
    maxTicketsPerUser,
    ticketCount,
    ticketNumbers
  } = competition;
  
  const handleEnterCompetition = () => {
    // If the user is not authenticated, the ProtectedRoute component will handle redirection
    if (!user) {
      onEnter(id);
      return;
    }
    
    // For ticket-based competitions, open the ticket purchase modal
    if (ticketPrice && ticketPrice > 0) {
      setTicketModalOpen(true);
    } else {
      // Free competition
      onEnter(id);
    }
  };
  
  const handleTicketPurchase = (ticketCount: number) => {
    setIsPaying(true);
    
    // Call the API to purchase tickets
    fetch(`/api/competitions/${id}/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticketCount })
    })
    .then(res => res.json())
    .then(data => {
      // If payment is required, redirect to payment page or show payment modal
      if (data.message?.includes("payment")) {
        showPaymentModal(
          (ticketPrice || 0) * ticketCount, // Amount in cents
          `${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${title}`,
          "Purchase Tickets",
          { 
            competitionId: id.toString(),
            ticketCount: String(ticketCount)
          }
        );
      } else {
        // Entry was successful without payment
        onEnter(id);
      }
      setTicketModalOpen(false);
    })
    .catch(err => {
      console.error('Error entering competition:', err);
      setIsPaying(false);
      setTicketModalOpen(false);
    });
  };

  // Get days remaining
  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Ended";
    if (diffDays === 1) return "Ends tomorrow";
    if (diffDays <= 3) return `Ends in ${diffDays} days`;
    if (diffDays <= 7) return "Ends in 1 week";
    return `Ends in ${diffDays} days`;
  };

  const daysRemaining = getDaysRemaining();
  const isEndingSoon = daysRemaining === "Ends tomorrow" || daysRemaining.includes("Ends in 3 days");
  
  // Calculate time remaining for countdown display
  useEffect(() => {
    if (!drawTime) return;
    
    const targetDateTime = new Date(drawTime).getTime();
    
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
  }, [drawTime]);
  
  // Category-specific theme colors
  const getCategoryThemeColors = () => {
    if (!categoryTheme) return {
      gradient: 'from-blue-100 to-indigo-100',
      border: 'border-blue-300',
      textGradient: 'from-blue-600 to-indigo-600',
      lineGradient: 'from-blue-300 to-indigo-300',
      progressBg: 'bg-blue-200',
      progressFill: 'from-blue-500 to-indigo-600',
      ticketTextColor: 'text-blue-800',
      ticketIconColor: 'text-blue-700',
      highlightTextColor: 'text-blue-700',
      buttonGradient: 'from-rose-500 to-pink-600',
      buttonHoverGradient: 'from-rose-600 to-pink-700'
    };
    
    switch(categoryTheme) {
      case 'family':
        return {
          gradient: 'from-yellow-100 to-amber-100',
          border: 'border-yellow-300',
          textGradient: 'from-yellow-600 to-amber-600',
          lineGradient: 'from-yellow-300 to-amber-300',
          progressBg: 'bg-yellow-200',
          progressFill: 'from-yellow-500 to-amber-600',
          ticketTextColor: 'text-yellow-800',
          ticketIconColor: 'text-yellow-700',
          highlightTextColor: 'text-yellow-700',
          buttonGradient: 'from-yellow-500 to-amber-600',
          buttonHoverGradient: 'from-yellow-600 to-amber-700'
        };
      case 'appliances':
        return {
          gradient: 'from-pink-100 to-rose-100',
          border: 'border-pink-300',
          textGradient: 'from-pink-600 to-rose-600',
          lineGradient: 'from-pink-300 to-rose-300',
          progressBg: 'bg-pink-200',
          progressFill: 'from-pink-500 to-rose-600',
          ticketTextColor: 'text-pink-800',
          ticketIconColor: 'text-pink-700',
          highlightTextColor: 'text-pink-700',
          buttonGradient: 'from-pink-500 to-rose-600',
          buttonHoverGradient: 'from-pink-600 to-rose-700'
        };
      case 'cash':
        return {
          gradient: 'from-green-100 to-emerald-100',
          border: 'border-green-300',
          textGradient: 'from-green-600 to-emerald-600',
          lineGradient: 'from-green-300 to-emerald-300',
          progressBg: 'bg-green-200',
          progressFill: 'from-green-500 to-emerald-600',
          ticketTextColor: 'text-green-800',
          ticketIconColor: 'text-green-700',
          highlightTextColor: 'text-green-700',
          buttonGradient: 'from-green-500 to-emerald-600',
          buttonHoverGradient: 'from-green-600 to-emerald-700'
        };
      default:
        return {
          gradient: 'from-blue-100 to-indigo-100',
          border: 'border-blue-300',
          textGradient: 'from-blue-600 to-indigo-600',
          lineGradient: 'from-blue-300 to-indigo-300',
          progressBg: 'bg-blue-200',
          progressFill: 'from-blue-500 to-indigo-600',
          ticketTextColor: 'text-blue-800',
          ticketIconColor: 'text-blue-700',
          highlightTextColor: 'text-blue-700',
          buttonGradient: 'from-rose-500 to-pink-600',
          buttonHoverGradient: 'from-rose-600 to-pink-700'
        };
    }
  };
  
  const theme = getCategoryThemeColors();

  return (
    <>
      <TicketPurchaseModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        onPurchase={handleTicketPurchase}
        competition={{
          title,
          ticketPrice,
          maxTicketsPerUser,
          totalTickets,
          soldTickets
        }}
      />
      
      <div 
        className="competition-card mb-2 overflow-hidden rounded-2xl bg-gray-800/70 shadow-2xl cursor-pointer border border-gray-700/40 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.7)] hover:-translate-y-1 relative backdrop-blur-sm dark-card-hover"
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        
        {/* Tickets remaining banner */}
        <div className="w-full bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white py-2 px-4 flex items-center justify-center font-medium border-b border-gray-700/50">
          <i className={`fas fa-ticket-alt mr-2 
            ${categoryTheme === 'family' ? 'text-amber-400' : 
             categoryTheme === 'appliances' ? 'text-pink-400' : 
             categoryTheme === 'cash' ? 'text-green-400' : 
             'text-cyan-400'}`}></i>
          <span className="text-sm">{(totalTickets && soldTickets) ? (totalTickets - soldTickets) : 950} tickets remaining</span>
        </div>
        
        {/* Top section with much taller image and shine effect */}
        <div 
          className="w-full h-96 bg-center bg-cover relative overflow-hidden group shine-effect"
          style={{ backgroundImage: `url(${image})` }}
        >
          
          {/* Tickets counter only - price tag removed */}
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center shadow-md">
            <i className={`fas fa-ticket-alt mr-2 
              ${categoryTheme === 'family' ? 'text-amber-400' : 
               categoryTheme === 'appliances' ? 'text-pink-400' : 
               categoryTheme === 'cash' ? 'text-green-400' : 
               'text-cyan-400'}`}></i>
            <span className="font-medium text-sm">{soldTickets || 50}/{totalTickets || 1000}</span>
          </div>
          
          {/* Darkened bottom section with product name */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm p-4">
            <h3 className="text-2xl font-bold text-white">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Name + Verified */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-200 truncate">
            {title}
          </h3>
          {isVerified && (
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-emerald-900/70 to-green-900/70 text-green-400 text-xs font-medium border border-green-800/50 backdrop-blur-sm"
            >
              <i className="fas fa-check-circle text-green-400 mr-1"></i> Verified
            </Badge>
          )}
        </div>
        
        {/* Countdown timer section - styled with category-specific gradients and animations */}
        {drawTime && (
          <div className="px-4 pt-1 pb-4 grid grid-cols-4 gap-2.5">
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-600' : 
                 categoryTheme === 'appliances' ? 'bg-gradient-to-br from-pink-500 to-pink-700 border border-pink-600' : 
                 categoryTheme === 'cash' ? 'bg-gradient-to-br from-green-500 to-green-700 border border-green-600' : 
                 'bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-600'}`}>
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.days.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-1">DAYS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-600' : 
                 categoryTheme === 'appliances' ? 'bg-gradient-to-br from-pink-500 to-pink-700 border border-pink-600' : 
                 categoryTheme === 'cash' ? 'bg-gradient-to-br from-green-500 to-green-700 border border-green-600' : 
                 'bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-600'}`}>
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.hours.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-1">HOURS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-600' : 
                 categoryTheme === 'appliances' ? 'bg-gradient-to-br from-pink-500 to-pink-700 border border-pink-600' : 
                 categoryTheme === 'cash' ? 'bg-gradient-to-br from-green-500 to-green-700 border border-green-600' : 
                 'bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-600'}`}>
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.minutes.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-1">MINS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center animate-pulse
                ${categoryTheme === 'family' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-600' : 
                 categoryTheme === 'appliances' ? 'bg-gradient-to-br from-pink-500 to-pink-700 border border-pink-600' : 
                 categoryTheme === 'cash' ? 'bg-gradient-to-br from-green-500 to-green-700 border border-green-600' : 
                 'bg-gradient-to-br from-blue-500 to-blue-700 border border-blue-600'}`}>
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.seconds.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-1">SECS</span>
            </div>
          </div>
        )}
        
        {/* Footer section with pricing and button - with gradient button */}
        <div className="border-t border-gray-700/30 flex items-center bg-gray-800/90 backdrop-blur-sm rounded-b-2xl overflow-hidden">
          <div className="flex-1 pl-4 py-3">
            <span className={`text-xl font-extrabold 
              ${categoryTheme === 'family' ? 'text-amber-400' : 
               categoryTheme === 'appliances' ? 'text-pink-400' : 
               categoryTheme === 'cash' ? 'text-green-400' : 
               'text-cyan-400'}`}>
              £{(ticketPrice ? ticketPrice/100 : 0).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 font-medium block">
              <i className={`fas fa-tag mr-1 
                ${categoryTheme === 'family' ? 'text-amber-400/80' : 
                 categoryTheme === 'appliances' ? 'text-pink-400/80' : 
                 categoryTheme === 'cash' ? 'text-green-400/80' : 
                 'text-cyan-400/80'}`}></i>
              per ticket
            </span>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              setTicketModalOpen(true);
            }}
            disabled={isPaying}
            className={`px-6 py-3 h-full text-white font-bold text-sm transition-all duration-300 rounded-none shadow-md wiggle-on-hover
              ${categoryTheme === 'family' ? 'bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900' : 
               categoryTheme === 'appliances' ? 'bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900' : 
               categoryTheme === 'cash' ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900' : 
               'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'}`}
          >
            <i className="fas fa-ticket-alt mr-2"></i>
            GET TICKETS
          </Button>
        </div>
      </div>
    </>
  );
}
