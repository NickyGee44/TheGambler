var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/courseData.ts
var courseData_exports = {};
__export(courseData_exports, {
  calculateDistanceInYards: () => calculateDistanceInYards,
  deerhurstCourse: () => deerhurstCourse,
  deerhurstGPSCoordinates: () => deerhurstGPSCoordinates,
  getCourseForRound: () => getCourseForRound,
  getHoleCoordinates: () => getHoleCoordinates,
  muskokaBayCourse: () => muskokaBayCourse
});
var deerhurstCourse, muskokaBayCourse, deerhurstGPSCoordinates, getHoleCoordinates, calculateDistanceInYards, getCourseForRound;
var init_courseData = __esm({
  "shared/courseData.ts"() {
    "use strict";
    deerhurstCourse = {
      name: "Deerhurst Highlands Golf Course",
      location: "Huntsville, Ontario",
      holes: [
        { number: 1, par: 4, yardage: 374, handicap: 13 },
        { number: 2, par: 4, yardage: 465, handicap: 1 },
        { number: 3, par: 3, yardage: 201, handicap: 15 },
        { number: 4, par: 4, yardage: 319, handicap: 17 },
        { number: 5, par: 5, yardage: 601, handicap: 3 },
        { number: 6, par: 4, yardage: 390, handicap: 7 },
        { number: 7, par: 5, yardage: 490, handicap: 9 },
        { number: 8, par: 3, yardage: 231, handicap: 11 },
        { number: 9, par: 4, yardage: 402, handicap: 5 },
        { number: 10, par: 4, yardage: 464, handicap: 2 },
        { number: 11, par: 4, yardage: 450, handicap: 4 },
        { number: 12, par: 3, yardage: 212, handicap: 16 },
        { number: 13, par: 4, yardage: 355, handicap: 14 },
        { number: 14, par: 5, yardage: 523, handicap: 12 },
        { number: 15, par: 4, yardage: 411, handicap: 8 },
        { number: 16, par: 4, yardage: 375, handicap: 10 },
        { number: 17, par: 3, yardage: 195, handicap: 18 },
        { number: 18, par: 5, yardage: 553, handicap: 6 }
      ],
      totalPar: 72,
      totalYardage: 7031,
      courseRating: 73.8
    };
    muskokaBayCourse = {
      name: "Muskoka Bay Club",
      location: "Gravenhurst, Ontario",
      holes: [
        { number: 1, par: 4, yardage: 392, handicap: 9 },
        { number: 2, par: 3, yardage: 181, handicap: 15 },
        { number: 3, par: 4, yardage: 399, handicap: 5 },
        { number: 4, par: 4, yardage: 319, handicap: 13 },
        { number: 5, par: 5, yardage: 516, handicap: 1 },
        { number: 6, par: 3, yardage: 203, handicap: 17 },
        { number: 7, par: 4, yardage: 409, handicap: 11 },
        { number: 8, par: 5, yardage: 494, handicap: 3 },
        { number: 9, par: 4, yardage: 390, handicap: 7 },
        { number: 10, par: 4, yardage: 408, handicap: 8 },
        { number: 11, par: 3, yardage: 173, handicap: 18 },
        { number: 12, par: 5, yardage: 539, handicap: 4 },
        { number: 13, par: 4, yardage: 370, handicap: 16 },
        { number: 14, par: 5, yardage: 560, handicap: 2 },
        { number: 15, par: 4, yardage: 445, handicap: 6 },
        { number: 16, par: 4, yardage: 440, handicap: 12 },
        { number: 17, par: 3, yardage: 182, handicap: 14 },
        { number: 18, par: 4, yardage: 429, handicap: 10 }
      ],
      totalPar: 72,
      totalYardage: 6911,
      courseRating: 72.4
    };
    deerhurstGPSCoordinates = [
      { hole: 1, tee: { latitude: 45.34616103620428, longitude: -79.14535801798596 }, green: { latitude: 45.3443222916284, longitude: -79.14852083567796 } },
      { hole: 2, tee: { latitude: 45.34398102863268, longitude: -79.14943993587053 }, green: { latitude: 45.34311671149175, longitude: -79.14464895988188 } },
      { hole: 3, tee: { latitude: 45.342559040427574, longitude: -79.14457368654315 }, green: { latitude: 45.34306720909093, longitude: -79.14238132649747 } },
      { hole: 4, tee: { latitude: 45.342153238850436, longitude: -79.14239465378142 }, green: { latitude: 45.341312234785775, longitude: -79.1389537176389 } },
      { hole: 5, tee: { latitude: 45.34094504833668, longitude: -79.13863108701688 }, green: { latitude: 45.33897677364309, longitude: -79.14450043083217 } },
      { hole: 6, tee: { latitude: 45.33907426559279, longitude: -79.14531823871374 }, green: { latitude: 45.34191249016493, longitude: -79.1428569497976 } },
      { hole: 7, tee: { latitude: 45.34239991398666, longitude: -79.1447426024231 }, green: { latitude: 45.34324969895713, longitude: -79.15030512509948 } },
      { hole: 8, tee: { latitude: 45.343859241949744, longitude: -79.15093831389868 }, green: { latitude: 45.34518335653074, longitude: -79.15280679202314 } },
      { hole: 9, tee: { latitude: 45.345497803328975, longitude: -79.15132153707968 }, green: { latitude: 45.34655086516202, longitude: -79.14703617024507 } },
      { hole: 10, tee: { latitude: 45.347316997409024, longitude: -79.14429922284117 }, green: { latitude: 45.34961056181364, longitude: -79.14032469771445 } },
      { hole: 11, tee: { latitude: 45.3498078597367, longitude: -79.13939286277414 }, green: { latitude: 45.353034175006364, longitude: -79.1382612876836 } },
      { hole: 12, tee: { latitude: 45.353614889473675, longitude: -79.13856608379822 }, green: { latitude: 45.353105669806425, longitude: -79.1407678630912 } },
      { hole: 13, tee: { latitude: 45.35269133539527, longitude: -79.1418913065636 }, green: { latitude: 45.35539559784702, longitude: -79.14144423280938 } },
      { hole: 14, tee: { latitude: 45.355011913301205, longitude: -79.14257118051609 }, green: { latitude: 45.35190927644294, longitude: -79.1455617675153 } },
      { hole: 15, tee: { latitude: 45.35145249385614, longitude: -79.14526171854538 }, green: { latitude: 45.349451100924675, longitude: -79.14778290586527 } },
      { hole: 16, tee: { latitude: 45.349810757624006, longitude: -79.14829734208942 }, green: { latitude: 45.34757966849906, longitude: -79.15089998378599 } },
      { hole: 17, tee: { latitude: 45.34656124625057, longitude: -79.1510667030502 }, green: { latitude: 45.34531092168978, longitude: -79.1527587352176 } },
      { hole: 18, tee: { latitude: 45.34588458183412, longitude: -79.15103725364635 }, green: { latitude: 45.347380532587316, longitude: -79.14575116111246 } }
    ];
    getHoleCoordinates = (hole, round) => {
      if (round === 3) {
        const holeData2 = deerhurstGPSCoordinates.find((h) => h.hole === hole);
        return holeData2 || null;
      }
      const holeData = deerhurstGPSCoordinates.find((h) => h.hole === hole);
      return holeData || null;
    };
    calculateDistanceInYards = (start, end) => {
      const R = 6371;
      const dLat = (end.latitude - start.latitude) * Math.PI / 180;
      const dLon = (end.longitude - start.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      return Math.round(distanceKm * 1093.61);
    };
    getCourseForRound = (round) => {
      if (round === 3) {
        return muskokaBayCourse;
      }
      return deerhurstCourse;
    };
  }
});

// shared/tournamentConfig.ts
var tournamentConfig_exports = {};
__export(tournamentConfig_exports, {
  TOURNAMENT_CONFIG: () => TOURNAMENT_CONFIG,
  getBetDeadline: () => getBetDeadline,
  getCourseForRound: () => getCourseForRound2,
  getRoundStartTime: () => getRoundStartTime,
  getTournamentDisplayDates: () => getTournamentDisplayDates,
  getTournamentStartDate: () => getTournamentStartDate
});
var TOURNAMENT_CONFIG, getTournamentStartDate, getTournamentDisplayDates, getCourseForRound2, getRoundStartTime, getBetDeadline;
var init_tournamentConfig = __esm({
  "shared/tournamentConfig.ts"() {
    "use strict";
    TOURNAMENT_CONFIG = {
      name: "The Gambler Cup 2025",
      year: 2025,
      dates: {
        start: "2025-08-29",
        end: "2025-08-31",
        display: "August 29-31, 2025"
      },
      courses: {
        round1: {
          name: "Deerhurst Golf Course",
          location: "Muskoka",
          displayName: "Deerhurst Golf Course, Muskoka"
        },
        round2: {
          name: "Deerhurst Golf Course",
          location: "Muskoka",
          displayName: "Deerhurst Golf Course, Muskoka"
        },
        round3: {
          name: "Muskoka Bay Golf Club",
          location: "Gravenhurst",
          displayName: "Muskoka Bay Golf Club"
        }
      },
      schedule: {
        round1: {
          date: "Friday Aug 29",
          time: "1:10 PM first tee",
          course: "Deerhurst Golf Course",
          startDateTime: "2025-08-29T13:10:00-04:00"
          // 1:10 PM EDT
        },
        round2: {
          date: "Saturday Aug 30",
          time: "11:20 AM first tee",
          course: "Deerhurst Golf Course",
          startDateTime: "2025-08-30T11:20:00-04:00"
          // 11:20 AM EDT
        },
        round3: {
          date: "Sunday Aug 31",
          time: "11:30 AM first tee",
          course: "Muskoka Bay Golf Club",
          startDateTime: "2025-08-31T11:30:00-04:00"
          // 11:30 AM EDT
        }
      },
      teams: {
        count: 7,
        totalPlayers: 15,
        // 6 two-person teams (12 players) + 1 three-person team (3 players) = 15 players
        threePersonTeam: {
          teamNumber: 7,
          members: ["Nic Huxley", "Sye Ellard", "James Ogilvie"]
        }
      },
      rounds: {
        count: 3,
        types: ["Better Ball", "Scramble", "Match Play"]
      }
    };
    getTournamentStartDate = () => /* @__PURE__ */ new Date(TOURNAMENT_CONFIG.dates.start + "T08:00:00");
    getTournamentDisplayDates = () => TOURNAMENT_CONFIG.dates.display;
    getCourseForRound2 = (round) => {
      switch (round) {
        case 1:
          return TOURNAMENT_CONFIG.courses.round1;
        case 2:
          return TOURNAMENT_CONFIG.courses.round2;
        case 3:
          return TOURNAMENT_CONFIG.courses.round3;
        default:
          return TOURNAMENT_CONFIG.courses.round1;
      }
    };
    getRoundStartTime = (round) => {
      switch (round) {
        case 1:
          return new Date(TOURNAMENT_CONFIG.schedule.round1.startDateTime);
        case 2:
          return new Date(TOURNAMENT_CONFIG.schedule.round2.startDateTime);
        case 3:
          return new Date(TOURNAMENT_CONFIG.schedule.round3.startDateTime);
        default:
          return new Date(TOURNAMENT_CONFIG.schedule.round1.startDateTime);
      }
    };
    getBetDeadline = (round) => {
      const roundStart = getRoundStartTime(round);
      return new Date(roundStart.getTime() - 60 * 60 * 1e3);
    };
  }
});

// server/vercel-handler.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bets: () => bets,
  boozelympicsGames: () => boozelympicsGames,
  boozelympicsMatches: () => boozelympicsMatches,
  chatMessages: () => chatMessages,
  golfRelayMatches: () => golfRelayMatches,
  guestApplicationVotes: () => guestApplicationVotes,
  guestApplications: () => guestApplications,
  holeScores: () => holeScores,
  insertBetSchema: () => insertBetSchema,
  insertBoozelympicsGameSchema: () => insertBoozelympicsGameSchema,
  insertBoozelympicsMatchSchema: () => insertBoozelympicsMatchSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertGolfRelayMatchSchema: () => insertGolfRelayMatchSchema,
  insertGuestApplicationSchema: () => insertGuestApplicationSchema,
  insertGuestApplicationVoteSchema: () => insertGuestApplicationVoteSchema,
  insertHoleScoreSchema: () => insertHoleScoreSchema,
  insertMatchPlayGroupSchema: () => insertMatchPlayGroupSchema,
  insertMatchPlayMatchSchema: () => insertMatchPlayMatchSchema,
  insertMatchupSchema: () => insertMatchupSchema,
  insertPhotoSchema: () => insertPhotoSchema,
  insertPlayerTournamentHistorySchema: () => insertPlayerTournamentHistorySchema,
  insertPlayerVoteSchema: () => insertPlayerVoteSchema,
  insertRegistrationSchema: () => insertRegistrationSchema,
  insertScoreSchema: () => insertScoreSchema,
  insertShotSchema: () => insertShotSchema,
  insertSideBetSchema: () => insertSideBetSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertTournamentSchema: () => insertTournamentSchema,
  insertTournamentVoteSchema: () => insertTournamentVoteSchema,
  insertUserSchema: () => insertUserSchema,
  insertVoteOptionSchema: () => insertVoteOptionSchema,
  matchPlayGroups: () => matchPlayGroups,
  matchPlayMatches: () => matchPlayMatches,
  matchups: () => matchups,
  photos: () => photos,
  playerTournamentHistory: () => playerTournamentHistory,
  playerVotes: () => playerVotes,
  registrations: () => registrations,
  scores: () => scores,
  sessions: () => sessions,
  shots: () => shots,
  sideBets: () => sideBets,
  teams: () => teams,
  tournamentVotes: () => tournamentVotes,
  tournaments: () => tournaments,
  users: () => users,
  voteOptions: () => voteOptions
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  password: varchar("password").notNull(),
  profilePicture: text("profile_picture"),
  handicap: integer("handicap").default(20),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  teamNumber: integer("team_number").notNull().unique(),
  player1Name: text("player1_name").notNull(),
  player1Handicap: integer("player1_handicap").notNull(),
  player2Name: text("player2_name").notNull(),
  player2Handicap: integer("player2_handicap").notNull(),
  player3Name: text("player3_name"),
  // Optional third player for 3-person teams
  player3Handicap: integer("player3_handicap"),
  // Optional third player handicap
  isThreePersonTeam: boolean("is_three_person_team").default(false),
  // Flag for 3-person teams
  totalHandicap: integer("total_handicap").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round1Points: integer("round1_points").default(0),
  round2Points: integer("round2_points").default(0),
  round3Points: integer("round3_points").default(0),
  matchPlayPoints: integer("match_play_points").default(0),
  totalPoints: integer("total_points").default(0),
  rank: integer("rank").default(8),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sideBets = pgTable("side_bets", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  betterName: text("better_name").notNull(),
  opponentName: text("opponent_name").notNull(),
  amount: integer("amount").notNull(),
  condition: text("condition").notNull(),
  status: text("status").default("Pending"),
  // Pending, Accepted, Declined, Partially Accepted
  result: text("result").default("Pending"),
  // Pending, Won, Lost, Push
  winnerName: text("winner_name"),
  // Winner decided by witnesses or admin
  witnessVotes: jsonb("witness_votes").default("{}"),
  // JSON object tracking witness votes
  readyForResolution: boolean("ready_for_resolution").default(false),
  // True after round is complete
  // Team-based bet fields
  isTeamBet: boolean("is_team_bet").default(false),
  betterTeammate: text("better_teammate"),
  // Name of teammate if team bet
  opponentTeammate: text("opponent_teammate"),
  // Name of opponent teammate if team bet
  teammateAccepted: boolean("teammate_accepted").default(false),
  // Has the opponent teammate accepted?
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  caption: text("caption").default(""),
  imageUrl: text("image_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var matchPlayMatches = pgTable("match_play_matches", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull().default(3),
  // Always 3 for match play
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").notNull().references(() => users.id),
  groupNumber: integer("group_number").notNull(),
  // 1-4 for the foursomes
  holeSegment: varchar("hole_segment", { length: 10 }).notNull(),
  // "1-6", "7-12", "13-18"
  startHole: integer("start_hole").notNull(),
  // 1, 7, or 13
  endHole: integer("end_hole").notNull(),
  // 6, 12, or 18
  handicapDifference: integer("handicap_difference").notNull(),
  strokesGiven: integer("strokes_given").notNull().default(0),
  strokeRecipientId: integer("stroke_recipient_id").references(() => users.id),
  strokeHoles: jsonb("stroke_holes").default("[]"),
  // Array of hole numbers where strokes apply
  player1NetScore: integer("player1_net_score"),
  player2NetScore: integer("player2_net_score"),
  winnerId: integer("winner_id").references(() => users.id),
  result: varchar("result", { length: 10 }),
  // "player1_win", "player2_win", "tie"
  pointsAwarded: jsonb("points_awarded").default('{"player1": 0, "player2": 0}'),
  // JSON with point allocation
  matchStatus: varchar("match_status", { length: 20 }).default("pending"),
  // "pending", "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var matchPlayGroups = pgTable("match_play_groups", {
  id: serial("id").primaryKey(),
  groupNumber: integer("group_number").notNull().unique(),
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
  createdAt: timestamp("created_at").defaultNow()
});
var holeScores = pgTable("hole_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  round: integer("round").notNull(),
  // 1, 2, or 3
  hole: integer("hole").notNull(),
  // 1-18
  strokes: integer("strokes").notNull(),
  par: integer("par").notNull().default(4),
  handicap: integer("handicap").notNull().default(0),
  netScore: integer("net_score").notNull(),
  // strokes - handicap
  points: integer("points").notNull().default(0),
  // Stableford points
  // Golf statistics
  fairwayInRegulation: boolean("fairway_in_regulation"),
  // null for par 3s
  greenInRegulation: boolean("green_in_regulation").notNull().default(false),
  driveDirection: varchar("drive_direction", { length: 10 }),
  // 'left', 'right', 'long', 'short', 'duff', 'hit'
  putts: integer("putts").notNull().default(0),
  penalties: integer("penalties").notNull().default(0),
  sandSaves: integer("sand_saves").notNull().default(0),
  upAndDowns: integer("up_and_downs").notNull().default(0),
  tournamentYear: integer("tournament_year").default(2025),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  name: text("name").notNull(),
  courses: text("courses").array().notNull(),
  // Array of course names
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  // Only one tournament can be active at a time
  champions: text("champions").array(),
  // Array of champion names
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var playerTournamentHistory = pgTable("player_tournament_history", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentYear: integer("tournament_year").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  entryPaid: boolean("entry_paid").default(false),
  entryPaymentIntentId: text("entry_payment_intent_id"),
  entryAmountCents: integer("entry_amount_cents").default(15e3),
  ctpRound1Paid: boolean("ctp_round1_paid").default(false),
  ctpRound2Paid: boolean("ctp_round2_paid").default(false),
  ctpRound3Paid: boolean("ctp_round3_paid").default(false),
  ctpPaymentIntentIds: jsonb("ctp_payment_intent_ids").default("{}"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueUserTournament: uniqueIndex("registrations_user_year_unique").on(table.userId, table.tournamentYear)
}));
var bets = pgTable("bets", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var shots = pgTable("shots", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var tournamentVotes = pgTable("tournament_votes", {
  id: serial("id").primaryKey(),
  tournamentYear: integer("tournament_year").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("open"),
  deadline: timestamp("deadline"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  winningOptionId: integer("winning_option_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var voteOptions = pgTable("vote_options", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => tournamentVotes.id),
  optionText: text("option_text").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var playerVotes = pgTable("player_votes", {
  id: serial("id").primaryKey(),
  voteId: integer("vote_id").notNull().references(() => tournamentVotes.id),
  userId: integer("user_id").notNull().references(() => users.id),
  optionId: integer("option_id").notNull().references(() => voteOptions.id),
  votedAt: timestamp("voted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueVoteUser: uniqueIndex("player_votes_vote_user_unique").on(table.voteId, table.userId)
}));
var guestApplications = pgTable("guest_applications", {
  id: serial("id").primaryKey(),
  applicantUserId: integer("applicant_user_id").notNull().references(() => users.id),
  guestName: text("guest_name").notNull(),
  guestRelationship: text("guest_relationship"),
  reason: text("reason"),
  status: text("status").default("pending"),
  tournamentYear: integer("tournament_year").notNull(),
  votesYes: integer("votes_yes").default(0),
  votesNo: integer("votes_no").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var guestApplicationVotes = pgTable("guest_application_votes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => guestApplications.id),
  voterUserId: integer("voter_user_id").notNull().references(() => users.id),
  vote: text("vote").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueApplicationVoter: uniqueIndex("guest_application_votes_application_voter_unique").on(table.applicationId, table.voterUserId)
}));
var insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true
});
var insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  updatedAt: true
});
var insertSideBetSchema = createInsertSchema(sideBets).omit({
  id: true,
  createdAt: true
});
var insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true
});
var insertMatchPlayMatchSchema = createInsertSchema(matchPlayMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMatchPlayGroupSchema = createInsertSchema(matchPlayGroups).omit({
  id: true,
  createdAt: true
});
var insertHoleScoreSchema = createInsertSchema(holeScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPlayerTournamentHistorySchema = createInsertSchema(playerTournamentHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true
});
var insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true
});
var insertShotSchema = createInsertSchema(shots).omit({
  id: true,
  createdAt: true
});
var insertTournamentVoteSchema = createInsertSchema(tournamentVotes).omit({
  id: true,
  createdAt: true
});
var insertVoteOptionSchema = createInsertSchema(voteOptions).omit({
  id: true,
  createdAt: true
});
var insertPlayerVoteSchema = createInsertSchema(playerVotes).omit({
  id: true,
  createdAt: true
});
var insertGuestApplicationSchema = createInsertSchema(guestApplications).omit({
  id: true,
  createdAt: true
});
var insertGuestApplicationVoteSchema = createInsertSchema(guestApplicationVotes).omit({
  id: true,
  createdAt: true
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  taggedUserIds: jsonb("tagged_user_ids").default("[]"),
  // Array of user IDs that are tagged
  createdAt: timestamp("created_at").defaultNow()
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var boozelympicsGames = pgTable("boozelympics_games", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").notNull(),
  supplies: text("supplies").notNull(),
  playersNeeded: varchar("players_needed", { length: 20 }).notNull(),
  timeEstimate: varchar("time_estimate", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var boozelympicsMatches = pgTable("boozelympics_matches", {
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
  matchData: jsonb("match_data").default("{}"),
  // Store game-specific data
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var golfRelayMatches = pgTable("golf_relay_matches", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  timeMs: integer("time_ms").notNull(),
  // total time in milliseconds
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertBoozelympicsGameSchema = createInsertSchema(boozelympicsGames).omit({
  id: true,
  createdAt: true
});
var insertBoozelympicsMatchSchema = createInsertSchema(boozelympicsMatches).omit({
  id: true,
  createdAt: true
});
var insertGolfRelayMatchSchema = createInsertSchema(golfRelayMatches).omit({
  id: true,
  createdAt: true
});
var matchups = pgTable("matchups", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").references(() => users.id),
  // Allow null for solo players
  player1Name: varchar("player1_name", { length: 100 }).notNull(),
  player2Name: varchar("player2_name", { length: 100 }),
  // Allow null for solo players
  player1Score: integer("player1_score").default(0),
  player2Score: integer("player2_score").default(0),
  groupNumber: integer("group_number"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertMatchupSchema = createInsertSchema(matchups).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
init_courseData();
import { eq, and, asc, or, sql } from "drizzle-orm";
import memoize from "memoizee";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByName(firstName, lastName) {
    const [user] = await db.select().from(users).where(
      and(eq(users.firstName, firstName), eq(users.lastName, lastName))
    );
    return user;
  }
  async getUserByFullName(fullName) {
    const [firstName, lastName] = fullName.split(" ");
    return await this.getUserByName(firstName, lastName);
  }
  async getAllUsers() {
    const allUsers = await db.select().from(users);
    return allUsers;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async updateUser(userId, updateData) {
    const [updatedUser] = await db.update(users).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async findPlayerByName(firstName, lastName) {
    const allTeams = await db.select().from(teams);
    const user = await this.getUserByName(firstName, lastName);
    if (!user) {
      return null;
    }
    for (const team of allTeams) {
      if (team.player1Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 1, handicap: user.handicap || 0 };
      }
      if (team.player2Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 2, handicap: user.handicap || 0 };
      }
      if (team.player3Name && team.player3Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 3, handicap: user.handicap || 0 };
      }
    }
    return null;
  }
  // Tournament management
  async getTournaments() {
    return await db.select().from(tournaments).orderBy(asc(tournaments.year));
  }
  async getActiveTournament() {
    const [activeTournament] = await db.select().from(tournaments).where(eq(tournaments.isActive, true));
    return activeTournament || null;
  }
  async getTournamentByYear(year) {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.year, year));
    return tournament || null;
  }
  async createTournament(tournament) {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }
  async updateTournament(year, updateData) {
    const [updatedTournament] = await db.update(tournaments).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tournaments.year, year)).returning();
    return updatedTournament;
  }
  async setActiveTournament(year) {
    await db.update(tournaments).set({ isActive: false });
    const [activeTournament] = await db.update(tournaments).set({ isActive: true }).where(eq(tournaments.year, year)).returning();
    return activeTournament;
  }
  // Player Tournament History
  async getPlayerTournamentHistory(userId) {
    return await db.select().from(playerTournamentHistory).where(eq(playerTournamentHistory.userId, userId));
  }
  async createPlayerTournamentHistory(history) {
    const [newHistory] = await db.insert(playerTournamentHistory).values(history).returning();
    return newHistory;
  }
  async updatePlayerTournamentHistory(userId, year, data) {
    const [updatedHistory] = await db.update(playerTournamentHistory).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(playerTournamentHistory.userId, userId), eq(playerTournamentHistory.tournamentYear, year))).returning();
    return updatedHistory;
  }
  // Enhanced Player Statistics with historical data
  async getPlayerLifetimeStats(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const allHoleScores = await db.select().from(holeScores).where(eq(holeScores.userId, userId));
    const tournamentHistory = await this.getPlayerTournamentHistory(userId);
    const totalHoles = allHoleScores.length;
    const totalStrokes = allHoleScores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPutts = allHoleScores.reduce((sum, score) => sum + score.putts, 0);
    const totalPenalties = allHoleScores.reduce((sum, score) => sum + score.penalties, 0);
    const fairwaysHit = allHoleScores.filter((score) => score.fairwayInRegulation === true).length;
    const greensHit = allHoleScores.filter((score) => score.greenInRegulation === true).length;
    const sandSaves = allHoleScores.reduce((sum, score) => sum + score.sandSaves, 0);
    const upAndDowns = allHoleScores.reduce((sum, score) => sum + score.upAndDowns, 0);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      handicap: user.handicap || 0,
      totalHoles,
      totalStrokes,
      averageScore: totalHoles > 0 ? (totalStrokes / totalHoles).toFixed(2) : 0,
      totalPutts,
      averagePutts: totalHoles > 0 ? (totalPutts / totalHoles).toFixed(2) : 0,
      totalPenalties,
      fairwayPercentage: totalHoles > 0 ? (fairwaysHit / totalHoles * 100).toFixed(1) : 0,
      greenPercentage: totalHoles > 0 ? (greensHit / totalHoles * 100).toFixed(1) : 0,
      sandSaves,
      upAndDowns,
      tournamentHistory,
      totalTournaments: tournamentHistory.length,
      bestFinish: tournamentHistory.length > 0 ? Math.min(...tournamentHistory.map((t) => t.finalRanking || 8)) : null,
      totalPoints: tournamentHistory.reduce((sum, t) => sum + (t.totalPoints || 0), 0)
    };
  }
  async getPlayerYearlyStats(userId, year) {
    const yearlyHoleScores = await db.select().from(holeScores).where(and(eq(holeScores.userId, userId), eq(holeScores.tournamentYear, year)));
    const yearlyHistory = await db.select().from(playerTournamentHistory).where(and(eq(playerTournamentHistory.userId, userId), eq(playerTournamentHistory.tournamentYear, year)));
    const totalHoles = yearlyHoleScores.length;
    const totalStrokes = yearlyHoleScores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPutts = yearlyHoleScores.reduce((sum, score) => sum + score.putts, 0);
    const fairwaysHit = yearlyHoleScores.filter((score) => score.fairwayInRegulation === true).length;
    const greensHit = yearlyHoleScores.filter((score) => score.greenInRegulation === true).length;
    return {
      year,
      totalHoles,
      totalStrokes,
      averageScore: totalHoles > 0 ? (totalStrokes / totalHoles).toFixed(2) : 0,
      totalPutts,
      averagePutts: totalHoles > 0 ? (totalPutts / totalHoles).toFixed(2) : 0,
      fairwayPercentage: totalHoles > 0 ? (fairwaysHit / totalHoles * 100).toFixed(1) : 0,
      greenPercentage: totalHoles > 0 ? (greensHit / totalHoles * 100).toFixed(1) : 0,
      tournamentData: yearlyHistory[0] || null
    };
  }
  async getAllPlayersHistoricalStats() {
    const allUsers = await this.getAllUsers();
    const playersStats = [];
    for (const user of allUsers) {
      const lifetimeStats = await this.getPlayerLifetimeStats(user.id);
      playersStats.push({
        ...user,
        ...lifetimeStats
      });
    }
    return playersStats;
  }
  // Hole Score operations
  async getHoleScores(userId, round) {
    const scores3 = await db.select().from(holeScores).where(
      and(eq(holeScores.userId, userId), eq(holeScores.round, round))
    ).orderBy(asc(holeScores.hole));
    return scores3;
  }
  async getAllHoleScoresForRound(round) {
    const scores3 = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams
    }).from(holeScores).innerJoin(users, eq(holeScores.userId, users.id)).innerJoin(teams, eq(holeScores.teamId, teams.id)).where(eq(holeScores.round, round)).orderBy(asc(holeScores.hole));
    return scores3.map((score) => ({
      ...score.holeScore,
      user: score.user,
      team: score.team
    }));
  }
  // Calculate match play points for a team
  async calculateTeamMatchPlayPoints(teamId) {
    try {
      console.log(`=== CALCULATING MATCH PLAY POINTS FOR TEAM ${teamId} ===`);
      const team = await this.getTeam(teamId);
      if (!team) {
        console.log("\u274C Team not found");
        return 0;
      }
      const displayName = team.isThreePersonTeam ? `${team.player1Name}, ${team.player2Name} & ${team.player3Name}` : `${team.player1Name} & ${team.player2Name}`;
      console.log(`\u{1F3CC}\uFE0F Team ${team.teamNumber}: ${displayName}`);
      const playerPoints = [];
      const player1 = await db.select().from(users).where(and(eq(users.firstName, team.player1Name.split(" ")[0]), eq(users.lastName, team.player1Name.split(" ")[1]))).limit(1);
      if (player1.length > 0) {
        console.log(`\u{1F50D} Checking matches for ${team.player1Name} (ID: ${player1[0].id})`);
        const player1Matches = await db.select().from(matchPlayMatches).where(or(eq(matchPlayMatches.player1Id, player1[0].id), eq(matchPlayMatches.player2Id, player1[0].id)));
        const player1Points = await this.calculatePlayerMatchPlayPoints(player1[0].id);
        playerPoints.push(player1Points);
        console.log(`\u2705 ${team.player1Name} total: ${player1Points} points`);
      }
      const player2 = await db.select().from(users).where(and(eq(users.firstName, team.player2Name.split(" ")[0]), eq(users.lastName, team.player2Name.split(" ")[1]))).limit(1);
      if (player2.length > 0) {
        console.log(`\u{1F50D} Checking matches for ${team.player2Name} (ID: ${player2[0].id})`);
        const player2Matches = await db.select().from(matchPlayMatches).where(or(eq(matchPlayMatches.player1Id, player2[0].id), eq(matchPlayMatches.player2Id, player2[0].id)));
        const player2Points = await this.calculatePlayerMatchPlayPoints(player2[0].id);
        playerPoints.push(player2Points);
        console.log(`\u2705 ${team.player2Name} total: ${player2Points} points`);
      }
      if (team.isThreePersonTeam && team.player3Name) {
        const player3 = await db.select().from(users).where(and(eq(users.firstName, team.player3Name.split(" ")[0]), eq(users.lastName, team.player3Name.split(" ")[1]))).limit(1);
        if (player3.length > 0) {
          console.log(`\u{1F50D} Checking matches for ${team.player3Name} (ID: ${player3[0].id})`);
          const player3Matches = await db.select().from(matchPlayMatches).where(or(eq(matchPlayMatches.player1Id, player3[0].id), eq(matchPlayMatches.player2Id, player3[0].id)));
          const player3Points = await this.calculatePlayerMatchPlayPoints(player3[0].id);
          playerPoints.push(player3Points);
          console.log(`\u2705 ${team.player3Name} total: ${player3Points} points`);
        }
      }
      let totalTeamPoints = 0;
      if (team.isThreePersonTeam) {
        playerPoints.sort((a, b) => b - a);
        totalTeamPoints = playerPoints.slice(0, 2).reduce((sum, points) => sum + points, 0);
        console.log(`\u{1F3AF} 3-PERSON TEAM - Taking best 2 out of 3: [${playerPoints.join(", ")}] \u2192 Best 2: ${totalTeamPoints} points`);
      } else {
        totalTeamPoints = playerPoints.reduce((sum, points) => sum + points, 0);
      }
      console.log(`\u{1F3C6} TEAM ${team.teamNumber} MATCH PLAY TOTAL: ${totalTeamPoints} points`);
      return totalTeamPoints;
    } catch (error) {
      console.error("Error calculating match play points for team:", teamId, error);
      return 0;
    }
  }
  async createHoleScore(holeScore) {
    const [score] = await db.insert(holeScores).values(holeScore).returning();
    return score;
  }
  async updateHoleScore(userId, round, hole, strokes) {
    console.log("=== STORAGE: updateHoleScore (Regular Rounds) ===");
    console.log("Input:", { userId, round, hole, strokes });
    try {
      console.log("\u{1F50D} Checking for existing score...");
      const [existingScore] = await db.select().from(holeScores).where(
        and(
          eq(holeScores.userId, userId),
          eq(holeScores.round, round),
          eq(holeScores.hole, hole)
        )
      );
      console.log("\u2705 Existing scores found:", existingScore ? 1 : 0);
      const par = 4;
      console.log("\u{1F3CC}\uFE0F Calculating handicap for hole...");
      const handicap = await this.calculateHoleHandicap(userId, hole);
      const netScore = strokes - handicap;
      let points = 0;
      points = 0;
      console.log("\u2705 Calculated scores:", { par, handicap, netScore, points });
      if (existingScore) {
        console.log("\u{1F4DD} Updating existing score record...");
        const [updatedScore] = await db.update(holeScores).set({
          strokes,
          netScore,
          points,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(holeScores.id, existingScore.id)).returning();
        console.log("\u2705 Score updated successfully:", updatedScore);
        return updatedScore;
      } else {
        console.log("\u{1F195} Creating new score record...");
        const user = await this.getUser(userId);
        if (!user) {
          console.log("\u274C User not found for ID:", userId);
          throw new Error("User not found");
        }
        console.log("\u2705 User found:", `${user.firstName} ${user.lastName}`);
        const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
        if (!playerInfo) {
          console.log("\u274C Player not found in any team:", `${user.firstName} ${user.lastName}`);
          throw new Error("Player not found in any team");
        }
        console.log("\u2705 Player team info found:", playerInfo);
        const [newScore] = await db.insert(holeScores).values({
          userId,
          teamId: playerInfo.teamId,
          round,
          hole,
          strokes,
          par,
          handicap,
          netScore,
          points
        }).returning();
        console.log("\u2705 New score created successfully:", newScore);
        return newScore;
      }
    } catch (error) {
      console.error("\u274C Storage error in updateHoleScore:", error);
      console.error("\u274C Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  }
  async updateHoleScoreStats(userId, round, hole, statsData) {
    const [existingScore] = await db.select().from(holeScores).where(
      and(
        eq(holeScores.userId, userId),
        eq(holeScores.round, round),
        eq(holeScores.hole, hole)
      )
    );
    if (existingScore) {
      const [updatedScore] = await db.update(holeScores).set({
        fairwayInRegulation: statsData.fairwayInRegulation,
        greenInRegulation: statsData.greenInRegulation,
        driveDirection: statsData.driveDirection,
        putts: statsData.putts,
        penalties: statsData.penalties,
        sandSaves: statsData.sandSaves,
        upAndDowns: statsData.upAndDowns,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(holeScores.id, existingScore.id)).returning();
      return updatedScore;
    } else {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
      if (!playerInfo) throw new Error("Player not found in any team");
      const par = 4;
      const handicap = 0;
      const strokes = 0;
      const netScore = strokes - handicap;
      const points = 0;
      const [newScore] = await db.insert(holeScores).values({
        userId,
        teamId: playerInfo.teamId,
        round,
        hole,
        strokes,
        par,
        handicap,
        netScore,
        points,
        fairwayInRegulation: statsData.fairwayInRegulation,
        greenInRegulation: statsData.greenInRegulation,
        driveDirection: statsData.driveDirection,
        putts: statsData.putts,
        penalties: statsData.penalties,
        sandSaves: statsData.sandSaves,
        upAndDowns: statsData.upAndDowns
      }).returning();
      return newScore;
    }
  }
  async getLeaderboard(round) {
    if (round === 1) {
      return this.getIndividualLeaderboard(round);
    } else if (round === 2) {
      return this.getTournamentPlacementLeaderboard(round);
    } else if (round === 3) {
      return this.getMatchPlayLeaderboard();
    } else {
      return [];
    }
  }
  async getIndividualLeaderboard(round) {
    const allUsers = await this.getAllUsers();
    const individualData = [];
    for (const user of allUsers) {
      const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
      const team = playerInfo ? await this.getTeam(playerInfo.teamId) : null;
      const playerHoleScores = await db.select().from(holeScores).where(
        and(
          eq(holeScores.userId, user.id),
          eq(holeScores.round, round)
        )
      );
      const totalPoints = playerHoleScores.reduce((sum, score) => sum + score.points, 0);
      const holesCompleted = playerHoleScores.length;
      const totalStrokes = playerHoleScores.reduce((sum, score) => sum + score.strokes, 0);
      const netStrokes = playerHoleScores.reduce((sum, score) => sum + score.netScore, 0);
      individualData.push({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        },
        team: team ? {
          id: team.id,
          teamNumber: team.teamNumber
        } : null,
        totalPoints,
        holes: holesCompleted,
        stablefordPoints: totalPoints,
        // Same as totalPoints for individual
        netStrokes,
        grossStrokes: totalStrokes,
        holesCompleted
      });
    }
    individualData.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.holes - a.holes;
    });
    individualData.forEach((player, index2) => {
      player.position = index2 + 1;
    });
    return individualData;
  }
  async calculateHoleHandicap(userId, hole) {
    const user = await this.getUser(userId);
    if (!user) return 0;
    const playerHandicap = user.handicap || 0;
    const { muskokaBayCourse: muskokaBayCourse2 } = await Promise.resolve().then(() => (init_courseData(), courseData_exports));
    const holeData = muskokaBayCourse2.holes.find((h) => h.number === hole);
    const strokeIndex = holeData ? holeData.handicap : 18;
    return playerHandicap >= strokeIndex ? 1 : 0;
  }
  async recalculateAllHoleScores() {
    console.log("\u{1F504} Recalculating all hole scores with correct handicap data...");
    const allHoleScores = await db.select().from(holeScores);
    const { muskokaBayCourse: muskokaBayCourse2 } = await Promise.resolve().then(() => (init_courseData(), courseData_exports));
    for (const score of allHoleScores) {
      const holeData = muskokaBayCourse2.holes.find((h) => h.number === score.hole);
      const par = holeData ? holeData.par : 4;
      const handicapStrokes = await this.calculateHoleHandicap(score.userId, score.hole);
      const netScore = score.strokes - handicapStrokes;
      const stablefordPoints = Math.max(0, 2 + (par - netScore));
      await db.update(holeScores).set({
        par,
        handicap: handicapStrokes,
        netScore,
        points: stablefordPoints,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(holeScores.id, score.id));
    }
    console.log(`\u2705 Recalculated ${allHoleScores.length} hole scores`);
  }
  async getTournamentPlacementLeaderboard(round) {
    const teams2 = await this.getTeams();
    const teamPlacementData = [];
    for (const team of teams2) {
      const roundPoints = await this.calculateTeamRoundPoints(team.id, round);
      const stablefordPoints = await this.calculateTeamStablefordPoints(team.id, round);
      const holesCompleted = await this.getTeamHolesCompleted(team.id, round);
      const matchPlayPoints = await this.calculateTeamMatchPlayPoints(team.id);
      let netStrokes = 0;
      let grossStrokes = 0;
      if (round === 1 || round === 2) {
        netStrokes = await this.calculateTeamNetStrokes(team.id, round);
        grossStrokes = await this.calculateTeamGrossStrokes(team.id, round);
        if (grossStrokes === 0) {
          netStrokes = 0;
        }
      }
      const totalPoints = roundPoints + matchPlayPoints;
      teamPlacementData.push({
        id: team.id,
        team,
        roundPoints,
        stablefordPoints,
        netStrokes,
        // Add net strokes for Rounds 1 and 2
        netScore: netStrokes,
        // Also add as netScore for frontend compatibility
        totalGrossStrokes: grossStrokes,
        // Add gross strokes for display
        grossToPar: grossStrokes > 0 && holesCompleted >= 18 ? grossStrokes - 72 : 0,
        // Only calculate to par for completed rounds
        holesCompleted,
        matchPlayPoints,
        totalPoints,
        // Include match play points in total
        isTeamLeaderboard: true,
        position: 0
        // Will be set after sorting
      });
    }
    if (round === 2) {
      const teamsWithRound2Scores = teamPlacementData.filter((team) => team.holesCompleted > 0);
      const teamsWithoutRound2Scores = teamPlacementData.filter((team) => team.holesCompleted === 0);
      teamsWithRound2Scores.sort((a, b) => a.netStrokes - b.netStrokes);
      teamsWithoutRound2Scores.sort((a, b) => b.totalPoints - a.totalPoints);
      const sortedTeams = [...teamsWithRound2Scores, ...teamsWithoutRound2Scores];
      let currentPosition = 1;
      for (let i = 0; i < sortedTeams.length; i++) {
        const currentTeam = sortedTeams[i];
        if (i > 0 && currentTeam.holesCompleted > 0) {
          const previousTeam = sortedTeams[i - 1];
          if (previousTeam.holesCompleted > 0 && currentTeam.netStrokes === previousTeam.netStrokes) {
            currentTeam.position = previousTeam.position;
          } else {
            currentTeam.position = i + 1;
            currentPosition = i + 1;
          }
        } else {
          currentTeam.position = currentPosition;
          if (currentTeam.holesCompleted === 0) currentPosition++;
        }
      }
      return sortedTeams;
    } else if (round === 1) {
      const teamsWithScores = teamPlacementData.filter((team) => team.holesCompleted > 0);
      const teamsWithoutScores = teamPlacementData.filter((team) => team.holesCompleted === 0);
      teamsWithScores.sort((a, b) => a.netStrokes - b.netStrokes);
      teamsWithoutScores.sort((a, b) => b.totalPoints - a.totalPoints);
      const sortedTeams = [...teamsWithScores, ...teamsWithoutScores];
      sortedTeams.forEach((team, index2) => {
        team.position = index2 + 1;
        if (team.holesCompleted >= 18) {
          const placementPoints = Math.max(11 - (index2 + 1), 1);
          team.roundPoints = placementPoints;
          team.totalPoints = placementPoints + team.matchPlayPoints;
        }
      });
      return sortedTeams;
    } else {
      const teamsWithScores = teamPlacementData.filter((team) => team.holesCompleted > 0);
      const teamsWithoutScores = teamPlacementData.filter((team) => team.holesCompleted === 0);
      teamsWithScores.sort((a, b) => b.totalPoints - a.totalPoints);
      teamsWithoutScores.sort((a, b) => b.totalPoints - a.totalPoints);
      const sortedTeams = [...teamsWithScores, ...teamsWithoutScores];
      sortedTeams.forEach((team, index2) => {
        team.position = index2 + 1;
      });
      return sortedTeams;
    }
  }
  async getScrambleLeaderboard(round) {
    console.log(`\u{1F50D} getScrambleLeaderboard called with round: ${round}`);
    const scores3 = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams
    }).from(holeScores).innerJoin(users, eq(holeScores.userId, users.id)).innerJoin(teams, eq(holeScores.teamId, teams.id)).where(eq(holeScores.round, round));
    console.log(`\u{1F4CA} Found ${scores3.length} hole scores for round ${round}`);
    const teamHoleScores = /* @__PURE__ */ new Map();
    const teamPlayers = /* @__PURE__ */ new Map();
    for (const score of scores3) {
      const key = `${score.team.id}-${score.holeScore.hole}`;
      if (!teamPlayers.has(score.team.id)) {
        teamPlayers.set(score.team.id, []);
      }
      const players = teamPlayers.get(score.team.id);
      if (!players.find((p) => p.id === score.user.id)) {
        players.push(score.user);
      }
      if (!teamHoleScores.has(key)) {
        teamHoleScores.set(key, {
          team: score.team,
          hole: score.holeScore.hole,
          strokes: score.holeScore.strokes,
          points: score.holeScore.points,
          par: score.holeScore.par,
          handicap: score.holeScore.handicap
        });
      }
    }
    const calculateScrambleTeamHandicap = (team) => {
      if (team.isThreePersonTeam && team.player3Handicap) {
        const handicaps = [team.player1Handicap || 0, team.player2Handicap || 0, team.player3Handicap || 0];
        handicaps.sort((a, b) => a - b);
        const [lowest, middle, highest] = handicaps;
        return Math.round(lowest * 0.2 + middle * 0.15 + highest * 0.1);
      } else {
        const player1Hcp = team.player1Handicap || 0;
        const player2Hcp = team.player2Handicap || 0;
        const lowerHcp = Math.min(player1Hcp, player2Hcp);
        const higherHcp = Math.max(player1Hcp, player2Hcp);
        return Math.round(lowerHcp * 0.35 + higherHcp * 0.15);
      }
    };
    const getStrokesOnHole = (teamHandicap, holeHandicap) => {
      if (teamHandicap >= holeHandicap) {
        return 1;
      }
      return 0;
    };
    const teamTotals = /* @__PURE__ */ new Map();
    for (const teamHole of Array.from(teamHoleScores.values())) {
      const teamId = teamHole.team.id;
      if (!teamTotals.has(teamId)) {
        const teamHandicap = calculateScrambleTeamHandicap(teamHole.team);
        teamTotals.set(teamId, {
          team: teamHole.team,
          totalPoints: 0,
          totalGrossStrokes: 0,
          totalNetStrokes: 0,
          grossToPar: 0,
          netToPar: 0,
          holes: 0,
          players: teamPlayers.get(teamId) || [],
          teamHandicap
        });
      }
      const teamTotal = teamTotals.get(teamId);
      const strokesReceived = getStrokesOnHole(teamTotal.teamHandicap, teamHole.handicap);
      const netScore = teamHole.strokes - strokesReceived;
      const netToPar = netScore - teamHole.par;
      teamTotal.totalPoints += 0;
      teamTotal.totalGrossStrokes += teamHole.strokes;
      teamTotal.totalNetStrokes += netScore;
      teamTotal.grossToPar += teamHole.strokes - teamHole.par;
      teamTotal.netToPar += netToPar;
      teamTotal.holes += 1;
    }
    const leaderboardEntries = Array.from(teamTotals.values()).map((entry) => {
      const correctedTotalNetStrokes = entry.totalGrossStrokes - entry.teamHandicap;
      const correctedNetToPar = correctedTotalNetStrokes - 72;
      console.log(`\u{1F3CC}\uFE0F Round 2 Scramble - Team ${entry.team.teamNumber}: ${correctedTotalNetStrokes} net strokes (${entry.totalGrossStrokes} gross - ${entry.teamHandicap} handicap, ${entry.holes}/18 holes)`);
      return {
        id: entry.team.id,
        team: entry.team,
        players: entry.players,
        totalPoints: entry.totalPoints,
        totalGrossStrokes: entry.totalGrossStrokes,
        totalNetStrokes: correctedTotalNetStrokes,
        grossToPar: entry.grossToPar,
        netToPar: correctedNetToPar,
        holes: entry.holes,
        teamHandicap: entry.teamHandicap,
        isTeamLeaderboard: true,
        isScramble: true,
        holesCompleted: entry.holes
      };
    });
    const leaderboard = leaderboardEntries.sort((a, b) => a.totalNetStrokes - b.totalNetStrokes).map((entry, index2) => ({ ...entry, position: index2 + 1 }));
    console.log("\u{1F680} SORTED Round 2 Leaderboard Order:");
    leaderboard.forEach((entry, idx) => {
      console.log(`   ${idx + 1}. Team ${entry.team.teamNumber}: ${entry.totalNetStrokes} net strokes`);
    });
    return leaderboard;
  }
  async getMatchPlayLeaderboard() {
    console.log("\u{1F3C6} Getting match play leaderboard with new per-hole calculation");
    const allUsers = await db.select().from(users);
    const allTeams = await db.select().from(teams);
    const userTeamPairs = [];
    for (const user of allUsers) {
      const userName = `${user.firstName} ${user.lastName}`;
      const userTeam = allTeams.find(
        (team) => team.player1Name === userName || team.player2Name === userName
      );
      if (userTeam) {
        userTeamPairs.push({ user, team: userTeam });
      }
    }
    const playerStats = [];
    for (const userTeam of userTeamPairs) {
      const matchPoints = await this.calculatePlayerMatchPlayPoints(userTeam.user.id);
      const matches = await db.select().from(matchPlayMatches).where(
        or(
          eq(matchPlayMatches.player1Id, userTeam.user.id),
          eq(matchPlayMatches.player2Id, userTeam.user.id)
        )
      );
      let segmentsWon = 0;
      let segmentsPlayed = matches.length;
      for (const match of matches) {
        const playerHoleScores = await db.select().from(holeScores).where(
          and(
            eq(holeScores.userId, userTeam.user.id),
            eq(holeScores.round, 3)
          )
        );
        const opponentId = match.player1Id === userTeam.user.id ? match.player2Id : match.player1Id;
        const opponentHoleScores = await db.select().from(holeScores).where(
          and(
            eq(holeScores.userId, opponentId),
            eq(holeScores.round, 3)
          )
        );
        const holeRanges = {
          "1-6": [1, 2, 3, 4, 5, 6],
          "7-12": [7, 8, 9, 10, 11, 12],
          "13-18": [13, 14, 15, 16, 17, 18]
        };
        const segmentHoles = holeRanges[match.holeSegment] || [];
        let playerHolesWon = 0;
        let opponentHolesWon = 0;
        for (const hole of segmentHoles) {
          const playerScore = playerHoleScores.find((s) => s.hole === hole);
          const opponentScore = opponentHoleScores.find((s) => s.hole === hole);
          if (playerScore && opponentScore) {
            if (playerScore.netScore < opponentScore.netScore) {
              playerHolesWon++;
            } else if (opponentScore.netScore < playerScore.netScore) {
              opponentHolesWon++;
            }
          }
        }
        if (playerHolesWon > opponentHolesWon) {
          segmentsWon++;
        }
      }
      playerStats.push({
        ...userTeam.user,
        user: userTeam.user,
        team: userTeam.team,
        totalPoints: matchPoints,
        matchPoints,
        segmentsPlayed,
        segmentsWon,
        position: 0,
        // Will be set after sorting
        isTeamLeaderboard: false,
        isMatchPlay: true
      });
    }
    const leaderboard = playerStats.sort((a, b) => b.matchPoints - a.matchPoints).map((entry, index2) => ({
      ...entry,
      position: index2 + 1
    }));
    console.log(`\u{1F4CA} Match play leaderboard calculated for ${leaderboard.length} players`);
    return leaderboard;
  }
  async getTeamBetterBallLeaderboard(round) {
    const scores3 = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams
    }).from(holeScores).innerJoin(users, eq(holeScores.userId, users.id)).innerJoin(teams, eq(holeScores.teamId, teams.id)).where(eq(holeScores.round, round));
    const teamHoleScores = /* @__PURE__ */ new Map();
    for (const score of scores3) {
      const key = `${score.team.id}-${score.holeScore.hole}`;
      if (!teamHoleScores.has(key)) {
        teamHoleScores.set(key, {
          team: score.team,
          hole: score.holeScore.hole,
          par: score.holeScore.par,
          bestGrossScore: score.holeScore.strokes,
          bestNetScore: score.holeScore.netScore,
          bestPoints: score.holeScore.points,
          players: [score.user]
        });
      } else {
        const teamHole = teamHoleScores.get(key);
        if (score.holeScore.strokes < teamHole.bestGrossScore) {
          teamHole.bestGrossScore = score.holeScore.strokes;
          teamHole.bestNetScore = score.holeScore.netScore;
          teamHole.bestPoints = score.holeScore.points;
        }
        if (!teamHole.players.find((p) => p.id === score.user.id)) {
          teamHole.players.push(score.user);
        }
      }
    }
    const teamTotals = /* @__PURE__ */ new Map();
    for (const teamHole of Array.from(teamHoleScores.values())) {
      const teamId = teamHole.team.id;
      if (!teamTotals.has(teamId)) {
        teamTotals.set(teamId, {
          team: teamHole.team,
          totalPoints: 0,
          totalGrossStrokes: 0,
          totalNetStrokes: 0,
          grossToPar: 0,
          netToPar: 0,
          holes: 0,
          players: []
        });
      }
      const teamTotal = teamTotals.get(teamId);
      teamTotal.totalPoints += teamHole.bestPoints;
      teamTotal.totalGrossStrokes += teamHole.bestGrossScore;
      teamTotal.totalNetStrokes += teamHole.bestNetScore;
      teamTotal.grossToPar += teamHole.bestGrossScore - teamHole.par;
      teamTotal.netToPar += teamHole.bestNetScore - teamHole.par;
      teamTotal.holes += 1;
      for (const player of teamHole.players) {
        if (!teamTotal.players.find((p) => p.id === player.id)) {
          teamTotal.players.push(player);
        }
      }
    }
    const leaderboard = Array.from(teamTotals.values()).sort((a, b) => a.totalGrossStrokes - b.totalGrossStrokes).map((entry, index2) => ({
      id: entry.team.id,
      team: entry.team,
      players: entry.players,
      totalPoints: entry.totalPoints,
      totalGrossStrokes: entry.totalGrossStrokes,
      totalNetStrokes: entry.totalNetStrokes,
      grossToPar: entry.grossToPar,
      netToPar: entry.netToPar,
      holes: entry.holes,
      position: index2 + 1,
      isTeamLeaderboard: true,
      isBetterBall: true
    }));
    return leaderboard;
  }
  async getPlayerStatistics() {
    const holeScoresData = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams
    }).from(holeScores).innerJoin(users, eq(holeScores.userId, users.id)).innerJoin(teams, eq(holeScores.teamId, teams.id)).orderBy(asc(holeScores.userId), asc(holeScores.round), asc(holeScores.hole));
    const userStatsMap = /* @__PURE__ */ new Map();
    for (const data of holeScoresData) {
      const userId = data.user.id;
      const holeScore = data.holeScore;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          totalRounds: /* @__PURE__ */ new Set(),
          totalHoles: 0,
          totalStrokes: 0,
          totalPoints: 0,
          fairwayHits: 0,
          fairwayAttempts: 0,
          greenHits: 0,
          greenAttempts: 0,
          totalPutts: 0,
          totalPenalties: 0,
          totalSandSaves: 0,
          totalUpAndDowns: 0,
          scoresByHole: [],
          rounds: /* @__PURE__ */ new Map()
        });
      }
      const userStats = userStatsMap.get(userId);
      userStats.totalRounds.add(holeScore.round);
      userStats.totalHoles += 1;
      userStats.totalStrokes += holeScore.strokes;
      userStats.totalPoints += holeScore.points;
      const par = 4;
      const scoreDiff = holeScore.strokes - par;
      userStats.scoresByHole.push({
        round: holeScore.round,
        hole: holeScore.hole,
        strokes: holeScore.strokes,
        par,
        diff: scoreDiff
      });
      if (holeScore.fairwayInRegulation !== null) {
        userStats.fairwayAttempts += 1;
        if (holeScore.fairwayInRegulation) {
          userStats.fairwayHits += 1;
        }
      }
      if (holeScore.greenInRegulation !== null) {
        userStats.greenAttempts += 1;
        if (holeScore.greenInRegulation) {
          userStats.greenHits += 1;
        }
      }
      if (holeScore.putts) {
        userStats.totalPutts += holeScore.putts;
      }
      if (holeScore.penalties) {
        userStats.totalPenalties += holeScore.penalties;
      }
      if (holeScore.sandSaves) {
        userStats.totalSandSaves += holeScore.sandSaves;
      }
      if (holeScore.upAndDowns) {
        userStats.totalUpAndDowns += holeScore.upAndDowns;
      }
      const roundNum = holeScore.round;
      if (!userStats.rounds.has(roundNum)) {
        userStats.rounds.set(roundNum, {
          round: roundNum,
          holes: 0,
          totalStrokes: 0,
          points: 0,
          fairwayHits: 0,
          fairwayAttempts: 0,
          greenHits: 0,
          greenAttempts: 0,
          putts: 0,
          penalties: 0,
          sandSaves: 0,
          upAndDowns: 0
        });
      }
      const roundStats = userStats.rounds.get(roundNum);
      roundStats.holes += 1;
      roundStats.totalStrokes += holeScore.strokes;
      roundStats.points += holeScore.points;
      if (holeScore.fairwayInRegulation !== null) {
        roundStats.fairwayAttempts += 1;
        if (holeScore.fairwayInRegulation) {
          roundStats.fairwayHits += 1;
        }
      }
      if (holeScore.greenInRegulation !== null) {
        roundStats.greenAttempts += 1;
        if (holeScore.greenInRegulation) {
          roundStats.greenHits += 1;
        }
      }
      if (holeScore.putts) {
        roundStats.putts += holeScore.putts;
      }
      if (holeScore.penalties) {
        roundStats.penalties += holeScore.penalties;
      }
      if (holeScore.sandSaves) {
        roundStats.sandSaves += holeScore.sandSaves;
      }
      if (holeScore.upAndDowns) {
        roundStats.upAndDowns += holeScore.upAndDowns;
      }
    }
    const playerStats = Array.from(userStatsMap.values()).map((stats) => {
      const birdies = stats.scoresByHole.filter((h) => h.diff === -1).length;
      const eagles = stats.scoresByHole.filter((h) => h.diff <= -2).length;
      const pars = stats.scoresByHole.filter((h) => h.diff === 0).length;
      const bogeys = stats.scoresByHole.filter((h) => h.diff === 1).length;
      const doubleBogeys = stats.scoresByHole.filter((h) => h.diff >= 2).length;
      return {
        userId: stats.userId,
        firstName: stats.firstName,
        lastName: stats.lastName,
        totalRounds: stats.totalRounds.size,
        totalHoles: stats.totalHoles,
        averageScore: stats.totalHoles > 0 ? (stats.totalStrokes / stats.totalHoles).toFixed(1) : "0.0",
        fairwayPercentage: stats.fairwayAttempts > 0 ? (stats.fairwayHits / stats.fairwayAttempts * 100).toFixed(1) : "0.0",
        greenPercentage: stats.greenAttempts > 0 ? (stats.greenHits / stats.greenAttempts * 100).toFixed(1) : "0.0",
        averagePutts: stats.totalHoles > 0 ? (stats.totalPutts / stats.totalHoles).toFixed(1) : "0.0",
        totalPenalties: stats.totalPenalties,
        totalSandSaves: stats.totalSandSaves,
        totalUpAndDowns: stats.totalUpAndDowns,
        birdies,
        eagles,
        pars,
        bogeys,
        doubleBogeys,
        totalPoints: stats.totalPoints,
        rounds: Array.from(stats.rounds.values())
      };
    });
    return playerStats;
  }
  // Legacy in-memory storage for development
  teams;
  scores;
  sideBets;
  photos;
  matchups;
  currentTeamId;
  currentScoreId;
  currentSideBetId;
  currentPhotoId;
  currentMatchupId;
  constructor() {
    this.teams = /* @__PURE__ */ new Map();
    this.scores = /* @__PURE__ */ new Map();
    this.sideBets = /* @__PURE__ */ new Map();
    this.photos = /* @__PURE__ */ new Map();
    this.matchups = /* @__PURE__ */ new Map();
    this.currentTeamId = 1;
    this.currentScoreId = 1;
    this.currentSideBetId = 1;
    this.currentPhotoId = 1;
    this.currentMatchupId = 1;
    this.initializeData();
  }
  initializeData() {
    const teamData = [
      { teamNumber: 1, player1Name: "Nick Grossi", player1Handicap: 15, player2Name: "Connor Patterson", player2Handicap: 3 },
      { teamNumber: 2, player1Name: "Christian Hauck", player1Handicap: 5, player2Name: "Bailey Carlson", player2Handicap: 16 },
      { teamNumber: 3, player1Name: "Erik Boudreau", player1Handicap: 10, player2Name: "Will Bibbings", player2Handicap: 5 },
      { teamNumber: 4, player1Name: "Nick Cook", player1Handicap: 12, player2Name: "Kevin Durco", player2Handicap: 3 },
      { teamNumber: 5, player1Name: "Spencer Reid", player1Handicap: 16, player2Name: "Jeffrey Reiner", player2Handicap: 9 },
      { teamNumber: 6, player1Name: "Jordan Kreller", player1Handicap: 6, player2Name: "Johnny Magnatta", player2Handicap: 11 },
      {
        teamNumber: 7,
        player1Name: "Nic Huxley",
        player1Handicap: 20,
        player2Name: "Sye Ellard",
        player2Handicap: 18,
        player3Name: "James Ogilvie",
        player3Handicap: 17,
        isThreePersonTeam: true
      },
      { teamNumber: 8, player1Name: "Mystery Player", player1Handicap: 6, player2Name: "Unknown Player", player2Handicap: 15 }
    ];
    teamData.forEach((team) => {
      const totalHandicap = team.player1Handicap + team.player2Handicap + (team.player3Handicap || 0);
      const newTeam = {
        id: this.currentTeamId++,
        ...team,
        player3Name: team.player3Name || null,
        player3Handicap: team.player3Handicap || null,
        isThreePersonTeam: team.isThreePersonTeam || false,
        totalHandicap,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.teams.set(newTeam.id, newTeam);
      const newScore = {
        id: this.currentScoreId++,
        teamId: newTeam.id,
        round1Points: 0,
        round2Points: 0,
        round3Points: 0,
        matchPlayPoints: 0,
        totalPoints: 0,
        rank: 8,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.scores.set(newScore.id, newScore);
    });
  }
  async getTeams() {
    const teamsFromDb = await db.select().from(teams).orderBy(asc(teams.teamNumber));
    return teamsFromDb;
  }
  async getTeam(teamId) {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    return team;
  }
  async createTeam(insertTeam) {
    const id = this.currentTeamId++;
    const team = {
      id,
      ...insertTeam,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.teams.set(id, team);
    return team;
  }
  async getScores() {
    const scoresArray = Array.from(this.scores.values());
    return scoresArray.map((score) => ({
      ...score,
      team: this.teams.get(score.teamId)
    })).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }
  async getCalculatedScores() {
    const teams2 = await this.getTeams();
    const calculatedScores = [];
    for (const team of teams2) {
      const round1Points = await this.calculateTeamRoundPoints(team.id, 1);
      const round2Points = await this.calculateTeamRoundPoints(team.id, 2);
      const round3Points = await this.calculateTeamRoundPoints(team.id, 3);
      console.log(`\u{1F4CA} Team ${team.id} scores: R1=${round1Points}, R2=${round2Points}, R3=${round3Points}`);
      const matchPlayPoints = await this.calculateTeamMatchPlayPoints(team.id);
      const totalPoints = round1Points + round2Points + round3Points;
      const scoreWithTeam = {
        id: team.id,
        teamId: team.id,
        round1Points,
        round2Points,
        round3Points,
        matchPlayPoints,
        totalPoints,
        rank: 1,
        // Will be calculated after sorting
        updatedAt: /* @__PURE__ */ new Date(),
        team
      };
      calculatedScores.push(scoreWithTeam);
    }
    calculatedScores.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    calculatedScores.forEach((score, index2) => {
      score.rank = index2 + 1;
    });
    return calculatedScores;
  }
  async getLiveScores() {
    const calculatedScores = await this.getCalculatedScores();
    const liveScores = await Promise.all(calculatedScores.map(async (score) => {
      const currentRoundPoints = await this.getCurrentRoundPoints(score.teamId);
      const currentRoundStanding = await this.getCurrentRoundStanding(score.teamId);
      return {
        ...score,
        currentRoundPoints,
        currentRoundStanding
      };
    }));
    return liveScores;
  }
  async getCurrentRoundPoints(teamId) {
    const rounds = [1, 2, 3];
    let currentRound = 1;
    for (const round of rounds) {
      const holesCompleted = await this.getTeamHolesCompleted(teamId, round);
      if (holesCompleted > 0 && holesCompleted < 18) {
        currentRound = round;
        break;
      } else if (holesCompleted === 18) {
        if (round < 3) {
          currentRound = round + 1;
        }
      }
    }
    if (currentRound === 1 || currentRound === 2) {
      const allTeams = await this.getTeams();
      const teamCurrentScores = await Promise.all(allTeams.map(async (team) => {
        const netStrokes = await this.calculateTeamNetStrokes(team.id, currentRound);
        return {
          teamId: team.id,
          netStrokes,
          holesCompleted: await this.getTeamHolesCompleted(team.id, currentRound)
        };
      }));
      teamCurrentScores.sort((a, b) => a.netStrokes - b.netStrokes);
      const teamPosition = teamCurrentScores.findIndex((score) => score.teamId === teamId) + 1;
      const teamData = teamCurrentScores.find((score) => score.teamId === teamId);
      if (teamData && teamData.holesCompleted > 0 && teamData.holesCompleted < 18) {
        const pointsMap = currentRound === 1 ? [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5] : [10, 9, 8, 7, 6, 5, 4, 3];
        const teamScore = teamData.netStrokes;
        const tiedTeams = teamCurrentScores.filter((team) => team.netStrokes === teamScore && team.holesCompleted > 0);
        if (tiedTeams.length === 1) {
          return teamPosition <= pointsMap.length ? pointsMap[teamPosition - 1] : 3;
        } else {
          const firstTiedPosition = teamCurrentScores.filter((team) => team.holesCompleted > 0).findIndex((team) => team.netStrokes === teamScore) + 1;
          const lastTiedPosition = firstTiedPosition + tiedTeams.length - 1;
          let totalPoints = 0;
          for (let pos = firstTiedPosition; pos <= lastTiedPosition; pos++) {
            const points = pos <= pointsMap.length ? pointsMap[pos - 1] : 3;
            totalPoints += points;
          }
          return totalPoints / tiedTeams.length;
        }
      }
    }
    return await this.calculateTeamRoundPoints(teamId, currentRound);
  }
  async getCurrentRoundStanding(teamId) {
    const allTeams = await this.getTeams();
    const teamScores = await Promise.all(allTeams.map(async (team) => ({
      teamId: team.id,
      points: await this.getCurrentRoundPoints(team.id)
    })));
    teamScores.sort((a, b) => b.points - a.points);
    const position = teamScores.findIndex((score) => score.teamId === teamId) + 1;
    return position;
  }
  async getTeamHolesCompleted(teamId, round) {
    const uniqueHoles = await db.selectDistinct({ hole: holeScores.hole }).from(holeScores).where(and(eq(holeScores.teamId, teamId), eq(holeScores.round, round)));
    return uniqueHoles.length;
  }
  async calculateTeamRoundPoints(teamId, round) {
    if (round === 1 || round === 2) {
      return await this.calculateTournamentPlacementPoints(teamId, round);
    }
    if (round === 3) {
      return await this.calculateMatchPlayPoints(teamId, round);
    }
    return 0;
  }
  async calculateTournamentPlacementPoints(teamId, round) {
    const allTeams = await this.getTeams();
    const teamPerformances = await Promise.all(allTeams.map(async (team) => {
      let teamScore2;
      const holesCompleted = await this.getTeamHolesCompleted(team.id, round);
      if (round === 1) {
        teamScore2 = await this.calculateTeamNetStrokes(team.id, round);
      } else if (round === 2) {
        teamScore2 = await this.calculateTeamNetStrokes(team.id, round);
      } else {
        teamScore2 = 0;
      }
      return {
        teamId: team.id,
        teamScore: teamScore2,
        holesCompleted,
        isStrokePlay: round === 1 || round === 2
        // Flag to indicate stroke play vs points
      };
    }));
    const teamsInPlay = teamPerformances.filter((team) => team.holesCompleted > 0);
    if (teamsInPlay.length === 0) {
      return 0;
    }
    if (round === 1) {
      teamsInPlay.sort((a, b) => a.teamScore - b.teamScore);
    } else if (round === 2) {
      teamsInPlay.sort((a, b) => a.teamScore - b.teamScore);
    }
    const pointsMap = round === 1 ? [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5] : [10, 9, 8, 7, 6, 5, 4, 3];
    const teamScore = teamsInPlay.find((team) => team.teamId === teamId)?.teamScore;
    if (teamScore === void 0) {
      return 0;
    }
    const tiedTeams = teamsInPlay.filter((team) => team.teamScore === teamScore);
    if (tiedTeams.length === 1) {
      const teamPosition = teamsInPlay.findIndex((team) => team.teamId === teamId) + 1;
      const points = teamPosition <= pointsMap.length ? pointsMap[teamPosition - 1] : 3;
      return points;
    } else {
      const firstTiedPosition = teamsInPlay.findIndex((team) => team.teamScore === teamScore) + 1;
      const lastTiedPosition = firstTiedPosition + tiedTeams.length - 1;
      let totalPoints = 0;
      for (let pos = firstTiedPosition; pos <= lastTiedPosition; pos++) {
        const points = pos <= pointsMap.length ? pointsMap[pos - 1] : 3;
        totalPoints += points;
      }
      const averagePoints = totalPoints / tiedTeams.length;
      console.log(`\u{1F3AF} TIE: Team ${teamId} tied with ${tiedTeams.length} teams at score ${teamScore}, getting ${averagePoints} points`);
      return averagePoints;
    }
  }
  async calculateTeamStablefordPoints(teamId, round) {
    if (round === 1) {
      const teamHoleScores = await db.select({
        holeScore: holeScores,
        user: users
      }).from(holeScores).innerJoin(users, eq(holeScores.userId, users.id)).where(
        and(
          eq(holeScores.teamId, teamId),
          eq(holeScores.round, round)
        )
      );
      const holeMap = /* @__PURE__ */ new Map();
      for (const score of teamHoleScores) {
        const hole = score.holeScore.hole;
        const points = score.holeScore.points;
        if (!holeMap.has(hole) || points > holeMap.get(hole)) {
          holeMap.set(hole, points);
        }
      }
      return Array.from(holeMap.values()).reduce((total, points) => total + points, 0);
    } else if (round === 2) {
      const teamHoleScores = await db.select().from(holeScores).where(
        and(
          eq(holeScores.teamId, teamId),
          eq(holeScores.round, round)
        )
      );
      const uniqueHoles = /* @__PURE__ */ new Map();
      for (const holeScore of teamHoleScores) {
        if (!uniqueHoles.has(holeScore.hole)) {
          uniqueHoles.set(holeScore.hole, holeScore.points);
        }
      }
      return Array.from(uniqueHoles.values()).reduce((total, points) => total + points, 0);
    } else {
      return 0;
    }
  }
  // Memoized version of calculateTeamNetStrokes to improve performance
  calculateTeamNetStrokesMemoized = memoize(
    async (teamId, round) => {
      return this.calculateTeamNetStrokesCore(teamId, round);
    },
    {
      promise: true,
      maxAge: 3e4,
      // Cache for 30 seconds
      max: 100
      // Max 100 cached entries
    }
  );
  async calculateTeamNetStrokes(teamId, round) {
    return this.calculateTeamNetStrokesMemoized(teamId, round);
  }
  async calculateTeamNetStrokesCore(teamId, round) {
    const teamHoleScores = await db.select().from(holeScores).where(
      and(
        eq(holeScores.teamId, teamId),
        eq(holeScores.round, round)
      )
    );
    if (teamHoleScores.length === 0) {
      return 0;
    }
    if (round === 1) {
      const team = await this.getTeam(teamId);
      if (!team) return 0;
      const player1FirstName = team.player1Name?.split(" ")[0] || "";
      const player2FirstName = team.player2Name?.split(" ")[0] || "";
      let teamMembers = [];
      if (team.isThreePersonTeam && team.player3Name) {
        const player3FirstName = team.player3Name.split(" ")[0];
        teamMembers = await db.select().from(users).where(
          or(
            and(
              eq(users.firstName, player1FirstName),
              eq(users.lastName, team.player1Name?.split(" ")[1] || "")
            ),
            and(
              eq(users.firstName, player2FirstName),
              eq(users.lastName, team.player2Name?.split(" ")[1] || "")
            ),
            and(
              eq(users.firstName, player3FirstName),
              eq(users.lastName, team.player3Name?.split(" ")[1] || "")
            )
          )
        );
      } else {
        teamMembers = await db.select().from(users).where(
          or(
            and(
              eq(users.firstName, player1FirstName),
              eq(users.lastName, team.player1Name?.split(" ")[1] || "")
            ),
            and(
              eq(users.firstName, player2FirstName),
              eq(users.lastName, team.player2Name?.split(" ")[1] || "")
            )
          )
        );
      }
      if (teamMembers.length < 2) return 0;
      const holeScoresByHole = /* @__PURE__ */ new Map();
      for (const holeScore of teamHoleScores) {
        if (holeScore.strokes > 0) {
          if (!holeScoresByHole.has(holeScore.hole)) {
            holeScoresByHole.set(holeScore.hole, []);
          }
          holeScoresByHole.get(holeScore.hole).push(holeScore);
        }
      }
      let totalNetStrokes = 0;
      let holesCompleted = 0;
      for (const [holeNumber, holeScores2] of Array.from(holeScoresByHole.entries())) {
        const holeInfo = deerhurstCourse.holes.find((h) => h.number === holeNumber);
        if (!holeInfo) continue;
        const netScores = [];
        for (const holeScore of holeScores2) {
          const player = teamMembers.find((p) => p.id === holeScore.userId);
          if (!player) continue;
          const playerHandicap = player.handicap || 0;
          const grossScore = holeScore.strokes;
          const strokesReceived = Math.floor(playerHandicap / 18) + (holeInfo.handicap <= playerHandicap % 18 ? 1 : 0);
          const netScore = grossScore - strokesReceived;
          netScores.push(netScore);
        }
        if (netScores.length > 0) {
          let bestNetScore;
          if (team.isThreePersonTeam && netScores.length >= 2) {
            const playerNetScores = /* @__PURE__ */ new Map();
            holeScores2.forEach((holeScore, index2) => {
              const player = teamMembers.find((p) => p.id === holeScore.userId);
              if (player && netScores[index2] !== void 0) {
                playerNetScores.set(player.firstName, netScores[index2]);
              }
            });
            const jamesScore = playerNetScores.get("James");
            const nicScore = playerNetScores.get("Nic");
            const syeScore = playerNetScores.get("Sye");
            if (holeNumber >= 1 && holeNumber <= 6) {
              const availableScores = [jamesScore, nicScore].filter((score) => score !== void 0);
              bestNetScore = availableScores.length > 0 ? Math.min(...availableScores) : Math.min(...netScores);
              console.log(`\u{1F3CC}\uFE0F Team 7 Hole ${holeNumber} (James & Nic): James=${jamesScore}, Nic=${nicScore} \u2192 Best: ${bestNetScore}`);
            } else if (holeNumber >= 7 && holeNumber <= 9) {
              const availableScores = [nicScore, syeScore].filter((score) => score !== void 0);
              bestNetScore = availableScores.length > 0 ? Math.min(...availableScores) : Math.min(...netScores);
              console.log(`\u{1F3CC}\uFE0F Team 7 Hole ${holeNumber} (Nic & Sye): Nic=${nicScore}, Sye=${syeScore} \u2192 Best: ${bestNetScore}`);
            } else if (holeNumber >= 10 && holeNumber <= 12) {
              const availableScores = [jamesScore, syeScore].filter((score) => score !== void 0);
              bestNetScore = availableScores.length > 0 ? Math.min(...availableScores) : Math.min(...netScores);
              console.log(`\u{1F3CC}\uFE0F Team 7 Hole ${holeNumber} (James & Sye): James=${jamesScore}, Sye=${syeScore} \u2192 Best: ${bestNetScore}`);
            } else {
              bestNetScore = Math.min(...netScores);
              console.log(`\u{1F3CC}\uFE0F Team 7 Hole ${holeNumber} (All 3): James=${jamesScore}, Nic=${nicScore}, Sye=${syeScore} \u2192 Best: ${bestNetScore}`);
            }
          } else {
            bestNetScore = Math.min(...netScores);
          }
          totalNetStrokes += bestNetScore;
          holesCompleted++;
        }
      }
      return totalNetStrokes;
    } else if (round === 2) {
      const uniqueHoles = /* @__PURE__ */ new Map();
      for (const holeScore of teamHoleScores) {
        if (!uniqueHoles.has(holeScore.hole) && holeScore.strokes > 0) {
          uniqueHoles.set(holeScore.hole, holeScore.strokes);
        }
      }
      if (uniqueHoles.size === 0) {
        return 0;
      }
      const totalGrossStrokes = Array.from(uniqueHoles.values()).reduce((total, strokes) => total + strokes, 0);
      const team = await this.getTeam(teamId);
      if (!team) return 0;
      let teamHandicap;
      const teamMemberHandicaps = [];
      const player1 = await this.getUserByFullName(team.player1Name);
      if (player1) teamMemberHandicaps.push(player1.handicap || 0);
      const player2 = await this.getUserByFullName(team.player2Name);
      if (player2) teamMemberHandicaps.push(player2.handicap || 0);
      if (team.isThreePersonTeam && team.player3Name) {
        const player3 = await this.getUserByFullName(team.player3Name);
        if (player3) teamMemberHandicaps.push(player3.handicap || 0);
      }
      if (team.isThreePersonTeam && teamMemberHandicaps.length === 3) {
        teamMemberHandicaps.sort((a, b) => a - b);
        const [lowest, middle, highest] = teamMemberHandicaps;
        teamHandicap = Math.round(lowest * 0.2 + middle * 0.15 + highest * 0.1);
      } else if (teamMemberHandicaps.length >= 2) {
        const lowerHcp = Math.min(teamMemberHandicaps[0], teamMemberHandicaps[1]);
        const higherHcp = Math.max(teamMemberHandicaps[0], teamMemberHandicaps[1]);
        teamHandicap = Math.round(lowerHcp * 0.35 + higherHcp * 0.15);
      } else {
        teamHandicap = 0;
      }
      const totalNetStrokes = totalGrossStrokes - teamHandicap;
      const holesCompleted = uniqueHoles.size;
      console.log(`\u{1F3CC}\uFE0F Round 2 Net Strokes - Team ${team?.teamNumber}: ${totalNetStrokes} net strokes (${totalGrossStrokes} gross - ${teamHandicap} handicap, ${holesCompleted}/18 holes)`);
      return totalNetStrokes;
    } else {
      return 0;
    }
  }
  async calculateTeamGrossStrokes(teamId, round) {
    const teamHoleScores = await db.select().from(holeScores).where(
      and(
        eq(holeScores.teamId, teamId),
        eq(holeScores.round, round)
      )
    );
    if (teamHoleScores.length === 0) {
      return 0;
    }
    if (round === 1) {
      const holeMap = /* @__PURE__ */ new Map();
      for (const holeScore of teamHoleScores) {
        const hole = holeScore.hole;
        const strokes = holeScore.strokes;
        if (!holeMap.has(hole) || strokes < holeMap.get(hole)) {
          holeMap.set(hole, strokes);
        }
      }
      return Array.from(holeMap.values()).reduce((total, strokes) => total + strokes, 0);
    } else if (round === 2) {
      const uniqueHoles = /* @__PURE__ */ new Map();
      for (const holeScore of teamHoleScores) {
        if (!uniqueHoles.has(holeScore.hole) && holeScore.strokes > 0) {
          uniqueHoles.set(holeScore.hole, holeScore.strokes);
        }
      }
      return Array.from(uniqueHoles.values()).reduce((total, strokes) => total + strokes, 0);
    } else {
      return 0;
    }
  }
  async calculateMatchPlayPoints(teamId, round) {
    const team = await this.getTeam(teamId);
    if (!team) return 0;
    const player1 = await this.getUserByFullName(team.player1Name);
    const player2 = await this.getUserByFullName(team.player2Name);
    if (!player1 || !player2) return 0;
    const player1Points = await this.calculatePlayerMatchPlayPoints(player1.id);
    const player2Points = await this.calculatePlayerMatchPlayPoints(player2.id);
    return player1Points + player2Points;
  }
  async calculatePlayerMatchPlayPoints(playerId) {
    console.log(`\u{1F50D} Calculating match play points for player ${playerId}`);
    const playerHoleScores = await db.select().from(holeScores).where(
      and(
        eq(holeScores.userId, playerId),
        eq(holeScores.round, 3)
      )
    );
    if (playerHoleScores.length === 0) {
      console.log(`\u274C No Round 3 scores found for player ${playerId}`);
      return 0;
    }
    console.log(`\u2705 Found ${playerHoleScores.length} Round 3 scores for player ${playerId}`);
    const matches = await db.select().from(matchPlayMatches).where(
      or(
        eq(matchPlayMatches.player1Id, playerId),
        eq(matchPlayMatches.player2Id, playerId)
      )
    );
    let totalPoints = 0;
    console.log(`\u{1F4CA} Processing ${matches.length} matches for player ${playerId}`);
    for (const match of matches) {
      console.log(`\u{1F3AF} Processing match: ${match.holeSegment}`);
      const opponentId = match.player1Id === playerId ? match.player2Id : match.player1Id;
      const playerIsPlayer1 = match.player1Id === playerId;
      const opponentHoleScores = await db.select().from(holeScores).where(
        and(
          eq(holeScores.userId, opponentId),
          eq(holeScores.round, 3)
        )
      );
      const holeRanges = {
        "1-6": [1, 2, 3, 4, 5, 6],
        "7-12": [7, 8, 9, 10, 11, 12],
        "13-18": [13, 14, 15, 16, 17, 18]
      };
      const segmentHoles = holeRanges[match.holeSegment] || [];
      let playerHolesWon = 0;
      let opponentHolesWon = 0;
      let holesPlayed = 0;
      let segmentPoints = 0;
      let carryoverPoints = 1;
      let playerSegmentPoints = 0;
      let opponentSegmentPoints = 0;
      console.log(`   \u{1F3AF} Match ${match.holeSegment}: Starting 6-hole segment`);
      for (const hole of segmentHoles) {
        const playerScore = playerHoleScores.find((s) => s.hole === hole);
        const opponentScore = opponentHoleScores.find((s) => s.hole === hole);
        if (playerScore && opponentScore) {
          holesPlayed++;
          const playerNetScore = playerScore.netScore;
          const opponentNetScore = opponentScore.netScore;
          console.log(`   Hole ${hole}: Player ${playerNetScore} vs Opponent ${opponentNetScore} (${carryoverPoints} pts available)`);
          if (playerNetScore < opponentNetScore) {
            playerSegmentPoints += carryoverPoints;
            console.log(`   \u2192 Player wins hole ${hole} (+${carryoverPoints} points, Player total: ${playerSegmentPoints})`);
            carryoverPoints = 1;
          } else if (playerNetScore === opponentNetScore) {
            carryoverPoints += 1;
            console.log(`   \u2192 Hole ${hole} tied, carrying ${carryoverPoints} points to next hole`);
          } else {
            opponentSegmentPoints += carryoverPoints;
            console.log(`   \u2192 Opponent wins hole ${hole} (+${carryoverPoints} points, Opponent total: ${opponentSegmentPoints})`);
            carryoverPoints = 1;
          }
        }
      }
      if (playerSegmentPoints > opponentSegmentPoints) {
        segmentPoints = 4;
        console.log(`   \u{1F3C6} Player wins segment ${match.holeSegment} (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 4 points`);
      } else if (playerSegmentPoints === opponentSegmentPoints) {
        segmentPoints = 2;
        console.log(`   \u{1F91D} Segment ${match.holeSegment} tied (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 2 points`);
      } else {
        segmentPoints = 0;
        console.log(`   \u{1F494} Player loses segment ${match.holeSegment} (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 0 points`);
      }
      totalPoints += segmentPoints;
      console.log(`   \u{1F4C8} Segment ${match.holeSegment} total: ${segmentPoints} points (Running total: ${totalPoints})`);
    }
    console.log(`\u{1F3C1} Player ${playerId} total match play points: ${totalPoints}`);
    return totalPoints;
  }
  async updateScore(teamId, round, score, userId) {
    const existingScore = Array.from(this.scores.values()).find((s) => s.teamId === teamId);
    if (!existingScore) {
      throw new Error("Score not found");
    }
    const updatedScore = {
      ...existingScore,
      [`round${round}Points`]: score,
      updatedAt: /* @__PURE__ */ new Date()
    };
    updatedScore.totalPoints = (updatedScore.round1Points || 0) + (updatedScore.round2Points || 0) + (updatedScore.round3Points || 0);
    this.scores.set(existingScore.id, updatedScore);
    this.recalculateRanks();
    return updatedScore;
  }
  recalculateRanks() {
    const allScores = Array.from(this.scores.values());
    allScores.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    allScores.forEach((score, index2) => {
      score.rank = index2 + 1;
      this.scores.set(score.id, score);
    });
  }
  async getSideBets() {
    await this.autoDeclineExpiredBets();
    const bets2 = await db.select().from(sideBets).orderBy(asc(sideBets.round), asc(sideBets.createdAt));
    return bets2;
  }
  async autoDeclineExpiredBets() {
    const { getBetDeadline: getBetDeadline2 } = await Promise.resolve().then(() => (init_tournamentConfig(), tournamentConfig_exports));
    const now = /* @__PURE__ */ new Date();
    for (const round of [1, 2, 3]) {
      const deadline = getBetDeadline2(round);
      if (now > deadline) {
        const expiredBets = await db.select().from(sideBets).where(
          sql`${sideBets.round} = ${round} AND ${sideBets.status} IN ('Pending', 'Partially Accepted')`
        );
        for (const bet of expiredBets) {
          await db.update(sideBets).set({
            status: "Declined",
            result: "Auto-declined - missed 1 hour deadline",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(sideBets.id, bet.id));
          console.log(`\u{1F431} AUTO-DECLINE: Bet ${bet.id} for Round ${round} auto-declined due to missed deadline`);
        }
      }
    }
  }
  async createSideBet(insertSideBet) {
    const { getBetDeadline: getBetDeadline2 } = await Promise.resolve().then(() => (init_tournamentConfig(), tournamentConfig_exports));
    const deadline = getBetDeadline2(insertSideBet.round);
    const now = /* @__PURE__ */ new Date();
    if (now > deadline) {
      throw new Error(`Cannot create bet for Round ${insertSideBet.round} - deadline has passed. Bets must be created 1 hour before round start.`);
    }
    const [sideBet] = await db.insert(sideBets).values({
      ...insertSideBet,
      status: insertSideBet.status || "Pending",
      result: insertSideBet.result || "Pending"
    }).returning();
    return sideBet;
  }
  async updateSideBetResult(betId, result) {
    const [updatedBet] = await db.update(sideBets).set({ result, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sideBets.id, betId)).returning();
    if (!updatedBet) {
      throw new Error("Side bet not found");
    }
    return updatedBet;
  }
  async updateSideBetStatus(betId, status) {
    const [updatedBet] = await db.update(sideBets).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sideBets.id, betId)).returning();
    if (!updatedBet) {
      throw new Error("Side bet not found");
    }
    return updatedBet;
  }
  async checkBetDeadline(round) {
    const { getBetDeadline: getBetDeadline2 } = await Promise.resolve().then(() => (init_tournamentConfig(), tournamentConfig_exports));
    const deadline = getBetDeadline2(round);
    const now = /* @__PURE__ */ new Date();
    const passed = now > deadline;
    let timeLeft;
    if (!passed) {
      const msLeft = deadline.getTime() - now.getTime();
      const hoursLeft = Math.floor(msLeft / (1e3 * 60 * 60));
      const minutesLeft = Math.floor(msLeft % (1e3 * 60 * 60) / (1e3 * 60));
      timeLeft = `${hoursLeft}h ${minutesLeft}m`;
    }
    return { passed, deadline, timeLeft };
  }
  async updateTeammateAcceptance(betId, userName) {
    const [currentBet] = await db.select().from(sideBets).where(eq(sideBets.id, betId));
    if (!currentBet) {
      throw new Error("Side bet not found");
    }
    if (!currentBet.isTeamBet) {
      throw new Error("This is not a team bet");
    }
    const isOpponentTeammate = userName === currentBet.opponentTeammate;
    const isMainOpponent = userName === currentBet.opponentName;
    if (!isOpponentTeammate && !isMainOpponent) {
      throw new Error("You are not authorized to accept this bet");
    }
    let newStatus = currentBet.status;
    if (isMainOpponent && currentBet.status === "Pending") {
      newStatus = currentBet.teammateAccepted ? "Accepted" : "Partially Accepted";
    }
    if (isOpponentTeammate) {
      const teammateAccepted = true;
      newStatus = currentBet.status === "Partially Accepted" ? "Accepted" : "Partially Accepted";
      const [updatedBet2] = await db.update(sideBets).set({
        teammateAccepted,
        status: newStatus,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(sideBets.id, betId)).returning();
      return updatedBet2;
    }
    const [updatedBet] = await db.update(sideBets).set({
      status: newStatus,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(sideBets.id, betId)).returning();
    return updatedBet;
  }
  // Chat Messages
  async getChatMessages() {
    const messages = await db.select({
      id: chatMessages.id,
      userId: chatMessages.userId,
      message: chatMessages.message,
      taggedUserIds: chatMessages.taggedUserIds,
      createdAt: chatMessages.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    }).from(chatMessages).leftJoin(users, eq(chatMessages.userId, users.id)).orderBy(asc(chatMessages.createdAt));
    return messages;
  }
  async createChatMessage(messageData) {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    const [fullMessage] = await db.select({
      id: chatMessages.id,
      userId: chatMessages.userId,
      message: chatMessages.message,
      taggedUserIds: chatMessages.taggedUserIds,
      createdAt: chatMessages.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    }).from(chatMessages).leftJoin(users, eq(chatMessages.userId, users.id)).where(eq(chatMessages.id, message.id));
    return fullMessage;
  }
  async addWitnessVote(betId, witnessName, winnerName) {
    const [currentBet] = await db.select().from(sideBets).where(eq(sideBets.id, betId));
    if (!currentBet) {
      throw new Error("Side bet not found");
    }
    const currentVotes = currentBet.witnessVotes || {};
    currentVotes[witnessName] = winnerName;
    const voteCounts = {};
    for (const vote of Object.values(currentVotes)) {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    }
    const totalVotes = Object.keys(currentVotes).length;
    const majority = Math.floor(totalVotes / 2) + 1;
    let finalWinner = currentBet.winnerName;
    let finalResult = currentBet.result;
    for (const [candidate, count] of Object.entries(voteCounts)) {
      if (count >= majority) {
        finalWinner = candidate;
        finalResult = candidate === currentBet.betterName ? "Won" : "Lost";
        break;
      }
    }
    const [updatedBet] = await db.update(sideBets).set({
      witnessVotes: currentVotes,
      winnerName: finalWinner,
      result: finalResult,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(sideBets.id, betId)).returning();
    return updatedBet;
  }
  async markBetForResolution(betId) {
    const [updatedBet] = await db.update(sideBets).set({ readyForResolution: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sideBets.id, betId)).returning();
    if (!updatedBet) {
      throw new Error("Side bet not found");
    }
    return updatedBet;
  }
  async getPhotos() {
    return Array.from(this.photos.values()).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }
  async createPhoto(insertPhoto) {
    const id = this.currentPhotoId++;
    const photo = {
      id,
      filename: insertPhoto.filename,
      caption: insertPhoto.caption || null,
      imageUrl: insertPhoto.imageUrl || null,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
  async getMatchups() {
    return await db.select().from(matchups).orderBy(matchups.round, matchups.groupNumber);
  }
  async getMatchupsByRound(round) {
    return await db.select().from(matchups).where(eq(matchups.round, round));
  }
  async createMatchup(insertMatchup) {
    const [newMatchup] = await db.insert(matchups).values(insertMatchup).returning();
    return newMatchup;
  }
  async updateMatchupScore(matchupId, player1Score, player2Score) {
    const [updatedMatchup] = await db.update(matchups).set({
      player1Score,
      player2Score
    }).where(eq(matchups.id, matchupId)).returning();
    if (!updatedMatchup) {
      throw new Error(`Matchup with id ${matchupId} not found`);
    }
    return updatedMatchup;
  }
  async clearAllMatchups() {
    await db.delete(matchups);
  }
  async shuffleMatchupsForRound(round, shuffledMatchups) {
    await db.delete(matchups).where(eq(matchups.round, round));
    if (shuffledMatchups.length > 0) {
      const newMatchups = await db.insert(matchups).values(shuffledMatchups).returning();
      return newMatchups;
    }
    return [];
  }
  // Match Play Methods (Round 3)
  async getMatchPlayGroups() {
    return await db.select().from(matchPlayGroups);
  }
  async createMatchPlayGroup(group) {
    const [newGroup] = await db.insert(matchPlayGroups).values(group).returning();
    return newGroup;
  }
  async getMatchPlayMatches(groupNumber) {
    try {
      const result = groupNumber ? await db.execute(sql`SELECT * FROM match_play_matches WHERE group_number = ${groupNumber}`) : await db.execute(sql`SELECT * FROM match_play_matches`);
      return result.rows.map((row) => ({
        id: row.id,
        groupId: row.group_number,
        player1Id: row.player1_id,
        player2Id: row.player2_id,
        player1Name: row.player1_name,
        player2Name: row.player2_name,
        player1Handicap: row.player1_handicap,
        player2Handicap: row.player2_handicap,
        holes: row.hole_segment,
        strokesGiven: row.strokes_given,
        strokeRecipientId: row.stroke_recipient_id,
        strokeHoles: row.stroke_holes,
        winnerId: row.winner_id,
        result: row.result,
        pointsAwarded: row.points_awarded,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error("Error fetching match play matches:", error);
      return [];
    }
  }
  async createMatchPlayMatch(match) {
    const [newMatch] = await db.insert(matchPlayMatches).values(match).returning();
    return newMatch;
  }
  async updateMatchPlayResult(matchId, winnerId, result, pointsAwarded) {
    const [updatedMatch] = await db.update(matchPlayMatches).set({
      winnerId,
      result,
      pointsAwarded,
      matchStatus: "completed",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(matchPlayMatches.id, matchId)).returning();
    return updatedMatch;
  }
  async getCurrentMatchForPlayer(playerId, currentHole) {
    let holeSegment;
    if (currentHole >= 1 && currentHole <= 6) {
      holeSegment = "1-6";
    } else if (currentHole >= 7 && currentHole <= 12) {
      holeSegment = "7-12";
    } else if (currentHole >= 13 && currentHole <= 18) {
      holeSegment = "13-18";
    } else {
      return null;
    }
    try {
      const result = await db.execute(sql`
        SELECT * FROM match_play_matches 
        WHERE hole_segment = ${holeSegment} 
        AND (player1_id = ${playerId} OR player2_id = ${playerId})
      `);
      const match = result.rows[0];
      console.log("Found match:", match);
      if (!match) {
        return null;
      }
      return {
        id: match.id,
        groupId: match.group_number,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        player1Name: match.player1_name,
        player2Name: match.player2_name,
        player1Handicap: match.player1_handicap,
        player2Handicap: match.player2_handicap,
        holes: match.hole_segment,
        strokesGiven: match.strokes_given,
        strokeRecipientId: match.stroke_recipient_id,
        strokeHoles: match.stroke_holes,
        winnerId: match.winner_id,
        result: match.result,
        pointsAwarded: match.points_awarded,
        createdAt: match.created_at
      };
    } catch (error) {
      console.error("Error fetching current match:", error);
      return null;
    }
  }
  // Boozelympics operations
  async getBoozelympicsGames() {
    return await db.select().from(boozelympicsGames).where(eq(boozelympicsGames.isActive, true));
  }
  async createBoozelympicsGame(game) {
    const [newGame] = await db.insert(boozelympicsGames).values(game).returning();
    return newGame;
  }
  async getBoozelympicsMatches(gameId) {
    let query = db.select().from(boozelympicsMatches);
    if (gameId) {
      query = query.where(eq(boozelympicsMatches.gameId, gameId));
    }
    return await query;
  }
  async createBoozelympicsMatch(match) {
    const [newMatch] = await db.insert(boozelympicsMatches).values(match).returning();
    return newMatch;
  }
  async getBoozelympicsLeaderboard() {
    const matches = await db.select().from(boozelympicsMatches);
    const teamStats = /* @__PURE__ */ new Map();
    for (const match of matches) {
      if (match.winnerTeamId) {
        if (!teamStats.has(match.winnerTeamId)) {
          teamStats.set(match.winnerTeamId, { teamId: match.winnerTeamId, points: 0, wins: 0 });
        }
        const stats = teamStats.get(match.winnerTeamId);
        stats.points += (match.points || 3) + (match.bonusPoints || 0);
        stats.wins += 1;
      }
    }
    const leaderboard = [];
    for (const [teamId, stats] of teamStats) {
      const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
      if (team) {
        leaderboard.push({
          ...stats,
          team
        });
      }
    }
    return leaderboard.sort((a, b) => b.points - a.points);
  }
  // Golf Relay operations  
  async getGolfRelayMatches() {
    return await db.select().from(golfRelayMatches).orderBy(golfRelayMatches.createdAt);
  }
  async createGolfRelayMatch(match) {
    const [newMatch] = await db.insert(golfRelayMatches).values(match).returning();
    return newMatch;
  }
  async getGolfRelayLeaderboard() {
    const matches = await db.select().from(golfRelayMatches);
    const playerStats = /* @__PURE__ */ new Map();
    for (const match of matches) {
      if (!playerStats.has(match.playerId)) {
        playerStats.set(match.playerId, {
          playerId: match.playerId,
          totalRuns: 0,
          bestTime: null,
          totalTime: 0
        });
      }
      const stats = playerStats.get(match.playerId);
      stats.totalRuns += 1;
      stats.totalTime += match.timeMs;
      if (!stats.bestTime || match.timeMs < stats.bestTime) {
        stats.bestTime = match.timeMs;
      }
    }
    const leaderboard = [];
    for (const [playerId, stats] of playerStats) {
      const [user] = await db.select().from(users).where(eq(users.id, playerId));
      if (user) {
        leaderboard.push({
          ...stats,
          user,
          averageTime: stats.totalRuns > 0 ? Math.round(stats.totalTime / stats.totalRuns) : null
        });
      }
    }
    return leaderboard.sort((a, b) => {
      if (!a.bestTime) return 1;
      if (!b.bestTime) return -1;
      return a.bestTime - b.bestTime;
    });
  }
  async getRegistration(userId, tournamentYear) {
    const [registration] = await db.select().from(registrations).where(and(eq(registrations.userId, userId), eq(registrations.tournamentYear, tournamentYear)));
    return registration ?? null;
  }
  async upsertRegistration(registration) {
    const existing = await this.getRegistration(registration.userId, registration.tournamentYear);
    if (existing) {
      const [updated] = await db.update(registrations).set({
        ...registration,
        registeredAt: registration.registeredAt ?? /* @__PURE__ */ new Date()
      }).where(eq(registrations.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(registrations).values(registration).returning();
    return created;
  }
  async getRegistrationsByYear(tournamentYear) {
    return await db.select().from(registrations).where(eq(registrations.tournamentYear, tournamentYear)).orderBy(asc(registrations.createdAt));
  }
  async markCtpPaid(userId, tournamentYear, round, paymentIntentId) {
    const existing = await this.getRegistration(userId, tournamentYear);
    const baseRegistration = existing ?? await this.upsertRegistration({
      userId,
      tournamentYear,
      entryPaid: false
    });
    const updates = {
      ctpPaymentIntentIds: {
        ...baseRegistration.ctpPaymentIntentIds ?? {},
        [`round${round}`]: paymentIntentId
      }
    };
    if (round === 1) updates.ctpRound1Paid = true;
    if (round === 2) updates.ctpRound2Paid = true;
    if (round === 3) updates.ctpRound3Paid = true;
    const [updated] = await db.update(registrations).set(updates).where(eq(registrations.id, baseRegistration.id)).returning();
    return updated;
  }
  async createBet(bet) {
    const [created] = await db.insert(bets).values(bet).returning();
    return created;
  }
  async getBetsByYear(tournamentYear) {
    return await db.select().from(bets).where(eq(bets.tournamentYear, tournamentYear)).orderBy(asc(bets.createdAt));
  }
  async acceptBet(betId, opponentId, opponentPaymentIntentId) {
    const [updated] = await db.update(bets).set({
      opponentId,
      opponentPaymentIntentId,
      status: "matched"
    }).where(eq(bets.id, betId)).returning();
    return updated;
  }
  async settleBet(betId, winnerId) {
    const [updated] = await db.update(bets).set({
      winnerId,
      status: "settled",
      settledAt: /* @__PURE__ */ new Date()
    }).where(eq(bets.id, betId)).returning();
    return updated;
  }
  async cancelBet(betId) {
    const [updated] = await db.update(bets).set({ status: "cancelled" }).where(eq(bets.id, betId)).returning();
    return updated;
  }
  async createShot(shot) {
    const [created] = await db.insert(shots).values(shot).returning();
    return created;
  }
  async getShotsForUserRound(userId, tournamentYear, round) {
    return await db.select().from(shots).where(and(eq(shots.userId, userId), eq(shots.tournamentYear, tournamentYear), eq(shots.round, round))).orderBy(asc(shots.timestamp));
  }
  async createTournamentVote(vote, options) {
    const [createdVote] = await db.insert(tournamentVotes).values(vote).returning();
    const createdOptions = options.length ? await db.insert(voteOptions).values(options.map((option) => ({ ...option, voteId: createdVote.id }))).returning() : [];
    return { vote: createdVote, options: createdOptions };
  }
  async getTournamentVotesByYear(tournamentYear) {
    const votes = await db.select().from(tournamentVotes).where(eq(tournamentVotes.tournamentYear, tournamentYear)).orderBy(asc(tournamentVotes.createdAt));
    const results = [];
    for (const vote of votes) {
      const options = await db.select().from(voteOptions).where(eq(voteOptions.voteId, vote.id)).orderBy(asc(voteOptions.id));
      results.push({ ...vote, options });
    }
    return results;
  }
  async castTournamentVote(playerVoteData) {
    const existing = await db.select().from(playerVotes).where(and(eq(playerVotes.voteId, playerVoteData.voteId), eq(playerVotes.userId, playerVoteData.userId)));
    if (existing.length > 0) {
      const [updated] = await db.update(playerVotes).set({
        optionId: playerVoteData.optionId,
        votedAt: /* @__PURE__ */ new Date()
      }).where(eq(playerVotes.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(playerVotes).values(playerVoteData).returning();
    return created;
  }
  async closeTournamentVote(voteId) {
    const [updated] = await db.update(tournamentVotes).set({ status: "closed" }).where(eq(tournamentVotes.id, voteId)).returning();
    return updated;
  }
  async setTournamentVoteWinner(voteId, winningOptionId) {
    const [updated] = await db.update(tournamentVotes).set({ winningOptionId }).where(eq(tournamentVotes.id, voteId)).returning();
    return updated;
  }
  async createGuestApplication(application) {
    const [created] = await db.insert(guestApplications).values(application).returning();
    return created;
  }
  async getGuestApplicationsByYear(tournamentYear) {
    const applications = await db.select().from(guestApplications).where(eq(guestApplications.tournamentYear, tournamentYear)).orderBy(asc(guestApplications.createdAt));
    const results = [];
    for (const application of applications) {
      const votes = await db.select().from(guestApplicationVotes).where(eq(guestApplicationVotes.applicationId, application.id)).orderBy(asc(guestApplicationVotes.createdAt));
      results.push({ ...application, votes });
    }
    return results;
  }
  async voteGuestApplication(vote) {
    const existing = await db.select().from(guestApplicationVotes).where(and(eq(guestApplicationVotes.applicationId, vote.applicationId), eq(guestApplicationVotes.voterUserId, vote.voterUserId)));
    let storedVote;
    if (existing.length > 0) {
      const [updated] = await db.update(guestApplicationVotes).set({ vote: vote.vote, votedAt: /* @__PURE__ */ new Date() }).where(eq(guestApplicationVotes.id, existing[0].id)).returning();
      storedVote = updated;
    } else {
      const [created] = await db.insert(guestApplicationVotes).values(vote).returning();
      storedVote = created;
    }
    const votes = await db.select().from(guestApplicationVotes).where(eq(guestApplicationVotes.applicationId, vote.applicationId));
    const votesYes = votes.filter((value) => value.vote === "yes").length;
    const votesNo = votes.filter((value) => value.vote === "no").length;
    await db.update(guestApplications).set({ votesYes, votesNo }).where(eq(guestApplications.id, vote.applicationId));
    return storedVote;
  }
  // Team Hole Scores (for scramble format)
  async getTeamHoleScores(teamId, round) {
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) {
      return [];
    }
    const teamMembers = await db.select().from(users).where(eq(users.teamId, teamId));
    if (!teamMembers.length) {
      return [];
    }
    for (const member of teamMembers) {
      const scores3 = await db.select().from(holeScores).where(and(eq(holeScores.userId, member.id), eq(holeScores.round, round))).orderBy(asc(holeScores.hole));
      if (scores3.length > 0) {
        return scores3;
      }
    }
    return [];
  }
  async updateTeamHoleScore(teamId, round, hole, strokes, userId) {
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) {
      throw new Error("Team not found");
    }
    const teamMembers = await db.select().from(users).where(eq(users.teamId, teamId));
    if (!teamMembers.length) {
      throw new Error("No team members found");
    }
    const { getCourseForRound: getCourseForRound3 } = await Promise.resolve().then(() => (init_courseData(), courseData_exports));
    const course = getCourseForRound3(round);
    const holeData = course.holes.find((h) => h.number === hole);
    if (!holeData) {
      throw new Error(`Hole ${hole} not found for round ${round}`);
    }
    const lowerHcp = Math.min(team[0].player1Handicap || 0, team[0].player2Handicap || 0);
    const higherHcp = Math.max(team[0].player1Handicap || 0, team[0].player2Handicap || 0);
    const teamHandicap = Math.round(lowerHcp * 0.35 + higherHcp * 0.15);
    const strokesReceived = teamHandicap >= holeData.handicap ? 1 : 0;
    const netScore = strokes - strokesReceived;
    const netToPar = netScore - holeData.par;
    let stablefordPoints = 0;
    let returnHoleScore;
    for (const member of teamMembers) {
      const existingScore = await db.select().from(holeScores).where(and(
        eq(holeScores.userId, member.id),
        eq(holeScores.round, round),
        eq(holeScores.hole, hole)
      )).limit(1);
      if (existingScore.length > 0) {
        const [updatedScore] = await db.update(holeScores).set({
          strokes,
          points: stablefordPoints,
          netScore,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(holeScores.id, existingScore[0].id)).returning();
        returnHoleScore = updatedScore;
      } else {
        const [newScore] = await db.insert(holeScores).values({
          userId: member.id,
          teamId,
          round,
          hole,
          strokes,
          par: holeData.par,
          handicap: holeData.handicap,
          points: stablefordPoints,
          netScore,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        returnHoleScore = newScore;
      }
    }
    return returnHoleScore;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize2 from "memoizee";
import connectPg from "connect-pg-simple";
var replitAuthConfigured = !!process.env.REPLIT_DOMAINS;
var getOidcConfig = memoize2(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Only require HTTPS in production
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  console.log("Replit Auth user upsert skipped during tournament");
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  if (!replitAuthConfigured) {
    console.log("REPLIT_DOMAINS not set \u2014 Replit OAuth disabled, using custom auth only");
    return;
  }
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/routes.ts
import { z } from "zod";

// server/stripe.ts
import crypto from "crypto";
var STRIPE_API_BASE = "https://api.stripe.com/v1";
function getStripeSecretKey() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }
  return process.env.STRIPE_SECRET_KEY;
}
async function createCheckoutSession(params) {
  const secretKey = getStripeSecretKey();
  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("success_url", params.successUrl);
  form.append("cancel_url", params.cancelUrl);
  form.append("line_items[0][price_data][currency]", params.currency ?? "cad");
  form.append("line_items[0][price_data][product_data][name]", params.description);
  form.append("line_items[0][price_data][unit_amount]", String(params.amountCents));
  form.append("line_items[0][quantity]", "1");
  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      form.append(`metadata[${key}]`, value);
      form.append(`payment_intent_data[metadata][${key}]`, value);
    }
  }
  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to create Stripe checkout session");
  }
  return {
    id: data.id,
    url: data.url ?? null,
    payment_intent: data.payment_intent ?? null,
    metadata: data.metadata ?? null
  };
}
function verifyStripeWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required");
  }
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signaturePart = parts.find((part) => part.startsWith("v1="));
  if (!timestampPart || !signaturePart) {
    return false;
  }
  const timestamp2 = timestampPart.slice(2);
  const signature = signaturePart.slice(3);
  const signedPayload = `${timestamp2}.${rawBody.toString("utf8")}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// server/routes.ts
async function requireAuth(req, res, next) {
  if (req.session?.user) {
    try {
      const fullUser = await storage.getUser(req.session.user.id);
      if (fullUser) {
        req.user = fullUser;
        return next();
      }
    } catch (error) {
      console.error("Error fetching user from session:", error);
    }
  }
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}
async function requireRegistration(req, res, next) {
  const year = Number(req.body?.tournamentYear ?? req.query?.year ?? (/* @__PURE__ */ new Date()).getFullYear());
  const registration = await storage.getRegistration(req.user.id, year);
  if (!registration?.entryPaid) {
    return res.status(403).json({ error: "Registration required" });
  }
  req.registrationYear = year;
  return next();
}
async function requireAdmin(req, res, next) {
  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  const fullName = `${user.firstName} ${user.lastName}`;
  if (!["Nick Grossi", "Connor Patterson"].includes(fullName)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}
async function generateRound3MatchupsOnce(storage2) {
  const presetGroupings = [
    {
      groupNumber: 1,
      players: [
        { id: 13, name: "Nick Grossi" },
        // Nick Grossi
        { id: 19, name: "Nick Cook" },
        // Nick Cook  
        { id: 14, name: "James Ogilvie" },
        // James Ogilvie (Team 7 - Player 3)
        { id: 15, name: "Johnny Magnatta" }
        // Johnny Magnatta
      ]
    },
    {
      groupNumber: 2,
      players: [
        { id: 20, name: "Connor Patterson" },
        // Connor Patterson
        { id: 16, name: "Erik Boudreau" },
        // Erik Boudreau
        { id: 21, name: "Christian Hauck" },
        // Christian Hauck
        { id: 26, name: "Sye Ellard" }
        // Sye Ellard (Team 7 - Player 2)
      ]
    },
    {
      groupNumber: 3,
      players: [
        { id: 18, name: "Will Bibbings" },
        // Will Bibbings
        { id: 23, name: "Jeffrey Reiner" },
        // Jeffrey Reiner
        { id: 24, name: "Nic Huxley" },
        // Nic Huxley (Team 7 - Player 1)
        { id: 25, name: "Bailey Carlson" }
        // Bailey Carlson
      ]
    },
    {
      groupNumber: 4,
      players: [
        { id: 22, name: "Spencer Reid" },
        // Spencer Reid
        { id: 27, name: "Jordan Kreller" },
        // Jordan Kreller
        { id: 28, name: "Kevin Durco" }
        // Kevin Durco
      ]
    }
  ];
  const matchups2 = [];
  for (const group of presetGroupings) {
    if (group.players.length === 4) {
      const players = group.players;
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[3].id,
        player1Name: players[0].name,
        player2Name: players[3].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[3].id,
        player1Name: players[1].name,
        player2Name: players[3].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[2].id,
        player2Id: players[3].id,
        player1Name: players[2].name,
        player2Name: players[3].name
      });
    } else if (group.players.length === 3) {
      const players = group.players;
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      matchups2.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
    }
  }
  return matchups2;
}
async function generateRound2Matchups(storage2) {
  const teams2 = [
    { player1: { id: 13, name: "Nick Grossi" }, player2: { id: 20, name: "Connor Patterson" } },
    { player1: { id: 21, name: "Christian Hauck" }, player2: { id: 25, name: "Bailey Carlson" } },
    { player1: { id: 16, name: "Erik Boudreau" }, player2: { id: 18, name: "Will Bibbings" } },
    { player1: { id: 19, name: "Nick Cook" }, player2: { id: 28, name: "Kevin Durco" } },
    { player1: { id: 22, name: "Spencer Reid" }, player2: { id: 23, name: "Jeffrey Reiner" } },
    { player1: { id: 15, name: "Johnny Magnatta" }, player2: { id: 27, name: "Jordan Kreller" } },
    { player1: { id: 24, name: "Nic Huxley" }, player2: { id: 26, name: "Sye Ellard" }, player3: { id: 14, name: "James Ogilvie" } }
    // Team 7 (3-person team)
  ];
  const shuffledTeams = [...teams2].sort(() => Math.random() - 0.5);
  const matchups2 = [];
  const playerPool = [];
  shuffledTeams.forEach((team) => {
    if (team.player3) {
      playerPool.push(team.player1, team.player2, team.player3);
    } else if (team.player2) {
      playerPool.push(team.player1, team.player2);
    } else {
      playerPool.push(team.player1);
    }
  });
  let groupNumber = 1;
  for (let i = 0; i < playerPool.length; i += 4) {
    const foursome = playerPool.slice(i, i + 4);
    if (foursome.length === 4) {
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: foursome[3].id,
        player1Name: foursome[2].name,
        player2Name: foursome[3].name
      });
      groupNumber++;
    } else if (foursome.length === 3) {
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: null,
        player1Name: foursome[2].name,
        player2Name: "Solo Player"
      });
      groupNumber++;
    } else if (foursome.length === 2) {
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      groupNumber++;
    } else if (foursome.length === 1) {
      matchups2.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: null,
        player1Name: foursome[0].name,
        player2Name: "Solo Player"
      });
      groupNumber++;
    }
  }
  return matchups2;
}
async function generateRound1Matchups(storage2) {
  const allPlayers = [
    { id: 13, name: "Nick Grossi" },
    { id: 14, name: "James Ogilvie" },
    { id: 15, name: "Johnny Magnatta" },
    { id: 16, name: "Erik Boudreau" },
    { id: 18, name: "Will Bibbings" },
    { id: 19, name: "Nick Cook" },
    { id: 20, name: "Connor Patterson" },
    { id: 21, name: "Christian Hauck" },
    { id: 22, name: "Spencer Reid" },
    { id: 23, name: "Jeffrey Reiner" },
    { id: 24, name: "Nic Huxley" },
    { id: 25, name: "Bailey Carlson" },
    { id: 26, name: "Sye Ellard" },
    { id: 27, name: "Jordan Kreller" },
    { id: 28, name: "Kevin Durco" }
  ];
  const round2Pairs = /* @__PURE__ */ new Set();
  const round3Pairs = /* @__PURE__ */ new Set();
  const teams2 = [
    [13, 20],
    [21, 25],
    [16, 18],
    [19, 28],
    [22, 23],
    [15, 27],
    [24, 26, 14]
  ];
  teams2.forEach((team) => {
    const pair = team.sort().join("-");
    round2Pairs.add(pair);
  });
  const round3Groups = [
    [13, 19, 14, 15],
    // Nick Grossi, Nick Cook, James Ogilvie, Johnny Magnatta
    [20, 16, 21, 26],
    // Connor Patterson, Erik Boudreau, Christian Hauck, Sye Ellard
    [18, 23, 24, 25],
    // Will Bibbings, Jeffrey Reiner, Nic Huxley, Bailey Carlson
    [22, 27, 28]
    // Spencer Reid, Jordan Kreller, Kevin Durco
  ];
  round3Groups.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const pair = [group[i], group[j]].sort().join("-");
        round3Pairs.add(pair);
      }
    }
  });
  const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
  const matchups2 = [];
  let groupNumber = 1;
  for (let i = 0; i < shuffledPlayers.length; i += 4) {
    const foursome = shuffledPlayers.slice(i, i + 4);
    if (foursome.length === 4) {
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: foursome[3].id,
        player1Name: foursome[2].name,
        player2Name: foursome[3].name
      });
      groupNumber++;
    } else if (foursome.length === 3) {
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: null,
        player1Name: foursome[2].name,
        player2Name: "Solo Player"
      });
      groupNumber++;
    } else if (foursome.length === 2) {
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      groupNumber++;
    } else if (foursome.length === 1) {
      matchups2.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: null,
        player1Name: foursome[0].name,
        player2Name: "Solo Player"
      });
      groupNumber++;
    }
  }
  return matchups2;
}
async function registerRoutes(app2) {
  app2.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });
  app2.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/healthz", (req, res) => {
    res.status(200).send("OK");
  });
  await setupAuth(app2);
  app2.post("/api/login", async (req, res) => {
    try {
      const { playerName, password } = req.body;
      if (!playerName || !password) {
        return res.status(400).json({ error: "Player name and password are required" });
      }
      const nameParts = playerName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const user = await storage.getUserByName(firstName, lastName);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (password !== user.password) {
        console.log(`\u{1F510} Updating password for ${firstName} ${lastName} from "${user.password}" to "${password}"`);
        await storage.updateUser(user.id, { password });
        console.log(`\u2705 Password updated successfully for ${firstName} ${lastName}`);
      }
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      };
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { playerName, password } = req.body;
      if (!playerName || !password) {
        return res.status(400).json({ error: "Player name and password are required" });
      }
      const nameParts = playerName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const existingUser = await storage.getUserByName(firstName, lastName);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const newUser = await storage.createUser({
        firstName,
        lastName,
        password: "abc123",
        // Simple password for tournament
        handicap: 20
      });
      req.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };
      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      if (req.session?.user) {
        const user = await storage.getUser(req.session.user.id);
        if (user) {
          return res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          });
        }
      }
      if (req.isAuthenticated && req.isAuthenticated()) {
        const user = req.user;
        if (user?.claims?.sub) {
          return res.json({
            id: user.claims.sub,
            firstName: user.claims.given_name || "User",
            lastName: user.claims.family_name || ""
          });
        }
      }
      res.status(401).json({ error: "Not authenticated" });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    if (req.session?.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else if (req.logout) {
      req.logout(() => {
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });
  const httpServer = createServer(app2);
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024
      // 10MB limit
    }
  });
  const broadcast = (message) => {
  };
  app2.get("/api/config", (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
    });
  });
  app2.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      const isValid = verifyStripeWebhookSignature(rawBody, signature);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid Stripe signature" });
      }
      const event = JSON.parse(rawBody.toString("utf8"));
      const eventType = event?.type;
      const eventData = event?.data?.object;
      const metadata = eventData?.metadata ?? {};
      if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
        const userId = Number(metadata.userId);
        const year = Number(metadata.year);
        if (userId && year) {
          if (metadata.type === "entry_fee") {
            await storage.upsertRegistration({
              userId,
              tournamentYear: year,
              entryPaid: true,
              entryPaymentIntentId: eventData.payment_intent ?? metadata.paymentIntentId ?? null,
              entryAmountCents: Number(metadata.amountCents ?? 15e3)
            });
          }
          if (metadata.type === "ctp_fee") {
            const round = Number(metadata.round);
            if ([1, 2, 3].includes(round)) {
              await storage.markCtpPaid(userId, year, round, eventData.payment_intent ?? metadata.paymentIntentId ?? "");
            }
          }
        }
      }
      return res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.get("/api/registrations/:year/me", requireAuth, async (req, res) => {
    try {
      const year = Number(req.params.year);
      const registration = await storage.getRegistration(req.user.id, year);
      res.json(registration);
    } catch (error) {
      console.error("Failed to fetch registration:", error);
      res.status(500).json({ error: "Failed to fetch registration" });
    }
  });
  app2.get("/api/registrations/:year", requireAuth, requireAdmin, async (req, res) => {
    try {
      const year = Number(req.params.year);
      const registrations2 = await storage.getRegistrationsByYear(year);
      res.json(registrations2);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });
  app2.post("/api/registrations/entry-checkout", requireAuth, async (req, res) => {
    try {
      const year = Number(req.body.year ?? (/* @__PURE__ */ new Date()).getFullYear());
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session2 = await createCheckoutSession({
        amountCents: 15e3,
        currency: "cad",
        successUrl: `${baseUrl}/registration?status=success&year=${year}`,
        cancelUrl: `${baseUrl}/registration?status=cancelled&year=${year}`,
        description: `The Gambler ${year} Entry Fee`,
        metadata: {
          type: "entry_fee",
          userId: String(req.user.id),
          year: String(year),
          amountCents: "15000"
        }
      });
      await storage.upsertRegistration({
        userId: req.user.id,
        tournamentYear: year,
        entryPaid: false,
        entryPaymentIntentId: session2.payment_intent ?? void 0,
        entryAmountCents: 15e3
      });
      res.json({ checkoutUrl: session2.url, sessionId: session2.id });
    } catch (error) {
      console.error("Failed to create entry checkout:", error);
      res.status(500).json({ error: "Failed to create entry checkout" });
    }
  });
  app2.post("/api/registrations/ctp-checkout", requireAuth, requireRegistration, async (req, res) => {
    try {
      const round = Number(req.body.round);
      if (![1, 2, 3].includes(round)) {
        return res.status(400).json({ error: "Round must be 1, 2, or 3" });
      }
      const year = req.registrationYear;
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session2 = await createCheckoutSession({
        amountCents: 3e3,
        currency: "cad",
        successUrl: `${baseUrl}/registration?status=ctp-success&round=${round}&year=${year}`,
        cancelUrl: `${baseUrl}/registration?status=ctp-cancelled&round=${round}&year=${year}`,
        description: `CTP Round ${round}`,
        metadata: {
          type: "ctp_fee",
          userId: String(req.user.id),
          year: String(year),
          round: String(round),
          amountCents: "3000"
        }
      });
      res.json({ checkoutUrl: session2.url, sessionId: session2.id });
    } catch (error) {
      console.error("Failed to create CTP checkout:", error);
      res.status(500).json({ error: "Failed to create CTP checkout" });
    }
  });
  app2.post("/api/bets", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = req.registrationYear;
      const amountCents = Number(req.body.amountCents);
      if (!amountCents || amountCents < 500 || amountCents > 5e4) {
        return res.status(400).json({ error: "Amount must be between $5 and $500 CAD" });
      }
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session2 = await createCheckoutSession({
        amountCents,
        currency: "cad",
        successUrl: `${baseUrl}/betting?status=create-success`,
        cancelUrl: `${baseUrl}/betting?status=create-cancelled`,
        description: `Bet Escrow - ${req.body.description ?? "Custom Bet"}`,
        metadata: {
          type: "bet_create",
          userId: String(req.user.id),
          year: String(year),
          amountCents: String(amountCents)
        }
      });
      const createdBet = await storage.createBet({
        creatorId: req.user.id,
        opponentId: req.body.opponentId ?? null,
        tournamentYear: year,
        description: req.body.description,
        amountCents,
        type: req.body.type ?? "custom",
        round: req.body.round ?? null,
        hole: req.body.hole ?? null,
        status: "open",
        creatorPaymentIntentId: session2.payment_intent ?? void 0
      });
      res.json({ bet: createdBet, checkoutUrl: session2.url, sessionId: session2.id });
    } catch (error) {
      console.error("Failed to create bet:", error);
      res.status(500).json({ error: "Failed to create bet" });
    }
  });
  app2.get("/api/bets", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = Number(req.query.year ?? req.registrationYear ?? (/* @__PURE__ */ new Date()).getFullYear());
      const bets2 = await storage.getBetsByYear(year);
      res.json(bets2);
    } catch (error) {
      console.error("Failed to fetch bets:", error);
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });
  app2.post("/api/bets/:id/accept", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = req.registrationYear;
      const betId = Number(req.params.id);
      const allBets = await storage.getBetsByYear(year);
      const existingBet = allBets.find((bet) => bet.id === betId);
      if (!existingBet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const session2 = await createCheckoutSession({
        amountCents: existingBet.amountCents,
        currency: "cad",
        successUrl: `${baseUrl}/betting?status=accept-success`,
        cancelUrl: `${baseUrl}/betting?status=accept-cancelled`,
        description: `Bet Accept - #${existingBet.id}`,
        metadata: {
          type: "bet_accept",
          userId: String(req.user.id),
          betId: String(existingBet.id),
          year: String(year)
        }
      });
      const updated = await storage.acceptBet(existingBet.id, req.user.id, session2.payment_intent ?? "");
      res.json({ bet: updated, checkoutUrl: session2.url, sessionId: session2.id });
    } catch (error) {
      console.error("Failed to accept bet:", error);
      res.status(500).json({ error: "Failed to accept bet" });
    }
  });
  app2.post("/api/bets/:id/settle", requireAuth, requireAdmin, async (req, res) => {
    try {
      const betId = Number(req.params.id);
      const winnerId = Number(req.body.winnerId);
      const updated = await storage.settleBet(betId, winnerId);
      res.json(updated);
    } catch (error) {
      console.error("Failed to settle bet:", error);
      res.status(500).json({ error: "Failed to settle bet" });
    }
  });
  app2.post("/api/bets/:id/cancel", requireAuth, async (req, res) => {
    try {
      const betId = Number(req.params.id);
      const updated = await storage.cancelBet(betId);
      res.json(updated);
    } catch (error) {
      console.error("Failed to cancel bet:", error);
      res.status(500).json({ error: "Failed to cancel bet" });
    }
  });
  app2.post("/api/guest-applications", requireAuth, requireRegistration, async (req, res) => {
    try {
      const created = await storage.createGuestApplication({
        applicantUserId: req.user.id,
        guestName: req.body.guestName,
        guestRelationship: req.body.guestRelationship ?? null,
        reason: req.body.reason ?? null,
        tournamentYear: req.registrationYear,
        status: "pending"
      });
      res.json(created);
    } catch (error) {
      console.error("Failed to create guest application:", error);
      res.status(500).json({ error: "Failed to create guest application" });
    }
  });
  app2.get("/api/guest-applications", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = Number(req.query.year ?? req.registrationYear);
      const applications = await storage.getGuestApplicationsByYear(year);
      res.json(applications);
    } catch (error) {
      console.error("Failed to fetch guest applications:", error);
      res.status(500).json({ error: "Failed to fetch guest applications" });
    }
  });
  app2.post("/api/guest-applications/:id/vote", requireAuth, requireRegistration, async (req, res) => {
    try {
      const applicationId = Number(req.params.id);
      const vote = String(req.body.vote);
      if (!["yes", "no"].includes(vote)) {
        return res.status(400).json({ error: "Vote must be yes or no" });
      }
      const createdVote = await storage.voteGuestApplication({
        applicationId,
        voterUserId: req.user.id,
        vote
      });
      res.json(createdVote);
    } catch (error) {
      console.error("Failed to vote guest application:", error);
      res.status(500).json({ error: "Failed to vote guest application" });
    }
  });
  app2.post("/api/tournament-votes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const year = Number(req.body.tournamentYear ?? (/* @__PURE__ */ new Date()).getFullYear());
      const options = Array.isArray(req.body.options) ? req.body.options : [];
      if (options.length < 2 || options.length > 5) {
        return res.status(400).json({ error: "Vote requires 2 to 5 options" });
      }
      const created = await storage.createTournamentVote({
        tournamentYear: year,
        category: req.body.category ?? "custom",
        title: req.body.title,
        description: req.body.description ?? null,
        status: "open",
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
        createdBy: req.user.id
      }, options.map((option) => ({
        voteId: 0,
        optionText: option.optionText,
        description: option.description ?? null,
        imageUrl: option.imageUrl ?? null
      })));
      res.json(created);
    } catch (error) {
      console.error("Failed to create tournament vote:", error);
      res.status(500).json({ error: "Failed to create tournament vote" });
    }
  });
  app2.get("/api/tournament-votes", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = Number(req.query.year ?? req.registrationYear);
      const votes = await storage.getTournamentVotesByYear(year);
      res.json(votes);
    } catch (error) {
      console.error("Failed to fetch tournament votes:", error);
      res.status(500).json({ error: "Failed to fetch tournament votes" });
    }
  });
  app2.post("/api/tournament-votes/:id/vote", requireAuth, requireRegistration, async (req, res) => {
    try {
      const voteId = Number(req.params.id);
      const optionId = Number(req.body.optionId);
      const createdVote = await storage.castTournamentVote({
        voteId,
        userId: req.user.id,
        optionId
      });
      res.json(createdVote);
    } catch (error) {
      console.error("Failed to cast tournament vote:", error);
      res.status(500).json({ error: "Failed to cast tournament vote" });
    }
  });
  app2.post("/api/tournament-votes/:id/close", requireAuth, requireAdmin, async (req, res) => {
    try {
      const voteId = Number(req.params.id);
      const updated = await storage.closeTournamentVote(voteId);
      res.json(updated);
    } catch (error) {
      console.error("Failed to close tournament vote:", error);
      res.status(500).json({ error: "Failed to close tournament vote" });
    }
  });
  app2.post("/api/tournament-votes/:id/winner", requireAuth, requireAdmin, async (req, res) => {
    try {
      const voteId = Number(req.params.id);
      const winningOptionId = Number(req.body.winningOptionId);
      const updated = await storage.setTournamentVoteWinner(voteId, winningOptionId);
      res.json(updated);
    } catch (error) {
      console.error("Failed to set tournament vote winner:", error);
      res.status(500).json({ error: "Failed to set tournament vote winner" });
    }
  });
  app2.post("/api/shots", requireAuth, requireRegistration, async (req, res) => {
    try {
      const shot = await storage.createShot({
        userId: req.user.id,
        tournamentYear: req.registrationYear,
        round: Number(req.body.round),
        hole: Number(req.body.hole),
        shotNumber: Number(req.body.shotNumber),
        lat: req.body.lat ? String(req.body.lat) : null,
        lng: req.body.lng ? String(req.body.lng) : null,
        accuracyMeters: req.body.accuracyMeters ? String(req.body.accuracyMeters) : null,
        detectedBy: req.body.detectedBy ?? "manual"
      });
      res.json(shot);
    } catch (error) {
      console.error("Failed to log shot:", error);
      res.status(500).json({ error: "Failed to log shot" });
    }
  });
  app2.get("/api/shots", requireAuth, requireRegistration, async (req, res) => {
    try {
      const year = Number(req.query.year ?? req.registrationYear);
      const round = Number(req.query.round ?? 1);
      const shots2 = await storage.getShotsForUserRound(req.user.id, year, round);
      res.json(shots2);
    } catch (error) {
      console.error("Failed to fetch shots:", error);
      res.status(500).json({ error: "Failed to fetch shots" });
    }
  });
  app2.get("/api/golf-course/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      const response = await fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ"
        }
      });
      if (!response.ok) {
        console.error(`Golf API search failed: ${response.status}`);
        return res.status(response.status).json({ error: "Golf API search failed" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching golf course:", error);
      res.status(500).json({ error: "Failed to search golf course" });
    }
  });
  app2.get("/api/golf-course/details/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const response = await fetch(`https://api.golfcourseapi.com/v1/courses/${courseId}`, {
        headers: {
          Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ"
        }
      });
      if (!response.ok) {
        console.error(`Golf API details failed: ${response.status}`);
        return res.status(response.status).json({ error: "Golf API details failed" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      res.status(500).json({ error: "Failed to fetch course details" });
    }
  });
  app2.get("/api/golf-course/tournament-courses", async (req, res) => {
    try {
      const [deerhurstResponse, muskokaBayResponse] = await Promise.all([
        fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent("Deerhurst Highlands Golf Course")}`, {
          headers: { Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ" }
        }),
        fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent("Muskoka Bay Golf Club")}`, {
          headers: { Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ" }
        })
      ]);
      const [deerhurstData, muskokaBayData] = await Promise.all([
        deerhurstResponse.ok ? deerhurstResponse.json() : null,
        muskokaBayResponse.ok ? muskokaBayResponse.json() : null
      ]);
      const deerhurstCourse2 = deerhurstData?.courses?.[0];
      const muskokaBayCourse2 = muskokaBayData?.courses?.[0];
      const [deerhurstDetails, muskokaBayDetails] = await Promise.all([
        deerhurstCourse2 ? fetch(`https://api.golfcourseapi.com/v1/courses/${deerhurstCourse2.id}`, {
          headers: { Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ" }
        }).then((r) => r.ok ? r.json() : null) : null,
        muskokaBayCourse2 ? fetch(`https://api.golfcourseapi.com/v1/courses/${muskokaBayCourse2.id}`, {
          headers: { Authorization: "Key ERJJTZFDF7ZIKRUE76RRDOKLXQ" }
        }).then((r) => r.ok ? r.json() : null) : null
      ]);
      res.json({
        deerhurst: deerhurstDetails,
        muskokaBay: muskokaBayDetails
      });
    } catch (error) {
      console.error("Error fetching tournament courses:", error);
      res.status(500).json({ error: "Failed to fetch tournament courses" });
    }
  });
  app2.get("/api/players", async (req, res) => {
    try {
      const teams2 = await storage.getTeams();
      const allPlayers = teams2.flatMap((team) => [
        { name: team.player1Name, teamId: team.id, playerNumber: 1 },
        { name: team.player2Name, teamId: team.id, playerNumber: 2 }
      ]);
      const existingUsers = await storage.getAllUsers();
      const registeredPlayerNames = existingUsers.map((user) => `${user.firstName} ${user.lastName}`);
      const availablePlayers = allPlayers.filter(
        (player) => !registeredPlayerNames.includes(player.name)
      ).sort((a, b) => a.name.localeCompare(b.name));
      res.json(availablePlayers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });
  app2.post("/api/initialize-database", async (req, res) => {
    try {
      const existingTeams = await storage.getTeams();
      if (existingTeams.length > 0) {
        return res.json({ message: "Database already initialized", teams: existingTeams.length });
      }
      console.log("Initializing database with tournament data...");
      const teamsData = [
        { teamNumber: 1, player1Name: "Nick Grossi", player1Handicap: 8, player2Name: "Connor Patterson", player2Handicap: 6 },
        { teamNumber: 2, player1Name: "Christian Hauck", player1Handicap: 12, player2Name: "Bailey Carlson", player2Handicap: 15 },
        { teamNumber: 3, player1Name: "Erik Boudreau", player1Handicap: 8, player2Name: "Will Bibbings", player2Handicap: 6 },
        { teamNumber: 4, player1Name: "Nick Cook", player1Handicap: 10, player2Name: "Kevin Durco", player2Handicap: 12 },
        { teamNumber: 5, player1Name: "Spencer Reid", player1Handicap: 7, player2Name: "Jeffrey Reiner", player2Handicap: 9 },
        { teamNumber: 6, player1Name: "Johnny Magnatta", player1Handicap: 9, player2Name: "Jordan Kreller", player2Handicap: 5 },
        {
          teamNumber: 7,
          player1Name: "Nic Huxley",
          player1Handicap: 8,
          player2Name: "Sye Ellard",
          player2Handicap: 6,
          player3Name: "James Ogilvie",
          player3Handicap: 9,
          isThreePersonTeam: true
        }
      ];
      const createdTeams = [];
      for (const teamData of teamsData) {
        const totalHandicap = teamData.isThreePersonTeam ? teamData.player1Handicap + teamData.player2Handicap + (teamData.player3Handicap || 0) : teamData.player1Handicap + teamData.player2Handicap;
        const team = await storage.createTeam({
          ...teamData,
          totalHandicap
        });
        createdTeams.push(team);
        console.log(`Created team ${team.teamNumber}: ${team.player1Name} & ${team.player2Name}${team.player3Name ? ` & ${team.player3Name}` : ""}`);
      }
      const playersData = [
        { firstName: "Nick", lastName: "Grossi", handicap: 8 },
        { firstName: "Connor", lastName: "Patterson", handicap: 6 },
        { firstName: "Christian", lastName: "Hauck", handicap: 12 },
        { firstName: "Bailey", lastName: "Carlson", handicap: 15 },
        { firstName: "Erik", lastName: "Boudreau", handicap: 8 },
        { firstName: "Will", lastName: "Bibbings", handicap: 6 },
        { firstName: "Nick", lastName: "Cook", handicap: 10 },
        { firstName: "Kevin", lastName: "Durco", handicap: 12 },
        { firstName: "Spencer", lastName: "Reid", handicap: 7 },
        { firstName: "Jeffrey", lastName: "Reiner", handicap: 9 },
        { firstName: "Johnny", lastName: "Magnatta", handicap: 9 },
        { firstName: "Jordan", lastName: "Kreller", handicap: 5 },
        { firstName: "Nic", lastName: "Huxley", handicap: 8 },
        { firstName: "Sye", lastName: "Ellard", handicap: 6 },
        { firstName: "James", lastName: "Ogilvie", handicap: 9 }
      ];
      const createdUsers = [];
      for (const playerData of playersData) {
        const existingUser = await storage.getUserByName(playerData.firstName, playerData.lastName);
        if (!existingUser) {
          const user = await storage.createUser({
            ...playerData,
            password: "abc123"
            // Simple password for tournament convenience
          });
          createdUsers.push(user);
          console.log(`Created user: ${user.firstName} ${user.lastName}`);
        } else {
          createdUsers.push(existingUser);
        }
      }
      res.json({
        message: "Database initialized successfully",
        teamsCreated: createdTeams.length,
        usersCreated: createdUsers.length,
        totalPlayers: createdUsers.length
      });
    } catch (error) {
      console.error("Database initialization error:", error);
      res.status(500).json({ error: "Failed to initialize database" });
    }
  });
  app2.get("/api/registered-players", async (req, res) => {
    try {
      const existingUsers = await storage.getAllUsers();
      const registeredPlayers = existingUsers.map((user) => ({
        name: `${user.firstName} ${user.lastName}`,
        userId: user.id
      })).sort((a, b) => a.name.localeCompare(b.name));
      res.json(registeredPlayers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registered players" });
    }
  });
  app2.get("/api/teams", async (req, res) => {
    try {
      const teams2 = await storage.getTeams();
      res.json(teams2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { playerName, password } = req.body;
      if (!playerName || !password) {
        return res.status(400).json({ error: "Player name and password are required" });
      }
      const nameParts = playerName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const existingUser = await storage.getUserByName(firstName, lastName);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const newUser = await storage.createUser({
        firstName,
        lastName,
        password: "abc123",
        // Simple password for tournament
        handicap: 20
      });
      req.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };
      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      if (req.session?.user) {
        const user = await storage.getUser(req.session.user.id);
        if (user) {
          return res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          });
        }
      }
      if (req.isAuthenticated && req.isAuthenticated()) {
        const user = req.user;
        if (user?.claims?.sub) {
          return res.json({
            id: user.claims.sub,
            firstName: user.claims.given_name || "User",
            lastName: user.claims.family_name || ""
          });
        }
      }
      res.status(401).json({ error: "Not authenticated" });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    if (req.session?.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } else if (req.logout) {
      req.logout(() => {
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });
  app2.get("/api/teams", async (req, res) => {
    try {
      const teams2 = await storage.getTeams();
      res.json(teams2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });
  app2.get("/api/team/by-player/:playerName", async (req, res) => {
    try {
      const { playerName } = req.params;
      const teams2 = await storage.getTeams();
      const team = teams2.find(
        (t) => t.player1Name === playerName || t.player2Name === playerName
      );
      if (!team) {
        return res.status(404).json({ error: "Team not found for player" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users3 = await storage.getAllUsers();
      res.json(users3);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/scores", async (req, res) => {
    try {
      const scores3 = await storage.getCalculatedScores();
      res.json(scores3);
    } catch (error) {
      console.error("Error fetching calculated scores:", error);
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });
  app2.get("/api/live-scores", async (req, res) => {
    try {
      const liveScores = await storage.getLiveScores();
      res.json(liveScores);
    } catch (error) {
      console.error("Error fetching live scores:", error);
      res.status(500).json({ error: "Failed to fetch live scores" });
    }
  });
  app2.post("/api/scores", requireAuth, async (req, res) => {
    try {
      const { teamId, round, score } = req.body;
      const userId = req.user.id;
      if (!teamId || !round || score === void 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can edit scores" });
      }
      const updatedScore = await storage.updateScore(teamId, round, score, userId);
      broadcast({
        type: "SCORE_UPDATE",
        data: updatedScore
      });
      res.json(updatedScore);
    } catch (error) {
      res.status(500).json({ error: "Failed to update score" });
    }
  });
  app2.get("/api/sidebets", async (req, res) => {
    try {
      const sideBets2 = await storage.getSideBets();
      res.json(sideBets2);
    } catch (error) {
      console.error("Error fetching side bets:", error);
      res.status(500).json({ error: "Failed to fetch side bets" });
    }
  });
  app2.post("/api/sidebets", async (req, res) => {
    try {
      const validated = insertSideBetSchema.parse(req.body);
      const sideBet = await storage.createSideBet(validated);
      broadcast({
        type: "SIDE_BET_CREATED",
        data: sideBet
      });
      res.json(sideBet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating side bet:", error);
        res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create side bet" });
      }
    }
  });
  app2.patch("/api/sidebets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { result } = req.body;
      const updatedSideBet = await storage.updateSideBetResult(parseInt(id), result);
      broadcast({
        type: "SIDE_BET_UPDATE",
        data: updatedSideBet
      });
      res.json(updatedSideBet);
    } catch (error) {
      res.status(500).json({ error: "Failed to update side bet" });
    }
  });
  app2.patch("/api/sidebets/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedSideBet = await storage.updateSideBetStatus(parseInt(id), status);
      broadcast({
        type: "SIDE_BET_STATUS_UPDATE",
        data: updatedSideBet
      });
      res.json(updatedSideBet);
    } catch (error) {
      res.status(500).json({ error: "Failed to update side bet status" });
    }
  });
  app2.patch("/api/sidebets/:id/teammate-accept", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const userName = `${user.firstName} ${user.lastName}`;
      const updatedSideBet = await storage.updateTeammateAcceptance(parseInt(id), userName);
      broadcast({
        type: "SIDE_BET_TEAMMATE_ACCEPTED",
        data: updatedSideBet
      });
      res.json(updatedSideBet);
    } catch (error) {
      console.error("Error accepting team bet:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to accept team bet" });
    }
  });
  app2.get("/api/sidebets/deadline/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const deadlineInfo = await storage.checkBetDeadline(round);
      res.json(deadlineInfo);
    } catch (error) {
      console.error("Error checking bet deadline:", error);
      res.status(500).json({ error: "Failed to check bet deadline" });
    }
  });
  app2.post("/api/sidebets/:id/witness-vote", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { winnerName } = req.body;
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const witnessName = `${user.firstName} ${user.lastName}`;
      const updatedSideBet = await storage.addWitnessVote(parseInt(id), witnessName, winnerName);
      broadcast({
        type: "WITNESS_VOTE",
        data: updatedSideBet
      });
      res.json(updatedSideBet);
    } catch (error) {
      console.error("Error recording witness vote:", error);
      res.status(500).json({ error: "Failed to record witness vote" });
    }
  });
  app2.patch("/api/sidebets/:id/ready-for-resolution", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can mark bets for resolution" });
      }
      const updatedSideBet = await storage.markBetForResolution(parseInt(id));
      broadcast({
        type: "BET_READY_FOR_RESOLUTION",
        data: updatedSideBet
      });
      res.json(updatedSideBet);
    } catch (error) {
      console.error("Error marking bet for resolution:", error);
      res.status(500).json({ error: "Failed to mark bet for resolution" });
    }
  });
  app2.get("/api/photos", async (req, res) => {
    try {
      const photos3 = await storage.getPhotos();
      res.json(photos3);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });
  app2.post("/api/photos", async (req, res) => {
    try {
      const validated = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validated);
      broadcast({
        type: "PHOTO_UPLOADED",
        data: photo
      });
      res.json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to upload photo" });
      }
    }
  });
  app2.post("/api/photos/upload", requireAuth, upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No photo file provided" });
      }
      const { caption = "" } = req.body;
      const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const photo = await storage.createPhoto({
        filename: req.file.originalname,
        caption,
        imageUrl
      });
      broadcast({
        type: "PHOTO_UPLOADED",
        data: photo
      });
      res.json(photo);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });
  app2.get("/api/matchups", async (req, res) => {
    try {
      const matchups2 = await storage.getMatchups();
      res.json(matchups2);
    } catch (error) {
      console.error("Error fetching matchups:", error);
      res.status(500).json({ error: "Failed to fetch matchups" });
    }
  });
  app2.post("/api/matchups/init-round3", requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.firstName !== "Nick" || currentUser.lastName !== "Grossi") {
        return res.status(403).json({ error: "Only Nick Grossi can initialize Round 3 matchups" });
      }
      const existingMatchups = await storage.getMatchups();
      const round3Exists = existingMatchups.some((m) => m.round === 3);
      if (round3Exists) {
        return res.status(400).json({ error: "Round 3 matchups already exist" });
      }
      const round3Matchups = await generateRound3MatchupsOnce(storage);
      const newMatchups = await storage.shuffleMatchupsForRound(3, round3Matchups);
      broadcast({
        type: "MATCHUPS_SHUFFLED",
        data: { round: 3, matchups: newMatchups }
      });
      res.json(newMatchups);
    } catch (error) {
      console.error("Error initializing Round 3 matchups:", error);
      res.status(500).json({ error: "Failed to initialize Round 3 matchups" });
    }
  });
  app2.post("/api/admin/recalculate-scores", requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.firstName !== "Nick" || currentUser.lastName !== "Grossi") {
        return res.status(403).json({ error: "Only Nick Grossi can recalculate scores" });
      }
      await storage.recalculateAllHoleScores();
      res.json({ success: true, message: "All hole scores recalculated successfully" });
    } catch (error) {
      console.error("Error recalculating hole scores:", error);
      res.status(500).json({ error: "Failed to recalculate hole scores" });
    }
  });
  app2.post("/api/matchups", async (req, res) => {
    try {
      const matchup = await storage.createMatchup(req.body);
      res.status(201).json(matchup);
    } catch (error) {
      console.error("Error creating matchup:", error);
      res.status(500).json({ error: "Failed to create matchup" });
    }
  });
  app2.post("/api/matchups/shuffle", requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.id !== 13) {
        console.log("Auth failed - User:", currentUser);
        return res.status(403).json({ error: "Only Nick Grossi can shuffle matchups" });
      }
      const { round } = req.body;
      console.log("Shuffle request received for round:", round);
      if (!round) {
        return res.status(400).json({ error: "Round is required" });
      }
      if (round === 3) {
        return res.status(400).json({ error: "Round 3 has fixed preset groupings and cannot be shuffled" });
      }
      let generatedMatchups = [];
      if (round === 1) {
        generatedMatchups = await generateRound1Matchups(storage);
      } else if (round === 2) {
        generatedMatchups = await generateRound2Matchups(storage);
      }
      const newMatchups = await storage.shuffleMatchupsForRound(round, generatedMatchups);
      broadcast({
        type: "MATCHUPS_SHUFFLED",
        data: { round, matchups: newMatchups }
      });
      res.json(newMatchups);
    } catch (error) {
      console.error("Error shuffling matchups:", error);
      if (error instanceof Error) {
        console.error("Full error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        res.status(500).json({ error: "Failed to shuffle matchups", details: error.message });
      } else {
        res.status(500).json({ error: "Failed to shuffle matchups" });
      }
    }
  });
  app2.put("/api/matchups/:id/score", requireAuth, async (req, res) => {
    try {
      const matchupId = parseInt(req.params.id);
      const { player1Score, player2Score } = req.body;
      const matchup = await storage.updateMatchupScore(matchupId, player1Score, player2Score);
      broadcast({
        type: "MATCHUP_SCORE_UPDATE",
        data: matchup
      });
      res.json(matchup);
    } catch (error) {
      console.error("Error updating matchup score:", error);
      res.status(500).json({ error: "Failed to update matchup score" });
    }
  });
  app2.post("/api/matchups/initialize-round3", requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.id !== 13) {
        console.log("Auth failed - User:", currentUser);
        return res.status(403).json({ error: "Only Nick Grossi can initialize Round 3 matchups" });
      }
      console.log("Round 3 initialization request received");
      const existingMatchups = await storage.getMatchupsByRound(3);
      if (existingMatchups && existingMatchups.length > 0) {
        return res.status(400).json({ error: "Round 3 matchups already initialized" });
      }
      const round3Matchups = await generateRound3MatchupsOnce(storage);
      const newMatchups = await storage.shuffleMatchupsForRound(3, round3Matchups);
      broadcast({
        type: "MATCHUPS_INITIALIZED",
        data: { round: 3, matchups: newMatchups }
      });
      res.json(newMatchups);
    } catch (error) {
      console.error("Error initializing Round 3 matchups:", error);
      if (error instanceof Error) {
        console.error("Full error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        res.status(500).json({ error: "Failed to initialize Round 3 matchups", details: error.message });
      } else {
        res.status(500).json({ error: "Failed to initialize Round 3 matchups" });
      }
    }
  });
  app2.get("/api/my-hole-scores/:round", requireAuth, async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const userId = req.user.id;
      const holeScores2 = await storage.getHoleScores(userId, round);
      res.json(holeScores2);
    } catch (error) {
      console.error("Error fetching hole scores:", error);
      res.status(500).json({ error: "Failed to fetch hole scores" });
    }
  });
  app2.get("/api/player-hole-scores/:userId/:round", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const round = parseInt(req.params.round);
      const holeScores2 = await storage.getHoleScores(userId, round);
      res.json(holeScores2);
    } catch (error) {
      console.error("Error fetching player hole scores:", error);
      res.status(500).json({ error: "Failed to fetch player hole scores" });
    }
  });
  app2.get("/api/hole-scores/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const allHoleScores = await storage.getAllHoleScoresForRound(round);
      res.json(allHoleScores);
    } catch (error) {
      console.error("Error fetching all hole scores for round:", error);
      res.status(500).json({ error: "Failed to fetch hole scores for round" });
    }
  });
  app2.post("/api/hole-scores", requireAuth, async (req, res) => {
    try {
      const { round, hole, strokes } = req.body;
      const userId = req.user.id;
      console.log("=== REGULAR ROUND SCORE SAVE ATTEMPT ===");
      console.log("User ID:", userId);
      console.log("Round:", round);
      console.log("Hole:", hole);
      console.log("Strokes:", strokes);
      if (!round || !hole || strokes === void 0) {
        console.log("\u274C Missing required fields:", { round, hole, strokes });
        return res.status(400).json({ error: "Missing required fields: round, hole, strokes" });
      }
      if (strokes < 1 || strokes > 15) {
        console.log("\u274C Invalid strokes value:", strokes);
        return res.status(400).json({ error: "Invalid strokes value. Must be between 1 and 15." });
      }
      if (strokes === 0) {
        console.log("\u274C Zero strokes not allowed:", strokes);
        return res.status(400).json({ error: "Score cannot be zero. Please select a valid score." });
      }
      if (hole < 1 || hole > 18) {
        console.log("\u274C Invalid hole number:", hole);
        return res.status(400).json({ error: "Invalid hole number. Must be between 1 and 18." });
      }
      console.log("\u2705 Validation passed, updating score...");
      const holeScore = await storage.updateHoleScore(userId, round, hole, strokes);
      console.log("\u2705 Score updated successfully:", holeScore);
      const scoreDiff = strokes - holeScore.par;
      if (scoreDiff <= -1) {
        const user = await storage.getUser(userId);
        const playerName = user ? `${user.firstName} ${user.lastName}` : "Unknown Player";
        let scoreName = "Birdie";
        if (scoreDiff <= -3) scoreName = "Albatross";
        else if (scoreDiff === -2) scoreName = "Eagle";
        console.log(`\u{1F3AF} BIRDIE ALERT: ${playerName} scored ${scoreName} on hole ${hole}!`);
        broadcast({
          type: "BIRDIE_NOTIFICATION",
          data: {
            playerName,
            holeNumber: hole,
            scoreName,
            round
          }
        });
      }
      broadcast({
        type: "HOLE_SCORE_UPDATE",
        data: { holeScore, userId, round, hole }
      });
      res.json(holeScore);
    } catch (error) {
      console.error("Error updating hole score:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to update hole score", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/hole-scores/:round/:hole", requireAuth, async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const hole = parseInt(req.params.hole);
      const { score } = req.body;
      const userId = req.user.id;
      console.log("=== ROUND-SPECIFIC SCORE SAVE ATTEMPT ===");
      console.log("User ID:", userId);
      console.log("Round:", round);
      console.log("Hole:", hole);
      console.log("Score:", score);
      if (!round || !hole || score === void 0) {
        console.log("\u274C Missing required fields:", { round, hole, score });
        return res.status(400).json({ error: "Missing required fields: round, hole, score" });
      }
      if (score < 1 || score > 15) {
        console.log("\u274C Invalid score value:", score);
        return res.status(400).json({ error: "Invalid score value" });
      }
      if (hole < 1 || hole > 18) {
        console.log("\u274C Invalid hole number:", hole);
        return res.status(400).json({ error: "Invalid hole number. Must be between 1 and 18." });
      }
      console.log("\u2705 Validation passed, updating score...");
      const holeScore = await storage.updateHoleScore(userId, round, hole, score);
      console.log("\u2705 Score updated successfully:", holeScore);
      const scoreDiff = score - holeScore.par;
      if (scoreDiff <= -1) {
        const user = await storage.getUser(userId);
        const playerName = user ? `${user.firstName} ${user.lastName}` : "Unknown Player";
        let scoreName = "Birdie";
        if (scoreDiff <= -3) scoreName = "Albatross";
        else if (scoreDiff === -2) scoreName = "Eagle";
        console.log(`\u{1F3AF} BIRDIE ALERT: ${playerName} scored ${scoreName} on hole ${hole}!`);
        broadcast({
          type: "BIRDIE_NOTIFICATION",
          data: {
            playerName,
            holeNumber: hole,
            scoreName,
            round
          }
        });
      }
      broadcast({
        type: "HOLE_SCORE_UPDATE",
        data: { holeScore, userId, round, hole }
      });
      res.json(holeScore);
    } catch (error) {
      console.error("Error updating round-specific hole score:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to update hole score", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.patch("/api/hole-scores/:round/:hole/stats", requireAuth, async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const hole = parseInt(req.params.hole);
      const userId = req.user.id;
      const statsData = req.body;
      console.log("Updating hole statistics:", { userId, round, hole, statsData });
      if (!round || !hole) {
        return res.status(400).json({ error: "Missing required fields: round, hole" });
      }
      if (hole < 1 || hole > 18) {
        console.log("\u274C Invalid hole number:", hole);
        return res.status(400).json({ error: "Invalid hole number. Must be between 1 and 18." });
      }
      const holeScore = await storage.updateHoleScoreStats(userId, round, hole, statsData);
      broadcast({
        type: "HOLE_STATS_UPDATE",
        data: { holeScore, userId, round, hole }
      });
      res.json(holeScore);
    } catch (error) {
      console.error("Error updating hole statistics:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to update hole statistics", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/team-hole-scores/:round", requireAuth, async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const userFullName = `${user.firstName} ${user.lastName}`;
      const teams2 = await storage.getTeams();
      const team = teams2.find(
        (t) => t.player1Name === userFullName || t.player2Name === userFullName || t.player3Name === userFullName
      );
      if (!team) {
        return res.status(404).json({ error: "Team not found for user" });
      }
      const teamHoleScores = await storage.getTeamHoleScores(team.id, round);
      res.json(teamHoleScores);
    } catch (error) {
      console.error("Error fetching team hole scores:", error);
      res.status(500).json({ error: "Failed to fetch team hole scores" });
    }
  });
  app2.post("/api/team-hole-scores", requireAuth, async (req, res) => {
    try {
      const { round, hole, strokes } = req.body;
      const userId = req.user.id;
      console.log("=== TEAM SCRAMBLE SCORE SAVE ATTEMPT ===");
      console.log("User ID:", userId);
      console.log("Round:", round);
      console.log("Hole:", hole);
      console.log("Strokes:", strokes);
      if (!round || !hole || strokes === void 0) {
        console.log("\u274C Missing required fields:", { round, hole, strokes });
        return res.status(400).json({ error: "Missing required fields: round, hole, strokes" });
      }
      if (strokes < 1 || strokes > 15) {
        console.log("\u274C Invalid strokes value:", strokes);
        return res.status(400).json({ error: "Invalid strokes value. Must be between 1 and 15." });
      }
      if (strokes === 0) {
        console.log("\u274C Zero strokes not allowed:", strokes);
        return res.status(400).json({ error: "Score cannot be zero. Please select a valid score." });
      }
      if (hole < 1 || hole > 18) {
        console.log("\u274C Invalid hole number:", hole);
        return res.status(400).json({ error: "Invalid hole number. Must be between 1 and 18." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const userFullName = `${user.firstName} ${user.lastName}`;
      console.log("Looking for team containing user:", userFullName);
      const teams2 = await storage.getTeams();
      const team = teams2.find(
        (t) => t.player1Name === userFullName || t.player2Name === userFullName
      );
      if (!team) {
        console.log("\u274C No team found for user:", userFullName);
        console.log("Available teams:", teams2.map((t) => ({ id: t.id, player1: t.player1Name, player2: t.player2Name })));
        return res.status(404).json({ error: "Team not found" });
      }
      console.log("\u2705 Found team:", { id: team.id, teamNumber: team.teamNumber, player1: team.player1Name, player2: team.player2Name });
      console.log("\u2705 Validation passed, saving individual scores for both team members...");
      const player1Parts = team.player1Name.split(" ");
      const player2Parts = team.player2Name.split(" ");
      const player1FirstName = player1Parts[0];
      const player1LastName = player1Parts.slice(1).join(" ");
      const player2FirstName = player2Parts[0];
      const player2LastName = player2Parts.slice(1).join(" ");
      const player1 = await storage.getUserByName(player1FirstName, player1LastName);
      const player2 = await storage.getUserByName(player2FirstName, player2LastName);
      if (!player1 || !player2) {
        console.log("\u274C Could not find team members:", {
          player1Name: team.player1Name,
          player2Name: team.player2Name,
          player1Found: !!player1,
          player2Found: !!player2
        });
        return res.status(404).json({ error: "Team members not found" });
      }
      const holeScore1 = await storage.updateHoleScore(player1.id, round, hole, strokes);
      const holeScore2 = await storage.updateHoleScore(player2.id, round, hole, strokes);
      console.log("\u2705 Individual scores saved for both team members");
      console.log("Player 1 score:", holeScore1);
      console.log("Player 2 score:", holeScore2);
      const holeScore = holeScore1;
      const scoreDiff = strokes - holeScore.par;
      if (scoreDiff <= -1) {
        const teamName = `Team ${team.teamNumber}`;
        let scoreName = "Birdie";
        if (scoreDiff <= -3) scoreName = "Albatross";
        else if (scoreDiff === -2) scoreName = "Eagle";
        console.log(`\u{1F3AF} TEAM BIRDIE ALERT: ${teamName} scored ${scoreName} on hole ${hole}!`);
        broadcast({
          type: "BIRDIE_NOTIFICATION",
          data: {
            playerName: teamName,
            holeNumber: hole,
            scoreName,
            round,
            isTeamScore: true
          }
        });
      }
      broadcast({
        type: "TEAM_HOLE_SCORE_UPDATE",
        data: { holeScore, teamId: team.id, userId, round, hole }
      });
      res.json(holeScore);
    } catch (error) {
      console.error("Error updating team hole score:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to update team hole score", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/leaderboard/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      console.log(`Getting leaderboard for round ${round}`);
      const leaderboard = await storage.getLeaderboard(round);
      console.log("Leaderboard result:", leaderboard[0]);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/tournament-placement/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      console.log(`Getting tournament placement leaderboard for round ${round}`);
      const leaderboard = await storage.getTournamentPlacementLeaderboard(round);
      console.log("Tournament placement result:", leaderboard[0]);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching tournament placement leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch tournament placement leaderboard" });
    }
  });
  app2.get("/api/team-better-ball/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const leaderboard = await storage.getTeamBetterBallLeaderboard(round);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching team better ball leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch team better ball leaderboard" });
    }
  });
  app2.get("/api/team-scramble/:round", async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      console.log(`\u{1F680} API CALLED: /api/team-scramble/${round}`);
      const leaderboard = await storage.getScrambleLeaderboard(round);
      console.log("\u{1F680} API RESPONSE: team-scramble leaderboard being sent to frontend:");
      leaderboard.forEach((entry) => {
        console.log(`   Team ${entry.team?.teamNumber}: totalNetStrokes=${entry.totalNetStrokes}, totalGrossStrokes=${entry.totalGrossStrokes}, teamHandicap=${entry.teamHandicap}`);
      });
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching team scramble leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch team scramble leaderboard" });
    }
  });
  app2.post("/api/admin/update-profile-component", requireAuth, async (req, res) => {
    try {
      const { code, assignments } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can edit profile assignments" });
      }
      console.log("Profile picture assignments updated by:", userName);
      console.log("Assignments:", assignments);
      res.json({ success: true, message: "Profile picture assignments updated successfully" });
    } catch (error) {
      console.error("Error updating profile assignments:", error);
      res.status(500).json({ error: "Failed to update profile assignments" });
    }
  });
  app2.get("/api/player-stats", async (req, res) => {
    try {
      const playerStats = await storage.getPlayerStatistics();
      res.json(playerStats);
    } catch (error) {
      console.error("Error fetching player statistics:", error);
      res.status(500).json({ error: "Failed to fetch player statistics" });
    }
  });
  app2.get("/api/player-history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getPlayerTournamentHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching player history:", error);
      res.status(500).json({ error: "Failed to fetch player history" });
    }
  });
  app2.get("/api/player-lifetime-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getPlayerLifetimeStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching lifetime stats:", error);
      res.status(500).json({ error: "Failed to fetch lifetime stats" });
    }
  });
  app2.get("/api/player-yearly-stats/:userId/:year", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const stats = await storage.getPlayerYearlyStats(userId, year);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching yearly stats:", error);
      res.status(500).json({ error: "Failed to fetch yearly stats" });
    }
  });
  app2.get("/api/all-players-historical-stats", async (req, res) => {
    try {
      const stats = await storage.getAllPlayersHistoricalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching all players historical stats:", error);
      res.status(500).json({ error: "Failed to fetch all players historical stats" });
    }
  });
  app2.post("/api/player-history", async (req, res) => {
    try {
      const historyData = req.body;
      const newHistory = await storage.createPlayerTournamentHistory(historyData);
      res.json(newHistory);
    } catch (error) {
      console.error("Error creating player history:", error);
      res.status(500).json({ error: "Failed to create player history" });
    }
  });
  app2.put("/api/player-history/:userId/:year", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const updateData = req.body;
      const updatedHistory = await storage.updatePlayerTournamentHistory(userId, year, updateData);
      res.json(updatedHistory);
    } catch (error) {
      console.error("Error updating player history:", error);
      res.status(500).json({ error: "Failed to update player history" });
    }
  });
  app2.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments2 = await storage.getTournaments();
      res.json(tournaments2);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });
  app2.get("/api/tournaments/active", async (req, res) => {
    try {
      const activeTournament = await storage.getActiveTournament();
      res.json(activeTournament);
    } catch (error) {
      console.error("Error fetching active tournament:", error);
      res.status(500).json({ error: "Failed to fetch active tournament" });
    }
  });
  app2.get("/api/tournaments/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const tournament = await storage.getTournamentByYear(year);
      res.json(tournament);
    } catch (error) {
      console.error("Error fetching tournament by year:", error);
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });
  app2.post("/api/tournaments", async (req, res) => {
    try {
      const tournamentData = req.body;
      const newTournament = await storage.createTournament(tournamentData);
      res.json(newTournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });
  app2.put("/api/tournaments/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const updateData = req.body;
      const updatedTournament = await storage.updateTournament(year, updateData);
      res.json(updatedTournament);
    } catch (error) {
      console.error("Error updating tournament:", error);
      res.status(500).json({ error: "Failed to update tournament" });
    }
  });
  app2.post("/api/tournaments/:year/activate", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const activeTournament = await storage.setActiveTournament(year);
      res.json(activeTournament);
    } catch (error) {
      console.error("Error activating tournament:", error);
      res.status(500).json({ error: "Failed to activate tournament" });
    }
  });
  app2.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/chat/messages", requireAuth, async (req, res) => {
    try {
      const { message, taggedUserIds } = req.body;
      const userId = req.user.id;
      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message cannot be empty" });
      }
      const messageData = {
        userId,
        message: message.trim(),
        taggedUserIds: taggedUserIds || []
      };
      const newMessage = await storage.createChatMessage(messageData);
      broadcast({
        type: "CHAT_MESSAGE",
        data: newMessage
      });
      res.json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.post("/api/submit-round", requireAuth, async (req, res) => {
    try {
      const { round, totalPoints, holesPlayed } = req.body;
      const userId = req.user.id;
      if (!round || totalPoints === void 0 || holesPlayed === void 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const userHoleScores = await storage.getHoleScores(userId, round);
      if (userHoleScores.length !== 18) {
        return res.status(400).json({ error: "Round is not complete. All 18 holes must be played." });
      }
      const actualTotalPoints = userHoleScores.reduce((sum, score) => sum + score.points, 0);
      const actualTotalStrokes = userHoleScores.reduce((sum, score) => sum + score.strokes, 0);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const teams2 = await storage.getTeams();
      const userTeam = teams2.find(
        (team) => team.player1Name === `${user.firstName} ${user.lastName}` || team.player2Name === `${user.firstName} ${user.lastName}`
      );
      if (!userTeam) {
        return res.status(400).json({ error: "User team not found" });
      }
      const roundField = `round${round}Points`;
      await storage.updateScore(userTeam.id, round, actualTotalPoints, userId);
      broadcast({
        type: "ROUND_COMPLETED",
        data: {
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          round,
          totalPoints: actualTotalPoints,
          totalStrokes: actualTotalStrokes,
          holesPlayed: 18
        }
      });
      res.json({
        success: true,
        message: `Round ${round} submitted successfully!`,
        totalPoints: actualTotalPoints,
        totalStrokes: actualTotalStrokes,
        holesPlayed: 18
      });
    } catch (error) {
      console.error("Error submitting round:", error);
      res.status(500).json({ error: "Failed to submit round" });
    }
  });
  app2.get("/api/match-play/groups", async (req, res) => {
    try {
      const groups = await storage.getMatchPlayGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching match play groups:", error);
      res.status(500).json({ error: "Failed to fetch match play groups" });
    }
  });
  app2.post("/api/match-play/groups", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can create match play groups" });
      }
      const group = await storage.createMatchPlayGroup(req.body);
      res.json(group);
    } catch (error) {
      console.error("Error creating match play group:", error);
      res.status(500).json({ error: "Failed to create match play group" });
    }
  });
  app2.get("/api/match-play/matches", async (req, res) => {
    try {
      const groupNumber = req.query.groupNumber ? parseInt(req.query.groupNumber) : void 0;
      const matches = await storage.getMatchPlayMatches(groupNumber);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching match play matches:", error);
      res.status(500).json({ error: "Failed to fetch match play matches" });
    }
  });
  app2.post("/api/match-play/matches", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can create matches" });
      }
      const match = await storage.createMatchPlayMatch(req.body);
      broadcast({
        type: "MATCH_PLAY_CREATED",
        data: match
      });
      res.json(match);
    } catch (error) {
      console.error("Error creating match play match:", error);
      res.status(500).json({ error: "Failed to create match play match" });
    }
  });
  app2.put("/api/match-play/matches/:id/result", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const allowedUsers = ["Nick Grossi", "Connor Patterson"];
      const userName = `${user.firstName} ${user.lastName}`;
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: "Only Nick Grossi and Connor Patterson can update match results" });
      }
      const { id } = req.params;
      const { winnerId, result, pointsAwarded } = req.body;
      const updatedMatch = await storage.updateMatchPlayResult(parseInt(id), winnerId, result, pointsAwarded);
      broadcast({
        type: "MATCH_PLAY_RESULT",
        data: updatedMatch
      });
      res.json(updatedMatch);
    } catch (error) {
      console.error("Error updating match play result:", error);
      res.status(500).json({ error: "Failed to update match play result" });
    }
  });
  app2.get("/api/match-play/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getMatchPlayLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching match play leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch match play leaderboard" });
    }
  });
  app2.get("/api/match-play/current-match/:playerId/:hole", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const hole = parseInt(req.params.hole);
      const currentMatch = await storage.getCurrentMatchForPlayer(playerId, hole);
      res.json(currentMatch);
    } catch (error) {
      console.error("Error fetching current match:", error);
      res.status(500).json({ error: "Failed to fetch current match" });
    }
  });
  app2.get("/api/boozelympics/games", async (req, res) => {
    try {
      const games = await storage.getBoozelympicsGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching Boozelympics games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });
  app2.post("/api/boozelympics/games", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const userName = `${user.firstName} ${user.lastName}`;
      if (userName !== "Nick Grossi") {
        return res.status(403).json({ error: "Only Nick Grossi can create Boozelympics games" });
      }
      const game = await storage.createBoozelympicsGame(req.body);
      broadcast({
        type: "BOOZELYMPICS_GAME_CREATED",
        data: game
      });
      res.json(game);
    } catch (error) {
      console.error("Error creating Boozelympics game:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  });
  app2.get("/api/boozelympics/matches", async (req, res) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId) : void 0;
      const matches = await storage.getBoozelympicsMatches(gameId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching Boozelympics matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });
  app2.post("/api/boozelympics/matches", requireAuth, async (req, res) => {
    try {
      const match = await storage.createBoozelympicsMatch(req.body);
      broadcast({
        type: "BOOZELYMPICS_MATCH_CREATED",
        data: match
      });
      res.json(match);
    } catch (error) {
      console.error("Error creating Boozelympics match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  });
  app2.get("/api/boozelympics/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getBoozelympicsLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching Boozelympics leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/golf-relay/matches", async (req, res) => {
    try {
      const matches = await storage.getGolfRelayMatches();
      res.json(matches);
    } catch (error) {
      console.error("Error fetching Golf Relay matches:", error);
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });
  app2.post("/api/golf-relay/matches", requireAuth, async (req, res) => {
    try {
      const match = await storage.createGolfRelayMatch(req.body);
      broadcast({
        type: "GOLF_RELAY_MATCH_CREATED",
        data: match
      });
      res.json(match);
    } catch (error) {
      console.error("Error creating Golf Relay match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  });
  app2.get("/api/golf-relay/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getGolfRelayLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching Golf Relay leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  return httpServer;
}

// server/vercel-handler.ts
var app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now, current_database() as db");
    res.json({ ok: true, result: result.rows[0] });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message,
      code: error?.code,
      stack: error?.stack?.split("\n").slice(0, 5)
    });
  }
});
var initialized = false;
var initError = null;
var initPromise = null;
async function ensureInit() {
  if (initialized) return;
  if (initError) throw initError;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await registerRoutes(app);
      initialized = true;
    } catch (err) {
      initError = err;
      throw err;
    }
  })();
  return initPromise;
}
async function handler(req, res) {
  try {
    await ensureInit();
    app(req, res);
  } catch (error) {
    console.error("Vercel handler init error:", error);
    res.status(500).json({
      error: "Server initialization failed",
      message: error?.message,
      stack: error?.stack?.split("\n").slice(0, 5)
    });
  }
}
export {
  handler as default
};
