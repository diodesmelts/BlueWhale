import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import { CompetitionWithEntryStatus, LeaderboardUser, UserStats } from "@shared/types";
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
        className="w-full bg-blue-600 py-32 overflow-hidden relative"
        style={{
          backgroundImage: `url(${bannerImage || ''})`,
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
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 mx-auto max-w-6xl">
            <div className="text-white md:pr-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                <span className="text-white">BLUE WHALE</span> <span className="text-white font-light">COMPETITIONS</span>
              </h1>
              <p className="text-lg font-normal text-white/90 max-w-xl">
                Your premier destination for discovering, participating in, and winning exclusive competitions across multiple platforms.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
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
            
            <div className="hidden md:block">
              <div className="w-52 h-52 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center p-3">
                <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center p-5">
                  <svg className="w-28 h-28 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 4H18V3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3V4H3C2.45 4 2 4.45 2 5V12C2 13.1 2.9 14 4 14H7.55C7.21 14.91 7 15.94 7 17C7 20.31 9.69 23 13 23C16.31 23 19 20.31 19 17C19 15.94 18.79 14.91 18.45 14H22C23.1 14 24 13.1 24 12V5C24 4.45 23.55 4 23 4H21ZM13 21C10.79 21 9 19.21 9 17C9 14.79 10.79 13 13 13C15.21 13 17 14.79 17 17C17 19.21 15.21 21 13 21ZM22 10H17.83C16.53 8.19 14.31 7 12 7C9.69 7 7.47 8.19 6.17 10H2V6H22V10Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="border-b border-gray-100">
            <nav className="flex px-2">
              <a 
                href="#" 
                className={`text-sm px-6 py-4 font-medium text-center transition-all duration-200 border-b-2 ${
                  activeTab === "trending" 
                    ? "text-blue-500 border-blue-500 font-semibold" 
                    : "text-gray-500 hover:text-blue-500 border-transparent"
                }`}
                onClick={(e) => { e.preventDefault(); setActiveTab("trending"); }}
              >
                <i className="fas fa-fire mr-2 text-amber-500"></i>
                Trending Competitions
              </a>
              <a 
                href="#" 
                className={`text-sm px-6 py-4 font-medium text-center transition-all duration-200 border-b-2 ${
                  activeTab === "my-entries" 
                    ? "text-blue-500 border-blue-500 font-semibold" 
                    : "text-gray-500 hover:text-blue-500 border-transparent"
                }`}
                onClick={(e) => { e.preventDefault(); setActiveTab("my-entries"); }}
              >
                <i className="fas fa-clipboard-check mr-2 text-emerald-500"></i>
                My Entries
              </a>
              <a 
                href="#" 
                className={`text-sm px-6 py-4 font-medium text-center transition-all duration-200 border-b-2 ${
                  activeTab === "ending-soon" 
                    ? "text-blue-500 border-blue-500 font-semibold" 
                    : "text-gray-500 hover:text-blue-500 border-transparent"
                }`}
                onClick={(e) => { e.preventDefault(); setActiveTab("ending-soon"); }}
              >
                <i className="fas fa-clock mr-2 text-orange-500"></i>
                Ending Soon
              </a>
              <a 
                href="#" 
                className={`text-sm px-6 py-4 font-medium text-center transition-all duration-200 border-b-2 ${
                  activeTab === "high-value" 
                    ? "text-blue-500 border-blue-500 font-semibold" 
                    : "text-gray-500 hover:text-blue-500 border-transparent"
                }`}
                onClick={(e) => { e.preventDefault(); setActiveTab("high-value"); }}
              >
                <i className="fas fa-gem mr-2 text-violet-500"></i>
                High Value
              </a>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow flex flex-wrap items-center gap-5 mb-6">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              <i className="fas fa-gift text-amber-500 mr-1"></i> Prize Value:
            </span>
            <Select value={prizeValue} onValueChange={setPrizeValue}>
              <SelectTrigger className="border-gray-200 rounded-lg text-sm h-9 w-[180px] bg-gray-50 focus:ring-rose-500">
                <SelectValue placeholder="All Prize Values" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prize Values</SelectItem>
                <SelectItem value="high">High Value ($1000+)</SelectItem>
                <SelectItem value="medium">Medium Value ($100-$999)</SelectItem>
                <SelectItem value="low">Low Value (Under $100)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              <i className="fas fa-sort text-emerald-500 mr-1"></i> Sort By:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-200 rounded-lg text-sm h-9 w-[160px] bg-gray-50 focus:ring-rose-500">
                <SelectValue placeholder="Popularity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="endDate">End Date</SelectItem>
                <SelectItem value="prizeValue">Prize Value</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center ml-auto">
            <Button 
              variant="outline" 
              className="text-blue-500 border-blue-200 hover:bg-blue-50 text-sm font-medium h-9 rounded-lg"
              onClick={() => {
                setPrizeValue("all");
                setSortBy("popularity");
              }}
            >
              <i className="fas fa-sync-alt mr-2"></i> Reset Filters
            </Button>
          </div>
        </div>

        {/* Live Competitions Header */}
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center">
            <div className="h-px flex-grow bg-gray-200 mx-4"></div>
            <h2 className="font-bold text-xl px-4 tracking-wide uppercase">
              <span className="text-blue-600">LIVE</span> <span className="text-gray-800">COMPETITIONS</span>
            </h2>
            <div className="h-px flex-grow bg-gray-200 mx-4"></div>
          </div>
        </div>
        
        {/* Competition Listings */}
        <div className="bg-white px-6 py-8 rounded-lg shadow-sm">
          {isLoadingCompetitions ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading competitions...</p>
            </div>
          ) : competitions?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No competitions found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Grid layout with 3 columns on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
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
              
              {/* Pagination */}
              <div className="mt-10 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Showing <span className="font-medium text-blue-600">{competitions?.length || 0}</span> competitions
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:bg-blue-50 rounded-md px-3">
                    <i className="fas fa-chevron-left text-xs mr-1"></i> Prev
                  </Button>
                  <Button size="sm" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md">1</Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:bg-blue-50 rounded-md px-4 py-1.5">2</Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:bg-blue-50 rounded-md px-4 py-1.5">3</Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:bg-blue-50 rounded-md px-3">
                    Next <i className="fas fa-chevron-right text-xs ml-1"></i>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-10 mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-trophy text-amber-500 mr-2"></i>
              Community Leaderboard
            </h2>
            <Link href="/leaderboard">
              <span className="inline-flex items-center text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                View Complete Leaderboard 
                <i className="fas fa-arrow-right ml-1"></i>
              </span>
            </Link>
          </div>
          {leaderboard && (
            <LeaderboardTable 
              users={leaderboard} 
              currentUserId={1} // This would come from auth context in a real app
            />
          )}
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