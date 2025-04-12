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
        className={`competition-card p-5 mb-4 transition duration-300 rounded-xl bg-white shadow-md hover:shadow-lg border border-gray-100 ${
          isEntered ? 'border-l-4 border-rose-500' : ''
        } cursor-pointer`}
        onClick={() => setLocation(`/competitions/${id}`)}
      >
        <div className="flex flex-col">
          {/* Competition title and verification badge */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              {title}
              {isVerified && (
                <Badge 
                  variant="default" 
                  className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-normal flex items-center"
                >
                  <i className="fas fa-check-circle mr-1"></i> Verified
                </Badge>
              )}
            </h3>
            
            <div className="flex items-center space-x-2">
              <button 
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  isBookmarked ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  onBookmark(id);
                }}
              >
                <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
              </button>
            </div>
          </div>
          
          {/* Key information in 4 equal panels */}
          <div className="grid grid-cols-4 gap-3 mb-4">
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
                {daysRemaining.includes("Ends in") ? daysRemaining.replace("Ends in ", "") : "5 days left"}
              </div>
              <div className="text-xs text-gray-500 text-center">Ends In</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl text-center mb-1">🌎</div>
              <div className="text-base font-bold text-center">{eligibility}</div>
              <div className="text-xs text-gray-500 text-center">Eligibility</div>
            </div>
          </div>
          
          {/* Ticket information */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Price per ticket</div>
                <div className="text-lg font-bold text-blue-700">${(ticketPrice ? ticketPrice/100 : 0).toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Available tickets</div>
                <div className="text-lg font-bold text-blue-700">
                  {(totalTickets && soldTickets) ? (totalTickets - soldTickets) : 1766} / {totalTickets || 10000}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Maximum per user</div>
                <div className="text-lg font-bold text-blue-700">{maxTicketsPerUser || 3}</div>
              </div>
            </div>
          </div>

          {/* Button */}
          <Button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              isEntered ? setTicketModalOpen(true) : handleEnterCompetition();
            }}
            disabled={isPaying}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-ticket-alt mr-2"></i>
            Get Tickets
          </Button>
        </div>
      </div>
    </>
  );
}
