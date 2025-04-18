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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {competition.title} - Select Your Tickets
          </DialogTitle>
        </DialogHeader>
        
        {/* Price and ticket info */}
        <div className={`p-4 rounded-lg mb-4
          ${competition.type === 'family' ? 'bg-amber-50/50' : 
           competition.type === 'appliances' ? 'bg-pink-50/50' : 
           competition.type === 'cash' ? 'bg-green-50/50' : 
           'bg-blue-50/50'}`}>
          <div className="flex justify-between mb-2">
            <span>Price per ticket:</span>
            <span className={`font-semibold
              ${competition.type === 'family' ? 'text-amber-700' : 
               competition.type === 'appliances' ? 'text-pink-700' : 
               competition.type === 'cash' ? 'text-green-700' : 
               'text-blue-700'}`}>£{pricePerTicket}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Selected tickets:</span>
            <span className={`font-semibold
              ${competition.type === 'family' ? 'text-amber-700' : 
               competition.type === 'appliances' ? 'text-pink-700' : 
               competition.type === 'cash' ? 'text-green-700' : 
               'text-blue-700'}`}>{selectedNumbers.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total:</span>
            <span className={`
              ${competition.type === 'family' ? 'text-amber-700' : 
               competition.type === 'appliances' ? 'text-pink-700' : 
               competition.type === 'cash' ? 'text-green-700' : 
               'text-blue-700'}`}>£{totalPrice}</span>
          </div>
        </div>
        
        {/* Show ticket confirmation overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tickets Added!</h3>
              <p className="mb-4">
                Ticket Number {selectedNumbers.join(', ')} has been added to your cart.
              </p>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                  onClick={() => setShowConfirmation(false)}
                >
                  CLOSE
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleGoToCart}
                >
                  GO TO CART
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
        
        {/* Bottom action buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          {!isAdded ? (
            <Button
              onClick={handleAddToCart}
              disabled={selectedNumbers.length === 0 || isProcessing}
              className={`flex-1 ${
                selectedNumbers.length > 0
                  ? `bg-gradient-to-r ${
                      competition.type === 'family' ? 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' :
                      competition.type === 'appliances' ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700' : 
                      competition.type === 'cash' ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                      'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    }`
                  : 'bg-gray-300'
              } text-white`}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGoToCart}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}