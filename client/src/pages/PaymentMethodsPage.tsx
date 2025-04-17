import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { Shield, CreditCard, Lock } from "lucide-react";

export default function PaymentMethodsPage() {
  return (
    <StaticPageLayout 
      title="Payment Methods" 
      gradientColors="from-blue-600 to-indigo-600"
    >
      <div className="prose prose-lg max-w-none">
        <p className="mb-8 text-gray-700">
          At Blue Whale Competitions, we aim to provide secure, convenient payment options for all our customers. 
          Below you'll find information about the payment methods we accept and our security measures.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Accepted Payment Methods</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="mb-4 flex justify-center">
              <i className="fab fa-cc-visa text-blue-500 text-5xl mr-4"></i>
              <i className="fab fa-cc-mastercard text-red-500 text-5xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Credit & Debit Cards</h3>
            <p className="text-gray-600 text-center">
              We accept all major credit and debit cards, including Visa, Mastercard, and American Express. 
              Your card details are securely processed and never stored on our servers.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="mb-4 flex justify-center">
              <i className="fab fa-apple-pay text-black text-5xl mr-4"></i>
              <i className="fab fa-google-pay text-gray-700 text-5xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Digital Wallets</h3>
            <p className="text-gray-600 text-center">
              For added convenience, we accept Apple Pay and Google Pay, allowing you to make quick, 
              secure payments without entering your card details.
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Security</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center">
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Secure Processing</h3>
            <p className="text-gray-600 text-center">
              All payments are processed through Stripe, a leading payment provider that ensures the highest 
              level of security for your transactions.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center">
            <Lock className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Encryption</h3>
            <p className="text-gray-600 text-center">
              Your payment information is protected with industry-standard SSL encryption to safeguard your sensitive data.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg flex flex-col items-center">
            <CreditCard className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">PCI Compliance</h3>
            <p className="text-gray-600 text-center">
              We adhere to Payment Card Industry (PCI) standards to ensure your card information is handled securely.
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Is my payment information safe with Blue Whale Competitions?
            </h3>
            <p className="text-gray-700">
              Yes, we take the security of your payment information very seriously. We use Stripe as our payment 
              processor, which provides bank-level security. We never store your full card details on our servers.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              When will my card be charged?
            </h3>
            <p className="text-gray-700">
              Your card will be charged immediately when you purchase tickets for a competition. The charge will 
              appear on your statement as "Blue Whale Competitions" or "BWC*".
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Can I get a refund for my tickets?
            </h3>
            <p className="text-gray-700">
              As stated in our Terms and Conditions, all ticket purchases are final and non-refundable. 
              This ensures fairness to all participants who have entered the competition.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Is there a minimum or maximum purchase amount?
            </h3>
            <p className="text-gray-700">
              The minimum purchase is one ticket. The maximum number of tickets you can purchase varies by 
              competition and is clearly indicated on each competition page.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              What currency are all payments processed in?
            </h3>
            <p className="text-gray-700">
              All prices on our website are listed in British Pounds (GBP), and all payments are processed in this currency.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
          <p className="mb-6">
            If you have any questions or issues related to payments, please don't hesitate to contact our customer 
            support team for assistance.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </StaticPageLayout>
  );
}