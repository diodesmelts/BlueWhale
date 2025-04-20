import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Upload, Trophy, Sparkles, Award, ChevronRight, Heart, Bookmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { CompetitionWithEntryStatus, UserStats, LeaderboardUser } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { apiRequest } from "@/lib/queryClient";
import { motion, useScroll, useInView, useAnimation, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trending");
  const [prizeValue, setPrizeValue] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [showBannerUploadModal, setShowBannerUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAdmin();
  
  // For backward compatibility, keeping this available but not using it
  const type = prizeValue;
  const setType = setPrizeValue;
  const platform = "all";
  const setPlatform = () => {}; // Empty function since we're not using platform anymore

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  // Fetch competitions
  const { data: competitions, isLoading: isLoadingCompetitions, refetch } = useQuery<CompetitionWithEntryStatus[]>({
    queryKey: ["/api/competitions", prizeValue, sortBy, activeTab],
  });
  
  // Add event listener for ticket purchase completion
  useEffect(() => {
    const handleTicketPurchase = () => {
      // Refresh the competitions query data
      refetch();
    };
    
    window.addEventListener('ticket-purchase-complete', handleTicketPurchase);
    
    return () => {
      window.removeEventListener('ticket-purchase-complete', handleTicketPurchase);
    };
  }, [refetch]);

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
  });
  
  // Fetch banner image settings
  const { data: bannerSettings } = useQuery<{ imageUrl: string | null }>({
    queryKey: ["/api/settings/banner"],
  });
  
  // Update banner image when settings change
  useEffect(() => {
    if (bannerSettings?.imageUrl) {
      setBannerImage(bannerSettings.imageUrl);
    }
  }, [bannerSettings]);

  // Handle competition entry
  const handleEnterCompetition = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/enter`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to enter competition');
        return res.json();
      })
      .then(() => {
        toast({
          title: 'Competition Entered',
          description: 'You have successfully entered this competition.',
        });
        refetch();
      })
      .catch(error => {
        console.error('Error entering competition:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Handle bookmarking competition
  const handleBookmarkCompetition = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/bookmark`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to bookmark competition');
        return res.json();
      })
      .then(() => {
        toast({
          title: 'Competition Bookmarked',
          description: 'This competition has been added to your bookmarks.',
        });
        refetch();
      })
      .catch(error => {
        console.error('Error bookmarking competition:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Handle liking competition
  const handleLikeCompetition = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/like`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to like competition');
        return res.json();
      })
      .then(() => {
        toast({
          title: 'Competition Liked',
          description: 'You have liked this competition.',
        });
        refetch();
      })
      .catch(error => {
        console.error('Error liking competition:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Handle completing entry steps
  const handleCompleteEntry = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/complete-entry`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to complete entry steps');
        return res.json();
      })
      .then(data => {
        toast({
          title: 'Entry Completed!',
          description: 'You have successfully completed all entry steps.',
        });
        // Refetch competitions data to update UI
        refetch();
      })
      .catch(error => {
        console.error('Error completing entry:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Animation refs
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.2 });
  const heroControls = useAnimation();
  
  useEffect(() => {
    if (isHeroInView) {
      heroControls.start("visible");
    }
  }, [isHeroInView, heroControls]);

  return (
    <>
      {/* Full-width Hero Welcome Section - Enhanced with animations and interactivity */}
      <motion.div 
        ref={heroRef}
        initial="hidden"
        animate={heroControls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
        }}
        className={`w-full ${!bannerImage ? 'bg-gradient-to-r from-blue-600 to-blue-800' : ''} py-16 md:py-24 lg:py-32 overflow-hidden relative`}
        style={{
          backgroundImage: bannerImage ? `url(${bannerImage})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          minHeight: '300px',
          maxWidth: '100vw',
        }}
      >
        {/* Darkening overlay with animated blur */}
        <motion.div 
          initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0.2)' }}
          animate={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        ></motion.div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnptLTEyIDBoLTZ2Nmg2di02em0tNi02aC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        {/* Animated floating elements - similar to How to Play page */}
        <motion.div 
          className="absolute top-10 left-[10%] w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-md"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-20 right-[15%] w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.6, 0.9, 0.6]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        <motion.div 
          className="absolute top-1/3 right-[25%] w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-md"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center relative z-10 mx-auto max-w-6xl">
            <div className="text-white text-center">
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="text-4xl md:text-6xl font-bold tracking-tight mb-3"
              >
                <span className="relative inline-block">
                  <motion.span 
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 relative inline-block"
                  >
                    competition
                    {/* Animated sparkle in the corner */}
                    <motion.span 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, 0],
                        opacity: [1, 0.8, 1] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 text-yellow-300 text-sm"
                    >
                      ✨
                    </motion.span>
                  </motion.span>
                  <span className="relative inline-block text-white"> time</span>
                  {/* Enhanced glow effect */}
                  <motion.span 
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-1 bg-cyan-500/10 blur-2xl rounded-full"
                  ></motion.span>
                </span>
              </motion.h1>
              
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
                }}
                className="text-base md:text-lg font-normal text-white/90 max-w-xl mx-auto"
              >
                Your premier destination for discovering, participating in, and winning exclusive competitions across multiple platforms.
              </motion.p>
              
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } }
                }}
                className="mt-8 flex flex-wrap gap-4 justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => {
                      const competitionsSection = document.querySelector('.live-competitions-section');
                      if (competitionsSection) {
                        competitionsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-white text-blue-600 hover:bg-blue-50 py-2 px-6 rounded-md shadow-md shadow-cyan-500/20 font-semibold transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    <motion.span className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                      <span>View Competitions</span>
                    </motion.span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 py-2 px-6 rounded-md font-medium transition-all shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20"
                    onClick={() => {
                      const competitionsSection = document.querySelector('.live-competitions-section');
                      if (competitionsSection) {
                        competitionsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <motion.span className="flex items-center">
                      <i className="fas fa-plus-circle mr-2"></i>
                      <span>My Entries</span>
                    </motion.span>
                  </Button>
                </motion.div>
                
                {isAdmin && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="bg-black/30 border border-white/30 text-white hover:bg-black/40 py-2 px-6 rounded-md font-medium transition-all"
                      onClick={() => setShowBannerUploadModal(true)}
                    >
                      <motion.span className="flex items-center">
                        <i className="fas fa-image mr-2"></i>
                        <span>Change Banner</span>
                      </motion.span>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Subtle curved divider to create a wave effect */}
        <div className="absolute bottom-[-2px] left-0 right-0 h-8 bg-gray-900"></div>
        <div className="absolute bottom-[-2px] left-[5%] right-[5%] h-16 bg-gray-900 rounded-t-[50%]"></div>
      </motion.div>
      
      {/* How to Play Section - Enhanced with animations and interactive elements */}
      <motion.div 
        className="bg-gradient-to-b from-gray-900 to-gray-900 py-14 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced decorative elements with animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-800/15 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-800/15 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.18, 0.1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-1/6 w-40 h-40 bg-blue-800/15 rounded-full blur-3xl"
          ></motion.div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header Section with glow and sparkle effects */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <div className="inline-block relative">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="uppercase tracking-wider text-xs font-semibold text-cyan-300 mb-2 block"
              >
                Getting Started
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight relative"
              >
                <motion.span 
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 relative inline-block"
                >
                  How To
                  {/* Animated sparkle in the corner */}
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 5, 0],
                      opacity: [1, 0.8, 1] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 text-yellow-300 text-sm"
                  >
                    ✨
                  </motion.span>
                </motion.span>
                <span className="relative inline-block"> Play</span>
                {/* Enhanced glow effect */}
                <motion.span 
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-1 bg-cyan-500/10 blur-2xl rounded-full"
                ></motion.span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-gray-300 max-w-xl mx-auto"
              >
                Follow these simple steps to participate and win exciting competitions
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-4 flex justify-center"
              >
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 5px rgba(34,211,238,0.3)", "0 0 15px rgba(34,211,238,0.7)", "0 0 5px rgba(34,211,238,0.3)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 w-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                ></motion.div>
              </motion.div>
            </div>
            
            {/* Call to action button with interactive effects */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <Link href="/how-to-play">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center py-2 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-medium shadow-lg shadow-blue-700/20 hover:shadow-blue-700/40 transition-all duration-300"
                >
                  <span>Detailed Guide</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                    className="ml-2"
                  >
                    <ChevronRight size={18} />
                  </motion.span>
                </motion.a>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Interactive Cards with Steps - with staggered animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Step 1: Browse */}
            <motion.div
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                hidden: { opacity: 0, y: 50 }
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl shadow-blue-900/10 relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:opacity-100 transition-opacity"
              ></motion.div>
              
              <div className="mb-4 text-6xl text-blue-500 opacity-90">
                <motion.div
                  whileHover={{ rotate: [0, -10, 0, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-search"></i>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">1. Browse Competitions</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Explore our wide range of exciting competitions across different categories and platforms.</p>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "40%" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500"
              ></motion.div>
            </motion.div>
            
            {/* Step 2: Enter */}
            <motion.div
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                hidden: { opacity: 0, y: 50 }
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-900/10 relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-600/10 to-pink-600/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:opacity-100 transition-opacity"
              ></motion.div>
              
              <div className="mb-4 text-6xl text-purple-500 opacity-90">
                <motion.div
                  whileHover={{ scale: [1, 1.2, 0.9, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-ticket-alt"></i>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">2. Enter & Follow Steps</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Select a competition and follow the simple entry steps to secure your tickets.</p>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "40%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500"
              ></motion.div>
            </motion.div>
            
            {/* Step 3: Track */}
            <motion.div
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                hidden: { opacity: 0, y: 50 }
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl shadow-cyan-900/10 relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-600/10 to-blue-600/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:opacity-100 transition-opacity"
              ></motion.div>
              
              <div className="mb-4 text-6xl text-cyan-500 opacity-90">
                <motion.div
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-chart-line"></i>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">3. Track Entries</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Monitor your active entries and check competition closing dates on your dashboard.</p>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "40%" }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-600 to-blue-500"
              ></motion.div>
            </motion.div>
            
            {/* Step 4: Win */}
            <motion.div
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                hidden: { opacity: 0, y: 50 }
              }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl shadow-yellow-900/10 relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-600/10 to-orange-600/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:opacity-100 transition-opacity"
              ></motion.div>
              
              <div className="mb-4 text-6xl text-yellow-500 opacity-90">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <i className="fas fa-trophy"></i>
                </motion.div>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">4. Win & Celebrate</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Get notified when you win and follow the simple claim process to receive your prize!</p>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "40%" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-600 to-orange-500"
              ></motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle curved divider to create a wave effect */}
        <div className="absolute bottom-[-2px] left-0 right-0 h-8 bg-gray-900"></div>
        <div className="absolute bottom-[-2px] left-[5%] right-[5%] h-16 bg-gray-900 rounded-t-[50%]"></div>
      </motion.div>
      
      {/* Enhanced Interactive Live Competitions Section */}
      <motion.div 
        className="bg-gradient-to-b from-gray-900 to-gray-800 py-16 relative overflow-hidden pt-[2rem] mt-[-1px]"
        initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)" }}
        whileInView={{ opacity: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated decorative elements with motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-800/20 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-800/20 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.22, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 right-1/6 w-40 h-40 bg-blue-800/20 rounded-full blur-3xl"
          ></motion.div>
          <div className="hidden md:block absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
          <div className="hidden md:block absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
          
          {/* Fun animated shapes - add more playful elements */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[18%] w-12 h-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-md"
          ></motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              x: [0, 10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[20%] w-16 h-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-md"
          ></motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[15%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          ></motion.div>
          
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.9, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-1/3 right-[15%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          ></motion.div>

          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Animated Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <div className="inline-block relative">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="uppercase tracking-wider text-xs font-semibold text-cyan-300 mb-2 block"
              >
                Current Opportunities
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight relative"
              >
                <motion.span 
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 relative inline-block"
                >
                  Live
                  {/* Animated sparkle in the corner */}
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 5, 0],
                      opacity: [1, 0.8, 1] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 text-yellow-300 text-sm"
                  >
                    ✨
                  </motion.span>
                </motion.span>
                <span className="relative inline-block"> Competitions</span>
                {/* Enhanced glow effect */}
                <motion.span 
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-1 bg-cyan-500/10 blur-2xl rounded-full"
                ></motion.span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-gray-300 max-w-xl mx-auto"
              >
                Don't miss your chance to win these amazing prizes! New competitions added regularly.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-4 flex justify-center"
              >
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 5px rgba(34,211,238,0.3)", "0 0 15px rgba(34,211,238,0.7)", "0 0 5px rgba(34,211,238,0.3)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1 w-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                ></motion.div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Interactive Competition Cards Container */}
          <motion.div 
            className="live-competitions-section relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoadingCompetitions ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div 
                  className="mx-auto mb-4 w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center"
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(34,211,238,0)", "0 0 20px rgba(34,211,238,0.4)", "0 0 0px rgba(34,211,238,0)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div 
                    animate={{ 
                      rotate: 360,
                      borderColor: ["rgba(34,211,238,0.7) transparent rgba(34,211,238,0.7) rgba(34,211,238,0.7)", "rgba(168,85,247,0.7) rgba(168,85,247,0.7) transparent rgba(168,85,247,0.7)", "rgba(34,211,238,0.7) transparent rgba(34,211,238,0.7) rgba(34,211,238,0.7)"]
                    }}
                    transition={{ 
                      rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                      borderColor: { duration: 3, repeat: Infinity }
                    }}
                    className="w-12 h-12 border-4 border-t-transparent rounded-full"
                  ></motion.div>
                </motion.div>
                <motion.p 
                  animate={{ 
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-300 font-medium"
                >
                  Loading exciting competitions...
                </motion.p>
              </motion.div>
            ) : competitions?.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-24 h-24 mx-auto mb-6 text-cyan-300 bg-gray-800/70 rounded-full flex items-center justify-center shadow-lg"
                >
                  <motion.i 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="fas fa-search-minus text-5xl"
                  ></motion.i>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-gray-300 text-lg mb-4"
                >
                  No competitions found matching your criteria.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="mt-2 border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 shadow-md hover:shadow-lg hover:shadow-cyan-900/20 transition-all"
                    onClick={() => {
                      setPrizeValue("all");
                      setSortBy("popularity");
                    }}
                  >
                    <motion.span 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
                      className="mr-2"
                    >
                      <i className="fas fa-sync-alt"></i>
                    </motion.span>
                    Reset Filters
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {/* Interactive filter and category controls */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 flex flex-wrap gap-4 justify-center items-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                  >
                    <Select
                      value={prizeValue}
                      onValueChange={setPrizeValue}
                    >
                      <SelectTrigger className="min-w-[160px] border-0 bg-transparent text-gray-200 focus:ring-1 focus:ring-cyan-500/50">
                        <span className="flex items-center">
                          <Trophy className="h-4 w-4 text-cyan-400 mr-2"/>
                          <SelectValue placeholder="Prize Type" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="all">All Prizes</SelectItem>
                        <SelectItem value="cash">Cash Prizes</SelectItem>
                        <SelectItem value="family">Family Prizes</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                        <SelectItem value="tech">Tech Gadgets</SelectItem>
                        <SelectItem value="luxury">Luxury Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                  >
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger className="min-w-[160px] border-0 bg-transparent text-gray-200 focus:ring-1 focus:ring-purple-500/50">
                        <span className="flex items-center">
                          <Sparkles className="h-4 w-4 text-purple-400 mr-2"/>
                          <SelectValue placeholder="Sort By" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="popularity">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="endingSoon">Ending Soon</SelectItem>
                        <SelectItem value="prizeValueHigh">Prize: High to Low</SelectItem>
                        <SelectItem value="prizeValueLow">Prize: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                  >
                    <Select
                      value={activeTab}
                      onValueChange={setActiveTab}
                    >
                      <SelectTrigger className="min-w-[160px] border-0 bg-transparent text-gray-200 focus:ring-1 focus:ring-blue-500/50">
                        <span className="flex items-center">
                          <i className="fas fa-filter text-blue-400 mr-2 text-sm"></i>
                          <SelectValue placeholder="Filter By" />
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="trending">Trending Now</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="new">New Arrivals</SelectItem>
                        <SelectItem value="popular">Most Entered</SelectItem>
                        <SelectItem value="all">All Competitions</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </motion.div>

                {/* Staggered animation for competition cards */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 relative z-10"
                >
                  {competitions?.map((competition: CompetitionWithEntryStatus, index: number) => (
                    <motion.div 
                      key={competition.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                      }}
                      whileHover={{ 
                        y: -10, 
                        transition: { duration: 0.2 } 
                      }}
                    >
                      <CompetitionCard
                        competition={competition}
                        onEnter={handleEnterCompetition}
                        onBookmark={handleBookmarkCompetition}
                        onLike={handleLikeCompetition}
                        onCompleteEntry={handleCompleteEntry}
                        categoryTheme={competition.type === 'family' ? 'family' : 
                                      competition.type === 'appliances' ? 'appliances' : 
                                      competition.type === 'cash' ? 'cash' : undefined}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Animated competition count indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-12 flex justify-center"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center bg-gray-800/50 backdrop-blur-sm py-3 px-6 rounded-full border border-gray-700/50 shadow-lg"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="mr-3 text-cyan-400"
                    >
                      <i className="fas fa-ticket-alt text-lg"></i>
                    </motion.div>
                    <span className="text-sm font-medium text-gray-300">
                      Showing <motion.span 
                        initial={{ color: "#67e8f9" }}
                        animate={{ 
                          color: ["#67e8f9", "#a78bfa", "#67e8f9"] 
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="font-bold text-lg"
                      >
                        {competitions?.length || 0}
                      </motion.span> exciting competitions
                    </span>
                  </motion.div>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Extra spacing at the bottom */}
          <div className="py-6"></div>
        </div>
      </motion.div>

      {/* Banner Upload Modal */}
      <Dialog open={showBannerUploadModal} onOpenChange={setShowBannerUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Hero Banner</DialogTitle>
            <DialogDescription>
              Upload a new hero banner image for the dashboard. For best results, use a high-quality landscape image.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG or WebP (max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('type', 'banner');
                    
                    setIsUploading(true);
                    
                    apiRequest('POST', '/api/uploads/banner', formData, { isFormData: true })
                      .then(res => {
                        if (!res.ok) throw new Error('Failed to upload banner image');
                        return res.json();
                      })
                      .then(data => {
                        setBannerImage(data.imageUrl);
                        toast({
                          title: 'Banner Updated',
                          description: 'Hero banner has been successfully updated.',
                        });
                        setShowBannerUploadModal(false);
                      })
                      .catch(error => {
                        console.error('Error uploading banner:', error);
                        toast({
                          title: 'Upload Failed',
                          description: error.message,
                          variant: 'destructive',
                        });
                      })
                      .finally(() => {
                        setIsUploading(false);
                      });
                  }
                }}
              />
            </div>
            
            {isUploading && (
              <div className="text-center p-2">
                <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBannerUploadModal(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}