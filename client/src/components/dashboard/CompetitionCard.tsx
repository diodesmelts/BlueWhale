import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EntryProgress from "./EntryProgress";
import { CompetitionWithEntryStatus } from "@shared/types";
import { usePaymentContext } from "@/components/payments/PaymentProvider";
import { useAuth } from "@/hooks/use-auth";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";
import { useLocation } from "wouter";

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
        {/* Competition image at the top */}
        <div 
          className="w-full h-48 bg-center bg-cover relative"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Bookmark button - top right */}
          <button 
            className={`absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ${
              isBookmarked ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              onBookmark(id);
            }}
          >
            <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
          </button>
          
          {/* Title overlaid on image - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center">
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
          {/* Key competition info */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center">
              <div className="text-xl text-center mb-1">🏆</div>
              <div className="text-base font-bold text-center">${prize.toLocaleString()}</div>
              <div className="text-xs text-gray-500 text-center">Prize</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl text-center mb-1">👥</div>
              <div className="text-base font-bold text-center">{entries}</div>
              <div className="text-xs text-gray-500 text-center">Entries</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl text-center mb-1">⏰</div>
              <div className="text-base font-bold text-center">
                {daysRemaining.includes("Ends in") 
                  ? daysRemaining.replace("Ends in ", "") 
                  : daysRemaining === "Ends tomorrow" 
                    ? "1 day" 
                    : "5 days"}
              </div>
              <div className="text-xs text-gray-500 text-center">Ends In</div>
            </div>
          </div>
          
          {/* Ticket information with progress bar */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-blue-800">
                <i className="fas fa-ticket-alt mr-1 text-blue-700"></i> ${(ticketPrice ? ticketPrice/100 : 0).toFixed(2)} per ticket
              </div>
              <div className="text-xs font-medium text-gray-600">
                Max {maxTicketsPerUser || 3} per user
              </div>
            </div>
            
            {/* Ticket sales progress bar */}
            <div className="mt-2 mb-1">
              <div className="h-2.5 w-full bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ 
                    width: `${(totalTickets && soldTickets) ? 
                    Math.min(100, Math.round((soldTickets / totalTickets) * 100)) : 30}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                <span className="font-semibold text-blue-700">{(totalTickets && soldTickets) ? 
                  (totalTickets - soldTickets).toLocaleString() : 1766}</span> available
              </span>
              <span className="text-gray-600">
                <span className="font-semibold text-blue-700">{(totalTickets && soldTickets) ? 
                  Math.min(100, Math.round((soldTickets / totalTickets) * 100)) : 30}%</span> sold
              </span>
              <span className="text-gray-600">
                Total: <span className="font-semibold text-blue-700">{totalTickets ? 
                  totalTickets.toLocaleString() : 10000}</span>
              </span>
            </div>
          </div>

          {/* Button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              isEntered ? setTicketModalOpen(true) : handleEnterCompetition();
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
