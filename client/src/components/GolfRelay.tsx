import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Target, Users, Play, Plus, Zap } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface GolfRelayMatch {
  id: number;
  player1Id: number;
  player2Id: number;
  wedgeDistance1: number; // in feet * 10
  flipMisses1: number;
  pongMisses1: number;
  runTime1: number; // in milliseconds
  totalTime1: number;
  wedgeDistance2: number;
  flipMisses2: number;
  pongMisses2: number;
  runTime2: number;
  totalTime2: number;
  winnerId: number;
  tournamentYear: number;
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
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    player1Id: 0,
    player2Id: 0,
    wedgeDistance1: 0,
    flipMisses1: 0,
    pongMisses1: 0,
    runTime1: 0,
    wedgeDistance2: 0,
    flipMisses2: 0,
    pongMisses2: 0,
    runTime2: 0,
    notes: ""
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<GolfRelayMatch[]>({
    queryKey: ['/api/golf-relay/matches'],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/golf-relay/leaderboard'],
  });

  const createMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      return await apiRequest('POST', '/api/golf-relay/matches', matchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/golf-relay/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/golf-relay/leaderboard'] });
      setShowCreateMatch(false);
      setNewMatch({
        player1Id: 0,
        player2Id: 0,
        wedgeDistance1: 0,
        flipMisses1: 0,
        pongMisses1: 0,
        runTime1: 0,
        wedgeDistance2: 0,
        flipMisses2: 0,
        pongMisses2: 0,
        runTime2: 0,
        notes: ""
      });
    },
  });

  const calculateChugTime = (distanceFeet: number): number => {
    if (distanceFeet < 1) return 10;
    if (distanceFeet < 2) return 9;
    if (distanceFeet < 3) return 8;
    if (distanceFeet < 4) return 7;
    if (distanceFeet < 5) return 6;
    if (distanceFeet < 6) return 5;
    if (distanceFeet < 7) return 4;
    if (distanceFeet < 8) return 3;
    if (distanceFeet < 9) return 2;
    if (distanceFeet < 10) return 1;
    return 60; // Full drink
  };

  const calculateTotalTime = (player: 'player1' | 'player2') => {
    const wedgeDistance = player === 'player1' ? newMatch.wedgeDistance1 : newMatch.wedgeDistance2;
    const flipMisses = player === 'player1' ? newMatch.flipMisses1 : newMatch.flipMisses2;
    const pongMisses = player === 'player1' ? newMatch.pongMisses1 : newMatch.pongMisses2;
    const runTime = player === 'player1' ? newMatch.runTime1 : newMatch.runTime2;

    const chugTime = calculateChugTime(wedgeDistance / 10); // Convert back to feet
    const flipPenalty = flipMisses * 2;
    const pongPenalty = pongMisses > 0 ? (pongMisses >= 6 ? 10 : pongMisses * 3) : 0;

    return runTime + (chugTime * 1000) + (flipPenalty * 1000) + (pongPenalty * 1000);
  };

  const submitMatch = () => {
    const totalTime1 = calculateTotalTime('player1');
    const totalTime2 = calculateTotalTime('player2');
    const winnerId = totalTime1 < totalTime2 ? newMatch.player1Id : newMatch.player2Id;

    const matchData = {
      ...newMatch,
      totalTime1,
      totalTime2,
      winnerId,
      tournamentYear: 2025
    };

    createMatchMutation.mutate(matchData);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(1);
    return minutes > 0 ? `${minutes}:${seconds.padStart(4, '0')}` : `${seconds}s`;
  };

  const isAdmin = user && `${user.firstName} ${user.lastName}` === 'Nick Grossi';

  if (matchesLoading || leaderboardLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Golf Relay Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Golf Relay Rules
          </CardTitle>
          <CardDescription>1v1 head-to-head relay with multiple stations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🏌️ Station 1: Wedge Shot</h4>
                <p className="text-sm text-muted-foreground">
                  Flop shot to target. Chug time based on distance (1s at 10ft, 10s at 1ft, full drink at 10ft+)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🔄 Station 2: Flip Cup</h4>
                <p className="text-sm text-muted-foreground">
                  Must flip cup successfully. +2 seconds per failed attempt
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🏀 Station 3: Pong Shot</h4>
                <p className="text-sm text-muted-foreground">
                  3 cups in line. +3 seconds per miss (max 6 tries, +10s if none made)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🏃 Station 4: Sprint</h4>
                <p className="text-sm text-muted-foreground">
                  Sprint to finish line (manual timing)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Golf Relay Leaderboard
            </CardTitle>
            <CardDescription>Player standings and best times</CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreateMatch(true)} disabled={createMatchMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Log Match
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No Golf Relay matches yet. Start racing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                <div
                  key={entry.playerId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                      <span className="font-bold text-lg">#{index + 1}</span>
                    </div>
                    <ProfilePicture
                      firstName={entry.user.firstName}
                      lastName={entry.user.lastName}
                      className="h-10 w-10"
                    />
                    <div>
                      <div className="font-semibold">{entry.user.firstName} {entry.user.lastName}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.wins} wins • {entry.winRate}% win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.wins} wins</div>
                    {entry.bestTime && (
                      <div className="text-sm text-muted-foreground">
                        Best: {formatTime(entry.bestTime)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Match Form */}
      {showCreateMatch && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Log Golf Relay Match
            </CardTitle>
            <CardDescription>Record the results of a completed Golf Relay race</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Player Selection */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="player1">Player 1</Label>
                  <Select value={newMatch.player1Id.toString()} onValueChange={(value) => 
                    setNewMatch(prev => ({ ...prev, player1Id: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u: User) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="player2">Player 2</Label>
                  <Select value={newMatch.player2Id.toString()} onValueChange={(value) => 
                    setNewMatch(prev => ({ ...prev, player2Id: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u: User) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Player 1 Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Player 1 Results</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wedgeDistance1">Wedge Distance (ft)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMatch.wedgeDistance1 / 10}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        wedgeDistance1: Math.round(parseFloat(e.target.value || '0') * 10) 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Chug time: {calculateChugTime(newMatch.wedgeDistance1 / 10)}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="flipMisses1">Flip Cup Misses</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newMatch.flipMisses1}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        flipMisses1: parseInt(e.target.value || '0') 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Penalty: +{newMatch.flipMisses1 * 2}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="pongMisses1">Pong Misses</Label>
                    <Input
                      type="number"
                      min="0"
                      max="6"
                      value={newMatch.pongMisses1}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        pongMisses1: parseInt(e.target.value || '0') 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Penalty: +{newMatch.pongMisses1 >= 6 ? 10 : newMatch.pongMisses1 * 3}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="runTime1">Sprint Time (seconds)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMatch.runTime1 / 1000}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        runTime1: Math.round(parseFloat(e.target.value || '0') * 1000) 
                      }))}
                    />
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-semibold">
                    Total Time: {formatTime(calculateTotalTime('player1'))}
                  </p>
                </div>
              </div>

              {/* Player 2 Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Player 2 Results</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wedgeDistance2">Wedge Distance (ft)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMatch.wedgeDistance2 / 10}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        wedgeDistance2: Math.round(parseFloat(e.target.value || '0') * 10) 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Chug time: {calculateChugTime(newMatch.wedgeDistance2 / 10)}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="flipMisses2">Flip Cup Misses</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newMatch.flipMisses2}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        flipMisses2: parseInt(e.target.value || '0') 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Penalty: +{newMatch.flipMisses2 * 2}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="pongMisses2">Pong Misses</Label>
                    <Input
                      type="number"
                      min="0"
                      max="6"
                      value={newMatch.pongMisses2}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        pongMisses2: parseInt(e.target.value || '0') 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Penalty: +{newMatch.pongMisses2 >= 6 ? 10 : newMatch.pongMisses2 * 3}s
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="runTime2">Sprint Time (seconds)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMatch.runTime2 / 1000}
                      onChange={(e) => setNewMatch(prev => ({ 
                        ...prev, 
                        runTime2: Math.round(parseFloat(e.target.value || '0') * 1000) 
                      }))}
                    />
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-semibold">
                    Total Time: {formatTime(calculateTotalTime('player2'))}
                  </p>
                </div>
              </div>

              {/* Notes and Submit */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    value={newMatch.notes}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about the match..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={submitMatch} 
                    disabled={!newMatch.player1Id || !newMatch.player2Id || createMatchMutation.isPending}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {createMatchMutation.isPending ? 'Saving...' : 'Save Match'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateMatch(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Recent Matches
          </CardTitle>
          <CardDescription>Latest Golf Relay competitions</CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches recorded yet. Start racing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.slice(0, 10).map((match: GolfRelayMatch) => {
                const player1 = users.find((u: User) => u.id === match.player1Id);
                const player2 = users.find((u: User) => u.id === match.player2Id);
                const winner = users.find((u: User) => u.id === match.winnerId);
                
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {player1 && (
                          <ProfilePicture
                            firstName={player1.firstName}
                            lastName={player1.lastName}
                            className="h-8 w-8"
                          />
                        )}
                        <span className="text-sm">vs</span>
                        {player2 && (
                          <ProfilePicture
                            firstName={player2.firstName}
                            lastName={player2.lastName}
                            className="h-8 w-8"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {player1?.firstName} vs {player2?.firstName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        🏆 {winner?.firstName}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(match.totalTime1)} vs {formatTime(match.totalTime2)}
                      </div>
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