import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { Link } from "wouter";

export default function SitemapPage() {
  // Define all sitemap links
  const sitemapLinks = [
    {
      category: "Main Pages",
      links: [
        { title: "Home", path: "/" },
        { title: "About Us", path: "/about" },
        { title: "Contact", path: "/contact" },
      ]
    },
    {
      category: "Competition Categories",
      links: [
        { title: "Family Competitions", path: "/competitions/family" },
        { title: "Cash Competitions", path: "/competitions/cash" },
        { title: "Appliances Competitions", path: "/competitions/appliances" },
        { title: "All Competitions", path: "/competitions" },
      ]
    },
    {
      category: "User Account",
      links: [
        { title: "Login/Register", path: "/auth" },
        { title: "My Entries", path: "/my-entries" },
        { title: "My Wins", path: "/my-wins" },
      ]
    },
    {
      category: "Information",
      links: [
        { title: "Terms & Conditions", path: "/terms" },
        { title: "Privacy Policy", path: "/privacy" },
        { title: "Cookies Policy", path: "/cookies" },
        { title: "FAQs", path: "/faqs" },
        { title: "Payment Methods", path: "/payment-methods" },
        { title: "Responsible Gambling", path: "/responsible-gambling" },
      ]
    },
  ];
  
  return (
    <StaticPageLayout 
      title="Sitemap" 
      gradientColors="from-slate-700 to-slate-600"
    >
      <div className="prose prose-lg max-w-none">
        <p className="mb-8 text-gray-700">
          Use this sitemap to navigate through all sections of Blue Whale Competitions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {sitemapLinks.map((category, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{category.category}</h2>
              <ul className="space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.path}>
                      <a className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                        {link.title}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
          <p className="mb-4">
            If you can't find what you're looking for, or need assistance navigating our website, 
            please don't hesitate to contact our customer support team.
          </p>
          <Link href="/contact">
            <a className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Contact Us
            </a>
          </Link>
        </div>
      </div>
    </StaticPageLayout>
  );
}