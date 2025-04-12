import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Medal, Bolt, ChartLine } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import { CompetitionWithEntryStatus, LeaderboardUser, UserStats } from "@shared/types";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("trending");
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  // Fetch competitions
  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery<CompetitionWithEntryStatus[]>({
    queryKey: ["/api/competitions", platform, type, sortBy, activeTab],
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Handle competition entry
  const handleEnterCompetition = (id: number) => {
    fetch(`/api/competitions/${id}/enter`, {
      method: "POST",
      credentials: "include"
    });
  };

  // Handle bookmarking competition
  const handleBookmarkCompetition = (id: number) => {
    fetch(`/api/competitions/${id}/bookmark`, {
      method: "POST",
      credentials: "include"
    });
  };

  // Handle liking competition
  const handleLikeCompetition = (id: number) => {
    fetch(`/api/competitions/${id}/like`, {
      method: "POST",
      credentials: "include"
    });
  };

  // Handle completing entry steps
  const handleCompleteEntry = (id: number) => {
    fetch(`/api/competitions/${id}/complete-entry`, {
      method: "POST",
      credentials: "include"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 bg-white p-6 rounded-xl shadow-md border-l-4 border-rose-500">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competition Dashboard</h1>
          <p className="text-base text-gray-600 mt-1">Discover trending competitions and track your entries</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <i className="fas fa-plus-circle mr-2"></i>
            <span>Add Competition</span>
          </Button>
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
                  ? "text-rose-600 border-rose-500 font-semibold" 
                  : "text-gray-500 hover:text-rose-500 border-transparent"
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
                  ? "text-rose-600 border-rose-500 font-semibold" 
                  : "text-gray-500 hover:text-rose-500 border-transparent"
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
                  ? "text-rose-600 border-rose-500 font-semibold" 
                  : "text-gray-500 hover:text-rose-500 border-transparent"
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
                  ? "text-rose-600 border-rose-500 font-semibold" 
                  : "text-gray-500 hover:text-rose-500 border-transparent"
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
            <i className="fas fa-sitemap text-indigo-500 mr-1"></i> Platform:
          </span>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="border-gray-200 rounded-lg text-sm h-9 w-[160px] bg-gray-50 focus:ring-rose-500">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="website">Website</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">
            <i className="fas fa-tag text-amber-500 mr-1"></i> Type:
          </span>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="border-gray-200 rounded-lg text-sm h-9 w-[160px] bg-gray-50 focus:ring-rose-500">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="giveaway">Giveaway</SelectItem>
              <SelectItem value="sweepstakes">Sweepstakes</SelectItem>
              <SelectItem value="contest">Contest</SelectItem>
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
            className="text-rose-600 border-rose-200 hover:bg-rose-50 text-sm font-medium h-9 rounded-lg"
            onClick={() => {
              setPlatform("all");
              setType("all");
              setSortBy("popularity");
            }}
          >
            <i className="fas fa-sync-alt mr-2"></i> Reset Filters
          </Button>
        </div>
      </div>

      {/* Competition Listings */}
      <div>
        {isLoadingCompetitions ? (
          <div className="p-8 text-center bg-white rounded-xl shadow">
            <p className="flex items-center justify-center text-gray-500">
              <i className="fas fa-circle-notch fa-spin mr-2 text-rose-500"></i>
              Loading competitions...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
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
                  Showing <span className="font-semibold text-rose-600">1</span> to <span className="font-semibold text-rose-600">4</span> of <span className="font-semibold text-rose-600">42</span> competitions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-md">
                  <i className="fas fa-chevron-left mr-1"></i> Previous
                </Button>
                <Button size="sm" className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white border-0 rounded-md">1</Button>
                <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-md">2</Button>
                <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-md">3</Button>
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
            <span className="inline-flex items-center text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors">
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
