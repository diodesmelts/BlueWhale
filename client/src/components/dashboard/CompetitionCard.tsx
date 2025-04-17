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
      
      <div className="competition-card mb-5 overflow-hidden rounded-xl bg-amber-50 shadow-md cursor-pointer"
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        {/* Top section with image or colored background */}
        <div 
          className="w-full h-56 bg-center bg-cover relative overflow-hidden"
          style={{ backgroundImage: `url(${image})` }}
        >
          {/* Tickets sold indicator */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {soldTickets || 50}/{totalTickets || 100} tickets sold
          </div>
          
          {/* Title overlaid on image - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg text-center w-4/5">
              <h3 className="text-3xl font-extrabold text-white">
                {prize > 0 && (
                  <span className="block mb-1 text-cyan-300">£{(prize/100).toLocaleString()}</span>
                )}
                {title}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Title box below image */}
        <div className="bg-white p-3 text-center border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800 line-clamp-2">
            {title}
            {isVerified && (
              <Badge 
                variant="default" 
                className="ml-2 bg-blue-100/80 text-blue-600 hover:bg-blue-200 text-xs font-normal inline-flex items-center"
              >
                <i className="fas fa-check-circle mr-1"></i> Verified
              </Badge>
            )}
          </h3>
        </div>
        
        {/* Countdown timer section */}
        <div className="bg-amber-100 py-2 px-3">
          {drawTime && (
            <div className="flex justify-center space-x-1 mb-1">
              <div className="countdown-box">
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {Math.floor(timeRemaining?.days / 10) || 0}
                </div>
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {timeRemaining?.days % 10 || 0}
                </div>
              </div>
              <div className="text-blue-700 font-bold flex items-center">:</div>
              <div className="countdown-box">
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {Math.floor(timeRemaining?.hours / 10) || 0}
                </div>
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {timeRemaining?.hours % 10 || 0}
                </div>
              </div>
              <div className="text-blue-700 font-bold flex items-center">:</div>
              <div className="countdown-box">
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {Math.floor(timeRemaining?.minutes / 10) || 0}
                </div>
                <div className="w-8 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center text-xl font-bold">
                  {timeRemaining?.minutes % 10 || 0}
                </div>
              </div>
              <div className="text-blue-700 font-bold flex items-center">:</div>
              <div className="countdown-box">
                <div className="w-8 h-10 bg-cyan-600 text-white rounded-md flex items-center justify-center text-xl font-bold animate-pulse">
                  {Math.floor(timeRemaining?.seconds / 10) || 0}
                </div>
                <div className="w-8 h-10 bg-cyan-600 text-white rounded-md flex items-center justify-center text-xl font-bold animate-pulse">
                  {timeRemaining?.seconds % 10 || 0}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Ticket information */}
        <div className="bg-white py-2 px-3 text-center">
          <div className="flex justify-between items-center px-2">
            <div className="flex">
              <span className="text-xl font-bold text-blue-600">£{(ticketPrice ? ticketPrice/100 : 0).toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {(totalTickets && soldTickets) ? 
                (totalTickets - soldTickets) : 50} left
            </div>
          </div>
        </div>
        
        {/* Button */}
        <Button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            setTicketModalOpen(true);
          }}
          disabled={isPaying}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 text-base border-none rounded-none transition-all duration-300"
        >
          BUY TICKET
        </Button>
      </div>
    </>
  );
}
