import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const router = Router();

// Middleware to check authentication (copied from main routes)
async function requireAuth(req: any, res: any, next: any) {
  // First try session-based authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Fallback to token-based authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { getUserFromToken } = await import('./auth');
    const userId = getUserFromToken(token);
    
    if (userId) {
      try {
        const user = await storage.getUser(userId);
        if (user) {
          // Attach user to request for routes that need it
          req.user = user;
          return next();
        }
      } catch (error) {
        console.error("Error fetching user by token:", error);
      }
    }
  }
  
  return res.status(401).json({ error: 'Authentication required' });
}

// Get single hole score endpoint
router.get("/hole-score/:round/:hole", requireAuth, async (req, res) => {
  try {
    const round = parseInt(req.params.round);
    const hole = parseInt(req.params.hole);
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log(`🎯 GET /api/hole-score/${round}/${hole} for user ${user.id}`);
    
    // Get the specific hole score
    const holeScores = await storage.getHoleScores(user.id, round);
    const holeScore = holeScores.find(score => score.hole === hole);
    
    if (holeScore) {
      console.log(`✅ Found score: ${holeScore.strokes} strokes`);
      return res.json({ strokes: holeScore.strokes });
    } else {
      console.log(`📍 No score found for hole ${hole}`);
      return res.status(404).json({ error: "Score not found" });
    }
  } catch (error) {
    console.error("Error getting hole score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single team hole score endpoint  
router.get("/team-hole-score/:round/:hole", requireAuth, async (req, res) => {
  try {
    const round = parseInt(req.params.round);
    const hole = parseInt(req.params.hole);
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log(`🎯 GET /api/team-hole-score/${round}/${hole} for user ${user.id}`);
    
    // Get team hole scores
    const teamHoleScores = await storage.getTeamHoleScores(user.id, round);
    const holeScore = teamHoleScores.find(score => score.hole === hole);
    
    if (holeScore) {
      console.log(`✅ Found team score: ${holeScore.strokes} strokes`);
      return res.json({ strokes: holeScore.strokes });
    } else {
      console.log(`📍 No team score found for hole ${hole}`);
      return res.status(404).json({ error: "Score not found" });
    }
  } catch (error) {
    console.error("Error getting team hole score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as simpleRouter };