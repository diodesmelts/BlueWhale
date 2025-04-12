import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (ticketCount: number) => void;
  competition: {
    title: string;
    ticketPrice: number | null;
    maxTicketsPerUser: number | null;
    totalTickets: number | null;
    soldTickets: number | null;
  };
}

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
  competition,
}: TicketPurchaseModalProps) {
  const { title, ticketPrice, maxTicketsPerUser, totalTickets, soldTickets } = competition;
  
  const pricePerTicket = ticketPrice ? ticketPrice / 100 : 0; // Convert cents to dollars
  const maxTickets = maxTicketsPerUser || 10;
  const availableTickets = totalTickets && soldTickets ? totalTickets - soldTickets : 100;
  const actualMaxTickets = Math.min(maxTickets, availableTickets);
  
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    setIsProcessing(true);
    onPurchase(ticketCount);
  };
  
  const totalPrice = (pricePerTicket * ticketCount).toFixed(2);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Price per ticket:</span>
              <span className="font-semibold">${pricePerTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Number of tickets:</span>
              <span className="font-semibold">{ticketCount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span className="text-primary">${totalPrice}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            <p className="flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Maximum tickets per user: {maxTickets}
            </p>
            <p className="mt-1 flex items-center">
              <i className="fas fa-ticket-alt mr-2"></i>
              Available tickets: {availableTickets}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={isProcessing}
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
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