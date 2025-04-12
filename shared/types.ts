import { EntryStep } from './schema';

// Extended competition type that includes user-specific entry status
export interface CompetitionWithEntryStatus {
  id: number;
  title: string;
  organizer: string;
  description: string;
  image: string;
  platform: string;
  type: string;
  prize: number;
  entries: number;
  eligibility: string;
  endDate: string;
  entrySteps: EntryStep[];
  isVerified: boolean;
  createdAt: string;
  entryFee?: number; // Optional entry fee, if undefined or 0, competition is free
  
  // User entry specific fields
  isEntered: boolean;
  entryProgress: number[];
  isBookmarked: boolean;
  isLiked: boolean;
  
  // For wins
  winDate?: string;
  claimByDate?: string;
  prizeReceived?: boolean;
  receivedDate?: string;
}

// User stats type
export interface UserStats {
  activeEntries: number;
  totalEntries: number;
  totalWins: number;
  totalWinValue: number;
  winRate: number;
  lastWinDate: string | null;
}

// Leaderboard user type
export interface LeaderboardUser {
  id: number;
  username: string;
  initials: string;
  isPremium: boolean;
  rank: number;
  entries: number;
  wins: number;
  winRate: number;
  streak: number;
}
