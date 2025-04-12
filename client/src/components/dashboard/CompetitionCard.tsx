import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EntryProgress from "./EntryProgress";
import { CompetitionWithEntryStatus } from "@shared/types";
import { usePaymentContext } from "@/components/payments/PaymentProvider";
import { useAuth } from "@/hooks/use-auth";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";

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
            ticketCount: ticketCount.toString()
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
      
      <div className={`competition-card p-6 mb-5 transition duration-300 rounded-2xl bg-white shadow-lg hover:shadow-xl border border-gray-100 ${
        isEntered ? 'border-l-4 border-rose-500' : ''
      }`}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-shrink-0 md:w-1/4 lg:w-1/5 mb-5 md:mb-0">
            <div className="relative">
              <div 
                className="w-full h-44 bg-gray-200 rounded-xl bg-center bg-cover shadow-md overflow-hidden"
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              </div>
              
              {isVerified && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className="fas fa-check-circle mr-1"></i> Verified
                </div>
              )}
              
              {isEndingSoon && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <i className="fas fa-clock mr-1"></i> Ending Soon
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-3 space-x-2">
              <Badge 
                variant="default" 
                className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 text-xs font-medium px-2.5 py-1.5"
              >
                <i className="fas fa-gift mr-1"></i> Prize
              </Badge>
            </div>
          </div>
          
          <div className="md:ml-6 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  {title}
                  {isVerified && (
                    <Badge 
                      variant="default" 
                      className="ml-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 text-xs font-normal flex items-center"
                    >
                      <i className="fas fa-check-circle mr-1"></i> Verified
                    </Badge>
                  )}
                  {isEntered && (
                    <Badge 
                      variant="default" 
                      className="ml-2 bg-rose-100 text-rose-600 hover:bg-rose-200 text-xs font-normal"
                    >
                      Entered
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Organized by <span className="font-medium text-gray-700">{organizer}</span>
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    isBookmarked ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'
                  }`}
                  onClick={() => onBookmark(id)}
                >
                  <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                </button>
                <button 
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                  }`}
                  onClick={() => onLike(id)}
                >
                  <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 my-3 line-clamp-2">{description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col bg-rose-50 rounded-lg p-2 text-center">
                <span className="text-xs text-gray-500 mb-1">Prize Value</span>
                <span className="text-lg font-bold text-rose-600">${prize.toLocaleString()}</span>
              </div>
              <div className="flex flex-col bg-indigo-50 rounded-lg p-2 text-center">
                <span className="text-xs text-gray-500 mb-1">Participants</span>
                <span className="text-lg font-bold text-indigo-600">{entries.toLocaleString()}</span>
              </div>
              <div className="flex flex-col bg-amber-50 rounded-lg p-2 text-center">
                <span className="text-xs text-gray-500 mb-1">Eligibility</span>
                <span className="text-sm font-bold text-amber-600">{eligibility}</span>
              </div>
              <div className="flex flex-col bg-emerald-50 rounded-lg p-2 text-center">
                <span className="text-xs text-gray-500 mb-1">Timeframe</span>
                <span className={`text-sm font-bold ${isEndingSoon ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {daysRemaining}
                </span>
              </div>
            </div>
            
            {isEntered ? (
              <div className="mt-4">
                <EntryProgress 
                  steps={entrySteps}
                  progress={entryProgress}
                  onComplete={() => onCompleteEntry(id)}
                />
              </div>
            ) : (
              <div className="flex items-center mt-4">
                <Button 
                  onClick={handleEnterCompetition}
                  disabled={isPaying}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium px-6 py-2 mr-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg pulse-glow wiggle-on-hover"
                >
                  <i className="fas fa-trophy mr-2 trophy-icon"></i>
                  {ticketPrice && ticketPrice > 0 ? `Get Tickets - $${(ticketPrice/100).toFixed(2)}` : "Enter Now"}
                </Button>
                <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <i className="fas fa-list-check mr-2 text-indigo-500"></i>
                  <span>{entrySteps.length} entry steps</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
