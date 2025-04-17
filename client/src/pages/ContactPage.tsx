import { useState } from "react";
import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Check, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  return (
    <StaticPageLayout 
      title="Contact Us" 
      gradientColors="from-indigo-600 to-purple-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>
          <p className="text-gray-600 mb-8">
            Have questions about our competitions, your entries, or anything else? We're here to help!
            Fill out the form, and our team will get back to you as soon as possible.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Email Us</h3>
                <p className="text-gray-600">support@bluewhalecompetitions.com</p>
                <p className="text-gray-500 text-sm mt-1">We aim to respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Phone className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Call Us</h3>
                <p className="text-gray-600">+44 (0) 123 456 7890</p>
                <p className="text-gray-500 text-sm mt-1">Monday-Friday, 9am-5pm GMT</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <MapPin className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Office Location</h3>
                <p className="text-gray-600">Blue Whale Competitions Ltd</p>
                <p className="text-gray-600">123 Competition Street</p>
                <p className="text-gray-600">London, EC1A 1BB</p>
                <p className="text-gray-600">United Kingdom</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors">
                <i className="fab fa-facebook-f text-indigo-600"></i>
              </a>
              <a href="#" className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors">
                <i className="fab fa-twitter text-indigo-600"></i>
              </a>
              <a href="#" className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors">
                <i className="fab fa-instagram text-indigo-600"></i>
              </a>
              <a href="#" className="bg-indigo-100 p-3 rounded-full hover:bg-indigo-200 transition-colors">
                <i className="fab fa-tiktok text-indigo-600"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="bg-green-100 p-3 rounded-full inline-flex justify-center items-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. We've received your message and will get back to you shortly.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="John Smith" 
                      required 
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="competitions">Competitions Question</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="prize">Prize Claim</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    rows={6}
                    required 
                    className="w-full"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 mb-6">
          Before contacting us, you might find the answer to your question in our extensive FAQ section.
        </p>
        <a 
          href="/faqs" 
          className="inline-block px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
        >
          View FAQs
        </a>
      </div>
    </StaticPageLayout>
  );
}