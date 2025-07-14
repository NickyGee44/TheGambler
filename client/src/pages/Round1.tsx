import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Plus, Minus } from "lucide-react";

interface HoleScore {
  id: number;
  hole: number;
  strokes: number;
  par: number;
  points: number;
  netScore: number;
}

interface LeaderboardEntry {
  user: { firstName: string; lastName: string };
  team: { teamNumber: number };
  totalPoints: number;
  holes: number;
}

export default function Round1() {
  const { user } = useAuth();
  const { toast } = useToast();
  const round = 1;

  // Fetch user's hole scores for round 1
  const { data: holeScores = [], isLoading } = useQuery<HoleScore[]>({
    queryKey: [`/api/hole-scores/${round}`],
    enabled: !!user,
  });

  // Fetch leaderboard for round 1
  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard/${round}`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ hole, strokes }: { hole: number; strokes: number }) => {
      const res = await apiRequest("POST", "/api/hole-scores", {
        round,
        hole,
        strokes,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hole-scores/${round}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/leaderboard/${round}`] });
      toast({
        title: "Score updated",
        description: "Your hole score has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getScoreForHole = (hole: number) => {
    const score = holeScores.find(s => s.hole === hole);
    return score?.strokes || 0;
  };

  const updateScore = (hole: number, strokes: number) => {
    if (strokes < 1) return;
    updateScoreMutation.mutate({ hole, strokes });
  };

  const totalPoints = holeScores.reduce((sum, score) => sum + score.points, 0);
  const holesPlayed = holeScores.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your scorecard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-golf-green-600 mb-2">Round 1 Scorecard</h1>
          <p className="text-muted-foreground">
            Welcome {user?.firstName}! Enter your strokes for each hole to track your progress.
          </p>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-golf-green-600">{totalPoints}</div>
              <p className="text-sm text-muted-foreground">Stableford points</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Holes Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{holesPlayed}</div>
              <p className="text-sm text-muted-foreground">out of 18</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Round</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-golf-green-600">1</div>
              <p className="text-sm text-muted-foreground">Deerhurst Golf Course</p>
            </CardContent>
          </Card>
        </div>

        {/* Scorecard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Scorecard</CardTitle>
            <CardDescription>Enter your strokes for each hole</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => {
                const currentScore = getScoreForHole(hole);
                const par = 4; // Default par
                
                return (
                  <div key={hole} className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-golf-green-600" />
                        <span className="font-semibold">Hole {hole}</span>
                      </div>
                      <Badge variant="outline">Par {par}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(hole, currentScore - 1)}
                        disabled={currentScore <= 0 || updateScoreMutation.isPending}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-golf-green-600">
                          {currentScore || "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">strokes</div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScore(hole, currentScore + 1)}
                        disabled={updateScoreMutation.isPending}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Live Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-golf-green-600" />
              Live Leaderboard - Round 1
            </CardTitle>
            <CardDescription>Updated in real-time as players submit scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={`${entry.user.firstName}-${entry.user.lastName}`}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-golf-green-600 text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {entry.user.firstName} {entry.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Team {entry.team.teamNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-golf-green-600">
                      {entry.totalPoints} pts
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.holes} holes
                    </div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No scores submitted yet. Be the first to start scoring!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}