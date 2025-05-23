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
  ChevronLeft,
  Sparkles
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
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [competitionId]);

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
      <div className="flex justify-center items-center h-screen bg-[#0a101f]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#0a101f] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Competition not found</h2>
        <p className="text-gray-400 mb-6">This competition may have been removed or doesn't exist.</p>
        <button 
          onClick={() => setLocation('/competitions')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Back to Competitions
        </button>
      </div>
    );
  }

  const isEnded = competition.drawTime ? new Date(competition.drawTime) < new Date() : false;

  return (
    <div className="min-h-screen bg-[#0a101f]">
      {/* Top navigation bar */}
      <div className="bg-[#111827] border-b border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => setLocation('/competitions')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Competitions</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Redesigned Hero section */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Left side - Main image */}
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] rounded-xl overflow-hidden shadow-lg border border-[#1e293b] h-full">
                  <div className="relative">
                    {/* Main image */}
                    <div className="relative border-2 border-[#1e3a8a]/30 rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={competition.image} 
                        alt={competition.title} 
                        className="w-full h-full object-cover aspect-square"
                      />
                      
                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button 
                          className={`p-2 rounded-full ${competition.isBookmarked ? 'bg-blue-600' : 'bg-black/40 backdrop-blur-sm'} text-white transition-colors duration-200 hover:shadow-lg`}
                          onClick={() => handleBookmark(competition.id)}
                        >
                          <Bookmark className="h-5 w-5" />
                        </button>
                        <button 
                          className={`p-2 rounded-full ${competition.isLiked ? 'bg-rose-600' : 'bg-black/40 backdrop-blur-sm'} text-white transition-colors duration-200 hover:shadow-lg`}
                          onClick={() => handleLike(competition.id)}
                        >
                          <Heart className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {/* Category badge */}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full shadow-md">
                          WIN NOW
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Competition details */}
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] rounded-xl overflow-hidden shadow-lg border border-[#1e293b] h-full p-6">
                  {/* Title and organizer - Much more prominent */}
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{competition.title}</h1>
                  
                  <div className="flex items-center mb-6">
                    <p className="text-gray-400 text-sm">
                      by <span className="text-white">Blue Whale</span>
                    </p>
                    <CheckCircle className="h-4 w-4 ml-1 text-blue-400" />
                  </div>
                  
                  {/* Ticket Price - Very prominent */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 px-4 py-2 rounded-lg">
                        <span className="text-2xl font-bold text-white">£{(competition.ticketPrice/100).toFixed(2)}</span>
                      </div>
                      <span className="text-gray-400">per ticket</span>
                    </div>
                  </div>
                  
                  {/* Progress bar for tickets */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-blue-300 text-sm">{competition.totalTickets - competition.soldTickets} tickets remaining</span>
                      <span className="text-gray-400 text-sm">{competition.soldTickets} sold</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${(competition.soldTickets / competition.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-400 text-xs">0</span>
                      <span className="text-gray-400 text-xs">{competition.totalTickets}</span>
                    </div>
                  </div>
                  
                  {/* Key details in a cleaner layout */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#1a2747]/50 rounded-lg p-3 text-center">
                      <div className="text-blue-300 text-xs uppercase mb-1 font-medium">Draw Date</div>
                      <div className="font-bold text-white">
                        {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                          day: 'numeric', 
                          month: 'short'
                        }) : 'Apr 24'}
                      </div>
                    </div>
                    <div className="bg-[#1a2747]/50 rounded-lg p-3 text-center">
                      <div className="text-blue-300 text-xs uppercase mb-1 font-medium">Prize Value</div>
                      <div className="font-bold text-white">£{competition.prize}</div>
                    </div>
                    <div className="bg-[#1a2747]/50 rounded-lg p-3 text-center">
                      <div className="text-blue-300 text-xs uppercase mb-1 font-medium">Max Per Person</div>
                      <div className="font-bold text-white">{competition.maxTicketsPerUser}</div>
                    </div>
                  </div>
                  
                  {/* Secure payment methods */}
                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-6 bg-[#1a2747] rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                          <rect width="18" height="12" x="3" y="6" rx="2"/>
                          <line x1="3" x2="21" y1="10" y2="10"/>
                        </svg>
                      </div>
                      <div className="w-8 h-6 bg-[#1a2747] rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                          <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/>
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm text-blue-300/80 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 mr-1">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      </svg>
                      Secure payment via Stripe
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Competition details */}
            <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] rounded-xl overflow-hidden shadow-lg border border-[#1e293b]">
              <div className="p-6">
                <div className="space-y-6">
                  {/* About section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Sparkles className="h-5 w-5 text-blue-400 mr-2" />
                      <h2 className="text-xl font-bold text-white">About This Competition</h2>
                    </div>
                    <p className="text-gray-300 text-base leading-relaxed">{competition.description}</p>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center mb-4">
                      <div className="h-5 w-1 bg-blue-500 rounded-full mr-3"></div>
                      <h2 className="text-xl font-bold text-white">Competition Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#1e293b]/50 rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-colors group">
                        <div className="text-sm text-blue-300 mb-1 group-hover:text-blue-200 transition-colors">Total Entries</div>
                        <div className="text-lg font-bold text-white">{competition.entries}</div>
                      </div>
                      <div className="p-4 bg-[#1e293b]/50 rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-colors group">
                        <div className="text-sm text-blue-300 mb-1 group-hover:text-blue-200 transition-colors">Available Tickets</div>
                        <div className="text-lg font-bold text-white">{competition.totalTickets - competition.soldTickets} of {competition.totalTickets}</div>
                      </div>
                      <div className="p-4 bg-[#1e293b]/50 rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-colors group">
                        <div className="text-sm text-blue-300 mb-1 group-hover:text-blue-200 transition-colors">Draw Date</div>
                        <div className="text-lg font-bold text-white">
                          {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric'
                          }) : '24 Apr 2025'}
                        </div>
                      </div>
                      <div className="p-4 bg-[#1e293b]/50 rounded-xl border border-[#1e293b] hover:border-blue-500/30 transition-colors group">
                        <div className="text-sm text-blue-300 mb-1 group-hover:text-blue-200 transition-colors">Max Tickets Per User</div>
                        <div className="text-lg font-bold text-white">{competition.maxTicketsPerUser}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Secure Payment Information */}
                  <div className="pt-4">
                    <div className="flex items-center mb-4">
                      <div className="h-5 w-1 bg-green-500 rounded-full mr-3"></div>
                      <h2 className="text-xl font-bold text-white">Secure Payments</h2>
                    </div>
                    
                    <div className="bg-[#1e293b]/30 p-5 rounded-xl border border-[#1e293b] hover:border-green-500/30 transition-colors mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-green-500/10 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                              <rect width="20" height="14" x="2" y="5" rx="2"/>
                              <line x1="2" x2="22" y1="10" y2="10"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Powered by Stripe</h3>
                            <p className="text-gray-400 text-sm">Industry-leading payment processing</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/stripe.svg" alt="Stripe" className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="bg-[#1e293b] px-4 py-2 rounded-lg flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <rect width="20" height="14" x="2" y="5" rx="2"/>
                            <line x1="2" x2="22" y1="10" y2="10"/>
                          </svg>
                          <span className="text-sm text-white">Credit Card</span>
                        </div>
                        <div className="bg-[#1e293b] px-4 py-2 rounded-lg flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/>
                            <path d="M12 19v2"/>
                            <path d="M12 3V1"/>
                            <path d="m4.9 4.9 1.4 1.4"/>
                            <path d="m17.7 17.7 1.4 1.4"/>
                            <path d="M3 12h2"/>
                            <path d="M19 12h2"/>
                            <path d="m4.9 19.1 1.4-1.4"/>
                            <path d="m17.7 6.3 1.4-1.4"/>
                          </svg>
                          <span className="text-sm text-white">Apple Pay</span>
                        </div>
                        <div className="bg-[#1e293b] px-4 py-2 rounded-lg flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                          </svg>
                          <span className="text-sm text-white">Secure SSL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display entry steps if user has entered */}
                  {(competition.isEntered && competition.entrySteps && competition.entrySteps.length > 0) && (
                    <div className="pt-2">
                      <div className="flex items-center mb-4">
                        <div className="h-5 w-1 bg-blue-500 rounded-full mr-3"></div>
                        <h2 className="text-xl font-bold text-white">Entry Steps</h2>
                      </div>
                      
                      <div className="space-y-3">
                        {competition.entrySteps.map((step, index) => (
                          <div key={step.id} className="flex items-start bg-[#1e293b]/50 p-4 rounded-xl border border-[#1e293b]">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                              ${competition.entryProgress?.includes(step.id) ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-300'}`}>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Enhanced Prize Draw Timer */}
            <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] rounded-xl overflow-hidden shadow-xl border border-[#1e293b] relative">
              {/* Header with orange accent for countdown */}
              <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-white mr-2" />
                    <h3 className="text-white font-bold tracking-wide">TIME REMAINING</h3>
                  </div>
                  <div className="px-3 py-0.5 rounded-full text-xs bg-orange-700/70 text-white font-medium uppercase border border-white/20">
                    {isEnded ? 'Ended' : 'LIVE'}
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {isEnded ? (
                  <div className="text-center text-white font-bold py-4 text-xl tracking-wider">
                    COMPETITION CLOSED
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-orange-500/20 shadow-lg">
                        <div className="text-3xl font-bold text-white">5</div>
                        <div className="text-xs text-orange-300 uppercase font-medium mt-1">days</div>
                      </div>
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-orange-500/20 shadow-lg">
                        <div className="text-3xl font-bold text-white">12</div>
                        <div className="text-xs text-orange-300 uppercase font-medium mt-1">hrs</div>
                      </div>
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-orange-500/20 shadow-lg">
                        <div className="text-3xl font-bold text-white">45</div>
                        <div className="text-xs text-orange-300 uppercase font-medium mt-1">min</div>
                      </div>
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-orange-500/20 shadow-lg">
                        <div className="text-3xl font-bold text-white">10</div>
                        <div className="text-xs text-orange-300 uppercase font-medium mt-1">sec</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center text-sm">
                      <p className="text-blue-200">Drawing on {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                      }) : 'April 24, 2025'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Ticket purchase card */}
            <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] rounded-xl overflow-hidden shadow-xl border border-[#1e293b] relative">
              {/* Clean header with blue accent */}
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 py-3 px-4">
                <h3 className="text-white font-bold tracking-wide flex items-center">
                  <Ticket className="h-4 w-4 mr-2" />
                  GET YOUR TICKETS
                </h3>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-[#111827]/90 to-[#0c1424]/90 backdrop-blur-sm">
                {/* User's tickets section */}
                {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-white font-medium text-lg">Your Tickets</h4>
                      <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600/30 text-blue-200 border border-blue-500/30">
                        {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                    
                    {/* User's ticket numbers */}
                    {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                      <div className="mb-5">
                        <div className="text-sm text-blue-300 mb-3 font-medium">Your ticket numbers:</div>
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1 pb-1">
                          {competition.ticketNumbers.map(number => (
                            <div key={number} className="px-3 py-2 rounded-lg text-sm bg-gradient-to-b from-[#1a2747] to-[#141e34] text-blue-200 border border-blue-500/20 shadow-md">
                              #{number}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md relative overflow-hidden group"
                      disabled={isEnded}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
                      Buy More Tickets
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <div className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 px-5 py-2 rounded-full text-white font-bold text-xl mb-1">
                        £{(competition.ticketPrice/100).toFixed(2)}
                      </div>
                      <p className="text-blue-300 text-sm">per ticket</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-blue-500/20 shadow-lg">
                        <div className="text-sm text-blue-300 mb-1 font-medium">Available</div>
                        <div className="text-xl font-bold text-white">
                          {competition.totalTickets - competition.soldTickets} <span className="text-blue-300 text-sm font-normal">/ {competition.totalTickets}</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-b from-[#1a2747] to-[#141e34] rounded-lg p-3 text-center border border-blue-500/20 shadow-lg">
                        <div className="text-sm text-blue-300 mb-1 font-medium">Max per user</div>
                        <div className="text-xl font-bold text-white">{competition.maxTicketsPerUser}</div>
                      </div>
                    </div>
                    
                    {/* Secure payment methods */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-7 h-5 bg-[#1a2747] rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                            <rect width="18" height="12" x="3" y="6" rx="2"/>
                            <line x1="3" x2="21" y1="10" y2="10"/>
                          </svg>
                        </div>
                        <div className="w-7 h-5 bg-[#1a2747] rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                            <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/>
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="text-xs text-blue-300/80 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 mr-1">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                        </svg>
                        Secure payment via Stripe
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setIsTicketModalOpen(true)}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-lg shadow-lg relative overflow-hidden group"
                      disabled={isEnded}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700"></span>
                      GET TICKETS NOW
                    </Button>
                    
                    <div className="mt-3 text-center text-sm text-blue-300/80">
                      {isEnded ? 'This competition has ended' : `Max ${competition.maxTicketsPerUser} tickets per person`}
                    </div>
                  </div>
                )}
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

      {/* Animations are handled in CSS already */}
    </div>
  );
}