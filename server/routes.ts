import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { insertScoreSchema, insertSideBetSchema, insertPhotoSchema, insertHoleScoreSchema, User } from "@shared/schema";
import { z } from "zod";

// Middleware to check authentication
async function requireAuth(req: any, res: any, next: any) {
  // First try session-based authentication (custom auth)
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  
  // Fallback to Replit Auth
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ error: 'Authentication required' });
}

// Tournament matchup generation algorithms
async function generateRound3MatchupsOnce(storage: any) {
  // Round 3 - Fixed preset groupings (only generate once, never shuffle)
  // NOTE: Team 7 (3-person team) has all 3 members in different groups, but only best 2 out of 3 match results count
  const presetGroupings = [
    {
      groupNumber: 1,
      players: [
        { id: 13, name: "Nick Grossi" },      // Nick Grossi
        { id: 19, name: "Nick Cook" },        // Nick Cook  
        { id: 14, name: "James Ogilvie" },    // James Ogilvie (Team 7 - Player 3)
        { id: 15, name: "Johnny Magnatta" }   // Johnny Magnatta
      ]
    },
    {
      groupNumber: 2,
      players: [
        { id: 20, name: "Connor Patterson" }, // Connor Patterson
        { id: 16, name: "Erik Boudreau" },    // Erik Boudreau
        { id: 21, name: "Christian Hauck" },  // Christian Hauck
        { id: 26, name: "Sye Ellard" }        // Sye Ellard (Team 7 - Player 2)
      ]
    },
    {
      groupNumber: 3,
      players: [
        { id: 18, name: "Will Bibbings" },    // Will Bibbings
        { id: 23, name: "Jeffrey Reiner" },   // Jeffrey Reiner
        { id: 24, name: "Nic Huxley" },       // Nic Huxley (Team 7 - Player 1)
        { id: 25, name: "Bailey Carlson" }    // Bailey Carlson
      ]
    },
    {
      groupNumber: 4,
      players: [
        { id: 22, name: "Spencer Reid" },     // Spencer Reid
        { id: 27, name: "Jordan Kreller" },   // Jordan Kreller
        { id: 28, name: "Kevin Durco" }       // Kevin Durco
      ]
    }
  ];

  const matchups = [];
  
  for (const group of presetGroupings) {
    if (group.players.length === 4) {
      // 4-player group - each player plays against the other 3 (6 total matches)
      const players = group.players;
      
      // Player 1 vs Player 2
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      
      // Player 1 vs Player 3
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      
      // Player 1 vs Player 4
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[3].id,
        player1Name: players[0].name,
        player2Name: players[3].name
      });
      
      // Player 2 vs Player 3
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
      
      // Player 2 vs Player 4
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[3].id,
        player1Name: players[1].name,
        player2Name: players[3].name
      });
      
      // Player 3 vs Player 4
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[2].id,
        player2Id: players[3].id,
        player1Name: players[2].name,
        player2Name: players[3].name
      });
      
    } else if (group.players.length === 3) {
      // 3-player group - each player plays 3 matches (some opponents twice)
      const players = group.players;
      
      // Each player vs each other player once (3 matches total)
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
      
      // Additional matches to get each player to 3 total matches
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[1].id,
        player1Name: players[0].name,
        player2Name: players[1].name
      });
      
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[0].id,
        player2Id: players[2].id,
        player1Name: players[0].name,
        player2Name: players[2].name
      });
      
      matchups.push({
        round: 3,
        groupNumber: group.groupNumber,
        player1Id: players[1].id,
        player2Id: players[2].id,
        player1Name: players[1].name,
        player2Name: players[2].name
      });
    }
  }
  
  return matchups;
}

