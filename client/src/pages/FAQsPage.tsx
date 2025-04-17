import { useState } from "react";
import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { ChevronDown, ChevronUp } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const faqs: FAQItem[] = [
    {
      question: "How do I enter a competition?",
      answer: "To enter a competition, simply select the competition you're interested in, choose how many tickets you'd like to purchase, and complete the checkout process. Once your payment is confirmed, your entry will be registered for the draw.",
      category: "competitions"
    },
    {
      question: "How are winners selected?",
      answer: "Winners are selected through a random draw system that ensures complete fairness. Each ticket purchased represents one entry into the draw, so the more tickets you have, the higher your chances of winning.",
      category: "competitions"
    },
    {
      question: "When do competitions close?",
      answer: "Each competition has its own closing date and time, which is clearly displayed on the competition page. Once the closing date is reached, no more entries will be accepted, and the draw will take place as scheduled.",
      category: "competitions"
    },
    {
      question: "How will I know if I've won?",
      answer: "If you're a winner, we'll notify you via the email address and phone number associated with your account. We'll also publish the results on our website and social media channels (using only your first name and last initial for privacy).",
      category: "winners"
    },
    {
      question: "How do I claim my prize?",
      answer: "Once you've been notified of your win, you'll receive detailed instructions on how to claim your prize. Depending on the prize, this might involve providing delivery details or arranging collection. You'll need to claim your prize within 14 days of notification.",
      category: "winners"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, including Visa, Mastercard, and American Express. We also accept Apple Pay and Google Pay for your convenience. All payments are processed securely through Stripe.",
      category: "payments"
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment processors to ensure your payment information is protected. We never store your complete card details on our servers.",
      category: "payments"
    },
    {
      question: "Can I get a refund for my tickets?",
      answer: "As stated in our Terms and Conditions, all ticket purchases are final and non-refundable once the transaction is complete. This ensures fairness to all participants who have entered the competition.",
      category: "payments"
    },
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button in the top right corner of the page. You'll need to provide your name, email address, and create a password. Once registered, you can enter competitions and track your entries from your account dashboard.",
      category: "account"
    },
    {
      question: "I've forgotten my password. What should I do?",
      answer: "If you've forgotten your password, click on the 'Login' button and then select 'Forgot Password?' You'll be prompted to enter your email address, and we'll send you instructions to reset your password.",
      category: "account"
    },
    {
      question: "How can I update my account information?",
      answer: "You can update your account information by logging in and navigating to the 'My Account' section. Here you can edit your personal details, change your password, and update your communication preferences.",
      category: "account"
    },
    {
      question: "How many tickets can I buy for a competition?",
      answer: "The maximum number of tickets you can purchase varies by competition and is clearly indicated on each competition page. This limit ensures fair access for all participants while still allowing you to increase your chances of winning.",
      category: "competitions"
    }
  ];
  
  const categories = [
    { id: "all", name: "All FAQs" },
    { id: "competitions", name: "Competitions" },
    { id: "winners", name: "Winners" },
    { id: "payments", name: "Payments" },
    { id: "account", name: "Account" }
  ];
  
  const filteredFaqs = activeCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);
  
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <StaticPageLayout 
      title="Frequently Asked Questions" 
      gradientColors="from-cyan-600 to-blue-500"
    >
      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-6">
          Find answers to the most common questions about Blue Whale Competitions. Can't find what you're looking for? 
          Feel free to <a href="/contact" className="text-blue-600 hover:underline">contact us</a>.
        </p>
        
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* FAQ accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className={`border rounded-lg overflow-hidden transition-all ${
                openIndex === index ? "border-blue-300 shadow-sm" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <span className="text-blue-500 flex-shrink-0 ml-2">
                  {openIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              
              <div 
                className={`px-6 transition-all duration-200 ease-in-out ${
                  openIndex === index ? "py-4 border-t border-gray-100" : "max-h-0 overflow-hidden"
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No FAQs found in this category.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Still have questions?</h2>
        <p className="text-gray-700 mb-4">
          If you couldn't find the answer you were looking for, please don't hesitate to reach out to our team.
          We're here to help!
        </p>
        <a 
          href="/contact" 
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </StaticPageLayout>
  );
}