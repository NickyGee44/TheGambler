import {
  users,
  teams,
  scores,
  sideBets,
  photos,
  matchups,
  holeScores,
  tournaments,
  playerTournamentHistory,
  matchPlayMatches,
  matchPlayGroups,
  type User,
  type InsertUser,
  type Team,
  type Score,
  type SideBet,
  type Photo,
  type Matchup,
  type HoleScore,
  type Tournament,
  type PlayerTournamentHistory,
  type MatchPlayMatch,
  type MatchPlayGroup,
  type InsertTeam,
  type InsertScore,
  type InsertSideBet,
  type InsertPhoto,
  type InsertMatchup,
  type InsertHoleScore,
  type InsertTournament,
  type InsertPlayerTournamentHistory,
  type InsertMatchPlayMatch,
  type InsertMatchPlayGroup,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
  updateHoleScoreStats(userId: number, round: number, hole: number, statsData: any): Promise<HoleScore>;
  getLeaderboard(round: number): Promise<(HoleScore & { user: User; team: Team })[]>;
  
  // Player Statistics
  getPlayerStatistics(): Promise<any[]>;
  
  // Side Bets
  getSideBets(): Promise<SideBet[]>;
  createSideBet(bet: InsertSideBet): Promise<SideBet>;
  updateSideBetResult(betId: number, result: string): Promise<SideBet>;
  updateSideBetStatus(betId: number, status: string): Promise<SideBet>;
  addWitnessVote(betId: number, witnessName: string, winnerName: string): Promise<SideBet>;
  markBetForResolution(betId: number): Promise<SideBet>;
  
  // Photos
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Matchups
  getMatchups(): Promise<Matchup[]>;
  createMatchup(matchup: InsertMatchup): Promise<Matchup>;
  updateMatchupScore(matchupId: number, player1Score: number, player2Score: number): Promise<Matchup>;
  
  // Match Play (Round 3)
  getMatchPlayGroups(): Promise<MatchPlayGroup[]>;
  createMatchPlayGroup(group: InsertMatchPlayGroup): Promise<MatchPlayGroup>;
  getMatchPlayMatches(groupNumber?: number): Promise<MatchPlayMatch[]>;
  createMatchPlayMatch(match: InsertMatchPlayMatch): Promise<MatchPlayMatch>;
  updateMatchPlayResult(matchId: number, winnerId: number | null, result: string, pointsAwarded: any): Promise<MatchPlayMatch>;
  getMatchPlayLeaderboard(): Promise<any[]>;
  getCurrentMatchForPlayer(playerId: number, currentHole: number): Promise<MatchPlayMatch | null>;
  
  // Player matching
  findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 } | null>;
  
  // Tournament management
  getTournaments(): Promise<Tournament[]>;
  getActiveTournament(): Promise<Tournament | null>;
  getTournamentByYear(year: number): Promise<Tournament | null>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(year: number, updateData: Partial<Tournament>): Promise<Tournament>;
  setActiveTournament(year: number): Promise<Tournament>;
  
  // Player Tournament History
  getPlayerTournamentHistory(userId: number): Promise<PlayerTournamentHistory[]>;
  createPlayerTournamentHistory(history: InsertPlayerTournamentHistory): Promise<PlayerTournamentHistory>;
  updatePlayerTournamentHistory(userId: number, year: number, data: Partial<PlayerTournamentHistory>): Promise<PlayerTournamentHistory>;
  
  // Enhanced Player Statistics with historical data
  getPlayerLifetimeStats(userId: number): Promise<any>;
  getPlayerYearlyStats(userId: number, year: number): Promise<any>;
  getAllPlayersHistoricalStats(): Promise<any[]>;
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

  // Tournament management
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(asc(tournaments.year));
  }

  async getActiveTournament(): Promise<Tournament | null> {
    const [activeTournament] = await db.select().from(tournaments).where(eq(tournaments.isActive, true));
    return activeTournament || null;
  }

  async getTournamentByYear(year: number): Promise<Tournament | null> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.year, year));
    return tournament || null;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async updateTournament(year: number, updateData: Partial<Tournament>): Promise<Tournament> {
    const [updatedTournament] = await db
      .update(tournaments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tournaments.year, year))
      .returning();
    return updatedTournament;
  }

  async setActiveTournament(year: number): Promise<Tournament> {
    // First, deactivate all tournaments
    await db.update(tournaments).set({ isActive: false });
    
    // Then activate the specified tournament
    const [activeTournament] = await db
      .update(tournaments)
      .set({ isActive: true })
      .where(eq(tournaments.year, year))
      .returning();
    
    return activeTournament;
  }

  // Player Tournament History
  async getPlayerTournamentHistory(userId: number): Promise<PlayerTournamentHistory[]> {
    return await db.select().from(playerTournamentHistory).where(eq(playerTournamentHistory.userId, userId));
  }

  async createPlayerTournamentHistory(history: InsertPlayerTournamentHistory): Promise<PlayerTournamentHistory> {
    const [newHistory] = await db.insert(playerTournamentHistory).values(history).returning();
    return newHistory;
  }

  async updatePlayerTournamentHistory(userId: number, year: number, data: Partial<PlayerTournamentHistory>): Promise<PlayerTournamentHistory> {
    const [updatedHistory] = await db
      .update(playerTournamentHistory)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(playerTournamentHistory.userId, userId), eq(playerTournamentHistory.tournamentYear, year)))
      .returning();
    return updatedHistory;
  }

  // Enhanced Player Statistics with historical data
  async getPlayerLifetimeStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allHoleScores = await db
      .select()
      .from(holeScores)
      .where(eq(holeScores.userId, userId));

    const tournamentHistory = await this.getPlayerTournamentHistory(userId);
    
    // Calculate lifetime statistics
    const totalHoles = allHoleScores.length;
    const totalStrokes = allHoleScores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPutts = allHoleScores.reduce((sum, score) => sum + score.putts, 0);
    const totalPenalties = allHoleScores.reduce((sum, score) => sum + score.penalties, 0);
    const fairwaysHit = allHoleScores.filter(score => score.fairwayInRegulation === true).length;
    const greensHit = allHoleScores.filter(score => score.greenInRegulation === true).length;
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
      fairwayPercentage: totalHoles > 0 ? ((fairwaysHit / totalHoles) * 100).toFixed(1) : 0,
      greenPercentage: totalHoles > 0 ? ((greensHit / totalHoles) * 100).toFixed(1) : 0,
      sandSaves,
      upAndDowns,
      tournamentHistory,
      totalTournaments: tournamentHistory.length,
      bestFinish: tournamentHistory.length > 0 ? Math.min(...tournamentHistory.map(t => t.finalRanking || 8)) : null,
      totalPoints: tournamentHistory.reduce((sum, t) => sum + (t.totalPoints || 0), 0)
    };
  }

  async getPlayerYearlyStats(userId: number, year: number): Promise<any> {
    const yearlyHoleScores = await db
      .select()
      .from(holeScores)
      .where(and(eq(holeScores.userId, userId), eq(holeScores.tournamentYear, year)));

    const yearlyHistory = await db
      .select()
      .from(playerTournamentHistory)
      .where(and(eq(playerTournamentHistory.userId, userId), eq(playerTournamentHistory.tournamentYear, year)));

    const totalHoles = yearlyHoleScores.length;
    const totalStrokes = yearlyHoleScores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPutts = yearlyHoleScores.reduce((sum, score) => sum + score.putts, 0);
    const fairwaysHit = yearlyHoleScores.filter(score => score.fairwayInRegulation === true).length;
    const greensHit = yearlyHoleScores.filter(score => score.greenInRegulation === true).length;

    return {
      year,
      totalHoles,
      totalStrokes,
      averageScore: totalHoles > 0 ? (totalStrokes / totalHoles).toFixed(2) : 0,
      totalPutts,
      averagePutts: totalHoles > 0 ? (totalPutts / totalHoles).toFixed(2) : 0,
      fairwayPercentage: totalHoles > 0 ? ((fairwaysHit / totalHoles) * 100).toFixed(1) : 0,
      greenPercentage: totalHoles > 0 ? ((greensHit / totalHoles) * 100).toFixed(1) : 0,
      tournamentData: yearlyHistory[0] || null
    };
  }

  async getAllPlayersHistoricalStats(): Promise<any[]> {
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

  async updateHoleScoreStats(userId: number, round: number, hole: number, statsData: any): Promise<HoleScore> {
    // First check if hole score exists
    const [existingScore] = await db.select().from(holeScores).where(
      and(
        eq(holeScores.userId, userId),
        eq(holeScores.round, round),
        eq(holeScores.hole, hole)
      )
    );

    if (existingScore) {
      // Update existing score with statistics
      const [updatedScore] = await db
        .update(holeScores)
        .set({
          fairwayInRegulation: statsData.fairwayInRegulation,
          greenInRegulation: statsData.greenInRegulation,
          driveDirection: statsData.driveDirection,
          putts: statsData.putts,
          penalties: statsData.penalties,
          sandSaves: statsData.sandSaves,
          upAndDowns: statsData.upAndDowns,
          updatedAt: new Date(),
        })
        .where(eq(holeScores.id, existingScore.id))
        .returning();
      return updatedScore;
    } else {
      // Create new score with statistics
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
      if (!playerInfo) throw new Error('Player not found in any team');

      const par = 4; // Default par
      const handicap = 0; // Simplified
      const strokes = 0; // Default strokes if not set
      const netScore = strokes - handicap;
      const points = 0; // Default points

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
          fairwayInRegulation: statsData.fairwayInRegulation,
          greenInRegulation: statsData.greenInRegulation,
          driveDirection: statsData.driveDirection,
          putts: statsData.putts,
          penalties: statsData.penalties,
          sandSaves: statsData.sandSaves,
          upAndDowns: statsData.upAndDowns,
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

    if (round === 2) {
      // For scramble (Round 2), group by team instead of individual players
      const teamTotals = new Map<number, { team: Team; totalPoints: number; totalStrokes: number; holes: number; players: User[] }>();
      
      for (const score of scores) {
        const teamId = score.team.id;
        if (!teamTotals.has(teamId)) {
          teamTotals.set(teamId, {
            team: score.team,
            totalPoints: 0,
            totalStrokes: 0,
            holes: 0,
            players: [],
          });
        }
        const teamTotal = teamTotals.get(teamId)!;
        teamTotal.totalPoints += score.holeScore.points;
        teamTotal.totalStrokes += score.holeScore.strokes;
        teamTotal.holes += 1;
        
        // Add unique players to the team
        if (!teamTotal.players.find(p => p.id === score.user.id)) {
          teamTotal.players.push(score.user);
        }
      }

      // Convert to leaderboard format and sort by total points
      const leaderboard = Array.from(teamTotals.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map(entry => ({
          id: entry.team.id,
          team: entry.team,
          players: entry.players,
          totalPoints: entry.totalPoints,
          totalStrokes: entry.totalStrokes,
          holes: entry.holes,
          isTeamLeaderboard: true,
        }));

      return leaderboard as any;
    } else {
      // For individual rounds (Round 1 and 3), group by user
      const userTotals = new Map<number, { user: User; team: Team; totalPoints: number; totalStrokes: number; holes: number }>();
      
      for (const score of scores) {
        const userId = score.user.id;
        if (!userTotals.has(userId)) {
          userTotals.set(userId, {
            user: score.user,
            team: score.team,
            totalPoints: 0,
            totalStrokes: 0,
            holes: 0,
          });
        }
        const userTotal = userTotals.get(userId)!;
        userTotal.totalPoints += score.holeScore.points;
        userTotal.totalStrokes += score.holeScore.strokes;
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
          totalStrokes: entry.totalStrokes,
          holes: entry.holes,
          isTeamLeaderboard: false,
        }));

      return leaderboard as any;
    }
  }

  async getTeamBetterBallLeaderboard(round: number): Promise<any[]> {
    const scores = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams,
    }).from(holeScores)
      .innerJoin(users, eq(holeScores.userId, users.id))
      .innerJoin(teams, eq(holeScores.teamId, teams.id))
      .where(eq(holeScores.round, round));

    // Group by team and hole to calculate better ball scores
    const teamHoleScores = new Map<string, { team: Team; hole: number; bestNetScore: number; bestPoints: number; players: User[] }>();
    
    for (const score of scores) {
      const key = `${score.team.id}-${score.holeScore.hole}`;
      if (!teamHoleScores.has(key)) {
        teamHoleScores.set(key, {
          team: score.team,
          hole: score.holeScore.hole,
          bestNetScore: score.holeScore.netScore,
          bestPoints: score.holeScore.points,
          players: [score.user],
        });
      } else {
        const teamHole = teamHoleScores.get(key)!;
        // Better ball uses best net score (lowest net score gets more points)
        if (score.holeScore.points > teamHole.bestPoints) {
          teamHole.bestNetScore = score.holeScore.netScore;
          teamHole.bestPoints = score.holeScore.points;
        }
        if (!teamHole.players.find(p => p.id === score.user.id)) {
          teamHole.players.push(score.user);
        }
      }
    }

    // Calculate team totals
    const teamTotals = new Map<number, { team: Team; totalPoints: number; totalNetStrokes: number; holes: number; players: User[] }>();
    
    for (const teamHole of Array.from(teamHoleScores.values())) {
      const teamId = teamHole.team.id;
      if (!teamTotals.has(teamId)) {
        teamTotals.set(teamId, {
          team: teamHole.team,
          totalPoints: 0,
          totalNetStrokes: 0,
          holes: 0,
          players: [],
        });
      }
      const teamTotal = teamTotals.get(teamId)!;
      teamTotal.totalPoints += teamHole.bestPoints;
      teamTotal.totalNetStrokes += teamHole.bestNetScore;
      teamTotal.holes += 1;
      
      // Add unique players to the team
      for (const player of teamHole.players) {
        if (!teamTotal.players.find(p => p.id === player.id)) {
          teamTotal.players.push(player);
        }
      }
    }

    // Convert to leaderboard format and sort by total points
    const leaderboard = Array.from(teamTotals.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map(entry => ({
        id: entry.team.id,
        team: entry.team,
        players: entry.players,
        totalPoints: entry.totalPoints,
        totalNetStrokes: entry.totalNetStrokes,
        holes: entry.holes,
        isTeamLeaderboard: true,
        isBetterBall: true,
      }));

    return leaderboard;
  }

  async getPlayerStatistics(): Promise<any[]> {
    // Get all hole scores with user and team information
    const holeScoresData = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams,
    }).from(holeScores)
      .innerJoin(users, eq(holeScores.userId, users.id))
      .innerJoin(teams, eq(holeScores.teamId, teams.id))
      .orderBy(asc(holeScores.userId), asc(holeScores.round), asc(holeScores.hole));

    // Group by user to calculate statistics
    const userStatsMap = new Map<number, any>();

    for (const data of holeScoresData) {
      const userId = data.user.id;
      const holeScore = data.holeScore;
      
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId: userId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          totalRounds: new Set<number>(),
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
          rounds: new Map<number, any>(),
        });
      }
      
      const userStats = userStatsMap.get(userId)!;
      
      // Track rounds
      userStats.totalRounds.add(holeScore.round);
      userStats.totalHoles += 1;
      userStats.totalStrokes += holeScore.strokes;
      userStats.totalPoints += holeScore.points;
      
      // Calculate score relative to par (assuming par data would be available)
      const par = 4; // This would come from hole data
      const scoreDiff = holeScore.strokes - par;
      userStats.scoresByHole.push({
        round: holeScore.round,
        hole: holeScore.hole,
        strokes: holeScore.strokes,
        par: par,
        diff: scoreDiff,
      });
      
      // Track statistics if available
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
      
      // Track round statistics
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
          upAndDowns: 0,
        });
      }
      
      const roundStats = userStats.rounds.get(roundNum)!;
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

    // Convert to final format
    const playerStats = Array.from(userStatsMap.values()).map(stats => {
      // Calculate scoring breakdown
      const birdies = stats.scoresByHole.filter((h: any) => h.diff === -1).length;
      const eagles = stats.scoresByHole.filter((h: any) => h.diff <= -2).length;
      const pars = stats.scoresByHole.filter((h: any) => h.diff === 0).length;
      const bogeys = stats.scoresByHole.filter((h: any) => h.diff === 1).length;
      const doubleBogeys = stats.scoresByHole.filter((h: any) => h.diff >= 2).length;
      
      return {
        userId: stats.userId,
        firstName: stats.firstName,
        lastName: stats.lastName,
        totalRounds: stats.totalRounds.size,
        totalHoles: stats.totalHoles,
        averageScore: stats.totalHoles > 0 ? (stats.totalStrokes / stats.totalHoles).toFixed(1) : "0.0",
        fairwayPercentage: stats.fairwayAttempts > 0 ? ((stats.fairwayHits / stats.fairwayAttempts) * 100).toFixed(1) : "0.0",
        greenPercentage: stats.greenAttempts > 0 ? ((stats.greenHits / stats.greenAttempts) * 100).toFixed(1) : "0.0",
        averagePutts: stats.totalHoles > 0 ? (stats.totalPutts / stats.totalHoles).toFixed(1) : "0.0",
        totalPenalties: stats.totalPenalties,
        totalSandSaves: stats.totalSandSaves,
        totalUpAndDowns: stats.totalUpAndDowns,
        birdies: birdies,
        eagles: eagles,
        pars: pars,
        bogeys: bogeys,
        doubleBogeys: doubleBogeys,
        totalPoints: stats.totalPoints,
        rounds: Array.from(stats.rounds.values()),
      };
    });

    return playerStats;
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
    const bets = await db.select().from(sideBets).orderBy(asc(sideBets.round), asc(sideBets.createdAt));
    return bets;
  }

  async createSideBet(insertSideBet: InsertSideBet): Promise<SideBet> {
    const [sideBet] = await db
      .insert(sideBets)
      .values({
        ...insertSideBet,
        status: insertSideBet.status || "Pending",
        result: insertSideBet.result || "Pending",
      })
      .returning();
    return sideBet;
  }

  async updateSideBetResult(betId: number, result: string): Promise<SideBet> {
    const [updatedBet] = await db
      .update(sideBets)
      .set({ result, updatedAt: new Date() })
      .where(eq(sideBets.id, betId))
      .returning();
    
    if (!updatedBet) {
      throw new Error('Side bet not found');
    }
    
    return updatedBet;
  }

  async updateSideBetStatus(betId: number, status: string): Promise<SideBet> {
    const [updatedBet] = await db
      .update(sideBets)
      .set({ status, updatedAt: new Date() })
      .where(eq(sideBets.id, betId))
      .returning();
    
    if (!updatedBet) {
      throw new Error('Side bet not found');
    }
    
    return updatedBet;
  }

  async addWitnessVote(betId: number, witnessName: string, winnerName: string): Promise<SideBet> {
    // First get the current bet to read existing votes
    const [currentBet] = await db.select().from(sideBets).where(eq(sideBets.id, betId));
    if (!currentBet) {
      throw new Error('Side bet not found');
    }

    // Parse existing votes or create new object
    const currentVotes = (currentBet.witnessVotes as any) || {};
    currentVotes[witnessName] = winnerName;

    // Count votes for each candidate
    const voteCounts: { [key: string]: number } = {};
    for (const vote of Object.values(currentVotes)) {
      voteCounts[vote as string] = (voteCounts[vote as string] || 0) + 1;
    }

    // Determine winner if majority reached (more than half of witnesses)
    const totalVotes = Object.keys(currentVotes).length;
    const majority = Math.floor(totalVotes / 2) + 1;
    let finalWinner = currentBet.winnerName;
    let finalResult = currentBet.result;

    for (const [candidate, count] of Object.entries(voteCounts)) {
      if (count >= majority) {
        finalWinner = candidate;
        finalResult = candidate === currentBet.betterName ? 'Won' : 'Lost';
        break;
      }
    }

    // Update the bet with new votes and potential resolution
    const [updatedBet] = await db
      .update(sideBets)
      .set({ 
        witnessVotes: currentVotes,
        winnerName: finalWinner,
        result: finalResult,
        updatedAt: new Date()
      })
      .where(eq(sideBets.id, betId))
      .returning();

    return updatedBet;
  }

  async markBetForResolution(betId: number): Promise<SideBet> {
    const [updatedBet] = await db
      .update(sideBets)
      .set({ readyForResolution: true, updatedAt: new Date() })
      .where(eq(sideBets.id, betId))
      .returning();
    
    if (!updatedBet) {
      throw new Error('Side bet not found');
    }
    
    return updatedBet;
  }

  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      id,
      filename: insertPhoto.filename,
      caption: insertPhoto.caption || null,
      imageUrl: insertPhoto.imageUrl || null,
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

  // Match Play Methods (Round 3)
  async getMatchPlayGroups(): Promise<MatchPlayGroup[]> {
    return await db.select().from(matchPlayGroups);
  }

  async createMatchPlayGroup(group: InsertMatchPlayGroup): Promise<MatchPlayGroup> {
    const [newGroup] = await db
      .insert(matchPlayGroups)
      .values(group)
      .returning();
    return newGroup;
  }

  async getMatchPlayMatches(groupNumber?: number): Promise<MatchPlayMatch[]> {
    const query = db.select().from(matchPlayMatches);
    if (groupNumber) {
      return await query.where(eq(matchPlayMatches.groupId, groupNumber));
    }
    return await query;
  }

  async createMatchPlayMatch(match: InsertMatchPlayMatch): Promise<MatchPlayMatch> {
    const [newMatch] = await db
      .insert(matchPlayMatches)
      .values(match)
      .returning();
    return newMatch;
  }

  async updateMatchPlayResult(matchId: number, winnerId: number | null, result: string, pointsAwarded: any): Promise<MatchPlayMatch> {
    const [updatedMatch] = await db
      .update(matchPlayMatches)
      .set({
        winnerId,
        result,
        pointsAwarded,
        matchStatus: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(matchPlayMatches.id, matchId))
      .returning();
    return updatedMatch;
  }

  async getMatchPlayLeaderboard(): Promise<any[]> {
    // Get all completed matches with player info
    const matches = await db.select({
      match: matchPlayMatches,
      player1: alias(users, 'player1'),
      player2: alias(users, 'player2'),
    }).from(matchPlayMatches)
      .innerJoin(alias(users, 'player1'), eq(matchPlayMatches.player1Id, alias(users, 'player1').id))
      .innerJoin(alias(users, 'player2'), eq(matchPlayMatches.player2Id, alias(users, 'player2').id))
      .where(eq(matchPlayMatches.matchStatus, 'completed'));

    // Calculate points for each player
    const playerPoints = new Map<number, { user: User; points: number; matchesPlayed: number }>();
    
    for (const match of matches) {
      const player1Points = (match.match.pointsAwarded as any).player1 || 0;
      const player2Points = (match.match.pointsAwarded as any).player2 || 0;
      
      // Update player 1 points
      if (!playerPoints.has(match.player1.id)) {
        playerPoints.set(match.player1.id, {
          user: match.player1,
          points: 0,
          matchesPlayed: 0,
        });
      }
      const player1Data = playerPoints.get(match.player1.id)!;
      player1Data.points += player1Points;
      player1Data.matchesPlayed += 1;
      
      // Update player 2 points
      if (!playerPoints.has(match.match.player2Id)) {
        playerPoints.set(match.match.player2Id, {
          user: match.match.player2Id === match.player1.id ? match.player1 : match.player2,
          points: 0,
          matchesPlayed: 0,
        });
      }
      const player2Data = playerPoints.get(match.match.player2Id)!;
      player2Data.points += player2Points;
      player2Data.matchesPlayed += 1;
    }

    // Convert to leaderboard format
    return Array.from(playerPoints.values())
      .sort((a, b) => b.points - a.points)
      .map(entry => ({
        user: entry.user,
        points: entry.points,
        matchesPlayed: entry.matchesPlayed,
      }));
  }

  async getCurrentMatchForPlayer(playerId: number, currentHole: number): Promise<MatchPlayMatch | null> {
    // Determine which hole segment the current hole belongs to
    let holeSegment: string;
    if (currentHole >= 1 && currentHole <= 6) {
      holeSegment = "1-6";
    } else if (currentHole >= 7 && currentHole <= 12) {
      holeSegment = "7-12";
    } else if (currentHole >= 13 && currentHole <= 18) {
      holeSegment = "13-18";
    } else {
      return null;
    }

    // Find the match for this player in this hole segment
    const [match] = await db.select().from(matchPlayMatches)
      .where(
        and(
          eq(matchPlayMatches.holes, holeSegment),
          eq(matchPlayMatches.player1Id, playerId)
        )
      )
      .union(
        db.select().from(matchPlayMatches)
          .where(
            and(
              eq(matchPlayMatches.holes, holeSegment),
              eq(matchPlayMatches.player2Id, playerId)
            )
          )
      )
      .limit(1);

    return match || null;
  }
}

export const storage = new DatabaseStorage();
