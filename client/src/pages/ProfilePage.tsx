import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MascotSelector from "@/components/profile/MascotSelector";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMascotId, setCurrentMascotId] = useState<string | null>(user?.mascotId || "dolphin");
  const [selectedTab, setSelectedTab] = useState("profile");

  useEffect(() => {
    if (user?.mascotId) {
      setCurrentMascotId(user.mascotId);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { mascotId: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveChanges = () => {
    if (!currentMascotId) return;
    updateProfileMutation.mutate({ mascotId: currentMascotId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        <p className="text-gray-400 mb-2 text-sm">Manage your account settings</p>
        
        <div className="mb-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="bg-transparent p-0 w-auto space-x-2 border-b border-gray-800">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 text-gray-400 bg-transparent rounded-none px-6 py-2"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 text-gray-400 bg-transparent rounded-none px-6 py-2"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 text-gray-400 bg-transparent rounded-none px-6 py-2"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-8 mt-6">
              {/* Profile Information Card */}
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-medium text-white">Profile Information</h2>
                  <p className="text-gray-400 text-xs mt-1">View and update your profile details</p>
                </div>
  
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column - User Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 mb-2">Username</h3>
                        <p className="text-white">{user.username}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 mb-2">Email</h3>
                        <p className="text-white">{user.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 mb-2">Account Status</h3>
                        <div className="flex items-center">
                          <span className="inline-flex items-center text-white">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Mascot Selector */}
                    <div>
                      <h3 className="text-sm font-medium text-cyan-400 mb-2">Mascot</h3>
                      <p className="text-white text-xs mb-4">Choose a mascot that represents you</p>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-cyan-600/30 flex items-center justify-center p-1 mb-6 border-2 border-cyan-500/50 shadow-lg shadow-cyan-900/20">
                          <div className="w-full h-full rounded-full overflow-hidden">
                            <MascotSelector 
                              currentMascotId={currentMascotId} 
                              onSelect={setCurrentMascotId}
                            />
                          </div>
                        </div>
                        
                        <div className="w-full">
                          <h4 className="text-sm text-center text-cyan-400 mb-4">Choose your favorite mascot:</h4>
                          
                          <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 shadow-inner">
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                { id: 'whale', name: 'Blue Whale', color: 'bg-blue-500' },
                                { id: 'dolphin', name: 'Dolphin', color: 'bg-cyan-500' },
                                { id: 'shark', name: 'Shark', color: 'bg-gray-500' },
                                { id: 'octopus', name: 'Octopus', color: 'bg-fuchsia-500' },
                                { id: 'tropical-fish', name: 'Tropical Fish', color: 'bg-amber-500' },
                                { id: 'turtle', name: 'Turtle', color: 'bg-green-500' },
                                { id: 'crab', name: 'Crab', color: 'bg-red-500' },
                                { id: 'lobster', name: 'Lobster', color: 'bg-orange-500' },
                                { id: 'squid', name: 'Squid', color: 'bg-pink-500' },
                                { id: 'seal', name: 'Seal', color: 'bg-gray-400' },
                                { id: 'penguin', name: 'Penguin', color: 'bg-black border border-gray-700' },
                                { id: 'polar-bear', name: 'Polar Bear', color: 'bg-gray-100' },
                              ].map(mascot => (
                                <button
                                  key={mascot.id}
                                  className={`rounded-lg p-2 group flex flex-col items-center ${
                                    currentMascotId === mascot.id 
                                      ? 'bg-cyan-500/20 ring-2 ring-cyan-500' 
                                      : 'hover:bg-gray-800/50 transition-colors'
                                  }`}
                                  onClick={() => setCurrentMascotId(mascot.id)}
                                >
                                  <div className={`w-10 h-10 rounded-full ${mascot.color} mb-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform`}>
                                    <MascotSelector 
                                      currentMascotId={mascot.id} 
                                      onSelect={() => {}}
                                      className="inline-block"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-300 mt-1">{mascot.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="bg-gray-950 px-6 py-4 flex justify-end gap-3 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 border-0 shadow-md shadow-cyan-900/20"
                    onClick={handleSaveChanges}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <i className="fas fa-save mr-2"></i>
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
              
              {/* Account Statistics Card */}
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-medium text-white">Account Statistics</h2>
                  <p className="text-gray-400 text-xs mt-1">Your account activity and performance</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                  <div className="p-6 text-center">
                    <h3 className="text-xs font-medium text-cyan-400 mb-2">Total Competitions Entered</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-xs font-medium text-cyan-400 mb-2">Wins</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-xs font-medium text-cyan-400 mb-2">Account Balance</h3>
                    <p className="text-3xl font-bold text-white">£{user.walletBalance?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-6">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-medium text-white">Appearance Settings</h2>
                  <p className="text-gray-400 text-xs mt-1">Customize how Blue Whale Competitions looks for you</p>
                </div>
                
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 mb-4">
                    <i className="fas fa-paint-brush text-cyan-400 text-xl"></i>
                  </div>
                  <h3 className="text-white text-lg mb-2">Appearance settings coming soon!</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    We're working on customization options to let you personalize your Blue Whale Competitions experience.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <div className="p-5 border-b border-gray-800">
                  <h2 className="text-lg font-medium text-white">Notification Preferences</h2>
                  <p className="text-gray-400 text-xs mt-1">Control how and when you receive updates</p>
                </div>
                
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 mb-4">
                    <i className="fas fa-bell text-cyan-400 text-xl"></i>
                  </div>
                  <h3 className="text-white text-lg mb-2">Notification settings coming soon!</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    We're building a powerful notification system to keep you updated on competitions, wins, and important events.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}