import { useState, useEffect } from "react";
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
import MatchPlayView from "@/components/MatchPlayView";
import Layout from "@/components/Layout";
import { getCourseForRound } from "@shared/courseData";
import { Play, Flag, Trophy, Users, MapPin, Crown, CheckCircle, Star, ChevronDown, ChevronRight, Target, Zap, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProfilePicture from "@/components/ProfilePicture";
import ScoreIndicator from "@/components/ScoreIndicator";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useLocation } from "wouter";

interface HoleScore {
  id: number;
  hole: number;
  strokes: number;
  par: number;
  points: number;
  netScore: number;
}

interface LeaderboardEntry {
  user: { firstName: string; lastName: string; id: number };
  team: { teamNumber: number };
  totalPoints: number;
  holes: number;
}

// PlayerHoleScores Component
function PlayerHoleScores({ playerId, round }: { playerId: number; round: number }) {
  const { data: holeScores = [] } = useQuery<HoleScore[]>({
    queryKey: [`/api/player-hole-scores/${playerId}/${round}`],
    enabled: !!playerId,
  });

  if (holeScores.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-muted-foreground">
        No hole scores available for this round
      </div>
    );
  }

  return (
    <div className="px-4 py-2 bg-background/50 rounded-b-lg">
      <div className="grid grid-cols-9 gap-1 text-xs">
        {holeScores.map((score) => (
          <div
            key={score.hole}
            className="flex flex-col items-center p-1 bg-muted rounded"
          >
            <div className="font-medium text-muted-foreground">
              {score.hole}
            </div>
            <ScoreIndicator 
              strokes={score.strokes} 
              par={score.par} 
              size="sm"
            />
            <div className="text-xs text-muted-foreground">
              {score.points}pt
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Hole • Score • Points
      </div>
    </div>
  );
}

// Match Play Leaderboard Component
function MatchPlayLeaderboard({ leaderboard, currentUser }: { 
  leaderboard: MatchPlayLeaderboard[], 
  currentUser: any 
}) {
  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-golf-green-600" />
            Match Play Leaderboard
          </CardTitle>
          <CardDescription>No matches have been completed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Match play results will appear here once matches are completed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-golf-green-600" />
          Match Play Leaderboard
        </CardTitle>
        <CardDescription>6-hole match play results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                entry.playerId === currentUser?.id 
                  ? 'bg-golf-green-50 border-golf-green-200 dark:bg-golf-green-900/20 dark:border-golf-green-700' 
                  : 'bg-background border-border'
              }`}
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
                  firstName={entry.playerName.split(' ')[0]} 
                  lastName={entry.playerName.split(' ')[1]} 
                  size="md"
                />
                <div>
                  <div className="font-semibold">
                    {entry.playerName}
                    {entry.playerId === currentUser?.id && (
                      <span className="ml-2 text-xs text-golf-green-600 font-medium">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.matchesPlayed} matches played
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-golf-green-600">
                  {entry.totalPoints} pts
                </div>
                <div className="text-sm text-muted-foreground">
                  {entry.matchesWon}W - {entry.matchesTied}T - {entry.matchesLost}L
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MatchPlayGroup {
  id: number;
  groupNumber: number;
  player1Id: number;
  player2Id: number;
  player3Id: number;
  player4Id: number;
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
  player1Handicap: number;
  player2Handicap: number;
  player3Handicap: number;
  player4Handicap: number;
  createdAt: string;
}

interface MatchPlayMatch {
  id: number;
  groupId: number;
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
  player1Handicap: number;
  player2Handicap: number;
  holes: string;
  strokesGiven: number;
  strokeRecipientId: number;
  strokeHoles: number[];
  winnerId?: number;
  result?: string;
  pointsAwarded?: number;
  createdAt: string;
}

interface MatchPlayLeaderboard {
  playerId: number;
  playerName: string;
  totalPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesTied: number;
  matchesLost: number;
}

export default function Round3() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const round = 3;
  const course = getCourseForRound(round);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [isRoundStarted, setIsRoundStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("play");

  // WebSocket connection for real-time updates
  useWebSocket("/ws", {
    onMessage: (data) => {
      if (data.type === "BIRDIE_NOTIFICATION") {
        // Dispatch custom event for birdie notification
        const event = new CustomEvent("birdie-notification", {
          detail: data.data,
        });
        window.dispatchEvent(event);
      } else if (data.type === "MATCH_PLAY_CREATED" || data.type === "MATCH_PLAY_RESULT") {
        // Refresh match play data when updates occur
        queryClient.invalidateQueries({ queryKey: ["/api/match-play/matches"] });
        queryClient.invalidateQueries({ queryKey: ["/api/match-play/leaderboard"] });
      }
    },
  });

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

  // Fetch match play groups
  const { data: matchPlayGroups = [] } = useQuery<MatchPlayGroup[]>({
    queryKey: ["/api/match-play/groups"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch match play matches
  const { data: matchPlayMatches = [] } = useQuery<MatchPlayMatch[]>({
    queryKey: ["/api/match-play/matches"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch match play leaderboard
  const { data: matchPlayLeaderboard = [] } = useQuery<MatchPlayLeaderboard[]>({
    queryKey: ["/api/match-play/leaderboard"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Get current match for the player and hole
  const { data: currentMatch } = useQuery({
    queryKey: [`/api/match-play/current-match/${user?.id}/${currentHole}`],
    enabled: !!user && isRoundStarted,
    refetchInterval: 5000, // Refresh every 5 seconds during play
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

  // Round submission mutation
  const submitRoundMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/submit-round", {
        round,
        totalPoints,
        holesPlayed
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Round Submitted!",
        description: `Round ${round} has been submitted successfully. Total points: ${totalPoints}`,
      });
      navigate("/scores");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
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
    } else {
      // Check if round is complete (all 18 holes have scores)
      if (holesPlayed === 18) {
        setShowRoundComplete(true);
      }
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
                {leaderboard.map((entry, index) => {
                  const playerId = `${entry.user.firstName}-${entry.user.lastName}`;
                  const isExpanded = expandedPlayer === playerId;
                  return (
                    <Collapsible 
                      key={playerId}
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedPlayer(open ? playerId : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
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
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-bold text-golf-green-600 text-lg">
                                {entry.totalPoints} pts
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.totalStrokes} strokes • {entry.holes} holes
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <PlayerHoleScores playerId={entry.user.id} round={round} />
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
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
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-golf-green-50 to-golf-sand-50 dark:from-golf-green-900 dark:to-golf-sand-900 backdrop-blur-sm border-b border-golf-green-200 dark:border-golf-green-700 p-4 shadow-lg">
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="play">Play</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="play" className="mt-4">
                {/* Match Play Information Card */}
                {currentMatch && (
                  <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Match Play - {currentMatch.holes}
                      </h3>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {currentMatch.result || 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="font-medium text-sm text-yellow-700 dark:text-yellow-300">
                          {currentMatch.player1Name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          HCP: {currentMatch.player1Handicap}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm text-yellow-700 dark:text-yellow-300">
                          {currentMatch.player2Name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          HCP: {currentMatch.player2Handicap}
                        </div>
                      </div>
                    </div>
                    
                    {currentMatch.strokesGiven > 0 && (
                      <div className="text-center mb-3">
                        <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                          {currentMatch.strokeRecipientId === currentMatch.player1Id ? currentMatch.player1Name : currentMatch.player2Name} receives {currentMatch.strokesGiven} stroke{currentMatch.strokesGiven > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stroke holes: {currentMatch.strokeHoles && currentMatch.strokeHoles.length > 0 ? currentMatch.strokeHoles.join(', ') : 'None'}
                        </div>
                      </div>
                    )}
                    
                    {currentMatch.pointsAwarded && (
                      <div className="text-center">
                        <Badge className="bg-yellow-600 text-white">
                          {currentMatch.pointsAwarded} Points Awarded
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
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
                  onShowLeaderboard={() => setShowLeaderboard(true)}
                  holeScores={holeScores}
                  currentMatch={currentMatch}
                  userId={user?.id}
                />
              </TabsContent>
              
              <TabsContent value="leaderboard" className="mt-4">
                <MatchPlayLeaderboard
                  leaderboard={matchPlayLeaderboard}
                  currentUser={user}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }

  // Show round completion dialog
  if (showRoundComplete) {
    const totalStrokes = holeScores.reduce((sum, score) => sum + score.strokes, 0);
    const birdies = holeScores.filter(score => score.netScore < 0).length;
    const pars = holeScores.filter(score => score.netScore === 0).length;
    const bogeys = holeScores.filter(score => score.netScore === 1).length;
    const others = holeScores.filter(score => score.netScore > 1).length;

    return (
      <Dialog open={showRoundComplete} onOpenChange={setShowRoundComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Final Round Complete!
            </DialogTitle>
            <DialogDescription>
              Congratulations! You've completed the championship round. Here's your final summary:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="text-center p-4 bg-golf-sand-50 dark:bg-golf-sand-900/20 rounded-lg">
                <div className="text-2xl font-bold text-golf-sand-600">{totalStrokes}</div>
                <div className="text-sm text-muted-foreground">Total Strokes</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Birdies or Better</span>
                <Badge variant="default" className="bg-yellow-600">{birdies}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pars</span>
                <Badge variant="outline">{pars}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bogeys</span>
                <Badge variant="secondary">{bogeys}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Double Bogey+</span>
                <Badge variant="destructive">{others}</Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRoundComplete(false)}
              disabled={submitRoundMutation.isPending}
            >
              Continue Playing
            </Button>
            <Button
              onClick={() => submitRoundMutation.mutate()}
              disabled={submitRoundMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {submitRoundMutation.isPending ? "Submitting..." : "Submit Final Round"}
              <Crown className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-800 border-2 border-yellow-600 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              Final Round
            </CardTitle>
            <CardDescription className="text-gray-300">
              {course.name} • {course.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-white">Championship Course</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-300">Par</div>
                  <div className="text-yellow-400">{course.par}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">Yardage</div>
                  <div className="text-yellow-400">{course.yardage}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">Rating</div>
                  <div className="text-yellow-400">{course.rating}</div>
                </div>
              </div>
            </div>

            {holesPlayed > 0 && (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-white">Your Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Holes Played</span>
                    <span>{holesPlayed}/18</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Current Points</span>
                    <span className="font-semibold text-yellow-400">{totalPoints}</span>
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
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                onClick={() => setShowLeaderboard(true)}
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300 flex items-center justify-center gap-1">
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