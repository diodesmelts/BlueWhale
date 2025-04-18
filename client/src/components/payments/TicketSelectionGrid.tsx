import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Tickets Legend */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Tickets Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded border border-gray-300 bg-white mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded border ${colors.border} ${colors.selected} mr-2`}></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded border border-gray-400 bg-gray-200 mr-2"></div>
            <span className="text-sm">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded border border-green-700 bg-green-100 mr-2"></div>
            <span className="text-sm">Your Tickets</span>
          </div>
        </div>
      </div>
      
      {/* Ticket Pages Selector */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Ticket Pages</h3>
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1.5 rounded ${
                currentPage === page
                  ? `${colors.selected} text-white`
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => goToPage(totalPages)}
                className={`px-3 py-1.5 rounded ${
                  currentPage === totalPages
                    ? `${colors.selected} text-white`
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Ticket Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
        {ticketsToDisplay.map((ticketNumber) => {
          const status = getTicketStatus(ticketNumber);
          return (
            <button
              key={ticketNumber}
              onClick={() => handleTicketClick(ticketNumber)}
              className={`
                h-12 flex items-center justify-center rounded border 
                ${status === 'selected' ? `${colors.selected} ${colors.selectedHover} text-white` : ''}
                ${status === 'available' ? `bg-white ${colors.hover}` : ''}
                ${status === 'purchased' ? 'bg-green-100 border-green-700 cursor-default' : ''}
                ${status === 'unavailable' ? 'bg-gray-200 cursor-not-allowed' : ''}
                ${status === 'processing' ? `${colors.processing} cursor-wait` : ''}
                transition-colors duration-200
              `}
              disabled={status === 'unavailable' || status === 'purchased' || status === 'processing'}
            >
              {ticketNumber}
            </button>
          );
        })}
      </div>
      
      {/* Selected Tickets Summary */}
      <div className="bg-gray-50 p-3 rounded-lg border">
        <h3 className="font-semibold mb-2">Selected Ticket(s)</h3>
        <div className="flex flex-wrap gap-2 mb-3 min-h-12">
          {selectedNumbers.length > 0 ? (
            selectedNumbers.map(number => (
              <span key={number} className={`inline-flex items-center px-3 py-1 rounded-full text-sm text-white ${colors.selected}`}>
                #{number}
                <button 
                  className="ml-1 hover:text-red-100" 
                  onClick={() => handleTicketClick(number)}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 italic">No tickets selected yet</span>
          )}
        </div>
        
        <Button
          onClick={generateLuckyDip}
          className="w-full bg-black text-white hover:bg-gray-800"
          disabled={selectedNumbers.length >= (maxSelectable || 10)}
        >
          LUCKY DIP
        </Button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          className={`flex-1 ${
            selectedNumbers.length > 0
              ? `bg-gradient-to-r ${
                  competitionType === 'family' ? 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' :
                  competitionType === 'appliances' ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700' : 
                  competitionType === 'cash' ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                  'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`
              : 'bg-gray-300 cursor-not-allowed'
          } text-white font-medium text-sm`}
          disabled={selectedNumbers.length === 0}
        >
          <Ticket className="w-4 h-4 mr-2" />
          ADD TO CART
        </Button>
      </div>
    </div>
  );
}