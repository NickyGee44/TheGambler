import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for user sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for player authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  password: varchar("password").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  teamNumber: integer("team_number").notNull().unique(),
  player1Name: text("player1_name").notNull(),
  player1Handicap: integer("player1_handicap").notNull(),
  player2Name: text("player2_name").notNull(),
  player2Handicap: integer("player2_handicap").notNull(),
  totalHandicap: integer("total_handicap").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round1Points: integer("round1_points").default(0),
  round2Points: integer("round2_points").default(0),
  round3Points: integer("round3_points").default(0),
  totalPoints: integer("total_points").default(0),
  rank: integer("rank").default(8),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sideBets = pgTable("side_bets", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  betterName: text("better_name").notNull(),
  opponentName: text("opponent_name").notNull(),
  amount: integer("amount").notNull(),
  condition: text("condition").notNull(),
  result: text("result").default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  caption: text("caption").default(""),
  imageUrl: text("image_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const matchups = pgTable("matchups", {
  id: serial("id").primaryKey(),
  foursome: text("foursome").notNull(),
  player1: text("player1").notNull(),
  player2: text("player2").notNull(),
  holes: text("holes").notNull(),
  strokesDescription: text("strokes_description").notNull(),
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  winner: text("winner"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hole-by-hole scoring for each player
export const holeScores = pgTable("hole_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round: integer("round").notNull(), // 1, 2, or 3
  hole: integer("hole").notNull(), // 1-18
  strokes: integer("strokes").notNull(),
  par: integer("par").notNull().default(4),
  handicap: integer("handicap").notNull().default(0),
  netScore: integer("net_score").notNull(), // strokes - handicap
  points: integer("points").notNull().default(0), // Stableford points
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  updatedAt: true,
});

export const insertSideBetSchema = createInsertSchema(sideBets).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const insertMatchupSchema = createInsertSchema(matchups).omit({
  id: true,
  createdAt: true,
});

export const insertHoleScoreSchema = createInsertSchema(holeScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type SideBet = typeof sideBets.$inferSelect;
export type InsertSideBet = z.infer<typeof insertSideBetSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Matchup = typeof matchups.$inferSelect;
export type InsertMatchup = z.infer<typeof insertMatchupSchema>;
export type HoleScore = typeof holeScores.$inferSelect;
export type InsertHoleScore = z.infer<typeof insertHoleScoreSchema>;
