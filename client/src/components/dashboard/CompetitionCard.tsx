import { useState } from "react";
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
}

export default function CompetitionCard({ 
  competition, 
  onEnter, 
  onBookmark, 
  onLike, 
  onCompleteEntry 
}: CompetitionCardProps) {
  const { user } = useAuth();
  const { showPaymentModal } = usePaymentContext();
  const [isPaying, setIsPaying] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
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
        className={`competition-card mb-5 transition duration-300 rounded-xl bg-white shadow-md hover:shadow-lg border border-gray-100 overflow-hidden ${
          isEntered ? 'border-l-4 border-rose-500' : ''
        } cursor-pointer`}
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        {/* Competition image at the top - square format */}
        <div 
          className="aspect-square w-full bg-center bg-cover relative"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Title overlaid on image - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center">
              <h3 className="text-xl font-bold flex items-center">
                {title}
                {isVerified && (
                  <Badge 
                    variant="default" 
                    className="ml-2 bg-blue-100/80 text-blue-600 hover:bg-blue-200 text-xs font-normal flex items-center"
                  >
                    <i className="fas fa-check-circle mr-1"></i> Verified
                  </Badge>
                )}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Draw countdown timer - more prominent */}
          {drawTime && (
            <div className="p-3 rounded-lg mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center mb-1">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mr-1">Prize Draw</span>
                <div className="h-px flex-grow bg-gradient-to-r from-blue-200 to-indigo-200"></div>
              </div>
              <CountdownTimer 
                targetDate={drawTime} 
                compact={true} 
                className="py-1"
              />
            </div>
          )}
          
          {/* Simplified ticket information */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-base font-medium text-blue-800">
                <i className="fas fa-ticket-alt mr-1 text-blue-700"></i> ${(ticketPrice ? ticketPrice/100 : 0).toFixed(2)} per ticket
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                <span className="font-semibold text-blue-700">{(totalTickets && soldTickets) ? 
                  (totalTickets - soldTickets).toLocaleString() : 950}</span> tickets available
              </span>
              <span className="text-gray-600">
                Total: <span className="font-semibold text-blue-700">{totalTickets ? 
                  totalTickets.toLocaleString() : 1000}</span>
              </span>
            </div>
            
            {/* Ticket sales progress bar */}
            <div className="mt-2 mb-1">
              <div className="h-2.5 w-full bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ 
                    width: `${(totalTickets && soldTickets) ? 
                    Math.min(100, Math.round((soldTickets / totalTickets) * 100)) : 5}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              // Always open the ticket modal when the "Get Tickets" button is clicked
              setTicketModalOpen(true);
            }}
            disabled={isPaying}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-ticket-alt mr-2"></i>
            Get Tickets
          </Button>
        </div>
      </div>
    </>
  );
}
