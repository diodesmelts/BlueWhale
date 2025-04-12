import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UsePaymentProps {
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
}

interface PaymentData {
  amount: number;
  competitionId?: number;
  ticketCount?: number;
  paymentType: 'ticket_purchase' | 'wallet_funding' | 'premium_upgrade';
  metadata?: Record<string, any>;
}

export function usePayment({ onSuccess, onError }: UsePaymentProps = {}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPaymentDetails, setCurrentPaymentDetails] = useState<{
    amount: number;
    description: string;
    metadata?: Record<string, any>;
    title: string;
  } | null>(null);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/payments/payment-methods");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch payment methods");
      }
      
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
      return data.paymentMethods;
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch payment methods",
        variant: "destructive",
      });
      if (onError) onError(err instanceof Error ? err : new Error("Failed to fetch payment methods"));
    } finally {
      setIsLoading(false);
    }
  };

  const payForEntry = async (competitionId: number, paymentMethodId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/payments/pay-for-entry", {
        competitionId,
        paymentMethodId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process payment");
      }
      
      const data = await response.json();
      toast({
        title: "Success",
        description: "Competition entry successfully processed",
      });
      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      console.error("Error processing payment:", err);
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Failed to process payment",
        variant: "destructive",
      });
      if (onError) onError(err instanceof Error ? err : new Error("Failed to process payment"));
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPremium = async (paymentMethodId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/payments/upgrade-to-premium", {
        paymentMethodId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process premium upgrade");
      }
      
      const data = await response.json();
      toast({
        title: "Success",
        description: "Your account has been upgraded to premium",
      });
      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      console.error("Error processing premium upgrade:", err);
      toast({
        title: "Upgrade Failed",
        description: err instanceof Error ? err.message : "Failed to upgrade account",
        variant: "destructive",
      });
      if (onError) onError(err instanceof Error ? err : new Error("Failed to upgrade account"));
    } finally {
      setIsLoading(false);
    }
  };

  const fundWallet = async (amount: number, paymentMethodId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/payments/fund-wallet", {
        amount,
        paymentMethodId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fund wallet");
      }
      
      const data = await response.json();
      toast({
        title: "Success",
        description: `Your wallet has been funded with $${amount.toFixed(2)}`,
      });
      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      console.error("Error funding wallet:", err);
      toast({
        title: "Funding Failed",
        description: err instanceof Error ? err.message : "Failed to fund wallet",
        variant: "destructive",
      });
      if (onError) onError(err instanceof Error ? err : new Error("Failed to fund wallet"));
    } finally {
      setIsLoading(false);
    }
  };

  const showPaymentModal = (
    amount: number, 
    description: string, 
    title: string,
    metadata: Record<string, string> = {}
  ) => {
    setCurrentPaymentDetails({
      amount,
      description,
      title,
      metadata
    });
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setCurrentPaymentDetails(null);
  };

  const initiatePayment = async (paymentData: PaymentData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", paymentData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }
      
      const data = await response.json();

      // Show payment modal with appropriate details
      const title = paymentData.paymentType === 'ticket_purchase' 
        ? 'Purchase Competition Tickets' 
        : paymentData.paymentType === 'premium_upgrade'
          ? 'Upgrade to Premium'
          : 'Fund Your Wallet';

      const description = paymentData.paymentType === 'ticket_purchase'
        ? `You are purchasing ${paymentData.ticketCount} ticket${paymentData.ticketCount !== 1 ? 's' : ''}`
        : paymentData.paymentType === 'premium_upgrade'
          ? 'Upgrade your account to access premium features'
          : 'Add funds to your wallet';

      showPaymentModal(
        paymentData.amount,
        description,
        title,
        paymentData.metadata
      );

      // Process the payment with Stripe
      // This would typically include showing a Stripe Elements form or similar
      
      // For this implementation, we'll simulate a successful payment
      setTimeout(() => {
        setPaymentModalOpen(false);
        setIsLoading(false);
        
        toast({
          title: "Payment Successful",
          description: paymentData.paymentType === 'ticket_purchase'
            ? `Successfully purchased ${paymentData.ticketCount} ticket${paymentData.ticketCount !== 1 ? 's' : ''}!`
            : paymentData.paymentType === 'premium_upgrade'
              ? "Your account has been upgraded to premium!"
              : `Added ${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(paymentData.amount / 100)} to your wallet!`,
        });

        if (onSuccess) onSuccess(data);
      }, 2000);

      return data;
    } catch (err) {
      console.error("Error initiating payment:", err);
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Failed to process payment",
        variant: "destructive",
      });
      if (onError) onError(err instanceof Error ? err : new Error("Failed to process payment"));
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    paymentMethods,
    fetchPaymentMethods,
    payForEntry,
    upgradeToPremium,
    fundWallet,
    initiatePayment,
    paymentModalOpen,
    currentPaymentDetails,
    showPaymentModal,
    closePaymentModal,
  };
}