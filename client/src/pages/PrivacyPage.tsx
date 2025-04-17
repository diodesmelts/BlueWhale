import StaticPageLayout from "@/components/layout/StaticPageLayout";

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <StaticPageLayout 
      title="Privacy Policy" 
      gradientColors="from-blue-700 to-blue-600"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500 mb-6">Last updated: April {currentYear}</p>
        
        <p className="mb-6">
          At Blue Whale Competitions, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you visit our website or participate in our competitions.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
        <p className="mb-3">We may collect information about you in various ways, including:</p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            <span className="font-semibold">Personal Data:</span> Name, email address, phone number, postal address, 
            and payment information when you register for an account or purchase tickets.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Account Information:</span> Login credentials, account preferences, and 
            competition entries.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Transaction Information:</span> Details about purchases or transactions made on our platform.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Automatic Information:</span> Device information, IP address, browsing actions, 
            and patterns when you visit our website.
          </li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
        <p className="mb-3">We may use the information we collect about you to:</p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Process and manage your competition entries and account.</li>
          <li className="mb-2">Communicate with you about competitions, prizes, and account information.</li>
          <li className="mb-2">Send you marketing communications about promotions and new competitions (if you've opted in).</li>
          <li className="mb-2">Improve our website, products, services, marketing, and customer relationships.</li>
          <li className="mb-2">Comply with legal obligations and protect our rights.</li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">3. Disclosure of Your Information</h2>
        <p className="mb-3">We may share your information with:</p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            <span className="font-semibold">Service Providers:</span> Third parties that help us operate our website, 
            conduct our business, or service you.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Legal Requirements:</span> To comply with any court order, law, or legal process.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Business Transfers:</span> In connection with any merger, sale of company assets, 
            financing, or acquisition.
          </li>
          <li className="mb-2">
            <span className="font-semibold">With Your Consent:</span> For any other purpose disclosed by us when you provide the information.
          </li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">4. Cookies and Tracking Technologies</h2>
        <p className="mb-6">
          We use cookies and similar tracking technologies to track activity on our website and store certain information. 
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
          if you do not accept cookies, you may not be able to use some portions of our website.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">5. Data Security</h2>
        <p className="mb-6">
          We have implemented measures designed to secure your personal information from accidental loss and from 
          unauthorized access, use, alteration, and disclosure. However, we cannot guarantee that unauthorized third 
          parties will never be able to defeat those measures or use your personal information for improper purposes.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">6. Your Data Protection Rights</h2>
        <p className="mb-3">Under data protection laws, you have rights including:</p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">
            <span className="font-semibold">Right to Access:</span> You can request copies of your personal data.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Right to Rectification:</span> You can request that we correct inaccurate information.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Right to Erasure:</span> You can request that we delete your personal data in certain circumstances.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Right to Restrict Processing:</span> You can request that we restrict the processing of your data.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Right to Data Portability:</span> You can request the transfer of your data to another organization.
          </li>
          <li className="mb-2">
            <span className="font-semibold">Right to Object:</span> You can object to the processing of your personal data.
          </li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">7. Third-Party Links</h2>
        <p className="mb-6">
          Our website may contain links to third-party websites. We have no control over and assume no responsibility for 
          the content, privacy policies, or practices of any third-party sites or services.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">8. Children's Privacy</h2>
        <p className="mb-6">
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
          from children under 18. If you are a parent or guardian and you are aware that your child has provided us with 
          personal information, please contact us.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">9. Changes to This Privacy Policy</h2>
        <p className="mb-6">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the "Last updated" date.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">10. Contact Us</h2>
        <p className="mb-6">
          If you have any questions about this Privacy Policy, please contact us through our <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a>.
        </p>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p>
            By using Blue Whale Competitions, you consent to our Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}