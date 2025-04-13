import { 
  User, InsertUser, Competition, InsertCompetition, 
  UserEntry, InsertUserEntry, UserWin, InsertUserWin,
  LeaderboardEntry, InsertLeaderboardEntry, EntryStep
} from "@shared/schema";
import { CompetitionWithEntryStatus, LeaderboardUser, UserStats } from "@shared/types";

// modify the interface with any CRUD methods
// you might need
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Competition methods
  getCompetition(id: number): Promise<Competition | undefined>;
  listCompetitions(
    filter?: { platform?: string; type?: string; category?: string; }, 
    sort?: string, 
    tab?: string,
    includeDeleted?: boolean
  ): Promise<Competition[]>;
  createCompetition(competition: InsertCompetition): Promise<Competition>;
  updateCompetition(id: number, data: Partial<Competition>): Promise<Competition | undefined>;
  deleteCompetition(id: number): Promise<boolean>;
  
  // User Entry methods
  getUserEntries(userId: number): Promise<UserEntry[]>;
  getUserEntry(userId: number, competitionId: number): Promise<UserEntry | undefined>;
  createUserEntry(entry: InsertUserEntry): Promise<UserEntry>;
  updateUserEntry(id: number, data: Partial<UserEntry>): Promise<UserEntry>;
  
  // User Win methods
  getUserWins(userId: number): Promise<UserWin[]>;
  createUserWin(win: InsertUserWin): Promise<UserWin>;
  updateUserWin(id: number, data: Partial<UserWin>): Promise<UserWin>;
  
  // Stats and Leaderboard
  getUserStats(userId: number): Promise<UserStats>;
  getLeaderboard(): Promise<LeaderboardUser[]>;
  
  // Combined queries
  getCompetitionsWithUserStatus(
    userId: number, 
    filter?: { platform?: string; type?: string; category?: string; }, 
    sort?: string, 
    tab?: string
  ): Promise<CompetitionWithEntryStatus[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private competitions: Map<number, Competition>;
  private userEntries: Map<number, UserEntry>;
  private userWins: Map<number, UserWin>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  
  private userIdCounter: number;
  private competitionIdCounter: number;
  private userEntryIdCounter: number;
  private userWinIdCounter: number;
  private leaderboardIdCounter: number;
  
  public sessionStore: session.Store = new (require('memorystore')(session))({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  constructor() {
    this.users = new Map();
    this.competitions = new Map();
    this.userEntries = new Map();
    this.userWins = new Map();
    this.leaderboardEntries = new Map();
    
    this.userIdCounter = 1;
    this.competitionIdCounter = 1;
    this.userEntryIdCounter = 1;
    this.userWinIdCounter = 1;
    this.leaderboardIdCounter = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: insertUser.isPremium !== undefined ? insertUser.isPremium : false,
      isAdmin: insertUser.isAdmin !== undefined ? insertUser.isAdmin : false,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Competition methods
  async getCompetition(id: number): Promise<Competition | undefined> {
    const competition = this.competitions.get(id);
    // Return undefined if either competition doesn't exist or is deleted
    if (!competition || competition.isDeleted) {
      return undefined;
    }
    return competition;
  }
  
  async listCompetitions(
    filter?: { platform?: string; type?: string; category?: string; },
    sort?: string,
    tab?: string,
    includeDeleted: boolean = false
  ): Promise<Competition[]> {
    // Get all competitions, filter out deleted ones unless includeDeleted is true
    let competitions = Array.from(this.competitions.values());
    
    // Only filter out deleted competitions if includeDeleted is false
    if (!includeDeleted) {
      competitions = competitions.filter(comp => !comp.isDeleted);
    }
    
    // Apply filters
    if (filter) {
      if (filter.platform && filter.platform !== 'all') {
        competitions = competitions.filter(comp => comp.platform.toLowerCase() === filter.platform?.toLowerCase());
      }
      
      if (filter.type && filter.type !== 'all') {
        competitions = competitions.filter(comp => comp.type.toLowerCase() === filter.type?.toLowerCase());
      }
      
      if (filter.category && filter.category !== 'all') {
        competitions = competitions.filter(comp => comp.category?.toLowerCase() === filter.category.toLowerCase());
      }
    }
    
    // Apply tab filters
    if (tab) {
      const now = new Date();
      
      if (tab === 'ending-soon') {
        competitions = competitions.filter(comp => {
          const endDate = new Date(comp.endDate);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 3;
        });
      } else if (tab === 'high-value') {
        competitions = competitions.filter(comp => comp.prize >= 1000);
      }
    }
    
    // Apply sorting
    if (sort) {
      if (sort === 'endDate') {
        competitions.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      } else if (sort === 'prizeValue') {
        competitions.sort((a, b) => b.prize - a.prize);
      } else if (sort === 'newest') {
        competitions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        // Default to popularity (entries)
        competitions.sort((a, b) => b.entries - a.entries);
      }
    } else {
      // Default sort by popularity
      competitions.sort((a, b) => b.entries - a.entries);
    }
    
    return competitions;
  }
  
  async createCompetition(insertCompetition: InsertCompetition): Promise<Competition> {
    const id = this.competitionIdCounter++;
    const now = new Date();
    const competition: Competition = { 
      ...insertCompetition, 
      id, 
      createdAt: now,
      entries: insertCompetition.entries || 0,
      isVerified: insertCompetition.isVerified || false
    };
    this.competitions.set(id, competition);
    return competition;
  }
  
  async updateCompetition(id: number, data: Partial<Competition>): Promise<Competition | undefined> {
    const competition = this.competitions.get(id);
    if (!competition) {
      return undefined;
    }
    
    const updatedCompetition: Competition = { ...competition, ...data };
    this.competitions.set(id, updatedCompetition);
    return updatedCompetition;
  }
  
  async deleteCompetition(id: number): Promise<boolean> {
    if (!this.competitions.has(id)) {
      return false;
    }
    
    // Instead of deleting, mark as deleted
    const competition = this.competitions.get(id);
    if (competition) {
      const updatedCompetition = { 
        ...competition, 
        isDeleted: true 
      };
      this.competitions.set(id, updatedCompetition);
    }
    
    return true;
  }
  
  // User Entry methods
  async getUserEntries(userId: number): Promise<UserEntry[]> {
    return Array.from(this.userEntries.values()).filter(
      entry => entry.userId === userId
    );
  }
  
  async getUserEntry(userId: number, competitionId: number): Promise<UserEntry | undefined> {
    return Array.from(this.userEntries.values()).find(
      entry => entry.userId === userId && entry.competitionId === competitionId
    );
  }
  
  async createUserEntry(insertEntry: InsertUserEntry): Promise<UserEntry> {
    const id = this.userEntryIdCounter++;
    const now = new Date();
    const entry: UserEntry = { ...insertEntry, id, createdAt: now };
    this.userEntries.set(id, entry);
    return entry;
  }
  
  async updateUserEntry(id: number, data: Partial<UserEntry>): Promise<UserEntry> {
    const entry = this.userEntries.get(id);
    if (!entry) {
      throw new Error(`User entry with ID ${id} not found`);
    }
    
    const updatedEntry: UserEntry = { ...entry, ...data };
    this.userEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // User Win methods
  async getUserWins(userId: number): Promise<UserWin[]> {
    return Array.from(this.userWins.values()).filter(
      win => win.userId === userId
    );
  }
  
  async createUserWin(insertWin: InsertUserWin): Promise<UserWin> {
    const id = this.userWinIdCounter++;
    const now = new Date();
    const win: UserWin = { ...insertWin, id, createdAt: now };
    this.userWins.set(id, win);
    return win;
  }
  
  async updateUserWin(id: number, data: Partial<UserWin>): Promise<UserWin> {
    const win = this.userWins.get(id);
    if (!win) {
      throw new Error(`User win with ID ${id} not found`);
    }
    
    const updatedWin: UserWin = { ...win, ...data };
    this.userWins.set(id, updatedWin);
    return updatedWin;
  }
  
  // Stats and Leaderboard
  async getUserStats(userId: number): Promise<UserStats> {
    const entries = Array.from(this.userEntries.values()).filter(entry => entry.userId === userId);
    const wins = Array.from(this.userWins.values()).filter(win => win.userId === userId);
    
    // Filter active entries (not ended yet)
    const now = new Date();
    const activeEntries = await Promise.all(
      entries.map(async entry => {
        const competition = await this.getCompetition(entry.competitionId);
        if (!competition) return false;
        return new Date(competition.endDate) > now;
      })
    );
    
    // Calculate total win value
    const totalWinValue = await Promise.all(
      wins.map(async win => {
        const competition = await this.getCompetition(win.competitionId);
        return competition ? competition.prize : 0;
      })
    );
    
    // Get last win date
    let lastWinDate = null;
    if (wins.length > 0) {
      const mostRecentWin = wins.reduce((latest, current) => 
        new Date(current.winDate) > new Date(latest.winDate) ? current : latest
      );
      lastWinDate = mostRecentWin.winDate;
    }
    
    return {
      activeEntries: activeEntries.filter(Boolean).length,
      totalEntries: entries.length,
      totalWins: wins.length,
      totalWinValue: totalWinValue.reduce((sum, value) => sum + value, 0),
      winRate: entries.length ? Math.round((wins.length / entries.length) * 1000) / 10 : 0,
      lastWinDate: lastWinDate ? new Date(lastWinDate).toISOString() : null
    };
  }
  
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    const leaderboardUsers: LeaderboardUser[] = [];
    
    // Get all leaderboard entries and sort by rank
    const leaderboardEntries = Array.from(this.leaderboardEntries.values())
      .sort((a, b) => a.rank - b.rank);
    
    // Map to LeaderboardUser type with user details
    for (const entry of leaderboardEntries) {
      const user = await this.getUser(entry.userId);
      if (user) {
        const initials = user.username
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        leaderboardUsers.push({
          id: user.id,
          username: user.username,
          initials,
          isPremium: user.isPremium,
          rank: entry.rank,
          entries: entry.entries,
          wins: entry.wins,
          winRate: entry.winRate / 10, // Convert from stored format (125) to display format (12.5)
          streak: entry.streak
        });
      }
    }
    
    return leaderboardUsers;
  }
  
  // Combined queries
  async getCompetitionsWithUserStatus(
    userId: number,
    filter?: { platform?: string; type?: string; category?: string; },
    sort?: string,
    tab?: string
  ): Promise<CompetitionWithEntryStatus[]> {
    // Get base competitions - never include deleted items for the user view
    let competitions = await this.listCompetitions(filter, sort, tab, false);
    
    // If the tab is "my-entries" filter to only user's entered competitions
    if (tab === 'my-entries') {
      const userEntries = await this.getUserEntries(userId);
      const userEntryCompetitionIds = new Set(userEntries.map(entry => entry.competitionId));
      competitions = competitions.filter(comp => userEntryCompetitionIds.has(comp.id));
    }
    
    // Get user entries for these competitions
    const userEntries = await this.getUserEntries(userId);
    const userEntriesMap = new Map(
      userEntries.map(entry => [entry.competitionId, entry])
    );
    
    // Get user wins for these competitions
    const userWins = await this.getUserWins(userId);
    const userWinsMap = new Map(
      userWins.map(win => [win.competitionId, win])
    );
    
    // Map to combined type
    return competitions.map(competition => {
      const userEntry = userEntriesMap.get(competition.id);
      const userWin = userWinsMap.get(competition.id);
      
      return {
        ...competition,
        endDate: competition.endDate.toISOString(), // Convert to string for JSON
        createdAt: competition.createdAt.toISOString(), // Convert to string for JSON
        isEntered: !!userEntry,
        entryProgress: userEntry?.entryProgress || Array(competition.entrySteps.length).fill(0),
        isBookmarked: userEntry?.isBookmarked || false,
        isLiked: userEntry?.isLiked || false,
        // Win info if applicable
        winDate: userWin?.winDate.toISOString(),
        claimByDate: userWin?.claimByDate.toISOString(),
        prizeReceived: userWin?.prizeReceived,
        receivedDate: userWin?.receivedDate?.toISOString()
      };
    });
  }
  
  // Initialize demo data
  private async initializeDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: 'John Smith',
      password: 'password123', // This would be hashed in a real app
      email: 'john@example.com'
    };
    const user = await this.createUser(demoUser);
    
    // Update user to have admin privileges
    const updatedUser = { ...user, isAdmin: true };
    this.users.set(user.id, updatedUser);
    
    // Create SDK user with admin privileges
    const sdkUser: InsertUser = {
      username: 'SDK',
      password: 'password123', // This would be hashed in a real app
      email: 'sdk@competepro.com',
      isAdmin: true,
      isPremium: true
    };
    await this.createUser(sdkUser);
    
    // Create demo competitions
    const competitionData: InsertCompetition[] = [
      {
        title: 'Ultra Tech Prize Draw',
        organizer: 'TechReviewer',
        description: 'Get tickets to win the latest tech bundle including MacBook Pro, iPhone, AirPods Pro, and Apple Watch.',
        image: 'https://images.unsplash.com/photo-1611930022073-84f59b13927e?auto=format&fit=crop&w=800&q=80',
        platform: 'Tech Expo',
        type: 'Prize Draw',
        category: 'appliances',
        prize: 2999,
        entries: 2456,
        eligibility: 'Worldwide',
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        drawTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Same as endDate for now
        entrySteps: [],
        isVerified: true,
        ticketPrice: 999, // $9.99
        maxTicketsPerUser: 10,
        totalTickets: 3000,
        soldTickets: 2456
      },
      {
        title: 'Luxury Travel Experience',
        organizer: 'TravelExplorer',
        description: 'Exclusive chance to win a 7-day luxury vacation for two to Bali, including flights, 5-star accommodation, and activities.',
        image: 'https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?auto=format&fit=crop&w=800&q=80',
        platform: 'Travel Expo',
        type: 'Prize Draw',
        category: 'family',
        prize: 5000,
        entries: 4891,
        eligibility: 'US & Canada',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        drawTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Same as endDate for now
        entrySteps: [],
        isVerified: true,
        ticketPrice: 1999, // $19.99
        maxTicketsPerUser: 5,
        totalTickets: 5000,
        soldTickets: 4891
      },
      {
        title: 'Pro Gaming Championship',
        organizer: 'GameMaster',
        description: 'Join the tournament for a chance to win a complete gaming setup including RTX 3080 gaming PC, curved monitor, and accessories.',
        image: 'https://images.unsplash.com/photo-1599751449028-36bb110148ef?auto=format&fit=crop&w=800&q=80',
        platform: 'Gaming Expo',
        type: 'Tournament',
        category: 'other',
        prize: 3500,
        entries: 8234,
        eligibility: 'Worldwide',
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        drawTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Same as endDate for now
        entrySteps: [],
        isVerified: false,
        ticketPrice: 1499, // $14.99
        maxTicketsPerUser: 3,
        totalTickets: 10000,
        soldTickets: 8234
      },
      {
        title: 'Fitness Gear Draw',
        organizer: 'FitnessTech',
        description: 'Get tickets to win premium fitness gear including smartwatches with fitness tracking, GPS, and heart rate monitoring.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        platform: 'Fitness Expo',
        type: 'Prize Draw',
        prize: 299,
        entries: 1245,
        eligibility: 'US Only',
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        entrySteps: [],
        isVerified: false,
        ticketPrice: 499, // $4.99
        maxTicketsPerUser: 20,
        totalTickets: 2000,
        soldTickets: 1245
      }
    ];
    
    for (const data of competitionData) {
      await this.createCompetition(data);
    }
    
    // Create user entries for the competitions
    const gamingChampionship = Array.from(this.competitions.values()).find(
      comp => comp.title === 'Pro Gaming Championship'
    );
    
    if (gamingChampionship && user) {
      await this.createUserEntry({
        userId: user.id,
        competitionId: gamingChampionship.id,
        entryProgress: [], // No entry steps
        isBookmarked: true,
        isLiked: false
      });
      
      await this.createUserEntry({
        userId: user.id,
        competitionId: 2, // Luxury Travel Experience
        entryProgress: [], // No entry steps
        isBookmarked: true,
        isLiked: true
      });
    }
    
    // Create user wins
    const ultraTechPrizeDraw = Array.from(this.competitions.values()).find(
      comp => comp.title === 'Ultra Tech Prize Draw'
    );
    
    if (ultraTechPrizeDraw && user) {
      await this.createUserWin({
        userId: user.id,
        competitionId: ultraTechPrizeDraw.id,
        winDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        claimByDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        prizeReceived: true,
        receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Create leaderboard entries
    const leaderboardData: InsertLeaderboardEntry[] = [
      {
        userId: 1, // John Smith
        rank: 8,
        entries: 86,
        wins: 3,
        winRate: 35, // 3.5%
        streak: 1
      }
    ];
    
    // Create other users for leaderboard
    const otherUsers = [
      { username: 'MasterComper', rank: 1, entries: 247, wins: 32, winRate: 130, streak: 14, isPremium: true },
      { username: 'LuckyWinner', rank: 2, entries: 198, wins: 28, winRate: 141, streak: 8, isPremium: true },
      { username: 'PrizeHunter', rank: 3, entries: 176, wins: 21, winRate: 119, streak: 5, isPremium: false },
      { username: 'GiveawayGuru', rank: 4, entries: 145, wins: 18, winRate: 124, streak: 3, isPremium: true },
      { username: 'ContestKing', rank: 5, entries: 132, wins: 15, winRate: 114, streak: 2, isPremium: false },
      { username: 'SweepstakesPro', rank: 6, entries: 115, wins: 11, winRate: 96, streak: 4, isPremium: true },
      { username: 'LotteryLover', rank: 7, entries: 92, wins: 7, winRate: 76, streak: 0, isPremium: false }
    ];
    
    for (const userData of otherUsers) {
      const newUser = await this.createUser({
        username: userData.username,
        password: 'password', // This would be hashed in a real app
        email: `${userData.username.toLowerCase()}@example.com`
      });
      
      // Update user's premium status
      if (userData.isPremium) {
        this.users.set(newUser.id, { ...newUser, isPremium: true });
      }
      
      // Create leaderboard entry
      await this.createLeaderboardEntry({
        userId: newUser.id,
        rank: userData.rank,
        entries: userData.entries,
        wins: userData.wins,
        winRate: userData.winRate,
        streak: userData.streak
      });
    }
    
    // Add the actual user to the leaderboard
    for (const data of leaderboardData) {
      await this.createLeaderboardEntry(data);
    }
  }
  
  // Helper method for leaderboard
  private async createLeaderboardEntry(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const id = this.leaderboardIdCounter++;
    const now = new Date();
    const entry: LeaderboardEntry = { ...insertEntry, id, updatedAt: now };
    this.leaderboardEntries.set(id, entry);
    return entry;
  }
}

// Switch from MemStorage to DatabaseStorage
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
