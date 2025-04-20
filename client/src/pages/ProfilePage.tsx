import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MascotSelector from "@/components/profile/MascotSelector";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMascotId, setCurrentMascotId] = useState<string | null>(user?.mascotId || "whale");
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
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account settings</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="bg-black border border-gray-800 rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 text-gray-300"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 text-gray-300"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-cyan-400 text-gray-300"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  View and update your profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-10">
                  <div className="space-y-6 flex-1">
                    <div>
                      <h3 className="text-lg font-medium text-cyan-400">Username</h3>
                      <p className="text-gray-300 mt-1">{user.username}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-cyan-400">Email</h3>
                      <p className="text-gray-300 mt-1">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-cyan-400">Account Status</h3>
                      <div className="flex items-center mt-1">
                        <span className="flex items-center text-green-400">
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div>
                      <h3 className="text-lg font-medium text-cyan-400">Mascot</h3>
                      <p className="text-gray-300 mt-1 mb-3">Choose a mascot that represents you</p>
                      
                      <div className="flex flex-col items-center space-y-4 bg-black bg-opacity-30 rounded-xl p-4 border border-gray-800">
                        <div className="relative">
                          <Avatar className="h-24 w-24 bg-black border-2 border-cyan-600 p-0 overflow-hidden shadow-lg">
                            <MascotSelector 
                              currentMascotId={currentMascotId} 
                              onSelect={setCurrentMascotId} 
                              className="w-24 h-24"
                            />
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white p-1 rounded-full text-xs shadow-md">
                            <i className="fas fa-edit"></i>
                          </div>
                        </div>
                        
                        <div className="w-full mt-6 mb-2">
                          <h4 className="text-sm font-medium text-gray-400 mb-3">Choose your favorite mascot:</h4>
                          <MascotSelector
                            currentMascotId={currentMascotId}
                            onSelect={setCurrentMascotId}
                            className="col-span-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-3 border-t border-gray-800 pt-4">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 border-0"
                  onClick={handleSaveChanges}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription className="text-gray-400">
                  Your account activity and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black bg-opacity-50 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-cyan-400 text-sm font-medium mb-1">Total Competitions Entered</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  <div className="bg-black bg-opacity-50 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-green-400 text-sm font-medium mb-1">Wins</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  <div className="bg-black bg-opacity-50 rounded-xl p-5 border border-gray-800">
                    <h3 className="text-purple-400 text-sm font-medium mb-1">Account Balance</h3>
                    <p className="text-3xl font-bold text-white">£{user.walletBalance?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize how Blue Whale Competitions looks for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Appearance settings coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800 text-white shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Control how and when you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Notification settings coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}