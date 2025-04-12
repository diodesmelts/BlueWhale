import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  // Fetch leaderboard
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  // Get top 3 users
  const topUsers = leaderboard?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#153B84]">Community Leaderboard</h1>
        <p className="text-sm text-gray-600">See how you rank against other competition enthusiasts</p>
      </div>

      {/* Top Winners */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#153B84] mb-4">Top Winners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topUsers.map((user, index) => (
            <Card key={user.id} className={index === 0 ? "border-[#FFF13A] border-2" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className={`rounded-full w-10 h-10 flex items-center justify-center ${
                    index === 0 ? "bg-[#FFF13A] text-[#153B84]" : 
                    index === 1 ? "bg-gray-300 text-[#153B84]" : 
                    "bg-[#FFF13A] bg-opacity-50 text-[#153B84]"
                  } font-bold text-lg mr-3`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center">
                    <Avatar className={`h-12 w-12 text-white ${
                      index === 0 ? "bg-[#DB1F1F]" : 
                      index === 1 ? "bg-[#153B84]" : 
                      "bg-[#7ED957]"
                    }`}>
                      <span className="text-sm">{user.initials}</span>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-semibold text-[#153B84]">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.isPremium ? "Premium Member" : "Free Member"}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">Entries</p>
                    <p className="font-semibold text-[#153B84]">{user.entries}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">Wins</p>
                    <p className="font-semibold text-[#153B84]">{user.wins}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <p className="text-xs text-gray-500">Win Rate</p>
                    <p className="font-semibold text-green-500">{user.winRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-fire text-[#DB1F1F] mr-1"></i> Streak
                    </span>
                    <span className="font-medium">{user.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="bg-white rounded-t-lg border-b border-gray w-full justify-start">
          <TabsTrigger value="overall" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Overall
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            This Month
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            This Week
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overall" className="mt-0">
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-b-lg">
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <LeaderboardTable
              users={leaderboard}
              currentUserId={1} // This would come from auth context in a real app
            />
          )}
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-0">
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-b-lg">
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <LeaderboardTable
              users={leaderboard} // In a real app, this would be filtered for monthly data
              currentUserId={1}
            />
          )}
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-0">
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-b-lg">
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <LeaderboardTable
              users={leaderboard} // In a real app, this would be filtered for weekly data
              currentUserId={1}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
