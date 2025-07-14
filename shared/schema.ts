import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  round1: integer("round1").default(0),
  round2: integer("round2").default(0),
  round3: integer("round3").default(0),
  totalScore: integer("total_score").default(0),
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
  uploadedAt: timestamp("uploaded_at").defaultNow(),
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

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type SideBet = typeof sideBets.$inferSelect;
export type InsertSideBet = z.infer<typeof insertSideBetSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
