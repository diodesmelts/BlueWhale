import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EntryProgress from "./EntryProgress";
import { CompetitionWithEntryStatus } from "@shared/types";

interface CompetitionCardProps {
  competition: CompetitionWithEntryStatus;
  onEnter: (id: number) => void;
  onBookmark: (id: number) => void;
  onLike: (id: number) => void;
  onCompleteEntry: (id: number) => void;
}

export default function CompetitionCard({ 
  competition, 
  onEnter, 
  onBookmark, 
  onLike, 
  onCompleteEntry 
}: CompetitionCardProps) {
  const {
    id,
    title,
    organizer,
    description,
    image,
    platform,
    type,
    prize,
    entries,
    eligibility,
    endDate,
    entrySteps,
    isVerified,
    isEntered,
    entryProgress,
    isBookmarked,
    isLiked
  } = competition;

  // Get days remaining
  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Ended";
    if (diffDays === 1) return "Ends tomorrow";
    if (diffDays <= 3) return `Ends in ${diffDays} days`;
    if (diffDays <= 7) return "Ends in 1 week";
    return `Ends in ${diffDays} days`;
  };

  const daysRemaining = getDaysRemaining();
  const isEndingSoon = daysRemaining === "Ends tomorrow" || daysRemaining.includes("Ends in 3 days");

  return (
    <div className={`competition-card border-b border-gray p-4 transition duration-200 ${isEntered ? 'bg-[#153B84] bg-opacity-5' : ''}`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 md:w-1/4 lg:w-1/6 mb-4 md:mb-0">
          <div 
            className="w-full h-32 bg-gray-200 rounded-lg bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
          <div className="flex items-center mt-2">
            <Badge 
              variant="default" 
              className="mr-2 bg-[#153B84] text-white hover:bg-[#153B84] text-xs font-normal"
            >
              {platform}
            </Badge>
            <Badge 
              variant="default" 
              className="bg-[#FFF13A] text-[#153B84] hover:bg-[#FFF13A] text-xs font-medium"
            >
              {type}
            </Badge>
          </div>
        </div>
        
        <div className="md:ml-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#153B84] flex items-center">
                {title}
                {isVerified && (
                  <Badge 
                    variant="default" 
                    className="ml-2 bg-[#7ED957] text-white hover:bg-[#7ED957] text-xs font-normal flex items-center"
                  >
                    <i className="fas fa-check-circle mr-1"></i> Verified
                  </Badge>
                )}
                {isEntered && (
                  <Badge 
                    variant="default" 
                    className="ml-2 bg-[#153B84] text-white hover:bg-[#153B84] text-xs font-normal"
                  >
                    Entered
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-600">
                By <span className="font-medium">{organizer}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className={`p-2 ${isBookmarked ? 'text-[#153B84]' : 'text-gray-400 hover:text-[#153B84]'}`}
                onClick={() => onBookmark(id)}
              >
                <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
              </button>
              <button 
                className={`p-2 ${isLiked ? 'text-[#DB1F1F]' : 'text-gray-400 hover:text-[#DB1F1F]'}`}
                onClick={() => onLike(id)}
              >
                <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 my-2">{description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="flex items-center text-sm">
              <i className="fas fa-gift text-[#153B84] mr-2"></i>
              <span>Value: ${prize.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <i className="fas fa-users text-[#153B84] mr-2"></i>
              <span>{entries.toLocaleString()} Entries</span>
            </div>
            <div className="flex items-center text-sm">
              <i className="fas fa-globe text-[#153B84] mr-2"></i>
              <span>{eligibility}</span>
            </div>
            <div className="flex items-center text-sm">
              <i className={`fas fa-clock ${isEndingSoon ? 'text-[#DB1F1F]' : 'text-[#153B84]'} mr-2`}></i>
              <span>{daysRemaining}</span>
            </div>
          </div>
          
          {isEntered ? (
            <div className="mt-3">
              <EntryProgress 
                steps={entrySteps}
                progress={entryProgress}
                onComplete={() => onCompleteEntry(id)}
              />
            </div>
          ) : (
            <div className="flex items-center mt-3">
              <Button 
                onClick={() => onEnter(id)}
                className="bg-[#DB1F1F] hover:bg-red-700 text-white text-sm font-medium px-4 py-2 mr-2 transition duration-300"
              >
                Enter Now
              </Button>
              <div className="flex items-center text-sm text-gray-500">
                <i className="fas fa-list-check mr-1"></i>
                <span>{entrySteps.length} entry steps</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
