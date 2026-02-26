import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, numeric, uniqueIndex } from "drizzle-orm/pg-core";
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
  handicap: integer("handicap").default(20),
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
  player3Name: text("player3_name"), // Optional third player for 3-person teams
  player3Handicap: integer("player3_handicap"), // Optional third player handicap
  isThreePersonTeam: boolean("is_three_person_team").default(false), // Flag for 3-person teams
  totalHandicap: integer("total_handicap").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round1Points: integer("round1_points").default(0),
  round2Points: integer("round2_points").default(0),
  round3Points: integer("round3_points").default(0),
  matchPlayPoints: integer("match_play_points").default(0),
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
  status: text("status").default("Pending"), // Pending, Accepted, Declined, Partially Accepted
  result: text("result").default("Pending"), // Pending, Won, Lost, Push
  winnerName: text("winner_name"), // Winner decided by witnesses or admin
  witnessVotes: jsonb("witness_votes").default('{}'), // JSON object tracking witness votes
  readyForResolution: boolean("ready_for_resolution").default(false), // True after round is complete
  // Team-based bet fields
  isTeamBet: boolean("is_team_bet").default(false),
  betterTeammate: text("better_teammate"), // Name of teammate if team bet
  opponentTeammate: text("opponent_teammate"), // Name of opponent teammate if team bet
  teammateAccepted: boolean("teammate_accepted").default(false), // Has the opponent teammate accepted?
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  caption: text("caption").default(""),
  imageUrl: text("image_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Round 3 Match Play - 6-hole matches between players
export const matchPlayMatches = pgTable("match_play_matches", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull().default(3), // Always 3 for match play
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").notNull().references(() => users.id),
  groupNumber: integer("group_number").notNull(), // 1-4 for the foursomes
  holeSegment: varchar("hole_segment", { length: 10 }).notNull(), // "1-6", "7-12", "13-18"
  startHole: integer("start_hole").notNull(), // 1, 7, or 13
  endHole: integer("end_hole").notNull(), // 6, 12, or 18
  handicapDifference: integer("handicap_difference").notNull(),
  strokesGiven: integer("strokes_given").notNull().default(0),
  strokeRecipientId: integer("stroke_recipient_id").references(() => users.id),
  strokeHoles: jsonb("stroke_holes").default('[]'), // Array of hole numbers where strokes apply
  player1NetScore: integer("player1_net_score"),
  player2NetScore: integer("player2_net_score"),
  winnerId: integer("winner_id").references(() => users.id),
  result: varchar("result", { length: 10 }), // "player1_win", "player2_win", "tie"
  pointsAwarded: jsonb("points_awarded").default('{"player1": 0, "player2": 0}'), // JSON with point allocation
  matchStatus: varchar("match_status", { length: 20 }).default("pending"), // "pending", "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Round 3 Groups (foursomes) for match play
export const matchPlayGroups = pgTable("match_play_groups", {
  id: serial("id").primaryKey(),
  groupNumber: integer("group_number").notNull(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").notNull().references(() => users.id),
  player3Id: integer("player3_id").notNull().references(() => users.id),
  player4Id: integer("player4_id").notNull().references(() => users.id),
  player1Name: varchar("player1_name", { length: 100 }).notNull(),
  player2Name: varchar("player2_name", { length: 100 }).notNull(),
  player3Name: varchar("player3_name", { length: 100 }).notNull(),
  player4Name: varchar("player4_name", { length: 100 }).notNull(),
  player1Handicap: integer("player1_handicap").notNull(),
  player2Handicap: integer("player2_handicap").notNull(),
  player3Handicap: integer("player3_handicap").notNull(),
  player4Handicap: integer("player4_handicap").notNull(),
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
  // Golf statistics
  fairwayInRegulation: boolean("fairway_in_regulation"), // null for par 3s
  greenInRegulation: boolean("green_in_regulation").default(false),
  driveDirection: varchar("drive_direction", { length: 10 }), // 'left', 'right', 'long', 'short', 'duff', 'hit'
  putts: integer("putts").default(0),
  penalties: integer("penalties").default(0),
  sandSaves: integer("sand_saves").default(0),
  upAndDowns: integer("up_and_downs").default(0),
  tournamentYear: integer("tournament_year").default(2025),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournament definitions for multi-year support
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  name: text("name").notNull(),
  courses: text("courses").array().notNull(), // Array of course names
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false), // Only one tournament can be active at a time
  champions: text("champions").array(), // Array of champion names
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player tournament history table for multi-year tracking
export const playerTournamentHistory = pgTable("player_tournament_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  tournamentYear: integer("tournament_year").notNull(),
  teamPartner: text("team_partner").notNull(),
  finalRanking: integer("final_ranking"),
  totalPoints: integer("total_points").default(0),
  round1Points: integer("round1_points").default(0),
  round2Points: integer("round2_points").default(0),
  round3Points: integer("round3_points").default(0),
  isChampion: boolean("is_champion").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentYear: integer("tournament_year").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  entryPaid: boolean("entry_paid").default(false),
  entryPaymentIntentId: text("entry_payment_intent_id"),
  entryAmountCents: integer("entry_amount_cents").default(15000),
  ctpRound1Paid: boolean("ctp_round1_paid").default(false),
  ctpRound2Paid: boolean("ctp_round2_paid").default(false),
  ctpRound3Paid: boolean("ctp_round3_paid").default(false),
  ctpPaymentIntentIds: jsonb("ctp_payment_intent_ids").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserTournament: uniqueIndex("registrations_user_year_unique").on(table.userId, table.tournamentYear),
}));

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  opponentId: integer("opponent_id").references(() => users.id),
  tournamentYear: integer("tournament_year").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  type: text("type").default("custom"),
  round: integer("round"),
  hole: integer("hole"),
  status: text("status").default("open"),
  creatorPaymentIntentId: text("creator_payment_intent_id"),
  opponentPaymentIntentId: text("opponent_payment_intent_id"),
  winnerId: integer("winner_id").references(() => users.id),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shots = pgTable("shots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentYear: integer("tournament_year").notNull(),
  round: integer("round").notNull(),
  hole: integer("hole").notNull(),
  shotNumber: integer("shot_number").notNull(),
  lat: numeric("lat", { precision: 10, scale: 8 }),
  lng: numeric("lng", { precision: 11, scale: 8 }),
  accuracyMeters: numeric("accuracy_meters", { precision: 6, scale: 2 }),
  detectedBy: text("detected_by").default("motion"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournamentVotes = pgTable("tournament_votes", {
  id: serial("id").primaryKey(),
  tournamentYear: integer("tournament_year").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open"),
  deadline: timestamp("deadline"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  winningOptionId: integer("winning_option_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voteOptions = pgTable("vote_options", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => tournamentVotes.id),
  optionText: text("option_text").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerVotes = pgTable("player_votes", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => tournamentVotes.id),
  userId: integer("user_id").notNull().references(() => users.id),
  optionId: integer("option_id").notNull().references(() => voteOptions.id),
  votedAt: timestamp("voted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueVoteUser: uniqueIndex("player_votes_vote_user_unique").on(table.voteId, table.userId),
}));

export const guestApplications = pgTable("guest_applications", {
  id: serial("id").primaryKey(),
  applicantUserId: integer("applicant_user_id").notNull().references(() => users.id),
  guestName: text("guest_name").notNull(),
  guestRelationship: text("guest_relationship"),
  reason: text("reason"),
  status: text("status").default("pending"),
  tournamentYear: integer("tournament_year").notNull(),
  votesYes: integer("votes_yes").default(0),
  votesNo: integer("votes_no").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guestApplicationVotes = pgTable("guest_application_votes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => guestApplications.id),
  voterUserId: integer("voter_user_id").notNull().references(() => users.id),
  vote: text("vote").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueApplicationVoter: uniqueIndex("guest_application_votes_application_voter_unique").on(table.applicationId, table.voterUserId),
}));

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

export const insertMatchPlayMatchSchema = createInsertSchema(matchPlayMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchPlayGroupSchema = createInsertSchema(matchPlayGroups).omit({
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
})

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayerTournamentHistorySchema = createInsertSchema(playerTournamentHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
});

export const insertShotSchema = createInsertSchema(shots).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentVoteSchema = createInsertSchema(tournamentVotes).omit({
  id: true,
  createdAt: true,
});

export const insertVoteOptionSchema = createInsertSchema(voteOptions).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerVoteSchema = createInsertSchema(playerVotes).omit({
  id: true,
  createdAt: true,
});

export const insertGuestApplicationSchema = createInsertSchema(guestApplications).omit({
  id: true,
  createdAt: true,
});

export const insertGuestApplicationVoteSchema = createInsertSchema(guestApplicationVotes).omit({
  id: true,
  createdAt: true,
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
export type MatchPlayMatch = typeof matchPlayMatches.$inferSelect;
export type InsertMatchPlayMatch = z.infer<typeof insertMatchPlayMatchSchema>;
export type MatchPlayGroup = typeof matchPlayGroups.$inferSelect;
export type InsertMatchPlayGroup = z.infer<typeof insertMatchPlayGroupSchema>;
export type HoleScore = typeof holeScores.$inferSelect;
export type InsertHoleScore = z.infer<typeof insertHoleScoreSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type PlayerTournamentHistory = typeof playerTournamentHistory.$inferSelect;
export type InsertPlayerTournamentHistory = z.infer<typeof insertPlayerTournamentHistorySchema>;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Shot = typeof shots.$inferSelect;
export type InsertShot = z.infer<typeof insertShotSchema>;
export type TournamentVote = typeof tournamentVotes.$inferSelect;
export type InsertTournamentVote = z.infer<typeof insertTournamentVoteSchema>;
export type VoteOption = typeof voteOptions.$inferSelect;
export type InsertVoteOption = z.infer<typeof insertVoteOptionSchema>;
export type PlayerVote = typeof playerVotes.$inferSelect;
export type InsertPlayerVote = z.infer<typeof insertPlayerVoteSchema>;
export type GuestApplication = typeof guestApplications.$inferSelect;
export type InsertGuestApplication = z.infer<typeof insertGuestApplicationSchema>;
export type GuestApplicationVote = typeof guestApplicationVotes.$inferSelect;
export type InsertGuestApplicationVote = z.infer<typeof insertGuestApplicationVoteSchema>;



// Chat Messages for Trash Talk
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  taggedUserIds: jsonb("tagged_user_ids").default('[]'), // Array of user IDs that are tagged
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Boozelympics tables
export const boozelympicsGames = pgTable("boozelympics_games", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").notNull(),
  supplies: text("supplies").notNull(),
  playersNeeded: varchar("players_needed", { length: 20 }).notNull(),
  timeEstimate: varchar("time_estimate", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const boozelympicsMatches = pgTable("boozelympics_matches", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => boozelympicsGames.id),
  player1Id: integer("player1_id").references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id),
  team1Id: integer("team1_id").references(() => teams.id),
  team2Id: integer("team2_id").references(() => teams.id),
  winnerId: integer("winner_id").references(() => users.id),
  winnerTeamId: integer("winner_team_id").references(() => teams.id),
  points: integer("points").default(0),
  bonusPoints: integer("bonus_points").default(0),
  mvpId: integer("mvp_id").references(() => users.id),
  matchData: jsonb("match_data").default('{}'), // Store game-specific data
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Simple Golf Relay timer matches
export const golfRelayMatches = pgTable("golf_relay_matches", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  timeMs: integer("time_ms").notNull(), // total time in milliseconds
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBoozelympicsGameSchema = createInsertSchema(boozelympicsGames).omit({
  id: true,
  createdAt: true,
});

export const insertBoozelympicsMatchSchema = createInsertSchema(boozelympicsMatches).omit({
  id: true,
  createdAt: true,
});

export const insertGolfRelayMatchSchema = createInsertSchema(golfRelayMatches).omit({
  id: true,
  createdAt: true,
});

export type BoozelympicsGame = typeof boozelympicsGames.$inferSelect;
export type InsertBoozelympicsGame = z.infer<typeof insertBoozelympicsGameSchema>;
export type BoozelympicsMatch = typeof boozelympicsMatches.$inferSelect;
export type InsertBoozelympicsMatch = z.infer<typeof insertBoozelympicsMatchSchema>;
export type GolfRelayMatch = typeof golfRelayMatches.$inferSelect;
export type InsertGolfRelayMatch = z.infer<typeof insertGolfRelayMatchSchema>;

// Tournament matchups table
export const matchups = pgTable("matchups", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id), // Allow null for solo players
  player1Name: varchar("player1_name", { length: 100 }).notNull(),
  player2Name: varchar("player2_name", { length: 100 }), // Allow null for solo players
  player1Score: integer("player1_score").default(0),
  player2Score: integer("player2_score").default(0),
  groupNumber: integer("group_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchupSchema = createInsertSchema(matchups).omit({
  id: true,
  createdAt: true,
});

export type Matchup = typeof matchups.$inferSelect;
export type InsertMatchup = z.infer<typeof insertMatchupSchema>;
