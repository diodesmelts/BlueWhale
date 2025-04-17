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
    <div className="container mx-auto py-8 px-4">
      {/* Back button with category-specific styling */}
      <Button
        variant="ghost"
        className={`mb-4
          ${competition.type === 'family' ? 'text-amber-600' : 
           competition.type === 'appliances' ? 'text-pink-600' : 
           competition.type === 'cash' ? 'text-green-600' : 
           'text-gray-600'}`}
        onClick={() => setLocation('/competitions')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Competitions
      </Button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Hero image */}
        <div className="relative overflow-hidden" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="aspect-square">
            <img 
              src={competition.image} 
              alt={competition.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-3xl font-bold">{competition.title}</h1>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full bg-white/20 hover:bg-white/30 ${
                    competition.isBookmarked ? 
                      competition.type === 'family' ? 'text-amber-400' : 
                      competition.type === 'appliances' ? 'text-pink-400' : 
                      competition.type === 'cash' ? 'text-green-400' : 
                      'text-yellow-400' : 
                    'text-white'}`}
                  onClick={() => handleBookmark(competition.id)}
                >
                  <i className={competition.isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full bg-white/20 hover:bg-white/30 ${
                    competition.isLiked ? 
                      competition.type === 'family' ? 'text-amber-500' : 
                      competition.type === 'appliances' ? 'text-pink-500' : 
                      competition.type === 'cash' ? 'text-green-500' : 
                      'text-rose-500' : 
                    'text-white'}`}
                  onClick={() => handleLike(competition.id)}
                >
                  <i className={competition.isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                </Button>
              </div>
            </div>
            <p className="text-white/80 mt-2">Organized by {competition.organizer}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Competition stats with category-specific colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <div className={`flex flex-col items-center p-4 rounded-lg
              ${competition.type === 'family' ? 'bg-amber-50' : 
               competition.type === 'appliances' ? 'bg-pink-50' : 
               competition.type === 'cash' ? 'bg-green-50' : 
               'bg-blue-50'}`}>
              <Trophy className={`h-6 w-6 mb-2
                ${competition.type === 'family' ? 'text-amber-500' : 
                 competition.type === 'appliances' ? 'text-pink-500' : 
                 competition.type === 'cash' ? 'text-green-500' : 
                 'text-blue-500'}`} />
              <span className="text-sm text-gray-500">Prize</span>
              <span className={`text-lg font-bold
                ${competition.type === 'family' ? 'text-amber-700' : 
                 competition.type === 'appliances' ? 'text-pink-700' : 
                 competition.type === 'cash' ? 'text-green-700' : 
                 'text-blue-700'}`}>£{competition.prize.toLocaleString()}</span>
            </div>
            
            <div className={`flex flex-col items-center p-4 rounded-lg
              ${competition.type === 'family' ? 'bg-orange-50' : 
               competition.type === 'appliances' ? 'bg-rose-50' : 
               competition.type === 'cash' ? 'text-emerald-50 bg-lime-50' : 
               'bg-green-50'}`}>
              <Users className={`h-6 w-6 mb-2
                ${competition.type === 'family' ? 'text-orange-500' : 
                 competition.type === 'appliances' ? 'text-rose-500' : 
                 competition.type === 'cash' ? 'text-lime-500' : 
                 'text-green-500'}`} />
              <span className="text-sm text-gray-500">Entries</span>
              <span className={`text-lg font-bold
                ${competition.type === 'family' ? 'text-orange-700' : 
                 competition.type === 'appliances' ? 'text-rose-700' : 
                 competition.type === 'cash' ? 'text-lime-700' : 
                 'text-green-700'}`}>{competition.entries}</span>
            </div>
            
            <div className={`flex flex-col items-center p-4 rounded-lg
              ${competition.type === 'family' ? 'bg-yellow-50' : 
               competition.type === 'appliances' ? 'bg-purple-50' : 
               competition.type === 'cash' ? 'bg-teal-50' : 
               'bg-amber-50'}`}>
              <Timer className={`h-6 w-6 mb-2
                ${competition.type === 'family' ? 'text-yellow-500' : 
                 competition.type === 'appliances' ? 'text-purple-500' : 
                 competition.type === 'cash' ? 'text-teal-500' : 
                 'text-amber-500'}`} />
              <span className="text-sm text-gray-500">Ends In</span>
              <span className={`text-lg font-bold
                ${competition.type === 'family' ? 'text-yellow-700' : 
                 competition.type === 'appliances' ? 'text-purple-700' : 
                 competition.type === 'cash' ? 'text-teal-700' : 
                 'text-amber-700'}`}>{getDaysRemaining()}</span>
            </div>
            
            <div className={`flex flex-col items-center p-4 rounded-lg
              ${competition.type === 'family' ? 'bg-red-50' : 
               competition.type === 'appliances' ? 'bg-fuchsia-50' : 
               competition.type === 'cash' ? 'bg-emerald-50' : 
               'bg-purple-50'}`}>
              <Globe className={`h-6 w-6 mb-2
                ${competition.type === 'family' ? 'text-red-500' : 
                 competition.type === 'appliances' ? 'text-fuchsia-500' : 
                 competition.type === 'cash' ? 'text-emerald-500' : 
                 'text-purple-500'}`} />
              <span className="text-sm text-gray-500">Eligibility</span>
              <span className={`text-lg font-bold
                ${competition.type === 'family' ? 'text-red-700' : 
                 competition.type === 'appliances' ? 'text-fuchsia-700' : 
                 competition.type === 'cash' ? 'text-emerald-700' : 
                 'text-purple-700'}`}>{competition.eligibility}</span>
            </div>
          </div>

          {/* Countdown timer - Category-themed design */}
          {competition.drawTime && (
            <div className={`mb-10 rounded-2xl p-8 border-4 shadow-xl
              ${competition.type === 'family' ? 'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-100 border-amber-300' : 
               competition.type === 'appliances' ? 'bg-gradient-to-br from-pink-100 via-rose-100 to-pink-100 border-pink-300' : 
               competition.type === 'cash' ? 'bg-gradient-to-br from-green-100 via-emerald-100 to-lime-100 border-green-300' : 
               'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border-blue-300'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className={`text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text flex items-center mb-4 md:mb-0
                  ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600' : 
                   competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500' : 
                   competition.type === 'cash' ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600' : 
                   'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`}>
                  <Clock className={`h-10 w-10 mr-3 animate-pulse
                    ${competition.type === 'family' ? 'text-amber-600' : 
                     competition.type === 'appliances' ? 'text-pink-600' : 
                     competition.type === 'cash' ? 'text-green-600' : 
                     'text-blue-600'}`} />
                  PRIZE DRAW COUNTDOWN
                </h2>
                <div className={`text-white text-sm font-extrabold uppercase tracking-wider px-6 py-2 rounded-full transform hover:scale-105 transition-transform shadow-md animate-pulse
                  ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 
                   competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-600 to-rose-600' : 
                   competition.type === 'cash' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 
                   'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                  WIN BIG NOW!
                </div>
              </div>
              <div className="mt-4">
                <CountdownTimer 
                  targetDate={competition.drawTime} 
                  className="mt-2"
                  showIcon={false}
                  categoryTheme={
                    competition.type === 'family' ? 'family' :
                    competition.type === 'appliances' ? 'appliances' :
                    competition.type === 'cash' ? 'cash' : 
                    undefined
                  }
                />
              </div>
              <div className="mt-8 text-center">
                <p className={`text-xl font-bold italic
                  ${competition.type === 'family' ? 'text-amber-700' : 
                   competition.type === 'appliances' ? 'text-pink-700' : 
                   competition.type === 'cash' ? 'text-green-700' : 
                   'text-indigo-700'}`}>
                  🎁 Don't miss your chance to win this amazing prize! Time is running out! 🎁
                </p>
              </div>
            </div>
          )}

          {/* Description with category-specific styling */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-3
              ${competition.type === 'family' ? 'text-amber-800' : 
               competition.type === 'appliances' ? 'text-pink-800' : 
               competition.type === 'cash' ? 'text-green-800' : 
               'text-gray-800'}`}>
              About This Competition
            </h2>
            <p className={`
              ${competition.type === 'family' ? 'text-amber-700/80' : 
               competition.type === 'appliances' ? 'text-pink-700/80' : 
               competition.type === 'cash' ? 'text-green-700/80' : 
               'text-gray-600'}`}>
              {competition.description}
            </p>
          </div>

          {/* Get Tickets Section with category-specific heading */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-3
              ${competition.type === 'family' ? 'text-amber-800' : 
               competition.type === 'appliances' ? 'text-pink-800' : 
               competition.type === 'cash' ? 'text-green-800' : 
               'text-gray-800'}`}>
              Get Tickets
            </h2>
            
            {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
              <div className={`rounded-lg p-4 border
                ${competition.type === 'family' ? 'bg-amber-50 border-amber-100' : 
                 competition.type === 'appliances' ? 'bg-pink-50 border-pink-100' : 
                 competition.type === 'cash' ? 'bg-green-50 border-green-100' : 
                 'bg-blue-50 border-blue-100'}`}>
                <h3 className={`text-lg font-semibold mb-2
                  ${competition.type === 'family' ? 'text-amber-800' : 
                   competition.type === 'appliances' ? 'text-pink-800' : 
                   competition.type === 'cash' ? 'text-green-800' : 
                   'text-blue-800'}`}>
                  Your Tickets
                </h3>
                <p className="text-sm mb-2">You have {competition.ticketCount} ticket{competition.ticketCount !== 1 ? 's' : ''} for this prize draw</p>
                {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {competition.ticketNumbers.map(number => (
                      <span key={number} className={`px-3 py-1 bg-white rounded-full text-sm font-medium border
                        ${competition.type === 'family' ? 'border-amber-300 text-amber-600' : 
                         competition.type === 'appliances' ? 'border-pink-300 text-pink-600' : 
                         competition.type === 'cash' ? 'border-green-300 text-green-600' : 
                         'border-blue-300 text-blue-600'}`}>
                        #{number}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => setIsTicketModalOpen(true)}
                  className={`mt-4 w-full md:w-auto text-white
                    ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 
                     competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700' : 
                     competition.type === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 
                     'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
                >
                  Buy More Tickets
                </Button>
              </div>
            ) : (
              <div className={`rounded-lg p-4 border
                ${competition.type === 'family' ? 'bg-amber-50 border-amber-100' : 
                 competition.type === 'appliances' ? 'bg-pink-50 border-pink-100' : 
                 competition.type === 'cash' ? 'bg-green-50 border-green-100' : 
                 'bg-amber-50 border-amber-100'}`}>
                <p className={`mb-4
                  ${competition.type === 'family' ? 'text-amber-800' : 
                   competition.type === 'appliances' ? 'text-pink-800' : 
                   competition.type === 'cash' ? 'text-green-800' : 
                   'text-amber-800'}`}>
                  Enter this prize draw by purchasing tickets. The more tickets you buy, the higher your chances of winning!
                </p>
                
                <Button
                  onClick={handleEnterCompetition}
                  disabled={isEnded || isProcessing}
                  className={`w-full text-white
                    ${competition.type === 'family' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 
                     competition.type === 'appliances' ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700' : 
                     competition.type === 'cash' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 
                     'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Tickets - £{(competition.ticketPrice ? competition.ticketPrice/100 : 9.99).toFixed(2)} each
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Platform info with category-specific styling */}
          <div className={`p-4 rounded-lg flex items-center justify-between
            ${competition.type === 'family' ? 'bg-amber-50/70' : 
             competition.type === 'appliances' ? 'bg-pink-50/70' : 
             competition.type === 'cash' ? 'bg-green-50/70' : 
             'bg-gray-50'}`}>
            <div>
              <span className="text-sm text-gray-500 block">Platform</span>
              <span className={`font-medium
                ${competition.type === 'family' ? 'text-amber-800' : 
                 competition.type === 'appliances' ? 'text-pink-800' : 
                 competition.type === 'cash' ? 'text-green-800' : 
                 'text-gray-800'}`}>{competition.platform}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Type</span>
              <span className={`font-medium 
                ${competition.type === 'family' ? 'text-amber-800' : 
                 competition.type === 'appliances' ? 'text-pink-800' : 
                 competition.type === 'cash' ? 'text-green-800' : 
                 'text-gray-800'}`}>{competition.type}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Draw Date</span>
              <span className={`font-medium 
                ${competition.type === 'family' ? 'text-amber-800' : 
                 competition.type === 'appliances' ? 'text-pink-800' : 
                 competition.type === 'cash' ? 'text-green-800' : 
                 'text-gray-800'}`}>
                {competition.drawTime ? new Date(competition.drawTime).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            {competition.isVerified && (
              <div className={`flex items-center
                ${competition.type === 'family' ? 'text-amber-600' : 
                 competition.type === 'appliances' ? 'text-pink-600' : 
                 competition.type === 'cash' ? 'text-green-600' : 
                 'text-blue-600'}`}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            )}
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
    </div>
  );
}