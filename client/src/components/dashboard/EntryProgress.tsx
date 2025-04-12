import { Button } from "@/components/ui/button";
import { EntryStep } from "@shared/schema";
import { useState } from "react";
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
  const completedCount = progress.filter(step => step === 1).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const isFullyCompleted = completedCount === steps.length;

  const handleComplete = () => {
    setIsProcessing(true);
    
    // Call the onComplete function which will make the API request
    onComplete();
    
    // If competition is ticket-based, show ticket modal after short delay
    if (competition?.ticketPrice && competition.ticketPrice > 0) {
      setTimeout(() => {
        setIsProcessing(false);
        setShowTicketModal(true);
      }, 800); // Shorter delay for better UX
    } else {
      // For non-ticket competitions or when entry is not yet completed
      setTimeout(() => {
        setIsProcessing(false);
      }, 800);
    }
  };
  
  const { toast } = useToast();
  
  const handlePurchaseTickets = (ticketCount: number) => {
    // If competition doesn't exist or has no ID, just close the modal
    if (!competition?.id) {
      setShowTicketModal(false);
      return;
    }
    
    // Use apiRequest instead of fetch for consistency
    apiRequest('POST', `/api/competitions/${competition.id}/enter`, { ticketCount })
      .then(res => {
        if (!res.ok) throw new Error('Failed to purchase tickets');
        return res.json();
      })
      .then(data => {
        toast({
          title: 'Tickets Purchased',
          description: `You have successfully purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}.`,
        });
        setShowTicketModal(false);
        
        // This will trigger a refresh of competitions in parent components
        if (typeof window !== 'undefined') {
          // Use React Query's cache invalidation in the parent component if possible
          // For now trigger a global event that parent components can listen to
          const event = new CustomEvent('ticket-purchase-complete', { 
            detail: { competitionId: competition.id } 
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
        setShowTicketModal(false);
      });
  };

  return (
    <>
      {/* Only show ticket modal if competition data is provided */}
      {competition && (
        <TicketPurchaseModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          onPurchase={handlePurchaseTickets}
          competition={{
            title: competition.title,
            ticketPrice: competition.ticketPrice,
            maxTicketsPerUser: competition.maxTicketsPerUser,
            totalTickets: competition.totalTickets,
            soldTickets: competition.soldTickets
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
            isFullyCompleted ? (competition?.ticketPrice && competition.ticketPrice > 0 ? 'Get Tickets' : 'View Competition') : 'Complete Entry'
          )}
        </Button>
      </div>
    </>
  );
}
