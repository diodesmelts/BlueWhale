import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import CompetitionManagement from "@/components/admin/CompetitionManagement";
import CompetitionCreationForm from "@/components/admin/CompetitionCreationForm";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { PlusCircle, ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ListingsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Blue Whale - Listings Management";
  }, []);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/check");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
          setLocation("/");
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [setLocation, toast]);
  
  // If admin status is still loading, show loading state
  if (isAdmin === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  // If user is not an admin, they will be redirected by the useEffect
  
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Listings Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create, edit, and manage competition listings
          </p>
        </div>
        
        <Tabs defaultValue="manage" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span>Manage Competitions</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Competition</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="p-6">
                <CompetitionManagement />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="p-6">
                <CompetitionCreationForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}