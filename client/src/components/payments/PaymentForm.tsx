import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  amountLabel?: string;
  buttonText?: string;
  processingText?: string;
  successText?: string;
  isSubmitting?: boolean;
}

export default function PaymentForm({
  onSuccess,
  onError,
  amountLabel,
  buttonText = "Pay Now",
  processingText = "Processing payment...",
  successText = "Payment successful!",
  isSubmitting = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred");
      setIsProcessing(false);
      if (onError) onError(error);
    } else {
      // Payment succeeded
      setIsComplete(true);
      setIsProcessing(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {amountLabel && (
        <div className="text-xl font-semibold mb-4 text-center">{amountLabel}</div>
      )}
      
      <div className="bg-card rounded-lg p-4 border border-border">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-3 rounded-md">
          <AlertTriangle size={16} />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing || isComplete || isSubmitting}
        className="w-full"
      >
        {isComplete ? (
          <span className="flex items-center gap-2">
            <Check size={16} />
            {successText}
          </span>
        ) : isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
            {processingText}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={16} />
            {buttonText}
          </span>
        )}
      </Button>
    </form>
  );
}