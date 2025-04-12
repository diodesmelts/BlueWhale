import { useState, useEffect } from 'react';
import { Check, Loader2, Minus, Plus, Ticket } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/use-payment';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { CompetitionWithEntryStatus } from '@shared/types';

interface TicketPurchaseModalProps {
  competition: CompetitionWithEntryStatus;
  open: boolean;
  onClose: () => void;
}

interface TicketPurchaseFormValues {
  ticketCount: number;
}

export default function TicketPurchaseModal({ competition, open, onClose }: TicketPurchaseModalProps) {
  const [step, setStep] = useState<'select' | 'payment' | 'confirmation'>('select');
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { user } = useAuth();
  const { initiatePayment } = usePayment({
    onSuccess: () => {
      setSuccessMessage(`Successfully purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}!`);
      setStep('confirmation');
      
      // Refresh competitions data
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  });

  // Form to handle ticket count
  const form = useForm<TicketPurchaseFormValues>({
    defaultValues: {
      ticketCount: 1
    }
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('select');
      setTicketCount(1);
      setLoading(false);
      setSuccessMessage('');
    }
  }, [open]);

  const handleIncrement = () => {
    if (competition.maxTicketsPerUser && ticketCount >= competition.maxTicketsPerUser) {
      toast({
        title: "Maximum Limit Reached",
        description: `You can only purchase up to ${competition.maxTicketsPerUser} tickets per competition.`,
        variant: "default",
      });
      return;
    }
    setTicketCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create an entry first or update existing one
      const entryResponse = await apiRequest('POST', `/api/competitions/${competition.id}/enter`, {
        ticketCount
      });

      if (!entryResponse.ok) {
        const errorData = await entryResponse.json();
        throw new Error(errorData.message || 'Failed to enter competition');
      }

      const entryData = await entryResponse.json();

      // Check if payment is needed
      if (competition.ticketPrice && competition.ticketPrice > 0) {
        setStep('payment');
        
        // Calculate total amount
        const amount = ticketCount * competition.ticketPrice;
        
        // Initiate payment
        await initiatePayment({
          amount,
          competitionId: competition.id,
          ticketCount,
          paymentType: 'ticket_purchase',
          metadata: {
            competition: competition.title,
            tickets: ticketCount,
            userId: user.id
          }
        });
      } else {
        // Free tickets
        setSuccessMessage(`Successfully entered with ${ticketCount} free ticket${ticketCount > 1 ? 's' : ''}!`);
        setStep('confirmation');
        
        // Refresh competitions data
        queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Tickets</DialogTitle>
              <DialogDescription>
                Select how many tickets you would like to purchase for {competition.title}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ticket Price:</h3>
                  <p className="text-sm text-gray-500">Per ticket</p>
                </div>
                <div className="font-medium">
                  {competition.ticketPrice ? formatCurrency(competition.ticketPrice) : 'Free'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Number of Tickets:</h3>
                <div className="flex items-center space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDecrement}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number" 
                    min="1"
                    max={competition.maxTicketsPerUser}
                    value={ticketCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1) {
                        if (competition.maxTicketsPerUser && value > competition.maxTicketsPerUser) {
                          setTicketCount(competition.maxTicketsPerUser);
                        } else {
                          setTicketCount(value);
                        }
                      }
                    }}
                    className="w-16 text-center"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={handleIncrement}
                    disabled={competition.maxTicketsPerUser ? ticketCount >= competition.maxTicketsPerUser : false}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {competition.maxTicketsPerUser && (
                <p className="text-sm text-gray-500">
                  Maximum {competition.maxTicketsPerUser} tickets per user
                </p>
              )}
              
              <div className="flex items-center justify-between border-t pt-4">
                <h3 className="font-bold">Total:</h3>
                <div className="font-bold text-lg">
                  {competition.ticketPrice 
                    ? formatCurrency(competition.ticketPrice * ticketCount) 
                    : 'Free'}
                </div>
              </div>
              
              {competition.totalTickets && competition.soldTickets && (
                <div className="text-sm text-gray-500 pt-2">
                  {competition.soldTickets} / {competition.totalTickets} tickets sold
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handlePurchase} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  <>
                    {competition.ticketPrice && competition.ticketPrice > 0 
                      ? 'Continue to Payment' 
                      : 'Enter for Free'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        );
      
      case 'payment':
        // The payment form is handled by the usePayment hook
        return (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                Enter your payment details to complete your ticket purchase.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Total Amount:</h3>
                <div className="font-bold text-lg">
                  {formatCurrency(competition.ticketPrice * ticketCount)}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                You are purchasing {ticketCount} ticket{ticketCount > 1 ? 's' : ''} for {competition.title}.
              </p>
              
              <div className="h-6"></div> {/* Spacer for payment form */}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                disabled={loading}
              >
                Back
              </Button>
            </DialogFooter>
          </>
        );
      
      case 'confirmation':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Successful!</DialogTitle>
              <DialogDescription>
                Your tickets have been confirmed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">{successMessage}</p>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Ticket className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{ticketCount} Ticket{ticketCount > 1 ? 's' : ''}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                You can view your entries in the "My Entries" section.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Done
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}