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
                <Button className="bg-white text-blue-600 hover:bg-blue-50 py-2 px-6 rounded-md shadow-sm font-semibold transition-colors">
                  <i className="fas fa-trophy mr-2 text-blue-600"></i>
                  <span>View Competitions</span>
                </Button>
                <Button variant="outline" className="bg-transparent border border-white/30 text-white hover:bg-white/10 py-2 px-6 rounded-md font-medium transition-colors">
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
      
      {/* How to Play Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">
            <span className="relative inline-block">
              How to Play
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></span>
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full mx-auto mb-4 relative z-10">
                <i className="fas fa-search text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">1. Browse Competitions</h3>
              <p className="text-gray-600">
                Explore our wide range of exciting competitions across various categories and prize values.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full mx-auto mb-4 relative z-10">
                <i className="fas fa-ticket-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">2. Get Your Tickets</h3>
              <p className="text-gray-600">
                Purchase tickets for the competitions you want to enter. More tickets means more chances to win!
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full mx-auto mb-4 relative z-10 wiggle-on-hover">
                <i className="fas fa-trophy text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">3. Win Amazing Prizes</h3>
              <p className="text-gray-600">
                Wait for the draw date and check if you've won! Winners are notified immediately after the draw.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

        {/* Competition Listings with Integrated Header */}
        <div className="bg-gradient-to-b from-white to-blue-50 px-6 pt-10 pb-8 rounded-2xl shadow-lg border border-blue-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full translate-x-24 translate-y-12"></div>
          
          {/* Integrated header at the top of the section */}
          <div className="mb-8 relative z-10">
            <div className="flex items-center justify-center">
              <div className="h-px flex-grow bg-blue-200"></div>
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-full shadow-md py-3 px-6 mx-4 gradient-animate">
                <h2 className="font-extrabold text-xl md:text-2xl tracking-wide uppercase text-white flex items-center">
                  <span className="mr-2 text-blue-200">
                    <i className="fas fa-broadcast-tower"></i>
                  </span>
                  <span className="text-white">LIVE COMPETITIONS</span>
                  <span className="ml-2 text-blue-200">
                    <i className="fas fa-trophy"></i>
                  </span>
                </h2>
              </div>
              <div className="h-px flex-grow bg-blue-200"></div>
            </div>
          </div>
          
          {isLoadingCompetitions ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading exciting competitions...</p>
            </div>
          ) : competitions?.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 text-blue-300">
                <i className="fas fa-search-minus text-6xl"></i>
              </div>
              <p className="text-gray-600">No competitions found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
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
                  />
                ))}
              </div>
              
              {/* Pagination - redesigned with pill style */}
              <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center bg-white/60 backdrop-blur-sm p-2 px-4 rounded-full shadow-sm border border-blue-100 order-2 md:order-1">
                  <i className="fas fa-ticket-alt text-blue-400 mr-2"></i>
                  <span className="text-sm font-medium text-gray-600">
                    Showing <span className="font-bold text-blue-600">{competitions?.length || 0}</span> exciting competitions
                  </span>
                </div>
                
                <div className="flex items-center bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-blue-100 order-1 md:order-2">
                  <Button variant="ghost" size="sm" className="rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3">
                    <i className="fas fa-chevron-left text-xs"></i>
                  </Button>
                  
                  <div className="flex space-x-1 px-1">
                    <Button size="sm" className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-8 h-8 p-0">1</Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 p-0">2</Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 p-0 hidden xs:inline-flex">3</Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3">
                    <i className="fas fa-chevron-right text-xs"></i>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Extra spacing at the bottom */}
        <div className="py-6"></div>
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