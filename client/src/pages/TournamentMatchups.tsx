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

  // Group teams into foursomes for Rounds 1 & 2 (based on team numbers)
  const round1Foursomes = [
    { teams: teams.filter(t => [1, 2, 3, 4].includes(t.teamNumber)) },
    { teams: teams.filter(t => [5, 6, 7, 8].includes(t.teamNumber)) }
  ];

  const round2Foursomes = [
    { teams: teams.filter(t => [1, 2, 3, 4].includes(t.teamNumber)) },
    { teams: teams.filter(t => [5, 6, 7, 8].includes(t.teamNumber)) }
  ];

  // Group Round 3 matchups by hole segments
  const round3Segments = {
    '1-6': matchups.filter(m => m.hole_segment === '1-6'),
    '7-12': matchups.filter(m => m.hole_segment === '7-12'),
    '13-18': matchups.filter(m => m.hole_segment === '13-18')
  };

  const getPlayerName = (userId: number) => {
    const user = userMap[userId];
    return user ? `${user.firstName} ${user.lastName}` : `Player ${userId}`;
  };

  const getPlayerHandicap = (userId: number) => {
    const user = userMap[userId];
    return user ? user.handicap : 0;
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
                Foursome {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foursome.teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Team {team.teamNumber}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Combined Hcp: {team.totalHandicap}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{team.player1Name} ({team.player1Handicap} hcp)</div>
                      <div className="font-medium">{team.player2Name} ({team.player2Handicap} hcp)</div>
                    </div>
                  </div>
                ))}
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
                Foursome {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foursome.teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Team {team.teamNumber}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Team Hcp: {Math.round(team.totalHandicap * 0.6)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{team.player1Name} ({team.player1Handicap} hcp)</div>
                      <div className="font-medium">{team.player2Name} ({team.player2Handicap} hcp)</div>
                    </div>
                  </div>
                ))}
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
        <CardContent className="space-y-8">
          {Object.entries(round3Segments).map(([segment, matches]) => (
            <div key={segment}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" />
                Holes {segment}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => {
                  const player1Name = getPlayerName(match.player1_id);
                  const player2Name = getPlayerName(match.player2_id);
                  const player1Hcp = getPlayerHandicap(match.player1_id);
                  const player2Hcp = getPlayerHandicap(match.player2_id);
                  const strokeRecipient = match.stroke_recipient_id ? getPlayerName(match.stroke_recipient_id) : null;
                  
                  return (
                    <div key={match.id} className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
                      <div className="text-center mb-3">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Match {match.id}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{player1Name}</span>
                          <span className="text-sm text-muted-foreground">({player1Hcp} hcp)</span>
                        </div>
                        <div className="text-center text-xs text-muted-foreground">vs</div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{player2Name}</span>
                          <span className="text-sm text-muted-foreground">({player2Hcp} hcp)</span>
                        </div>
                        {match.strokes_given > 0 && strokeRecipient && (
                          <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900 rounded text-sm">
                            <div className="font-medium text-amber-800 dark:text-amber-200">
                              {strokeRecipient} gets {match.strokes_given} stroke{match.strokes_given > 1 ? 's' : ''}
                            </div>
                            {match.stroke_holes.length > 0 && (
                              <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                On holes: {match.stroke_holes.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {segment !== '13-18' && <Separator className="mt-8" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Stroke allocations calculated using 6-hole match play formula: (Player Handicap ÷ 3)</p>
      </div>
    </div>
  );
}