import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CompetitionWithEntryStatus } from "@shared/types";
import { 
  Calendar, 
  Trophy, 
  Users, 
  Award, 
  CheckCircle2, 
  Timer, 
  Globe, 
  Loader2,
  ArrowLeft,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";
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

  const handlePurchaseTickets = (ticketCount: number) => {
    if (!competition) return;
    
    const totalAmount = competition.ticketPrice * ticketCount;
    
    initiatePayment({
      amount: totalAmount,
      competitionId: competition.id,
      ticketCount,
      paymentType: 'ticket_purchase',
      metadata: {
        competitionTitle: competition.title
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

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!competition) return '';
    
    const now = new Date();
    const drawDate = competition.drawTime ? new Date(competition.drawTime) : new Date();
    const diffTime = drawDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Competition ended';
    } else if (diffDays === 0) {
      return 'Ends today';
    } else if (diffDays === 1) {
      return 'Ends tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Competition not found</h2>
          <p className="mt-2 text-gray-600">The competition may have been deleted or does not exist.</p>
          <Button 
            onClick={() => setLocation('/competitions')}
            className="mt-4"
          >
            Back to Competitions
          </Button>
        </div>
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
                      competition.type === 'family' ? 'border-amber-400 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                      competition.type === 'appliances' ? 'border-pink-400 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 
                      competition.type === 'cash' ? 'border-green-400 bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
                      'border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 
                    'border-white/30 bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={() => handleBookmark(competition.id)}
                >
                  <i className={competition.isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full backdrop-blur-sm border transition-colors duration-300
                    ${competition.isLiked ? 
                      competition.type === 'family' ? 'border-amber-400 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                      competition.type === 'appliances' ? 'border-pink-400 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 
                      competition.type === 'cash' ? 'border-green-400 bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
                      'border-blue-400 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 
                    'border-white/30 bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={() => handleLike(competition.id)}
                >
                  <i className={competition.isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                </Button>
              </div>

              {/* Title and organizer */}
              <div className="mt-auto space-y-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2
                  ${competition.type === 'family' ? 'bg-amber-500/80 text-white' : 
                   competition.type === 'appliances' ? 'bg-pink-500/80 text-white' : 
                   competition.type === 'cash' ? 'bg-green-500/80 text-white' : 
                   'bg-blue-500/80 text-white'}`}>
                  {competition.type.charAt(0).toUpperCase() + competition.type.slice(1)}
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-md">{competition.title}</h1>
                <p className="text-white/80 text-lg flex items-center">
                  <span className="mr-1 opacity-75">by</span> 
                  <span className="font-medium">{competition.organizer}</span>
                  {competition.isVerified && (
                    <CheckCircle2 className="h-4 w-4 ml-2 text-blue-400" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Top statistics with glass-morphism cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-16 mb-12 relative z-20">
              <div className="flex flex-col items-center p-6 rounded-xl backdrop-blur-md border border-gray-700/50 bg-gray-800/50 shadow-lg shadow-black/20 transform hover:translate-y-[-4px] hover:bg-gray-800/70 transition-all duration-300">
                <Trophy className={`h-7 w-7 mb-3
                  ${competition.type === 'family' ? 'text-amber-500' : 
                   competition.type === 'appliances' ? 'text-pink-500' : 
                   competition.type === 'cash' ? 'text-green-500' : 
                   'text-blue-500'}`} />
                <span className="text-sm text-gray-400 font-medium">Prize</span>
                <span className="text-xl md:text-2xl font-bold mt-1 text-white">£{competition.prize.toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col items-center p-6 rounded-xl backdrop-blur-md border border-gray-700/50 bg-gray-800/50 shadow-lg shadow-black/20 transform hover:translate-y-[-4px] hover:bg-gray-800/70 transition-all duration-300">
                <Users className={`h-7 w-7 mb-3
                  ${competition.type === 'family' ? 'text-amber-500' : 
                   competition.type === 'appliances' ? 'text-pink-500' : 
                   competition.type === 'cash' ? 'text-green-500' : 
                   'text-blue-500'}`} />
                <span className="text-sm text-gray-400 font-medium">Entries</span>
                <span className="text-xl md:text-2xl font-bold mt-1 text-white">{competition.entries}</span>
              </div>
              
              <div className="flex flex-col items-center p-6 rounded-xl backdrop-blur-md border border-gray-700/50 bg-gray-800/50 shadow-lg shadow-black/20 transform hover:translate-y-[-4px] hover:bg-gray-800/70 transition-all duration-300">
                <Timer className={`h-7 w-7 mb-3
                  ${competition.type === 'family' ? 'text-amber-500' : 
                   competition.type === 'appliances' ? 'text-pink-500' : 
                   competition.type === 'cash' ? 'text-green-500' : 
                   'text-blue-500'}`} />
                <span className="text-sm text-gray-400 font-medium">Ends In</span>
                <span className="text-xl md:text-2xl font-bold mt-1 text-white">{getDaysRemaining()}</span>
              </div>
              
              <div className="flex flex-col items-center p-6 rounded-xl backdrop-blur-md border border-gray-700/50 bg-gray-800/50 shadow-lg shadow-black/20 transform hover:translate-y-[-4px] hover:bg-gray-800/70 transition-all duration-300">
                <Globe className={`h-7 w-7 mb-3
                  ${competition.type === 'family' ? 'text-amber-500' : 
                   competition.type === 'appliances' ? 'text-pink-500' : 
                   competition.type === 'cash' ? 'text-green-500' : 
                   'text-blue-500'}`} />
                <span className="text-sm text-gray-400 font-medium">Eligibility</span>
                <span className="text-xl md:text-2xl font-bold mt-1 text-white">{competition.eligibility}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Description with improved typography */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 inline-block text-white">
                    About This Competition
                    <div className={`h-1 w-20 mt-1 rounded-full
                      ${competition.type === 'family' ? 'bg-amber-500' : 
                       competition.type === 'appliances' ? 'bg-pink-500' : 
                       competition.type === 'cash' ? 'bg-green-500' : 
                       'bg-blue-500'}`}></div>
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-300">
                    <p>{competition.description}</p>
                  </div>
                </div>

                {/* Competition details with improved layout */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-white">Competition Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-gray-400">Draw Date</div>
                      <div className="font-medium text-gray-200">
                        {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        }) : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Ticket Price</div>
                      <div className="font-medium text-gray-200">
                        £{(competition.ticketPrice/100).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Max Tickets Per User</div>
                      <div className="font-medium text-gray-200">{competition.maxTicketsPerUser}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Available Tickets</div>
                      <div className="font-medium text-gray-200">
                        {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Countdown timer with modern design */}
                {competition.drawTime && (
                  <div className={`rounded-2xl backdrop-blur-sm border overflow-hidden shadow-xl bg-gray-800/50 border-gray-700/50`}>
                    <div className={`py-4 px-6 border-b flex items-center justify-between
                      ${competition.type === 'family' ? 'bg-amber-500/80 border-amber-400/50' : 
                       competition.type === 'appliances' ? 'bg-pink-500/80 border-pink-400/50' : 
                       competition.type === 'cash' ? 'bg-green-500/80 border-green-400/50' : 
                       'bg-blue-500/80 border-blue-400/50'}`}>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-white mr-2 animate-pulse" />
                        <h3 className="text-lg font-bold text-white">PRIZE DRAW COUNTDOWN</h3>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                        {isEnded ? 'ENDED' : 'LIVE'}
                      </div>
                    </div>
                    <div className="p-6">
                      <CountdownTimer 
                        targetDate={competition.drawTime} 
                        showIcon={false}
                        categoryTheme={
                          competition.type === 'family' ? 'family' :
                          competition.type === 'appliances' ? 'appliances' :
                          competition.type === 'cash' ? 'cash' : 
                          undefined
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Ticket Purchase Box with enhanced design */}
                <div className="rounded-2xl overflow-hidden shadow-xl border backdrop-blur-sm bg-gray-800/50 border-gray-700/50">
                  <div className={`py-4 px-6 border-b
                    ${competition.type === 'family' ? 'bg-amber-500 border-amber-400' : 
                     competition.type === 'appliances' ? 'bg-pink-500 border-pink-400' : 
                     competition.type === 'cash' ? 'bg-green-500 border-green-400' : 
                     'bg-blue-500 border-blue-400'}`}>
                    <h3 className="text-lg font-bold text-white">GET YOUR TICKETS</h3>
                  </div>
                  
                  {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          Your Tickets
                        </h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-white`}>
                          {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </div>
                      </div>
                      
                      {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                        <div className="mb-6">
                          <div className="text-sm text-gray-400 mb-2">Your ticket numbers:</div>
                          <div className="flex flex-wrap gap-2">
                            {competition.ticketNumbers.map(number => (
                              <span key={number} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 border border-gray-600 text-white">
                                #{number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Buy more tickets button */}
                      <div className="mt-4 text-center">
                        <Button
                          onClick={() => setIsTicketModalOpen(true)}
                          className={`w-full relative overflow-hidden group
                            ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
                             competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 
                             competition.type === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                             'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                          disabled={isEnded}
                        >
                          <span className="relative z-10">Buy More Tickets</span>
                          <span className="absolute inset-0 w-full h-full bg-white/20 animate-shimmer"></span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Get Your Chance to Win
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Purchase tickets for your chance to win this amazing prize!
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-400">Ticket Price</div>
                          <div className="text-xl font-bold text-white">£{(competition.ticketPrice/100).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Available</div>
                          <div className="text-xl font-bold text-white">
                            {competition.totalTickets - competition.soldTickets} / {competition.totalTickets}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setIsTicketModalOpen(true)}
                        className={`w-full relative overflow-hidden mt-4 rounded-lg group
                          ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
                           competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 
                           competition.type === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                           'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                        disabled={isEnded}
                      >
                        <span className="relative z-10">GET TICKETS</span>
                        <span className="absolute inset-0 w-full h-full bg-white/20 animate-shimmer"></span>
                      </Button>
                      
                      <div className="mt-2 text-xs text-center text-gray-400">
                        {isEnded ? 'This competition has ended' : `Max ${competition.maxTicketsPerUser} tickets per person`}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Entry steps */}
                {(competition.isEntered && competition.entrySteps && competition.entrySteps.length > 0) && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-white">Entry Steps</h3>
                    <div className="space-y-4">
                      {competition.entrySteps.map((step, index) => (
                        <div key={step.id} className="flex items-start">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                            ${competition.entryProgress?.includes(step.id) ? 
                              competition.type === 'family' ? 'bg-amber-500 text-white' : 
                              competition.type === 'appliances' ? 'bg-pink-500 text-white' : 
                              competition.type === 'cash' ? 'bg-green-500 text-white' : 
                              'bg-blue-500 text-white' : 
                              'bg-gray-700 text-gray-300'}`}>
                            {competition.entryProgress?.includes(step.id) ? (
                              <i className="fas fa-check"></i>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <div className="text-gray-200">{step.description}</div>
                            {step.link && (
                              <a 
                                href={step.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`text-sm
                                  ${competition.type === 'family' ? 'text-amber-400' : 
                                   competition.type === 'appliances' ? 'text-pink-400' : 
                                   competition.type === 'cash' ? 'text-green-400' : 
                                   'text-blue-400'}`}
                              >
                                Visit Link
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {competition.isEntered && !competition.entryProgress?.length && (
                      <Button
                        onClick={() => handleCompleteEntry(competition.id)}
                        className={`mt-4 w-full
                          ${competition.type === 'family' ? 'bg-amber-500 hover:bg-amber-600' : 
                           competition.type === 'appliances' ? 'bg-pink-500 hover:bg-pink-600' : 
                           competition.type === 'cash' ? 'bg-green-500 hover:bg-green-600' : 
                           'bg-blue-500 hover:bg-blue-600'}`}
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
      </div>

      {isTicketModalOpen && (
        <TicketPurchaseModal
          isOpen={isTicketModalOpen}
          competition={competition}
          onClose={() => setIsTicketModalOpen(false)}
          onPurchase={handlePurchaseTickets}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}