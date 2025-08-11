import {
  users,
  teams,
  scores,
  sideBets,
  photos,

  holeScores,
  tournaments,
  playerTournamentHistory,
  matchPlayMatches,
  matchPlayGroups,
  boozelympicsGames,
  boozelympicsMatches,
  golfRelayMatches,

  chatMessages,
  type User,
  type InsertUser,
  type Team,
  type Score,
  type SideBet,
  type Photo,

  type HoleScore,
  type Tournament,
  type PlayerTournamentHistory,
  type MatchPlayMatch,
  type MatchPlayGroup,
  type BoozelympicsGame,
  type BoozelympicsMatch,
  type GolfRelayMatch,

  type InsertTeam,
  type InsertScore,
  type InsertSideBet,
  type InsertPhoto,

  type InsertHoleScore,
  type InsertTournament,
  type InsertPlayerTournamentHistory,
  type InsertMatchPlayMatch,
  type InsertMatchPlayGroup,
  type InsertBoozelympicsGame,
  type InsertBoozelympicsMatch,
  type InsertGolfRelayMatch,

  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, asc, or, sql } from "drizzle-orm";
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
  getTeam(teamId: number): Promise<Team | undefined>;
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
  getScrambleLeaderboard(round: number): Promise<any[]>;
  
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
  findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2; handicap: number } | null>;
  
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
  
  // Boozelympics operations
  getBoozelympicsGames(): Promise<BoozelympicsGame[]>;
  createBoozelympicsGame(game: InsertBoozelympicsGame): Promise<BoozelympicsGame>;
  getBoozelympicsMatches(gameId?: number): Promise<BoozelympicsMatch[]>;
  createBoozelympicsMatch(match: InsertBoozelympicsMatch): Promise<BoozelympicsMatch>;
  getBoozelympicsLeaderboard(): Promise<any[]>;
  
  // Golf Relay operations
  getGolfRelayMatches(): Promise<GolfRelayMatch[]>;
  createGolfRelayMatch(match: InsertGolfRelayMatch): Promise<GolfRelayMatch>;
  getGolfRelayLeaderboard(): Promise<any[]>;
  

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

  async getUserByFullName(fullName: string): Promise<User | undefined> {
    const [firstName, lastName] = fullName.split(' ');
    return await this.getUserByName(firstName, lastName);
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

  async findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2; handicap: number } | null> {
    const allTeams = await db.select().from(teams);
    
    for (const team of allTeams) {
      if (team.player1Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 1, handicap: team.player1Handicap };
      }
      if (team.player2Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 2, handicap: team.player2Handicap };
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

  async getAllHoleScoresForRound(round: number): Promise<any[]> {
    const scores = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams,
    }).from(holeScores)
      .innerJoin(users, eq(holeScores.userId, users.id))
      .innerJoin(teams, eq(holeScores.teamId, teams.id))
      .where(eq(holeScores.round, round))
      .orderBy(asc(holeScores.hole));

    // Transform the data to match the expected format
    return scores.map(score => ({
      ...score.holeScore,
      user: score.user,
      team: score.team
    }));
  }

  // Calculate match play points for a team
  async calculateTeamMatchPlayPoints(teamId: number): Promise<number> {
    try {
      console.log(`=== CALCULATING MATCH PLAY POINTS FOR TEAM ${teamId} ===`);
      
      // Get all players on this team
      const team = await this.getTeam(teamId);
      if (!team) {
        console.log('❌ Team not found');
        return 0;
      }

      console.log(`🏌️ Team ${team.teamNumber}: ${team.player1Name} & ${team.player2Name}`);

      const player1 = await db.select()
        .from(users)
        .where(and(eq(users.firstName, team.player1Name.split(' ')[0]), eq(users.lastName, team.player1Name.split(' ')[1])))
        .limit(1);
        
      const player2 = await db.select()
        .from(users)
        .where(and(eq(users.firstName, team.player2Name.split(' ')[0]), eq(users.lastName, team.player2Name.split(' ')[1])))
        .limit(1);

      let totalTeamPoints = 0;

      // Calculate points for player 1
      if (player1.length > 0) {
        console.log(`🔍 Checking matches for ${team.player1Name} (ID: ${player1[0].id})`);
        const player1Matches = await db.select()
          .from(matchPlayMatches)
          .where(or(eq(matchPlayMatches.player1Id, player1[0].id), eq(matchPlayMatches.player2Id, player1[0].id)));

        let player1Points = 0;
        for (const match of player1Matches) {
          if (match.result && match.pointsAwarded) {
            const points = match.pointsAwarded as any;
            const playerPoints = match.player1Id === player1[0].id ? (points.player1 || 0) : (points.player2 || 0);
            player1Points += playerPoints;
            console.log(`   Match ${match.holeSegment}: +${playerPoints} points (Total: ${player1Points})`);
          }
        }
        totalTeamPoints += player1Points;
        console.log(`✅ ${team.player1Name} total: ${player1Points} points`);
      }

      // Calculate points for player 2
      if (player2.length > 0) {
        console.log(`🔍 Checking matches for ${team.player2Name} (ID: ${player2[0].id})`);
        const player2Matches = await db.select()
          .from(matchPlayMatches)
          .where(or(eq(matchPlayMatches.player1Id, player2[0].id), eq(matchPlayMatches.player2Id, player2[0].id)));

        let player2Points = 0;
        for (const match of player2Matches) {
          if (match.result && match.pointsAwarded) {
            const points = match.pointsAwarded as any;
            const playerPoints = match.player1Id === player2[0].id ? (points.player1 || 0) : (points.player2 || 0);
            player2Points += playerPoints;
            console.log(`   Match ${match.holeSegment}: +${playerPoints} points (Total: ${player2Points})`);
          }
        }
        totalTeamPoints += player2Points;
        console.log(`✅ ${team.player2Name} total: ${player2Points} points`);
      }

      console.log(`🏆 TEAM ${team.teamNumber} MATCH PLAY TOTAL: ${totalTeamPoints} points`);
      return totalTeamPoints;
    } catch (error) {
      console.error('Error calculating match play points for team:', teamId, error);
      return 0;
    }
  }

  async createHoleScore(holeScore: InsertHoleScore): Promise<HoleScore> {
    const [score] = await db
      .insert(holeScores)
      .values(holeScore)
      .returning();
    return score;
  }

  async updateHoleScore(userId: number, round: number, hole: number, strokes: number): Promise<HoleScore> {
    console.log('=== STORAGE: updateHoleScore (Regular Rounds) ===');
    console.log('Input:', { userId, round, hole, strokes });
    
    try {
      // First check if hole score exists
      console.log('🔍 Checking for existing score...');
      const [existingScore] = await db.select().from(holeScores).where(
        and(
          eq(holeScores.userId, userId),
          eq(holeScores.round, round),
          eq(holeScores.hole, hole)
        )
      );
      console.log('✅ Existing scores found:', existingScore ? 1 : 0);

      // Calculate net score and points (Stableford scoring with proper handicap)
      const par = 4; // Default par, can be customized per hole
      console.log('🏌️ Calculating handicap for hole...');
      const handicap = await this.calculateHoleHandicap(userId, hole);
      const netScore = strokes - handicap;
      let points = 0;
      
      if (netScore <= par - 2) points = 4;
      else if (netScore === par - 1) points = 3;
      else if (netScore === par) points = 2;
      else if (netScore === par + 1) points = 1;
      else points = 0;

      console.log('✅ Calculated scores:', { par, handicap, netScore, points });

      if (existingScore) {
        // Update existing score
        console.log('📝 Updating existing score record...');
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
        console.log('✅ Score updated successfully:', updatedScore);
        return updatedScore;
      } else {
        // Create new score
        console.log('🆕 Creating new score record...');
        const user = await this.getUser(userId);
        if (!user) {
          console.log('❌ User not found for ID:', userId);
          throw new Error('User not found');
        }
        console.log('✅ User found:', `${user.firstName} ${user.lastName}`);
        
        const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
        if (!playerInfo) {
          console.log('❌ Player not found in any team:', `${user.firstName} ${user.lastName}`);
          throw new Error('Player not found in any team');
        }
        console.log('✅ Player team info found:', playerInfo);

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
        console.log('✅ New score created successfully:', newScore);
        return newScore;
      }
    } catch (error) {
      console.error('❌ Storage error in updateHoleScore:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
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

  async getLeaderboard(round: number): Promise<any[]> {
    if (round === 1) {
      // Round 1: Better ball format - show tournament placement points
      return this.getTournamentPlacementLeaderboard(round);
    } else if (round === 2) {
      // Round 2: Scramble format - show tournament placement points
      return this.getTournamentPlacementLeaderboard(round);
    } else if (round === 3) {
      // Round 3: Match play format - points from individual matches
      return this.getMatchPlayLeaderboard();
    } else {
      return [];
    }
  }

  async calculateHoleHandicap(userId: number, hole: number): Promise<number> {
    // Get the user's course handicap
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
    if (!playerInfo) return 0;
    
    // Get player's handicap from team assignment
    const playerHandicap = playerInfo.handicap || 0;
    
    // Course handicap allocation - distribute strokes based on hole difficulty
    // Most golf courses allocate strokes starting from handicap hole 1 (hardest)
    // For simplicity, we'll use a standard allocation pattern
    const holeHandicapIndex = [
      10, 4, 14, 2, 12, 8, 16, 6, 18, 1, 11, 5, 15, 3, 13, 7, 17, 9
    ];
    
    const strokeIndex = holeHandicapIndex[hole - 1] || 18;
    
    // Player gets a stroke if their handicap >= stroke index
    return playerHandicap >= strokeIndex ? 1 : 0;
  }

  async getTournamentPlacementLeaderboard(round: number): Promise<any[]> {
    // Get all teams and their tournament placement points for this round
    const teams = await this.getTeams();
    const teamPlacementData = [];
    
    for (const team of teams) {
      const roundPoints = await this.calculateTeamRoundPoints(team.id, round);
      const stablefordPoints = await this.calculateTeamStablefordPoints(team.id, round);
      const holesCompleted = await this.getTeamHolesCompleted(team.id, round);
      const matchPlayPoints = await this.calculateTeamMatchPlayPoints(team.id);
      
      // Total points include both round points + match play points for comprehensive tournament standings
      const totalPoints = roundPoints + matchPlayPoints;
      
      teamPlacementData.push({
        id: team.id,
        team: team,
        roundPoints: roundPoints,
        stablefordPoints: stablefordPoints,
        holesCompleted: holesCompleted,
        matchPlayPoints: matchPlayPoints,
        totalPoints: totalPoints, // Include match play points in total
        isTeamLeaderboard: true,
        position: 0 // Will be set after sorting
      });
    }
    
    // Sort teams by total points (round + match play) - highest points = best placement
    teamPlacementData.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Assign positions based on total tournament points
    teamPlacementData.forEach((team, index) => {
      team.position = index + 1;
    });
    
    return teamPlacementData;
  }

  async getScrambleLeaderboard(round: number): Promise<any[]> {
    // For scramble, each team should have only one score per hole
    // Get unique team scores per hole (should be same for all team members)
    const scores = await db.select({
      holeScore: holeScores,
      user: users,
      team: teams,
    }).from(holeScores)
      .innerJoin(users, eq(holeScores.userId, users.id))
      .innerJoin(teams, eq(holeScores.teamId, teams.id))
      .where(eq(holeScores.round, round));

    // Group by team and hole to get team scores
    const teamHoleScores = new Map<string, { team: Team; hole: number; strokes: number; points: number; par: number; handicap: number }>();
    const teamPlayers = new Map<number, User[]>();
    
    for (const score of scores) {
      const key = `${score.team.id}-${score.holeScore.hole}`;
      
      // Store team players
      if (!teamPlayers.has(score.team.id)) {
        teamPlayers.set(score.team.id, []);
      }
      const players = teamPlayers.get(score.team.id)!;
      if (!players.find(p => p.id === score.user.id)) {
        players.push(score.user);
      }
      
      // For scramble, all team members should have the same score per hole
      // Take the first score found for each team-hole combination
      if (!teamHoleScores.has(key)) {
        teamHoleScores.set(key, {
          team: score.team,
          hole: score.holeScore.hole,
          strokes: score.holeScore.strokes,
          points: score.holeScore.points,
          par: score.holeScore.par,
          handicap: score.holeScore.handicap,
        });
      }
    }

    // Calculate scramble team handicaps: 35% of lower + 15% of higher
    const calculateScrambleTeamHandicap = (team: Team): number => {
      const player1Hcp = team.player1Handicap || 0;
      const player2Hcp = team.player2Handicap || 0;
      
      const lowerHcp = Math.min(player1Hcp, player2Hcp);
      const higherHcp = Math.max(player1Hcp, player2Hcp);
      
      return Math.round((lowerHcp * 0.35) + (higherHcp * 0.15));
    };

    // Calculate how many strokes a team gets on each hole
    const getStrokesOnHole = (teamHandicap: number, holeHandicap: number): number => {
      if (teamHandicap >= holeHandicap) {
        return 1;
      }
      return 0;
    };

    // Calculate team totals with net scoring
    const teamTotals = new Map<number, { 
      team: Team; 
      totalPoints: number; 
      totalGrossStrokes: number; 
      totalNetStrokes: number; 
      grossToPar: number; 
      netToPar: number; 
      holes: number; 
      players: User[];
      teamHandicap: number;
    }>();
    
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
          teamHandicap: teamHandicap,
        });
      }
      const teamTotal = teamTotals.get(teamId)!;
      
      // Calculate net score for this hole
      const strokesReceived = getStrokesOnHole(teamTotal.teamHandicap, teamHole.handicap);
      const netScore = teamHole.strokes - strokesReceived;
      
      // Calculate Stableford points based on net score
      const netToPar = netScore - teamHole.par;
      let stablefordPoints = 0;
      if (netToPar <= -2) stablefordPoints = 4; // Eagle or better
      else if (netToPar === -1) stablefordPoints = 3; // Birdie
      else if (netToPar === 0) stablefordPoints = 2; // Par
      else if (netToPar === 1) stablefordPoints = 1; // Bogey
      // Double bogey or worse = 0 points
      
      teamTotal.totalPoints += stablefordPoints;
      teamTotal.totalGrossStrokes += teamHole.strokes;
      teamTotal.totalNetStrokes += netScore;
      teamTotal.grossToPar += (teamHole.strokes - teamHole.par);
      teamTotal.netToPar += netToPar;
      teamTotal.holes += 1;
    }

    // Convert to leaderboard format and sort by total points (highest wins for Stableford)
    const leaderboard = Array.from(teamTotals.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        id: entry.team.id,
        team: entry.team,
        players: entry.players,
        totalPoints: entry.totalPoints,
        totalGrossStrokes: entry.totalGrossStrokes,
        totalNetStrokes: entry.totalNetStrokes,
        grossToPar: entry.grossToPar,
        netToPar: entry.netToPar,
        holes: entry.holes,
        teamHandicap: entry.teamHandicap,
        position: index + 1,
        isTeamLeaderboard: true,
        isScramble: true,
      }));

    return leaderboard;
  }

  async getMatchPlayLeaderboard(): Promise<any[]> {
    // Round 3: Get match play results and calculate points
    const matches = await db.select().from(matchPlayMatches);
    
    // Calculate points for each player based on match results
    const playerPoints = new Map<number, { user: User; team: Team; matchPoints: number; matchesPlayed: number; matchesWon: number }>();
    
    // Get all users and their teams for initialization
    const allUsers = await db.select({
      user: users,
      team: teams,
    }).from(users)
      .innerJoin(teams, eq(users.teamId, teams.id));
    
    // Initialize all players
    for (const userTeam of allUsers) {
      playerPoints.set(userTeam.user.id, {
        user: userTeam.user,
        team: userTeam.team,
        matchPoints: 0,
        matchesPlayed: 0,
        matchesWon: 0,
      });
    }
    
    // Calculate points from matches
    for (const match of matches) {
      const player1Stats = playerPoints.get(match.player1Id);
      const player2Stats = playerPoints.get(match.player2Id);
      
      if (player1Stats) {
        player1Stats.matchesPlayed += 1;
        if (match.winnerId === match.player1Id) {
          player1Stats.matchPoints += 1;
          player1Stats.matchesWon += 1;
        } else if (match.winnerId === null) {
          player1Stats.matchPoints += 0.5; // Tie
        }
      }
      
      if (player2Stats) {
        player2Stats.matchesPlayed += 1;
        if (match.winnerId === match.player2Id) {
          player2Stats.matchPoints += 1;
          player2Stats.matchesWon += 1;
        } else if (match.winnerId === null) {
          player2Stats.matchPoints += 0.5; // Tie
        }
      }
    }

    // Convert to leaderboard format and sort by match points
    const leaderboard = Array.from(playerPoints.values())
      .sort((a, b) => b.matchPoints - a.matchPoints)
      .map((entry, index) => ({
        ...entry.user,
        user: entry.user,
        team: entry.team,
        totalPoints: entry.matchPoints,
        matchesPlayed: entry.matchesPlayed,
        matchesWon: entry.matchesWon,
        position: index + 1,
        isTeamLeaderboard: false,
        isMatchPlay: true,
      }));

    return leaderboard;
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
    const teamHoleScores = new Map<string, { 
      team: Team; 
      hole: number; 
      par: number;
      bestGrossScore: number; 
      bestNetScore: number; 
      bestPoints: number; 
      players: User[] 
    }>();
    
    for (const score of scores) {
      const key = `${score.team.id}-${score.holeScore.hole}`;
      if (!teamHoleScores.has(key)) {
        teamHoleScores.set(key, {
          team: score.team,
          hole: score.holeScore.hole,
          par: score.holeScore.par,
          bestGrossScore: score.holeScore.strokes,
          bestNetScore: score.holeScore.netScore,
          bestPoints: score.holeScore.points,
          players: [score.user],
        });
      } else {
        const teamHole = teamHoleScores.get(key)!;
        // Better ball uses best gross score per hole
        if (score.holeScore.strokes < teamHole.bestGrossScore) {
          teamHole.bestGrossScore = score.holeScore.strokes;
          teamHole.bestNetScore = score.holeScore.netScore;
          teamHole.bestPoints = score.holeScore.points;
        }
        if (!teamHole.players.find(p => p.id === score.user.id)) {
          teamHole.players.push(score.user);
        }
      }
    }

    // Calculate team totals
    const teamTotals = new Map<number, { 
      team: Team; 
      totalPoints: number; 
      totalGrossStrokes: number;
      totalNetStrokes: number; 
      grossToPar: number;
      netToPar: number;
      holes: number; 
      players: User[] 
    }>();
    
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
          players: [],
        });
      }
      const teamTotal = teamTotals.get(teamId)!;
      teamTotal.totalPoints += teamHole.bestPoints;
      teamTotal.totalGrossStrokes += teamHole.bestGrossScore;
      teamTotal.totalNetStrokes += teamHole.bestNetScore;
      teamTotal.grossToPar += (teamHole.bestGrossScore - teamHole.par);
      teamTotal.netToPar += (teamHole.bestNetScore - teamHole.par);
      teamTotal.holes += 1;
      
      // Add unique players to the team
      for (const player of teamHole.players) {
        if (!teamTotal.players.find(p => p.id === player.id)) {
          teamTotal.players.push(player);
        }
      }
    }

    // Convert to leaderboard format and sort by total gross strokes (lowest wins)
    const leaderboard = Array.from(teamTotals.values())
      .sort((a, b) => a.totalGrossStrokes - b.totalGrossStrokes)
      .map((entry, index) => ({
        id: entry.team.id,
        team: entry.team,
        players: entry.players,
        totalPoints: entry.totalPoints,
        totalGrossStrokes: entry.totalGrossStrokes,
        totalNetStrokes: entry.totalNetStrokes,
        grossToPar: entry.grossToPar,
        netToPar: entry.netToPar,
        holes: entry.holes,
        position: index + 1,
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
      { teamNumber: 4, player1Name: "Erik Boudreau", player1Handicap: 10, player2Name: "Will Bibi", player2Handicap: 5 },
      { teamNumber: 5, player1Name: "Nick Cook", player1Handicap: 12, player2Name: "Kevin Durco", player2Handicap: 3 },
      { teamNumber: 6, player1Name: "Spencer Reid", player1Handicap: 16, player2Name: "Jeff Reiner", player2Handicap: 9 },
      { teamNumber: 7, player1Name: "Sye Ellard", player1Handicap: 18, player2Name: "James Ogilvie", player2Handicap: 17 },
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
        round1Points: 0,
        round2Points: 0,
        round3Points: 0,
        matchPlayPoints: 0,
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

  async getTeam(teamId: number): Promise<Team | undefined> {
    return this.teams.get(teamId);
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
      
      // Calculate match play points for this team
      const matchPlayPoints = await this.calculateTeamMatchPlayPoints(team.id);
      
      const totalPoints = round1Points + round2Points + round3Points + matchPlayPoints;
      
      const scoreWithTeam = {
        id: team.id,
        teamId: team.id,
        round1Points,
        round2Points,
        round3Points,
        matchPlayPoints,
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

  async getLiveScores(): Promise<(Score & { team: Team; currentRoundPoints: number; currentRoundStanding: number; })[]> {
    // First get the calculated scores
    const calculatedScores = await this.getCalculatedScores();
    
    // Determine current round and add live standings
    const liveScores = await Promise.all(calculatedScores.map(async (score) => {
      const currentRoundPoints = await this.getCurrentRoundPoints(score.teamId);
      const currentRoundStanding = await this.getCurrentRoundStanding(score.teamId);
      
      return {
        ...score,
        currentRoundPoints,
        currentRoundStanding,
      };
    }));
    
    return liveScores;
  }

  async getCurrentRoundPoints(teamId: number): Promise<number> {
    // Determine which round is currently active based on hole scores
    const rounds = [1, 2, 3];
    let currentRound = 1;
    
    // Check which round is in progress
    for (const round of rounds) {
      const holesCompleted = await this.getTeamHolesCompleted(teamId, round);
      
      if (holesCompleted > 0 && holesCompleted < 18) {
        // This round is in progress
        currentRound = round;
        break;
      } else if (holesCompleted === 18) {
        // This round is complete, check next round
        if (round < 3) {
          currentRound = round + 1;
        }
      }
    }
    
    // For rounds 1 and 2, show live placement-based points during play
    if (currentRound === 1 || currentRound === 2) {
      const allTeams = await this.getTeams();
      const teamCurrentScores = await Promise.all(allTeams.map(async (team) => {
        const stablefordPoints = await this.calculateTeamStablefordPoints(team.id, currentRound);
        return {
          teamId: team.id,
          stablefordPoints: stablefordPoints,
          holesCompleted: await this.getTeamHolesCompleted(team.id, currentRound)
        };
      }));
      
      // Sort by current Stableford points to determine standings
      teamCurrentScores.sort((a, b) => b.stablefordPoints - a.stablefordPoints);
      
      // Find this team's current position and award points accordingly
      const teamPosition = teamCurrentScores.findIndex(score => score.teamId === teamId) + 1;
      const teamData = teamCurrentScores.find(score => score.teamId === teamId);
      
      // Award points based on current standing if round is in progress
      if (teamData && teamData.holesCompleted > 0 && teamData.holesCompleted < 18) {
        // Award temporary points based on current standing using new point structure
        const pointsMap = [10, 8, 6, 5, 4, 3, 2, 1]; // Index 0 = 1st place, Index 1 = 2nd place, etc.
        const pointsAwarded = teamPosition <= pointsMap.length ? pointsMap[teamPosition - 1] : 1;
        return pointsAwarded;
      }
    }
    
    return await this.calculateTeamRoundPoints(teamId, currentRound);
  }

  async getCurrentRoundStanding(teamId: number): Promise<number> {
    // Get all teams' current round performance
    const allTeams = await this.getTeams();
    const teamScores = await Promise.all(allTeams.map(async (team) => ({
      teamId: team.id,
      points: await this.getCurrentRoundPoints(team.id)
    })));
    
    // Sort by points (descending) to get standings
    teamScores.sort((a, b) => b.points - a.points);
    
    // Find this team's position
    const position = teamScores.findIndex(score => score.teamId === teamId) + 1;
    return position;
  }

  async getTeamHolesCompleted(teamId: number, round: number): Promise<number> {
    // Get unique holes completed for this team in this round
    const uniqueHoles = await db.selectDistinct({ hole: holeScores.hole })
      .from(holeScores)
      .where(and(eq(holeScores.teamId, teamId), eq(holeScores.round, round)));
    
    return uniqueHoles.length;
  }

  private async calculateTeamRoundPoints(teamId: number, round: number): Promise<number> {
    // For rounds 1 and 2, calculate based on team finishing position (1-10 points)
    if (round === 1 || round === 2) {
      return await this.calculateTournamentPlacementPoints(teamId, round);
    }
    
    // For round 3 (match play), calculate based on individual match results
    if (round === 3) {
      return await this.calculateMatchPlayPoints(teamId, round);
    }
    
    return 0;
  }

  private async calculateTournamentPlacementPoints(teamId: number, round: number): Promise<number> {
    // Get all teams' performance for this round
    const allTeams = await this.getTeams();
    const teamPerformances = await Promise.all(allTeams.map(async (team) => {
      const teamStablefordPoints = await this.calculateTeamStablefordPoints(team.id, round);
      const holesCompleted = await this.getTeamHolesCompleted(team.id, round);
      

      
      return {
        teamId: team.id,
        stablefordPoints: teamStablefordPoints,
        holesCompleted: holesCompleted
      };
    }));

    // Only include teams that have completed the round (18 holes)
    const completedTeams = teamPerformances.filter(team => team.holesCompleted === 18);
    
    // If the round isn't complete, return 0 points
    if (completedTeams.length === 0) {
      return 0;
    }

    // Sort teams by Stableford points (descending - highest points = best performance)
    completedTeams.sort((a, b) => b.stablefordPoints - a.stablefordPoints);

    // Find team's position and award placement points (1st = 10 points, 2nd = 9 points, etc.)
    const teamPosition = completedTeams.findIndex(team => team.teamId === teamId) + 1;
    
    if (teamPosition === 0) {
      // Team hasn't completed the round yet
      return 0;
    }

    // Award points: 1st=10pts, 2nd=8pts, 3rd=6pts, 4th=5pts, 5th=4pts, 6th=3pts, 7th=2pts, 8th=1pt
    const pointsMap = [10, 8, 6, 5, 4, 3, 2, 1]; // Index 0 = 1st place, Index 1 = 2nd place, etc.
    const placementPoints = teamPosition <= pointsMap.length ? pointsMap[teamPosition - 1] : 1;
    return placementPoints;
  }

  private async calculateTeamStablefordPoints(teamId: number, round: number): Promise<number> {
    if (round === 1) {
      // Round 1: Better ball - take best score per hole from team members
      const teamHoleScores = await db.select({
        holeScore: holeScores,
        user: users,
      }).from(holeScores)
        .innerJoin(users, eq(holeScores.userId, users.id))
        .where(
          and(
            eq(holeScores.teamId, teamId),
            eq(holeScores.round, round)
          )
        );

      // Group by hole and take best score
      const holeMap = new Map<number, number>();
      for (const score of teamHoleScores) {
        const hole = score.holeScore.hole;
        const points = score.holeScore.points;
        if (!holeMap.has(hole) || points > holeMap.get(hole)!) {
          holeMap.set(hole, points);
        }
      }
      
      return Array.from(holeMap.values()).reduce((total, points) => total + points, 0);
    } else if (round === 2) {
      // Round 2: Scramble - one score per hole per team (all team members should have same score)
      const teamHoleScores = await db.select()
        .from(holeScores)
        .where(
          and(
            eq(holeScores.teamId, teamId),
            eq(holeScores.round, round)
          )
        );

      // For scramble, take unique hole scores (there should be one per hole)
      const uniqueHoles = new Map<number, number>();
      for (const holeScore of teamHoleScores) {
        if (!uniqueHoles.has(holeScore.hole)) {
          uniqueHoles.set(holeScore.hole, holeScore.points);
        }
      }
      
      return Array.from(uniqueHoles.values()).reduce((total, points) => total + points, 0);
    } else {
      // Round 3: Match play - handled separately
      return 0;
    }
  }

  private async calculateMatchPlayPoints(teamId: number, round: number): Promise<number> {
    // For Round 3 match play, points are based on individual match results
    // Each team member can earn points from their matches
    
    // Get team members
    const team = await this.getTeam(teamId);
    if (!team) return 0;

    // Get both players' user IDs
    const player1 = await this.getUserByFullName(team.player1Name);
    const player2 = await this.getUserByFullName(team.player2Name);
    
    if (!player1 || !player2) return 0;

    // Calculate points for both players from their match play results
    const player1Points = await this.calculatePlayerMatchPlayPoints(player1.id);
    const player2Points = await this.calculatePlayerMatchPlayPoints(player2.id);

    return player1Points + player2Points;
  }

  private async calculatePlayerMatchPlayPoints(playerId: number): Promise<number> {
    // Get all match results for this player
    const matches = await db.select()
      .from(matchPlayMatches)
      .where(
        or(
          eq(matchPlayMatches.player1Id, playerId),
          eq(matchPlayMatches.player2Id, playerId)
        )
      );

    let totalPoints = 0;
    
    for (const match of matches) {
      if (match.winnerId === playerId) {
        // Player won the match - award 2 points
        totalPoints += 2;
      } else if (match.result === 'tie') {
        // Match was tied - award 1 point
        totalPoints += 1;
      }
      // No points for losing a match
    }

    return totalPoints;
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

  // Chat Messages
  async getChatMessages(): Promise<any[]> {
    const messages = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        taggedUserIds: chatMessages.taggedUserIds,
        createdAt: chatMessages.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(asc(chatMessages.createdAt));
    
    return messages;
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<any> {
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    
    // Get the complete message with user info
    const [fullMessage] = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        taggedUserIds: chatMessages.taggedUserIds,
        createdAt: chatMessages.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.id, message.id));
    
    return fullMessage;
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
    try {
      // Use raw SQL to avoid schema mismatch issues - return manual structure
      const result = groupNumber 
        ? await db.execute(sql`SELECT * FROM match_play_matches WHERE group_number = ${groupNumber}`)
        : await db.execute(sql`SELECT * FROM match_play_matches`);
      
      // Convert database rows to proper match objects
      return result.rows.map((row: any) => ({
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
      console.error('Error fetching match play matches:', error);
      return [];
    }
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
    try {
      // Get all matches using raw SQL to avoid schema issues
      const result = await db.execute(sql`
        SELECT * FROM match_play_matches
      `);
      
      const matches = result.rows;

      // Calculate points for each player
      const playerPoints = new Map<number, { 
        user: any; 
        points: number; 
        matchesPlayed: number;
        matchesWon: number;
        matchesTied: number;
        matchesLost: number;
      }>();
      
      for (const match of matches) {
        const player1Id = match.player1_id as number;
        const player2Id = match.player2_id as number;
        const winnerId = match.winner_id as number | null;
        
        // Get user data for both players
        const player1User = await this.getUser(player1Id.toString());
        const player2User = await this.getUser(player2Id.toString());
        
        // Update player 1 stats
        if (!playerPoints.has(player1Id)) {
          playerPoints.set(player1Id, {
            user: player1User,
            points: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesTied: 0,
            matchesLost: 0,
          });
        }
        const player1Data = playerPoints.get(player1Id)!;
        if (winnerId === player1Id) {
          player1Data.points += 2; // Win = 2 points
          player1Data.matchesWon += 1;
        } else if (winnerId === null) {
          player1Data.points += 1; // Tie = 1 point
          player1Data.matchesTied += 1;
        } else {
          player1Data.matchesLost += 1; // Loss = 0 points
        }
        player1Data.matchesPlayed += 1;
        
        // Update player 2 stats
        if (!playerPoints.has(player2Id)) {
          playerPoints.set(player2Id, {
            user: player2User,
            points: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesTied: 0,
            matchesLost: 0,
          });
        }
        const player2Data = playerPoints.get(player2Id)!;
        if (winnerId === player2Id) {
          player2Data.points += 2; // Win = 2 points
          player2Data.matchesWon += 1;
        } else if (winnerId === null) {
          player2Data.points += 1; // Tie = 1 point
          player2Data.matchesTied += 1;
        } else {
          player2Data.matchesLost += 1; // Loss = 0 points
        }
        player2Data.matchesPlayed += 1;
      }

      // Convert to leaderboard format matching frontend expectations
      return Array.from(playerPoints.values())
        .sort((a, b) => b.points - a.points)
        .map(entry => ({
          playerId: entry.user?.id || 0,
          playerName: entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Unknown Player',
          totalPoints: entry.points,
          matchesPlayed: entry.matchesPlayed,
          matchesWon: entry.matchesWon,
          matchesTied: entry.matchesTied,
          matchesLost: entry.matchesLost,
        }));
    } catch (error) {
      console.error('Error fetching match play leaderboard:', error);
      return [];
    }
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

    try {
      // Use direct SQL query to avoid schema issues
      const result = await db.execute(sql`
        SELECT * FROM match_play_matches 
        WHERE hole_segment = ${holeSegment} 
        AND (player1_id = ${playerId} OR player2_id = ${playerId})
      `);
      
      const match = result.rows[0];
      console.log('Found match:', match);
      
      if (!match) {
        return null;
      }
      
      // Convert database row to match object
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
      console.error('Error fetching current match:', error);
      return null;
    }
  }

  // Boozelympics operations
  async getBoozelympicsGames(): Promise<BoozelympicsGame[]> {
    return await db.select().from(boozelympicsGames).where(eq(boozelympicsGames.isActive, true));
  }

  async createBoozelympicsGame(game: InsertBoozelympicsGame): Promise<BoozelympicsGame> {
    const [newGame] = await db.insert(boozelympicsGames).values(game).returning();
    return newGame;
  }

  async getBoozelympicsMatches(gameId?: number): Promise<BoozelympicsMatch[]> {
    let query = db.select().from(boozelympicsMatches);
    if (gameId) {
      query = query.where(eq(boozelympicsMatches.gameId, gameId));
    }
    return await query;
  }

  async createBoozelympicsMatch(match: InsertBoozelympicsMatch): Promise<BoozelympicsMatch> {
    const [newMatch] = await db.insert(boozelympicsMatches).values(match).returning();
    return newMatch;
  }

  async getBoozelympicsLeaderboard(): Promise<any[]> {
    // Calculate team points from all matches
    const matches = await db.select().from(boozelympicsMatches);
    const teamStats = new Map();
    
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
    
    // Get team info and sort by points
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
  async getGolfRelayMatches(): Promise<GolfRelayMatch[]> {
    return await db.select().from(golfRelayMatches).orderBy(golfRelayMatches.createdAt);
  }

  async createGolfRelayMatch(match: InsertGolfRelayMatch): Promise<GolfRelayMatch> {
    const [newMatch] = await db.insert(golfRelayMatches).values(match).returning();
    return newMatch;
  }

  async getGolfRelayLeaderboard(): Promise<any[]> {
    const matches = await db.select().from(golfRelayMatches);
    const playerStats = new Map();
    
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
    
    // Get player info and create leaderboard
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


}

export const storage = new DatabaseStorage();
