import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements, 
  PaymentElement,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard } from 'lucide-react';
import AppleIcon from '@/components/icons/AppleIcon';

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

  const [canUseApplePay, setCanUseApplePay] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [applePayError, setApplePayError] = useState<string | null>(null);
  
  // Check if Apple Pay is available
  useEffect(() => {
    if (stripe) {
      try {
        const pr = stripe.paymentRequest({
          country: 'GB',
          currency: 'gbp',
          total: {
            label: description,
            amount: amount,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });
        
        // Check if the Payment Request is supported
        pr.canMakePayment().then(result => {
          if (result && result.applePay) {
            setCanUseApplePay(true);
            setPaymentRequest(pr);
            setApplePayError(null);
          } else if (result) {
            // Payment Request API is available but not Apple Pay
            setApplePayError("Apple Pay is not available in your browser or device.");
          } else {
            // Payment Request API is not available
            setApplePayError("Your browser doesn't support Apple Pay.");
          }
        }).catch(err => {
          console.warn("Apple Pay check failed:", err);
          setApplePayError("Couldn't check Apple Pay availability. This may not work in development environments.");
        });
        
        // Handle payment method
        pr.on('paymentmethod', async (e: any) => {
          setIsProcessing(true);
          
          try {
            // Process payment on the server
            const response = await fetch('/api/payments/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount,
                paymentMethodId: e.paymentMethod.id,
                description,
                metadata
              }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              throw new Error(result.error || 'Payment failed');
            }
            
            // Complete the payment
            e.complete('success');
            
            // Show success message
            toast({
              title: 'Payment Successful',
              description: result.message || 'Your payment has been processed successfully.',
            });
            
            // Close the modal
            onClose();
          } catch (error: any) {
            e.complete('fail');
            setErrorMessage(error.message || 'An error occurred during payment processing.');
            toast({
              title: 'Payment Failed',
              description: error.message || 'There was an error processing your payment.',
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
        });
      } catch (error) {
        console.error("Error setting up payment request:", error);
        setApplePayError("Failed to initialize Apple Pay");
      }
    }
  }, [stripe, amount, description, metadata, onClose, toast]);

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
          onValueChange={(value) => {
            // Only set payment method if Apple Pay is available or if selecting card
            if (value === 'card' || (value === 'apple_pay' && canUseApplePay)) {
              setPaymentMethod(value as 'card' | 'apple_pay');
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>Card</span>
            </TabsTrigger>
            <TabsTrigger 
              value="apple_pay" 
              className={`flex items-center gap-2 ${!canUseApplePay ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                // Prevent tab change if Apple Pay is not available
                if (!canUseApplePay) {
                  e.preventDefault();
                  toast({
                    title: "Apple Pay Unavailable",
                    description: applePayError || "Apple Pay is not available in this environment. Please use a card payment instead.",
                    variant: "destructive"
                  });
                }
              }}
            >
              <AppleIcon size={16} />
              <span>Apple Pay</span>
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
          
          <TabsContent value="apple_pay" className="mt-4">
            {paymentRequest && (
              <div className="flex flex-col items-center justify-center p-4">
                <PaymentRequestButtonElement
                  options={{
                    paymentRequest,
                    style: {
                      paymentRequestButton: {
                        theme: 'dark',
                        height: '44px',
                      },
                    },
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Click the Apple Pay button above to pay securely
                </p>
              </div>
            )}
            {!paymentRequest && (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <AppleIcon size={40} className="mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Apple Pay Unavailable</h3>
                  <p className="text-sm text-gray-500">
                    {applePayError || 
                      "Apple Pay is not available in this environment. Please use a card payment instead."}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Note: Apple Pay requires HTTPS and domain registration in production environments.
                  </p>
                </div>
              </div>
            )}
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
        {paymentMethod === 'card' && (
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
        )}
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