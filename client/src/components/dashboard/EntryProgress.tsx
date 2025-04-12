import { Button } from "@/components/ui/button";
import { EntryStep } from "@shared/schema";
import { useState, useEffect } from "react";
import { CompetitionWithEntryStatus } from "@shared/types";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EntryProgressProps {
  steps: EntryStep[];
  progress: number[];
  onComplete: () => void;
  competition?: CompetitionWithEntryStatus; // Add competition prop for ticket modal
}

export default function EntryProgress({ steps, progress, onComplete, competition }: EntryProgressProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isPurchaseProcessing, setIsPurchaseProcessing] = useState(false);
  const completedCount = progress.filter(step => step === 1).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const isFullyCompleted = completedCount === steps.length;

  // Create a local copy of competition with ticket price
  // This is a temporary solution until we update the database schema
  const competitionWithTicket = competition ? {
    ...competition,
    ticketPrice: 999, // Set a fixed value for testing (9.99 USD)
    maxTicketsPerUser: 10,
    totalTickets: 100,
    soldTickets: competition.soldTickets || 0
  } : undefined;
  
  // Debug logging
  console.log('Competition in EntryProgress:', competition);
  console.log('Is fully completed:', isFullyCompleted);
  console.log('Modified competition:', competitionWithTicket);

  // Direct function to show ticket modal that can be called from anywhere
  const openTicketModal = () => {
    setIsProcessing(false);
    setShowTicketModal(true);
  };
  
  // If steps are already complete and button is clicked, 
  // automatically open ticket modal on render
  // Using the fixed competition object with ticket price
  // Force show ticket modal when component mounts if entry is complete
  useEffect(() => {
    // If entry is fully completed, show the modal directly
    if (isFullyCompleted && !showTicketModal) {
      const timer = setTimeout(() => {
        setShowTicketModal(true);
        setIsProcessing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFullyCompleted, showTicketModal]);
  
  const handleComplete = () => {
    setIsProcessing(true);
    
    // Call the onComplete function which will make the API request
    onComplete();
    
    // Always show the ticket modal after completing steps
    setTimeout(() => {
      setIsProcessing(false);
      setShowTicketModal(true); // Show modal directly
    }, 800);
  };
  
  const { toast } = useToast();
  
  const handlePurchaseTickets = (ticketCount: number) => {
    // If competition doesn't exist or has no ID, just close the modal
    if (!competitionWithTicket?.id) {
      setShowTicketModal(false);
      return;
    }
    
    // Set processing state to show spinner
    setIsPurchaseProcessing(true);
    
    // Log purchase attempt
    console.log('Purchasing', ticketCount, 'tickets for competition', competitionWithTicket);
    
    // Use apiRequest instead of fetch for consistency
    apiRequest('POST', `/api/competitions/${competitionWithTicket.id}/enter`, { 
      ticketCount,
      ticketPrice: competitionWithTicket.ticketPrice, // Send the ticket price we've set
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to purchase tickets');
        return res.json();
      })
      .then(data => {
        // Show success message with pricing
        const totalPrice = (competitionWithTicket.ticketPrice * ticketCount) / 100; // Convert cents to dollars
        toast({
          title: 'Tickets Purchased',
          description: `You have successfully purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for $${totalPrice.toFixed(2)}.`,
        });
        
        // Reset states
        setIsPurchaseProcessing(false);
        setShowTicketModal(false);
        
        // This will trigger a refresh of competitions in parent components
        if (typeof window !== 'undefined') {
          // Use React Query's cache invalidation in the parent component if possible
          // For now trigger a global event that parent components can listen to
          const event = new CustomEvent('ticket-purchase-complete', { 
            detail: { competitionId: competitionWithTicket.id } 
          });
          window.dispatchEvent(event);
          
          // If we need to force a full refresh
          // setTimeout(() => window.location.reload(), 1500);
        }
      })
      .catch(error => {
        console.error('Error purchasing tickets:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsPurchaseProcessing(false);
        setShowTicketModal(false);
      });
  };

  return (
    <>
      {/* Show ticket modal using our modified competition object with ticket price */}
      {competitionWithTicket && (
        <TicketPurchaseModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          onPurchase={handlePurchaseTickets}
          isProcessing={isPurchaseProcessing}
          competition={{
            title: competitionWithTicket.title,
            ticketPrice: competitionWithTicket.ticketPrice,
            maxTicketsPerUser: competitionWithTicket.maxTicketsPerUser,
            totalTickets: competitionWithTicket.totalTickets,
            soldTickets: competitionWithTicket.soldTickets
          }}
        />
      )}
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-rose-600">Entry Progress</h4>
          <span className={`text-sm font-medium ${isFullyCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
            {completedCount}/{steps.length} completed
          </span>
        </div>
        
        {/* Custom progress bar to avoid the warning */}
        <div className="h-2.5 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              {progress[index] === 1 ? (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white mr-2 animate-fade-in">
                  <i className="fas fa-check text-xs"></i>
                </div>
              ) : (
                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mr-2"></div>
              )}
              <span className={`text-sm ${progress[index] === 1 ? 'font-medium' : 'text-gray-500'}`}>
                {step.description}
                {step.link && (
                  <a 
                    href={step.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-500 hover:text-blue-700 ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    (Link)
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleComplete}
          disabled={isProcessing}
          className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium py-2 transition duration-300"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-circle-notch fa-spin mr-2"></i>
              Processing...
            </>
          ) : (
            isFullyCompleted ? 'Get Tickets' : 'Complete Entry'
          )}
        </Button>
      </div>
    </>
  );
}
