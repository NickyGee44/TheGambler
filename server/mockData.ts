import { db } from "./db";
import { holeScores, sideBets, photos, users, teams } from "@shared/schema";
import { eq } from "drizzle-orm";

// Dynamic mock data generator that uses actual teams and users
async function generateMockHoleScores() {
  console.log("Fetching actual teams and users from database...");
  
  // Get all teams with their players
  const allTeams = await db.select().from(teams);
  const allUsers = await db.select().from(users);
  
  console.log(`Found ${allTeams.length} teams and ${allUsers.length} users`);
  
  // Create user mapping by name
  const userMap = new Map();
  allUsers.forEach(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    userMap.set(fullName, user.id);
  });
  
  const pars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];
  const mockData = [];
  
  // Generate hole scores for each team and player
  for (const team of allTeams) {
    const player1Id = userMap.get(team.player1Name);
    const player2Id = userMap.get(team.player2Name);
    
    if (!player1Id || !player2Id) {
      console.warn(`Could not find user IDs for team ${team.teamNumber}: ${team.player1Name}, ${team.player2Name}`);
      continue;
    }
    
    // Generate 3 rounds of data for each player
    for (let round = 1; round <= 3; round++) {
      for (let hole = 1; hole <= 18; hole++) {
        // Player 1
        mockData.push({
          userId: player1Id,
          teamId: team.id,
          round,
          hole,
          strokes: Math.floor(Math.random() * 4) + 3, // 3-6 strokes
          par: pars[hole - 1],
          handicap: 1,
          netScore: 0,
          points: Math.floor(Math.random() * 6) + 1,
          fairwayInRegulation: Math.random() > 0.4,
          greenInRegulation: Math.random() > 0.3,
          putts: Math.floor(Math.random() * 3) + 1,
          penalties: Math.random() > 0.8 ? 1 : 0,
          sandSaves: Math.random() > 0.9 ? 1 : 0,
          upAndDowns: Math.random() > 0.8 ? 1 : 0,
        });
        
        // Player 2
        mockData.push({
          userId: player2Id,
          teamId: team.id,
          round,
          hole,
          strokes: Math.floor(Math.random() * 4) + 3,
          par: pars[hole - 1],
          handicap: 1,
          netScore: 0,
          points: Math.floor(Math.random() * 6) + 1,
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
  
  console.log(`Generated ${mockData.length} hole scores for ${allTeams.length} teams`);
  return mockData;
}

// Mock hole scores for all 16 players across 3 rounds (old static version - will be replaced)
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
    
    // Generate dynamic hole scores using actual teams and users
    const allMockScores = await generateMockHoleScores();
    
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
        opponentName: "Will Bibi",
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
        opponentName: "Jeff Reiner",
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
        opponentName: "Jonathan Magnatta",
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