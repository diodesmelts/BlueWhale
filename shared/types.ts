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
  isDeleted?: boolean; // Flag to indicate if competition has been deleted
  createdAt: string;
  
  // Ticket-related fields
  ticketPrice: number; // Price per ticket in cents
  maxTicketsPerUser: number; // Max tickets per user
  totalTickets: number; // Total available tickets
  soldTickets: number; // Number of tickets sold
  
  // User entry specific fields
  isEntered: boolean;
  entryProgress: number[];
  isBookmarked: boolean;
  isLiked: boolean;
  ticketCount?: number; // Number of tickets the user has purchased
  ticketNumbers?: number[]; // Array of ticket numbers assigned to this user
  
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
