import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { CompetitionWithEntryStatus } from "@shared/types";

export default function MyEntries() {
  // Fetch user's entries
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/user/entries"],
  });

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

  // We don't need enter handler since these are already entered
  const handleEnterCompetition = () => {};

  const activeEntries = entries?.filter((entry: CompetitionWithEntryStatus) => {
    const endDate = new Date(entry.endDate);
    return endDate > new Date();
  }) || [];

  const completedEntries = entries?.filter((entry: CompetitionWithEntryStatus) => {
    return entry.entryProgress.every(step => step === 1);
  }) || [];

  const expiredEntries = entries?.filter((entry: CompetitionWithEntryStatus) => {
    const endDate = new Date(entry.endDate);
    return endDate <= new Date();
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#153B84]">My Competition Entries</h1>
        <p className="text-sm text-gray-600">Track your active and past competition entries</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-white rounded-t-lg border-b border-gray w-full justify-start">
          <TabsTrigger value="active" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Active Entries ({activeEntries.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Completed ({completedEntries.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Expired ({expiredEntries.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0 bg-white rounded-b-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading entries...</p>
            </div>
          ) : activeEntries.length > 0 ? (
            activeEntries.map((entry: CompetitionWithEntryStatus) => (
              <CompetitionCard
                key={entry.id}
                competition={entry}
                onEnter={handleEnterCompetition}
                onBookmark={handleBookmarkCompetition}
                onLike={handleLikeCompetition}
                onCompleteEntry={handleCompleteEntry}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No active entries found.</p>
              <button className="mt-4 bg-[#DB1F1F] hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300">
                Discover Competitions
              </button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0 bg-white rounded-b-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading entries...</p>
            </div>
          ) : completedEntries.length > 0 ? (
            completedEntries.map((entry: CompetitionWithEntryStatus) => (
              <CompetitionCard
                key={entry.id}
                competition={entry}
                onEnter={handleEnterCompetition}
                onBookmark={handleBookmarkCompetition}
                onLike={handleLikeCompetition}
                onCompleteEntry={handleCompleteEntry}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No completed entries found.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="mt-0 bg-white rounded-b-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading entries...</p>
            </div>
          ) : expiredEntries.length > 0 ? (
            expiredEntries.map((entry: CompetitionWithEntryStatus) => (
              <CompetitionCard
                key={entry.id}
                competition={entry}
                onEnter={handleEnterCompetition}
                onBookmark={handleBookmarkCompetition}
                onLike={handleLikeCompetition}
                onCompleteEntry={handleCompleteEntry}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No expired entries found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
