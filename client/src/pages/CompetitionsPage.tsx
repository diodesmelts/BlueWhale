import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { CompetitionWithEntryStatus } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CompetitionsPage() {
  const { toast } = useToast();
  const [prizeValue, setPrizeValue] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  // For backward compatibility, keeping these available but not using them
  const type = prizeValue;
  const setType = setPrizeValue;
  const platform = "all";
  const setPlatform = () => {}; // Empty function since we're not using platform anymore

  // Fetch competitions
  const { data: competitions, isLoading, refetch } = useQuery<CompetitionWithEntryStatus[]>({
    queryKey: ["/api/competitions", prizeValue, sortBy],
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
    <div className="w-full bg-gradient-to-b from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header with Gradients and Effects */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-center relative z-10">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                  All Competitions
                </span>
              </h1>
              <p className="text-gray-400 mt-2">Find and enter competitions that match your interests</p>
            </div>
            <div>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-700/20 transition-all duration-300 px-5 py-6 rounded-xl">
                <i className="fas fa-plus-circle mr-2"></i>
                <span>Add Competition</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters with Dark Theme */}
        <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 shadow-xl backdrop-blur-sm flex flex-wrap items-center gap-4 mb-6">
          {/* Filter Buttons instead of Selects */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-300 mr-3">
              <i className="fas fa-gift text-cyan-400 mr-2"></i> Prize Value:
            </span>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setPrizeValue("all")}
                className={`px-4 py-2 rounded-full text-sm ${
                  prizeValue === "all" 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All Values
              </Button>
              <Button 
                onClick={() => setPrizeValue("high")}
                className={`px-4 py-2 rounded-full text-sm ${
                  prizeValue === "high" 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                High Value
              </Button>
              <Button 
                onClick={() => setPrizeValue("medium")}
                className={`px-4 py-2 rounded-full text-sm ${
                  prizeValue === "medium" 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Medium Value
              </Button>
              <Button 
                onClick={() => setPrizeValue("low")}
                className={`px-4 py-2 rounded-full text-sm ${
                  prizeValue === "low" 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Low Value
              </Button>
            </div>
          </div>
          
          <div className="flex items-center ml-auto">
            <span className="text-sm font-medium text-gray-300 mr-3">Sort By:</span>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setSortBy("popularity")}
                className={`px-4 py-2 rounded-full text-sm ${
                  sortBy === "popularity" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Popularity
              </Button>
              <Button 
                onClick={() => setSortBy("endDate")}
                className={`px-4 py-2 rounded-full text-sm ${
                  sortBy === "endDate" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                End Date
              </Button>
              <Button 
                onClick={() => setSortBy("prizeValue")}
                className={`px-4 py-2 rounded-full text-sm ${
                  sortBy === "prizeValue" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Prize Value
              </Button>
              <Button 
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 rounded-full text-sm ${
                  sortBy === "newest" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Newest
              </Button>
            </div>
          </div>
          
          <div className="flex items-center ml-auto mt-2 md:mt-0">
            <Button 
              variant="ghost" 
              className="text-cyan-400 hover:bg-gray-700 text-sm font-medium h-10"
              onClick={() => {
                setPrizeValue("all");
                setSortBy("popularity");
              }}
            >
              <i className="fas fa-sync-alt mr-1"></i> Reset
            </Button>
          </div>
        </div>

        {/* Competition Listings with Dark Theme */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700 shadow-xl backdrop-blur-sm p-6">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Loading competitions...</p>
            </div>
          ) : competitions?.length === 0 ? (
            <div className="p-12 text-center">
              <i className="fas fa-search text-5xl text-gray-600 mb-4"></i>
              <p className="text-gray-400 text-lg">No competitions found matching your criteria.</p>
              <Button 
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => {
                  setPrizeValue("all");
                  setSortBy("popularity");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Grid layout with 3 columns on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
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
              
              {/* Pagination with Dark Theme */}
              <div className="mt-8 pt-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-700">
                <div className="flex items-center text-sm text-gray-400 mb-4 md:mb-0">
                  <span>
                    Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{competitions?.length || 0}</span> of <span className="font-medium text-white">42</span> competitions
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Previous
                  </Button>
                  <Button 
                    size="sm" 
                    className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0"
                  >
                    1
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    2
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    3
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
