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
    <div className={`competition-card p-5 mb-5 transition duration-200 rounded-xl bg-white shadow-md hover:shadow-lg ${
      isEntered ? 'border-l-4 border-rose-500' : ''
    }`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 md:w-1/4 lg:w-1/5 mb-4 md:mb-0">
          <div 
            className="w-full h-36 bg-gray-200 rounded-xl bg-center bg-cover shadow-sm"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
          <div className="flex items-center mt-3 space-x-2">
            <Badge 
              variant="default" 
              className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 text-xs font-medium"
            >
              {platform}
            </Badge>
            <Badge 
              variant="default" 
              className="bg-amber-100 text-amber-600 hover:bg-amber-200 text-xs font-medium"
            >
              {type}
            </Badge>
          </div>
        </div>
        
        <div className="md:ml-6 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                {title}
                {isVerified && (
                  <Badge 
                    variant="default" 
                    className="ml-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 text-xs font-normal flex items-center"
                  >
                    <i className="fas fa-check-circle mr-1"></i> Verified
                  </Badge>
                )}
                {isEntered && (
                  <Badge 
                    variant="default" 
                    className="ml-2 bg-rose-100 text-rose-600 hover:bg-rose-200 text-xs font-normal"
                  >
                    Entered
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Organized by <span className="font-medium text-gray-700">{organizer}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  isBookmarked ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'
                }`}
                onClick={() => onBookmark(id)}
              >
                <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
              </button>
              <button 
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
                }`}
                onClick={() => onLike(id)}
              >
                <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 my-3 line-clamp-2">{description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col bg-rose-50 rounded-lg p-2 text-center">
              <span className="text-xs text-gray-500 mb-1">Prize Value</span>
              <span className="text-lg font-bold text-rose-600">${prize.toLocaleString()}</span>
            </div>
            <div className="flex flex-col bg-indigo-50 rounded-lg p-2 text-center">
              <span className="text-xs text-gray-500 mb-1">Participants</span>
              <span className="text-lg font-bold text-indigo-600">{entries.toLocaleString()}</span>
            </div>
            <div className="flex flex-col bg-amber-50 rounded-lg p-2 text-center">
              <span className="text-xs text-gray-500 mb-1">Eligibility</span>
              <span className="text-sm font-bold text-amber-600">{eligibility}</span>
            </div>
            <div className="flex flex-col bg-emerald-50 rounded-lg p-2 text-center">
              <span className="text-xs text-gray-500 mb-1">Timeframe</span>
              <span className={`text-sm font-bold ${isEndingSoon ? 'text-rose-600' : 'text-emerald-600'}`}>
                {daysRemaining}
              </span>
            </div>
          </div>
          
          {isEntered ? (
            <div className="mt-4">
              <EntryProgress 
                steps={entrySteps}
                progress={entryProgress}
                onComplete={() => onCompleteEntry(id)}
              />
            </div>
          ) : (
            <div className="flex items-center mt-4">
              <Button 
                onClick={() => onEnter(id)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-medium px-6 py-2 mr-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-trophy mr-2"></i>
                Enter Now
              </Button>
              <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <i className="fas fa-list-check mr-2 text-indigo-500"></i>
                <span>{entrySteps.length} entry steps</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
