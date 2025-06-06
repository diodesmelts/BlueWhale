import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard } from 'lucide-react';

// Initialize Stripe outside of component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  actionText: string;
  metadata?: Record<string, string>;
}

function CheckoutForm({
  amount,
  description,
  actionText,
  onClose,
  metadata
}: Omit<PaymentModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    // Get payment method
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setErrorMessage("Card element not found");
      setIsProcessing(false);
      return;
    }
    
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
        return;
      }
      
      // Make a request to our API to handle the payment
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          description,
          amount,
          metadata,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment successful",
          description: result.message || "Your payment was processed successfully",
        });
        onClose();
      } else if (result.requiresAction) {
        const { error } = await stripe.confirmCardPayment(result.clientSecret);
        if (error) {
          setErrorMessage(error.message || "Payment failed");
          setIsProcessing(false);
        } else {
          toast({
            title: "Payment successful",
            description: "Your payment was processed successfully",
          });
          onClose();
        }
      } else {
        setErrorMessage(result.error || "Payment failed");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "Payment failed");
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
          <div className="text-2xl font-bold text-gray-800">£{(amount / 100).toFixed(2)}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
        
        <Tabs 
          defaultValue="card" 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>Card</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="mt-4">
            <div className="flex flex-col bg-white rounded-lg p-4 border border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {errorMessage && (
          <div className="text-sm text-red-500 mt-2">
            {errorMessage}
          </div>
        )}
      </div>
      
      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 ${isProcessing ? 'opacity-70' : ''}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            actionText
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  actionText,
  metadata
}: PaymentModalProps) {
  useEffect(() => {
    // Reset any form state when the modal opens/closes
    if (!isOpen) {
      // Add any cleanup here
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Secure payment via Stripe
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            description={description}
            actionText={actionText}
            onClose={onClose}
            metadata={metadata}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}