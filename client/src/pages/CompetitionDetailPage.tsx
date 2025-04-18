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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto py-8 px-4 relative">
        {/* Back button with category-specific styling */}
        <Button
          variant="ghost"
          className="mb-6 relative z-10 group transition-all duration-300 font-medium text-white hover:text-white/80"
          onClick={() => setLocation('/competitions')}
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="relative">
            Back to Competitions
            <span className="absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-white/70"></span>
          </span>
        </Button>

        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-800/50 relative z-10 shadow-blue-900/20">
          {/* Hero section with improved image treatment */}
          <div className="relative overflow-hidden">
            <div className="aspect-video max-h-[500px] w-full overflow-hidden">
              <img 
                src={competition.image} 
                alt={competition.title}
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full backdrop-blur-sm border transition-colors duration-300
                    ${competition.isBookmarked ? 
                      'border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 
                    'border-white/30 bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={() => handleBookmark(competition.id)}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full backdrop-blur-sm border transition-colors duration-300
                    ${competition.isLiked ? 
                      'border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 
                    'border-white/30 bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={() => handleLike(competition.id)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Category badge */}
              <div className="mt-auto space-y-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-blue-500/80 text-white">
                  PHOTO
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-md">{competition.title}</h1>
                <p className="text-white/80 text-lg flex items-center">
                  <span className="mr-1 opacity-75">by</span> 
                  <span className="font-medium">Blue Whale</span>
                  <CheckCircle className="h-4 w-4 ml-2 text-blue-400" />
                </p>
              </div>
            </div>
          </div>

          {/* Stats cards - more enhanced design */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-900/60">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-3">
                <Trophy className="text-blue-500 h-5 w-5 mr-2" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Prize</span>
              </div>
              <span className="text-2xl font-bold text-white">£{competition.prize}</span>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-3">
                <Users className="text-blue-500 h-5 w-5 mr-2" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Entries</span>
              </div>
              <span className="text-2xl font-bold text-white">{competition.entries}</span>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-3">
                <Clock className="text-blue-500 h-5 w-5 mr-2" />
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Ends In</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {isEnded ? "Ended" : "1 day"}
              </span>
            </div>
          </div>

          {/* Main content area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Left column - About and Competition Details */}
            <div className="md:col-span-2 space-y-6">
              {/* About section */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-500 w-1 h-6 rounded-full mr-3"></span>
                  About This Competition
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {competition.description}
                </p>
              </div>
              
              {/* Competition details section */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-500 w-1 h-6 rounded-full mr-3"></span>
                  Competition Details
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Draw Date</div>
                    <div className="text-white font-bold">
                      {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      }) : '17 Apr 2025'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Ticket Price</div>
                    <div className="text-white font-bold">
                      £{(competition.ticketPrice/100).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Max Tickets Per User</div>
                    <div className="text-white font-bold">
                      {competition.maxTicketsPerUser}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Available Tickets</div>
                    <div className="text-white font-bold">
                      {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Countdown and Ticket Purchase */}
            <div className="space-y-6">
              {/* Prize draw countdown */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
                <div className="bg-blue-600 py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-white mr-2" />
                    <h3 className="text-white font-bold">PRIZE DRAW COUNTDOWN</h3>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-bold bg-black/20 text-white">
                    {isEnded ? 'ENDED' : 'LIVE'}
                  </div>
                </div>
                
                <div className="p-4">
                  {isEnded ? (
                    <div className="text-center text-white text-xl font-bold py-4">
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
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
                <div className="bg-blue-600 py-3 px-4">
                  <h3 className="text-white font-bold">GET YOUR TICKETS</h3>
                </div>
                
                <div className="p-6">
                  {/* If user has tickets already */}
                  {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-white">
                          Your Tickets
                        </h4>
                        <div className="px-2 py-1 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </div>
                      </div>
                      
                      {/* User's ticket numbers */}
                      {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-400 mb-2">Your ticket numbers:</div>
                          <div className="flex flex-wrap gap-2">
                            {competition.ticketNumbers.map(number => (
                              <span key={number} className="px-2 py-1 rounded text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30">
                                #{number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Buy more tickets button */}
                      <Button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        disabled={isEnded}
                      >
                        Buy More Tickets
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Get Your Chance to Win
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Purchase tickets for your chance to win this amazing prize!
                        </p>
                      </div>
                      
                      {/* Ticket info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/80 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">Ticket Price</div>
                          <div className="text-lg font-bold text-white">£{(competition.ticketPrice/100).toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-800/80 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">Available</div>
                          <div className="text-lg font-bold text-white">
                            {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                          </div>
                        </div>
                      </div>
                      
                      {/* Get tickets button */}
                      <Button 
                        onClick={() => setIsTicketModalOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 relative overflow-hidden group"
                        disabled={isEnded}
                      >
                        <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                        GET YOUR TICKETS
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
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="bg-blue-500 w-1 h-6 rounded-full mr-3"></span>
                    Entry Steps
                  </h3>
                  
                  <div className="space-y-4">
                    {competition.entrySteps.map((step, index) => (
                      <div key={step.id} className="flex items-start bg-gray-800/80 p-4 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors duration-300">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                          ${competition.entryProgress?.includes(step.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                          {competition.entryProgress?.includes(step.id) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <div className="text-gray-100">{step.description}</div>
                          {step.link && (
                            <a 
                              href={step.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center mt-1"
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
                      className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
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