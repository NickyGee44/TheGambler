import {
  users,
  teams,
  scores,
  sideBets,
  photos,
  type User,
  type UpsertUser,
  type Team,
  type Score,
  type SideBet,
  type Photo,
  type InsertTeam,
  type InsertScore,
  type InsertSideBet,
  type InsertPhoto,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Scores
  getScores(): Promise<(Score & { team: Team })[]>;
  updateScore(teamId: number, round: number, score: number, userId?: string): Promise<Score>;
  
  // Side Bets
  getSideBets(): Promise<SideBet[]>;
  createSideBet(bet: InsertSideBet): Promise<SideBet>;
  updateSideBetResult(betId: number, result: string): Promise<SideBet>;
  
  // Photos
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Player matching
  findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 } | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
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

  // Legacy in-memory storage for development
  private teams: Map<number, Team>;
  private scores: Map<number, Score>;
  private sideBets: Map<number, SideBet>;
  private photos: Map<number, Photo>;
  private currentTeamId: number;
  private currentScoreId: number;
  private currentSideBetId: number;
  private currentPhotoId: number;

  constructor() {
    this.teams = new Map();
    this.scores = new Map();
    this.sideBets = new Map();
    this.photos = new Map();
    this.currentTeamId = 1;
    this.currentScoreId = 1;
    this.currentSideBetId = 1;
    this.currentPhotoId = 1;
    
    // Initialize with tournament data
    this.initializeData();
  }

  private initializeData() {
    // Initialize teams
    const teamData = [
      { teamNumber: 1, player1Name: "Nick Grossi", player1Handicap: 15, player2Name: "Connor Patterson", player2Handicap: 3 },
      { teamNumber: 2, player1Name: "Christian Hauck", player1Handicap: 5, player2Name: "Bailey Carlson", player2Handicap: 16 },
      { teamNumber: 3, player1Name: "Ben Braun", player1Handicap: 6, player2Name: "Nic Huxley", player2Handicap: 15 },
      { teamNumber: 4, player1Name: "Erik Boudreau", player1Handicap: 10, player2Name: "Will Bibi", player2Handicap: 5 },
      { teamNumber: 5, player1Name: "Nick Cook", player1Handicap: 12, player2Name: "Kevin Durco", player2Handicap: 3 },
      { teamNumber: 6, player1Name: "Spencer Reid", player1Handicap: 16, player2Name: "Jeff Reiner", player2Handicap: 9 },
      { teamNumber: 7, player1Name: "Sye Ellard", player1Handicap: 18, player2Name: "Austin Hassani", player2Handicap: 17 },
      { teamNumber: 8, player1Name: "Jordan Kreller", player1Handicap: 6, player2Name: "Jonathan Magnatta", player2Handicap: 11 }
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
        round1: 0,
        round2: 0,
        round3: 0,
        totalScore: 0,
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

  async updateScore(teamId: number, round: number, score: number, userId?: string): Promise<Score> {
    const existingScore = Array.from(this.scores.values()).find(s => s.teamId === teamId);
    if (!existingScore) {
      throw new Error('Score not found');
    }

    const updatedScore: Score = {
      ...existingScore,
      [`round${round}`]: score,
      updatedAt: new Date()
    };

    // Recalculate total score
    updatedScore.totalScore = (updatedScore.round1 || 0) + (updatedScore.round2 || 0) + (updatedScore.round3 || 0);

    this.scores.set(existingScore.id, updatedScore);
    
    // Recalculate ranks
    this.recalculateRanks();
    
    return updatedScore;
  }

  private recalculateRanks() {
    const allScores = Array.from(this.scores.values());
    allScores.sort((a, b) => (a.totalScore || 0) - (b.totalScore || 0));
    
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
}

export const storage = new DatabaseStorage();
