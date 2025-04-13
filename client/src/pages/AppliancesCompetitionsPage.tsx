import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CompetitionWithEntryStatus } from "@shared/types";
import CompetitionCard from "@/components/dashboard/CompetitionCard";
import PaymentModal from "@/components/payments/PaymentModal";
import { useToast } from "@/hooks/use-toast";

export default function AppliancesCompetitionsPage() {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState("popularity");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionWithEntryStatus | null>(null);
  const [ticketCount, setTicketCount] = useState(1);

  // Query competitions with category=appliances filter
  const { data: competitions, isLoading } = useQuery<CompetitionWithEntryStatus[]>({
    queryKey: ["/api/competitions/category/appliances", sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/competitions/category/appliances?sortBy=${sortBy}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appliances competitions");
      }
      return response.json();
    }
  });

  const handleEnterCompetition = (competitionId: number) => {
    const competition = competitions?.find(comp => comp.id === competitionId);
    if (competition) {
      setSelectedCompetition(competition);
      setTicketCount(1);
      setShowPaymentModal(true);
    }
  };

  const handleBookmark = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/bookmark`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to bookmark competition");
      }
      
      // Refresh competitions data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark competition",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/like`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to like competition");
      }
      
      // Refresh competitions data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like competition",
        variant: "destructive",
      });
    }
  };

  const handleCompleteEntry = async (competitionId: number) => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}/complete-entry`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to complete entry");
      }
      
      // Refresh competitions data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete entry",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-pink-500">Appliances Competitions</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Win the latest home appliances and upgrade your living space
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <select
            className="bg-background border border-input rounded-md p-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popularity">Most Popular</option>
            <option value="endDate">Ending Soon</option>
            <option value="prizeValue">Highest Value</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {competitions && competitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              onEnter={handleEnterCompetition}
              onBookmark={handleBookmark}
              onLike={handleLike}
              onCompleteEntry={handleCompleteEntry}
              categoryTheme="appliances"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">No appliances competitions found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back soon for new appliances competitions
          </p>
        </div>
      )}

      {showPaymentModal && selectedCompetition && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedCompetition.ticketPrice * ticketCount}
          description={`${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${selectedCompetition.title}`}
          actionText="Pay Now"
          metadata={{
            competitionId: selectedCompetition.id.toString(),
            ticketCount: ticketCount.toString()
          }}
        />
      )}
    </div>
  );
}