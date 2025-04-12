import React, { createContext, useContext, useState, ReactNode } from 'react';
import PaymentModal from './PaymentModal';

interface PaymentContextType {
  showPaymentModal: (
    amount: number, 
    description: string,
    actionText: string,
    metadata?: Record<string, string>
  ) => void;
  hidePaymentModal: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
}

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [actionText, setActionText] = useState('Pay Now');
  const [metadata, setMetadata] = useState<Record<string, string> | undefined>(undefined);

  const showPaymentModal = (
    amount: number, 
    description: string,
    actionText: string = 'Pay Now',
    metadata?: Record<string, string>
  ) => {
    setPaymentAmount(amount);
    setDescription(description);
    setActionText(actionText);
    setMetadata(metadata);
    setIsOpen(true);
  };

  const hidePaymentModal = () => {
    setIsOpen(false);
  };

  return (
    <PaymentContext.Provider value={{ showPaymentModal, hidePaymentModal }}>
      {children}
      <PaymentModal 
        isOpen={isOpen} 
        onClose={hidePaymentModal} 
        amount={paymentAmount} 
        description={description}
        actionText={actionText}
        metadata={metadata}
      />
    </PaymentContext.Provider>
  );
}