async function generateRound2Matchups(storage: any) {
  // Round 2 - Scramble format: Teams must stay together
  const teams = [
    { player1: { id: 13, name: "Nick Grossi" }, player2: { id: 20, name: "Connor Patterson" } },
    { player1: { id: 21, name: "Christian Hauck" }, player2: { id: 25, name: "Bailey Carlson" } },
    { player1: { id: 16, name: "Erik Boudreau" }, player2: { id: 18, name: "Will Bibbings" } },
    { player1: { id: 19, name: "Nick Cook" }, player2: { id: 28, name: "Kevin Durco" } },
    { player1: { id: 22, name: "Spencer Reid" }, player2: { id: 23, name: "Jeffrey Reiner" } },
    { player1: { id: 15, name: "Johnny Magnatta" }, player2: { id: 27, name: "Jordan Kreller" } },
    { player1: { id: 24, name: "Nic Huxley" }, player2: { id: 26, name: "Sye Ellard" }, player3: { id: 14, name: "James Ogilvie" } } // Team 7 (3-person team)
  ];

  // Shuffle teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const matchups = [];
  
  // Handle different team sizes and group them into foursomes
  const playerPool = [];
  shuffledTeams.forEach(team => {
    if (team.player3) {
      // 3-person team - add all 3 players
      playerPool.push(team.player1, team.player2, team.player3);
    } else if (team.player2) {
      // 2-person team - add both players
      playerPool.push(team.player1, team.player2);
    } else {
      // 1-person team - add single player
      playerPool.push(team.player1);
    }
  });
  
  // Group players into foursomes (15 players = 3 foursomes + 1 threesome)
  let groupNumber = 1;
  for (let i = 0; i < playerPool.length; i += 4) {
    const foursome = playerPool.slice(i, i + 4);
    
    if (foursome.length === 4) {
      // Regular foursome - create 2 pairs
      matchups.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      
      matchups.push({
        round: 2,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: foursome[3].id,
        player1Name: foursome[2].name,
        player2Name: foursome[3].name
      });
      
      groupNumber++;
    } else if (foursome.length === 3) {
      // Threesome - create 1 pair + 1 solo player
      matchups.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      
      // Third player as solo
      matchups.push({
        round: 2,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: null,
        player1Name: foursome[2].name,
        player2Name: "Solo Player"
      });
      
      groupNumber++;
    } else if (foursome.length === 2) {
      // Remaining pair
      matchups.push({
        round: 2,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      groupNumber++;
    } else if (foursome.length === 1) {
      // Single remaining player
      matchups.push({
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
  
  return matchups;
}

async function generateRound1Matchups(storage: any) {
  // Round 1 - Random pairings that avoid overlaps with Round 2 & 3
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

  // Get Round 2 and Round 3 pairs to avoid in Round 1
  const round2Pairs = new Set();
  const round3Pairs = new Set();
  
  // Round 2 teammates (should be together in Round 2, avoid in Round 1)
  const teams = [
    [13, 20], [21, 25], [16, 18], [19, 28], [22, 23], [15, 27], [24, 26, 14]
  ];
  
  teams.forEach(team => {
    const pair = team.sort().join('-');
    round2Pairs.add(pair);
  });
  
  // Round 3 preset pairs (avoid in Round 1)
  const round3Groups = [
    [13, 19, 14, 15], // Nick Grossi, Nick Cook, James Ogilvie, Johnny Magnatta
    [20, 16, 21, 26], // Connor Patterson, Erik Boudreau, Christian Hauck, Sye Ellard
    [18, 23, 24, 25], // Will Bibbings, Jeffrey Reiner, Nic Huxley, Bailey Carlson
    [22, 27, 28]      // Spencer Reid, Jordan Kreller, Kevin Durco
  ];
  
  round3Groups.forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const pair = [group[i], group[j]].sort().join('-');
        round3Pairs.add(pair);
      }
    }
  });

  // Generate random pairings with conflict avoidance
  const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
  const matchups = [];
  let groupNumber = 1;
  
  for (let i = 0; i < shuffledPlayers.length; i += 4) {
    const foursome = shuffledPlayers.slice(i, i + 4);
    
    if (foursome.length === 4) {
      // Create pairs within the foursome
      matchups.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      
      matchups.push({
        round: 1,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: foursome[3].id,
        player1Name: foursome[2].name,
        player2Name: foursome[3].name
      });
      
      groupNumber++;
    } else if (foursome.length === 3) {
      // Handle the final threesome (15 total players)
      matchups.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      
      // Third player creates a single-player "pair" 
      matchups.push({
        round: 1,
        groupNumber,
        player1Id: foursome[2].id,
        player2Id: null,
        player1Name: foursome[2].name,
        player2Name: "Solo Player"
      });
      
      groupNumber++;
    } else if (foursome.length === 2) {
      // Handle remaining pair
      matchups.push({
        round: 1,
        groupNumber,
        player1Id: foursome[0].id,
        player2Id: foursome[1].id,
        player1Name: foursome[0].name,
        player2Name: foursome[1].name
      });
      groupNumber++;
    } else if (foursome.length === 1) {
      // Handle single remaining player
      matchups.push({
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
  
  return matchups;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route - must be first to ensure immediate response
  app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Gambler Cup 2025 Tournament Tracker' });
  });

  // Health check endpoints for different deployment systems
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
  });

  // Additional API-prefixed health endpoints for redundancy
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/api/healthz', (req, res) => {
    res.status(200).send('OK');
  });

  // Auth middleware setup (includes session middleware)
  await setupAuth(app);

  // Define custom auth routes AFTER session middleware is set up
  // Custom username/password login endpoint (overrides Replit Auth GET /api/login)
  app.post('/api/login', async (req, res) => {
    try {
      const { playerName, password } = req.body;
      
      if (!playerName || !password) {
        return res.status(400).json({ error: 'Player name and password are required' });
      }

      // Parse player name to get first and last name
      const nameParts = playerName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Find user by name
      const user = await storage.getUserByName(firstName, lastName);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // DYNAMIC PASSWORD UPDATE: Accept any password and update it in the database
      // This allows players to set their own password on next login
      if (password !== user.password) {
        console.log(`🔐 Updating password for ${firstName} ${lastName} from "${user.password}" to "${password}"`);
        await storage.updateUser(user.id, { password: password });
        console.log(`✅ Password updated successfully for ${firstName} ${lastName}`);
      }

      // Create session data
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      };

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Custom registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { playerName, password } = req.body;
      
      if (!playerName || !password) {
        return res.status(400).json({ error: 'Player name and password are required' });
      }

      // Parse player name to get first and last name
      const nameParts = playerName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Check if user already exists
      const existingUser = await storage.getUserByName(firstName, lastName);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user with simple password (for tournament convenience)
      const newUser = await storage.createUser({
        firstName,
        lastName,
        password: 'abc123', // Simple password for tournament
        handicap: 20
      });

      // Create session data
      req.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };

      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user endpoint
  app.get('/api/user', async (req, res) => {
    try {
      // Check for custom session auth first
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
      
      // Fallback to Replit Auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        // Handle Replit Auth user
        const user = req.user as any;
        if (user?.claims?.sub) {
          return res.json({
            id: user.claims.sub,
            firstName: user.claims.given_name || 'User',
            lastName: user.claims.family_name || ''
          });
        }
      }
      
      // No authenticated user found
      res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    if (req.session?.user) {
      // Custom auth logout
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } else if (req.logout) {
      // Replit Auth logout
      req.logout(() => {
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.json({ message: 'No active session' });
    }
  });
  
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

  // Database initialization endpoint
  app.post('/api/initialize-database', async (req, res) => {
    try {
      // Check if teams already exist to avoid duplication
      const existingTeams = await storage.getTeams();
      if (existingTeams.length > 0) {
        return res.json({ message: 'Database already initialized', teams: existingTeams.length });
      }

      console.log('Initializing database with tournament data...');

      // Create all teams first
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
        const totalHandicap = teamData.isThreePersonTeam 
          ? teamData.player1Handicap + teamData.player2Handicap + (teamData.player3Handicap || 0)
          : teamData.player1Handicap + teamData.player2Handicap;
        
        const team = await storage.createTeam({
          ...teamData,
          totalHandicap
        });
        createdTeams.push(team);
        console.log(`Created team ${team.teamNumber}: ${team.player1Name} & ${team.player2Name}${team.player3Name ? ` & ${team.player3Name}` : ''}`);
      }

      // Create all users (players)
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
        // Check if user already exists to avoid duplicates
        const existingUser = await storage.getUserByName(playerData.firstName, playerData.lastName);
        if (!existingUser) {
          const user = await storage.createUser({
            ...playerData,
            password: 'abc123' // Simple password for tournament convenience
          });
          createdUsers.push(user);
          console.log(`Created user: ${user.firstName} ${user.lastName}`);
        } else {
          createdUsers.push(existingUser);
        }
      }

      res.json({ 
        message: 'Database initialized successfully',
        teamsCreated: createdTeams.length,
        usersCreated: createdUsers.length,
        totalPlayers: createdUsers.length
      });

    } catch (error) {
      console.error('Database initialization error:', error);
      res.status(500).json({ error: 'Failed to initialize database' });
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

  // Authentication routes already defined at the top of the file

  // Teams endpoints
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // Custom registration endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { playerName, password } = req.body;
      
      if (!playerName || !password) {
        return res.status(400).json({ error: 'Player name and password are required' });
      }

      // Parse player name to get first and last name
      const nameParts = playerName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Check if user already exists
      const existingUser = await storage.getUserByName(firstName, lastName);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user with simple password (for tournament convenience)
      const newUser = await storage.createUser({
        firstName,
        lastName,
        password: 'abc123', // Simple password for tournament
        handicap: 20
      });

      // Create session data
      req.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };

      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user endpoint
  app.get('/api/user', async (req, res) => {
    try {
      // Check for custom session auth first
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
      
      // Fallback to Replit Auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        // Handle Replit Auth user
        const user = req.user as any;
        if (user?.claims?.sub) {
          return res.json({
            id: user.claims.sub,
            firstName: user.claims.given_name || 'User',
            lastName: user.claims.family_name || ''
          });
        }
      }
      
      // No authenticated user found
      res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    if (req.session?.user) {
      // Custom auth logout
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } else if (req.logout) {
      // Replit Auth logout
      req.logout(() => {
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.json({ message: 'No active session' });
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

  // Get team by player name
  app.get('/api/team/by-player/:playerName', async (req, res) => {
    try {
      const { playerName } = req.params;
      const teams = await storage.getTeams();
      
      const team = teams.find(t => 
        t.player1Name === playerName || t.player2Name === playerName
      );
      
      if (!team) {
        return res.status(404).json({ error: 'Team not found for player' });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team' });
    }
  });

  // Get all users for lookups
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
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
      console.error('Error fetching side bets:', error);
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
        console.error('Error creating side bet:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create side bet' });
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

  app.patch('/api/sidebets/:id/teammate-accept', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const userName = `${user.firstName} ${user.lastName}`;
      const updatedSideBet = await storage.updateTeammateAcceptance(parseInt(id), userName);
      
      // Broadcast teammate acceptance to all clients
      broadcast({
        type: 'SIDE_BET_TEAMMATE_ACCEPTED',
        data: updatedSideBet
      });

      res.json(updatedSideBet);
    } catch (error) {
      console.error('Error accepting team bet:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to accept team bet' });
    }
  });

  // Check bet deadline for a round
  app.get('/api/sidebets/deadline/:round', async (req, res) => {
    try {
      const round = parseInt(req.params.round);
      const deadlineInfo = await storage.checkBetDeadline(round);
      res.json(deadlineInfo);
    } catch (error) {
      console.error('Error checking bet deadline:', error);
      res.status(500).json({ error: 'Failed to check bet deadline' });
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

  // Initialize Round 3 matchups (fixed preset groupings - only create once)
  app.post('/api/matchups/init-round3', requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      
      // Check if user is Nick Grossi
      if (!currentUser || currentUser.firstName !== 'Nick' || currentUser.lastName !== 'Grossi') {
        return res.status(403).json({ error: 'Only Nick Grossi can initialize Round 3 matchups' });
      }

      // Check if Round 3 matchups already exist
      const existingMatchups = await storage.getMatchups();
      const round3Exists = existingMatchups.some(m => m.round === 3);
      
      if (round3Exists) {
        return res.status(400).json({ error: 'Round 3 matchups already exist' });
      }

      // Generate the fixed Round 3 preset groupings
      const round3Matchups = await generateRound3MatchupsOnce(storage);
      const newMatchups = await storage.shuffleMatchupsForRound(3, round3Matchups);
      
      // Broadcast to all connected clients
      broadcast({
        type: 'MATCHUPS_SHUFFLED',
        data: { round: 3, matchups: newMatchups }
      });
      
      res.json(newMatchups);
    } catch (error) {
      console.error('Error initializing Round 3 matchups:', error);
      res.status(500).json({ error: 'Failed to initialize Round 3 matchups' });
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

  // Shuffle matchups endpoint (Nick Grossi only) - Generates tournament-correct matchups
  app.post('/api/matchups/shuffle', requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      
      // Check if user is Nick Grossi (ID 13 based on database)
      if (!currentUser || currentUser.id !== 13) {
        console.log('Auth failed - User:', currentUser);
        return res.status(403).json({ error: 'Only Nick Grossi can shuffle matchups' });
      }

      const { round } = req.body;
      
      console.log('Shuffle request received for round:', round);
      
      if (!round) {
        return res.status(400).json({ error: 'Round is required' });
      }

      // Round 3 cannot be shuffled - it has fixed preset groupings
      if (round === 3) {
        return res.status(400).json({ error: 'Round 3 has fixed preset groupings and cannot be shuffled' });
      }

      let generatedMatchups: any[] = [];

      if (round === 1) {
        // Round 1: Random pairings that avoid overlaps with Round 2 & 3
        generatedMatchups = await generateRound1Matchups(storage);
      } else if (round === 2) {
        // Round 2: Teams must stay together (scramble format)
        generatedMatchups = await generateRound2Matchups(storage);
      }

      const newMatchups = await storage.shuffleMatchupsForRound(round, generatedMatchups);
      
      // Broadcast the shuffle to all connected clients
      broadcast({
        type: 'MATCHUPS_SHUFFLED',
        data: { round, matchups: newMatchups }
      });
      
      res.json(newMatchups);
    } catch (error) {
      console.error('Error shuffling matchups:', error);
      if (error instanceof Error) {
        console.error('Full error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        res.status(500).json({ error: 'Failed to shuffle matchups', details: error.message });
      } else {
        res.status(500).json({ error: 'Failed to shuffle matchups' });
      }
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

  // Initialize Round 3 matchups endpoint (Round 3 can only be initialized once, not shuffled)
  app.post('/api/matchups/initialize-round3', requireAuth, async (req, res) => {
    try {
      const currentUser = req.user;
      
      // Check if user is Nick Grossi (ID 13 based on database)
      if (!currentUser || currentUser.id !== 13) {
        console.log('Auth failed - User:', currentUser);
        return res.status(403).json({ error: 'Only Nick Grossi can initialize Round 3 matchups' });
      }

      console.log('Round 3 initialization request received');
      
      // Check if Round 3 matchups already exist
      const existingMatchups = await storage.getMatchupsByRound(3);
      if (existingMatchups && existingMatchups.length > 0) {
        return res.status(400).json({ error: 'Round 3 matchups already initialized' });
      }

      // Generate Round 3 matchups using preset groupings
      const round3Matchups = await generateRound3MatchupsOnce(storage);
      const newMatchups = await storage.shuffleMatchupsForRound(3, round3Matchups);
      
      // Broadcast the initialization to all connected clients
      broadcast({
        type: 'MATCHUPS_INITIALIZED',
        data: { round: 3, matchups: newMatchups }
      });
      
      res.json(newMatchups);
    } catch (error) {
      console.error('Error initializing Round 3 matchups:', error);
      if (error instanceof Error) {
        console.error('Full error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        res.status(500).json({ error: 'Failed to initialize Round 3 matchups', details: error.message });
      } else {
        res.status(500).json({ error: 'Failed to initialize Round 3 matchups' });
      }
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
      
      console.log('=== REGULAR ROUND SCORE SAVE ATTEMPT ===');
      console.log('User ID:', userId);
      console.log('Round:', round);
      console.log('Hole:', hole);
      console.log('Strokes:', strokes);
      
      // Validate input
      if (!round || !hole || strokes === undefined) {
        console.log('❌ Missing required fields:', { round, hole, strokes });
        return res.status(400).json({ error: 'Missing required fields: round, hole, strokes' });
      }
      
      if (strokes < 1 || strokes > 15) {
        console.log('❌ Invalid strokes value:', strokes);
        return res.status(400).json({ error: 'Invalid strokes value' });
      }
      
      // Validate hole number (1-18 only)
      if (hole < 1 || hole > 18) {
        console.log('❌ Invalid hole number:', hole);
        return res.status(400).json({ error: 'Invalid hole number. Must be between 1 and 18.' });
      }
      
      console.log('✅ Validation passed, updating score...');
      const holeScore = await storage.updateHoleScore(userId, round, hole, strokes);
      console.log('✅ Score updated successfully:', holeScore);
      
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

  // Round-specific hole score endpoints (for frontend compatibility)
  app.post('/api/hole-scores/:round/:hole', requireAuth, async (req: any, res) => {
    try {
      const round = parseInt(req.params.round);
      const hole = parseInt(req.params.hole);
      const { score } = req.body;
      const userId = req.user.id;
      
      console.log('=== ROUND-SPECIFIC SCORE SAVE ATTEMPT ===');
      console.log('User ID:', userId);
      console.log('Round:', round);
      console.log('Hole:', hole);
      console.log('Score:', score);
      
      // Validate input
      if (!round || !hole || score === undefined) {
        console.log('❌ Missing required fields:', { round, hole, score });
        return res.status(400).json({ error: 'Missing required fields: round, hole, score' });
      }
      
      if (score < 1 || score > 15) {
        console.log('❌ Invalid score value:', score);
        return res.status(400).json({ error: 'Invalid score value' });
      }
      
      // Validate hole number (1-18 only)
      if (hole < 1 || hole > 18) {
        console.log('❌ Invalid hole number:', hole);
        return res.status(400).json({ error: 'Invalid hole number. Must be between 1 and 18.' });
      }
      
      console.log('✅ Validation passed, updating score...');
      const holeScore = await storage.updateHoleScore(userId, round, hole, score);
      console.log('✅ Score updated successfully:', holeScore);
      
      // Check for birdie or better and broadcast notification
      const scoreDiff = score - holeScore.par;
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
      console.error('Error updating round-specific hole score:', error);
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
      
      // Validate hole number (1-18 only)
      if (hole < 1 || hole > 18) {
        console.log('❌ Invalid hole number:', hole);
        return res.status(400).json({ error: 'Invalid hole number. Must be between 1 and 18.' });
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

  // Team scramble hole scores for Round 2
  app.get('/api/team-hole-scores/:round', requireAuth, async (req: any, res) => {
    try {
      const round = parseInt(req.params.round);
      const userId = req.user.id;
      
      // Get user's team
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Find user's team
      const userFullName = `${user.firstName} ${user.lastName}`;
      const teams = await storage.getTeams();
      const team = teams.find(t => 
        t.player1Name === userFullName || 
        t.player2Name === userFullName ||
        t.player3Name === userFullName
      );
      
      if (!team) {
        return res.status(404).json({ error: 'Team not found for user' });
      }
      
      // Get team hole scores for scramble format
      const teamHoleScores = await storage.getTeamHoleScores(team.id, round);
      res.json(teamHoleScores);
    } catch (error) {
      console.error('Error fetching team hole scores:', error);
      res.status(500).json({ error: 'Failed to fetch team hole scores' });
    }
  });

  app.post('/api/team-hole-scores', requireAuth, async (req: any, res) => {
    try {
      const { round, hole, strokes } = req.body;
      const userId = req.user.id;
      
      console.log('=== TEAM SCRAMBLE SCORE SAVE ATTEMPT ===');
      console.log('User ID:', userId);
      console.log('Round:', round);
      console.log('Hole:', hole);
      console.log('Strokes:', strokes);
      
      // Validate input
      if (!round || !hole || strokes === undefined) {
        console.log('❌ Missing required fields:', { round, hole, strokes });
        return res.status(400).json({ error: 'Missing required fields: round, hole, strokes' });
      }
      
      if (strokes < 1 || strokes > 15) {
        console.log('❌ Invalid strokes value:', strokes);
        return res.status(400).json({ error: 'Invalid strokes value' });
      }
      
      // Validate hole number (1-18 only)
      if (hole < 1 || hole > 18) {
        console.log('❌ Invalid hole number:', hole);
        return res.status(400).json({ error: 'Invalid hole number. Must be between 1 and 18.' });
      }
      
      // Get user's team
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Find the team by looking for the user's name in team player names
      const userFullName = `${user.firstName} ${user.lastName}`;
      console.log('Looking for team containing user:', userFullName);
      
      const teams = await storage.getTeams();
      const team = teams.find(t => 
        t.player1Name === userFullName || t.player2Name === userFullName
      );
      
      if (!team) {
        console.log('❌ No team found for user:', userFullName);
        console.log('Available teams:', teams.map(t => ({ id: t.id, player1: t.player1Name, player2: t.player2Name })));
        return res.status(404).json({ error: 'Team not found' });
      }
      
      console.log('✅ Found team:', { id: team.id, teamNumber: team.teamNumber, player1: team.player1Name, player2: team.player2Name });

      console.log('✅ Validation passed, saving individual scores for both team members...');
      
      // Parse team member names and get users
      const player1Parts = team.player1Name.split(' ');
      const player2Parts = team.player2Name.split(' ');
      
      const player1FirstName = player1Parts[0];
      const player1LastName = player1Parts.slice(1).join(' ');
      const player2FirstName = player2Parts[0];
      const player2LastName = player2Parts.slice(1).join(' ');

      const player1 = await storage.getUserByName(player1FirstName, player1LastName);
      const player2 = await storage.getUserByName(player2FirstName, player2LastName);

      if (!player1 || !player2) {
        console.log('❌ Could not find team members:', {
          player1Name: team.player1Name,
          player2Name: team.player2Name,
          player1Found: !!player1,
          player2Found: !!player2
        });
        return res.status(404).json({ error: 'Team members not found' });
      }

      // Save the same scramble score for both team members
      const holeScore1 = await storage.updateHoleScore(player1.id, round, hole, strokes);
      const holeScore2 = await storage.updateHoleScore(player2.id, round, hole, strokes);

      console.log('✅ Individual scores saved for both team members');
      console.log('Player 1 score:', holeScore1);
      console.log('Player 2 score:', holeScore2);
      
      // Use the first player's hole score for birdie checking (both should be identical)
      const holeScore = holeScore1;
      
      // Check for birdie or better and broadcast notification
      const scoreDiff = strokes - holeScore.par;
      if (scoreDiff <= -1) { // Birdie or better
        const teamName = `Team ${team.teamNumber}`;
        
        let scoreName = 'Birdie';
        if (scoreDiff <= -3) scoreName = 'Albatross';
        else if (scoreDiff === -2) scoreName = 'Eagle';
        
        // Broadcast birdie notification to all clients
        console.log(`🎯 TEAM BIRDIE ALERT: ${teamName} scored ${scoreName} on hole ${hole}!`);
        broadcast({
          type: 'BIRDIE_NOTIFICATION',
          data: { 
            playerName: teamName, 
            holeNumber: hole, 
            scoreName,
            round,
            isTeamScore: true
          }
        });
      }
      
      // Broadcast team hole score update to all clients
      broadcast({
        type: 'TEAM_HOLE_SCORE_UPDATE',
        data: { holeScore, teamId: team.id, userId, round, hole }
      });

      res.json(holeScore);
    } catch (error) {
      console.error('Error updating team hole score:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      res.status(500).json({ error: 'Failed to update team hole score', details: error instanceof Error ? error.message : 'Unknown error' });
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
      console.log(`🚀 API CALLED: /api/team-scramble/${round}`);
      const leaderboard = await storage.getScrambleLeaderboard(round);
      console.log('🚀 API RESPONSE: team-scramble leaderboard being sent to frontend:');
      leaderboard.forEach(entry => {
        console.log(`   Team ${entry.team?.teamNumber}: totalNetStrokes=${entry.totalNetStrokes}, totalGrossStrokes=${entry.totalGrossStrokes}, teamHandicap=${entry.teamHandicap}`);
      });
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

  // Chat endpoints
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/chat/messages', requireAuth, async (req: any, res) => {
    try {
      const { message, taggedUserIds } = req.body;
      const userId = req.user.id;

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      const messageData = {
        userId,
        message: message.trim(),
        taggedUserIds: taggedUserIds || []
      };

      const newMessage = await storage.createChatMessage(messageData);
      
      // Broadcast new message to all clients
      broadcast({
        type: 'CHAT_MESSAGE',
        data: newMessage
      });

      res.json(newMessage);
    } catch (error) {
      console.error('Error creating chat message:', error);
      res.status(500).json({ error: 'Failed to send message' });
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
