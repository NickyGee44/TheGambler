import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Play, Pause, RotateCcw, Plus, Users } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface RegisteredPlayer {
  name: string;
  userId: number;
}

interface Team {
  id: number;
  teamNumber: number;
  player1Name: string;
  player2Name: string;
}

interface GolfRelayMatch {
  id: number;
  playerId: number;
  timeMs: number;
  notes?: string;
  createdAt: string;
}

interface BoozelympicsMatch {
  id: number;
  gameId: number;
  team1Id?: number;
  team2Id?: number;
  winnerTeamId?: number;
  points: number;
  notes?: string;
  createdAt: string;
}

interface LeaderboardEntry {
  playerId: number;
  wins: number;
  totalMatches: number;
  bestTime: number | null;
  user: User;
  winRate: string;
}

export function GolfRelay() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  
  // Match logging state
  const [showLogMatch, setShowLogMatch] = useState(false);
  const [team1Id, setTeam1Id] = useState<number>(0);
  const [team2Id, setTeam2Id] = useState<number>(0);
  const [winnerTeamId, setWinnerTeamId] = useState<number>(0);

  const { data: registeredPlayers = [] } = useQuery<RegisteredPlayer[]>({
    queryKey: ['/api/registered-players'],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: relayMatches = [] } = useQuery<GolfRelayMatch[]>({
    queryKey: ['/api/golf-relay/matches'],
  });

  const { data: golfRelayGame } = useQuery({
    queryKey: ['/api/boozelympics/games'],
    select: (games: any[]) => games.find(g => g.name === 'Golf Relay')
  });

  const { data: teamMatches = [] } = useQuery<BoozelympicsMatch[]>({
    queryKey: ['/api/boozelympics/matches'],
    select: (matches: any[]) => matches.filter(m => m.gameId === golfRelayGame?.id)
  });

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  const saveTimeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/golf-relay/matches', {
        playerId: selectedPlayer,
        timeMs: time,
        notes: `${formatTime(time)} - Golf Relay completion`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/golf-relay/matches'] });
      resetTimer();
      setSelectedPlayer(0);
    },
  });

  const logTeamMatchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/boozelympics/matches', {
        gameId: golfRelayGame?.id,
        team1Id,
        team2Id,
        winnerTeamId,
        points: 3,
        notes: `Golf Relay match between teams`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boozelympics/matches'] });
      setShowLogMatch(false);
      setTeam1Id(0);
      setTeam2Id(0);
      setWinnerTeamId(0);
    },
  });

  // Calculate leaderboard from individual times
  const leaderboard = registeredPlayers.map(player => {
    const userMatches = relayMatches.filter(m => m.playerId === player.userId);
    const bestTime = userMatches.length > 0 ? Math.min(...userMatches.map(m => m.timeMs)) : null;
    return {
      player,
      totalRuns: userMatches.length,
      bestTime,
      averageTime: userMatches.length > 0 ? 
        Math.round(userMatches.reduce((sum, m) => sum + m.timeMs, 0) / userMatches.length) : null
    };
  }).filter(entry => entry.totalRuns > 0)
    .sort((a, b) => {
      if (!a.bestTime) return 1;
      if (!b.bestTime) return -1;
      return a.bestTime - b.bestTime;
    });

  return (
    <div className="space-y-6">
      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-500" />
            Golf Relay Timer
          </CardTitle>
          <CardDescription>Time individual player runs through the Golf Relay course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div>
            <Label>Select Player</Label>
            <Select value={selectedPlayer.toString()} onValueChange={(value) => setSelectedPlayer(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose player to time" />
              </SelectTrigger>
              <SelectContent>
                {registeredPlayers.map((player) => (
                  <SelectItem key={player.userId} value={player.userId.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold mb-4 font-mono">
              {formatTime(time)}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={startTimer}
                disabled={isRunning || !selectedPlayer}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
              <Button
                onClick={stopTimer}
                disabled={!isRunning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            {time > 0 && selectedPlayer && !isRunning && (
              <Button
                onClick={() => saveTimeMutation.mutate()}
                disabled={saveTimeMutation.isPending}
                className="mt-4"
              >
                Save Time for {registeredPlayers.find(p => p.userId === selectedPlayer)?.name.split(' ')[0]}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Match Logging */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Team vs Team Matches
            </CardTitle>
            <CardDescription>Log results from team competitions</CardDescription>
          </div>
          <Button onClick={() => setShowLogMatch(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Match
          </Button>
        </CardHeader>
        <CardContent>
          {showLogMatch && (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
              <h4 className="font-semibold">Log Team Match Result</h4>
              <div className="grid md:grid-cols-3 gap-4">
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
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => logTeamMatchMutation.mutate()}
                  disabled={!team1Id || !team2Id || !winnerTeamId || logTeamMatchMutation.isPending}
                >
                  {logTeamMatchMutation.isPending ? 'Saving...' : 'Save Match'}
                </Button>
                <Button variant="outline" onClick={() => setShowLogMatch(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Recent Team Matches */}
          <div className="space-y-2">
            <h4 className="font-semibold">Recent Team Matches</h4>
            {teamMatches.length === 0 ? (
              <p className="text-muted-foreground">No team matches logged yet.</p>
            ) : (
              <div className="space-y-2">
                {teamMatches.slice(0, 5).map((match) => {
                  const team1 = teams.find(t => t.id === match.team1Id);
                  const team2 = teams.find(t => t.id === match.team2Id);
                  const winner = teams.find(t => t.id === match.winnerTeamId);
                  return (
                    <div key={match.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="text-sm">
                        <span className="font-medium">Team {team1?.teamNumber}</span> vs{' '}
                        <span className="font-medium">Team {team2?.teamNumber}</span>
                      </div>
                      <div className="text-sm">
                        Winner: <span className="font-semibold text-green-600">Team {winner?.teamNumber}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Individual Times Leaderboard
          </CardTitle>
          <CardDescription>Best individual completion times</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No times recorded yet. Start timing runs!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const [firstName, ...lastNameParts] = entry.player.name.split(' ');
                const lastName = lastNameParts.join(' ');
                return (
                  <div
                    key={entry.player.userId}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <ProfilePicture
                        firstName={firstName}
                        lastName={lastName}
                        className="h-10 w-10"
                      />
                      <div>
                        <div className="font-semibold">{entry.player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.totalRuns} runs
                        </div>
                      </div>
                    </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {entry.bestTime ? formatTime(entry.bestTime) : 'N/A'}
                    </div>
                    {entry.averageTime && (
                      <div className="text-sm text-muted-foreground">
                        Avg: {formatTime(entry.averageTime)}
                      </div>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}