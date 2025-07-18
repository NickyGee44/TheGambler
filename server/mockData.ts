import { db } from "./db";
import { holeScores, sideBets, photos, users, teams } from "@shared/schema";
import { eq } from "drizzle-orm";

// Mock hole scores for all 16 players across 3 rounds
const mockHoleScores = [
  // Round 1 - Nick Grossi (Team 1)
  ...Array.from({ length: 18 }, (_, i) => ({
    userId: 1,
    teamId: 1,
    round: 1,
    hole: i + 1,
    strokes: Math.floor(Math.random() * 4) + 3, // 3-6 strokes
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5][i],
    handicap: 1,
    netScore: 0,
    points: Math.floor(Math.random() * 6) + 1, // 1-6 points
    fairwayInRegulation: Math.random() > 0.4,
    greenInRegulation: Math.random() > 0.3,
    putts: Math.floor(Math.random() * 3) + 1, // 1-3 putts
    penalties: Math.random() > 0.8 ? 1 : 0,
    sandSaves: Math.random() > 0.9 ? 1 : 0,
    upAndDowns: Math.random() > 0.8 ? 1 : 0,
  })),
  
  // Round 1 - Connor Patterson (Team 1)
  ...Array.from({ length: 18 }, (_, i) => ({
    userId: 2,
    teamId: 1,
    round: 1,
    hole: i + 1,
    strokes: Math.floor(Math.random() * 4) + 3,
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5][i],
    handicap: 1,
    netScore: 0,
    points: Math.floor(Math.random() * 6) + 1,
    fairwayInRegulation: Math.random() > 0.3,
    greenInRegulation: Math.random() > 0.2,
    putts: Math.floor(Math.random() * 3) + 1,
    penalties: Math.random() > 0.9 ? 1 : 0,
    sandSaves: Math.random() > 0.9 ? 1 : 0,
    upAndDowns: Math.random() > 0.7 ? 1 : 0,
  })),
  
  // Round 1 - Christian Hauck (Team 2)
  ...Array.from({ length: 18 }, (_, i) => ({
    userId: 3,
    teamId: 2,
    round: 1,
    hole: i + 1,
    strokes: Math.floor(Math.random() * 4) + 3,
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5][i],
    handicap: 1,
    netScore: 0,
    points: Math.floor(Math.random() * 6) + 1,
    fairwayInRegulation: Math.random() > 0.3,
    greenInRegulation: Math.random() > 0.2,
    putts: Math.floor(Math.random() * 3) + 1,
    penalties: Math.random() > 0.8 ? 1 : 0,
    sandSaves: Math.random() > 0.9 ? 1 : 0,
    upAndDowns: Math.random() > 0.8 ? 1 : 0,
  })),
  
  // Round 1 - Bailey Carlson (Team 2)
  ...Array.from({ length: 18 }, (_, i) => ({
    userId: 4,
    teamId: 2,
    round: 1,
    hole: i + 1,
    strokes: Math.floor(Math.random() * 5) + 3,
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5][i],
    handicap: 1,
    netScore: 0,
    points: Math.floor(Math.random() * 5) + 1,
    fairwayInRegulation: Math.random() > 0.5,
    greenInRegulation: Math.random() > 0.4,
    putts: Math.floor(Math.random() * 3) + 1,
    penalties: Math.random() > 0.7 ? 1 : 0,
    sandSaves: Math.random() > 0.9 ? 1 : 0,
    upAndDowns: Math.random() > 0.8 ? 1 : 0,
  })),
];

