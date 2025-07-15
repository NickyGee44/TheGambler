import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import HoleView from "@/components/HoleView";
import Layout from "@/components/Layout";
import { getCourseForRound } from "@shared/courseData";
import { Play, Flag, Trophy, Users, MapPin, Crown } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

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

export default function Round3() {
  const { user } = useAuth();
  const { toast } = useToast();
  const round = 3;
  const course = getCourseForRound(round);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [isRoundStarted, setIsRoundStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Fetch user's hole scores for round 3
  const { data: holeScores = [], isLoading } = useQuery<HoleScore[]>({
    queryKey: [`/api/hole-scores/${round}`],
    enabled: !!user,
  });

  // Fetch leaderboard for round 3
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
        title: "Score saved",
        description: "Your score has been updated.",
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

  const updateScore = (strokes: number) => {
    updateScoreMutation.mutate({ hole: currentHole, strokes });
  };

  const totalPoints = holeScores.reduce((sum, score) => sum + score.points, 0);
  const holesPlayed = holeScores.length;
  const progressPercentage = (holesPlayed / 18) * 100;

  const handleStartRound = () => {
    setIsRoundStarted(true);
    setCurrentHole(1);
  };

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your round...</p>
        </div>
      </div>
    );
  }

  // Show leaderboard overlay
  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-golf-green-600 flex items-center gap-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                Round 3 Final
              </h1>
              <Button
                variant="outline"
                onClick={() => setShowLeaderboard(false)}
              >
                Back to Round
              </Button>
            </div>
            <p className="text-muted-foreground">Final round leaderboard at Muskoka Bay Golf Club</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-golf-green-600" />
                Final Round Leaderboard
              </CardTitle>
              <CardDescription>Championship round at Muskoka Bay Golf Club</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={`${entry.user.firstName}-${entry.user.lastName}`}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' : 
                        'bg-golf-green-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <ProfilePicture 
                        firstName={entry.user.firstName} 
                        lastName={entry.user.lastName} 
                        size="lg"
                      />
                      <div>
                        <div className="font-semibold">
                          {entry.user.firstName} {entry.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Team {entry.team.teamNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-golf-green-600 text-lg">
                        {entry.totalPoints} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.totalStrokes} strokes • {entry.holes} holes
                      </div>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No scores submitted yet. Be the first to start the final round!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show hole view when round is started
  if (isRoundStarted) {
    const currentHoleData = course.holes[currentHole - 1];
    const currentScore = getScoreForHole(currentHole);
    
    return (
      <Layout>
        <div className="relative">
          {/* Progress bar at top */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b p-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Final Round Progress
                </span>
                <span className="text-sm text-muted-foreground">{holesPlayed}/18</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Hole view with top padding for progress bar */}
          <div className="pt-20">
            <HoleView
              hole={currentHoleData}
              round={round}
              currentScore={currentScore}
              onScoreUpdate={updateScore}
              onPreviousHole={handlePreviousHole}
              onNextHole={handleNextHole}
              isFirstHole={currentHole === 1}
              isLastHole={currentHole === 18}
              isUpdating={updateScoreMutation.isPending}
            />
          </div>

          {/* Floating action buttons */}
          <div className="fixed bottom-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLeaderboard(true)}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-green-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-golf-green-600 flex items-center justify-center gap-2">
              Final Round
            </CardTitle>
            <CardDescription>
              {course.name} • {course.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Championship Course</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">Par</div>
                  <div className="text-golf-green-600">{course.par}</div>
                </div>
                <div>
                  <div className="font-medium">Yardage</div>
                  <div className="text-golf-green-600">{course.yardage}</div>
                </div>
                <div>
                  <div className="font-medium">Rating</div>
                  <div className="text-golf-green-600">{course.rating}</div>
                </div>
              </div>
            </div>

            {holesPlayed > 0 && (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Holes Played</span>
                    <span>{holesPlayed}/18</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Current Points</span>
                    <span className="font-semibold text-golf-green-600">{totalPoints}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                onClick={handleStartRound}
              >
                <Play className="w-5 h-5 mr-2" />
                {holesPlayed > 0 ? "Continue Final Round" : "Start Final Round"}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setShowLeaderboard(true)}
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                GPS yardages available during play
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}