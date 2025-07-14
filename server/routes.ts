import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertScoreSchema, insertSideBetSchema, insertPhotoSchema } from "@shared/schema";
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

  // Auth routes are handled in auth.ts

  // Teams endpoints
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // Scores endpoints
  app.get('/api/scores', async (req, res) => {
    try {
      const scores = await storage.getScores();
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch scores' });
    }
  });

  app.post('/api/scores', requireAuth, async (req: any, res) => {
    try {
      const { teamId, round, score } = req.body;
      const userId = req.user.id;
      
      if (!teamId || !round || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get user to verify they can update this team's score
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Check if user is authorized to update this team's score
      const playerMatch = await storage.findPlayerByName(user.firstName, user.lastName);
      if (!playerMatch || playerMatch.teamId !== teamId) {
        return res.status(403).json({ error: 'You can only update scores for your own team' });
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

  return httpServer;
}
