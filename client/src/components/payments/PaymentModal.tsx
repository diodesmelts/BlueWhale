import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Get a reference to the card element
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      setErrorMessage('Payment form failed to load properly.');
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Process payment on the server
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethodId: paymentMethod.id,
          description,
          metadata
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      // Show success message
      toast({
        title: 'Payment Successful',
        description: result.message || 'Your payment has been processed successfully.',
      });

      // Close the modal
      onClose();
      
      // If there's a redirect URL in the response, navigate to it
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
      
      // If we need to handle the payment intent client-side (like 3D Secure)
      if (result.clientSecret) {
        const { error } = await stripe.confirmCardPayment(result.clientSecret);
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment processing.');
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error processing your payment.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
          <div className="text-2xl font-bold text-gray-800">${(amount / 100).toFixed(2)}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
        
        <div className="space-y-2">
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
          
          {errorMessage && (
            <div className="text-sm text-red-500 mt-2">
              {errorMessage}
            </div>
          )}
        </div>
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