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
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/use-payment";
import TicketPurchaseModal from "@/components/payments/TicketPurchaseModal";

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
    const endDate = new Date(competition.endDate);
    const diffTime = endDate.getTime() - now.getTime();
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

  const isEnded = new Date(competition.endDate) < new Date();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 text-gray-600"
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
                  className={`rounded-full bg-white/20 hover:bg-white/30 ${competition.isBookmarked ? 'text-yellow-400' : 'text-white'}`}
                  onClick={() => handleBookmark(competition.id)}
                >
                  <i className={competition.isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full bg-white/20 hover:bg-white/30 ${competition.isLiked ? 'text-rose-500' : 'text-white'}`}
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
          {/* Competition stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-sm text-gray-500">Prize</span>
              <span className="text-lg font-bold text-blue-700">${competition.prize.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-500 mb-2" />
              <span className="text-sm text-gray-500">Entries</span>
              <span className="text-lg font-bold text-green-700">{competition.entries}</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
              <Timer className="h-6 w-6 text-amber-500 mb-2" />
              <span className="text-sm text-gray-500">Ends In</span>
              <span className="text-lg font-bold text-amber-700">{getDaysRemaining()}</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <Globe className="h-6 w-6 text-purple-500 mb-2" />
              <span className="text-sm text-gray-500">Eligibility</span>
              <span className="text-lg font-bold text-purple-700">{competition.eligibility}</span>
            </div>
          </div>

          {/* Ticket information - simplified and included in the "Get Tickets" section */}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">About This Competition</h2>
            <p className="text-gray-600">{competition.description}</p>
          </div>

          {/* Get Tickets Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Get Tickets</h2>
            
            {competition.isEntered && competition.ticketCount && competition.ticketCount > 0 ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Tickets</h3>
                <p className="text-sm mb-2">You have {competition.ticketCount} ticket{competition.ticketCount !== 1 ? 's' : ''} for this prize draw</p>
                {competition.ticketNumbers && competition.ticketNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {competition.ticketNumbers.map(number => (
                      <span key={number} className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm font-medium text-blue-600">
                        #{number}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="mt-4 w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Buy More Tickets
                </Button>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <p className="text-amber-800 mb-4">Enter this prize draw by purchasing tickets. The more tickets you buy, the higher your chances of winning!</p>
                
                <Button
                  onClick={handleEnterCompetition}
                  disabled={isEnded || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Tickets - ${(competition.ticketPrice ? competition.ticketPrice/100 : 9.99).toFixed(2)} each
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Platform info */}
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500 block">Platform</span>
              <span className="font-medium text-gray-800">{competition.platform}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Type</span>
              <span className="font-medium text-gray-800">{competition.type}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">End Date</span>
              <span className="font-medium text-gray-800">
                {new Date(competition.endDate).toLocaleDateString()}
              </span>
            </div>
            {competition.isVerified && (
              <div className="flex items-center text-blue-600">
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