import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Beer, Target, Clock, Users, Medal, Zap, Plus, X } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { GolfRelay } from "@/components/GolfRelay";
import LoadingPage from "@/components/LoadingPage";

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

interface Team {
  id: number;
  teamNumber: number;
  player1Name: string;
  player2Name: string;
}

export default function Boozelympics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaderboard");
  
  // Match logging state
  const [showLogMatch, setShowLogMatch] = useState<number | null>(null);
  const [team1Id, setTeam1Id] = useState<number>(0);
  const [team2Id, setTeam2Id] = useState<number>(0);
  const [winnerTeamId, setWinnerTeamId] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  
  // Baseball Booze specific state (8 players - 4 per team)
  const [team1Player1Id, setTeam1Player1Id] = useState<number>(0);
  const [team1Player2Id, setTeam1Player2Id] = useState<number>(0);
  const [team1Player3Id, setTeam1Player3Id] = useState<number>(0);
  const [team1Player4Id, setTeam1Player4Id] = useState<number>(0);
  const [team2Player1Id, setTeam2Player1Id] = useState<number>(0);
  const [team2Player2Id, setTeam2Player2Id] = useState<number>(0);
  const [team2Player3Id, setTeam2Player3Id] = useState<number>(0);
  const [team2Player4Id, setTeam2Player4Id] = useState<number>(0);

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/boozelympics/games'],
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/boozelympics/matches'],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/boozelympics/leaderboard'],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: registeredPlayers = [] } = useQuery({
    queryKey: ['/api/registered-players'],
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: Omit<BoozelympicsGame, 'id' | 'isActive'>) => {
      return await apiRequest('POST', '/api/boozelympics/games', gameData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boozelympics/games'] });
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      return await apiRequest('POST', '/api/boozelympics/matches', matchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boozelympics/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/boozelympics/leaderboard'] });
      setShowLogMatch(null);
      setTeam1Id(0);
      setTeam2Id(0);
      setWinnerTeamId(0);
      setNotes("");
      // Reset Baseball Booze specific state
      setTeam1Player1Id(0);
      setTeam1Player2Id(0);
      setTeam1Player3Id(0);
      setTeam1Player4Id(0);
      setTeam2Player1Id(0);
      setTeam2Player2Id(0);
      setTeam2Player3Id(0);
      setTeam2Player4Id(0);
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

  const isMainLoading = gamesLoading || matchesLoading || leaderboardLoading;
  
  if (isMainLoading) {
    return <LoadingPage message="Loading Boozelympics..." fullScreen />;
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
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setShowLogMatch(game.id)}
                    >
                      Log Match
                    </Button>
                    
                    {/* Match logging dropdown */}
                    {showLogMatch === game.id && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Log {game.name} Match</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowLogMatch(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Baseball Booze requires 8 individual players (4 per team) */}
                          {game.name === "Baseball Booze" ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="font-semibold">Team 1 Players (4 players)</Label>
                                  <div className="space-y-2">
                                    <Select value={team1Player1Id.toString()} onValueChange={(value) => setTeam1Player1Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 1" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team1Player2Id.toString()} onValueChange={(value) => setTeam1Player2Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 2" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team1Player3Id.toString()} onValueChange={(value) => setTeam1Player3Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 3" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team1Player4Id.toString()} onValueChange={(value) => setTeam1Player4Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 4" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="font-semibold">Team 2 Players (4 players)</Label>
                                  <div className="space-y-2">
                                    <Select value={team2Player1Id.toString()} onValueChange={(value) => setTeam2Player1Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 1" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team2Player2Id.toString()} onValueChange={(value) => setTeam2Player2Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 2" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team2Player3Id.toString()} onValueChange={(value) => setTeam2Player3Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 3" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select value={team2Player4Id.toString()} onValueChange={(value) => setTeam2Player4Id(parseInt(value))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select player 4" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {registeredPlayers.map((player: any) => (
                                          <SelectItem key={player.userId} value={player.userId.toString()}>
                                            {player.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Winning Team</Label>
                                <Select value={winnerTeamId.toString()} onValueChange={(value) => setWinnerTeamId(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select winning team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(team1Player1Id && team1Player2Id && team1Player3Id && team1Player4Id) && (
                                      <SelectItem value="1">
                                        Team 1: {registeredPlayers.find((p: any) => p.userId === team1Player1Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team1Player2Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team1Player3Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team1Player4Id)?.name}
                                      </SelectItem>
                                    )}
                                    {(team2Player1Id && team2Player2Id && team2Player3Id && team2Player4Id) && (
                                      <SelectItem value="2">
                                        Team 2: {registeredPlayers.find((p: any) => p.userId === team2Player1Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team2Player2Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team2Player3Id)?.name}, {registeredPlayers.find((p: any) => p.userId === team2Player4Id)?.name}
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            /* Standard team vs team interface */
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Team 1</Label>
                                <Select value={team1Id.toString()} onValueChange={(value) => setTeam1Id(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team 1" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teams.map((team) => (
                                      <SelectItem key={team.id} value={team.id.toString()}>
                                        Team {team.teamNumber}: {team.player1Name} & {team.player2Name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>Team 2</Label>
                                <Select value={team2Id.toString()} onValueChange={(value) => setTeam2Id(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team 2" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {teams.map((team) => (
                                      <SelectItem key={team.id} value={team.id.toString()}>
                                        Team {team.teamNumber}: {team.player1Name} & {team.player2Name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          
                          {/* Winner selection for non-Baseball Booze games */}
                          {game.name !== "Baseball Booze" && (
                            <div>
                              <Label>Winner</Label>
                              <Select value={winnerTeamId.toString()} onValueChange={(value) => setWinnerTeamId(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select winner" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[team1Id, team2Id].filter(Boolean).map((teamId) => {
                                    const team = teams.find(t => t.id === teamId);
                                    return team ? (
                                      <SelectItem key={team.id} value={team.id.toString()}>
                                        Team {team.teamNumber}: {team.player1Name} & {team.player2Name}
                                      </SelectItem>
                                    ) : null;
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div>
                            <Label>Notes (Optional)</Label>
                            <Textarea 
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Any additional notes about the match..."
                              className="resize-none"
                              rows={2}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                if (game.name === "Baseball Booze") {
                                  // For Baseball Booze, we need to determine the actual team IDs from the selected players
                                  // This will require some logic to map players to teams for scoring
                                  const teamPlayerData = {
                                    team1Players: [team1Player1Id, team1Player2Id, team1Player3Id, team1Player4Id],
                                    team2Players: [team2Player1Id, team2Player2Id, team2Player3Id, team2Player4Id],
                                    winnerTeam: winnerTeamId
                                  };
                                  
                                  createMatchMutation.mutate({
                                    gameId: game.id,
                                    team1Id: null, // Will be determined by server from player mapping
                                    team2Id: null, // Will be determined by server from player mapping
                                    winnerTeamId: parseInt(winnerTeamId.toString()),
                                    points: 3,
                                    bonusPoints: 0,
                                    notes: notes || `${game.name} match result`,
                                    matchData: teamPlayerData
                                  });
                                } else {
                                  createMatchMutation.mutate({
                                    gameId: game.id,
                                    team1Id,
                                    team2Id,
                                    winnerTeamId,
                                    points: 3,
                                    bonusPoints: 0,
                                    notes: notes || `${game.name} match result`
                                  });
                                }
                              }}
                              disabled={
                                game.name === "Baseball Booze" 
                                  ? (!team1Player1Id || !team1Player2Id || !team1Player3Id || !team1Player4Id || !team2Player1Id || !team2Player2Id || !team2Player3Id || !team2Player4Id || !winnerTeamId || createMatchMutation.isPending)
                                  : (!team1Id || !team2Id || !winnerTeamId || createMatchMutation.isPending)
                              }
                              className="flex-1"
                            >
                              {createMatchMutation.isPending ? 'Saving...' : 'Save Match'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowLogMatch(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
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