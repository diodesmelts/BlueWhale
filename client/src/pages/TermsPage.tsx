import StaticPageLayout from "@/components/layout/StaticPageLayout";

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <StaticPageLayout 
      title="Terms & Conditions" 
      gradientColors="from-gray-800 to-gray-700"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500 mb-6">Last updated: April {currentYear}</p>
        
        <p className="mb-6">
          Welcome to Blue Whale Competitions. These Terms and Conditions govern your use of our website and services.
          Please read these terms carefully before participating in any competitions or using our platform.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-6">
          By accessing or using Blue Whale Competitions, you agree to be bound by these Terms and Conditions and our Privacy Policy.
          If you do not agree to these terms, please do not use our services.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">2. Eligibility</h2>
        <p className="mb-6">
          2.1. You must be at least 18 years of age to participate in our competitions.<br />
          2.2. You must be a resident of the United Kingdom to enter competitions.<br />
          2.3. Employees of Blue Whale Competitions, their immediate family members, and anyone professionally connected with the organization are not eligible to enter.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">3. Competition Entry</h2>
        <p className="mb-6">
          3.1. Entry to competitions is through the purchase of tickets on our platform.<br />
          3.2. The number of tickets per competition may be limited, as specified in each competition's details.<br />
          3.3. All entries must be received before the closing date and time specified for each competition.<br />
          3.4. We reserve the right to cancel or amend competitions and these terms without notice.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">4. Ticket Purchases</h2>
        <p className="mb-6">
          4.1. Tickets can be purchased using the payment methods available on our platform.<br />
          4.2. All ticket purchases are final. No refunds will be provided except as required by law.<br />
          4.3. The price of tickets will be clearly displayed before purchase.<br />
          4.4. You are responsible for providing accurate payment information.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">5. Prize Draws</h2>
        <p className="mb-6">
          5.1. Winners will be selected randomly from all valid entries.<br />
          5.2. Draw dates and times will be specified for each competition.<br />
          5.3. Winners will be notified via the contact information provided during registration.<br />
          5.4. If a winner cannot be contacted or does not claim their prize within 14 days, we reserve the right to withdraw the prize.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">6. Prizes</h2>
        <p className="mb-6">
          6.1. Prizes are as described on our website for each competition.<br />
          6.2. No cash alternatives to prizes will be offered unless explicitly stated.<br />
          6.3. Prizes are non-transferable.<br />
          6.4. We reserve the right to substitute prizes of equal or greater value if necessary.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">7. User Accounts</h2>
        <p className="mb-6">
          7.1. You are responsible for maintaining the confidentiality of your account information.<br />
          7.2. You are responsible for all activities that occur under your account.<br />
          7.3. We reserve the right to terminate accounts that violate these terms.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">8. Intellectual Property</h2>
        <p className="mb-6">
          8.1. All content on Blue Whale Competitions is owned by us or our licensors.<br />
          8.2. You may not reproduce, distribute, or create derivative works from our content without permission.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">9. Limitation of Liability</h2>
        <p className="mb-6">
          9.1. Blue Whale Competitions will not be liable for any loss or damage arising from your use of our platform.<br />
          9.2. We do not guarantee uninterrupted or error-free operation of our website.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">10. Governing Law</h2>
        <p className="mb-6">
          These Terms and Conditions are governed by the laws of the United Kingdom.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">11. Changes to Terms</h2>
        <p className="mb-6">
          We may update these Terms and Conditions from time to time. Any changes will be posted on this page.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">12. Contact Us</h2>
        <p className="mb-6">
          If you have any questions about these Terms and Conditions, please contact us through our <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a>.
        </p>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p>
            By using Blue Whale Competitions, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}