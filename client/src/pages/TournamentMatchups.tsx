import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Trophy, Target, Shuffle } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: number;
  teamNumber: number;
  player1Name: string;
  player1Handicap: number;
  player2Name: string;
  player2Handicap: number;
  totalHandicap: number;
}

interface MatchPlayMatch {
  id: number;
  player1_id: number;
  player2_id: number;
  hole_segment: string;
  handicap_difference: number;
  strokes_given: number;
  stroke_recipient_id: number | null;
  stroke_holes: number[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  handicap: number;
}

export default function TournamentMatchups() {
  const { toast } = useToast();
  
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: persistentMatchups = [], isLoading: matchupsLoading, refetch: refetchMatchups } = useQuery<any[]>({
    queryKey: ['/api/matchups'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  // Handle shuffling matchups for different rounds
  const handleShuffleMatchups = async (round: number) => {
    try {
      if (round === 1) {
        await apiRequest('/api/tournament/generate-round1', {
          method: 'POST',
        });
        toast({
          title: "Round 1 Shuffled",
          description: "New random foursomes generated with optimized pairing.",
        });
      } else if (round === 2) {
        await apiRequest('/api/tournament/generate-round2', {
          method: 'POST',
        });
        toast({
          title: "Round 2 Shuffled", 
          description: "New scramble foursomes generated (teammates paired).",
        });
      } else if (round === 3) {
        await apiRequest('/api/tournament/initialize-round3', {
          method: 'POST',
        });
        toast({
          title: "Round 3 Initialized",
          description: "Fixed match play pairings created.",
        });
      }
      
      // Refetch matchups to show updated data
      refetchMatchups();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to shuffle Round ${round} matchups. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Check if current user is Nick Grossi
  const isNickGrossi = currentUser && 
    currentUser.firstName === 'Nick' && 
    currentUser.lastName === 'Grossi';

  // Create user lookup map
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<number, User>);

  // Create full player list for optimized grouping
  const allPlayers = teams.flatMap(team => [
    { name: team.player1Name, handicap: team.player1Handicap, team: team.teamNumber, id: `${team.teamNumber}-1` },
    { name: team.player2Name, handicap: team.player2Handicap, team: team.teamNumber, id: `${team.teamNumber}-2` }
  ]).filter(p => p.name);

  // Create player ID to name mapping from teams data first
  const playerIdToNameMap: Record<number, string> = {};
  const playerIdToHandicapMap: Record<number, number> = {};
  
  // Map known user IDs to names from teams, using database handicaps from users
  teams.forEach(team => {
    // Find users for this team by matching names
    const player1User = users.find(u => `${u.firstName} ${u.lastName}` === team.player1Name);
    const player2User = users.find(u => `${u.firstName} ${u.lastName}` === team.player2Name);
    
    if (player1User) {
      playerIdToNameMap[player1User.id] = team.player1Name;
      // Use handicap from users database (most accurate) instead of teams table
      playerIdToHandicapMap[player1User.id] = player1User.handicap || team.player1Handicap;
    }
    if (player2User) {
      playerIdToNameMap[player2User.id] = team.player2Name;
      // Use handicap from users database (most accurate) instead of teams table
      playerIdToHandicapMap[player2User.id] = player2User.handicap || team.player2Handicap;
    }
  });

  const getPlayerName = (userId: number) => {
    return playerIdToNameMap[userId] || `Player ${userId}`;
  };

  // Use persistent matchups from database
  const getPlayerHandicap = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user?.handicap || playerIdToHandicapMap[userId] || 0;
  };

  // Display persistent matchups by round
  const matchupsByRound = persistentMatchups.reduce((acc: any, matchup: any) => {
    if (!acc[matchup.round]) acc[matchup.round] = [];
    acc[matchup.round].push(matchup);
    return acc;
  }, {});

  // Track Round 3 pairings to avoid conflicts (for legacy algorithm display)
  const round3Pairings = new Set<string>();
  (persistentMatchups || []).forEach((match: any) => {
    if (match.round === 3) {
      const player1Name = getPlayerName(match.player1Id);
      const player2Name = getPlayerName(match.player2Id);
      if (player1Name && player2Name) {
        const pair = [player1Name, player2Name].sort().join('|');
        round3Pairings.add(pair);
      }
    }
  });

  // Helper function to check if two players are paired in Round 3
  const areInRound3Together = (name1: string, name2: string) => {
    const pair = [name1, name2].sort().join('|');
    return round3Pairings.has(pair);
  };

  // Helper function to check if two players are teammates
  const areTeammates = (name1: string, name2: string) => {
    const player1Team = allPlayers.find(p => p.name === name1)?.team;
    const player2Team = allPlayers.find(p => p.name === name2)?.team;
    return player1Team === player2Team;
  };

  // Generate optimized Round 1 foursomes (randomized but avoiding Round 3 overlaps)
  const generateRound1Foursomes = () => {
    // Use random shuffling for player groupings
    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
    
    // Find Connor and Christian to swap them
    const connorIndex = shuffledPlayers.findIndex(p => p.name === "Connor Patterson");
    const christianIndex = shuffledPlayers.findIndex(p => p.name === "Christian Hauck");
    
    // Swap Connor and Christian if both are found
    if (connorIndex !== -1 && christianIndex !== -1) {
      const temp = shuffledPlayers[connorIndex];
      shuffledPlayers[connorIndex] = shuffledPlayers[christianIndex];
      shuffledPlayers[christianIndex] = temp;
    }
    
    const foursomes = [];
    
    for (let i = 0; i < shuffledPlayers.length; i += 4) {
      const foursome = shuffledPlayers.slice(i, i + 4);
      if (foursome.length === 4) {
        // Check for Round 3 conflicts and teammate conflicts
        let hasConflict = false;
        for (let j = 0; j < foursome.length; j++) {
          for (let k = j + 1; k < foursome.length; k++) {
            if (areTeammates(foursome[j].name, foursome[k].name) || 
                areInRound3Together(foursome[j].name, foursome[k].name)) {
              hasConflict = true;
              break;
            }
          }
          if (hasConflict) break;
        }
        
        foursomes.push({
          name: `Foursome ${foursomes.length + 1}`,
          players: foursome,
          conflicts: hasConflict
        });
      }
    }
    return foursomes;
  };

  // Don't generate random foursomes - only use persistent database matchups

  // No longer needed - using persistent database matchups only

  // Helper function to check if two players played together in Round 1 (using persistent data)
  const areInRound1Together = (name1: string, name2: string) => {
    const round1Matches = matchupsByRound[1] || [];
    for (const match of round1Matches) {
      const player1Name = getPlayerName(match.player1Id);
      const player2Name = getPlayerName(match.player2Id);
      if ((player1Name === name1 && player2Name === name2) || 
          (player1Name === name2 && player2Name === name1)) {
        return true;
      }
    }
    return false;
  };

  // Generate optimized Round 2 foursomes (minimize overlaps with Round 1 and 3)
  const generateRound2Foursomes = () => {
    const teamPairs = [];
    const usedTeams = new Set<number>();
    
    // Generate all possible team pairings
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        teamPairs.push([teams[i], teams[j]]);
      }
    }
    
    // Score each team pairing based on conflicts
    const scoredPairings = teamPairs.map(([team1, team2]) => {
      const players = [
        { name: team1.player1Name, handicap: team1.player1Handicap, team: team1.teamNumber },
        { name: team1.player2Name, handicap: team1.player2Handicap, team: team1.teamNumber },
        { name: team2.player1Name, handicap: team2.player1Handicap, team: team2.teamNumber },
        { name: team2.player2Name, handicap: team2.player2Handicap, team: team2.teamNumber }
      ];
      
      let conflicts = 0;
      
      // Check all player pair combinations in this foursome
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          if (areInRound1Together(players[i].name, players[j].name)) conflicts += 2;
          if (areInRound3Together(players[i].name, players[j].name)) conflicts += 2;
          if (areTeammates(players[i].name, players[j].name)) conflicts += 0; // Teams supposed to play together in Round 2
        }
      }
      
      return {
        teams: [team1, team2],
        players,
        conflicts,
        teamIds: [team1.teamNumber, team2.teamNumber].sort()
      };
    });
    
