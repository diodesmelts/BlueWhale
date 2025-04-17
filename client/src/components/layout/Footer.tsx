import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-cyan-300">Blue Whale Competitions</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Your premier destination for discovering and winning the best competitions across the UK.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-cyan-400 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-cyan-400 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-cyan-400 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-cyan-400 transition-colors">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>
          
          {/* Competition Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-cyan-300">Competitions</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/cash">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm flex items-center cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-2"></span>
                    Cash Competitions
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/tech">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm flex items-center cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block mr-2"></span>
                    Tech Prizes
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/family">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm flex items-center cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full inline-block mr-2"></span>
                    Family Prizes
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/appliances">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm flex items-center cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full inline-block mr-2"></span>
                    Home Appliances
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/featured">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm flex items-center cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block mr-2"></span>
                    Featured Competitions
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-cyan-300">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/my-entries">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">My Entries</span>
                </Link>
              </li>
              <li>
                <Link href="/my-account">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">My Account</span>
                </Link>
              </li>
              {/* Past Winners link removed as requested */}
              <li>
                <Link href="/about">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Information & Help */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-cyan-300">Information & Help</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/payment-methods">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Payment Methods</span>
                </Link>
              </li>
              <li>
                <Link href="/faqs">
                  <span className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">FAQs</span>
                </Link>
              </li>
              {/* Help Center link removed as requested */}
              {/* Returns & Refunds link removed as requested */}
            </ul>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="py-8 border-t border-b border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-bold mb-2 text-white">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Subscribe to our newsletter for exclusive offers, new competitions, and winner announcements.
              </p>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-gray-900 border-gray-700 text-white focus:border-cyan-500 focus-visible:ring-cyan-500/20"
              />
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">We accept:</span>
            <div className="flex space-x-3">
              <i className="fab fa-cc-visa text-gray-400 text-2xl"></i>
              <i className="fab fa-cc-mastercard text-gray-400 text-2xl"></i>
              <i className="fab fa-cc-amex text-gray-400 text-2xl"></i>
              <i className="fab fa-apple-pay text-gray-400 text-2xl"></i>
              <i className="fab fa-google-pay text-gray-400 text-2xl"></i>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">Secured by:</span>
            <i className="fas fa-lock text-gray-400 mr-1"></i>
            <span className="text-sm text-gray-400">Stripe</span>
          </div>
        </div>
        
        {/* Copyright & Bottom Links */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-800">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} Blue Whale Competitions. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center space-x-4 text-sm">
            <Link href="/terms">
              <span className="text-gray-500 hover:text-gray-300 transition-colors mb-2 md:mb-0 cursor-pointer">Terms</span>
            </Link>
            <Link href="/privacy">
              <span className="text-gray-500 hover:text-gray-300 transition-colors mb-2 md:mb-0 cursor-pointer">Privacy</span>
            </Link>
            <Link href="/cookies">
              <span className="text-gray-500 hover:text-gray-300 transition-colors mb-2 md:mb-0 cursor-pointer">Cookies</span>
            </Link>
            <Link href="/sitemap">
              <span className="text-gray-500 hover:text-gray-300 transition-colors mb-2 md:mb-0 cursor-pointer">Sitemap</span>
            </Link>
            <Link href="/responsible-gambling">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">Responsible Gambling</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}