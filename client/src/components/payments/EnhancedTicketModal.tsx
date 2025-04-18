import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import TicketSelectionGrid from "./TicketSelectionGrid";
import { Check, ShoppingCart, Ticket, X } from "lucide-react";

interface EnhancedTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ticketCount: number, selectedNumbers: number[]) => void;
  competition: {
    id: number;
    title: string;
    ticketPrice: number | null;
    maxTicketsPerUser: number | null;
    totalTickets: number | null;
    soldTickets: number | null;
    type?: string;
  };
  isProcessing?: boolean;
  userTickets?: number[];
}

export default function EnhancedTicketModal({
  isOpen,
  onClose,
  onConfirm,
  competition,
  isProcessing = false,
  userTickets = []
}: EnhancedTicketModalProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isAdded, setIsAdded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNumbers([]);
      setIsAdded(false);
      setShowConfirmation(false);
    }
  }, [isOpen]);
  
  const handleSelectNumbers = (numbers: number[]) => {
    setSelectedNumbers(numbers);
  };
  
  const handleAddToCart = () => {
    if (selectedNumbers.length === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAdded(true);
    setShowConfirmation(true);
    
    // Auto-hide confirmation after 2 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000);
  };
  
  const handleGoToCart = () => {
    onConfirm(selectedNumbers.length, selectedNumbers);
  };
  
  const getPriceText = () => {
    const price = competition.ticketPrice ? competition.ticketPrice / 100 : 0;
    return `£${price.toFixed(2)}`;
  };
  
  const pricePerTicket = competition.ticketPrice 
    ? (competition.ticketPrice / 100).toFixed(2) 
    : "0.00";
    
  const totalPrice = competition.ticketPrice 
    ? ((competition.ticketPrice * selectedNumbers.length) / 100).toFixed(2)
    : "0.00";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 shadow-2xl text-white">
        <DialogTitle className="sr-only">Select Your Tickets</DialogTitle>
        
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              Select Your Tickets
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Main content */}
        <div className="p-6 max-h-[90vh] overflow-auto">
          {/* Ticket info */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Ticket Price</div>
              <div className="text-xl font-bold text-white">£{pricePerTicket}</div>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Maximum Tickets</div>
              <div className="text-xl font-bold text-white">{competition.maxTicketsPerUser || 3} per user</div>
            </div>
          </div>
          
          {/* Selected tickets summary */}
          {selectedNumbers.length > 0 && (
            <div className="mb-6 bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-blue-300">Selected Tickets</div>
                  <div className="text-white font-bold">
                    {selectedNumbers.length} ticket{selectedNumbers.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-300">Total</div>
                  <div className="text-xl font-bold text-white">£{totalPrice}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Ticket selection grid */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
            <TicketSelectionGrid 
              totalTickets={competition.totalTickets}
              soldTickets={competition.soldTickets}
              maxSelectable={competition.maxTicketsPerUser}
              selectedNumbers={selectedNumbers}
              onSelectNumbers={handleSelectNumbers}
              competitionType={competition.type}
              userTickets={userTickets}
            />
          </div>
          
          {/* Bottom action buttons */}
          <Button
            onClick={handleAddToCart}
            disabled={selectedNumbers.length === 0 || isProcessing}
            className="w-full py-4 h-auto text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg shadow-lg hover:shadow-blue-700/30 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>CONFIRM SELECTION</>
            )}
          </Button>
          
          <div className="mt-3 text-center text-sm text-gray-400">
            You can select up to {competition.maxTicketsPerUser} tickets in total
          </div>
        </div>
        
        {/* Confirmation overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-gray-900/95 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="w-full max-w-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-blue-600/30 blur-lg animate-pulse"></div>
                  <div className="bg-blue-600 rounded-full p-5 relative">
                    <Ticket className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Tickets Selected!</h3>
              <p className="mb-6 text-gray-300">
                {selectedNumbers.length === 1 
                  ? `Ticket #${selectedNumbers[0]} selected.`
                  : `Tickets #${selectedNumbers.join(', ')} selected.`}
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full py-6 h-auto text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg hover:shadow-lg hover:shadow-blue-700/30 transition-all duration-300 relative overflow-hidden group"
                  onClick={handleGoToCart}
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  PROCEED TO PAYMENT
                </Button>
                <Button 
                  variant="outline"
                  className="w-full py-3 h-auto border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-500"
                  onClick={() => setShowConfirmation(false)}
                >
                  SELECT MORE TICKETS
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}