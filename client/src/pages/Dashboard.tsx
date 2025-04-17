import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { CompetitionWithEntryStatus, UserStats, LeaderboardUser } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { apiRequest } from "@/lib/queryClient";

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

  return (
    <>
      {/* Full-width Hero Welcome Section */}
      <div 
        className={`w-full ${!bannerImage ? 'bg-gradient-to-r from-blue-600 to-blue-800' : ''} py-32 overflow-hidden relative`}
        style={{
          backgroundImage: bannerImage ? `url(${bannerImage})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px',
        }}
      >
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaDZ2LTZoLTZ2NnptLTEyIDBoLTZ2Nmg2di02em0tNi02aC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center relative z-10 mx-auto max-w-6xl">
            <div className="text-white text-center">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
                <span className="text-white">BLUE WHALE</span> <span className="text-white font-light">COMPETITIONS</span>
              </h1>
              <p className="text-base md:text-lg font-normal text-white/90 max-w-xl mx-auto">
                Your premier destination for discovering, participating in, and winning exclusive competitions across multiple platforms.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={() => {
                    const competitionsSection = document.querySelector('.live-competitions-section');
                    if (competitionsSection) {
                      competitionsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-white text-blue-600 hover:bg-blue-50 py-2 px-6 rounded-md shadow-sm font-semibold transition-colors"
                >
                  <i className="fas fa-trophy mr-2 text-blue-600"></i>
                  <span>View Competitions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent border border-white/30 text-white hover:bg-white/10 py-2 px-6 rounded-md font-medium transition-colors"
                  onClick={() => {
                    const competitionsSection = document.querySelector('.live-competitions-section');
                    if (competitionsSection) {
                      competitionsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  <span>My Entries</span>
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="bg-black/30 border border-white/30 text-white hover:bg-black/40 py-2 px-6 rounded-md font-medium transition-colors"
                    onClick={() => setShowBannerUploadModal(true)}
                  >
                    <i className="fas fa-image mr-2"></i>
                    <span>Change Banner</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How to Play Section - Enhanced & More Exciting */}
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 py-14 relative">
        {/* Decorative elements to add visual excitement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-cyan-200 opacity-20"></div>
          <div className="absolute top-1/4 right-10 w-16 h-16 rounded-full bg-purple-200 opacity-30"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 rounded-full bg-blue-200 opacity-20"></div>
          <div className="absolute -bottom-6 right-1/3 w-20 h-20 rounded-full bg-pink-200 opacity-20"></div>
          <div className="absolute top-1/2 left-2/3 w-10 h-10 rounded-full bg-amber-200 opacity-25"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-12">
            <span className="text-sm uppercase tracking-wider font-semibold text-cyan-600 mb-2">Easy to Get Started</span>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
              <span className="relative inline-block">
                How to Play & Win
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></span>
              </span>
            </h2>
            <p className="text-center text-gray-600 max-w-lg">Join thousands of winners who've already discovered the excitement of Blue Whale Competitions!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 - Browse */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center relative overflow-hidden transform hover:-translate-y-1 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <i className="fas fa-search text-3xl"></i>
                </div>
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-blue-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute bottom-7 left-3 w-6 h-6 rounded-full bg-cyan-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">1. Browse Competitions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover our thrilling range of competitions with amazing prizes! From gadgets and holidays to cash prizes, there's something for everyone.
                </p>
                <Link href="/competitions" className="mt-6 text-blue-500 font-medium text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View All Competitions</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
            
            {/* Card 2 - Tickets */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center relative overflow-hidden transform hover:-translate-y-1 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md relative">
                  <i className="fas fa-ticket-alt text-3xl"></i>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full text-xs flex items-center justify-center animate-pulse">+1</span>
                </div>
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-cyan-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute bottom-7 left-3 w-6 h-6 rounded-full bg-blue-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">2. Get Your Tickets</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pick your favorites and grab your tickets! The more tickets you have, the better your chances of winning big. Simple, secure payment options available.
                </p>
                <div 
                  onClick={() => {
                    const competitionsSection = document.querySelector('.live-competitions-section');
                    if (competitionsSection) {
                      competitionsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="mt-6 text-cyan-500 font-medium text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span>See Ticket Options</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </div>
              </div>
            </div>
            
            {/* Card 3 - Win */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center relative overflow-hidden transform hover:-translate-y-1 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md relative wiggle-on-hover">
                  <i className="fas fa-trophy text-3xl"></i>
                  <span className="absolute -top-2 -right-2 text-2xl">✨</span>
                </div>
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-purple-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute bottom-7 left-3 w-6 h-6 rounded-full bg-pink-100 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">3. Win Amazing Prizes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch for the competition draw! Winners are picked at random and notified immediately. Could you be our next big winner?
                </p>
                <div 
                  onClick={() => {
                    const competitionsSection = document.querySelector('.live-competitions-section');
                    if (competitionsSection) {
                      competitionsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="mt-6 text-purple-500 font-medium text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span>See Recent Winners</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Added CTA button */}
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => {
                const competitionsSection = document.querySelector('.live-competitions-section');
                if (competitionsSection) {
                  competitionsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group relative inline-flex items-center justify-center px-8 py-3 font-medium overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md transition-all duration-300 ease-out hover:shadow-lg"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-gradient-to-r from-blue-600 to-blue-400 group-hover:translate-x-0 ease">
                <i className="fas fa-trophy mr-2"></i> Let's Go!
              </span>
              <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">Start Competing Now</span>
              <span className="relative invisible">Start Competing Now</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Live Competitions Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 py-16 relative overflow-hidden">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/6 w-40 h-40 bg-blue-900/20 rounded-full blur-3xl"></div>
          <div className="hidden md:block absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-cyan-600/30 to-purple-600/30 rounded-full blur-2xl"></div>
          <div className="hidden md:block absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Exciting Header Section */}
          <div className="mb-12 text-center">
            <div className="inline-block">
              <span className="uppercase tracking-wider text-xs font-semibold text-cyan-400 mb-2 block">Current Opportunities</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Live</span> Competitions
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Don't miss your chance to win these amazing prizes! New competitions added regularly.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Container for competition cards */}
          <div className="live-competitions-section relative z-10">
            {isLoadingCompetitions ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300 font-medium">Loading exciting competitions...</p>
              </div>
            ) : competitions?.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 text-cyan-300">
                  <i className="fas fa-search-minus text-6xl"></i>
                </div>
                <p className="text-gray-300">No competitions found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-cyan-700 text-cyan-400 hover:bg-cyan-900/30"
                  onClick={() => {
                    setPrizeValue("all");
                    setSortBy("popularity");
                  }}
                >
                  <i className="fas fa-sync-alt mr-2"></i> Reset Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Grid layout with 3 columns on larger screens - increased spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 relative z-10">
                  {competitions?.map((competition: CompetitionWithEntryStatus) => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      onEnter={handleEnterCompetition}
                      onBookmark={handleBookmarkCompetition}
                      onLike={handleLikeCompetition}
                      onCompleteEntry={handleCompleteEntry}
                      categoryTheme={competition.type === 'family' ? 'family' : 
                                    competition.type === 'appliances' ? 'appliances' : 
                                    competition.type === 'cash' ? 'cash' : undefined}
                    />
                  ))}
                </div>
                
                {/* Competition count indicator with improved styling for dark background */}
                <div className="mt-10 flex justify-center">
                  <div className="flex items-center justify-center bg-gray-800/50 backdrop-blur-sm py-2 px-5 rounded-full border border-gray-700/50">
                    <i className="fas fa-ticket-alt text-cyan-400 mr-2"></i>
                    <span className="text-sm font-medium text-gray-300">
                      Showing <span className="font-bold text-cyan-300">{competitions?.length || 0}</span> exciting competitions
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Extra spacing at the bottom */}
          <div className="py-6"></div>
        </div>
      </div>

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