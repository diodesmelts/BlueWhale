import { and, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  User, InsertUser, Competition, InsertCompetition, 
  UserEntry, InsertUserEntry, UserWin, InsertUserWin, 
  LeaderboardEntry, InsertLeaderboardEntry,
  users, competitions, userEntries, userWins, leaderboard
} from "@shared/schema";
import { IStorage } from "./storage";
import { UserStats, LeaderboardUser, CompetitionWithEntryStatus } from "@shared/types";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export class DatabaseStorage implements IStorage {
  // Create a session store that connects to PostgreSQL
  public sessionStore: session.Store = new (connectPg(session))({
    pool,
    tableName: 'session', // Default session table name
    createTableIfMissing: true
  });
  
  constructor() {
    // Initialize database and run migrations if needed
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Competition methods
  async getCompetition(id: number): Promise<Competition | undefined> {
    const results = await db.select().from(competitions).where(eq(competitions.id, id));
    return results[0];
  }
  
  async listCompetitions(
    filter?: { platform?: string; type?: string; },
    sort?: string,
    tab?: string,
    includeDeleted: boolean = false
  ): Promise<Competition[]> {
    // Start with a base query
    let query = db.select().from(competitions);
    
    // Filter out deleted competitions unless includeDeleted is true
    if (!includeDeleted) {
      query = query.where(eq(competitions.isDeleted, false));
    }
    
    // Apply platform and type filters if provided
    if (filter) {
      if (filter.platform && filter.platform !== 'all') {
        query = query.where(eq(competitions.platform, filter.platform));
      }
      
      if (filter.type && filter.type !== 'all') {
        query = query.where(eq(competitions.type, filter.type));
      }
    }
    
    // Apply tab filters
    if (tab) {
      const now = new Date();
      
      if (tab === 'ending-soon') {
        // Competitions ending in the next 3 days
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
        query = query.where(
          and(
            gte(competitions.endDate, now),
            lte(competitions.endDate, threeDaysFromNow)
          )
        );
      } else if (tab === 'high-value') {
        // Competitions with prize >= 1000
        query = query.where(gte(competitions.prize, 1000));
      }
    }
    
    // Apply sorting
    if (sort) {
      if (sort === 'endDate') {
        query = query.orderBy(competitions.endDate);
      } else if (sort === 'prizeValue') {
        query = query.orderBy(desc(competitions.prize));
      } else if (sort === 'newest') {
        query = query.orderBy(desc(competitions.createdAt));
      } else {
        // Default to popularity (entries)
        query = query.orderBy(desc(competitions.entries));
      }
    } else {
      // Default sort by popularity
      query = query.orderBy(desc(competitions.entries));
    }
    
    return await query;
  }
  
  async createCompetition(competitionData: InsertCompetition): Promise<Competition> {
    const result = await db.insert(competitions).values(competitionData).returning();
    return result[0];
  }
  
  async updateCompetition(id: number, data: Partial<Competition>): Promise<Competition | undefined> {
    const result = await db.update(competitions)
      .set(data)
      .where(eq(competitions.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCompetition(id: number): Promise<boolean> {
    // Soft delete - mark as deleted rather than removing
    const result = await db.update(competitions)
      .set({ isDeleted: true })
      .where(eq(competitions.id, id))
      .returning();
    return result.length > 0;
  }
  
  // User Entry methods
  async getUserEntries(userId: number): Promise<UserEntry[]> {
    return await db.select()
      .from(userEntries)
      .where(eq(userEntries.userId, userId));
  }
  
  async getUserEntry(userId: number, competitionId: number): Promise<UserEntry | undefined> {
    const results = await db.select()
      .from(userEntries)
      .where(
        and(
          eq(userEntries.userId, userId),
          eq(userEntries.competitionId, competitionId)
        )
      );
    return results[0];
  }
  
  async createUserEntry(entryData: InsertUserEntry): Promise<UserEntry> {
    const result = await db.insert(userEntries).values(entryData).returning();
    return result[0];
  }
  
  async updateUserEntry(id: number, data: Partial<UserEntry>): Promise<UserEntry> {
    const result = await db.update(userEntries)
      .set(data)
      .where(eq(userEntries.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User entry with ID ${id} not found`);
    }
    
    return result[0];
  }
  
  // User Win methods
  async getUserWins(userId: number): Promise<UserWin[]> {
    return await db.select()
      .from(userWins)
      .where(eq(userWins.userId, userId));
  }
  
  async createUserWin(winData: InsertUserWin): Promise<UserWin> {
    const result = await db.insert(userWins).values(winData).returning();
    return result[0];
  }
  
  async updateUserWin(id: number, data: Partial<UserWin>): Promise<UserWin> {
    const result = await db.update(userWins)
      .set(data)
      .where(eq(userWins.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error(`User win with ID ${id} not found`);
    }
    
    return result[0];
  }
  
  // Stats and Leaderboard
  async getUserStats(userId: number): Promise<UserStats> {
    // Get all entries for this user
    const entries = await this.getUserEntries(userId);
    const wins = await this.getUserWins(userId);
    
    // Calculate active entries (competitions that haven't ended yet)
    const now = new Date();
    let activeEntries = 0;
    
    for (const entry of entries) {
      const competition = await this.getCompetition(entry.competitionId);
      if (competition && new Date(competition.endDate) > now) {
        activeEntries++;
      }
    }
    
    // Calculate total win value
    let totalWinValue = 0;
    for (const win of wins) {
      const competition = await this.getCompetition(win.competitionId);
      if (competition) {
        totalWinValue += competition.prize;
      }
    }
    
    // Get last win date
    let lastWinDate = null;
    if (wins.length > 0) {
      // Find most recent win
      let mostRecentWin = wins[0];
      for (const win of wins) {
        if (win.winDate && (!mostRecentWin.winDate || new Date(win.winDate) > new Date(mostRecentWin.winDate))) {
          mostRecentWin = win;
        }
      }
      lastWinDate = mostRecentWin.winDate ? mostRecentWin.winDate.toISOString() : null;
    }
    
    return {
      activeEntries,
      totalEntries: entries.length,
      totalWins: wins.length,
      totalWinValue,
      winRate: entries.length ? Math.round((wins.length / entries.length) * 1000) / 10 : 0,
      lastWinDate
    };
  }
  
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    // Get leaderboard entries sorted by rank
    const leaderboardEntries = await db.select()
      .from(leaderboard)
      .orderBy(leaderboard.rank);
    
    // Map to LeaderboardUser type with user details
    const results: LeaderboardUser[] = [];
    
    for (const entry of leaderboardEntries) {
      const user = await this.getUser(entry.userId);
      if (user) {
        const initials = user.username
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        results.push({
          id: user.id,
          username: user.username,
          initials,
          isPremium: !!user.isPremium,
          rank: entry.rank,
          entries: entry.entries,
          wins: entry.wins,
          winRate: entry.winRate / 10, // Convert from stored format (125) to display format (12.5)
          streak: entry.streak
        });
      }
    }
    
    return results;
  }
  
  // Combined queries
  async getCompetitionsWithUserStatus(
    userId: number,
    filter?: { platform?: string; type?: string; },
    sort?: string,
    tab?: string
  ): Promise<CompetitionWithEntryStatus[]> {
    // Get base competitions list - never include deleted ones
    let competitions = await this.listCompetitions(filter, sort, tab, false);
    
    // If tab is "my-entries", filter to only user's entered competitions
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
        endDate: competition.endDate.toISOString(),
        createdAt: competition.createdAt ? competition.createdAt.toISOString() : new Date().toISOString(),
        isEntered: !!userEntry,
        entryProgress: userEntry?.entryProgress || [],
        isBookmarked: !!userEntry?.isBookmarked,
        isLiked: !!userEntry?.isLiked,
        ticketCount: userEntry?.ticketCount || 0,
        ticketNumbers: userEntry?.ticketNumbers || [],
        // Win info if applicable
        winDate: userWin?.winDate ? userWin.winDate.toISOString() : undefined,
        claimByDate: userWin?.claimByDate ? userWin.claimByDate.toISOString() : undefined,
        prizeReceived: !!userWin?.prizeReceived,
        receivedDate: userWin?.receivedDate ? userWin.receivedDate.toISOString() : undefined
      };
    });
  }
}