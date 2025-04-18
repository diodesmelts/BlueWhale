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
        className="competition-card mb-2 overflow-hidden rounded-2xl bg-gray-900/90 shadow-2xl cursor-pointer border border-gray-700/40 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.7)] hover:-translate-y-1 relative backdrop-blur-lg group dark-card-hover"
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        {/* Card Glow Effect - conditional based on category */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
          categoryTheme === 'family' ? 'bg-amber-900/5' : 
          categoryTheme === 'appliances' ? 'bg-pink-900/5' : 
          categoryTheme === 'cash' ? 'bg-green-900/5' : 
          'bg-cyan-900/5'
        }`}></div>
        
        {/* Border Gradient Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-opacity-100 transition-all duration-500 pointer-events-none" 
          style={{
            background: 'transparent',
            borderImage: categoryTheme === 'family' 
              ? 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.1)) 1'
              : categoryTheme === 'appliances'
              ? 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.4), rgba(225, 29, 72, 0.1)) 1'
              : categoryTheme === 'cash'
              ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.1)) 1'
              : 'linear-gradient(to bottom right, rgba(14, 165, 233, 0.4), rgba(79, 70, 229, 0.1)) 1'
          }}
        ></div>
        
        {/* Tickets remaining banner - Enhanced with gradient effect */}
        <div className={`w-full backdrop-blur-sm text-white py-2 px-4 flex items-center justify-center font-medium border-b border-gray-700/50
          ${categoryTheme === 'family' ? 'bg-gradient-to-r from-amber-900/80 to-gray-900/90' : 
           categoryTheme === 'appliances' ? 'bg-gradient-to-r from-pink-900/80 to-gray-900/90' : 
           categoryTheme === 'cash' ? 'bg-gradient-to-r from-green-900/80 to-gray-900/90' : 
           'bg-gradient-to-r from-cyan-900/80 to-gray-900/90'}`}>
          <i className={`fas fa-ticket-alt mr-2 
            ${categoryTheme === 'family' ? 'text-amber-400' : 
             categoryTheme === 'appliances' ? 'text-pink-400' : 
             categoryTheme === 'cash' ? 'text-green-400' : 
             'text-cyan-400'}`}></i>
          <span className="text-sm">{(totalTickets && soldTickets) ? (totalTickets - soldTickets) : 950} tickets remaining</span>
        </div>
        
        {/* Top section with much taller image and shine effect */}
        <div 
          className="w-full h-[28rem] bg-center bg-cover relative overflow-hidden group shine-effect"
          style={{ backgroundImage: `url(${image})` }}
        >
          
          {/* Tickets counter - enhanced with category-themed styling */}
          <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 flex items-center shadow-md border border-gray-700/50 rounded-full
            ${categoryTheme === 'family' ? 'bg-gradient-to-r from-amber-900/70 to-black/70 text-white' : 
             categoryTheme === 'appliances' ? 'bg-gradient-to-r from-pink-900/70 to-black/70 text-white' : 
             categoryTheme === 'cash' ? 'bg-gradient-to-r from-green-900/70 to-black/70 text-white' : 
             'bg-gradient-to-r from-cyan-900/70 to-black/70 text-white'}`}>
            <i className={`fas fa-ticket-alt mr-2 
              ${categoryTheme === 'family' ? 'text-amber-400' : 
               categoryTheme === 'appliances' ? 'text-pink-400' : 
               categoryTheme === 'cash' ? 'text-green-400' : 
               'text-cyan-400'}`}></i>
            <span className="font-medium text-sm">{soldTickets || 50}/{totalTickets || 1000}</span>
          </div>
          
          {/* Enhanced overlay with category-specific gradient and title glow */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 backdrop-blur-sm
            ${categoryTheme === 'family' ? 'from-amber-950/95' : 
             categoryTheme === 'appliances' ? 'from-pink-950/95' : 
             categoryTheme === 'cash' ? 'from-green-950/95' : 
             'from-cyan-950/95'}`}>
            <h3 className="text-2xl font-bold relative">
              <span className={`relative z-10 ${
                categoryTheme === 'family' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100' : 
                categoryTheme === 'appliances' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-100' : 
                categoryTheme === 'cash' ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-green-100' : 
                'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-100'
              }`}>
                {title}
              </span>
              {/* Title glow effect */}
              <span className={`absolute inset-0 blur-sm opacity-60 ${
                categoryTheme === 'family' ? 'text-amber-300/30' : 
                categoryTheme === 'appliances' ? 'text-pink-300/30' : 
                categoryTheme === 'cash' ? 'text-green-300/30' : 
                'text-cyan-300/30'
              }`}>
                {title}
              </span>
            </h3>
          </div>
        </div>
        
        {/* Spacer between image and price info */}
        <div className="px-4 pt-3 pb-1"></div>
        
        {/* Countdown timer section - styled with category-specific gradients and animations */}
        {drawTime && (
          <div className="px-4 pt-3 pb-5 grid grid-cols-4 gap-2.5 mt-1">
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'appliances' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'cash' ? 'bg-transparent border-2 border-white/70' : 
                 'bg-transparent border-2 border-white/70'}`}>
                <span className="text-xl font-bold py-2 font-sans text-white relative">
                  <span className="hidden">
                    {timeRemaining?.days.toString().padStart(2, '0') || '00'}
                  </span>
                  <span className="relative">
                    {timeRemaining?.days.toString().padStart(2, '0') || '00'}
                  </span>
                </span>
              </div>
              <span className={`text-xs font-semibold mt-1 ${
                categoryTheme === 'family' ? 'text-amber-300' : 
                categoryTheme === 'appliances' ? 'text-pink-300' : 
                categoryTheme === 'cash' ? 'text-green-300' : 
                'text-cyan-300'
              }`}>DAYS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'appliances' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'cash' ? 'bg-transparent border-2 border-white/70' : 
                 'bg-transparent border-2 border-white/70'}`}>
                <span className="text-xl font-bold py-2 font-sans text-white relative">
                  <span className="hidden">
                    {timeRemaining?.hours.toString().padStart(2, '0') || '00'}
                  </span>
                  <span className="relative">
                    {timeRemaining?.hours.toString().padStart(2, '0') || '00'}
                  </span>
                </span>
              </div>
              <span className={`text-xs font-semibold mt-1 ${
                categoryTheme === 'family' ? 'text-amber-300' : 
                categoryTheme === 'appliances' ? 'text-pink-300' : 
                categoryTheme === 'cash' ? 'text-green-300' : 
                'text-cyan-300'
              }`}>HOURS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center 
                ${categoryTheme === 'family' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'appliances' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'cash' ? 'bg-transparent border-2 border-white/70' : 
                 'bg-transparent border-2 border-white/70'}`}>
                <span className="text-xl font-bold py-2 font-sans text-white relative">
                  <span className="hidden">
                    {timeRemaining?.minutes.toString().padStart(2, '0') || '00'}
                  </span>
                  <span className="relative">
                    {timeRemaining?.minutes.toString().padStart(2, '0') || '00'}
                  </span>
                </span>
              </div>
              <span className={`text-xs font-semibold mt-1 ${
                categoryTheme === 'family' ? 'text-amber-300' : 
                categoryTheme === 'appliances' ? 'text-pink-300' : 
                categoryTheme === 'cash' ? 'text-green-300' : 
                'text-cyan-300'
              }`}>MINS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-full text-white rounded-lg shadow-inner flex items-center justify-center animate-pulse
                ${categoryTheme === 'family' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'appliances' ? 'bg-transparent border-2 border-white/70' : 
                 categoryTheme === 'cash' ? 'bg-transparent border-2 border-white/70' : 
                 'bg-transparent border-2 border-white/70'}`}>
                <span className="text-xl font-bold py-2 font-sans text-white relative">
                  <span className="hidden">
                    {timeRemaining?.seconds.toString().padStart(2, '0') || '00'}
                  </span>
                  <span className="relative">
                    {timeRemaining?.seconds.toString().padStart(2, '0') || '00'}
                  </span>
                </span>
              </div>
              <span className={`text-xs font-semibold mt-1 ${
                categoryTheme === 'family' ? 'text-amber-300' : 
                categoryTheme === 'appliances' ? 'text-pink-300' : 
                categoryTheme === 'cash' ? 'text-green-300' : 
                'text-cyan-300'
              }`}>SECS</span>
            </div>
          </div>
        )}
        
        {/* Enhanced footer section with premium price display and glowing button */}
        <div className={`border-t border-gray-700/30 flex items-center backdrop-blur-sm rounded-b-2xl overflow-hidden 
          ${categoryTheme === 'family' ? 'bg-gradient-to-br from-gray-900/95 to-amber-950/20' : 
           categoryTheme === 'appliances' ? 'bg-gradient-to-br from-gray-900/95 to-pink-950/20' : 
           categoryTheme === 'cash' ? 'bg-gradient-to-br from-gray-900/95 to-green-950/20' : 
           'bg-gradient-to-br from-gray-900/95 to-cyan-950/20'}`}>
          <div className="flex-1 pl-4 py-3">
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                £{(ticketPrice ? ticketPrice/100 : 0).toFixed(2)}
              </span>
              <span className="text-sm ml-1 text-white">
                per ticket
              </span>
            </div>
            <span className="text-xs font-medium block mt-0.5 text-white">
              <i className="fas fa-ticket-alt mr-1"></i>
              {(totalTickets && soldTickets) ? (totalTickets - soldTickets) : 950} available
            </span>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              setTicketModalOpen(true);
            }}
            disabled={isPaying}
            className={`group px-7 py-3 h-full text-white font-bold text-sm transition-all duration-300 rounded-l-2xl rounded-r-none shadow-lg 
              bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 hover:from-yellow-500 hover:via-yellow-300 hover:to-yellow-400 
              hover:shadow-[0_0_25px_rgba(251,191,36,0.8)] relative overflow-hidden border-2 border-yellow-300/70`}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-100/60 to-transparent shine-effect-fast" />
            <span className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')]"></span>
            <span className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-yellow-200/30 to-transparent"></span>
            <span className="relative z-10 flex items-center justify-center text-shadow drop-shadow-md font-bold">
              <i className="fas fa-ticket-alt mr-2 text-white"></i>
              GET TICKETS
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
