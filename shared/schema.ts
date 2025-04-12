import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Competition Types
export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organizer: text("organizer").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  platform: text("platform").notNull(), // instagram, facebook, tiktok, twitter, website
  type: text("type").notNull(), // giveaway, sweepstakes, contest
  prize: integer("prize").notNull(), // value in USD
  entries: integer("entries").default(0),
  eligibility: text("eligibility").notNull(), // worldwide, US only, etc.
  endDate: timestamp("end_date").notNull(),
  entrySteps: jsonb("entry_steps").notNull().$type<EntryStep[]>(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Entry Records
export const userEntries = pgTable("user_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  entryProgress: jsonb("entry_progress").notNull().$type<number[]>(), // Array of 0/1 values for each step
  isBookmarked: boolean("is_bookmarked").default(false),
  isLiked: boolean("is_liked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Wins
export const userWins = pgTable("user_wins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  winDate: timestamp("win_date").defaultNow(),
  claimByDate: timestamp("claim_by_date").notNull(),
  prizeReceived: boolean("prize_received").default(false),
  receivedDate: timestamp("received_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboard
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rank: integer("rank").notNull(),
  entries: integer("entries").notNull(),
  wins: integer("wins").notNull(),
  winRate: integer("win_rate").notNull(), // Stored as percentage * 10 (e.g. 12.5% = 125)
  streak: integer("streak").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types
export type EntryStep = {
  id: number;
  description: string;
  link?: string;
};

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertCompetitionSchema = createInsertSchema(competitions).pick({
  title: true,
  organizer: true,
  description: true,
  image: true,
  platform: true,
  type: true,
  prize: true,
  entries: true,
  eligibility: true,
  endDate: true,
  entrySteps: true,
  isVerified: true,
});

export const insertUserEntrySchema = createInsertSchema(userEntries).pick({
  userId: true,
  competitionId: true,
  entryProgress: true,
  isBookmarked: true,
  isLiked: true,
});

export const insertUserWinSchema = createInsertSchema(userWins).pick({
  userId: true,
  competitionId: true,
  winDate: true,
  claimByDate: true,
  prizeReceived: true,
  receivedDate: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).pick({
  userId: true,
  rank: true,
  entries: true,
  wins: true,
  winRate: true,
  streak: true,
});

// Exported Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;

export type UserEntry = typeof userEntries.$inferSelect;
export type InsertUserEntry = z.infer<typeof insertUserEntrySchema>;

export type UserWin = typeof userWins.$inferSelect;
export type InsertUserWin = z.infer<typeof insertUserWinSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
