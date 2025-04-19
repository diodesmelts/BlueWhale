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
    <div className="min-h-screen bg-gradient-to-b from-[#0a101d] to-[#0f172a]">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        {/* Back button with elegant styling */}
        <Button
          variant="ghost"
          className="mb-8 text-white/80 hover:text-white pl-0 group transition-all duration-300"
          onClick={() => setLocation('/competitions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="relative">
            Back to Competitions
            <span className="absolute inset-x-0 bottom-0 h-px transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-white/40"></span>
          </span>
        </Button>

        {/* Main content card with subtle glass effect */}
        <div className="bg-gradient-to-br from-[#111827]/80 to-[#0f172a]/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-blue-900/30">
          {/* Hero section with image on left */}
          <div className="flex flex-col md:flex-row">
            {/* Image on the left with border */}
            <div className="md:w-2/5 relative h-[350px] md:h-auto p-3 md:p-6">
              <div className="relative h-full overflow-hidden rounded-xl border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <img 
                  src={competition.image} 
                  alt={competition.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                    PHOTO
                  </div>
                </div>
                
                {/* Action button */}
                <div className="absolute top-4 right-4 flex space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full backdrop-blur-sm ${competition.isBookmarked ? 
                      'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 
                      'bg-black/40 text-white border border-white/10 hover:border-white/30'}`}
                    onClick={() => handleBookmark(competition.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content on the right */}
            <div className="md:w-3/5 p-6 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {competition.title}
                  </h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full backdrop-blur-sm ${competition.isLiked ? 
                      'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 
                      'text-white/70 hover:text-white'}`}
                    onClick={() => handleLike(competition.id)}
                  >
                    <Heart className="h-5 w-5" fill={competition.isLiked ? "#f87171" : "none"} />
                  </Button>
                </div>
                
                <p className="text-blue-200/80 text-sm mb-4 flex items-center">
                  <span>by</span> 
                  <span className="font-medium mx-1">Blue Whale</span>
                  <CheckCircle className="h-3 w-3 text-blue-400" />
                </p>
                
                <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                  {competition.description}
                </p>
              </div>
              
              {/* Stats cards with glowing effect */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl p-4 shadow-lg hover:shadow-blue-900/10 transition-all border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Trophy className="text-blue-400 h-4 w-4 mr-2" />
                    <span className="text-blue-200/70 text-xs">Prize</span>
                  </div>
                  <span className="text-lg font-bold text-white">£{competition.prize}</span>
                </div>
                
                <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl p-4 shadow-lg hover:shadow-blue-900/10 transition-all border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Users className="text-blue-400 h-4 w-4 mr-2" />
                    <span className="text-blue-200/70 text-xs">Entries</span>
                  </div>
                  <span className="text-lg font-bold text-white">{competition.entries}</span>
                </div>
                
                <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl p-4 shadow-lg hover:shadow-blue-900/10 transition-all border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Clock className="text-blue-400 h-4 w-4 mr-2" />
                    <span className="text-blue-200/70 text-xs">Ends In</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {isEnded ? "Ended" : "1 day"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10 border-t border-blue-900/30">
            {/* Left column */}
            <div className="md:col-span-2 space-y-8">
              {/* About section */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-500 w-1 h-5 rounded-full mr-3"></span>
                  About This Competition
                </h2>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {competition.description}
                </div>
              </div>
              
              {/* Competition details */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-500 w-1 h-5 rounded-full mr-3"></span>
                  Competition Details
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] p-4 rounded-xl border border-blue-900/30">
                    <div className="text-xs text-blue-200/70 mb-2">Draw Date</div>
                    <div className="text-sm font-medium text-white">
                      {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      }) : '24 Apr 2025'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] p-4 rounded-xl border border-blue-900/30">
                    <div className="text-xs text-blue-200/70 mb-2">Ticket Price</div>
                    <div className="text-sm font-medium text-white">
                      £{(competition.ticketPrice/100).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] p-4 rounded-xl border border-blue-900/30">
                    <div className="text-xs text-blue-200/70 mb-2">Max Tickets Per User</div>
                    <div className="text-sm font-medium text-white">
                      {competition.maxTicketsPerUser}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] p-4 rounded-xl border border-blue-900/30">
                    <div className="text-xs text-blue-200/70 mb-2">Available Tickets</div>
                    <div className="text-sm font-medium text-white">
                      {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Prize draw countdown */}
              <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl overflow-hidden border border-blue-900/30 shadow-lg">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-white mr-2" />
                    <h3 className="text-sm text-white font-bold">PRIZE DRAW</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                    {isEnded ? 'ENDED' : 'LIVE'}
                  </div>
                </div>
                
                <div className="p-5">
                  {isEnded ? (
                    <div className="text-center text-white text-base font-bold py-3">
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
              <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl overflow-hidden border border-blue-900/30 shadow-lg">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4">
                  <h3 className="text-sm text-white font-bold">GET TICKETS</h3>
                </div>
                
                <div className="p-5">
                  {/* If user has tickets already */}
                  {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-white">
                          Your Tickets
                        </h4>
                        <div className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20">
                          {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </div>
                      </div>
                      
                      {/* User's ticket numbers */}
                      {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                        <div className="mb-5">
                          <div className="text-xs text-blue-200/70 mb-3">Your ticket numbers:</div>
                          <div className="flex flex-wrap gap-2">
                            {competition.ticketNumbers.map(number => (
                              <span key={number} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20">
                                #{number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Buy more tickets button */}
                      <Button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg"
                        disabled={isEnded}
                      >
                        Buy More Tickets
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-5">
                        <h4 className="text-sm font-medium text-white mb-2">
                          Get Your Chance to Win
                        </h4>
                        <p className="text-blue-200/60 text-xs">
                          Purchase tickets for your chance to win!
                        </p>
                      </div>
                      
                      {/* Ticket info */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-[#131d31] p-3 rounded-lg border border-blue-900/40">
                          <div className="text-xs text-blue-200/70 mb-1">Ticket Price</div>
                          <div className="text-sm font-medium text-white">£{(competition.ticketPrice/100).toFixed(2)}</div>
                        </div>
                        <div className="bg-[#131d31] p-3 rounded-lg border border-blue-900/40">
                          <div className="text-xs text-blue-200/70 mb-1">Available</div>
                          <div className="text-sm font-medium text-white">
                            {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                          </div>
                        </div>
                      </div>
                      
                      {/* Get tickets button */}
                      <Button 
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg relative overflow-hidden group"
                        disabled={isEnded}
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
                        GET TICKETS
                      </Button>
                      
                      <div className="mt-3 text-xs text-center text-blue-200/60">
                        {isEnded ? 'This competition has ended' : `Max ${competition.maxTicketsPerUser} tickets per person`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Entry steps if user has entered */}
              {(competition.isEntered && competition.entrySteps && competition.entrySteps.length > 0) && (
                <div className="bg-gradient-to-br from-[#1a2641] to-[#111827] rounded-xl p-5 border border-blue-900/30 shadow-lg">
                  <h3 className="text-md font-bold text-white mb-4 flex items-center">
                    <span className="bg-blue-500 w-1 h-5 rounded-full mr-3"></span>
                    Entry Steps
                  </h3>
                  
                  <div className="space-y-3">
                    {competition.entrySteps.map((step, index) => (
                      <div key={step.id} className="flex items-start bg-[#131d31] p-3 rounded-lg border border-blue-900/40">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                          ${competition.entryProgress?.includes(step.id) ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
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
                              className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center mt-1 group"
                            >
                              Visit Link
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform">
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
                      className="mt-5 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg"
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

      {/* Add shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
}