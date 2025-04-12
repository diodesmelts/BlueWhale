import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Award, Gift, CalendarDays, Trophy } from "lucide-react";
import { CompetitionWithEntryStatus } from "@shared/types";

export default function MyWins() {
  // Fetch user's wins
  const { data: wins, isLoading } = useQuery({
    queryKey: ["/api/user/wins"],
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const pendingWins = wins?.filter((win: CompetitionWithEntryStatus) => !win.prizeReceived) || [];
  const receivedWins = wins?.filter((win: CompetitionWithEntryStatus) => win.prizeReceived) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#153B84]">My Wins</h1>
        <p className="text-sm text-gray-600">Track and manage your competition wins</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-[#7ED957] bg-opacity-10 p-3 mr-4">
              <Trophy className="text-[#7ED957]" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Wins</p>
              <h3 className="text-2xl font-semibold text-[#153B84]">{userStats?.totalWins || 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-[#FFF13A] bg-opacity-10 p-3 mr-4">
              <Gift className="text-[#FFF13A]" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <h3 className="text-2xl font-semibold text-[#153B84]">${userStats?.totalWinValue || 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-[#DB1F1F] bg-opacity-10 p-3 mr-4">
              <Award className="text-[#DB1F1F]" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <h3 className="text-2xl font-semibold text-[#153B84]">{userStats?.winRate || 0}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-[#153B84] bg-opacity-10 p-3 mr-4">
              <CalendarDays className="text-[#153B84]" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Win</p>
              <h3 className="text-xl font-semibold text-[#153B84]">{userStats?.lastWinDate || "None yet"}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-white rounded-t-lg border-b border-gray w-full justify-start">
          <TabsTrigger value="pending" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Pending ({pendingWins.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="text-sm px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#DB1F1F] data-[state=active]:shadow-none">
            Received ({receivedWins.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-0 bg-white rounded-b-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading wins...</p>
            </div>
          ) : pendingWins.length > 0 ? (
            <div className="divide-y divide-gray">
              {pendingWins.map((win: CompetitionWithEntryStatus) => (
                <div key={win.id} className="p-4 flex flex-col md:flex-row md:items-center">
                  <div 
                    className="w-full md:w-16 h-16 bg-gray-200 rounded-lg bg-center bg-cover mb-4 md:mb-0 md:mr-4"
                    style={{ backgroundImage: `url(${win.image})` }}
                  ></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#153B84]">{win.title}</h3>
                    <p className="text-sm text-gray-600">Won on {new Date(win.winDate).toLocaleDateString()}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm mr-4">
                        <i className="fas fa-gift text-[#153B84] mr-2"></i>
                        Value: ${win.prize}
                      </span>
                      <span className="text-sm">
                        <i className="fas fa-clock text-[#DB1F1F] mr-2"></i>
                        Claim by: {new Date(win.claimByDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <Button className="bg-[#7ED957] hover:bg-green-600 text-white">
                      Mark as Received
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No pending wins.</p>
              <Button className="mt-4 bg-[#DB1F1F] hover:bg-red-700 text-white">
                Discover Competitions
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="received" className="mt-0 bg-white rounded-b-lg shadow-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading wins...</p>
            </div>
          ) : receivedWins.length > 0 ? (
            <div className="divide-y divide-gray">
              {receivedWins.map((win: CompetitionWithEntryStatus) => (
                <div key={win.id} className="p-4 flex flex-col md:flex-row md:items-center">
                  <div 
                    className="w-full md:w-16 h-16 bg-gray-200 rounded-lg bg-center bg-cover mb-4 md:mb-0 md:mr-4"
                    style={{ backgroundImage: `url(${win.image})` }}
                  ></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#153B84]">{win.title}</h3>
                    <p className="text-sm text-gray-600">Won on {new Date(win.winDate).toLocaleDateString()}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm mr-4">
                        <i className="fas fa-gift text-[#153B84] mr-2"></i>
                        Value: ${win.prize}
                      </span>
                      <span className="text-sm">
                        <i className="fas fa-check-circle text-[#7ED957] mr-2"></i>
                        Received on: {new Date(win.receivedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <Button variant="outline" className="text-[#153B84] border-[#153B84]">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No received wins yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
