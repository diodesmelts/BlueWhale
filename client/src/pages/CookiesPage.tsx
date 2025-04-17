import StaticPageLayout from "@/components/layout/StaticPageLayout";

export default function CookiesPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <StaticPageLayout 
      title="Cookies Policy" 
      gradientColors="from-gray-700 to-gray-600"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-500 mb-6">Last updated: April {currentYear}</p>
        
        <p className="mb-6">
          This Cookies Policy explains how Blue Whale Competitions uses cookies and similar technologies 
          to recognize you when you visit our website. It explains what these technologies are and why we 
          use them, as well as your rights to control our use of them.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">What are cookies?</h2>
        <p className="mb-6">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
          Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
          as well as to provide reporting information.
        </p>
        <p className="mb-6">
          Cookies set by the website owner (in this case, Blue Whale Competitions) are called "first-party cookies". 
          Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies 
          enable third-party features or functionality to be provided on or through the website (e.g., advertising, 
          interactive content and analytics). The parties that set these third-party cookies can recognize your 
          computer both when it visits the website in question and also when it visits certain other websites.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Why do we use cookies?</h2>
        <p className="mb-6">
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical 
          reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" 
          cookies. Other cookies also enable us to track and target the interests of our users to enhance the 
          experience on our website. Third parties serve cookies through our website for advertising, analytics 
          and other purposes.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Types of cookies we use</h2>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Essential cookies</h3>
          <p className="mb-4">
            These cookies are strictly necessary to provide you with services available through our website and to 
            use some of its features, such as access to secure areas. Because these cookies are strictly necessary 
            to deliver the website, you cannot refuse them without impacting how our website functions.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance cookies</h3>
          <p className="mb-4">
            These cookies collect information that is used either in aggregate form to help us understand how our 
            website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Functionality cookies</h3>
          <p className="mb-4">
            These cookies allow our website to remember choices you make when you use our website. The purpose of 
            these cookies is to provide you with a more personal experience and to avoid you having to re-enter 
            your preferences every time you visit our website.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Marketing cookies</h3>
          <p className="mb-4">
            These cookies are used to make advertising messages more relevant to you. They perform functions like 
            preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in 
            some cases selecting advertisements that are based on your interests.
          </p>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">How can you control cookies?</h2>
        <p className="mb-6">
          You have the right to decide whether to accept or reject cookies. You can exercise your cookie 
          preferences by clicking on the appropriate opt-out links provided in the cookie banner that appears 
          when you first visit our website.
        </p>
        <p className="mb-6">
          You can also set or amend your web browser controls to accept or refuse cookies. If you choose to 
          reject cookies, you may still use our website though your access to some functionality and areas of 
          our website may be restricted. As the means by which you can refuse cookies through your web browser 
          controls vary from browser-to-browser, you should visit your browser's help menu for more information.
        </p>
        <p className="mb-6">
          In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would 
          like to find out more information, please visit <a href="http://www.aboutads.info/choices/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">http://www.aboutads.info/choices/</a> 
          or <a href="http://www.youronlinechoices.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">http://www.youronlinechoices.com</a>.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">How often will we update this Cookies Policy?</h2>
        <p className="mb-6">
          We may update this Cookies Policy from time to time in order to reflect, for example, changes to the 
          cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this 
          Cookies Policy regularly to stay informed about our use of cookies and related technologies.
        </p>
        <p className="mb-6">
          The date at the top of this Cookies Policy indicates when it was last updated.
        </p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">Where can I get further information?</h2>
        <p className="mb-6">
          If you have any questions about our use of cookies or other technologies, please contact us through our <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a>.
        </p>
      </div>
    </StaticPageLayout>
  );
}