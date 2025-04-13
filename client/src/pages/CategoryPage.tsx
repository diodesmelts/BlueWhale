import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { CompetitionWithEntryStatus } from "@shared/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

const CATEGORY_DETAILS = {
  family: {
    name: "Family Competitions",
    description: "Win amazing prizes for your family - from vacations to toys and experiences.",
    color: "yellow",
    gradient: "from-yellow-500 to-amber-400",
    lightGradient: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-300",
    icon: "fas fa-users",
    accentTextColor: "text-yellow-600"
  },
  appliances: {
    name: "Appliance Competitions",
    description: "Win the latest home appliances - from kitchen gadgets to smart home tech.",
    color: "pink",
    gradient: "from-pink-500 to-rose-400",
    lightGradient: "from-pink-50 to-rose-50",
    borderColor: "border-pink-300",
    icon: "fas fa-blender",
    accentTextColor: "text-pink-600"
  },
  cash: {
    name: "Cash Competitions",
    description: "Win cash prizes and gift cards - direct to your bank account or wallet.",
    color: "green",
    gradient: "from-green-500 to-emerald-400",
    lightGradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-300",
    icon: "fas fa-money-bill-wave",
    accentTextColor: "text-green-600"
  }
};

type CategoryPageProps = {
  category: "family" | "appliances" | "cash";
};

export default function CategoryPage({ category }: CategoryPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [prizeValue, setPrizeValue] = useState("all");
  const [sortBy, setSortBy] = useState("drawTime");
  
  const categoryDetails = CATEGORY_DETAILS[category];
  
  // Query for competitions with this category
  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery<CompetitionWithEntryStatus[]>({
    queryKey: [`/api/competitions/category/${category}`],
    queryFn: async () => {
      const response = await fetch(`/api/competitions/category/${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }
      return response.json();
    }
  });
  
  // Handle competition interaction events
  const handleEnterCompetition = (competitionId: number) => {
    // These would be implemented with actual API calls in a full implementation
    toast({
      title: "Opening tickets purchase",
      description: "You'll be directed to purchase tickets for this competition.",
    });
  };

  const handleBookmarkCompetition = (competitionId: number) => {
    toast({
      title: "Competition bookmarked",
      description: "This competition has been added to your bookmarks."
    });
  };

  const handleLikeCompetition = (competitionId: number) => {
    toast({
      title: "Competition liked",
      description: "You've liked this competition."
    });
  };

  const handleCompleteEntry = (competitionId: number) => {
    toast({
      title: "Entry completed",
      description: "Congratulations! You've completed all steps for this competition entry."
    });
  };

  // Theme colors for the gradient backgrounds
  const getBgGradient = () => `bg-gradient-to-r ${categoryDetails.gradient}`;
  const getLightBgGradient = () => `bg-gradient-to-r ${categoryDetails.lightGradient}`;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className={`${getBgGradient()} p-8 md:p-10 rounded-2xl shadow-xl mb-8 overflow-hidden relative`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="text-white">
            <div className="flex items-center mb-4">
              <i className={`${categoryDetails.icon} text-3xl mr-3`}></i>
              <h1 className="text-4xl font-extrabold tracking-tight">
                {categoryDetails.name}
              </h1>
            </div>
            <p className="text-xl font-medium text-white/90 max-w-xl mb-6">
              {categoryDetails.description}
            </p>
            
            <Button className="bg-white text-gray-800 hover:bg-white/90 py-2.5 px-6 rounded-full shadow-lg font-bold transition-all duration-300 text-lg">
              <i className={`${categoryDetails.icon} mr-2`}></i>
              <span>View All {category.charAt(0).toUpperCase() + category.slice(1)} Prizes</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className={`${getLightBgGradient()} p-5 rounded-xl ${categoryDetails.borderColor} border shadow mb-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <span className={`text-lg font-bold ${categoryDetails.accentTextColor} mr-2`}>
              <i className={`${categoryDetails.icon} mr-2`}></i>
              {categoryDetails.name}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className={`${categoryDetails.accentTextColor} ${categoryDetails.borderColor} hover:bg-white/60`}
              onClick={() => setSortBy("drawTime")}
            >
              <i className="fas fa-clock mr-1"></i> Ending Soon
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`${categoryDetails.accentTextColor} ${categoryDetails.borderColor} hover:bg-white/60`}
              onClick={() => setSortBy("prize")}
            >
              <i className="fas fa-gem mr-1"></i> Highest Value
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`${categoryDetails.accentTextColor} ${categoryDetails.borderColor} hover:bg-white/60`}
              onClick={() => setSortBy("newest")}
            >
              <i className="fas fa-calendar mr-1"></i> Newest
            </Button>
          </div>
        </div>
      </div>

      {/* Competition Listings */}
      <div className="bg-white p-6 rounded-xl shadow">
        {isLoadingCompetitions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border rounded-xl overflow-hidden bg-gray-50 h-96">
                <Skeleton className="w-full h-40" />
                <div className="p-4">
                  <Skeleton className="w-3/4 h-6 mb-2" />
                  <Skeleton className="w-1/2 h-4 mb-4" />
                  <Skeleton className="w-full h-12 mb-3" />
                  <Skeleton className="w-full h-10" />
                </div>
              </div>
            ))}
          </div>
        ) : competitions?.length === 0 ? (
          <div className="p-8 text-center">
            <p className={`text-lg font-medium ${categoryDetails.accentTextColor}`}>
              No {category} competitions available at the moment.
            </p>
            <p className="text-gray-500 mt-2">
              Check back soon for new opportunities to win!
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => setLocation("/")}
                className={`bg-gradient-to-r ${categoryDetails.gradient} text-white hover:opacity-90`}
              >
                Browse Other Competitions
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid layout with 3 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6">
              {competitions?.map((competition: CompetitionWithEntryStatus) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onEnter={handleEnterCompetition}
                  onBookmark={handleBookmarkCompetition}
                  onLike={handleLikeCompetition}
                  onCompleteEntry={handleCompleteEntry}
                  categoryTheme={category}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <div className={`p-5 flex items-center justify-between rounded-xl mt-6 ${getLightBgGradient()} ${categoryDetails.borderColor} border`}>
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Showing <span className={`font-semibold ${categoryDetails.accentTextColor}`}>1</span> to <span className={`font-semibold ${categoryDetails.accentTextColor}`}>{competitions?.length}</span> of <span className={`font-semibold ${categoryDetails.accentTextColor}`}>{competitions?.length}</span> competitions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${categoryDetails.accentTextColor} ${categoryDetails.borderColor} hover:bg-white/60`}
                >
                  <i className="fas fa-chevron-left mr-1"></i> Previous
                </Button>
                <Button 
                  size="sm" 
                  className={`px-3 py-1 ${getBgGradient()} text-white border-0`}
                >
                  1
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${categoryDetails.accentTextColor} ${categoryDetails.borderColor} hover:bg-white/60`}
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}