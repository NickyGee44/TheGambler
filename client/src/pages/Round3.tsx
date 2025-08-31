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
// Removed hardcoded matchups - now using dynamic database data


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
  player1Points?: number;
  player2Points?: number;
  createdAt: string;
}



export default function Round3() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const round = 3;
  const course = getCourseForRound(round);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [isRoundStarted, setIsRoundStarted] = useState(false);

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
  const { data: matchPlayMatches = [] } = useQuery<any[]>({
    queryKey: ["/api/match-play/matches"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });



  // Fetch all registered players to get handicap data for stroke calculations
  const { data: allPlayers = [] } = useQuery<any[]>({
    queryKey: ["/api/registered-players"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Match play leaderboard data fetched above

  // Get current match for the player and hole
  const { data: currentMatch } = useQuery({
    queryKey: [`/api/match-play/current-match/${user?.id}/${currentHole}`],
    enabled: !!user && isRoundStarted,
    refetchInterval: 5000, // Refresh every 5 seconds during play
  });

  // Function to determine opponent based on current hole and user name
  const getCurrentOpponent = (currentHole: number, playerName: string) => {
    if (!playerName || !user?.id) return null;
    
    // Determine hole range
    let holeRange: string;
    if (currentHole >= 1 && currentHole <= 6) {
      holeRange = "1-6";
    } else if (currentHole >= 7 && currentHole <= 12) {
      holeRange = "7-12";
    } else if (currentHole >= 13 && currentHole <= 18) {
      holeRange = "13-18";
    } else {
      return null;
    }

    // Find the matchup for this player and hole range from database
    const matchup = matchPlayMatches.find((m: any) => 
      m.hole_segment === holeRange && 
      (m.player1_id === user.id || m.player2_id === user.id)
    );

    if (!matchup) return null;

    // Get opponent info from allPlayers data
    const opponentId = matchup.player1_id === user.id ? matchup.player2_id : matchup.player1_id;
    
    console.log('Opponent lookup debug:', {
      opponentId,
      allPlayersCount: allPlayers.length,
      allPlayersSample: allPlayers[0],
      matchingPlayer: allPlayers.find(p => p.userId === opponentId)
    });
    
    const opponent = allPlayers.find(p => p.userId === opponentId);
    
    if (!opponent) {
      console.log('No opponent found with userId:', opponentId);
      return null;
    }

    return {
      opponent: opponent.name,
      holeRange: holeRange,
      strokes: `${matchup.strokes_given} stroke${matchup.strokes_given !== 1 ? 's' : ''}`,
      foursome: 'N/A',
      matchup: matchup
    };
  };

  // Get current opponent info
  const currentOpponent = getCurrentOpponent(currentHole, `${user?.firstName} ${user?.lastName}`);

  // Function to calculate stroke allocation based on matchup data
  const calculateStrokeAllocation = (playerName: string, opponentName: string, holeRange: string) => {
    if (!user?.id) {
      return {
        strokeDifference: 0,
        playerGetsStrokes: false,
        strokesInRange: 0,
        strokeHoles: []
      };
    }

    // Find the specific matchup from database
    const matchup = matchPlayMatches.find((m: any) => 
      m.hole_segment === holeRange && 
      (m.player1_id === user.id || m.player2_id === user.id)
    );
    
    console.log('Matchup lookup:', {
      playerName,
      opponentName,
      holeRange,
      matchupFound: !!matchup,
      strokesGiven: matchup?.strokes_given,
      strokeRecipient: matchup?.stroke_recipient_id
    });
    
    if (!matchup) {
      return {
        strokeDifference: 0,
        playerGetsStrokes: false,
        strokesInRange: 0,
        strokeHoles: []
      };
    }
    
    const strokesGiven = matchup.strokes_given || 0;
    const playerGetsStrokes = matchup.stroke_recipient_id === user.id;
    
    console.log('Stroke parsing result:', {
      strokesGiven,
      playerGetsStrokes,
      userId: user.id,
      strokeRecipientId: matchup.stroke_recipient_id
    });
    
    // Get stroke holes directly from database
    const strokeHoles = playerGetsStrokes ? (matchup.stroke_holes || []) : [];
    
    console.log('Stroke allocation result:', {
      strokeDifference: strokesGiven,
      playerGetsStrokes,
      strokesInRange: strokesGiven,
      strokeHoles
    });
    
    return {
      strokeDifference: strokesGiven,
      playerGetsStrokes,
      strokesInRange: strokesGiven,
      strokeHoles
    };
  };

  // Get stroke allocation for current matchup
  const getStrokeInfoForHole = (hole: number) => {
    if (!currentOpponent || !user) return null;
    
    // Get user handicap from authenticated user data
    const userHandicap = user.handicap || 20; // Default to 20 if not set
    
    // Find opponent handicap from registered players
    const opponentPlayer = allPlayers.find(player => 
      `${player.firstName} ${player.lastName}` === currentOpponent.opponent
    );
    const opponentHandicap = opponentPlayer?.handicap || 20; // Default to 20 if not found
    
    console.log('Stroke calculation debug:', {
      hole,
      playerName: `${user.firstName} ${user.lastName}`,
      opponent: currentOpponent.opponent,
      holeRange: currentOpponent.holeRange
    });
    
    const strokeAllocation = calculateStrokeAllocation(`${user.firstName} ${user.lastName}`, currentOpponent.opponent, currentOpponent.holeRange);
    
    console.log('Stroke allocation result:', strokeAllocation);
    
    const holeGetsStroke = strokeAllocation.strokeHoles.includes(hole);
    
    if (!holeGetsStroke) return null;
    
    return {
      playerGetsStroke: strokeAllocation.playerGetsStrokes,
      opponentGetsStroke: !strokeAllocation.playerGetsStrokes,
      strokeDifference: strokeAllocation.strokeDifference
    };
  };

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
      // Immediately invalidate hole scores to refresh UI
      queryClient.invalidateQueries({ queryKey: [`/api/hole-scores/${round}`] });
      
      // Delay other cache invalidations to prevent UI reversion during user interaction
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/leaderboard/${round}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/match-play/matches"] });
        queryClient.invalidateQueries({ queryKey: ["/api/match-play/leaderboard"] });
      }, 1000); // Reduced to 1 second delay
      
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
                {/* Debug: Show when no opponent found */}
                {!currentOpponent && user && isRoundStarted && (
                  <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="font-medium mb-1">Loading opponent data...</div>
                      <div>Player: {user.firstName} {user.lastName}</div>
                      <div>Current Hole: {currentHole}</div>
                      <div>Checking database matchups</div>
                    </div>
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
                  onShowLeaderboard={() => setActiveTab("leaderboard")}
                  holeScores={holeScores}
                  currentMatch={currentMatch}
                  userId={user?.id}
                  playerHandicap={user?.handicap || 0}
                  strokeInfo={getStrokeInfoForHole(currentHole)}
                  currentOpponent={currentOpponent}
                  playerName={user ? `${user.firstName} ${user.lastName}` : undefined}
                />
              </TabsContent>
              
              <TabsContent value="leaderboard" className="mt-4">
                <div className="space-y-6">
                  {/* Match Play Leaderboard Header */}
                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <h3 className="text-xl font-semibold mb-1">Round 3 Match Play</h3>
                    <p className="text-sm text-muted-foreground">Live standings with match points and scores</p>
                  </div>

                  {/* Match Play Results */}
                  {matchPlayMatches.length > 0 ? (
                    <div className="space-y-4">
                      {/* Group matches by hole segments */}
                      {["1–6", "7–12", "13–18"].map((segment) => {
                        const segmentMatches = matchPlayMatches.filter(match => match.holes === segment);
                        if (segmentMatches.length === 0) return null;

                        return (
                          <Card key={segment} className="bg-gray-800 border-gray-700">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg text-center text-yellow-400">
                                Holes {segment}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {segmentMatches.map((match, index) => (
                                <div key={index} className="bg-gray-700 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-medium text-gray-300">
                                      {match.player1Name} vs {match.player2Name}
                                    </div>
                                    <Badge 
                                      variant={match.result ? "default" : "outline"}
                                      className={match.result ? "bg-yellow-600" : ""}
                                    >
                                      {match.result || 'In Progress'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                      <div className="font-medium text-white">{match.player1Name}</div>
                                      <div className="text-yellow-400 font-bold">
                                        {match.player1Points || 0} pts
                                      </div>
                                      <div className="text-xs text-gray-400">HCP: {match.player1Handicap}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-white">{match.player2Name}</div>
                                      <div className="text-yellow-400 font-bold">
                                        {match.player2Points || 0} pts
                                      </div>
                                      <div className="text-xs text-gray-400">HCP: {match.player2Handicap}</div>
                                    </div>
                                  </div>

                                  {match.strokesGiven > 0 && (
                                    <div className="mt-2 text-center">
                                      <div className="text-xs text-blue-400">
                                        {match.strokeRecipientId === match.player1Id ? match.player1Name : match.player2Name} receives {match.strokesGiven} stroke{match.strokesGiven > 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        );
                      })}

                      {/* Individual Player Match Play Points Summary */}
                      <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-center text-yellow-400">
                            Match Play Points Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {allPlayers
                              .filter(player => {
                                // Calculate total points for each player from match play matches
                                const playerMatches = matchPlayMatches.filter(match => 
                                  match.player1Name === `${player.firstName} ${player.lastName}` || 
                                  match.player2Name === `${player.firstName} ${player.lastName}`
                                );
                                const totalPoints = playerMatches.reduce((sum, match) => {
                                  if (match.player1Name === `${player.firstName} ${player.lastName}`) {
                                    return sum + (match.player1Points || 0);
                                  } else if (match.player2Name === `${player.firstName} ${player.lastName}`) {
                                    return sum + (match.player2Points || 0);
                                  }
                                  return sum;
                                }, 0);
                                return totalPoints > 0; // Only show players with points
                              })
                              .sort((a, b) => {
                                // Sort by total match play points
                                const aPoints = matchPlayMatches.reduce((sum, match) => {
                                  if (match.player1Name === `${a.firstName} ${a.lastName}`) {
                                    return sum + (match.player1Points || 0);
                                  } else if (match.player2Name === `${a.firstName} ${a.lastName}`) {
                                    return sum + (match.player2Points || 0);
                                  }
                                  return sum;
                                }, 0);
                                const bPoints = matchPlayMatches.reduce((sum, match) => {
                                  if (match.player1Name === `${b.firstName} ${b.lastName}`) {
                                    return sum + (match.player1Points || 0);
                                  } else if (match.player2Name === `${b.firstName} ${b.lastName}`) {
                                    return sum + (match.player2Points || 0);
                                  }
                                  return sum;
                                }, 0);
                                return bPoints - aPoints;
                              })
                              .map((player, index) => {
                                const totalPoints = matchPlayMatches.reduce((sum, match) => {
                                  if (match.player1Name === `${player.firstName} ${player.lastName}`) {
                                    return sum + (match.player1Points || 0);
                                  } else if (match.player2Name === `${player.firstName} ${player.lastName}`) {
                                    return sum + (match.player2Points || 0);
                                  }
                                  return sum;
                                }, 0);

                                return (
                                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                                        {index + 1}
                                      </Badge>
                                      <span className="font-medium text-white">
                                        {player.firstName} {player.lastName}
                                      </span>
                                    </div>
                                    <div className="font-bold text-yellow-400">
                                      {totalPoints} pts
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Match play results will appear here as matches are completed.
                      </p>
                    </div>
                  )}
                </div>
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
                  <div className="text-yellow-400">{course.totalPar}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">Yardage</div>
                  <div className="text-yellow-400">{course.totalYardage}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">Rating</div>
                  <div className="text-yellow-400">{course.courseRating}</div>
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