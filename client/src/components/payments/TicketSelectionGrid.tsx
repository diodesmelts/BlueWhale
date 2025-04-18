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
    <div className="w-full mx-auto space-y-6">
      {/* Tickets Legend */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-3">Tickets Legend</h3>
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full border border-gray-300 bg-white mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full border border-orange-500 bg-orange-500 mr-2"></div>
            <span className="text-sm">Added</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full border border-gray-400 bg-gray-200 mr-2"></div>
            <span className="text-sm">Purchased</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full border border-amber-500 bg-amber-100 mr-2"></div>
            <span className="text-sm">Another Player is purchasing</span>
          </div>
        </div>
      </div>
      
      {/* Ticket Pages Selector */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-3">Ticket Pages</h3>
        <div className="flex">
          <span className="text-sm font-medium">1-34</span>
        </div>
        <div className="flex items-center gap-0 mt-3 overflow-x-auto pb-2">
          {Array.from({ length: Math.min(8, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[44px] px-1 h-12 flex items-center justify-center 
                ${currentPage === page
                  ? `bg-orange-500 text-white`
                  : page % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              style={{ borderRight: "1px solid #fff" }}
            >
              {page}
            </button>
          ))}
          {totalPages > 8 && (
            <>
              <span className="px-1">...</span>
              <button
                onClick={() => goToPage(totalPages)}
                className={`min-w-[44px] px-1 h-12 flex items-center justify-center 
                  ${currentPage === totalPages
                    ? `bg-orange-500 text-white`
                    : totalPages % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                style={{ borderRight: "1px solid #fff" }}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Ticket Grid */}
      <div className="grid grid-cols-8 gap-0 mb-8">
        {ticketsToDisplay.map((ticketNumber) => {
          const status = getTicketStatus(ticketNumber);
          return (
            <button
              key={ticketNumber}
              onClick={() => handleTicketClick(ticketNumber)}
              className={`
                h-[44px] flex items-center justify-center border border-gray-300 text-sm font-medium
                ${status === 'selected' ? `bg-orange-500 text-white border-orange-500` : ''}
                ${status === 'available' ? `bg-white hover:bg-gray-100` : ''}
                ${status === 'purchased' ? 'bg-gray-200 text-gray-700 cursor-default' : ''}
                ${status === 'unavailable' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}
                ${status === 'processing' ? `bg-amber-100 text-amber-800 cursor-wait` : ''}
                transition-colors duration-100
              `}
              style={{ marginBottom: "-1px", marginRight: "-1px" }}
              disabled={status === 'unavailable' || status === 'purchased' || status === 'processing'}
            >
              {ticketNumber}
            </button>
          );
        })}
      </div>
      
      {/* Selected Tickets Summary */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-3">Selected Ticket(s)</h3>
        <div className="flex flex-wrap gap-2 mb-5 min-h-8">
          {selectedNumbers.length > 0 ? (
            selectedNumbers.map(number => (
              <span key={number} className="inline-flex items-center text-sm">
                Ticket Number {number}
                {selectedNumbers.indexOf(number) < selectedNumbers.length - 1 && ", "}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No tickets selected</span>
          )}
        </div>
        
        <div className="mb-8">
          <button
            onClick={generateLuckyDip}
            disabled={selectedNumbers.length >= (maxSelectable || 10)}
            className="w-full py-4 bg-black text-white text-center rounded-sm font-medium"
          >
            LUCKY DIP
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="pb-4">
        <button 
          onClick={() => onSelectNumbers(selectedNumbers)}
          className={`w-full py-4 h-auto rounded-sm ${
            selectedNumbers.length > 0
              ? `bg-orange-500 hover:bg-orange-600`
              : 'bg-gray-300 cursor-not-allowed'
          } text-white font-medium text-lg`}
          disabled={selectedNumbers.length === 0}
        >
          GO TO CART
        </button>
      </div>
    </div>
  );
}