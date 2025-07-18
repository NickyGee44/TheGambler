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
    
    // Insert all hole scores
    await db.insert(holeScores).values(allMockScores);
    
    // Generate mock side bets
    const mockSideBets = [
      {
        challenger: "Nick Grossi",
        challengee: "Connor Patterson",
        description: "Closest to the pin on hole 7",
        amount: 20,
        round: 1,
        status: "Accepted",
        result: "Won",
        winner: "Nick Grossi",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        challenger: "Christian Hauck",
        challengee: "Bailey Carlson",
        description: "Fewest putts on the back 9",
        amount: 15,
        round: 1,
        status: "Accepted",
        result: "Won",
        winner: "Bailey Carlson",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        challenger: "Erik Boudreau",
        challengee: "Will Bibbings",
        description: "Longest drive on hole 12",
        amount: 25,
        round: 2,
        status: "Accepted",
        result: "Won",
        winner: "Erik Boudreau",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        challenger: "Spencer Reid",
        challengee: "Jeffrey Reiner",
        description: "Most birdies in the round",
        amount: 30,
        round: 2,
        status: "Declined",
        result: "Declined",
        winner: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        challenger: "Sye Ellard",
        challengee: "Austin Hassani",
        description: "Better score on par 3s",
        amount: 10,
        round: 3,
        status: "Pending",
        result: "Pending",
        winner: null,
        createdAt: new Date(),
      },
      {
        challenger: "Jordan Kreller",
        challengee: "Johnny Magnatta",
        description: "Fewest penalty strokes",
        amount: 20,
        round: 3,
        status: "Accepted",
        result: "Pending",
        winner: null,
        createdAt: new Date(),
      },
      {
        challenger: "Nick Cook",
        challengee: "Kevin Durco",
        description: "Best net score on holes 1-9",
        amount: 25,
        round: 3,
        status: "Pending",
        result: "Pending",
        winner: null,
        createdAt: new Date(),
      },
    ];
    
    // Clear existing side bets and insert mock data
    await db.delete(sideBets);
    await db.insert(sideBets).values(mockSideBets);
    
    // Generate mock photos
    const mockPhotos = [
      {
        filename: "tournament_start.jpg",
        caption: "All 16 players at the tee box ready for Round 1",
        uploadedBy: "Nick Grossi",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMyMjc3M2IiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+VG91cm5hbWVudCBTdGFydDwvdGV4dD48L3N2Zz4=",
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        filename: "hole_in_one.jpg",
        caption: "Connor's hole-in-one on hole 8!",
        uploadedBy: "Connor Patterson",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNjgzMzEiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5Ib2xlIGluIE9uZSE8L3RleHQ+PC9zdmc+",
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        filename: "team_celebration.jpg",
        caption: "Team 3 celebrating their Round 2 victory",
        uploadedBy: "Ben Braun",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNTk3MjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+VGVhbSBDZWxlYnJhdGlvbiE8L3RleHQ+PC9zdmc+",
        uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        filename: "sunset_golf.jpg",
        caption: "Beautiful sunset over Muskoka Bay Golf Club",
        uploadedBy: "Erik Boudreau",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJzdW5zZXQiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmI5MjNkIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmJkNDNkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjc3Vuc2V0KSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2Y1OTcyMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5TdW5zZXQgR29sZjwvdGV4dD48L3N2Zz4=",
        uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        filename: "funny_mishit.jpg",
        caption: "Spencer's ball somehow ended up in the parking lot",
        uploadedBy: "Jeffrey Reiner",
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM2Mzc0ZjEiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+RnVubnkgTWlzaGl0ITwvdGV4dD48L3N2Zz4=",
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];
    
    // Clear existing photos and insert mock data
    await db.delete(photos);
    await db.insert(photos).values(mockPhotos);
    
    console.log("✅ Mock data generated successfully!");
    console.log(`- Generated ${allMockScores.length} hole scores`);
    console.log(`- Generated ${mockSideBets.length} side bets`);
    console.log(`- Generated ${mockPhotos.length} photos`);
    
  } catch (error) {
    console.error("Error generating mock data:", error);
    throw error;
  }
}