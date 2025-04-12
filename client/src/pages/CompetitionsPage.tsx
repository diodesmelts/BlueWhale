import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { CompetitionWithEntryStatus } from "@shared/types";

export default function CompetitionsPage() {
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Fetch competitions
  const { data: competitions, isLoading } = useQuery({
    queryKey: ["/api/competitions", platform, type, sortBy],
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#153B84]">All Competitions</h1>
          <p className="text-sm text-gray-600">Find and enter competitions that match your interests</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#DB1F1F] hover:bg-red-700 text-white font-medium transition duration-300">
            <i className="fas fa-plus-circle mr-2"></i>
            <span>Add Competition</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-t-lg border-b border-gray flex flex-wrap items-center gap-4">
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
        {isLoading ? (
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{competitions?.length || 0}</span> of <span className="font-medium">42</span> competitions
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
    </div>
  );
}
