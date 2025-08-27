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
  type Matchup,
  type InsertMatchup,
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
import { deerhurstCourse } from "@shared/courseData";

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
  
  // Team Hole Scores (for scramble)
  getTeamHoleScores(teamId: number, round: number): Promise<HoleScore[]>;
  updateTeamHoleScore(teamId: number, round: number, hole: number, strokes: number, userId: number): Promise<HoleScore>;
  
  // Team Hole Scores (for scramble)
  getTeamHoleScores(teamId: number, round: number): Promise<HoleScore[]>;
  updateTeamHoleScore(teamId: number, round: number, hole: number, strokes: number, userId: number): Promise<HoleScore>;
  
  // Player Statistics
  getPlayerStatistics(): Promise<any[]>;
  
  // Side Bets
  getSideBets(): Promise<SideBet[]>;
  createSideBet(bet: InsertSideBet): Promise<SideBet>;
  updateSideBetResult(betId: number, result: string): Promise<SideBet>;
  updateSideBetStatus(betId: number, status: string): Promise<SideBet>;
  updateTeammateAcceptance(betId: number, userName: string): Promise<SideBet>;
  addWitnessVote(betId: number, witnessName: string, winnerName: string): Promise<SideBet>;
  markBetForResolution(betId: number): Promise<SideBet>;
  
  // Photos
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Matchups - persistent storage
  getMatchups(): Promise<Matchup[]>;
  getMatchupsByRound(round: number): Promise<Matchup[]>;
  createMatchup(matchup: InsertMatchup): Promise<Matchup>;
  updateMatchupScore(matchupId: number, player1Score: number, player2Score: number): Promise<Matchup>;
  clearAllMatchups(): Promise<void>;
  shuffleMatchupsForRound(round: number, shuffledMatchups: InsertMatchup[]): Promise<Matchup[]>;
  
  // Match Play (Round 3)
  getMatchPlayGroups(): Promise<MatchPlayGroup[]>;
  createMatchPlayGroup(group: InsertMatchPlayGroup): Promise<MatchPlayGroup>;
  getMatchPlayMatches(groupNumber?: number): Promise<MatchPlayMatch[]>;
  createMatchPlayMatch(match: InsertMatchPlayMatch): Promise<MatchPlayMatch>;
  updateMatchPlayResult(matchId: number, winnerId: number | null, result: string, pointsAwarded: any): Promise<MatchPlayMatch>;
  getMatchPlayLeaderboard(): Promise<any[]>;
  getCurrentMatchForPlayer(playerId: number, currentHole: number): Promise<MatchPlayMatch | null>;
  
  // Player matching
  findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 | 3; handicap: number } | null>;
  
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

  async findPlayerByName(firstName: string, lastName: string): Promise<{ teamId: number; playerNumber: 1 | 2 | 3; handicap: number } | null> {
    const allTeams = await db.select().from(teams);
    
    // First get the player's handicap from the users table (single source of truth)
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
      // Check for player3Name in 3-person teams (Team 7)
      if (team.player3Name && team.player3Name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()) {
        return { teamId: team.id, playerNumber: 3, handicap: user.handicap || 0 };
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

      const displayName = team.isThreePersonTeam 
        ? `${team.player1Name}, ${team.player2Name} & ${team.player3Name}`
        : `${team.player1Name} & ${team.player2Name}`;
      console.log(`🏌️ Team ${team.teamNumber}: ${displayName}`);

      const playerPoints: number[] = [];

      // Get player 1 points
      const player1 = await db.select()
        .from(users)
        .where(and(eq(users.firstName, team.player1Name.split(' ')[0]), eq(users.lastName, team.player1Name.split(' ')[1])))
        .limit(1);
        
      if (player1.length > 0) {
        console.log(`🔍 Checking matches for ${team.player1Name} (ID: ${player1[0].id})`);
        const player1Matches = await db.select()
          .from(matchPlayMatches)
          .where(or(eq(matchPlayMatches.player1Id, player1[0].id), eq(matchPlayMatches.player2Id, player1[0].id)));

        let player1Points = 0;
        for (const match of player1Matches) {
          if (match.result && match.pointsAwarded) {
            const points = match.pointsAwarded as any;
            const playerPointsFromMatch = match.player1Id === player1[0].id ? (points.player1 || 0) : (points.player2 || 0);
            player1Points += playerPointsFromMatch;
            console.log(`   Match ${match.holeSegment}: +${playerPointsFromMatch} points (Total: ${player1Points})`);
          }
        }
        playerPoints.push(player1Points);
        console.log(`✅ ${team.player1Name} total: ${player1Points} points`);
      }

      // Get player 2 points
      const player2 = await db.select()
        .from(users)
        .where(and(eq(users.firstName, team.player2Name.split(' ')[0]), eq(users.lastName, team.player2Name.split(' ')[1])))
        .limit(1);
        
      if (player2.length > 0) {
        console.log(`🔍 Checking matches for ${team.player2Name} (ID: ${player2[0].id})`);
        const player2Matches = await db.select()
          .from(matchPlayMatches)
          .where(or(eq(matchPlayMatches.player1Id, player2[0].id), eq(matchPlayMatches.player2Id, player2[0].id)));

        let player2Points = 0;
        for (const match of player2Matches) {
          if (match.result && match.pointsAwarded) {
            const points = match.pointsAwarded as any;
            const playerPointsFromMatch = match.player1Id === player2[0].id ? (points.player1 || 0) : (points.player2 || 0);
            player2Points += playerPointsFromMatch;
            console.log(`   Match ${match.holeSegment}: +${playerPointsFromMatch} points (Total: ${player2Points})`);
          }
        }
        playerPoints.push(player2Points);
        console.log(`✅ ${team.player2Name} total: ${player2Points} points`);
      }

      // For 3-person teams: get player 3 points and apply "best 2 out of 3" rule
      if (team.isThreePersonTeam && team.player3Name) {
        const player3 = await db.select()
          .from(users)
          .where(and(eq(users.firstName, team.player3Name.split(' ')[0]), eq(users.lastName, team.player3Name.split(' ')[1])))
          .limit(1);
          
        if (player3.length > 0) {
          console.log(`🔍 Checking matches for ${team.player3Name} (ID: ${player3[0].id})`);
          const player3Matches = await db.select()
            .from(matchPlayMatches)
            .where(or(eq(matchPlayMatches.player1Id, player3[0].id), eq(matchPlayMatches.player2Id, player3[0].id)));

          let player3Points = 0;
          for (const match of player3Matches) {
            if (match.result && match.pointsAwarded) {
              const points = match.pointsAwarded as any;
              const playerPointsFromMatch = match.player1Id === player3[0].id ? (points.player1 || 0) : (points.player2 || 0);
              player3Points += playerPointsFromMatch;
              console.log(`   Match ${match.holeSegment}: +${playerPointsFromMatch} points (Total: ${player3Points})`);
            }
          }
          playerPoints.push(player3Points);
          console.log(`✅ ${team.player3Name} total: ${player3Points} points`);
        }
      }

      // Calculate total team points
      let totalTeamPoints = 0;
      if (team.isThreePersonTeam) {
        // For 3-person teams: take best 2 out of 3 scores
        playerPoints.sort((a, b) => b - a); // Sort descending
        totalTeamPoints = playerPoints.slice(0, 2).reduce((sum, points) => sum + points, 0);
        console.log(`🎯 3-PERSON TEAM - Taking best 2 out of 3: [${playerPoints.join(', ')}] → Best 2: ${totalTeamPoints} points`);
      } else {
        // For 2-person teams: take both scores
        totalTeamPoints = playerPoints.reduce((sum, points) => sum + points, 0);
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
    // Get the user's course handicap directly from users table (single source of truth)
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    // Use handicap directly from users table
    const playerHandicap = user.handicap || 0;
    
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
      
      // For Rounds 1 and 2, get net strokes and gross strokes for display and ranking
      let netStrokes = 0;
      let grossStrokes = 0;
      if (round === 1 || round === 2) {
        netStrokes = await this.calculateTeamNetStrokes(team.id, round);
        grossStrokes = await this.calculateTeamGrossStrokes(team.id, round);
        
        // Ensure consistency: if we have no gross strokes, net strokes should also be 0
        if (grossStrokes === 0) {
          netStrokes = 0;
        }
      }
      
      // Total points include both round points + match play points for comprehensive tournament standings
      const totalPoints = roundPoints + matchPlayPoints;
      
      teamPlacementData.push({
        id: team.id,
        team: team,
        roundPoints: roundPoints,
        stablefordPoints: stablefordPoints,
        netStrokes: netStrokes, // Add net strokes for Rounds 1 and 2
        netScore: netStrokes, // Also add as netScore for frontend compatibility
        totalGrossStrokes: grossStrokes, // Add gross strokes for display
        grossToPar: grossStrokes > 0 && holesCompleted >= 18 ? grossStrokes - 72 : 0, // Only calculate to par for completed rounds
        holesCompleted: holesCompleted,
        matchPlayPoints: matchPlayPoints,
        totalPoints: totalPoints, // Include match play points in total
        isTeamLeaderboard: true,
        position: 0 // Will be set after sorting
      });
    }
    
    if (round === 2) {
      // Round 2: Sort by net strokes (lower is better), but still show by total tournament points for overall rankings
      // The key insight: Round 2 placement should be determined by net stroke performance
      // Filter teams that have started Round 2
      const teamsWithRound2Scores = teamPlacementData.filter(team => team.holesCompleted > 0);
      const teamsWithoutRound2Scores = teamPlacementData.filter(team => team.holesCompleted === 0);
      
      // Sort teams with scores by net strokes (lower = better)
      teamsWithRound2Scores.sort((a, b) => a.netStrokes - b.netStrokes);
      
      // Sort teams without scores by total tournament points
      teamsWithoutRound2Scores.sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Combine: teams with Round 2 scores first, then teams without
      const sortedTeams = [...teamsWithRound2Scores, ...teamsWithoutRound2Scores];
      
      // Assign positions
      sortedTeams.forEach((team, index) => {
        team.position = index + 1;
      });
      
      return sortedTeams;
    } else if (round === 1) {
      // Round 1: Better ball format - sort by lowest net strokes (lower is better)
      const teamsWithScores = teamPlacementData.filter(team => team.holesCompleted > 0);
      const teamsWithoutScores = teamPlacementData.filter(team => team.holesCompleted === 0);
      
      // Sort teams with scores by net strokes (lower = better)
      teamsWithScores.sort((a, b) => a.netStrokes - b.netStrokes);
      
      // Sort teams without scores by total tournament points (from previous rounds + match play)
      teamsWithoutScores.sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Combine: teams with current round scores first, then teams without
      const sortedTeams = [...teamsWithScores, ...teamsWithoutScores];
      
      // Assign positions and award Round 1 placement points (10, 9, 8, 7, 6, 5, 4, 3)
      sortedTeams.forEach((team, index) => {
        team.position = index + 1;
        // Award placement points for Round 1 based on net stroke ranking
        if (team.holesCompleted >= 18) {
          const placementPoints = Math.max(11 - (index + 1), 1); // 10pts for 1st, 9pts for 2nd, etc.
          team.roundPoints = placementPoints;
          team.totalPoints = placementPoints + team.matchPlayPoints;
        }
      });
      
      return sortedTeams;
    } else {
      // Round 3: Sort teams by total points (round + match play) - highest points = best placement
      // Apply live scoring logic: teams with scores first, then teams without scores
      const teamsWithScores = teamPlacementData.filter(team => team.holesCompleted > 0);
      const teamsWithoutScores = teamPlacementData.filter(team => team.holesCompleted === 0);
      
      // Sort teams with scores by total points (higher = better)
      teamsWithScores.sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Sort teams without scores by total tournament points (from previous rounds + match play)
      teamsWithoutScores.sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Combine: teams with current round scores first, then teams without
      const sortedTeams = [...teamsWithScores, ...teamsWithoutScores];
      
      // Assign positions
      sortedTeams.forEach((team, index) => {
        team.position = index + 1;
      });
      
      return sortedTeams;
    }
  }

  async getScrambleLeaderboard(round: number): Promise<any[]> {
    console.log(`🔍 getScrambleLeaderboard called with round: ${round}`);
    
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
    
    console.log(`📊 Found ${scores.length} hole scores for round ${round}`);

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

    // Calculate scramble team handicaps: 35% of lower + 15% of higher for 2-person, special calculation for 3-person
    const calculateScrambleTeamHandicap = (team: Team): number => {
      if (team.isThreePersonTeam && team.player3Handicap) {
        // For 3-person teams: use 20% + 15% + 10% of the three handicaps (lowest, middle, highest)
        const handicaps = [team.player1Handicap || 0, team.player2Handicap || 0, team.player3Handicap || 0];
        handicaps.sort((a, b) => a - b); // Sort from lowest to highest
        const [lowest, middle, highest] = handicaps;
        return Math.round((lowest * 0.20) + (middle * 0.15) + (highest * 0.10));
      } else {
        // Standard 2-person calculation
        const player1Hcp = team.player1Handicap || 0;
        const player2Hcp = team.player2Handicap || 0;
        
        const lowerHcp = Math.min(player1Hcp, player2Hcp);
        const higherHcp = Math.max(player1Hcp, player2Hcp);
        
        return Math.round((lowerHcp * 0.35) + (higherHcp * 0.15));
      }
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
      .map((entry, index) => {
        // Fix total net strokes calculation: Total Gross - Team Handicap
        const correctedTotalNetStrokes = entry.totalGrossStrokes - entry.teamHandicap;
        const correctedNetToPar = correctedTotalNetStrokes - 72; // Par 72
        
        console.log(`🏌️ Round 2 Scramble - Team ${entry.team.teamNumber}: ${correctedTotalNetStrokes} net strokes (${entry.totalGrossStrokes} gross - ${entry.teamHandicap} handicap, ${entry.holes}/18 holes)`);
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
          position: index + 1,
          isTeamLeaderboard: true,
          isScramble: true,
        };
      });

    return leaderboard;
  }

  async getMatchPlayLeaderboard(): Promise<any[]> {
    console.log('🏆 Getting match play leaderboard with new per-hole calculation');
    
    // Get all users and find their teams by name matching
    const allUsers = await db.select().from(users);
    const allTeams = await db.select().from(teams);
    
    const userTeamPairs = [];
    for (const user of allUsers) {
      const userName = `${user.firstName} ${user.lastName}`;
      const userTeam = allTeams.find(team => 
        team.player1Name === userName || team.player2Name === userName
      );
      if (userTeam) {
        userTeamPairs.push({ user, team: userTeam });
      }
    }
    
    // Calculate points for each player using new per-hole system
    const playerStats = [];
    
    for (const userTeam of userTeamPairs) {
      const matchPoints = await this.calculatePlayerMatchPlayPoints(userTeam.user.id);
      
      // Count matches played and segments won
      const matches = await db.select()
        .from(matchPlayMatches)
        .where(
          or(
            eq(matchPlayMatches.player1Id, userTeam.user.id),
            eq(matchPlayMatches.player2Id, userTeam.user.id)
          )
        );

      let segmentsWon = 0;
      let segmentsPlayed = matches.length;

      // For each match, determine if player won the segment (simplified for now)
      for (const match of matches) {
        // Get player's Round 3 scores for this segment
        const playerHoleScores = await db.select()
          .from(holeScores)
          .where(
            and(
              eq(holeScores.userId, userTeam.user.id),
              eq(holeScores.round, 3)
            )
          );

        const opponentId = match.player1Id === userTeam.user.id ? match.player2Id : match.player1Id;
        const opponentHoleScores = await db.select()
          .from(holeScores)
          .where(
            and(
              eq(holeScores.userId, opponentId),
              eq(holeScores.round, 3)
            )
          );

        // Determine hole ranges for this segment
        const holeRanges = {
          '1-6': [1, 2, 3, 4, 5, 6],
          '7-12': [7, 8, 9, 10, 11, 12],
          '13-18': [13, 14, 15, 16, 17, 18]
        };

        const segmentHoles = holeRanges[match.holeSegment as keyof typeof holeRanges] || [];
        let playerHolesWon = 0;
        let opponentHolesWon = 0;

        for (const hole of segmentHoles) {
          const playerScore = playerHoleScores.find(s => s.hole === hole);
          const opponentScore = opponentHoleScores.find(s => s.hole === hole);

          if (playerScore && opponentScore) {
            if (playerScore.netScore < opponentScore.netScore) {
              playerHolesWon++;
            } else if (opponentScore.netScore < playerScore.netScore) {
              opponentHolesWon++;
            }
          }
        }

        // Player wins segment if they won more holes
        if (playerHolesWon > opponentHolesWon) {
          segmentsWon++;
        }
      }

      playerStats.push({
        ...userTeam.user,
        user: userTeam.user,
        team: userTeam.team,
        totalPoints: matchPoints,
        matchPoints: matchPoints,
        segmentsPlayed: segmentsPlayed,
        segmentsWon: segmentsWon,
        position: 0, // Will be set after sorting
        isTeamLeaderboard: false,
        isMatchPlay: true,
      });
    }

    // Sort by match points and assign positions
    const leaderboard = playerStats
      .sort((a, b) => b.matchPoints - a.matchPoints)
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));

    console.log(`📊 Match play leaderboard calculated for ${leaderboard.length} players`);
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

    teamData.forEach(team => {
      // Calculate total handicap - add third player if exists
      const totalHandicap = team.player1Handicap + team.player2Handicap + (team.player3Handicap || 0);
      
      const newTeam: Team = {
        id: this.currentTeamId++,
        ...team,
        player3Name: team.player3Name || null,
        player3Handicap: team.player3Handicap || null,
        isThreePersonTeam: team.isThreePersonTeam || false,
        totalHandicap,
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
    const teamsFromDb = await db.select().from(teams).orderBy(asc(teams.teamNumber));
    return teamsFromDb;
  }

  async getTeam(teamId: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    return team;
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
      
      // Calculate match play points for this team (for display purposes)
      const matchPlayPoints = await this.calculateTeamMatchPlayPoints(team.id);
      
      // Total points: round1 + round2 + round3 (round3 already includes match play points)
      const totalPoints = round1Points + round2Points + round3Points;
      
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
      let teamScore: number;
      const holesCompleted = await this.getTeamHolesCompleted(team.id, round);
      
      if (round === 1) {
        // Round 1: Better ball format - use net strokes (lower is better)
        teamScore = await this.calculateTeamNetStrokes(team.id, round);
      } else if (round === 2) {
        // Round 2: Net stroke play - use net strokes (lower is better)
        teamScore = await this.calculateTeamNetStrokes(team.id, round);
      } else {
        teamScore = 0;
      }
      
      return {
        teamId: team.id,
        teamScore: teamScore,
        holesCompleted: holesCompleted,
        isStrokePlay: round === 1 || round === 2  // Flag to indicate stroke play vs points
      };
    }));

    // Award live placement points based on current standings regardless of completion status
    // Filter teams that have started this round
    const teamsInPlay = teamPerformances.filter(team => team.holesCompleted > 0);
    
    if (teamsInPlay.length === 0) {
      return 0; // No one has started yet
    }
    
    // Sort by current performance
    if (round === 1) {
      // Round 1: Better ball net strokes (lower is better)
      teamsInPlay.sort((a, b) => a.teamScore - b.teamScore);
    } else if (round === 2) {
      // Round 2: Scramble net strokes (lower is better)
      teamsInPlay.sort((a, b) => a.teamScore - b.teamScore);
    }
    
    const teamPosition = teamsInPlay.findIndex(team => team.teamId === teamId) + 1;
    
    if (teamPosition === 0) {
      // This team hasn't started yet
      return 0;
    }
    
    // Award live placement points based on current standing: 1st = 10, 2nd = 9, etc.
    const pointsMap = [10, 9, 8, 7, 6, 5, 4, 3];
    return teamPosition <= pointsMap.length ? pointsMap[teamPosition - 1] : 1;
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
      // Round 2: Scramble format - but we now use net stroke play for placement
      // This method still calculates Stableford points for display purposes if needed
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

  private async calculateTeamNetStrokes(teamId: number, round: number): Promise<number> {
    // Calculate total net strokes for the team based on format
    const teamHoleScores = await db.select()
      .from(holeScores)
      .where(
        and(
          eq(holeScores.teamId, teamId),
          eq(holeScores.round, round)
        )
      );

    if (teamHoleScores.length === 0) {
      // No scores yet, return 0 for display purposes
      return 0;
    }

    if (round === 1) {
      // Round 1: Better ball format - calculate proper net scores using handicap strokes per hole
      const team = await this.getTeam(teamId);
      if (!team) return 0;

      // Get team members by matching first names
      const player1FirstName = team.player1Name?.split(' ')[0] || '';
      const player2FirstName = team.player2Name?.split(' ')[0] || '';
      
      console.log(`🔧 DEBUG: Calculating better ball for Team ${team.teamNumber} (${team.player1Name} & ${team.player2Name})`);
      console.log(`🔧 DEBUG: Looking for players: ${player1FirstName} and ${player2FirstName}`);
      
      // Get team members more precisely by full name matching
      // Handle 3-person teams differently
      let teamMembers: any[] = [];
      if (team.isThreePersonTeam && team.player3Name) {
        const player3FirstName = team.player3Name.split(' ')[0];
        teamMembers = await db.select()
          .from(users)
          .where(
            or(
              and(
                eq(users.firstName, player1FirstName),
                eq(users.lastName, team.player1Name?.split(' ')[1] || '')
              ),
              and(
                eq(users.firstName, player2FirstName),
                eq(users.lastName, team.player2Name?.split(' ')[1] || '')
              ),
              and(
                eq(users.firstName, player3FirstName),
                eq(users.lastName, team.player3Name?.split(' ')[1] || '')
              )
            )
          );
      } else {
        teamMembers = await db.select()
          .from(users)
          .where(
            or(
              and(
                eq(users.firstName, player1FirstName),
                eq(users.lastName, team.player1Name?.split(' ')[1] || '')
              ),
              and(
                eq(users.firstName, player2FirstName),
                eq(users.lastName, team.player2Name?.split(' ')[1] || '')
              )
            )
          );
      }

      console.log(`🔧 DEBUG: ${team.isThreePersonTeam ? '3-PERSON' : '2-PERSON'} TEAM - Found ${teamMembers.length} team members:`, teamMembers.map(p => `${p.firstName} ${p.lastName} (${p.handicap} hcp)`));

      if (teamMembers.length < 2) return 0;

      // Use Deerhurst course data for Round 1
      
      // Group hole scores by hole number
      const holeScoresByHole = new Map<number, any[]>();
      for (const holeScore of teamHoleScores) {
        if (holeScore.strokes > 0) { // Only include actual scores
          if (!holeScoresByHole.has(holeScore.hole)) {
            holeScoresByHole.set(holeScore.hole, []);
          }
          holeScoresByHole.get(holeScore.hole)!.push(holeScore);
        }
      }

      let totalNetStrokes = 0;
      let holesCompleted = 0;

      // Calculate better ball net score for each hole
      for (const [holeNumber, holeScores] of holeScoresByHole) {
        const holeInfo = deerhurstCourse.holes.find(h => h.number === holeNumber);
        if (!holeInfo) continue;

        const netScores: number[] = [];

        // Calculate net score for each player on this hole
        for (const holeScore of holeScores) {
          // Find the player
          const player = teamMembers.find(p => p.id === holeScore.userId);
          if (!player) continue;

          // Use the correct user handicap from users table (single source of truth)
          const playerHandicap = player.handicap || 0;
          
          console.log(`🔧 HANDICAP DEBUG: ${player.firstName} ${player.lastName} - Using user handicap: ${playerHandicap}`);
          const grossScore = holeScore.strokes;

          // Calculate strokes received on this hole based on handicap ranking
          const strokesReceived = Math.floor(playerHandicap / 18) + 
            (holeInfo.handicap <= (playerHandicap % 18) ? 1 : 0);

          const netScore = grossScore - strokesReceived;
          netScores.push(netScore);
          
          console.log(`🏌️ Player ${player.firstName} ${player.lastName} (${playerHandicap} hcp) - Hole ${holeNumber}: ${grossScore} gross - ${strokesReceived} strokes = ${netScore} net`);
        }

        // For 3-person teams: take best 3 net scores, for 2-person teams: take best 2 (but with only 2 players, it's just the better one)
        if (netScores.length > 0) {
          let bestNetScore: number;
          if (team.isThreePersonTeam && netScores.length >= 3) {
            // For 3-person teams: take best score from all 3 players (this is still best ball, just from 3 options instead of 2)
            bestNetScore = Math.min(...netScores);
          } else {
            // For 2-person teams: take the better (lower) net score
            bestNetScore = Math.min(...netScores);
          }
          totalNetStrokes += bestNetScore;
          holesCompleted++;
        }
      }
      
      console.log(`🏌️ Round 1 Better Ball - Team ${team.teamNumber}: ${totalNetStrokes} net strokes (${holesCompleted}/18 holes)`);
      return totalNetStrokes;
    } else if (round === 2) {
      // Round 2: Scramble format - take one score per hole
      // Calculate gross strokes first, then apply team handicap
      const uniqueHoles = new Map<number, number>();
      for (const holeScore of teamHoleScores) {
        // Only include holes with actual scores (not 0 which are placeholders)
        if (!uniqueHoles.has(holeScore.hole) && holeScore.strokes > 0) {
          uniqueHoles.set(holeScore.hole, holeScore.strokes);
        }
      }
      
      // If no actual scores recorded, return 0
      if (uniqueHoles.size === 0) {
        return 0;
      }
      
      // Sum up gross strokes
      const totalGrossStrokes = Array.from(uniqueHoles.values()).reduce((total, strokes) => total + strokes, 0);
      
      // Apply team scramble handicap to get net strokes
      const team = await this.getTeam(teamId);
      if (!team) return 0;
      
      // Calculate scramble team handicap using handicaps from users table (single source of truth)
      let teamHandicap: number;
      
      // Get team members' handicaps from users table
      const teamMemberHandicaps: number[] = [];
      
      // Get player 1 handicap
      const player1 = await this.getUserByFullName(team.player1Name);
      if (player1) teamMemberHandicaps.push(player1.handicap || 0);
      
      // Get player 2 handicap
      const player2 = await this.getUserByFullName(team.player2Name);
      if (player2) teamMemberHandicaps.push(player2.handicap || 0);
      
      // Get player 3 handicap if exists
      if (team.isThreePersonTeam && team.player3Name) {
        const player3 = await this.getUserByFullName(team.player3Name);
        if (player3) teamMemberHandicaps.push(player3.handicap || 0);
      }
      
      if (team.isThreePersonTeam && teamMemberHandicaps.length === 3) {
        // For 3-person teams: use 20% + 15% + 10% of the three handicaps (lowest, middle, highest)
        teamMemberHandicaps.sort((a, b) => a - b); // Sort from lowest to highest
        const [lowest, middle, highest] = teamMemberHandicaps;
        teamHandicap = Math.round((lowest * 0.20) + (middle * 0.15) + (highest * 0.10));
      } else if (teamMemberHandicaps.length >= 2) {
        // Standard 2-person calculation
        const lowerHcp = Math.min(teamMemberHandicaps[0], teamMemberHandicaps[1]);
        const higherHcp = Math.max(teamMemberHandicaps[0], teamMemberHandicaps[1]);
        teamHandicap = Math.round((lowerHcp * 0.35) + (higherHcp * 0.15));
      } else {
        teamHandicap = 0; // Fallback if no handicaps found
      }
      
      const totalNetStrokes = totalGrossStrokes - teamHandicap;
      
      const holesCompleted = uniqueHoles.size;
      
      // Add logging for Round 2 teams
      console.log(`🏌️ Round 2 Net Strokes - Team ${team?.teamNumber}: ${totalNetStrokes} net strokes (${totalGrossStrokes} gross - ${teamHandicap} handicap, ${holesCompleted}/18 holes)`);
      
      return totalNetStrokes;
    } else {
      return 0; // Default value for other rounds
    }
  }

  private async calculateTeamGrossStrokes(teamId: number, round: number): Promise<number> {
    // Calculate total gross strokes for the team based on format
    const teamHoleScores = await db.select()
      .from(holeScores)
      .where(
        and(
          eq(holeScores.teamId, teamId),
          eq(holeScores.round, round)
        )
      );

    if (teamHoleScores.length === 0) {
      return 0; // No scores yet
    }

    if (round === 1) {
      // Round 1: Better ball format - take best gross score per hole between team members
      const holeMap = new Map<number, number>();
      for (const holeScore of teamHoleScores) {
        const hole = holeScore.hole;
        const strokes = holeScore.strokes;
        if (!holeMap.has(hole) || strokes < holeMap.get(hole)!) {
          holeMap.set(hole, strokes);
        }
      }
      return Array.from(holeMap.values()).reduce((total, strokes) => total + strokes, 0);
    } else if (round === 2) {
      // Round 2: Scramble format - take one score per hole
      const uniqueHoles = new Map<number, number>();
      for (const holeScore of teamHoleScores) {
        // Only include holes with actual scores (not 0 which are placeholders)
        if (!uniqueHoles.has(holeScore.hole) && holeScore.strokes > 0) {
          uniqueHoles.set(holeScore.hole, holeScore.strokes);
        }
      }
      return Array.from(uniqueHoles.values()).reduce((total, strokes) => total + strokes, 0);
    } else {
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
    console.log(`🔍 Calculating match play points for player ${playerId}`);
    
    // Get all hole scores for this player in Round 3
    const playerHoleScores = await db.select()
      .from(holeScores)
      .where(
        and(
          eq(holeScores.userId, playerId),
          eq(holeScores.round, 3)
        )
      );

    if (playerHoleScores.length === 0) {
      console.log(`❌ No Round 3 scores found for player ${playerId}`);
      return 0;
    }

    // Get all matches for this player to find opponents
    const matches = await db.select()
      .from(matchPlayMatches)
      .where(
        or(
          eq(matchPlayMatches.player1Id, playerId),
          eq(matchPlayMatches.player2Id, playerId)
        )
      );

    let totalPoints = 0;
    console.log(`📊 Processing ${matches.length} matches for player ${playerId}`);

    for (const match of matches) {
      console.log(`🎯 Processing match: ${match.holeSegment}`);
      
      // Determine opponent
      const opponentId = match.player1Id === playerId ? match.player2Id : match.player1Id;
      const playerIsPlayer1 = match.player1Id === playerId;
      
      // Get opponent's hole scores for this segment
      const opponentHoleScores = await db.select()
        .from(holeScores)
        .where(
          and(
            eq(holeScores.userId, opponentId),
            eq(holeScores.round, 3)
          )
        );

      // Define hole ranges for each segment
      const holeRanges = {
        '1-6': [1, 2, 3, 4, 5, 6],
        '7-12': [7, 8, 9, 10, 11, 12],
        '13-18': [13, 14, 15, 16, 17, 18]
      };

      const segmentHoles = holeRanges[match.holeSegment as keyof typeof holeRanges] || [];
      let playerHolesWon = 0;
      let opponentHolesWon = 0;
      let holesPlayed = 0;
      let segmentPoints = 0;

      // Track carryover points (when holes are tied)
      let carryoverPoints = 1; // Each hole starts worth 1 point
      let playerSegmentPoints = 0;
      let opponentSegmentPoints = 0;

      console.log(`   🎯 Match ${match.holeSegment}: Starting 6-hole segment`);

      for (const hole of segmentHoles) {
        const playerScore = playerHoleScores.find(s => s.hole === hole);
        const opponentScore = opponentHoleScores.find(s => s.hole === hole);

        if (playerScore && opponentScore) {
          holesPlayed++;
          
          // Calculate net scores with handicap strokes
          const playerNetScore = playerScore.netScore;
          const opponentNetScore = opponentScore.netScore;

          console.log(`   Hole ${hole}: Player ${playerNetScore} vs Opponent ${opponentNetScore} (${carryoverPoints} pts available)`);

          // Award carryover points
          if (playerNetScore < opponentNetScore) {
            playerSegmentPoints += carryoverPoints;
            console.log(`   → Player wins hole ${hole} (+${carryoverPoints} points, Player total: ${playerSegmentPoints})`);
            carryoverPoints = 1; // Reset for next hole
          } else if (playerNetScore === opponentNetScore) {
            carryoverPoints += 1; // Carry points to next hole
            console.log(`   → Hole ${hole} tied, carrying ${carryoverPoints} points to next hole`);
          } else {
            opponentSegmentPoints += carryoverPoints;
            console.log(`   → Opponent wins hole ${hole} (+${carryoverPoints} points, Opponent total: ${opponentSegmentPoints})`);
            carryoverPoints = 1; // Reset for next hole
          }
        }
      }

      // Determine segment result: Win=2pts, Tie=1pt, Loss=0pts  
      if (playerSegmentPoints > opponentSegmentPoints) {
        segmentPoints = 2; // Win = 2 points
        console.log(`   🏆 Player wins segment ${match.holeSegment} (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 2 points`);
      } else if (playerSegmentPoints === opponentSegmentPoints) {
        segmentPoints = 1; // Tie = 1 point  
        console.log(`   🤝 Segment ${match.holeSegment} tied (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 1 point`);
      } else {
        segmentPoints = 0; // Loss = 0 points
        console.log(`   💔 Player loses segment ${match.holeSegment} (${playerSegmentPoints} vs ${opponentSegmentPoints}) = 0 points`);
      }

      totalPoints += segmentPoints;
      console.log(`   📈 Segment ${match.holeSegment} total: ${segmentPoints} points (Running total: ${totalPoints})`);
    }

    console.log(`🏁 Player ${playerId} total match play points: ${totalPoints}`);
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
    // First, auto-decline expired bets
    await this.autoDeclineExpiredBets();
    
    const bets = await db.select().from(sideBets).orderBy(asc(sideBets.round), asc(sideBets.createdAt));
    return bets;
  }

  async autoDeclineExpiredBets(): Promise<void> {
    const { getBetDeadline } = await import('../shared/tournamentConfig');
    const now = new Date();
    
    // Check pending bets for each round
    for (const round of [1, 2, 3]) {
      const deadline = getBetDeadline(round);
      
      if (now > deadline) {
        // Auto-decline all pending or partially accepted bets for this round
        const expiredBets = await db
          .select()
          .from(sideBets)
          .where(
            sql`${sideBets.round} = ${round} AND ${sideBets.status} IN ('Pending', 'Partially Accepted')`
          );

        for (const bet of expiredBets) {
          await db
            .update(sideBets)
            .set({ 
              status: 'Declined',
              result: 'Auto-declined - missed 1 hour deadline',
              updatedAt: new Date()
            })
            .where(eq(sideBets.id, bet.id));
          
          console.log(`🐱 AUTO-DECLINE: Bet ${bet.id} for Round ${round} auto-declined due to missed deadline`);
        }
      }
    }
  }

  async createSideBet(insertSideBet: InsertSideBet): Promise<SideBet> {
    // Check if bet deadline has passed
    const { getBetDeadline } = await import('../shared/tournamentConfig');
    const deadline = getBetDeadline(insertSideBet.round);
    const now = new Date();
    
    if (now > deadline) {
      throw new Error(`Cannot create bet for Round ${insertSideBet.round} - deadline has passed. Bets must be created 1 hour before round start.`);
    }
    
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

  async checkBetDeadline(round: number): Promise<{ passed: boolean; deadline: Date; timeLeft?: string }> {
    const { getBetDeadline } = await import('../shared/tournamentConfig');
    const deadline = getBetDeadline(round);
    const now = new Date();
    const passed = now > deadline;
    
    let timeLeft;
    if (!passed) {
      const msLeft = deadline.getTime() - now.getTime();
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      timeLeft = `${hoursLeft}h ${minutesLeft}m`;
    }
    
    return { passed, deadline, timeLeft };
  }

  async updateTeammateAcceptance(betId: number, userName: string): Promise<SideBet> {
    const [currentBet] = await db.select().from(sideBets).where(eq(sideBets.id, betId));
    if (!currentBet) {
      throw new Error('Side bet not found');
    }

    // Check if this is a team bet and if the user is authorized to accept
    if (!currentBet.isTeamBet) {
      throw new Error('This is not a team bet');
    }

    // Check if user is opponent or opponent teammate
    const isOpponentTeammate = userName === currentBet.opponentTeammate;
    const isMainOpponent = userName === currentBet.opponentName;

    if (!isOpponentTeammate && !isMainOpponent) {
      throw new Error('You are not authorized to accept this bet');
    }

    let newStatus = currentBet.status;

    // If main opponent accepts first
    if (isMainOpponent && currentBet.status === 'Pending') {
      newStatus = currentBet.teammateAccepted ? 'Accepted' : 'Partially Accepted';
    }

    // If teammate accepts
    if (isOpponentTeammate) {
      const teammateAccepted = true;
      newStatus = currentBet.status === 'Partially Accepted' ? 'Accepted' : 'Partially Accepted';
      
      const [updatedBet] = await db
        .update(sideBets)
        .set({ 
          teammateAccepted,
          status: newStatus,
          updatedAt: new Date() 
        })
        .where(eq(sideBets.id, betId))
        .returning();
      
      return updatedBet;
    }

    // Update status for main opponent acceptance
    const [updatedBet] = await db
      .update(sideBets)
      .set({ 
        status: newStatus,
        updatedAt: new Date() 
      })
      .where(eq(sideBets.id, betId))
      .returning();
    
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
    return await db.select().from(matchups).orderBy(matchups.round, matchups.groupNumber);
  }

  async getMatchupsByRound(round: number): Promise<Matchup[]> {
    return await db.select().from(matchups).where(eq(matchups.round, round));
  }

  async createMatchup(insertMatchup: InsertMatchup): Promise<Matchup> {
    const [newMatchup] = await db
      .insert(matchups)
      .values(insertMatchup)
      .returning();
    return newMatchup;
  }

  async updateMatchupScore(matchupId: number, player1Score: number, player2Score: number): Promise<Matchup> {
    const [updatedMatchup] = await db
      .update(matchups)
      .set({ 
        player1Score,
        player2Score
      })
      .where(eq(matchups.id, matchupId))
      .returning();
    
    if (!updatedMatchup) {
      throw new Error(`Matchup with id ${matchupId} not found`);
    }
    
    return updatedMatchup;
  }

  async clearAllMatchups(): Promise<void> {
    await db.delete(matchups);
  }

  async shuffleMatchupsForRound(round: number, shuffledMatchups: InsertMatchup[]): Promise<Matchup[]> {
    // Clear existing matchups for this round
    await db.delete(matchups).where(eq(matchups.round, round));
    
    // Insert new shuffled matchups
    if (shuffledMatchups.length > 0) {
      const newMatchups = await db
        .insert(matchups)
        .values(shuffledMatchups)
        .returning();
      return newMatchups;
    }
    
    return [];
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
      // Get all users to calculate match play points for each
      const allUsers = await db.select().from(users);
      const playerData: any[] = [];
      
      for (const user of allUsers) {
        // Calculate actual match play points from Round 3 hole scores
        const matchPlayPoints = await this.calculatePlayerMatchPlayPoints(user.id);
        
        // Get team information using findPlayerByName method
        const playerInfo = await this.findPlayerByName(user.firstName, user.lastName);
        let userTeam = null;
        if (playerInfo) {
          userTeam = await this.getTeam(playerInfo.teamId);
        }
        
        // For now, we'll use simplified match statistics since we don't track individual match wins/losses
        // The match play points come from the actual hole-by-hole scoring system
        const matchesPlayed = matchPlayPoints > 0 ? 3 : 0; // Players typically play 3 segments
        const estimatedWins = Math.floor(matchPlayPoints / 6); // Rough estimate based on segment bonus points
        const estimatedTies = Math.max(0, Math.floor((matchPlayPoints % 6) / 3));
        
        playerData.push({
          playerId: user.id,
          playerName: `${user.firstName} ${user.lastName}`,
          totalPoints: matchPlayPoints,
          matchesPlayed: matchesPlayed,
          matchesWon: estimatedWins,
          matchesTied: estimatedTies,
          matchesLost: Math.max(0, matchesPlayed - estimatedWins - estimatedTies),
          team: userTeam,
          user: user
        });
      }
      
      // Sort by total points descending
      return playerData.sort((a, b) => b.totalPoints - a.totalPoints);
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

  // Team Hole Scores (for scramble format)
  async getTeamHoleScores(teamId: number, round: number): Promise<HoleScore[]> {
    // For scramble, we store one score per hole per team
    // We'll use the first player from the team as the "owner" of the score
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) {
      return [];
    }

    // Get any team member who has scores for this round
    const teamMembers = await db.select()
      .from(users)
      .where(eq(users.teamId, teamId));

    if (!teamMembers.length) {
      return [];
    }

    // Try to get scores from any team member (they should all have the same scores for scramble)
    for (const member of teamMembers) {
      const scores = await db.select()
        .from(holeScores)
        .where(and(eq(holeScores.userId, member.id), eq(holeScores.round, round)))
        .orderBy(asc(holeScores.hole));
      
      if (scores.length > 0) {
        return scores;
      }
    }

    return [];
  }

  async updateTeamHoleScore(teamId: number, round: number, hole: number, strokes: number, userId: number): Promise<HoleScore> {
    // For scramble format, we need to update scores for ALL team members
    // This ensures both teammates see the same scorecard
    
    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!team.length) {
      throw new Error('Team not found');
    }

    // Get all team members
    const teamMembers = await db.select()
      .from(users)
      .where(eq(users.teamId, teamId));

    if (!teamMembers.length) {
      throw new Error('No team members found');
    }

    // Get course data for par and handicap info
    const { getCourseForRound } = await import('@shared/courseData');
    const course = getCourseForRound(round);
    const holeData = course.holes.find(h => h.number === hole);
    
    if (!holeData) {
      throw new Error(`Hole ${hole} not found for round ${round}`);
    }

    // Calculate team handicap for stroke allocation
    const lowerHcp = Math.min(team[0].player1Handicap || 0, team[0].player2Handicap || 0);
    const higherHcp = Math.max(team[0].player1Handicap || 0, team[0].player2Handicap || 0);
    const teamHandicap = Math.round((lowerHcp * 0.35) + (higherHcp * 0.15));

    // Determine if team gets a stroke on this hole
    const strokesReceived = teamHandicap >= holeData.handicap ? 1 : 0;
    const netScore = strokes - strokesReceived;

    // Calculate Stableford points based on net score
    const netToPar = netScore - holeData.par;
    let stablefordPoints = 0;
    if (netToPar <= -2) stablefordPoints = 4; // Eagle or better
    else if (netToPar === -1) stablefordPoints = 3; // Birdie
    else if (netToPar === 0) stablefordPoints = 2; // Par
    else if (netToPar === 1) stablefordPoints = 1; // Bogey
    // Double bogey or worse = 0 points

    let returnHoleScore: HoleScore;

    // Update or create hole score for each team member
    for (const member of teamMembers) {
      const existingScore = await db.select()
        .from(holeScores)
        .where(and(
          eq(holeScores.userId, member.id),
          eq(holeScores.round, round),
          eq(holeScores.hole, hole)
        ))
        .limit(1);

      if (existingScore.length > 0) {
        // Update existing score
        const [updatedScore] = await db.update(holeScores)
          .set({
            strokes,
            points: stablefordPoints,
            netScore,
            updatedAt: new Date()
          })
          .where(eq(holeScores.id, existingScore[0].id))
          .returning();
        returnHoleScore = updatedScore;
      } else {
        // Create new score
        const [newScore] = await db.insert(holeScores)
          .values({
            userId: member.id,
            teamId: teamId,
            round,
            hole,
            strokes,
            par: holeData.par,
            handicap: holeData.handicap,
            points: stablefordPoints,
            netScore,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        returnHoleScore = newScore;
      }
    }

    return returnHoleScore!;
  }


}

export const storage = new DatabaseStorage();
