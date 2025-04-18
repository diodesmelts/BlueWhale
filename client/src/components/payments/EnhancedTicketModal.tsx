import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import TicketSelectionGrid from "./TicketSelectionGrid";
import { Check, ShoppingCart, Ticket } from "lucide-react";

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
      <DialogContent className="sm:max-w-3xl p-6 gap-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              Maximum tickets per user: {competition.maxTicketsPerUser || 3}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        {/* Show ticket confirmation overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-white z-50 flex items-center justify-center rounded-lg">
            <div className="w-full max-w-lg p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6">
                <div className="relative">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                    <path d="M40 0L44.8 31.2L76 36L44.8 40.8L40 72L35.2 40.8L4 36L35.2 31.2L40 0Z" fill="#F97316"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ticket className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Tickets Added!</h3>
              <p className="mb-6 text-gray-700">
                Ticket Number {selectedNumbers.join(', ')} has been added to your cart.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 py-3 h-auto text-lg"
                  onClick={handleGoToCart}
                >
                  GO TO CART
                </Button>
                <Button 
                  variant="outline"
                  className="w-full py-3 h-auto text-lg border-gray-300"
                  onClick={() => setShowConfirmation(false)}
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Ticket selection grid */}
        <TicketSelectionGrid 
          totalTickets={competition.totalTickets}
          soldTickets={competition.soldTickets}
          maxSelectable={competition.maxTicketsPerUser}
          selectedNumbers={selectedNumbers}
          onSelectNumbers={handleSelectNumbers}
          competitionType={competition.type}
          userTickets={userTickets}
        />
        
        {/* Bottom action buttons - Hidden when dialog loads */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleAddToCart}
            disabled={selectedNumbers.length === 0 || isProcessing}
            className={`w-full h-14 text-lg font-medium ${
              selectedNumbers.length > 0
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-300'
            } text-white`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>GO TO CART</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}