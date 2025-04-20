import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function HowToPlayPage() {
  const { toast } = useToast();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  
  // List of steps with emojis and details
  const steps = [
    {
      title: "1. Browse & Choose",
      icon: "🔍",
      description: "Explore our exciting competitions across different categories: Cash prizes, Family goods, Appliances, and more!",
      color: "from-blue-500 to-blue-700",
      animation: "bounce",
      tips: [
        "Use the filters to find competitions ending soon",
        "Check the 'Featured' section for best deals",
        "Watch for limited ticket competitions for better odds"
      ]
    },
    {
      title: "2. Get Your Tickets",
      icon: "🎟️",
      description: "Purchase tickets for your favorite competitions. The more tickets you have, the better your chances of winning!",
      color: "from-cyan-500 to-cyan-700",
      animation: "pulse",
      tips: [
        "Compare ticket prices across similar competitions",
        "Some competitions offer discounts on multiple tickets",
        "Keep an eye on the total tickets to gauge your odds"
      ]
    },
    {
      title: "3. Complete Entry Steps",
      icon: "✅",
      description: "Follow the simple entry steps for each competition, which may include social media follows, sharing, or subscribing.",
      color: "from-green-500 to-green-700",
      animation: "wiggle",
      tips: [
        "Always complete ALL entry steps to validate your tickets",
        "Use our 'One-Click Complete' for social media tasks",
        "Entry steps are verified before draws"
      ]
    },
    {
      title: "4. Wait for the Draw",
      icon: "⏳",
      description: "Each competition has a countdown timer. When it reaches zero, we randomly select the lucky winner!",
      color: "from-yellow-500 to-yellow-700",
      animation: "ping",
      tips: [
        "Enable notifications to be alerted about draws",
        "Last-minute ticket purchases are allowed until the timer hits zero",
        "Watch live draws for major competitions"
      ]
    },
    {
      title: "5. Claim Your Prize",
      icon: "🏆",
      description: "If you win, you'll be notified immediately! We'll guide you through the simple claiming process.",
      color: "from-purple-500 to-purple-700",
      animation: "spin",
      tips: [
        "Winners have 14 days to claim their prizes",
        "We handle all shipping and delivery costs",
        "Prizes can be exchanged for cash value in some cases"
      ]
    }
  ];
  
  const faqs = [
    {
      question: "How are winners selected?",
      answer: "Winners are chosen completely at random using our certified random number generator. Each ticket has an equal chance of winning!"
    },
    {
      question: "When do competitions end?",
      answer: "Each competition has its own end date and time, clearly displayed on the competition page with a countdown timer. Once the timer reaches zero, no more entries are accepted and the draw takes place."
    },
    {
      question: "How will I know if I've won?",
      answer: "We'll notify you immediately via email, SMS, and in-app notification. Your profile will also be updated with your win information and claiming instructions."
    },
    {
      question: "Are there limits on how many tickets I can buy?",
      answer: "Most competitions have a maximum number of tickets per user to keep things fair. This limit is clearly displayed on each competition page."
    },
    {
      question: "How do I complete entry steps?",
      answer: "Follow the instructions on each competition page. Typically, you'll need to follow social media accounts, share posts, or complete other simple actions to validate your entry."
    },
    {
      question: "What happens if a prize goes unclaimed?",
      answer: "If the original winner doesn't claim their prize within 14 days, we select another winner from the valid entries. We keep doing this until the prize is successfully claimed."
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-800/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-800/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/6 w-40 h-40 bg-blue-800/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">How To Play</span>
              <span className="inline-block animate-bounce ml-4">🎮</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              From browsing competitions to claiming your prizes - everything you need to know to start winning amazing rewards!
            </motion.p>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="rgba(17, 24, 39, 1)" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Interactive Step by Step Guide */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-2 inline-block">Simple & Fun</span>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Five Simple Steps</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Follow our easy guide and you could be our next big winner!</p>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mt-6"></div>
        </div>
        
        {/* Step Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <Button
              key={index}
              variant={activeStepIndex === index ? "default" : "outline"}
              className={`rounded-full px-6 py-6 text-lg transition-all ${
                activeStepIndex === index 
                ? `bg-gradient-to-r ${step.color} text-white` 
                : 'border-gray-700 hover:border-cyan-500 text-gray-300'
              }`}
              onClick={() => setActiveStepIndex(index)}
            >
              <span className={`text-2xl mr-3 ${activeStepIndex === index ? `animate-${step.animation}` : ''}`}>{step.icon}</span>
              {step.title}
            </Button>
          ))}
        </div>
        
        {/* Active Step Content */}
        <motion.div 
          className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl"
          key={activeStepIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br ${steps[activeStepIndex].color} shadow-lg flex-shrink-0`}>
              <span className={`animate-${steps[activeStepIndex].animation}`}>{steps[activeStepIndex].icon}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">{steps[activeStepIndex].title}</h3>
              <p className="text-gray-300 text-lg mb-6 text-center md:text-left">{steps[activeStepIndex].description}</p>
              
              <div className="bg-black/30 rounded-xl p-4">
                <h4 className="font-semibold text-cyan-300 mb-3 flex items-center">
                  <span className="mr-2">💡</span> Pro Tips:
                </h4>
                <ul className="space-y-2">
                  {steps[activeStepIndex].tips.map((tip, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Statistics Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700/30"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="text-4xl font-bold text-cyan-400 mb-2">30+</div>
            <div className="text-gray-300">Active Competitions</div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700/30"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="text-4xl font-bold text-purple-400 mb-2">£2M+</div>
            <div className="text-gray-300">Prizes Awarded</div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700/30"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="text-4xl font-bold text-green-400 mb-2">50K+</div>
            <div className="text-gray-300">Happy Winners</div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700/30"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
          >
            <div className="text-4xl font-bold text-yellow-400 mb-2">99%</div>
            <div className="text-gray-300">Positive Reviews</div>
          </motion.div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-2 inline-block">Got Questions?</span>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Frequently Asked Questions</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Everything you need to know about our competitions</p>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mt-6"></div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 bg-gray-800/40 backdrop-blur-sm">
              <TabsTrigger value="general" className="py-3 data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-300">
                General Questions
              </TabsTrigger>
              <TabsTrigger value="winning" className="py-3 data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-300">
                Winning & Prizes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-2">
              <motion.div 
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {faqs.slice(0, 3).map((faq, index) => (
                  <motion.div 
                    key={index}
                    variants={item}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
                  >
                    <h3 className="text-xl font-semibold mb-3 text-cyan-300 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-cyan-900/70 text-cyan-300 inline-flex items-center justify-center mr-3 text-sm">Q</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 ml-11">{faq.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="winning" className="mt-2">
              <motion.div 
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {faqs.slice(3).map((faq, index) => (
                  <motion.div 
                    key={index}
                    variants={item}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
                  >
                    <h3 className="text-xl font-semibold mb-3 text-cyan-300 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-cyan-900/70 text-cyan-300 inline-flex items-center justify-center mr-3 text-sm">Q</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 ml-11">{faq.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-md rounded-2xl p-10 border border-blue-800/30 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-800/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-800/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Try Your Luck?
                <span className="inline-block animate-bounce ml-3">🍀</span>
              </h2>
              <p className="text-xl text-cyan-100 mb-8">
                Join thousands of winners who've already discovered the excitement of Blue Whale Competitions!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-cyan-500/20"
                  onClick={() => {
                    toast({
                      title: "Let's find you a competition!",
                      description: "Redirecting to competitions page...",
                    });
                    setTimeout(() => {
                      window.location.href = "/competitions";
                    }, 1500);
                  }}
                >
                  <span className="mr-2 text-xl">🎮</span>
                  Browse Competitions
                </Button>
                <Button 
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/30 font-medium text-lg px-8 py-6 rounded-full"
                >
                  <span className="mr-2 text-xl">ℹ️</span>
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}