// Generate similar data for all teams and rounds
export async function generateMockData() {
  console.log("Generating mock tournament data...");
  
  try {
    // Clear existing hole scores
    await db.delete(holeScores);
    
    // Generate hole scores for all 16 players across 3 rounds
    const allMockScores = [];
    const playerIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const teamIds = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
    
    for (let round = 1; round <= 3; round++) {
      for (let playerIndex = 0; playerIndex < playerIds.length; playerIndex++) {
        const playerId = playerIds[playerIndex];
        const teamId = teamIds[playerIndex];
        
        // Generate 18 holes for this player/round
        for (let hole = 1; hole <= 18; hole++) {
          const par = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5][hole - 1];
          const strokes = Math.floor(Math.random() * 5) + 3; // 3-7 strokes
          const netScore = strokes - par;
          
          // Calculate points based on net score
          let points = 0;
          if (netScore <= -2) points = 6; // Eagle or better
          else if (netScore === -1) points = 4; // Birdie
          else if (netScore === 0) points = 2; // Par
          else if (netScore === 1) points = 1; // Bogey
          else points = 0; // Double bogey or worse
          
          allMockScores.push({
            userId: playerId,
            teamId: teamId,
            round: round,
            hole: hole,
            strokes: strokes,
            par: par,
            handicap: 1,
            netScore: netScore,
            points: points,
            fairwayInRegulation: Math.random() > 0.4,
            greenInRegulation: Math.random() > 0.3,
            putts: Math.floor(Math.random() * 3) + 1,
            penalties: Math.random() > 0.8 ? 1 : 0,
            sandSaves: Math.random() > 0.9 ? 1 : 0,
            upAndDowns: Math.random() > 0.8 ? 1 : 0,
          });
        }
      }
    }
    
    // Insert all hole scores in batches to avoid database limits
    console.log(`Inserting ${allMockScores.length} hole scores...`);
    
    // Insert in batches of 100 to avoid potential database limits
    const batchSize = 100;
    for (let i = 0; i < allMockScores.length; i += batchSize) {
      const batch = allMockScores.slice(i, i + batchSize);
      await db.insert(holeScores).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMockScores.length / batchSize)}`);
    }
    
    // Generate mock side bets
    const mockSideBets = [
      {
        betterName: "Nick Grossi",
        opponentName: "Connor Patterson",
        condition: "Closest to the pin on hole 7",
        amount: 20,
        round: 1,
        status: "Accepted",
        result: "Won",
        winnerName: "Nick Grossi",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        betterName: "Christian Hauck",
        opponentName: "Bailey Carlson",
        condition: "Fewest putts on the back 9",
        amount: 15,
        round: 1,
        status: "Accepted",
        result: "Won",
        winnerName: "Bailey Carlson",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        betterName: "Erik Boudreau",
        opponentName: "Will Bibbings",
        condition: "Longest drive on hole 12",
        amount: 25,
        round: 2,
        status: "Accepted",
        result: "Won",
        winnerName: "Erik Boudreau",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        betterName: "Spencer Reid",
        opponentName: "Jeffrey Reiner",
        condition: "Most birdies in the round",
        amount: 30,
        round: 2,
        status: "Declined",
        result: "Declined",
        winnerName: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        betterName: "Sye Ellard",
        opponentName: "Austin Hassani",
        condition: "Better score on par 3s",
        amount: 10,
        round: 3,
        status: "Pending",
        result: "Pending",
        winnerName: null,
        createdAt: new Date(),
      },
      {
        betterName: "Jordan Kreller",
        opponentName: "Johnny Magnatta",
        condition: "Fewest penalty strokes",
        amount: 20,
        round: 3,
        status: "Accepted",
        result: "Pending",
        winnerName: null,
        createdAt: new Date(),
      },
      {
        betterName: "Nick Cook",
        opponentName: "Kevin Durco",
        condition: "Best net score on holes 1-9",
        amount: 25,
        round: 3,
        status: "Pending",
        result: "Pending",
        winnerName: null,
        createdAt: new Date(),
      },
    ];
    
    // Clear existing side bets and insert mock data
    await db.delete(sideBets);
    await db.insert(sideBets).values(mockSideBets);
    
    // Skip photo generation as requested by user
    
    console.log("✅ Mock data generated successfully!");
    console.log(`- Generated ${allMockScores.length} hole scores`);
    console.log(`- Generated ${mockSideBets.length} side bets`);
    console.log(`- Skipped photo generation as requested`);
    
  } catch (error) {
    console.error("Error generating mock data:", error);
    throw error;
  }
}