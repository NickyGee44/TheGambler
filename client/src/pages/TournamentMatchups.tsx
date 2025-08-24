import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, Trophy, Target } from "lucide-react";

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
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: matchups = [], isLoading: matchupsLoading } = useQuery<MatchPlayMatch[]>({
    queryKey: ['/api/matchups'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

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

  // Track Round 3 pairings to avoid conflicts
  const round3Pairings = new Set<string>();
  matchups.forEach(match => {
    const player1Name = getPlayerName(match.player1_id);
    const player2Name = getPlayerName(match.player2_id);
    if (player1Name && player2Name) {
      const pair = [player1Name, player2Name].sort().join('|');
      round3Pairings.add(pair);
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
    const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);
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

  // Group Round 3 matchups by hole segments
  const round3Segments = {
    '1-6': matchups.filter(m => m.hole_segment === '1-6'),
    '7-12': matchups.filter(m => m.hole_segment === '7-12'),
    '13-18': matchups.filter(m => m.hole_segment === '13-18')
  };

  // Create player ID to name mapping from teams data
  const playerIdToNameMap: Record<number, string> = {};
  const playerIdToHandicapMap: Record<number, number> = {};
  
  // Map known user IDs to names
  teams.forEach(team => {
    // Find users for this team
    const player1User = users.find(u => `${u.firstName} ${u.lastName}` === team.player1Name);
    const player2User = users.find(u => `${u.firstName} ${u.lastName}` === team.player2Name);
    
    if (player1User) {
      playerIdToNameMap[player1User.id] = team.player1Name;
      playerIdToHandicapMap[player1User.id] = team.player1Handicap;
    }
    if (player2User) {
      playerIdToNameMap[player2User.id] = team.player2Name;
      playerIdToHandicapMap[player2User.id] = team.player2Handicap;
    }
  });

  const getPlayerName = (userId: number) => {
    return playerIdToNameMap[userId] || `Player ${userId}`;
  };

  const getPlayerHandicap = (userId: number) => {
    return playerIdToHandicapMap[userId] || 0;
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

      {/* Round 3 - Match Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" />
            Round 3 - Match Play Format
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 31, 2025 • Muskoka Bay Golf Club
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              name: "Group 1",
              players: [
                { name: "Jordan Kreller", handicap: 6 },
                { name: "Christian Hauck", handicap: 5 }, 
                { name: "Connor Patterson", handicap: 4 },
                { name: "Mystery Player", handicap: 6 }
              ]
            },
            {
              name: "Group 2", 
              players: [
                { name: "Spencer Reid", handicap: 16 },
                { name: "Jeffrey Reiner", handicap: 9 },
                { name: "Kevin Durco", handicap: 3 },
                { name: "Erik Boudreau", handicap: 10 }
              ]
            },
            {
              name: "Group 3",
              players: [
                { name: "Sye Ellard", handicap: 18 },
                { name: "Will Bibbings", handicap: 5 },
                { name: "Nic Huxley", handicap: 15 },
                { name: "Bailey Carlson", handicap: 17 }
              ]
            },
            {
              name: "Group 4",
              players: [
                { name: "Nick Grossi", handicap: 16 },
                { name: "Nick Cook", handicap: 12 },
                { name: "Johnny Magnatta", handicap: 11 },
                { name: "James Ogilvie", handicap: 17 }
              ]
            }
          ].map((group, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {group.name}
              </h3>
              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.players.map((player, playerIndex) => (
                    <div key={playerIndex} className="flex items-center justify-between p-2 bg-white dark:bg-amber-900 rounded">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-muted-foreground">({player.handicap} hcp)</span>
                    </div>
                  ))}
                </div>
              </div>
              {index < 3 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}