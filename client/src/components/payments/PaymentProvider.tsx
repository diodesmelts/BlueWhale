import { ReactNode, createContext, useContext, useState } from "react";
import { usePayment } from "@/hooks/use-payment";
import PaymentModal from "./PaymentModal";

interface PaymentContextValue {
  isLoading: boolean;
  paymentMethods: any[];
  fetchPaymentMethods: () => Promise<any[] | undefined>;
  payForEntry: (competitionId: number, paymentMethodId: string) => Promise<any>;
  upgradeToPremium: (paymentMethodId: string) => Promise<any>;
  fundWallet: (amount: number, paymentMethodId: string) => Promise<any>;
  showPaymentModal: (amount: number, description: string, title: string, metadata?: Record<string, string>) => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const {
    isLoading,
    paymentMethods,
    fetchPaymentMethods,
    payForEntry,
    upgradeToPremium,
    fundWallet,
    paymentModalOpen,
    currentPaymentDetails,
    showPaymentModal,
    closePaymentModal,
  } = usePayment();

  return (
    <PaymentContext.Provider
      value={{
        isLoading,
        paymentMethods,
        fetchPaymentMethods,
        payForEntry,
        upgradeToPremium,
        fundWallet,
        showPaymentModal,
      }}
    >
      {children}
      
      {paymentModalOpen && currentPaymentDetails && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={closePaymentModal}
          onSuccess={() => {
            // Additional logic could be added here if needed
            closePaymentModal();
          }}
          amount={currentPaymentDetails.amount}
          description={currentPaymentDetails.description}
          title={currentPaymentDetails.title}
          metadata={currentPaymentDetails.metadata}
        />
      )}
    </PaymentContext.Provider>
  );
}

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
}