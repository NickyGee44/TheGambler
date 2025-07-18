import { db } from "./db";
import { users, teams, holeScores, matchPlayGroups, matchPlayMatches } from "@shared/schema";

// Generate mock match play data for Round 3
export async function generateMockMatchPlayData() {
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
      players: ["Nick Grossi", "Nick Cook", "Johnny Magnatta", "Austin Hassani"]
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
      
      // Try raw SQL insertion as a workaround
      const result = await db.execute(`
        INSERT INTO match_play_groups (
          group_number, player1_id, player2_id, player3_id, player4_id,
          player1_name, player2_name, player3_name, player4_name,
          player1_handicap, player2_handicap, player3_handicap, player4_handicap
        ) VALUES (
          ${groupData.groupNumber}, ${groupData.player1Id}, ${groupData.player2Id}, ${groupData.player3Id}, ${groupData.player4Id},
          '${groupData.player1Name}', '${groupData.player2Name}', '${groupData.player3Name}', '${groupData.player4Name}',
          ${groupData.player1Handicap}, ${groupData.player2Handicap}, ${groupData.player3Handicap}, ${groupData.player4Handicap}
        )
      `);
      console.log("Insert result:", result);
      groupsCount++;
      
      // Generate 6 matches for this group
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
            result = "p1_win";
          } else if (randomResult < 0.8) {
            winnerId = player2Id;
            result = "p2_win";
          } else {
            winnerId = null;
            result = "tie";
          }
          
          const match = {
            player1Id: player1Id,
            player2Id: player2Id,
            groupNumber: group.groupNumber,
            holeSegment,
            startHole,
            endHole,
            handicapDifference: Math.floor(Math.random() * 5),
            strokesGiven: Math.floor(Math.random() * 3),
            strokeRecipientId: Math.random() > 0.5 ? player1Id : player2Id,
            strokeHoles: [startHole, startHole + 2, startHole + 4],
            player1NetScore: 20 + Math.floor(Math.random() * 8),
            player2NetScore: 20 + Math.floor(Math.random() * 8),
            winnerId,
            result,
            pointsAwarded: winnerId === player1Id ? { player1: 2, player2: 0 } : 
                          winnerId === player2Id ? { player1: 0, player2: 2 } : 
                          { player1: 1, player2: 1 },
            matchStatus: "done"
          };
          
          matches.push(match);
        }
      }
      
      // Insert matches for this group using raw SQL
      for (const match of matches) {
        const p1Id = match.player1Id;
        const p2Id = match.player2Id;
        const wId = match.winnerId;
        const recId = match.strokeRecipientId;
        
        await db.execute(`
          INSERT INTO match_play_matches (
            round, player1_id, player2_id, group_number, hole_segment, start_hole, end_hole,
            handicap_difference, strokes_given, stroke_recipient_id, stroke_holes,
            player1_net_score, player2_net_score, winner_id, result, points_awarded, match_status
          ) VALUES (
            3, ${p1Id}, ${p2Id}, ${match.groupNumber}, 
            '${match.holeSegment}', ${match.startHole}, ${match.endHole},
            ${match.handicapDifference}, ${match.strokesGiven}, ${recId || 'NULL'},
            '${JSON.stringify(match.strokeHoles)}',
            ${match.player1NetScore}, ${match.player2NetScore}, ${wId || 'NULL'},
            '${match.result}', '${JSON.stringify(match.pointsAwarded)}', '${match.matchStatus}'
          )
        `);
        matchesCount++;
      }
    } else {
      console.log(`Skipping group ${group.groupNumber}: playerIds.length=${playerIds.length}, playerData.length=${playerData.length}`);
      console.log("Missing players:", group.players.filter(name => !userMap.get(name)));
    }
  }
  
  console.log(`Generated ${groupsCount} groups with ${matchesCount} total matches`);
  return { groupsCount, matchesCount };
}