import { useState, useEffect } from "react";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet, CreditCard, AppleIcon } from "lucide-react";
import PaymentForm from "./PaymentForm";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  amount: number; // In cents
  description: string;
  metadata?: Record<string, string>;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  amount,
  description,
  metadata = {},
}: PaymentModalProps) {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("card");

  // Format amount for display
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent();
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", {
        amount,
        description,
        metadata,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Payment intent creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to set up payment");
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Failed to set up payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    });
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleError = (error: Error) => {
    toast({
      title: "Payment Failed",
      description: error.message || "There was an error processing your payment.",
      variant: "destructive",
    });
  };

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6366f1",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        borderRadius: "0.5rem",
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !clientSecret ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <Tabs defaultValue="card" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="apple-pay" className="flex items-center gap-2">
                  <AppleIcon className="h-4 w-4" />
                  Apple Pay
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card">
                <PaymentForm 
                  onSuccess={handleSuccess}
                  onError={handleError}
                  amountLabel={`Total: ${formattedAmount}`}
                  buttonText="Pay Now"
                  isSubmitting={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="apple-pay">
                <div className="text-center py-6">
                  <p className="mb-4 font-medium">Total: {formattedAmount}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to pay with Apple Pay.
                  </p>
                  <PaymentForm 
                    onSuccess={handleSuccess}
                    onError={handleError}
                    buttonText="Pay with Apple Pay"
                    isSubmitting={isLoading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}