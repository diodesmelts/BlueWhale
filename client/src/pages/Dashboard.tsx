import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, Medal, Bolt, ChartLine } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import { CompetitionWithEntryStatus, LeaderboardUser } from "@shared/types";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("trending");
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  // Fetch competitions
  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ["/api/competitions", platform, type, sortBy, activeTab],
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#153B84]">Competition Dashboard</h1>
          <p className="text-sm text-gray-600">Discover trending competitions and track your entries</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#DB1F1F] hover:bg-red-700 text-white font-medium transition duration-300">
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
      <div className="bg-white rounded-t-lg shadow pt-1">
        <div className="border-b border-gray">
          <nav className="flex -mb-px">
            <a 
              href="#" 
              className={`text-sm px-4 py-3 font-medium flex-1 text-center transition-all duration-200 border-b-3 ${
                activeTab === "trending" 
                  ? "text-[#153B84] border-b-3 border-[#DB1F1F]" 
                  : "text-gray-500 hover:text-[#153B84] border-transparent"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("trending"); }}
            >
              Trending Competitions
            </a>
            <a 
              href="#" 
              className={`text-sm px-4 py-3 font-medium flex-1 text-center transition-all duration-200 border-b-3 ${
                activeTab === "my-entries" 
                  ? "text-[#153B84] border-b-3 border-[#DB1F1F]" 
                  : "text-gray-500 hover:text-[#153B84] border-transparent"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("my-entries"); }}
            >
              My Entries
            </a>
            <a 
              href="#" 
              className={`text-sm px-4 py-3 font-medium flex-1 text-center transition-all duration-200 border-b-3 ${
                activeTab === "ending-soon" 
                  ? "text-[#153B84] border-b-3 border-[#DB1F1F]" 
                  : "text-gray-500 hover:text-[#153B84] border-transparent"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("ending-soon"); }}
            >
              Ending Soon
            </a>
            <a 
              href="#" 
              className={`text-sm px-4 py-3 font-medium flex-1 text-center transition-all duration-200 border-b-3 ${
                activeTab === "high-value" 
                  ? "text-[#153B84] border-b-3 border-[#DB1F1F]" 
                  : "text-gray-500 hover:text-[#153B84] border-transparent"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("high-value"); }}
            >
              High Value
            </a>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-b border-gray flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600 mr-2">Platform:</span>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="border-gray rounded-md text-sm h-8 w-[140px]">
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
          <span className="text-sm font-medium text-gray-600 mr-2">Type:</span>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="border-gray rounded-md text-sm h-8 w-[140px]">
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
          <span className="text-sm font-medium text-gray-600 mr-2">Sort By:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-gray rounded-md text-sm h-8 w-[140px]">
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
            variant="ghost" 
            className="text-[#153B84] hover:bg-gray-100 text-sm font-medium h-8"
            onClick={() => {
              setPlatform("all");
              setType("all");
              setSortBy("popularity");
            }}
          >
            <i className="fas fa-sync-alt mr-1"></i> Reset
          </Button>
        </div>
      </div>

      {/* Competition Listings */}
      <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
        {isLoadingCompetitions ? (
          <div className="p-8 text-center">
            <p>Loading competitions...</p>
          </div>
        ) : (
          <>
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
            
            {/* Pagination */}
            <div className="p-4 flex items-center justify-between border-t border-gray">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">42</span> competitions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-[#153B84]">Previous</Button>
                <Button size="sm" className="px-3 py-1 bg-[#153B84] text-white border border-[#153B84]">1</Button>
                <Button variant="outline" size="sm" className="text-[#153B84]">2</Button>
                <Button variant="outline" size="sm" className="text-[#153B84]">3</Button>
                <Button variant="outline" size="sm" className="text-[#153B84]">Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#153B84]">Community Leaderboard</h2>
          <Link href="/leaderboard" className="text-[#DB1F1F] hover:text-red-700 text-sm font-medium">View Complete Leaderboard</Link>
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
