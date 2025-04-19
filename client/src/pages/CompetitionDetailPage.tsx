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
  CheckCircle,
  Calendar,
  Ticket,
  ChevronLeft
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
  const [activeTab, setActiveTab] = useState('details');
  
  // Payment integration
  const { initiatePayment, isProcessing } = usePayment({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your tickets have been purchased successfully.",
      });
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
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
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
    <div className="min-h-screen bg-gray-950">
      {/* Header area with back button and competition title */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => setLocation('/competitions')}
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-white text-lg font-medium truncate">{competition.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero section with image */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative">
                {/* Main image with aspect ratio */}
                <div className="relative pb-[56.25%]">
                  <img 
                    src={competition.image} 
                    alt={competition.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      className={`p-2 rounded-full ${competition.isBookmarked ? 'bg-blue-600' : 'bg-black/40'} text-white transition-colors duration-200`}
                      onClick={() => handleBookmark(competition.id)}
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <button 
                      className={`p-2 rounded-full ${competition.isLiked ? 'bg-rose-600' : 'bg-black/40'} text-white transition-colors duration-200`}
                      onClick={() => handleLike(competition.id)}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      COMPETITION
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-px bg-gray-800">
                <div className="p-4 bg-gray-900 flex flex-col items-center">
                  <div className="text-gray-400 text-xs uppercase mb-1 flex items-center">
                    <Trophy className="h-3 w-3 mr-1" /> Prize
                  </div>
                  <div className="text-xl font-bold text-white">£{competition.prize}</div>
                </div>
                <div className="p-4 bg-gray-900 flex flex-col items-center">
                  <div className="text-gray-400 text-xs uppercase mb-1 flex items-center">
                    <Ticket className="h-3 w-3 mr-1" /> Ticket Price
                  </div>
                  <div className="text-xl font-bold text-white">£{(competition.ticketPrice/100).toFixed(2)}</div>
                </div>
                <div className="p-4 bg-gray-900 flex flex-col items-center">
                  <div className="text-gray-400 text-xs uppercase mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> Closes
                  </div>
                  <div className="text-xl font-bold text-white">
                    {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                      day: 'numeric', 
                      month: 'short'
                    }) : 'Apr 24'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabbed content */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-800">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-5 py-3 font-medium text-sm ${activeTab === 'details' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveTab('steps')}
                  className={`px-5 py-3 font-medium text-sm ${activeTab === 'steps' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  Entry Steps
                </button>
                <button 
                  onClick={() => setActiveTab('winners')}
                  className={`px-5 py-3 font-medium text-sm ${activeTab === 'winners' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  Past Winners
                </button>
              </div>
              
              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">About This Competition</h2>
                      <p className="text-gray-300 text-sm leading-relaxed">{competition.description}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">Additional Details</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">Entries</div>
                          <div className="text-lg font-bold text-white">{competition.entries}</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">Available Tickets</div>
                          <div className="text-lg font-bold text-white">{competition.totalTickets - competition.soldTickets} of {competition.totalTickets}</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">Draw Date</div>
                          <div className="text-lg font-bold text-white">
                            {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric'
                            }) : '24 Apr 2025'}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">Max Tickets Per User</div>
                          <div className="text-lg font-bold text-white">{competition.maxTicketsPerUser}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'steps' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Entry Steps</h2>
                    
                    {competition.entrySteps && competition.entrySteps.length > 0 ? (
                      <div className="space-y-3">
                        {competition.entrySteps.map((step, index) => (
                          <div key={step.id} className="flex items-start bg-gray-800 p-4 rounded-lg">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                              ${competition.entryProgress?.includes(step.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                              {competition.entryProgress?.includes(step.id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div>
                              <div className="text-white text-sm mb-1">{step.description}</div>
                              {step.link && (
                                <a 
                                  href={step.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center"
                                >
                                  Visit Link
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {competition.isEntered && !competition.entryProgress?.length && (
                          <Button
                            onClick={() => handleCompleteEntry(competition.id)}
                            className="mt-4 py-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                          >
                            Complete All Steps
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">No entry steps available for this competition.</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'winners' && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Past Winners</h2>
                    <p className="text-gray-400">No winners have been announced yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Countdown timer */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-blue-600 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-white mr-2" />
                    <h3 className="text-white font-medium">Draw Countdown</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs bg-black/20 text-white font-medium">
                    {isEnded ? 'ENDED' : 'LIVE'}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {isEnded ? (
                  <div className="text-center text-white font-bold py-4">
                    COMPETITION CLOSED
                  </div>
                ) : (
                  <div className="grid grid-cols-4 divide-x divide-gray-800">
                    <div className="text-center px-2">
                      <div className="text-2xl font-bold text-white">5</div>
                      <div className="text-xs text-gray-400 uppercase">days</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-gray-400 uppercase">hrs</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-2xl font-bold text-white">45</div>
                      <div className="text-xs text-gray-400 uppercase">min</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-2xl font-bold text-white">10</div>
                      <div className="text-xs text-gray-400 uppercase">sec</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ticket purchase card */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-blue-600 py-3 px-4">
                <h3 className="text-white font-medium">Get Your Tickets</h3>
              </div>
              
              <div className="p-5">
                {/* User's tickets section */}
                {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Your Tickets</h4>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/20">
                        {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                    
                    {/* User's ticket numbers */}
                    {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Your ticket numbers:</div>
                        <div className="flex flex-wrap gap-2">
                          {competition.ticketNumbers.map(number => (
                            <div key={number} className="px-2 py-1 rounded text-sm bg-gray-800 text-gray-300 border border-gray-700">
                              #{number}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                      disabled={isEnded}
                    >
                      Buy More Tickets
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-5">
                      <h4 className="text-lg font-bold text-white mb-2">£{(competition.ticketPrice/100).toFixed(2)}</h4>
                      <p className="text-gray-400 text-sm">per ticket</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400 mb-1">Available</div>
                        <div className="text-white font-medium">
                          {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400 mb-1">Max per user</div>
                        <div className="text-white font-medium">{competition.maxTicketsPerUser}</div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setIsTicketModalOpen(true)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                      disabled={isEnded}
                    >
                      GET TICKETS
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Organizer info */}
            <div className="bg-gray-900 rounded-lg p-5">
              <h3 className="text-lg font-bold text-white mb-3">About the Organizer</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                  BW
                </div>
                <div>
                  <div className="text-white font-medium flex items-center">
                    Blue Whale
                    <CheckCircle className="h-3 w-3 ml-1 text-blue-500" />
                  </div>
                  <div className="text-sm text-gray-400">Verified Organizer</div>
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
          onConfirm={handlePurchaseTickets}
          isProcessing={isProcessing}
          userTickets={competition.ticketNumbers}
        />
      )}
    </div>
  );
}