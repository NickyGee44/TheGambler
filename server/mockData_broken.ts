import { db } from "./db";
import { holeScores, sideBets, photos, users, teams, matchPlayMatches, matchPlayGroups } from "@shared/schema";
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

// Generate mock match play data for Round 3
async function generateMockMatchPlayData() {
  console.log("Generating mock match play data for Round 3...");
  
  // Get all users to map names to IDs
  const allUsers = await db.select().from(users);
  const userMap = new Map();
  allUsers.forEach(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    userMap.set(fullName, user.id);
  });
  
  // Define Round 3 groups as specified in replit.md
  const round3Groups = [
    {
      groupNumber: 1,
      players: ["Jordan Kreller", "Christian Hauck", "Connor Patterson", "Ben Braun"]
    },
    {
      groupNumber: 2,
      players: ["Spencer Reid", "Jeffrey Reiner", "Kevin Durco", "Erik Boudreau"]
    },
    {
      groupNumber: 3,
      players: ["Sye Ellard", "Will Bibbings", "Nic Huxley", "Bailey Carlson"]
    },
    {
      groupNumber: 4,
      players: ["Nick Grossi", "Nick Cook", "Johnny Magnatta", "James Ogilvie"]
    }
  ];
  
  console.log("Available users:", allUsers.map(u => `${u.firstName} ${u.lastName}`));
  console.log("Looking for players:", round3Groups.flatMap(g => g.players));
  
  // Clear existing match play data
  await db.delete(matchPlayMatches);
  await db.delete(matchPlayGroups);
  
  // Create groups and matches
  let groupsCount = 0;
  let matchesCount = 0;
  
  for (const group of round3Groups) {
    const playerIds = group.players.map(name => userMap.get(name)).filter(id => id);
    const playerData = group.players.map(name => allUsers.find(u => `${u.firstName} ${u.lastName}` === name)).filter(u => u);
    
    if (playerIds.length === 4 && playerData.length === 4) {
      console.log(`Creating group ${group.groupNumber}:`, {
        playerIds,
        playerNames: playerData.map(p => `${p.firstName} ${p.lastName}`),
        playerHandicaps: playerData.map(p => p.handicap)
      });
      
      // Create group with names and handicaps
      const groupData = {
        groupNumber: group.groupNumber,
        player1Id: playerIds[0],
        player2Id: playerIds[1],
        player3Id: playerIds[2],
        player4Id: playerIds[3],
        player1Name: `${playerData[0].firstName} ${playerData[0].lastName}`,
        player2Name: `${playerData[1].firstName} ${playerData[1].lastName}`,
        player3Name: `${playerData[2].firstName} ${playerData[2].lastName}`,
        player4Name: `${playerData[3].firstName} ${playerData[3].lastName}`,
        player1Handicap: playerData[0].handicap || 15,
        player2Handicap: playerData[1].handicap || 15,
        player3Handicap: playerData[2].handicap || 15,
        player4Handicap: playerData[3].handicap || 15,
      };
      
      console.log("Group data to insert:", groupData);
      await db.insert(matchPlayGroups).values(groupData);
      groupsCount++;
      
      // Generate 6 matches for this group (each player vs each other player)
      const matches = [];
      const holeSegments = ["1-6", "7-12", "13-18"];
      
      for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
          const player1Id = playerIds[i];
          const player2Id = playerIds[j];
          
          // Assign holes based on match index
          const matchIndex = matches.length % 3;
          const holeSegment = holeSegments[matchIndex];
          const startHole = matchIndex === 0 ? 1 : (matchIndex === 1 ? 7 : 13);
          const endHole = matchIndex === 0 ? 6 : (matchIndex === 1 ? 12 : 18);
          
          // Random match result
          const randomResult = Math.random();
          let winnerId, result;
          if (randomResult < 0.4) {
            winnerId = player1Id;
            result = "player1_win";
          } else if (randomResult < 0.8) {
            winnerId = player2Id;
            result = "player2_win";
          } else {
            winnerId = null;
            result = "tie";
          }
          
          const match = {
            round: 3,
            player1Id,
            player2Id,
            groupNumber: group.groupNumber,
            holeSegment,
            startHole,
            endHole,
            handicapDifference: Math.abs((playerData.find(p => p.id === player1Id)?.handicap || 15) - (playerData.find(p => p.id === player2Id)?.handicap || 15)),
            strokesGiven: Math.min(Math.floor(Math.abs((playerData.find(p => p.id === player1Id)?.handicap || 15) - (playerData.find(p => p.id === player2Id)?.handicap || 15)) / 3), 6),
            strokeRecipientId: (playerData.find(p => p.id === player1Id)?.handicap || 15) > (playerData.find(p => p.id === player2Id)?.handicap || 15) ? player1Id : 
                              (playerData.find(p => p.id === player2Id)?.handicap || 15) > (playerData.find(p => p.id === player1Id)?.handicap || 15) ? player2Id : null,
            strokeHoles: (() => {
              const strokes = Math.min(Math.floor(Math.abs((playerData.find(p => p.id === player1Id)?.handicap || 15) - (playerData.find(p => p.id === player2Id)?.handicap || 15)) / 3), 6);
              const segmentStrokeHoles = holeSegment === '1-6' ? [4, 2, 6, 1, 3, 5] : 
                                       holeSegment === '7-12' ? [10, 8, 12, 7, 9, 11] : 
                                       [14, 16, 18, 13, 15, 17];
              return segmentStrokeHoles.slice(0, strokes);
            })(),
            player1NetScore: 20 + Math.floor(Math.random() * 8), // 20-27 for 6 holes
            player2NetScore: 20 + Math.floor(Math.random() * 8),
            winnerId,
            result,
            pointsAwarded: winnerId === player1Id ? { player1: 2, player2: 0 } : 
                          winnerId === player2Id ? { player1: 0, player2: 2 } : 
                          { player1: 1, player2: 1 },
            matchStatus: "completed"
          };
          
          matches.push(match);
        }
      }
      
      // Insert matches for this group
      await db.insert(matchPlayMatches).values(matches);
      matchesCount += matches.length;
    } else {
      console.log(`Skipping group ${group.groupNumber}: playerIds.length=${playerIds.length}, playerData.length=${playerData.length}`);
      console.log("Missing players:", group.players.filter(name => !userMap.get(name)));
    }
  }
  
  console.log(`Generated ${groupsCount} groups with ${matchesCount} total matches`);
  return { groupsCount, matchesCount };
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
    
    // Generate mock match play data for Round 3
    const mockMatchPlayData = await generateMockMatchPlayData();
    
    console.log("✅ Mock data generated successfully!");
    console.log(`- Generated ${allMockScores.length} hole scores`);
    console.log(`- Generated ${mockSideBets.length} side bets`);
    console.log(`- Generated ${mockMatchPlayData.groupsCount} match play groups and ${mockMatchPlayData.matchesCount} matches`);
    console.log(`- Skipped photo generation as requested`);
    
  } catch (error) {
    console.error("Error generating mock data:", error);
    throw error;
  }
}