    // Sort by conflicts (fewer conflicts = better)
    scoredPairings.sort((a, b) => a.conflicts - b.conflicts);
    
    const foursomes = [];
    const usedTeamNumbers = new Set<number>();
    
    // Select non-overlapping team pairings with minimum conflicts
    for (const pairing of scoredPairings) {
      const [team1, team2] = pairing.teams;
      if (!usedTeamNumbers.has(team1.teamNumber) && !usedTeamNumbers.has(team2.teamNumber)) {
        foursomes.push({
          name: `Foursome ${foursomes.length + 1}`,
          players: pairing.players,
          conflicts: pairing.conflicts,
          teams: `Team ${team1.teamNumber} vs Team ${team2.teamNumber}`
        });
        usedTeamNumbers.add(team1.teamNumber);
        usedTeamNumbers.add(team2.teamNumber);
      }
    }
    
    return foursomes;
  };

  // Don't generate random foursomes - only use persistent database matchups

  // Helper function to initialize Round 3 preset matchups (one-time only)
  const handleInitializeRound3 = async () => {
    if (!isNickGrossi) {
      toast({
        title: "Access Denied",
        description: "Only Nick Grossi can initialize Round 3 matchups",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await apiRequest(`/api/matchups/init-round3`, 'POST', {});
      
      if (response.ok) {
        refetchMatchups();
        toast({
          title: "Round 3 Initialized",
          description: "Round 3 preset groupings have been created successfully.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error initializing Round 3:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to initialize Round 3 matchups.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Round 1: Completely random while minimizing player overlap
  const generateRound1Matchups = () => {
    const matchups: any[] = [];
    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
    let groupNumber = 1;
    
    // Create foursomes (4 players each)
    for (let i = 0; i < shuffledPlayers.length; i += 4) {
      const foursome = shuffledPlayers.slice(i, i + 4);
      
      if (foursome.length === 4) {
        // Create 2 pairs within the foursome
        const pairs = [
          [foursome[0], foursome[1]], // Pair 1
          [foursome[2], foursome[3]]  // Pair 2
        ];
        
        pairs.forEach((pair, pairIndex) => {
          const player1 = users?.find(u => `${u.firstName} ${u.lastName}` === pair[0].name);
          const player2 = users?.find(u => `${u.firstName} ${u.lastName}` === pair[1].name);
          
          if (player1 && player2) {
            matchups.push({
              round: 1,
              groupNumber,
              player1Id: player1.id,
              player2Id: player2.id,
              player1Name: `${player1.firstName} ${player1.lastName}`,
              player2Name: `${player2.firstName} ${player2.lastName}`,
            });
          }
        });
        
        groupNumber++;
      }
    }
    
    return matchups;
  };

  // Round 2: Scramble format - teammates must be paired together
  const generateRound2Matchups = () => {
    const matchups: any[] = [];
    const teamPairs: any[] = [];
    
    // First, create pairs from each team (teammates together)
    teams?.forEach(team => {
      const teamPlayers = allPlayers.filter(p => p.team === team.teamNumber);
      
      // Create pairs within each team (2 players per pair for scramble)
      for (let i = 0; i < teamPlayers.length; i += 2) {
        if (i + 1 < teamPlayers.length) {
          teamPairs.push({
            teamId: team.teamNumber,
            players: [teamPlayers[i], teamPlayers[i + 1]]
          });
        }
      }
    });
    
    // Shuffle team pairs to create random foursomes
    const shuffledTeamPairs = [...teamPairs].sort(() => Math.random() - 0.5);
    let groupNumber = 1;
    
    // Group team pairs into foursomes (2 team pairs = 4 players)
    for (let i = 0; i < shuffledTeamPairs.length; i += 2) {
      if (i + 1 < shuffledTeamPairs.length) {
        const teamPair1 = shuffledTeamPairs[i];
        const teamPair2 = shuffledTeamPairs[i + 1];
        
        // Create matchup for first team pair
        const team1Player1 = users?.find(u => `${u.firstName} ${u.lastName}` === teamPair1.players[0].name);
        const team1Player2 = users?.find(u => `${u.firstName} ${u.lastName}` === teamPair1.players[1].name);
        
        // Create matchup for second team pair
        const team2Player1 = users?.find(u => `${u.firstName} ${u.lastName}` === teamPair2.players[0].name);
        const team2Player2 = users?.find(u => `${u.firstName} ${u.lastName}` === teamPair2.players[1].name);
        
        if (team1Player1 && team1Player2) {
          matchups.push({
            round: 2,
            groupNumber,
            player1Id: team1Player1.id,
            player2Id: team1Player2.id,
            player1Name: `${team1Player1.firstName} ${team1Player1.lastName}`,
            player2Name: `${team1Player2.firstName} ${team1Player2.lastName}`,
          });
        }
        
        if (team2Player1 && team2Player2) {
          matchups.push({
            round: 2,
            groupNumber,
            player1Id: team2Player1.id,
            player2Id: team2Player2.id,
            player1Name: `${team2Player1.firstName} ${team2Player1.lastName}`,
            player2Name: `${team2Player2.firstName} ${team2Player2.lastName}`,
          });
        }
        
        groupNumber++;
      }
    }
    
    return matchups;
  };



  // Removed handleRandomizeMatchups - now using backend tournament algorithms

  if (teamsLoading || matchupsLoading || usersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tournament Matchups & Groupings</h1>
        <p className="text-muted-foreground">Complete tournament schedule and pairings for all three rounds</p>
        
        {/* Tournament Controls - Only for Nick Grossi */}
        <div className="mt-4">
          {isNickGrossi && (
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                onClick={() => handleShuffleMatchups(1)}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Round 1
              </Button>
              <Button 
                onClick={() => handleShuffleMatchups(2)}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Round 2
              </Button>
              <Button 
                onClick={handleInitializeRound3}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Initialize Round 3
              </Button>
            </div>
          )}
          {isNickGrossi && (
            <p className="text-xs text-muted-foreground mt-2">
              Round 3 uses fixed preset groupings (Nick G, Nick C, James O, Johnny M)
            </p>
          )}
        </div>
      </div>

      {/* Round 1 - Better Ball */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Round 1 - Better Ball Format
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 29, 2025 • Deerhurst Highlands Golf Course
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display persistent Round 1 matchups from database */}
          {Object.entries(matchupsByRound[1] || {}).length > 0 ? (
            Object.entries(
              (matchupsByRound[1] || []).reduce((acc: any, matchup: any) => {
                const group = matchup.groupNumber || 1;
                if (!acc[group]) acc[group] = [];
                acc[group].push(matchup);
                return acc;
              }, {})
            ).map(([groupNum, groupMatchups]: [string, any]) => (
              <div key={`round1-group-${groupNum}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foursome {groupNum}
                </h3>
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupMatchups.map((matchup: any, matchupIndex: number) => (
                      <div key={`round1-matchup-${matchup.id}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          Pair {matchupIndex + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{getPlayerName(matchup.player1Id)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPlayerHandicap(matchup.player1Id)} hcp
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{getPlayerName(matchup.player2Id)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPlayerHandicap(matchup.player2Id)} hcp
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Round 1 matchups generated yet.</p>
              {isNickGrossi && <p className="text-sm">Use the "Shuffle Round 1" button to create matchups.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round 2 - Scramble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Round 2 - Scramble Format
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 30, 2025 • Deerhurst Highlands Golf Course
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display persistent Round 2 matchups from database */}
          {Object.entries(matchupsByRound[2] || {}).length > 0 ? (
            Object.entries(
              (matchupsByRound[2] || []).reduce((acc: any, matchup: any) => {
                const group = matchup.groupNumber || 1;
                if (!acc[group]) acc[group] = [];
                acc[group].push(matchup);
                return acc;
              }, {})
            ).map(([groupNum, groupMatchups]: [string, any]) => (
              <div key={`round2-group-${groupNum}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foursome {groupNum}
                </h3>
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupMatchups.map((matchup: any, matchupIndex: number) => (
                      <div key={`round2-matchup-${matchup.id}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          Team {matchupIndex + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{getPlayerName(matchup.player1Id)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPlayerHandicap(matchup.player1Id)} hcp
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{getPlayerName(matchup.player2Id)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPlayerHandicap(matchup.player2Id)} hcp
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Round 2 matchups generated yet.</p>
              {isNickGrossi && <p className="text-sm">Use the "Shuffle Round 2" button to create matchups.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persistent Database Matchups - All Rounds */}
      {Object.keys(matchupsByRound).map(round => (
        <Card key={round}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Round {round} - Database Matchups
              {isNickGrossi && (parseInt(round) === 1 || parseInt(round) === 2) && (
                <Button 
                  onClick={() => handleShuffleMatchups(parseInt(round))}
                  variant="outline" 
                  size="sm"
                  className="ml-auto"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  Shuffle Round {round}
                </Button>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Persistent matchups stored in database • Shared across all users
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {matchupsByRound[round].length > 0 ? (
              matchupsByRound[round].map((matchup: any, index: number) => (
                <div key={matchup.id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-semibold">
                        Group {matchup.groupNumber}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {getPlayerName(matchup.player1Id)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({getPlayerHandicap(matchup.player1Id)} hcp)
                        </span>
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {getPlayerName(matchup.player2Id)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({getPlayerHandicap(matchup.player2Id)} hcp)
                        </span>
                      </div>
                    </div>
                    {matchup.player1Score !== null && matchup.player2Score !== null && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {matchup.player1Score} - {matchup.player2Score}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {matchup.createdAt && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(matchup.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No matchups created for Round {round} yet.
                {isNickGrossi && (
                  <div className="mt-2">
                    <Button 
                      onClick={() => handleShuffleMatchups(parseInt(round))}
                      variant="outline" 
                      size="sm"
                    >
                      <Shuffle className="h-4 w-4 mr-1" />
                      Create Round {round} Matchups
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

    </div>
  );
}