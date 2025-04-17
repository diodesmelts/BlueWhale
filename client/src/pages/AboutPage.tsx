import StaticPageLayout from "@/components/layout/StaticPageLayout";

export default function AboutPage() {
  return (
    <StaticPageLayout 
      title="About Blue Whale Competitions" 
      gradientColors="from-cyan-600 to-purple-600"
    >
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h2>
        
        <p className="mb-6">
          Blue Whale Competitions was founded with a simple mission: to provide an exciting, transparent, and fair platform 
          where people can participate in competitions with amazing prizes. Our journey began in 2023 when our founders 
          identified a gap in the market for a truly customer-focused competition platform.
        </p>
        
        <p className="mb-8">
          What sets us apart is our unwavering commitment to transparency, customer satisfaction, and offering 
          high-quality prizes that people actually want. We've grown rapidly since our inception, but we've never lost sight 
          of our core values and the excitement that drives our community.
        </p>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-blue-600 text-2xl font-bold mb-2">1.</div>
            <h3 className="text-lg font-semibold mb-2">Choose Your Competition</h3>
            <p className="text-gray-700">
              Browse our wide range of competitions across different categories - from cash prizes to the latest tech gadgets, 
              family prizes, and home appliances.
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-purple-600 text-2xl font-bold mb-2">2.</div>
            <h3 className="text-lg font-semibold mb-2">Purchase Your Tickets</h3>
            <p className="text-gray-700">
              Secure your chance to win by purchasing tickets. The more tickets you buy, the greater your chances of winning!
            </p>
          </div>
          
          <div className="bg-cyan-50 p-6 rounded-lg">
            <div className="text-cyan-600 text-2xl font-bold mb-2">3.</div>
            <h3 className="text-lg font-semibold mb-2">Wait for the Draw</h3>
            <p className="text-gray-700">
              All draws are conducted fairly using our random selection system. Winners are notified immediately and 
              announced on our platform.
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Values</h2>
        
        <ul className="list-disc pl-6 mb-8">
          <li className="mb-3">
            <span className="font-semibold">Transparency:</span> We believe in complete openness about our competitions, 
            draw processes, and ticket sales.
          </li>
          <li className="mb-3">
            <span className="font-semibold">Fairness:</span> Every participant has an equal chance of winning based on the 
            number of tickets they hold.
          </li>
          <li className="mb-3">
            <span className="font-semibold">Quality:</span> We only offer prizes that we would be excited to win ourselves.
          </li>
          <li className="mb-3">
            <span className="font-semibold">Community:</span> We're building a community of competition enthusiasts who share 
            our passion for excitement and winning.
          </li>
          <li>
            <span className="font-semibold">Customer-First:</span> Our decisions are always guided by what's best for our participants.
          </li>
        </ul>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Meet the Team</h2>
        
        <p className="mb-6">
          Behind Blue Whale Competitions is a dedicated team of professionals who are passionate about creating 
          the best competition experience. Our team combines expertise in technology, customer service, and prize curation 
          to deliver a seamless platform for our community.
        </p>
        
        <p className="mb-8">
          Our customer support team is always ready to assist you with any questions or concerns you might have. 
          We're committed to making your experience with us enjoyable and hassle-free from start to finish.
        </p>
        
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
          
          <p className="mb-4">
            Have questions or suggestions? We'd love to hear from you! Reach out to our team through 
            our <a href="/contact" className="text-blue-600 hover:underline">contact page</a>.
          </p>
          
          <p>
            Follow us on social media to stay updated on our latest competitions, winners, and special promotions!
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}