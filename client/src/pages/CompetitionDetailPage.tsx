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
    <div className="container mx-auto py-8 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 z-0"></div>
      
      {/* Back button with category-specific styling */}
      <Button
        variant="ghost"
        className={`mb-6 relative z-10 group transition-all duration-300 font-medium
          ${competition.category === 'family' ? 'text-amber-600 hover:text-amber-800' : 
           competition.category === 'appliances' ? 'text-pink-600 hover:text-pink-800' : 
           competition.category === 'cash' ? 'text-green-600 hover:text-green-800' : 
           'text-blue-600 hover:text-blue-800'}`}
        onClick={() => setLocation('/competitions')}
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="relative">
          Back to Competitions
          <span className={`absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left
            ${competition.category === 'family' ? 'bg-amber-500' : 
             competition.category === 'appliances' ? 'bg-pink-500' : 
             competition.category === 'cash' ? 'bg-green-500' : 
             'bg-blue-500'}`}></span>
        </span>
      </Button>

      <div className="bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative z-10">
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
                    competition.category === 'family' ? 'border-amber-400 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                    competition.category === 'appliances' ? 'border-pink-400 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 
                    competition.category === 'cash' ? 'border-green-400 bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
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
                    competition.category === 'family' ? 'border-amber-400 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                    competition.category === 'appliances' ? 'border-pink-400 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 
                    competition.category === 'cash' ? 'border-green-400 bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
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
                ${competition.category === 'family' ? 'bg-amber-500/80 text-white' : 
                 competition.category === 'appliances' ? 'bg-pink-500/80 text-white' : 
                 competition.category === 'cash' ? 'bg-green-500/80 text-white' : 
                 'bg-blue-500/80 text-white'}`}>
                {competition.category}
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
            <div className={`flex flex-col items-center p-6 rounded-xl backdrop-blur-md border shadow-lg transform hover:translate-y-[-4px] transition-all duration-300
              ${competition.category === 'family' ? 'bg-amber-50/90 border-amber-200 shadow-amber-100/20' : 
               competition.category === 'appliances' ? 'bg-pink-50/90 border-pink-200 shadow-pink-100/20' : 
               competition.category === 'cash' ? 'bg-green-50/90 border-green-200 shadow-green-100/20' : 
               'bg-blue-50/90 border-blue-200 shadow-blue-100/20'}`}>
              <Trophy className={`h-7 w-7 mb-3
                ${competition.category === 'family' ? 'text-amber-500' : 
                 competition.category === 'appliances' ? 'text-pink-500' : 
                 competition.category === 'cash' ? 'text-green-500' : 
                 'text-blue-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Prize</span>
              <span className={`text-xl md:text-2xl font-bold mt-1
                ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                 competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                 competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                 'text-blue-700 dark:text-blue-400'}`}>£{competition.prize.toLocaleString()}</span>
            </div>
            
            <div className={`flex flex-col items-center p-6 rounded-xl backdrop-blur-md border shadow-lg transform hover:translate-y-[-4px] transition-all duration-300
              ${competition.category === 'family' ? 'bg-amber-50/90 border-amber-200 shadow-amber-100/20' : 
               competition.category === 'appliances' ? 'bg-pink-50/90 border-pink-200 shadow-pink-100/20' : 
               competition.category === 'cash' ? 'bg-green-50/90 border-green-200 shadow-green-100/20' : 
               'bg-blue-50/90 border-blue-200 shadow-blue-100/20'}`}>
              <Users className={`h-7 w-7 mb-3
                ${competition.category === 'family' ? 'text-amber-500' : 
                 competition.category === 'appliances' ? 'text-pink-500' : 
                 competition.category === 'cash' ? 'text-green-500' : 
                 'text-blue-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Entries</span>
              <span className={`text-xl md:text-2xl font-bold mt-1
                ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                 competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                 competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                 'text-blue-700 dark:text-blue-400'}`}>{competition.entries}</span>
            </div>
            
            <div className={`flex flex-col items-center p-6 rounded-xl backdrop-blur-md border shadow-lg transform hover:translate-y-[-4px] transition-all duration-300
              ${competition.category === 'family' ? 'bg-amber-50/90 border-amber-200 shadow-amber-100/20' : 
               competition.category === 'appliances' ? 'bg-pink-50/90 border-pink-200 shadow-pink-100/20' : 
               competition.category === 'cash' ? 'bg-green-50/90 border-green-200 shadow-green-100/20' : 
               'bg-blue-50/90 border-blue-200 shadow-blue-100/20'}`}>
              <Timer className={`h-7 w-7 mb-3
                ${competition.category === 'family' ? 'text-amber-500' : 
                 competition.category === 'appliances' ? 'text-pink-500' : 
                 competition.category === 'cash' ? 'text-green-500' : 
                 'text-blue-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ends In</span>
              <span className={`text-xl md:text-2xl font-bold mt-1
                ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                 competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                 competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                 'text-blue-700 dark:text-blue-400'}`}>{getDaysRemaining()}</span>
            </div>
            
            <div className={`flex flex-col items-center p-6 rounded-xl backdrop-blur-md border shadow-lg transform hover:translate-y-[-4px] transition-all duration-300
              ${competition.category === 'family' ? 'bg-amber-50/90 border-amber-200 shadow-amber-100/20' : 
               competition.category === 'appliances' ? 'bg-pink-50/90 border-pink-200 shadow-pink-100/20' : 
               competition.category === 'cash' ? 'bg-green-50/90 border-green-200 shadow-green-100/20' : 
               'bg-blue-50/90 border-blue-200 shadow-blue-100/20'}`}>
              <Globe className={`h-7 w-7 mb-3
                ${competition.category === 'family' ? 'text-amber-500' : 
                 competition.category === 'appliances' ? 'text-pink-500' : 
                 competition.category === 'cash' ? 'text-green-500' : 
                 'text-blue-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Eligibility</span>
              <span className={`text-xl md:text-2xl font-bold mt-1
                ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                 competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                 competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                 'text-blue-700 dark:text-blue-400'}`}>{competition.eligibility}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description with improved typography */}
              <div>
                <h2 className={`text-2xl font-bold mb-4 inline-block
                  ${competition.category === 'family' ? 'text-amber-800 dark:text-amber-400' : 
                   competition.category === 'appliances' ? 'text-pink-800 dark:text-pink-400' : 
                   competition.category === 'cash' ? 'text-green-800 dark:text-green-400' : 
                   'text-blue-800 dark:text-blue-400'}`}>
                  About This Competition
                  <div className={`h-1 w-20 mt-1 rounded-full
                    ${competition.category === 'family' ? 'bg-amber-500' : 
                     competition.category === 'appliances' ? 'bg-pink-500' : 
                     competition.category === 'cash' ? 'bg-green-500' : 
                     'bg-blue-500'}`}></div>
                </h2>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p>{competition.description}</p>
                </div>
              </div>

              {/* Competition details with improved layout */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Competition Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Platform</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{competition.platform}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">{competition.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Draw Date</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString('en-GB', {
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      }) : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ticket Price</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      £{(competition.ticketPrice/100).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Max Tickets Per User</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{competition.maxTicketsPerUser}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Available Tickets</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {competition.totalTickets - competition.soldTickets} of {competition.totalTickets}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Countdown timer with modern design */}
              {competition.drawTime && (
                <div className={`rounded-2xl backdrop-blur-sm border-2 overflow-hidden shadow-xl
                  ${competition.category === 'family' ? 'bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border-amber-400/50' : 
                   competition.category === 'appliances' ? 'bg-gradient-to-br from-pink-500/10 to-rose-600/10 border-pink-400/50' : 
                   competition.category === 'cash' ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-400/50' : 
                   'bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-400/50'}`}>
                  <div className={`py-4 px-6 border-b-2 flex items-center justify-between
                    ${competition.category === 'family' ? 'bg-amber-500/80 border-amber-400/50' : 
                     competition.category === 'appliances' ? 'bg-pink-500/80 border-pink-400/50' : 
                     competition.category === 'cash' ? 'bg-green-500/80 border-green-400/50' : 
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
                        competition.category === 'family' ? 'family' :
                        competition.category === 'appliances' ? 'appliances' :
                        competition.category === 'cash' ? 'cash' : 
                        undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* Ticket Purchase Box with enhanced design */}
              <div className={`rounded-2xl overflow-hidden shadow-xl border-2 backdrop-blur-sm
                ${competition.category === 'family' ? 'bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-400/30' : 
                 competition.category === 'appliances' ? 'bg-gradient-to-br from-pink-500/5 to-rose-600/5 border-pink-400/30' : 
                 competition.category === 'cash' ? 'bg-gradient-to-br from-green-500/5 to-emerald-600/5 border-green-400/30' : 
                 'bg-gradient-to-br from-blue-500/5 to-indigo-600/5 border-blue-400/30'}`}>
                <div className={`py-4 px-6 border-b-2
                  ${competition.category === 'family' ? 'bg-amber-500 border-amber-400' : 
                   competition.category === 'appliances' ? 'bg-pink-500 border-pink-400' : 
                   competition.category === 'cash' ? 'bg-green-500 border-green-400' : 
                   'bg-blue-500 border-blue-400'}`}>
                  <h3 className="text-lg font-bold text-white">GET YOUR TICKETS</h3>
                </div>
                
                {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-semibold
                        ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                         competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                         competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                         'text-blue-700 dark:text-blue-400'}`}>
                        Your Tickets
                      </h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold
                        ${competition.category === 'family' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 
                         competition.category === 'appliances' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' : 
                         competition.category === 'cash' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                         'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                        {competition.ticketCount} {competition.ticketCount === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                    
                    {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                      <div className="mb-6">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your ticket numbers:</div>
                        <div className="flex flex-wrap gap-2">
                          {competition.ticketNumbers.map(number => (
                            <span key={number} className={`px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border
                              ${competition.category === 'family' ? 'border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300' : 
                               competition.category === 'appliances' ? 'border-pink-300 text-pink-800 dark:border-pink-800 dark:text-pink-300' : 
                               competition.category === 'cash' ? 'border-green-300 text-green-800 dark:border-green-800 dark:text-green-300' : 
                               'border-blue-300 text-blue-800 dark:border-blue-800 dark:text-blue-300'}`}>
                              #{number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Button
                        onClick={() => setIsTicketModalOpen(true)}
                        className={`w-full text-white font-bold py-3 rounded-r-none rounded-l-xl relative overflow-hidden group
                          ${competition.category === 'family' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
                           competition.category === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 
                           competition.category === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                           'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <i className="fas fa-ticket-alt mr-2"></i>
                          Buy More Tickets
                        </span>
                        <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className={`mb-6 text-gray-700 dark:text-gray-300`}>
                      Enter this prize draw by purchasing tickets. The more tickets you buy, the higher your chances of winning!
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Price per ticket</div>
                        <div className={`text-xl font-bold
                          ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                           competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                           competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                           'text-blue-700 dark:text-blue-400'}`}>
                          £{(competition.ticketPrice ? competition.ticketPrice/100 : 9.99).toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
                        <div className={`text-xl font-bold
                          ${competition.category === 'family' ? 'text-amber-700 dark:text-amber-400' : 
                           competition.category === 'appliances' ? 'text-pink-700 dark:text-pink-400' : 
                           competition.category === 'cash' ? 'text-green-700 dark:text-green-400' : 
                           'text-blue-700 dark:text-blue-400'}`}>
                          {competition.totalTickets - competition.soldTickets} tickets
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleEnterCompetition}
                      disabled={isEnded || isProcessing}
                      className={`w-full text-white font-bold py-3 rounded-r-none rounded-l-xl relative overflow-hidden group
                        ${competition.category === 'family' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 
                         competition.category === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 
                         competition.category === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                         'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-ticket-alt mr-2"></i>
                            GET TICKETS
                          </>
                        )}
                      </span>
                      
                      {/* Shimmering effect */}
                      <span className="absolute inset-0 w-full overflow-hidden">
                        <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full animate-shimmer"></span>
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      {competition && (
        <TicketPurchaseModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          onPurchase={handlePurchaseTickets}
          competition={competition}
          isProcessing={isProcessing}
        />
      )}
      
      {/* Add this to your global CSS for the shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}