import {
  users,
  teams,
  scores,
  sideBets,
  photos,
  matchups,
  holeScores,
  type User,
  type InsertUser,
  type Team,
  type Score,
  type SideBet,
  type Photo,
  type Matchup,
  type HoleScore,
  type InsertTeam,
  type InsertScore,
  type InsertSideBet,
  type InsertPhoto,
  type InsertMatchup,
  type InsertHoleScore,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByName(firstName: string, lastName: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Scores
  getScores(): Promise<(Score & { team: Team })[]>;
  getCalculatedScores(): Promise<(Score & { team: Team })[]>;
  updateScore(teamId: number, round: number, score: number, userId?: number): Promise<Score>;
  
  // Hole Scores
  getHoleScores(userId: number, round: number): Promise<HoleScore[]>;
  createHoleScore(holeScore: InsertHoleScore): Promise<HoleScore>;
  updateHoleScore(userId: number, round: number, hole: number, strokes: number): Promise<HoleScore>;
  getLeaderboard(round: number): Promise<(HoleScore & { user: User; team: Team })[]>;
  
  // Side Bets
  getSideBets(): Promise<SideBet[]>;
  createSideBet(bet: InsertSideBet): Promise<SideBet>;
  updateSideBetResult(betId: number, result: string): Promise<SideBet>;
  
  // Photos
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Matchups
  getMatchups(): Promise<Matchup[]>;
  createMatchup(matchup: InsertMatchup): Promise<Matchup>;
  updateMatchupScore(matchupId: number, player1Score: number, player2Score: number): Promise<Matchup>;
  
  // Player matching
  findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 } | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByName(firstName: string, lastName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.firstName, firstName), eq(users.lastName, lastName))
    );
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 } | null> {
    const allTeams = await db.select().from(teams);
    
    for (const team of allTeams) {
      if (team.player1Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 1 };
      }
      if (team.player2Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 2 };
      }
    }
    
    return null;
  }

  // Hole Score operations
  async getHoleScores(userId: number, round: number): Promise<HoleScore[]> {
    const scores = await db.select().from(holeScores).where(
      and(eq(holeScores.userId, userId), eq(holeScores.round, round))
    ).orderBy(asc(holeScores.hole));
    return scores;
  }

  async createHoleScore(holeScore: InsertHoleScore): Promise<HoleScore> {
    const [score] = await db
      .insert(holeScores)
      .values(holeScore)
      .returning();
    return score;
  }

  async updateHoleScore(userId: number, round: number, hole: number, strokes: number): Promise<HoleScore> {
    // First check if hole score exists
    const [existingScore] = await db.select().from(holeScores).where(
      and(
        eq(holeScores.userId, userId),
        eq(holeScores.round, round),
        eq(holeScores.hole, hole)
      )
    );

    // Calculate net score and points (simplified Stableford scoring)
    const par = 4; // Default par, can be customized per hole
    const handicap = 0; // Simplified, can be calculated based on hole difficulty
    const netScore = strokes - handicap;
    let points = 0;
    
    if (netScore <= par - 2) points = 4;
    else if (netScore === par - 1) points = 3;
    else if (netScore === par) points = 2;
    else if (netScore === par + 1) points = 1;
    else points = 0;

    if (existingScore) {
      // Update existing score
      const [updatedScore] = await db
        .update(holeScores)
        .set({
          strokes,
          netScore,
          points,
          updatedAt: new Date(),
        })
        .where(eq(holeScores.id, existingScore.id))
        .returning();
      return updatedScore;
    } else {
      // Create new score
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
      if (!playerInfo) throw new Error('Player not found in any team');

      const [newScore] = await db
        .insert(holeScores)
        .values({
          userId,
          teamId: playerInfo.teamId,
          round,
          hole,
          strokes,
          par,
          handicap,
          netScore,
          points,
        })
        .returning();
      return newScore;
    }
  }

  async getLeaderboard(round: number): Promise<(HoleScore & { user: User; team: Team })[]> {
    const scores = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams,
    }).from(holeScores)
      .innerJoin(users, eq(holeScores.userId, users.id))
      .innerJoin(teams, eq(holeScores.teamId, teams.id))
      .where(eq(holeScores.round, round));

    // Group by user and calculate total points
    const userTotals = new Map<number, { user: User; team: Team; totalPoints: number; holes: number }>();
    
    for (const score of scores) {
      const userId = score.user.id;
      if (!userTotals.has(userId)) {
        userTotals.set(userId, {
          user: score.user,
          team: score.team,
          totalPoints: 0,
          holes: 0,
        });
      }
      const userTotal = userTotals.get(userId)!;
      userTotal.totalPoints += score.holeScore.points;
      userTotal.holes += 1;
    }

    // Convert to leaderboard format and sort by total points
    const leaderboard = Array.from(userTotals.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map(entry => ({
        ...entry.user,
        user: entry.user,
        team: entry.team,
        totalPoints: entry.totalPoints,
        holes: entry.holes,
      }));

    return leaderboard as any; // Type casting for compatibility
  }

  // Legacy in-memory storage for development
  private teams: Map<number, Team>;
  private scores: Map<number, Score>;
  private sideBets: Map<number, SideBet>;
  private photos: Map<number, Photo>;
  private matchups: Map<number, Matchup>;
  private currentTeamId: number;
  private currentScoreId: number;
  private currentSideBetId: number;
  private currentPhotoId: number;
  private currentMatchupId: number;

  constructor() {
    this.teams = new Map();
    this.scores = new Map();
    this.sideBets = new Map();
    this.photos = new Map();
    this.matchups = new Map();
    this.currentTeamId = 1;
    this.currentScoreId = 1;
    this.currentSideBetId = 1;
    this.currentPhotoId = 1;
    this.currentMatchupId = 1;
    
    // Initialize with tournament data
    this.initializeData();
  }

  private initializeData() {
    // Initialize teams with official roster
    const teamData = [
      { teamNumber: 1, player1Name: "Nick Grossi", player1Handicap: 15, player2Name: "Connor Patterson", player2Handicap: 3 },
      { teamNumber: 2, player1Name: "Christian Hauck", player1Handicap: 5, player2Name: "Bailey Carlson", player2Handicap: 16 },
      { teamNumber: 3, player1Name: "Ben Braun", player1Handicap: 6, player2Name: "Nic Huxley", player2Handicap: 15 },
      { teamNumber: 4, player1Name: "Erik Boudreau", player1Handicap: 10, player2Name: "Will Bibbings", player2Handicap: 5 },
      { teamNumber: 5, player1Name: "Nick Cook", player1Handicap: 12, player2Name: "Kevin Durco", player2Handicap: 3 },
      { teamNumber: 6, player1Name: "Spencer Reid", player1Handicap: 16, player2Name: "Jeffrey Reiner", player2Handicap: 9 },
      { teamNumber: 7, player1Name: "Sye Ellard", player1Handicap: 18, player2Name: "Austin Hassani", player2Handicap: 17 },
      { teamNumber: 8, player1Name: "Jordan Kreller", player1Handicap: 6, player2Name: "Johnny Magnatta", player2Handicap: 11 }
    ];

    teamData.forEach(team => {
      const newTeam: Team = {
        id: this.currentTeamId++,
        ...team,
        totalHandicap: team.player1Handicap + team.player2Handicap,
        createdAt: new Date()
      };
      this.teams.set(newTeam.id, newTeam);
      
      // Initialize scores for each team
      const newScore: Score = {
        id: this.currentScoreId++,
        teamId: newTeam.id,
        round1Points: 0,
        round2Points: 0,
        round3Points: 0,
        totalPoints: 0,
        rank: 8,
        updatedAt: new Date()
      };
      this.scores.set(newScore.id, newScore);
    });
  }

  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values()).sort((a, b) => a.teamNumber - b.teamNumber);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const team: Team = {
      id,
      ...insertTeam,
      createdAt: new Date()
    };
    this.teams.set(id, team);
    return team;
  }

  async getScores(): Promise<(Score & { team: Team })[]> {
    const scoresArray = Array.from(this.scores.values());
    return scoresArray.map(score => ({
      ...score,
      team: this.teams.get(score.teamId)!
    })).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  async getCalculatedScores(): Promise<(Score & { team: Team })[]> {
    // Get all teams
    const teams = await this.getTeams();
    const calculatedScores: (Score & { team: Team })[] = [];

    for (const team of teams) {
      // Calculate scores for each round from hole scores
      const round1Points = await this.calculateTeamRoundPoints(team.id, 1);
      const round2Points = await this.calculateTeamRoundPoints(team.id, 2);
      const round3Points = await this.calculateTeamRoundPoints(team.id, 3);
      
      const totalPoints = round1Points + round2Points + round3Points;
      
      const scoreWithTeam = {
        id: team.id,
        teamId: team.id,
        round1Points,
        round2Points,
        round3Points,
        totalPoints,
        rank: 1, // Will be calculated after sorting
        updatedAt: new Date(),
        team: team
      };
      
      calculatedScores.push(scoreWithTeam);
    }

    // Sort by total points (descending) and assign ranks
    calculatedScores.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    calculatedScores.forEach((score, index) => {
      score.rank = index + 1;
    });

    return calculatedScores;
  }

  private async calculateTeamRoundPoints(teamId: number, round: number): Promise<number> {
    // Get all hole scores for this team and round
    const teamHoleScores = await db.select()
      .from(holeScores)
      .where(
        and(
          eq(holeScores.teamId, teamId),
          eq(holeScores.round, round)
        )
      );

    // Sum all points for this team and round
    return teamHoleScores.reduce((total, holeScore) => total + holeScore.points, 0);
  }

  async updateScore(teamId: number, round: number, score: number, userId?: number): Promise<Score> {
    const existingScore = Array.from(this.scores.values()).find(s => s.teamId === teamId);
    if (!existingScore) {
      throw new Error('Score not found');
    }

    const updatedScore: Score = {
      ...existingScore,
      [`round${round}Points`]: score,
      updatedAt: new Date()
    };

    // Recalculate total score
    updatedScore.totalPoints = (updatedScore.round1Points || 0) + (updatedScore.round2Points || 0) + (updatedScore.round3Points || 0);

    this.scores.set(existingScore.id, updatedScore);
    
    // Recalculate ranks
    this.recalculateRanks();
    
    return updatedScore;
  }

  private recalculateRanks() {
    const allScores = Array.from(this.scores.values());
    allScores.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    
    allScores.forEach((score, index) => {
      score.rank = index + 1;
      this.scores.set(score.id, score);
    });
  }

  async getSideBets(): Promise<SideBet[]> {
    return Array.from(this.sideBets.values()).sort((a, b) => a.round - b.round);
  }

  async createSideBet(insertSideBet: InsertSideBet): Promise<SideBet> {
    const id = this.currentSideBetId++;
    const sideBet: SideBet = {
      id,
      ...insertSideBet,
      result: insertSideBet.result || null,
      createdAt: new Date()
    };
    this.sideBets.set(id, sideBet);
    return sideBet;
  }

  async updateSideBetResult(betId: number, result: string): Promise<SideBet> {
    const existingSideBet = this.sideBets.get(betId);
    if (!existingSideBet) {
      throw new Error('Side bet not found');
    }

    const updatedSideBet: SideBet = {
      ...existingSideBet,
      result
    };

    this.sideBets.set(betId, updatedSideBet);
    return updatedSideBet;
  }

  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      id,
      ...insertPhoto,
      caption: insertPhoto.caption || null,
      uploadedAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }

  async getMatchups(): Promise<Matchup[]> {
    return Array.from(this.matchups.values());
  }

  async createMatchup(insertMatchup: InsertMatchup): Promise<Matchup> {
    const matchup: Matchup = {
      id: this.currentMatchupId++,
      ...insertMatchup,
      player1Score: insertMatchup.player1Score || null,
      player2Score: insertMatchup.player2Score || null,
      winner: insertMatchup.winner || null,
      createdAt: new Date(),
    };
    this.matchups.set(matchup.id, matchup);
    return matchup;
  }

  async updateMatchupScore(matchupId: number, player1Score: number, player2Score: number): Promise<Matchup> {
    const existingMatchup = this.matchups.get(matchupId);
    if (!existingMatchup) {
      throw new Error(`Matchup with id ${matchupId} not found`);
    }

    const winner = player1Score < player2Score ? existingMatchup.player1 :
                   player2Score < player1Score ? existingMatchup.player2 : 
                   'Tie';

    const updatedMatchup: Matchup = {
      ...existingMatchup,
      player1Score,
      player2Score,
      winner,
    };

    this.matchups.set(matchupId, updatedMatchup);
    return updatedMatchup;
  }
}

export const storage = new DatabaseStorage();
