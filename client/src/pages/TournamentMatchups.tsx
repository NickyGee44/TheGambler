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

  // Create all players list for randomization
  const allPlayers = teams.flatMap(team => [
    { name: team.player1Name, handicap: team.player1Handicap, team: team.teamNumber },
    { name: team.player2Name, handicap: team.player2Handicap, team: team.teamNumber }
  ]).filter(p => p.name);

  // Round 1 foursomes (strategically randomized to minimize Round 3 overlaps)
  const round1Foursomes = [
    {
      name: "Foursome 1",
      players: [
        { name: "Nick Grossi", handicap: 16, team: 1 },
        { name: "Spencer Reid", handicap: 16, team: 6 },
        { name: "Bailey Carlson", handicap: 17, team: 2 },
        { name: "Ben Braun", handicap: 6, team: 0 }
      ]
    },
    {
      name: "Foursome 2", 
      players: [
        { name: "Connor Patterson", handicap: 4, team: 1 },
        { name: "Sye Ellard", handicap: 18, team: 7 },
        { name: "Jeffrey Reiner", handicap: 9, team: 6 },
        { name: "James Ogilvie", handicap: 17, team: 7 }
      ]
    },
    {
      name: "Foursome 3",
      players: [
        { name: "Christian Hauck", handicap: 5, team: 2 },
        { name: "Nick Cook", handicap: 12, team: 5 },
        { name: "Will Bibbings", handicap: 5, team: 4 },
        { name: "Kevin Durco", handicap: 3, team: 5 }
      ]
    },
    {
      name: "Foursome 4",
      players: [
        { name: "Jordan Kreller", handicap: 6, team: 8 },
        { name: "Erik Boudreau", handicap: 10, team: 4 },
        { name: "Nic Huxley", handicap: 15, team: 3 },
        { name: "Johnny Magnatta", handicap: 11, team: 8 }
      ]
    }
  ];

  // Round 2 foursomes: 2 teams per foursome (optimized to minimize Round 1 & 3 overlaps)
  const round2Foursomes = [
    { 
      name: "Foursome 1", 
      players: [
        { name: "Jordan Kreller", handicap: 6, team: 8 },
        { name: "Johnny Magnatta", handicap: 11, team: 8 },
        { name: "Christian Hauck", handicap: 5, team: 2 },
        { name: "Bailey Carlson", handicap: 17, team: 2 }
      ]
    },
    { 
      name: "Foursome 2", 
      players: [
        { name: "Nick Cook", handicap: 12, team: 5 },
        { name: "Kevin Durco", handicap: 3, team: 5 },
        { name: "Sye Ellard", handicap: 18, team: 7 },
        { name: "James Ogilvie", handicap: 17, team: 7 }
      ]
    },
    { 
      name: "Foursome 3", 
      players: [
        { name: "Nick Grossi", handicap: 16, team: 1 },
        { name: "Connor Patterson", handicap: 4, team: 1 },
        { name: "Spencer Reid", handicap: 16, team: 6 },
        { name: "Jeffrey Reiner", handicap: 9, team: 6 }
      ]
    },
    { 
      name: "Foursome 4", 
      players: [
        { name: "Erik Boudreau", handicap: 10, team: 4 },
        { name: "Will Bibbings", handicap: 5, team: 4 },
        { name: "Nic Huxley", handicap: 15, team: 3 },
        { name: "Ben Braun", handicap: 6, team: 0 }
      ]
    }
  ];

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
                { name: "Ben Braun", handicap: 6 }
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