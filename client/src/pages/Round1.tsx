import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HoleView from "@/components/HoleView";
import { getCourseForRound } from "@shared/courseData";
import { Play, Flag, Trophy, Users, MapPin } from "lucide-react";
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

export default function Round1() {
  const { user } = useAuth();
  const { toast } = useToast();
  const round = 1;
  const course = getCourseForRound(round);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [isRoundStarted, setIsRoundStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState("team");

  // Fetch user's hole scores for round 1
  const { data: holeScores = [], isLoading } = useQuery<HoleScore[]>({
    queryKey: [`/api/hole-scores/${round}`],
    enabled: !!user,
  });

  // Fetch individual leaderboard for round 1
  const { data: individualLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard/${round}`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch team better ball leaderboard for round 1
  const { data: teamLeaderboard = [] } = useQuery<any[]>({
    queryKey: [`/api/team-better-ball/${round}`],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!user, // Only fetch when user is authenticated
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
      queryClient.invalidateQueries({ queryKey: [`/api/team-better-ball/${round}`] });
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
              <h1 className="text-3xl font-bold text-golf-green-600">Round 1 Leaderboard</h1>
              <Button
                variant="outline"
                onClick={() => setShowLeaderboard(false)}
              >
                Back to Round
              </Button>
            </div>
            <p className="text-muted-foreground">Live tournament standings</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-golf-green-600" />
                Live Leaderboard - Round 1
              </CardTitle>
              <CardDescription>Updated in real-time as players submit scores</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={leaderboardTab} onValueChange={setLeaderboardTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="team">Team Better Ball</TabsTrigger>
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                </TabsList>
                
                <TabsContent value="team" className="space-y-2 mt-4">
                  {teamLeaderboard.map((entry, index) => (
                    <div
                      key={`team-${entry.team.id}`}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-golf-green-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {entry.players.map((player) => (
                              <ProfilePicture 
                                key={player.id}
                                firstName={player.firstName} 
                                lastName={player.lastName} 
                                size="md"
                                className="border-2 border-white"
                              />
                            ))}
                          </div>
                          <div>
                            <div className="font-semibold">
                              Team {entry.team.teamNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.team.player1Name} & {entry.team.player2Name}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-golf-green-600 text-lg">
                          {entry.totalPoints} pts
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.totalNetStrokes} net • {entry.holes} holes
                        </div>
                      </div>
                    </div>
                  ))}
                  {teamLeaderboard.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No team scores submitted yet. Be the first to start scoring!
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="individual" className="space-y-2 mt-4">
                  {individualLeaderboard.map((entry, index) => (
                    <div
                      key={`${entry.user.firstName}-${entry.user.lastName}`}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-golf-green-600 text-white flex items-center justify-center font-bold">
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
                  {individualLeaderboard.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No individual scores submitted yet. Be the first to start scoring!
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
      <div className="relative">
        {/* Progress bar at top */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Round 1 Progress</span>
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
    );
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-green-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-golf-green-200 dark:border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-golf-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-golf-green-600">Round 1</CardTitle>
            <CardDescription>
              {course.name} • {course.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Course Info</h3>
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
                className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white"
                onClick={handleStartRound}
              >
                <Play className="w-5 h-5 mr-2" />
                {holesPlayed > 0 ? "Continue Round" : "Start Round 1"}
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