import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Medal, Bolt, ChartLine, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import { CompetitionWithEntryStatus, LeaderboardUser, UserStats } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trending");
  const [prizeValue, setPrizeValue] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
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
    <div className="container mx-auto px-4 py-6">
      {/* Hero Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-10 rounded-2xl shadow-xl mb-8 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 opacity-10 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-200 opacity-10 rounded-full -mb-10 -ml-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="text-white">
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">
              <span className="wiggle-on-hover inline-block">BLUE WHALE</span> <span className="text-yellow-300 pulse-glow inline-block">COMPETITIONS</span>
            </h1>
            <p className="text-xl font-medium text-white/90 max-w-xl">
              Your ultimate hub for <span className="underline decoration-yellow-300 decoration-wavy decoration-2 underline-offset-2">discovering</span>, <span className="underline decoration-yellow-300 decoration-wavy decoration-2 underline-offset-2">entering</span>, and <span className="underline decoration-yellow-300 decoration-wavy decoration-2 underline-offset-2">winning</span> amazing prizes!
            </p>
            
            <div className="mt-6 flex items-center space-x-4">
              <Button className="bg-white text-blue-900 hover:bg-yellow-300 hover:text-blue-800 py-2.5 px-6 rounded-full shadow-lg font-bold transition-all duration-300 text-lg">
                <i className="fas fa-trophy mr-2 text-amber-500"></i>
                <span>Start Winning</span>
              </Button>
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-indigo-700/40 py-2.5 px-6 rounded-full font-medium transition-all">
                <i className="fas fa-plus-circle mr-2 text-cyan-300"></i>
                <span>Add Competition</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-8 md:mt-0">
            <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center p-2 float-animation pulse-glow">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-5 shine-effect">
                <svg className="w-28 h-28 trophy-icon wiggle-on-hover" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 4H18V3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3V4H3C2.45 4 2 4.45 2 5V12C2 13.1 2.9 14 4 14H7.55C7.21 14.91 7 15.94 7 17C7 20.31 9.69 23 13 23C16.31 23 19 20.31 19 17C19 15.94 18.79 14.91 18.45 14H22C23.1 14 24 13.1 24 12V5C24 4.45 23.55 4 23 4H21ZM13 21C10.79 21 9 19.21 9 17C9 14.79 10.79 13 13 13C15.21 13 17 14.79 17 17C17 19.21 15.21 21 13 21ZM22 10H17.83C16.53 8.19 14.31 7 12 7C9.69 7 7.47 8.19 6.17 10H2V6H22V10Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Trophy size={20} />}
          iconColor="red"
          title="Active Entries"
          value={userStats?.activeEntries || 0}
        />
        <StatCard 
          icon={<Medal size={20} />}
          iconColor="green"
          title="Total Wins"
          value={userStats?.totalWins || 0}
        />
        <StatCard 
          icon={<Bolt size={20} />}
          iconColor="yellow"
          title="Win Rate"
          value={`${userStats?.winRate || 0}%`}
        />
        <StatCard 
          icon={<ChartLine size={20} />}
          iconColor="navy"
          title="Competitions Entered"
          value={userStats?.totalEntries || 0}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        <div className="border-b border-gray-100">
          <nav className="flex px-2">
            <a 
              href="#" 
              className={`text-sm px-6 py-4 font-medium text-center transition-all duration-200 border-b-2 ${
                activeTab === "trending" 
                  ? "text-blue-700 border-blue-700 font-semibold" 
                  : "text-gray-500 hover:text-blue-600 border-transparent"
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
                  ? "text-blue-700 border-blue-700 font-semibold" 
                  : "text-gray-500 hover:text-blue-600 border-transparent"
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
                  ? "text-blue-700 border-blue-700 font-semibold" 
                  : "text-gray-500 hover:text-blue-600 border-transparent"
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
                  ? "text-blue-700 border-blue-700 font-semibold" 
                  : "text-gray-500 hover:text-blue-600 border-transparent"
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
            className="text-blue-700 border-blue-200 hover:bg-blue-50 text-sm font-medium h-9 rounded-lg"
            onClick={() => {
              setPrizeValue("all");
              setSortBy("popularity");
            }}
          >
            <i className="fas fa-sync-alt mr-2"></i> Reset Filters
          </Button>
        </div>
      </div>

      {/* Competition Listings */}
      <div className="bg-white p-6 rounded-xl shadow">
        {isLoadingCompetitions ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading competitions...</p>
          </div>
        ) : competitions?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No competitions found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Grid layout with 3 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-0">
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
            <div className="p-5 flex items-center justify-between bg-white rounded-xl shadow mt-6">
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Showing <span className="font-semibold text-blue-700">1</span> to <span className="font-semibold text-blue-700">4</span> of <span className="font-semibold text-blue-700">42</span> competitions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-md">
                  <i className="fas fa-chevron-left mr-1"></i> Previous
                </Button>
                <Button size="sm" className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white border-0 rounded-md">1</Button>
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50 rounded-md">2</Button>
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50 rounded-md">3</Button>
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-md">
                  Next <i className="fas fa-chevron-right ml-1"></i>
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
            <span className="inline-flex items-center text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors">
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
  );
}
