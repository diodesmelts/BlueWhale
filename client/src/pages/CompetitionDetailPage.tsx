import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CompetitionWithEntryStatus } from "@shared/types";
import { 
  Trophy, 
  Users, 
  Clock,
  ArrowLeft,
  Heart,
  Bookmark,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";
import EnhancedTicketModal from "@/components/payments/EnhancedTicketModal";
import { CountdownTimer } from "@/components/ui/countdown-timer";

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

  const handleCompleteEntry = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/complete-entry`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to complete entry steps');
        return res.json();
      })
      .then(data => {
        toast({
          title: 'Entry Completed!',
          description: 'You have successfully completed all entry steps.',
        });
        // Refetch competition data to update UI
        refetch();
      })
      .catch(err => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      });
  };

  const handleBookmark = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/bookmark`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to bookmark competition');
        return res.json();
      })
      .then(data => {
        toast({
          title: data.isBookmarked ? 'Bookmarked' : 'Removed from bookmarks',
          description: data.isBookmarked 
            ? 'Competition added to your bookmarks' 
            : 'Competition removed from your bookmarks',
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
  };

  const handleLike = (id: number) => {
    apiRequest('POST', `/api/competitions/${id}/like`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to like competition');
        return res.json();
      })
      .then(data => {
        toast({
          title: data.isLiked ? 'Liked' : 'Unliked',
          description: data.isLiked 
            ? 'Competition added to your likes' 
            : 'Competition removed from your likes',
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
    <div className="min-h-screen bg-[#0c111d]">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4 text-white hover:text-white/80 pl-0"
          onClick={() => setLocation('/competitions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competitions
        </Button>

        {/* Main content card with border */}
        <div className="bg-[#151f30] rounded-2xl shadow-xl overflow-hidden border border-[#1e2c44]">
          {/* Hero section with image on left */}
          <div className="flex flex-col md:flex-row">
            {/* Image on the left */}
            <div className="md:w-2/5 relative h-[320px] md:h-auto md:max-h-[380px]">
              <img 
                src={competition.image} 
                alt={competition.title}
                className="w-full h-full object-cover"
              />
              
              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-600 text-white">
                  PHOTO
                </div>
              </div>
              
              {/* Action button */}
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-black/30 text-white hover:bg-black/40"
                  onClick={() => handleBookmark(competition.id)}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Content on the right */}
            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{competition.title}</h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-white hover:text-blue-300"
                    onClick={() => handleLike(competition.id)}
                  >
                    <Heart className="h-5 w-5" fill={competition.isLiked ? "#3b82f6" : "none"} />
                  </Button>
                </div>
                
                <p className="text-white/80 text-sm mb-3">
                  by <span className="font-medium">Blue Whale</span>
                  <CheckCircle className="h-3 w-3 ml-1 inline text-blue-400" />
                </p>
                
                <p className="text-gray-300 mb-6 text-sm">
                  {competition.description}
                </p>
              </div>
              
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1a2639] rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Trophy className="text-blue-500 h-4 w-4 mr-2" />
                    <span className="text-gray-400 text-xs">Prize</span>
                  </div>
                  <span className="text-base font-bold text-white">£{competition.prize}</span>
                </div>
                
                <div className="bg-[#1a2639] rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Users className="text-blue-500 h-4 w-4 mr-2" />
                    <span className="text-gray-400 text-xs">Entries</span>
                  </div>
                  <span className="text-base font-bold text-white">{competition.entries}</span>
                </div>
                
                <div className="bg-[#1a2639] rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Clock className="text-blue-500 h-4 w-4 mr-2" />
                    <span className="text-gray-400 text-xs">Ends In</span>
                  </div>
                  <span className="text-base font-bold text-white">
                    {isEnded ? "Ended" : "1 day"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 border-t border-[#1e2c44]">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              {/* About section */}
              <div>
                <h2 className="text-lg font-bold text-white mb-3">
                  About This Competition
                </h2>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {competition.description}
                </div>
              </div>
              
              {/* Competition details */}
              <div>
                <h2 className="text-lg font-bold text-white mb-3">
                  Competition Details
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a2639] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Draw Date</div>
                    <div className="text-sm font-medium text-white">
                      {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      }) : '24 Apr 2025'}
                    </div>
                  </div>
                  
                  <div className="bg-[#1a2639] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Ticket Price</div>
                    <div className="text-sm font-medium text-white">
                      £{(competition.ticketPrice/100).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-[#1a2639] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Max Tickets Per User</div>
                    <div className="text-sm font-medium text-white">
                      {competition.maxTicketsPerUser}
                    </div>
                  </div>
                  
                  <div className="bg-[#1a2639] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Available Tickets</div>
                    <div className="text-sm font-medium text-white">
                      {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-5">
              {/* Prize draw countdown */}
              <div className="bg-[#1a2639] rounded-lg overflow-hidden border border-[#1e2c44]">
                <div className="bg-blue-600 py-2 px-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-white mr-2" />
                    <h3 className="text-sm text-white font-bold">PRIZE DRAW</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs bg-blue-700 text-white">
                    {isEnded ? 'ENDED' : 'LIVE'}
                  </div>
                </div>
                
                <div className="p-4">
                  {isEnded ? (
                    <div className="text-center text-white text-base font-bold">
                      COMPETITION CLOSED
                    </div>
                  ) : (
                    <CountdownTimer 
                      targetDate={competition.drawTime || new Date().toISOString()} 
                      showIcon={false}
                      categoryTheme="simple"
                    />
                  )}
                </div>
              </div>
              
              {/* Ticket purchase section */}
              <div className="bg-[#1a2639] rounded-lg overflow-hidden border border-[#1e2c44]">
                <div className="bg-blue-600 py-2 px-4">
                  <h3 className="text-sm text-white font-bold">GET TICKETS</h3>
                </div>
                
                <div className="p-4">
                  {/* If user has tickets already */}
                  {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">
                          Your Tickets
                        </h4>
                        <div className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">
                          {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </div>
                      </div>
                      
                      {/* User's ticket numbers */}
                      {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-400 mb-2">Your ticket numbers:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {competition.ticketNumbers.map(number => (
                              <span key={number} className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                                #{number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Buy more tickets button */}
                      <Button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
                        disabled={isEnded}
                      >
                        Buy More Tickets
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-1">
                          Get Your Chance to Win
                        </h4>
                        <p className="text-gray-400 text-xs">
                          Purchase tickets for your chance to win!
                        </p>
                      </div>
                      
                      {/* Ticket info */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#141e2e] p-3 rounded-lg">
                          <div className="text-xs text-gray-400">Ticket Price</div>
                          <div className="text-sm font-medium text-white">£{(competition.ticketPrice/100).toFixed(2)}</div>
                        </div>
                        <div className="bg-[#141e2e] p-3 rounded-lg">
                          <div className="text-xs text-gray-400">Available</div>
                          <div className="text-sm font-medium text-white">
                            {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                          </div>
                        </div>
                      </div>
                      
                      {/* Get tickets button */}
                      <Button 
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                        disabled={isEnded}
                      >
                        GET TICKETS
                      </Button>
                      
                      <div className="mt-2 text-xs text-center text-gray-400">
                        {isEnded ? 'This competition has ended' : `Max ${competition.maxTicketsPerUser} tickets per person`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Entry steps if user has entered */}
              {(competition.isEntered && competition.entrySteps && competition.entrySteps.length > 0) && (
                <div className="bg-[#1a2639] rounded-lg p-4 border border-[#1e2c44]">
                  <h3 className="text-md font-bold text-white mb-3">
                    Entry Steps
                  </h3>
                  
                  <div className="space-y-2.5">
                    {competition.entrySteps.map((step, index) => (
                      <div key={step.id} className="flex items-start bg-[#141e2e] p-3 rounded-lg">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold mr-2.5
                          ${competition.entryProgress?.includes(step.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                          {competition.entryProgress?.includes(step.id) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <div className="text-gray-200 text-sm">{step.description}</div>
                          {step.link && (
                            <a 
                              href={step.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center mt-1"
                            >
                              Visit Link
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 ml-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {competition.isEntered && !competition.entryProgress?.length && (
                    <Button
                      onClick={() => handleCompleteEntry(competition.id)}
                      className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
                    >
                      Complete All Steps
                    </Button>
                  )}
                </div>
              )}
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
          onConfirm={handlePurchaseTickets}
          isProcessing={isProcessing}
          userTickets={competition.ticketNumbers}
        />
      )}
    </div>
  );
}