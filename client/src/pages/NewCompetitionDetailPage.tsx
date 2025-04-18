import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CompetitionWithEntryStatus } from "@shared/types";
import { 
  Trophy, 
  Users, 
  Clock,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";
import EnhancedTicketModal from "@/components/payments/EnhancedTicketModal";

export default function CompetitionDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const competitionId = parseInt(params.id);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  // Payment integration
  const { initiatePayment, isProcessing } = usePayment({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your tickets have been purchased successfully.",
      });
      // Refetch competition data
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const { 
    data: competition, 
    isLoading, 
    error,
    refetch 
  } = useQuery<CompetitionWithEntryStatus>({
    queryKey: [`/api/competitions/${competitionId}`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/competitions/${competitionId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Competition not found');
        }
        throw new Error('Failed to fetch competition');
      }
      return res.json();
    }
  });

  // If competition not found, redirect to competitions page
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Competition not found or has been removed.",
        variant: "destructive"
      });
      setLocation('/competitions');
    }
  }, [error, setLocation, toast]);

  const handlePurchaseTickets = (ticketCount: number, selectedNumbers?: number[]) => {
    if (!competition) return;
    
    const totalAmount = competition.ticketPrice * ticketCount;
    
    initiatePayment({
      amount: totalAmount,
      competitionId: competition.id,
      ticketCount,
      paymentType: 'ticket_purchase',
      metadata: {
        competitionTitle: competition.title,
        selectedNumbers: selectedNumbers ? selectedNumbers.join(',') : undefined
      }
    });
    
    setIsTicketModalOpen(false);
  };

  const handleEnterCompetition = () => {
    if (!competition) return;
    
    if (competition.ticketPrice && competition.ticketPrice > 0) {
      setIsTicketModalOpen(true);
    } else {
      // For free competitions
      apiRequest('POST', `/api/competitions/${competition.id}/enter`, { ticketCount: 1 })
        .then(res => {
          if (!res.ok) throw new Error('Failed to enter competition');
          return res.json();
        })
        .then(() => {
          toast({
            title: 'Success!',
            description: 'You have successfully entered the competition.',
          });
          refetch();
        })
        .catch(err => {
          toast({
            title: 'Error',
            description: err.message,
            variant: 'destructive',
          });
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0c111d]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#0c111d] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Competition not found</h2>
        <p className="text-gray-400 mb-6">This competition may have been removed or doesn't exist.</p>
        <button 
          onClick={() => setLocation('/competitions')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Competitions
        </button>
      </div>
    );
  }

  const isEnded = competition.drawTime ? new Date(competition.drawTime) < new Date() : false;

  return (
    <div className="min-h-screen bg-[#0c111d] text-white">
      <div className="pb-20">
        {/* Back button */}
        <div className="mb-4 px-4 py-2">
          <button 
            className="text-white flex items-center" 
            onClick={() => setLocation('/competitions')}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Competitions
          </button>
        </div>
        
        {/* Competition Image and Title */}
        <div className="relative">
          <img
            src={competition.image}
            alt={competition.title}
            className="w-full h-[350px] object-cover"
          />
          
          {/* PHOTO badge */}
          <div className="absolute top-5 left-5">
            <span className="bg-blue-500 text-white text-sm font-semibold py-1 px-4 rounded-full">
              PHOTO
            </span>
          </div>
          
          {/* Title section */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent pt-16 pb-6 px-6">
            <h1 className="text-5xl font-bold text-white">{competition.title}</h1>
            <div className="flex items-center mt-1">
              <span className="text-white/90 text-sm">by Blue Whale</span>
              <div className="ml-2 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="grid grid-cols-3 border-t border-b border-[#1e2538]">
          {/* Prize */}
          <div className="py-4 flex flex-col items-center justify-center border-r border-[#1e2538]">
            <div className="mb-1">
              <Trophy className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xs text-gray-400">Prize</div>
            <div className="text-white font-bold">£{competition.prize}</div>
          </div>
          
          {/* Entries */}
          <div className="py-4 flex flex-col items-center justify-center border-r border-[#1e2538]">
            <div className="mb-1">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xs text-gray-400">Entries</div>
            <div className="text-white font-bold">{competition.entries}</div>
          </div>
          
          {/* Ends in */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="mb-1">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xs text-gray-400">Ends In</div>
            <div className="text-white font-bold">
              {isEnded ? "Competition ended" : "Competition ended"}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-4 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - About and details */}
          <div className="lg:col-span-2">
            {/* About section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3 border-b border-b-white/10 pb-1">
                About This Competition
              </h2>
              <p className="text-white/80">
                {competition.description}
              </p>
            </div>
            
            {/* Competition details */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3 border-b border-b-white/10 pb-1">
                Competition Details
              </h2>
              
              <div className="grid grid-cols-2 gap-4 bg-[#0f1525] p-4 rounded-md">
                <div>
                  <div className="text-sm text-gray-400">Draw Date</div>
                  <div className="text-white font-medium">
                    {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric'
                    }) : '17 Apr 2025'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Ticket Price</div>
                  <div className="text-white font-medium">
                    £{(competition.ticketPrice/100).toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Max Tickets Per User</div>
                  <div className="text-white font-medium">
                    {competition.maxTicketsPerUser}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Available Tickets</div>
                  <div className="text-white font-medium">
                    {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Timer and tickets */}
          <div>
            {/* Prize draw countdown */}
            <div className="mb-4">
              <div className="bg-blue-600 text-white rounded-t-md flex items-center justify-between px-4 py-2">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-white mr-2" />
                  <h3 className="font-bold text-white uppercase">Prize Draw Countdown</h3>
                </div>
                <div className="bg-black/20 text-white text-xs font-bold px-2 py-1 rounded">
                  ENDED
                </div>
              </div>
              
              <div className="bg-[#0f1525] p-4 text-center rounded-b-md">
                <div className="text-white text-xl font-bold tracking-wider">
                  COMPETITION CLOSED
                </div>
              </div>
            </div>
            
            {/* Ticket section */}
            <div>
              <div className="bg-blue-600 text-white rounded-t-md px-4 py-2">
                <h3 className="font-bold uppercase">Get Your Tickets</h3>
              </div>
              
              <div className="bg-[#0f1525] p-4 rounded-b-md">
                <h4 className="text-lg font-bold text-white mb-2">
                  Get Your Chance to Win
                </h4>
                <p className="text-white/80 text-sm mb-4">
                  Purchase tickets for your chance to win this amazing prize!
                </p>
                
                {/* Ticket info */}
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Ticket Price</div>
                    <div className="text-white font-bold">£{(competition.ticketPrice/100).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Available</div>
                    <div className="text-white font-bold">
                      {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                    </div>
                  </div>
                </div>
                
                {/* Get tickets button */}
                <button 
                  onClick={() => setIsTicketModalOpen(true)}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded text-center"
                  disabled={isEnded}
                >
                  GET YOUR TICKETS
                </button>
                
                <div className="text-center text-gray-400 text-xs mt-2">
                  This competition has ended
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ticket purchase modal */}
      {competition && (
        <EnhancedTicketModal 
          competition={competition}
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          onSuccess={() => {
            setIsTicketModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}