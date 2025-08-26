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
  const [randomSeed, setRandomSeed] = useState(0); // State to force re-randomization
  const { toast } = useToast();
  
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: persistentMatchups = [], isLoading: matchupsLoading } = useQuery({
    queryKey: ['/api/matchups'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: currentUser } = useQuery({
    queryKey: ['/api/user'],
  });

  // Shuffle matchups mutation (Nick Grossi only)
  const shuffleMatchupsMutation = useMutation({
    mutationFn: async ({ round, matchups: shuffledMatchups }: { round: number; matchups: any[] }) => {
      return await apiRequest('POST', '/api/matchups/shuffle', { round, matchups: shuffledMatchups });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matchups'] });
      toast({
        title: "Matchups Shuffled",
        description: "New tournament matchups have been generated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Shuffle Failed",
        description: error?.message || "Only Nick Grossi can shuffle matchups",
        variant: "destructive",
      });
    },
  });

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
    // Use randomSeed to make shuffling deterministic for the current seed
    const shuffledPlayers = [...allPlayers].sort(() => (Math.sin(randomSeed + Math.random()) - 0.5));
    
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

  const round1Foursomes = allPlayers.length >= 16 ? generateRound1Foursomes() : [];

  // Track Round 1 pairings to avoid conflicts in Round 2
  const round1Pairings = new Set<string>();
  round1Foursomes.forEach(foursome => {
    for (let i = 0; i < foursome.players.length; i++) {
      for (let j = i + 1; j < foursome.players.length; j++) {
        const pair = [foursome.players[i].name, foursome.players[j].name].sort().join('|');
        round1Pairings.add(pair);
      }
    }
  });

  // Helper function to check if two players played together in Round 1
  const areInRound1Together = (name1: string, name2: string) => {
    const pair = [name1, name2].sort().join('|');
    return round1Pairings.has(pair);
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

  const round2Foursomes = teams.length >= 4 ? generateRound2Foursomes() : [];

  // Helper function to shuffle matchups for Nick Grossi
  const handleShuffleMatchups = async (round: number) => {
    if (!isNickGrossi) {
      toast({
        title: "Access Denied",
        description: "Only Nick Grossi can shuffle matchups",
        variant: "destructive",
      });
      return;
    }
    
    // Generate new random matchups for the specified round
    const newMatchups = generateRandomMatchupsForRound(round);
    await shuffleMatchupsMutation.mutateAsync({ round, matchups: newMatchups });
  };

  const generateRandomMatchupsForRound = (round: number) => {
    // Create matchups based on teams and players
    const matchups = [];
    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        const player1 = users.find(u => `${u.firstName} ${u.lastName}` === shuffledPlayers[i].name);
        const player2 = users.find(u => `${u.firstName} ${u.lastName}` === shuffledPlayers[i + 1].name);
        
        if (player1 && player2) {
          matchups.push({
            round,
            groupNumber: Math.floor(i / 2) + 1,
            player1Id: player1.id,
            player2Id: player2.id,
            player1Data: JSON.stringify({ name: player1.firstName + ' ' + player1.lastName, userId: player1.id }),
            player2Data: JSON.stringify({ name: player2.firstName + ' ' + player2.lastName, userId: player2.id }),
          });
        }
      }
    }
    return matchups;
  };



  // Function to randomize matchups
  const handleRandomizeMatchups = () => {
    setRandomSeed(Math.random() * 1000);
  };

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
        
        {/* Randomize Button - Only for Nick Grossi */}
        <div className="mt-4">
          {isNickGrossi && (
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => handleShuffleMatchups(1)}
                disabled={shuffleMatchupsMutation.isPending}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Round 1
              </Button>
              <Button 
                onClick={() => handleShuffleMatchups(2)}
                disabled={shuffleMatchupsMutation.isPending}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Round 2
              </Button>
              <Button 
                onClick={() => handleShuffleMatchups(3)}
                disabled={shuffleMatchupsMutation.isPending}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Round 3
              </Button>
            </div>
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
          {round1Foursomes.map((foursome, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {foursome.name}
              </h3>
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {foursome.players.map((player, playerIndex) => (
                    <div key={playerIndex} className="flex items-center justify-between p-2 bg-white dark:bg-green-900 rounded">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Team {player.team}</Badge>
                        <span className="text-sm text-muted-foreground">({player.handicap} hcp)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {index < round1Foursomes.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
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
          {round2Foursomes.map((foursome, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {foursome.name}
                {foursome.conflicts !== undefined && (
                  <Badge variant={foursome.conflicts > 0 ? "destructive" : "secondary"} className="ml-2 text-xs">
                    {foursome.conflicts === 0 ? "Optimized" : `${foursome.conflicts} Conflicts`}
                  </Badge>
                )}
                {foursome.teams && (
                  <span className="text-xs text-muted-foreground ml-2">({foursome.teams})</span>
                )}
              </h3>
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {foursome.players.map((player, playerIndex) => (
                    <div key={playerIndex} className="flex items-center justify-between p-2 bg-white dark:bg-blue-900 rounded">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Team {player.team}</Badge>
                        <span className="text-sm text-muted-foreground">({player.handicap} hcp)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {index < round2Foursomes.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Persistent Database Matchups - All Rounds */}
      {Object.keys(matchupsByRound).map(round => (
        <Card key={round}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Round {round} - Database Matchups
              {isNickGrossi && (
                <Button 
                  onClick={() => handleShuffleMatchups(parseInt(round))}
                  disabled={shuffleMatchupsMutation.isPending}
                  variant="outline" 
                  size="sm"
                  className="ml-auto"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  Shuffle
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
                      disabled={shuffleMatchupsMutation.isPending}
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