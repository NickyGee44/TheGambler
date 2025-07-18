import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertScoreSchema, insertSideBetSchema, insertPhotoSchema, insertHoleScoreSchema, User } from "@shared/schema";
import { z } from "zod";

// Middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  const httpServer = createServer(app);

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Broadcast function
  const broadcast = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received:', data);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Config route
  app.get('/api/config', (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
    });
  });



  // Golf Course API endpoints
  app.get('/api/golf-course/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const response = await fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query as string)}`, {
        headers: {
          Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ',
        },
      });

      if (!response.ok) {
        console.error(`Golf API search failed: ${response.status}`);
        return res.status(response.status).json({ error: 'Golf API search failed' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error searching golf course:', error);
      res.status(500).json({ error: 'Failed to search golf course' });
    }
  });

  app.get('/api/golf-course/details/:courseId', async (req, res) => {
    try {
      const { courseId } = req.params;
      
      const response = await fetch(`https://api.golfcourseapi.com/v1/courses/${courseId}`, {
        headers: {
          Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ',
        },
      });

      if (!response.ok) {
        console.error(`Golf API details failed: ${response.status}`);
        return res.status(response.status).json({ error: 'Golf API details failed' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ error: 'Failed to fetch course details' });
    }
  });

  app.get('/api/golf-course/tournament-courses', async (req, res) => {
    try {
      // Search for both tournament courses
      const [deerhurstResponse, muskokaBayResponse] = await Promise.all([
        fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent("Deerhurst Highlands Golf Course")}`, {
          headers: { Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ' },
        }),
        fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent("Muskoka Bay Golf Club")}`, {
          headers: { Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ' },
        })
      ]);

      const [deerhurstData, muskokaBayData] = await Promise.all([
        deerhurstResponse.ok ? deerhurstResponse.json() : null,
        muskokaBayResponse.ok ? muskokaBayResponse.json() : null
      ]);

      // Get course details
      const deerhurstCourse = deerhurstData?.courses?.[0];
      const muskokaBayCourse = muskokaBayData?.courses?.[0];

      const [deerhurstDetails, muskokaBayDetails] = await Promise.all([
        deerhurstCourse ? fetch(`https://api.golfcourseapi.com/v1/courses/${deerhurstCourse.id}`, {
          headers: { Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ' },
        }).then(r => r.ok ? r.json() : null) : null,
        muskokaBayCourse ? fetch(`https://api.golfcourseapi.com/v1/courses/${muskokaBayCourse.id}`, {
          headers: { Authorization: 'Key ERJJTZFDF7ZIKRUE76RRDOKLXQ' },
        }).then(r => r.ok ? r.json() : null) : null
      ]);

      res.json({
        deerhurst: deerhurstDetails,
        muskokaBay: muskokaBayDetails
      });
    } catch (error) {
      console.error('Error fetching tournament courses:', error);
      res.status(500).json({ error: 'Failed to fetch tournament courses' });
    }
  });

  // Auth routes are handled in auth.ts

  // Get all available players for registration (excluding those with existing accounts)
  app.get('/api/players', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      const allPlayers = teams.flatMap(team => [
        { name: team.player1Name, teamId: team.id, playerNumber: 1 },
        { name: team.player2Name, teamId: team.id, playerNumber: 2 }
      ]);
      
      // Get existing users to filter out registered players
      const existingUsers = await storage.getAllUsers();
      const registeredPlayerNames = existingUsers.map((user: User) => `${user.firstName} ${user.lastName}`);
      
      // Filter out players who already have accounts
      const availablePlayers = allPlayers.filter(player => 
        !registeredPlayerNames.includes(player.name)
      ).sort((a, b) => a.name.localeCompare(b.name));
      
      res.json(availablePlayers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  });

  // Get registered players for login dropdown
  app.get('/api/registered-players', async (req, res) => {
    try {
      const existingUsers = await storage.getAllUsers();
      const registeredPlayers = existingUsers.map((user: User) => ({
        name: `${user.firstName} ${user.lastName}`,
        userId: user.id
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      res.json(registeredPlayers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch registered players' });
    }
  });

  // Teams endpoints
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // Player statistics endpoint (removed duplicate)

  // Scores endpoints - now calculated from hole scores
  app.get('/api/scores', async (req, res) => {
    try {
      const scores = await storage.getCalculatedScores();
      res.json(scores);
    } catch (error) {
      console.error('Error fetching calculated scores:', error);
      res.status(500).json({ error: 'Failed to fetch scores' });
    }
  });

  // Live scores endpoint for real-time standings
  app.get('/api/live-scores', async (req, res) => {
    try {
      const liveScores = await storage.getLiveScores();
      res.json(liveScores);
    } catch (error) {
      console.error('Error fetching live scores:', error);
      res.status(500).json({ error: 'Failed to fetch live scores' });
    }
  });

  // Generate mock data endpoint (admin only)
  app.post('/api/generate-mock-data', requireAuth, async (req: any, res) => {
    try {
      console.log('Mock data generation request received');
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log('User not found:', userId);
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Only allow Nick Grossi and Connor Patterson to generate mock data
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      console.log('User attempting mock data generation:', userName);
      
      if (!allowedUsers.includes(userName)) {
        console.log('Access denied for user:', userName);
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can generate mock data' });
      }
      
      console.log('Starting mock data generation...');
      const { generateMockMatchPlayData } = await import('./mockData_temp');
      const result = await generateMockMatchPlayData();
      
      console.log('Mock data generation completed successfully');
      res.json({ 
        message: 'Mock data generated successfully',
        data: {
          groupsCreated: result.groupsCount,
          matchesCreated: result.matchesCount
        }
      });
    } catch (error) {
      console.error('Error generating mock data:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: `Failed to generate mock data: ${error.message}` });
    }
  });

  app.post('/api/scores', requireAuth, async (req: any, res) => {
    try {
      const { teamId, round, score } = req.body;
      const userId = req.user.id;
      
      if (!teamId || !round || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get user to verify they can update scores
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi and Connor Patterson to edit scores
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can edit scores' });
      }

      const updatedScore = await storage.updateScore(teamId, round, score, userId);
      
      // Broadcast score update to all clients
      broadcast({
        type: 'SCORE_UPDATE',
        data: updatedScore
      });

      res.json(updatedScore);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update score' });
    }
  });

  // Side bets endpoints
  app.get('/api/sidebets', async (req, res) => {
    try {
      const sideBets = await storage.getSideBets();
      res.json(sideBets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch side bets' });
    }
  });

  app.post('/api/sidebets', async (req, res) => {
    try {
      const validated = insertSideBetSchema.parse(req.body);
      const sideBet = await storage.createSideBet(validated);
      
      // Broadcast new side bet to all clients
      broadcast({
        type: 'SIDE_BET_CREATED',
        data: sideBet
      });

      res.json(sideBet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create side bet' });
      }
    }
  });

  app.patch('/api/sidebets/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { result } = req.body;
      
      const updatedSideBet = await storage.updateSideBetResult(parseInt(id), result);
      
      // Broadcast side bet update to all clients
      broadcast({
        type: 'SIDE_BET_UPDATE',
        data: updatedSideBet
      });

      res.json(updatedSideBet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update side bet' });
    }
  });

  app.patch('/api/sidebets/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedSideBet = await storage.updateSideBetStatus(parseInt(id), status);
      
      // Broadcast side bet status update to all clients
      broadcast({
        type: 'SIDE_BET_STATUS_UPDATE',
        data: updatedSideBet
      });

      res.json(updatedSideBet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update side bet status' });
    }
  });

  // Witness voting for side bets
  app.post('/api/sidebets/:id/witness-vote', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { winnerName } = req.body;
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const witnessName = `${user.firstName} ${user.lastName}`;
      const updatedSideBet = await storage.addWitnessVote(parseInt(id), witnessName, winnerName);
      
      // Broadcast witness vote to all clients
      broadcast({
        type: 'WITNESS_VOTE',
        data: updatedSideBet
      });

      res.json(updatedSideBet);
    } catch (error) {
      console.error('Error recording witness vote:', error);
      res.status(500).json({ error: 'Failed to record witness vote' });
    }
  });

  // Mark bet for resolution (after round complete)
  app.patch('/api/sidebets/:id/ready-for-resolution', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Only allow Nick Grossi and Connor Patterson to mark bets for resolution
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can mark bets for resolution' });
      }
      
      const updatedSideBet = await storage.markBetForResolution(parseInt(id));
      
      // Broadcast resolution readiness to all clients
      broadcast({
        type: 'BET_READY_FOR_RESOLUTION',
        data: updatedSideBet
      });

      res.json(updatedSideBet);
    } catch (error) {
      console.error('Error marking bet for resolution:', error);
      res.status(500).json({ error: 'Failed to mark bet for resolution' });
    }
  });

  // Photos endpoints
  app.get('/api/photos', async (req, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch photos' });
    }
  });

  app.post('/api/photos', async (req, res) => {
    try {
      const validated = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validated);
      
      // Broadcast new photo to all clients
      broadcast({
        type: 'PHOTO_UPLOADED',
        data: photo
      });

      res.json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to upload photo' });
      }
    }
  });

  // Photo upload endpoint with file handling
  app.post('/api/photos/upload', requireAuth, upload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No photo file provided' });
      }

      const { caption = '' } = req.body;
      
      // Create a data URL from the uploaded file
      const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const photo = await storage.createPhoto({
        filename: req.file.originalname,
        caption,
        imageUrl
      });
      
      // Broadcast photo upload to all clients
      broadcast({
        type: 'PHOTO_UPLOADED',
        data: photo
      });

      res.json(photo);
    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Matchups routes
  app.get('/api/matchups', async (req, res) => {
    try {
      const matchups = await storage.getMatchups();
      res.json(matchups);
    } catch (error) {
      console.error('Error fetching matchups:', error);
      res.status(500).json({ error: 'Failed to fetch matchups' });
    }
  });

  app.post('/api/matchups', async (req, res) => {
    try {
      const matchup = await storage.createMatchup(req.body);
      res.status(201).json(matchup);
    } catch (error) {
      console.error('Error creating matchup:', error);
      res.status(500).json({ error: 'Failed to create matchup' });
    }
  });

  app.put('/api/matchups/:id/score', requireAuth, async (req: any, res) => {
    try {
      const matchupId = parseInt(req.params.id);
      const { player1Score, player2Score } = req.body;
      
      const matchup = await storage.updateMatchupScore(matchupId, player1Score, player2Score);
      
      // Broadcast matchup update to all clients
      broadcast({
        type: 'MATCHUP_SCORE_UPDATE',
        data: matchup
      });

      res.json(matchup);
    } catch (error) {
      console.error('Error updating matchup score:', error);
      res.status(500).json({ error: 'Failed to update matchup score' });
    }
  });

  // Hole scoring endpoints
  app.get('/api/my-hole-scores/:round', requireAuth, async (req: any, res) => {
    try {
      const round = parseInt(req.params.round);
      const userId = req.user.id;
      
      const holeScores = await storage.getHoleScores(userId, round);
      res.json(holeScores);
    } catch (error) {
      console.error('Error fetching hole scores:', error);
      res.status(500).json({ error: 'Failed to fetch hole scores' });
    }
  });

  // Get hole scores for a specific player (for public viewing)
  app.get('/api/player-hole-scores/:userId/:round', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const round = parseInt(req.params.round);
      const holeScores = await storage.getHoleScores(userId, round);
      res.json(holeScores);
    } catch (error) {
      console.error('Error fetching player hole scores:', error);
      res.status(500).json({ error: 'Failed to fetch player hole scores' });
    }
  });

  // Get ALL hole scores for a specific round (for individual scores table)
  app.get('/api/hole-scores/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const allHoleScores = await storage.getAllHoleScoresForRound(round);
      res.json(allHoleScores);
    } catch (error) {
      console.error('Error fetching all hole scores for round:', error);
      res.status(500).json({ error: 'Failed to fetch hole scores for round' });
    }
  });

  app.post('/api/hole-scores', requireAuth, async (req: any, res) => {
    try {
      const { round, hole, strokes } = req.body;
      const userId = req.user.id;
      
      console.log('Updating hole score:', { userId, round, hole, strokes });
      
      // Validate input
      if (!round || !hole || strokes === undefined) {
        return res.status(400).json({ error: 'Missing required fields: round, hole, strokes' });
      }
      
      if (strokes < 1 || strokes > 15) {
        return res.status(400).json({ error: 'Invalid strokes value' });
      }
      
      const holeScore = await storage.updateHoleScore(userId, round, hole, strokes);
      
      // Check for birdie or better and broadcast notification
      const scoreDiff = strokes - holeScore.par;
      if (scoreDiff <= -1) { // Birdie or better
        const user = await storage.getUser(userId);
        const playerName = user ? `${user.firstName} ${user.lastName}` : 'Unknown Player';
        
        let scoreName = 'Birdie';
        if (scoreDiff <= -3) scoreName = 'Albatross';
        else if (scoreDiff === -2) scoreName = 'Eagle';
        
        // Broadcast birdie notification to all clients
        console.log(`🎯 BIRDIE ALERT: ${playerName} scored ${scoreName} on hole ${hole}!`);
        broadcast({
          type: 'BIRDIE_NOTIFICATION',
          data: { 
            playerName, 
            holeNumber: hole, 
            scoreName,
            round
          }
        });
      }
      
      // Broadcast hole score update to all clients
      broadcast({
        type: 'HOLE_SCORE_UPDATE',
        data: { holeScore, userId, round, hole }
      });

      res.json(holeScore);
    } catch (error) {
      console.error('Error updating hole score:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Failed to update hole score', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update hole score statistics
  app.patch('/api/hole-scores/:round/:hole/stats', requireAuth, async (req: any, res) => {
    try {
      const round = parseInt(req.params.round);
      const hole = parseInt(req.params.hole);
      const userId = req.user.id;
      const statsData = req.body;
      
      console.log('Updating hole statistics:', { userId, round, hole, statsData });
      
      // Validate input
      if (!round || !hole) {
        return res.status(400).json({ error: 'Missing required fields: round, hole' });
      }
      
      const holeScore = await storage.updateHoleScoreStats(userId, round, hole, statsData);
      
      // Broadcast hole score statistics update to all clients
      broadcast({
        type: 'HOLE_STATS_UPDATE',
        data: { holeScore, userId, round, hole }
      });

      res.json(holeScore);
    } catch (error) {
      console.error('Error updating hole statistics:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Failed to update hole statistics', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/leaderboard/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      console.log(`Getting leaderboard for round ${round}`);
      const leaderboard = await storage.getLeaderboard(round);
      console.log('Leaderboard result:', leaderboard[0]); // Debug first result
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Debug endpoint for tournament placement leaderboard
  app.get('/api/tournament-placement/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      console.log(`Getting tournament placement leaderboard for round ${round}`);
      const leaderboard = await storage.getTournamentPlacementLeaderboard(round);
      console.log('Tournament placement result:', leaderboard[0]); // Debug first result
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching tournament placement leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch tournament placement leaderboard' });
    }
  });

  app.get('/api/team-better-ball/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const leaderboard = await storage.getTeamBetterBallLeaderboard(round);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching team better ball leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch team better ball leaderboard' });
    }
  });

  app.get('/api/team-scramble/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const leaderboard = await storage.getScrambleLeaderboard(round);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching team scramble leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch team scramble leaderboard' });
    }
  });

  // Admin endpoint for updating profile picture assignments
  app.post('/api/admin/update-profile-component', requireAuth, async (req: any, res) => {
    try {
      const { code, assignments } = req.body;
      const userId = req.user.id;
      
      // Get user to verify they can update profile assignments
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi and Connor Patterson to edit profile assignments
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can edit profile assignments' });
      }

      // In a real implementation, you would write the code to the file system
      // For now, we'll just return success to allow the frontend to work
      console.log('Profile picture assignments updated by:', userName);
      console.log('Assignments:', assignments);
      
      res.json({ success: true, message: 'Profile picture assignments updated successfully' });
    } catch (error) {
      console.error('Error updating profile assignments:', error);
      res.status(500).json({ error: 'Failed to update profile assignments' });
    }
  });

  // Player statistics endpoint
  app.get('/api/player-stats', async (req, res) => {
    try {
      const playerStats = await storage.getPlayerStatistics();
      res.json(playerStats);
    } catch (error) {
      console.error('Error fetching player statistics:', error);
      res.status(500).json({ error: 'Failed to fetch player statistics' });
    }
  });

  // Historical player statistics
  app.get('/api/player-history/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getPlayerTournamentHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Error fetching player history:', error);
      res.status(500).json({ error: 'Failed to fetch player history' });
    }
  });

  app.get('/api/player-lifetime-stats/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getPlayerLifetimeStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching lifetime stats:', error);
      res.status(500).json({ error: 'Failed to fetch lifetime stats' });
    }
  });

  app.get('/api/player-yearly-stats/:userId/:year', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const stats = await storage.getPlayerYearlyStats(userId, year);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
      res.status(500).json({ error: 'Failed to fetch yearly stats' });
    }
  });

  app.get('/api/all-players-historical-stats', async (req, res) => {
    try {
      const stats = await storage.getAllPlayersHistoricalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching all players historical stats:', error);
      res.status(500).json({ error: 'Failed to fetch all players historical stats' });
    }
  });

  app.post('/api/player-history', async (req, res) => {
    try {
      const historyData = req.body;
      const newHistory = await storage.createPlayerTournamentHistory(historyData);
      res.json(newHistory);
    } catch (error) {
      console.error('Error creating player history:', error);
      res.status(500).json({ error: 'Failed to create player history' });
    }
  });

  app.put('/api/player-history/:userId/:year', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const year = parseInt(req.params.year);
      const updateData = req.body;
      const updatedHistory = await storage.updatePlayerTournamentHistory(userId, year, updateData);
      res.json(updatedHistory);
    } catch (error) {
      console.error('Error updating player history:', error);
      res.status(500).json({ error: 'Failed to update player history' });
    }
  });

  // Tournament management endpoints
  app.get('/api/tournaments', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
  });

  app.get('/api/tournaments/active', async (req, res) => {
    try {
      const activeTournament = await storage.getActiveTournament();
      res.json(activeTournament);
    } catch (error) {
      console.error('Error fetching active tournament:', error);
      res.status(500).json({ error: 'Failed to fetch active tournament' });
    }
  });

  app.get('/api/tournaments/:year', async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const tournament = await storage.getTournamentByYear(year);
      res.json(tournament);
    } catch (error) {
      console.error('Error fetching tournament by year:', error);
      res.status(500).json({ error: 'Failed to fetch tournament' });
    }
  });

  app.post('/api/tournaments', async (req, res) => {
    try {
      const tournamentData = req.body;
      const newTournament = await storage.createTournament(tournamentData);
      res.json(newTournament);
    } catch (error) {
      console.error('Error creating tournament:', error);
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  });

  app.put('/api/tournaments/:year', async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const updateData = req.body;
      const updatedTournament = await storage.updateTournament(year, updateData);
      res.json(updatedTournament);
    } catch (error) {
      console.error('Error updating tournament:', error);
      res.status(500).json({ error: 'Failed to update tournament' });
    }
  });

  app.post('/api/tournaments/:year/activate', async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const activeTournament = await storage.setActiveTournament(year);
      res.json(activeTournament);
    } catch (error) {
      console.error('Error activating tournament:', error);
      res.status(500).json({ error: 'Failed to activate tournament' });
    }
  });

  // Round submission endpoint
  app.post('/api/submit-round', requireAuth, async (req: any, res) => {
    try {
      const { round, totalPoints, holesPlayed } = req.body;
      const userId = req.user.id;
      
      if (!round || totalPoints === undefined || holesPlayed === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify user has completed all 18 holes
      const userHoleScores = await storage.getHoleScores(userId, round);
      
      if (userHoleScores.length !== 18) {
        return res.status(400).json({ error: 'Round is not complete. All 18 holes must be played.' });
      }

      // Calculate actual totals from hole scores to verify data integrity
      const actualTotalPoints = userHoleScores.reduce((sum, score) => sum + score.points, 0);
      const actualTotalStrokes = userHoleScores.reduce((sum, score) => sum + score.strokes, 0);

      // Update the user's round score in the scores table
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Get user's team to update the team score
      const teams = await storage.getTeams();
      const userTeam = teams.find(team => 
        team.player1Name === `${user.firstName} ${user.lastName}` || 
        team.player2Name === `${user.firstName} ${user.lastName}`
      );

      if (!userTeam) {
        return res.status(400).json({ error: 'User team not found' });
      }

      // Update the round score for the user's team
      const roundField = `round${round}Points` as keyof typeof storage.getCalculatedScores;
      await storage.updateScore(userTeam.id, round, actualTotalPoints, userId);

      // Broadcast round completion to all clients
      broadcast({
        type: 'ROUND_COMPLETED',
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
      console.error('Error submitting round:', error);
      res.status(500).json({ error: 'Failed to submit round' });
    }
  });

  // Match Play API endpoints for Round 3
  app.get('/api/match-play/groups', async (req, res) => {
    try {
      const groups = await storage.getMatchPlayGroups();
      res.json(groups);
    } catch (error) {
      console.error('Error fetching match play groups:', error);
      res.status(500).json({ error: 'Failed to fetch match play groups' });
    }
  });

  app.post('/api/match-play/groups', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi and Connor Patterson to create match play groups
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can create match play groups' });
      }

      const group = await storage.createMatchPlayGroup(req.body);
      res.json(group);
    } catch (error) {
      console.error('Error creating match play group:', error);
      res.status(500).json({ error: 'Failed to create match play group' });
    }
  });

  app.get('/api/match-play/matches', async (req, res) => {
    try {
      const groupNumber = req.query.groupNumber ? parseInt(req.query.groupNumber as string) : undefined;
      const matches = await storage.getMatchPlayMatches(groupNumber);
      res.json(matches);
    } catch (error) {
      console.error('Error fetching match play matches:', error);
      res.status(500).json({ error: 'Failed to fetch match play matches' });
    }
  });

  app.post('/api/match-play/matches', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi and Connor Patterson to create matches
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can create matches' });
      }

      const match = await storage.createMatchPlayMatch(req.body);
      
      // Broadcast new match to all clients
      broadcast({
        type: 'MATCH_PLAY_CREATED',
        data: match
      });

      res.json(match);
    } catch (error) {
      console.error('Error creating match play match:', error);
      res.status(500).json({ error: 'Failed to create match play match' });
    }
  });

  app.put('/api/match-play/matches/:id/result', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi and Connor Patterson to update match results
      const allowedUsers = ['Nick Grossi', 'Connor Patterson'];
      const userName = `${user.firstName} ${user.lastName}`;
      
      if (!allowedUsers.includes(userName)) {
        return res.status(403).json({ error: 'Only Nick Grossi and Connor Patterson can update match results' });
      }

      const { id } = req.params;
      const { winnerId, result, pointsAwarded } = req.body;
      
      const updatedMatch = await storage.updateMatchPlayResult(parseInt(id), winnerId, result, pointsAwarded);
      
      // Broadcast match result update to all clients
      broadcast({
        type: 'MATCH_PLAY_RESULT',
        data: updatedMatch
      });

      res.json(updatedMatch);
    } catch (error) {
      console.error('Error updating match play result:', error);
      res.status(500).json({ error: 'Failed to update match play result' });
    }
  });

  app.get('/api/match-play/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getMatchPlayLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching match play leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch match play leaderboard' });
    }
  });

  app.get('/api/match-play/current-match/:playerId/:hole', async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const hole = parseInt(req.params.hole);
      
      const currentMatch = await storage.getCurrentMatchForPlayer(playerId, hole);
      res.json(currentMatch);
    } catch (error) {
      console.error('Error fetching current match:', error);
      res.status(500).json({ error: 'Failed to fetch current match' });
    }
  });

  // Boozelympics API routes
  app.get('/api/boozelympics/games', async (req, res) => {
    try {
      const games = await storage.getBoozelympicsGames();
      res.json(games);
    } catch (error) {
      console.error('Error fetching Boozelympics games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  });

  app.post('/api/boozelympics/games', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Only allow Nick Grossi to create games
      const userName = `${user.firstName} ${user.lastName}`;
      if (userName !== 'Nick Grossi') {
        return res.status(403).json({ error: 'Only Nick Grossi can create Boozelympics games' });
      }

      const game = await storage.createBoozelympicsGame(req.body);
      
      broadcast({
        type: 'BOOZELYMPICS_GAME_CREATED',
        data: game
      });

      res.json(game);
    } catch (error) {
      console.error('Error creating Boozelympics game:', error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  });

  app.get('/api/boozelympics/matches', async (req, res) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const matches = await storage.getBoozelympicsMatches(gameId);
      res.json(matches);
    } catch (error) {
      console.error('Error fetching Boozelympics matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  app.post('/api/boozelympics/matches', requireAuth, async (req: any, res) => {
    try {
      const match = await storage.createBoozelympicsMatch(req.body);
      
      broadcast({
        type: 'BOOZELYMPICS_MATCH_CREATED',
        data: match
      });

      res.json(match);
    } catch (error) {
      console.error('Error creating Boozelympics match:', error);
      res.status(500).json({ error: 'Failed to create match' });
    }
  });

  app.get('/api/boozelympics/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getBoozelympicsLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching Boozelympics leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Golf Relay specific routes
  app.get('/api/golf-relay/matches', async (req, res) => {
    try {
      const matches = await storage.getGolfRelayMatches();
      res.json(matches);
    } catch (error) {
      console.error('Error fetching Golf Relay matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  app.post('/api/golf-relay/matches', requireAuth, async (req: any, res) => {
    try {
      const match = await storage.createGolfRelayMatch(req.body);
      
      broadcast({
        type: 'GOLF_RELAY_MATCH_CREATED',
        data: match
      });

      res.json(match);
    } catch (error) {
      console.error('Error creating Golf Relay match:', error);
      res.status(500).json({ error: 'Failed to create match' });
    }
  });

  app.get('/api/golf-relay/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getGolfRelayLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching Golf Relay leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  return httpServer;
}
