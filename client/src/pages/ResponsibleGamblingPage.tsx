import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

export default function ResponsibleGamblingPage() {
  return (
    <StaticPageLayout 
      title="Responsible Gambling" 
      gradientColors="from-emerald-600 to-teal-600"
    >
      <div className="prose prose-lg max-w-none">
        <div className="bg-emerald-50 p-6 rounded-lg mb-8">
          <p className="text-emerald-800 font-medium">
            At Blue Whale Competitions, we are committed to promoting responsible gambling. 
            We want our competitions to be a fun and entertaining experience for all participants, 
            but we also recognize the importance of gambling responsibly and within your means.
          </p>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Our Commitment</h2>
        <p className="mb-6">
          We are dedicated to providing a safe and responsible environment for all our users. 
          We implement various measures to help prevent problem gambling behaviors and ensure 
          that participating in our competitions remains an enjoyable activity rather than a source of stress or harm.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Know the Signs</h2>
        <p className="mb-4">
          It's important to recognize the signs of problem gambling. If you or someone you know exhibits any 
          of the following behaviors, it may be time to seek help:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Spending more money than you can afford on competitions</li>
          <li>Borrowing money to enter competitions</li>
          <li>Neglecting work, family, or other responsibilities to participate in competitions</li>
          <li>Entering competitions to escape from problems or relieve feelings of helplessness, guilt, or depression</li>
          <li>Lying to family members or others about how much time or money is spent on competitions</li>
          <li>Feeling irritable or restless when not participating in competitions</li>
          <li>Needing to spend increasing amounts of money to get the same feeling of excitement</li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tips for Responsible Gambling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Set Limits</h3>
            <p className="text-gray-700">
              Decide how much money you're willing to spend on competitions before you start and stick to that budget.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Don't Chase Losses</h3>
            <p className="text-gray-700">
              Buying more tickets to try to recoup lost money can lead to larger losses and problem behavior.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Take Breaks</h3>
            <p className="text-gray-700">
              Regular breaks from participating in competitions can help maintain perspective.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Never Borrow Money</h3>
            <p className="text-gray-700">
              Don't borrow money to enter competitions or use money that's needed for essential expenses.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Balance with Other Activities</h3>
            <p className="text-gray-700">
              Ensure that entering competitions is just one of many leisure activities you enjoy.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Seek Help If Needed</h3>
            <p className="text-gray-700">
              If you feel your participation is becoming problematic, don't hesitate to reach out for support.
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Our Responsible Gambling Measures</h2>
        <p className="mb-4">
          At Blue Whale Competitions, we have implemented several measures to promote responsible gambling:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Limits on the number of tickets that can be purchased for a single competition</li>
          <li>Clear information about the odds of winning each competition</li>
          <li>Transparent information about pricing, closing dates, and draw procedures</li>
          <li>Age verification to prevent underage participation</li>
          <li>Links to resources for those concerned about their gambling behavior</li>
          <li>The option to self-exclude from our platform if needed</li>
        </ul>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resources for Help</h2>
        <p className="mb-4">
          If you or someone you know is experiencing gambling-related problems, the following organizations offer support:
        </p>
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            <ExternalLink className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">GamCare</h3>
              <p className="text-gray-700">Provides information, advice, and free counseling for problem gambling.</p>
              <a 
                href="https://www.gamcare.org.uk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                www.gamcare.org.uk
              </a>
              <p className="text-gray-700">Helpline: 0808 8020 133</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <ExternalLink className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">BeGambleAware</h3>
              <p className="text-gray-700">Provides information and resources for those affected by problem gambling.</p>
              <a 
                href="https://www.begambleaware.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                www.begambleaware.org
              </a>
              <p className="text-gray-700">Helpline: 0808 8020 133</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <ExternalLink className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Gamblers Anonymous</h3>
              <p className="text-gray-700">A fellowship of men and women who share their experience, strength, and hope with each other.</p>
              <a 
                href="https://www.gamblersanonymous.org.uk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-600 hover:underline inline-flex items-center gap-1"
              >
                www.gamblersanonymous.org.uk
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any concerns or questions about our responsible gambling policies, or if you would like to 
            discuss options for self-exclusion, please don't hesitate to <Link href="/contact"><span className="text-emerald-600 hover:underline cursor-pointer">contact us</span></Link>.
          </p>
          <p>
            Remember, participating in our competitions should be fun and entertaining. If it stops being 
            enjoyable or starts causing problems in your life, please seek help.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}