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
        className="competition-card mb-2 overflow-hidden rounded-2xl bg-white shadow-xl cursor-pointer border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative"
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        {/* Badge ribbon - only shown for first card or special competitions */}
        {id === 1 && (
          <div className="absolute -right-12 top-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-1 px-12 transform rotate-45 z-20 shadow-md">
            <span className="font-bold text-xs">FEATURED</span>
          </div>
        )}
        
        {/* Top section with image */}
        <div 
          className="w-full h-52 bg-center bg-cover relative overflow-hidden group"
          style={{ backgroundImage: `url(${image})` }}
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 shine-effect opacity-60"></div>
          
          {/* Overlay with price tag - styled like a real price tag */}
          <div className="absolute top-4 left-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-1.5 pl-4 pr-6 rounded-r-full shadow-md transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl font-extrabold font-mono">£{(prize/100).toLocaleString()}</span>
          </div>
          
          {/* Tickets counter */}
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white rounded-full px-3 py-1.5 flex items-center shadow-md">
            <i className="fas fa-ticket-alt text-cyan-400 mr-2"></i>
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
          <h3 className="text-base font-semibold text-gray-800 truncate">
            {title}
          </h3>
          {isVerified && (
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-green-100 to-teal-100 text-green-600 text-xs font-medium border border-green-200"
            >
              <i className="fas fa-check-circle text-green-500 mr-1"></i> Verified
            </Badge>
          )}
        </div>
        
        {/* Countdown timer section - styled with gradients and animations */}
        {drawTime && (
          <div className="px-4 pt-1 pb-4 grid grid-cols-4 gap-2.5">
            <div className="flex flex-col items-center">
              <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-inner flex items-center justify-center border border-blue-600">
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.days.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 mt-1">DAYS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-inner flex items-center justify-center border border-blue-600">
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.hours.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 mt-1">HOURS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-inner flex items-center justify-center border border-blue-600">
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.minutes.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 mt-1">MINS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-inner flex items-center justify-center border border-blue-600 animate-pulse">
                <span className="text-xl font-bold py-2 font-mono">
                  {timeRemaining?.seconds.toString().padStart(2, '0') || '00'}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 mt-1">SECS</span>
            </div>
          </div>
        )}
        
        {/* Footer section with pricing and button - with gradient button */}
        <div className="border-t border-gray-200 flex items-center bg-gray-50 rounded-b-2xl overflow-hidden">
          <div className="flex-1 pl-4 py-3">
            <span className="text-xl font-extrabold text-blue-600">£{(ticketPrice ? ticketPrice/100 : 0).toFixed(2)}</span>
            <span className="text-xs text-gray-500 font-medium block">
              <i className="fas fa-layer-group text-blue-400 mr-1"></i>
              {(totalTickets && soldTickets) ? 
                (totalTickets - soldTickets) : 950} tickets left
            </span>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              setTicketModalOpen(true);
            }}
            disabled={isPaying}
            className="px-6 py-3 h-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold text-sm transition-all duration-300 rounded-none shadow-md wiggle-on-hover"
          >
            <i className="fas fa-ticket-alt mr-2"></i>
            GET TICKETS
          </Button>
        </div>
      </div>
    </>
  );
}
