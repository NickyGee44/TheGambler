import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Beer, Target, Clock, Users, Medal, Zap, Plus } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { GolfRelay } from "@/components/GolfRelay";

interface BoozelympicsGame {
  id: number;
  name: string;
  description: string;
  supplies: string;
  playersNeeded: string;
  timeEstimate: string;
  isActive: boolean;
}

interface BoozelympicsMatch {
  id: number;
  gameId: number;
  player1Id?: number;
  player2Id?: number;
  team1Id?: number;
  team2Id?: number;
  winnerId?: number;
  winnerTeamId?: number;
  points: number;
  bonusPoints: number;
  mvpId?: number;
  matchData: any;
  notes?: string;
  createdAt: string;
}

interface LeaderboardEntry {
  teamId: number;
  points: number;
  wins: number;
  team: {
    id: number;
    teamNumber: number;
    player1Name: string;
    player2Name: string;
  };
}

export default function Boozelympics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaderboard");

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/boozelympics/games'],
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/boozelympics/matches'],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/boozelympics/leaderboard'],
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: Omit<BoozelympicsGame, 'id' | 'isActive'>) => {
      return await apiRequest('POST', '/api/boozelympics/games', gameData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boozelympics/games'] });
    },
  });

  const isAdmin = user && `${user.firstName} ${user.lastName}` === 'Nick Grossi';

  const defaultGames = [
    {
      name: "Beer Pong",
      description: "Standard 10-cup pong; teams rotate.",
      supplies: "Cups, ping pong balls",
      playersNeeded: "2 vs 2",
      timeEstimate: "10-15 min"
    },
    {
      name: "Beer Dice",
      description: "Dice game on a table (throw & chug).",
      supplies: "Dice, table",
      playersNeeded: "2 vs 2", 
      timeEstimate: "10 min"
    },
    {
      name: "Baseball Booze",
      description: "4 bases, cups on each. Like pong + flip cup.",
      supplies: "Cups, table",
      playersNeeded: "4 per team",
      timeEstimate: "15 min"
    },
    {
      name: "Spikeball",
      description: "Competitive backyard game",
      supplies: "Spikeball kit",
      playersNeeded: "2 vs 2",
      timeEstimate: "10 min"
    },
    {
      name: "Golf Relay",
      description: "Obstacle race w/ clubs, chugging, trick shots",
      supplies: "Clubs, balls, cones",
      playersNeeded: "1 vs 1",
      timeEstimate: "20 min"
    },
    {
      name: "Flippy Cup",
      description: "Speed round cup flip game",
      supplies: "Cups, table",
      playersNeeded: "Full team",
      timeEstimate: "10 min"
    }
  ];

  const initializeDefaultGames = async () => {
    for (const game of defaultGames) {
      await createGameMutation.mutateAsync(game);
    }
  };

  const getGameIcon = (gameName: string) => {
    switch (gameName.toLowerCase()) {
      case 'beer pong':
        return <Target className="h-5 w-5" />;
      case 'beer dice':
        return <Zap className="h-5 w-5" />;
      case 'golf relay':
        return <Medal className="h-5 w-5" />;
      case 'spikeball':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Beer className="h-5 w-5" />;
    }
  };

  if (gamesLoading || matchesLoading || leaderboardLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Beer className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-foreground">🍻 Boozelympics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Beer className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">🍻 Boozelympics</h1>
            <p className="text-muted-foreground">Competitive drinking games for the Gambler Cup 2025</p>
          </div>
        </div>
        {isAdmin && games.length === 0 && (
          <Button onClick={initializeDefaultGames} disabled={createGameMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Initialize Games
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="games">
            <Beer className="h-4 w-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger value="golf-relay">
            <Medal className="h-4 w-4 mr-2" />
            Golf Relay
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Match History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Boozelympics Leaderboard
              </CardTitle>
              <CardDescription>Team standings across all drinking games</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Beer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No matches played yet. Start a game to see the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                    <div
                      key={entry.teamId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                          {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                          {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                          <span className="font-bold text-lg">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold">Team {entry.team.teamNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.team.player1Name} & {entry.team.player2Name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{entry.points} pts</div>
                        <div className="text-sm text-muted-foreground">{entry.wins} wins</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game: BoozelympicsGame) => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getGameIcon(game.name)}
                    {game.name}
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{game.playersNeeded}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{game.timeEstimate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{game.supplies}</span>
                    </div>
                    {isAdmin && (
                      <Button className="w-full mt-4" variant="outline">
                        Log Match
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="golf-relay" className="mt-6">
          <GolfRelay />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Match History
              </CardTitle>
              <CardDescription>All completed Boozelympics matches</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No matches played yet. Start playing to see match history!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match: BoozelympicsMatch) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <div className="font-semibold">Game #{match.gameId}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{match.points} pts</Badge>
                        {match.bonusPoints > 0 && (
                          <Badge variant="outline" className="ml-2">+{match.bonusPoints} bonus</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}