import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ticket, Shuffle } from "lucide-react";

interface TicketSelectionGridProps {
  totalTickets: number | null;
  soldTickets: number | null;
  maxSelectable: number | null;
  selectedNumbers: number[];
  onSelectNumbers: (numbers: number[]) => void;
  competitionType?: string;
  userTickets?: number[];
}

// Ticket status options
type TicketStatus = "available" | "purchased" | "selected" | "processing" | "unavailable";

export default function TicketSelectionGrid({
  totalTickets,
  soldTickets = 0,
  maxSelectable = 10,
  selectedNumbers,
  onSelectNumbers,
  competitionType = "default",
  userTickets = []
}: TicketSelectionGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 32; // 4x8 grid
  
  // Determine which tickets are sold (not available)
  const soldTicketsArray = Array.from(
    { length: soldTickets || 0 },
    (_, i) => i + 1
  );
  
  // Remove any tickets that are already owned by the user
  const unavailableTickets = [
    ...soldTicketsArray,
    ...userTickets,
  ].filter(num => !userTickets.includes(num)); // Don't include user's tickets in unavailable
  
  // Ticket status lookup function
  const getTicketStatus = (ticketNumber: number): TicketStatus => {
    if (selectedNumbers.includes(ticketNumber)) {
      return "selected";
    } else if (userTickets.includes(ticketNumber)) {
      return "purchased"; 
    } else if (unavailableTickets.includes(ticketNumber)) {
      return "unavailable";
    } else {
      return "available";
    }
  };
  
  // Handle clicking on a ticket
  const handleTicketClick = (ticketNumber: number) => {
    // If already selected, deselect it
    if (selectedNumbers.includes(ticketNumber)) {
      onSelectNumbers(selectedNumbers.filter(num => num !== ticketNumber));
      return;
    }
    
    // If the status isn't available, do nothing
    if (getTicketStatus(ticketNumber) !== "available") {
      return;
    }
    
    // If at max selection, do nothing
    if (selectedNumbers.length >= (maxSelectable || 10)) {
      return;
    }
    
    // Add to selected numbers
    onSelectNumbers([...selectedNumbers, ticketNumber]);
  };
  
  // Calculate total number of pages
  const totalPages = Math.ceil((totalTickets || 100) / ticketsPerPage);
  
  // Generate the ticket numbers for the current page
  const ticketsToDisplay = Array.from(
    { length: ticketsPerPage },
    (_, i) => (currentPage - 1) * ticketsPerPage + i + 1
  ).filter(num => num <= (totalTickets || 100));
  
  // Pagination
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Generate lucky dip selections
  const generateLuckyDip = () => {
    // Clear currently selected numbers
    const currentTotal = totalTickets || 100;
    const currentMax = maxSelectable || 10;
    
    // Create an array of all available tickets
    const availableTickets = Array.from(
      { length: currentTotal },
      (_, i) => i + 1
    ).filter(num => getTicketStatus(num) === "available");
    
    // Shuffle the array
    const shuffled = [...availableTickets].sort(() => 0.5 - Math.random());
    
    // Take the number of tickets we want (up to maxSelectable)
    const maxToSelect = Math.min(currentMax, availableTickets.length);
    const luckyNumbers = shuffled.slice(0, maxToSelect);
    
    // Update selected numbers
    onSelectNumbers(luckyNumbers);
  };
  
  // Get type-based colors
  const getTypeColors = () => {
    switch (competitionType) {
      case 'family':
        return {
          selected: 'bg-amber-500',
          hover: 'hover:bg-amber-400',
          selectedHover: 'hover:bg-amber-600',
          processing: 'bg-amber-300',
          border: 'border-amber-700',
          text: 'text-amber-700'
        };
      case 'appliances':
        return {
          selected: 'bg-pink-500',
          hover: 'hover:bg-pink-400',
          selectedHover: 'hover:bg-pink-600',
          processing: 'bg-pink-300',
          border: 'border-pink-700',
          text: 'text-pink-700'
        };
      case 'cash':
        return {
          selected: 'bg-green-500',
          hover: 'hover:bg-green-400',
          selectedHover: 'hover:bg-green-600',
          processing: 'bg-green-300',
          border: 'border-green-700',
          text: 'text-green-700'
        };
      default:
        return {
          selected: 'bg-blue-500',
          hover: 'hover:bg-blue-400',
          selectedHover: 'hover:bg-blue-600',
          processing: 'bg-blue-300',
          border: 'border-blue-700',
          text: 'text-blue-700'
        };
    }
  };
  
  const colors = getTypeColors();
  
  return (
    <div className="w-full mx-auto space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Tickets Legend */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Tickets Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-800/80 border border-gray-600 mr-2"></div>
            <span className="text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${colors.selected} mr-2`}></div>
            <span className="text-sm text-gray-300">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-600 mr-2"></div>
            <span className="text-sm text-gray-300">Purchased</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-500/50 mr-2"></div>
            <span className="text-sm text-gray-300">Unavailable</span>
          </div>
        </div>
      </div>
      
      {/* Ticket Pages Selector */}
      {totalPages > 1 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Ticket Pages</h3>
            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => goToPage(page)}
                variant="ghost"
                className={`min-w-[40px] h-10 px-0 rounded ${
                  currentPage === page
                    ? `${colors.selected} text-white font-medium`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {page}
              </Button>
            ))}
            {totalPages > 10 && (
              <>
                <span className="px-1 text-gray-500">...</span>
                <Button
                  onClick={() => goToPage(totalPages)}
                  variant="ghost"
                  className={`min-w-[40px] h-10 px-0 rounded ${
                    currentPage === totalPages
                      ? `${colors.selected} text-white font-medium`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Ticket Grid */}
      <div className="grid grid-cols-8 gap-1 mb-6">
        {ticketsToDisplay.map((ticketNumber) => {
          const status = getTicketStatus(ticketNumber);
          return (
            <button
              key={ticketNumber}
              onClick={() => handleTicketClick(ticketNumber)}
              className={`
                h-10 flex items-center justify-center rounded text-sm font-medium transition-all duration-200
                ${status === 'selected' ? `${colors.selected} text-white border-0` : ''}
                ${status === 'available' ? `bg-gray-800/50 text-gray-300 hover:bg-gray-700/80` : ''}
                ${status === 'purchased' ? 'bg-gray-600 text-white/70 cursor-default' : ''}
                ${status === 'unavailable' ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed' : ''}
                ${status === 'processing' ? `bg-gray-800 text-white/70 cursor-wait` : ''}
              `}
              disabled={status === 'unavailable' || status === 'purchased' || status === 'processing'}
            >
              {ticketNumber}
            </button>
          );
        })}
      </div>
      
      {/* Selected Tickets Summary */}
      <div className="mb-4 bg-gray-800/40 backdrop-blur-sm p-3 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-2">Selected Tickets</h3>
        <div className="flex flex-wrap gap-2 mb-3 min-h-6">
          {selectedNumbers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.map(number => (
                <span 
                  key={number} 
                  className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium ${colors.selected} text-white`}
                >
                  #{number}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No tickets selected</span>
          )}
        </div>
      </div>
      
      {/* Lucky Dip Button */}
      <Button
        onClick={generateLuckyDip}
        disabled={selectedNumbers.length >= (maxSelectable || 10)}
        className="w-full py-3 h-auto gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white font-medium border border-gray-700/50 hover:border-gray-600/80 shadow-sm" 
      >
        <Shuffle className="h-4 w-4 mr-1" />
        Lucky Dip
      </Button>
    </div>
  );
}