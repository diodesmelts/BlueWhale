import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (ticketCount: number, selectedNumbers?: number[]) => void;
  competition: {
    title: string;
    ticketPrice: number | null;
    maxTicketsPerUser: number | null;
    totalTickets: number | null;
    soldTickets: number | null;
    type?: string;
  };
  isProcessing?: boolean;
}

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
  competition,
  isProcessing: externalProcessing,
}: TicketPurchaseModalProps) {
  const { title, ticketPrice, maxTicketsPerUser, totalTickets, soldTickets } = competition;
  
  const pricePerTicket = ticketPrice ? ticketPrice / 100 : 0; // Convert cents to dollars
  const maxTickets = maxTicketsPerUser || 10;
  const availableTickets = totalTickets && soldTickets ? totalTickets - soldTickets : 100;
  const actualMaxTickets = Math.min(maxTickets, availableTickets);
  
  const [ticketCount, setTicketCount] = useState(1);
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [useLuckyDip, setUseLuckyDip] = useState(false);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  
  // Use external processing state if provided, otherwise use internal
  const isProcessing = externalProcessing !== undefined ? externalProcessing : internalProcessing;
  
  // Generate lucky dip numbers when ticket count changes or lucky dip is toggled
  useEffect(() => {
    if (useLuckyDip) {
      const newLuckyNumbers: number[] = [];
      // To make this feel more random, we'll add a slight delay
      const timer = setTimeout(() => {
        // Generate random numbers based on available tickets
        // Ensure we don't pick the same number twice
        const soldTicketsArray = Array.from({ length: soldTickets || 0 }, (_, i) => i + 1);
        const availableNumbersPool = Array.from(
          { length: totalTickets || 100 }, 
          (_, i) => i + 1
        ).filter(num => !soldTicketsArray.includes(num));
        
        // Shuffle array to get random numbers
        const shuffled = [...availableNumbersPool].sort(() => 0.5 - Math.random());
        
        // Pick ticketCount numbers
        for (let i = 0; i < Math.min(ticketCount, shuffled.length); i++) {
          newLuckyNumbers.push(shuffled[i]);
        }
        
        setLuckyNumbers(newLuckyNumbers);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setLuckyNumbers([]);
    }
  }, [ticketCount, useLuckyDip, totalTickets, soldTickets]);
  
  const handleTicketCountChange = (value: number[]) => {
    setTicketCount(value[0]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= actualMaxTickets) {
      setTicketCount(value);
    }
  };
  
  const handlePurchase = () => {
    // Only update internal state if we're not using external state
    if (externalProcessing === undefined) {
      setInternalProcessing(true);
    }
    // Pass lucky numbers if using lucky dip, otherwise just pass the ticket count
    if (useLuckyDip && luckyNumbers.length > 0) {
      onPurchase(ticketCount, luckyNumbers);
    } else {
      onPurchase(ticketCount);
    }
  };
  
  const totalPrice = (pricePerTicket * ticketCount).toFixed(2);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Purchase Tickets</DialogTitle>
          <DialogDescription>
            Increase your chances of winning {title} by purchasing multiple tickets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ticketCount" className="text-left">
              Number of Tickets
            </Label>
            <Input
              id="ticketCount"
              className="w-20 text-center"
              type="number"
              min={1}
              max={actualMaxTickets}
              value={ticketCount}
              onChange={handleInputChange}
            />
          </div>
          
          <Slider
            value={[ticketCount]}
            min={1}
            max={actualMaxTickets}
            step={1}
            onValueChange={handleTicketCountChange}
            className="my-4"
          />
          
          <div className={`p-4 rounded-lg
            ${competition.type === 'family' ? 'bg-amber-50/50' : 
             competition.type === 'appliances' ? 'bg-pink-50/50' : 
             competition.type === 'cash' ? 'bg-green-50/50' : 
             'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span>Price per ticket:</span>
              <span className={`font-semibold
                ${competition.type === 'family' ? 'text-amber-700' : 
                 competition.type === 'appliances' ? 'text-pink-700' : 
                 competition.type === 'cash' ? 'text-green-700' : 
                 'text-gray-700'}`}>£{pricePerTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Number of tickets:</span>
              <span className={`font-semibold
                ${competition.type === 'family' ? 'text-amber-700' : 
                 competition.type === 'appliances' ? 'text-pink-700' : 
                 competition.type === 'cash' ? 'text-green-700' : 
                 'text-gray-700'}`}>{ticketCount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span className={`
                ${competition.type === 'family' ? 'text-amber-700' : 
                 competition.type === 'appliances' ? 'text-pink-700' : 
                 competition.type === 'cash' ? 'text-green-700' : 
                 'text-primary'}`}>£{totalPrice}</span>
            </div>
          </div>
          
          {/* Lucky Dip Option */}
          <div className={`p-4 rounded-lg 
            ${competition.type === 'family' ? 'bg-amber-100/80' : 
             competition.type === 'appliances' ? 'bg-pink-100/80' : 
             competition.type === 'cash' ? 'bg-green-100/80' : 
             'bg-blue-100/80'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Sparkles className={`h-5 w-5 mr-2
                  ${competition.type === 'family' ? 'text-amber-500' : 
                   competition.type === 'appliances' ? 'text-pink-500' : 
                   competition.type === 'cash' ? 'text-green-500' : 
                   'text-blue-500'}`} />
                <Label htmlFor="luckyDip" className="font-medium">Lucky Dip Selection</Label>
              </div>
              <Switch 
                id="luckyDip" 
                checked={useLuckyDip}
                onCheckedChange={setUseLuckyDip}
                className={`
                  ${competition.type === 'family' ? 'data-[state=checked]:bg-amber-600' : 
                   competition.type === 'appliances' ? 'data-[state=checked]:bg-pink-600' : 
                   competition.type === 'cash' ? 'data-[state=checked]:bg-green-600' : 
                   'data-[state=checked]:bg-blue-600'}`}
              />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Let us pick your lucky ticket numbers from the available pool
            </p>
            
            {useLuckyDip && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-2">Your lucky numbers:</div>
                <div className="flex flex-wrap gap-2">
                  {luckyNumbers.length > 0 ? (
                    luckyNumbers.map(number => (
                      <span key={number} className={`px-3 py-1 rounded-full text-sm font-medium text-white
                        ${competition.type === 'family' ? 'bg-amber-500 border-amber-600' : 
                         competition.type === 'appliances' ? 'bg-pink-500 border-pink-600' : 
                         competition.type === 'cash' ? 'bg-green-500 border-green-600' : 
                         'bg-blue-500 border-blue-600'}`}>
                        #{number}
                      </span>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full py-2">
                      <div className={`animate-spin w-5 h-5 border-2 rounded-full 
                        ${competition.type === 'family' ? 'border-amber-500 border-t-transparent' : 
                         competition.type === 'appliances' ? 'border-pink-500 border-t-transparent' : 
                         competition.type === 'cash' ? 'border-green-500 border-t-transparent' : 
                         'border-blue-500 border-t-transparent'}`} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-lg text-sm
            ${competition.type === 'family' ? 'bg-amber-50 text-amber-700' : 
             competition.type === 'appliances' ? 'bg-pink-50 text-pink-700' : 
             competition.type === 'cash' ? 'bg-green-50 text-green-700' : 
             'bg-blue-50 text-blue-700'}`}>
            <p className="flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Maximum tickets per user: {maxTickets}
            </p>
            <p className="mt-1 flex items-center">
              <i className={`fas fa-ticket-alt mr-2
                ${competition.type === 'family' ? 'text-amber-600' : 
                 competition.type === 'appliances' ? 'text-pink-600' : 
                 competition.type === 'cash' ? 'text-green-600' : 
                 'text-blue-600'}`}></i>
              Available tickets: {availableTickets}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={isProcessing}
            className={`text-white
              ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 
               competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700' : 
               competition.type === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 
               'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-ticket-alt mr-2"></i>
                Purchase Tickets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}