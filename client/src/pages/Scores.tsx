import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { isUnauthorizedError } from "@/lib/authUtils";
import { RefreshCw, Edit, Trophy, Medal, Award, Wifi, WifiOff, Target, Flag, Users } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import MockDataGenerator from "@/components/MockDataGenerator";
import LoadingPage from "@/components/LoadingPage";
import IndividualScoresTable from "@/components/IndividualScoresTable";

export default function Scores() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [scoreValue, setScoreValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userTeamId, setUserTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overall");
  const { toast } = useToast();
  const { isOnline } = useOfflineStorage();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);
  
  const { data: scores = [], isLoading: scoresLoading, refetch } = useQuery({
    queryKey: ['/api/live-scores'],
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  // Round-specific leaderboards
  const { data: round1Leaderboard = [], isLoading: round1Loading } = useQuery({
    queryKey: ['/api/leaderboard', 1],
    refetchInterval: 10000,
  });

  const { data: round2Leaderboard = [], isLoading: round2Loading } = useQuery({
    queryKey: ['/api/leaderboard', 2],
    refetchInterval: 10000,
  });

  const { data: round3Leaderboard = [], isLoading: round3Loading } = useQuery({
    queryKey: ['/api/leaderboard', 3],
    refetchInterval: 10000,
  });

  // Individual scores for detailed view
  const { data: round1BetterBall = [], isLoading: round1BetterBallLoading } = useQuery({
    queryKey: ['/api/team-better-ball', 1],
    refetchInterval: 10000,
  });

  const { data: round2Scramble = [], isLoading: round2ScrambleLoading } = useQuery({
    queryKey: ['/api/team-scramble', 2],
    refetchInterval: 10000,
  });

  // Individual hole scores for all rounds
  const { data: round1HoleScores = [], isLoading: round1HoleScoresLoading } = useQuery({
    queryKey: ['/api/hole-scores', 1],
    refetchInterval: 10000,
  });

  const { data: round2HoleScores = [], isLoading: round2HoleScoresLoading } = useQuery({
    queryKey: ['/api/hole-scores', 2],
    refetchInterval: 10000,
  });

  const { data: round3HoleScores = [], isLoading: round3HoleScoresLoading } = useQuery({
    queryKey: ['/api/hole-scores', 3],
    refetchInterval: 10000,
  });

  // WebSocket for real-time updates
  useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATE' || data.type === 'HOLE_SCORE_UPDATE' || data.type === 'HOLE_STATS_UPDATE') {
        // Force refetch scores immediately
        queryClient.invalidateQueries({ queryKey: ['/api/live-scores'] });
        queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
        queryClient.invalidateQueries({ queryKey: ['/api/player-stats'] });
        refetch(); // Force immediate refresh
        
        if (data.type === 'SCORE_UPDATE') {
          toast({
            title: "Score Updated",
            description: `Team ${data.data.teamId} score has been updated`,
          });
        } else if (data.type === 'HOLE_SCORE_UPDATE') {
          toast({
            title: "Live Score Updated", 
            description: `Current standings updated for Round ${data.data.round}`,
          });
        }
      }
    }
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, round, score }: { teamId: number; round: number; score: number }) => {
      return await apiRequest('POST', '/api/scores', { teamId, round, score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
      toast({
        title: "Score Updated",
        description: "The score has been successfully updated",
      });
      setIsDialogOpen(false);
      setSelectedTeam("");
      setSelectedRound("");
      setScoreValue("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedRound || !scoreValue) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateScoreMutation.mutate({
      teamId: parseInt(selectedTeam),
      round: parseInt(selectedRound),
      score: parseInt(scoreValue),
    });
  };

  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-golf-gold-100 text-golf-gold-800`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
      );
    }
  };

  // Check if main data is loading
  const isMainLoading = isLoading || scoresLoading || teamsLoading;
  
  if (isMainLoading) {
    return <LoadingPage message="Loading tournament scores..." fullScreen />;
  }

  return (
    <div className="bg-gradient-to-br from-golf-green-50 to-golf-gold-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 pb-20">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-golf-gold-500" />
            <h2 className="text-2xl sm:text-4xl font-bold text-golf-green-600">Live Scores</h2>
            <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-golf-green-600" />
          </div>
          <p className="text-sm sm:text-lg text-golf-green-700 dark:text-golf-green-400 mb-4 sm:mb-6">
            Real-time Tournament Standings • Updated Live
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <div className="flex items-center text-sm">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-1 text-orange-500" />
                  <span className="text-orange-500 font-medium">Offline</span>
                </>
              )}
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {/* Only show edit button for Nick Grossi and Connor Patterson */}
            {user && ((user.firstName === 'Nick' && user.lastName === 'Grossi') || (user.firstName === 'Connor' && user.lastName === 'Patterson')) && (
              <>
                <MockDataGenerator />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-golf-gold-500 hover:bg-golf-gold-600 text-white border-golf-gold-400">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Scores
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-golf-green-600">Update Score</DialogTitle>
                  </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="team">Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team: any) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          Team {team.teamNumber} ({team.player1Name} & {team.player2Name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="round">Round</Label>
                  <Select value={selectedRound} onValueChange={setSelectedRound}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Round 1</SelectItem>
                      <SelectItem value="2">Round 2</SelectItem>
                      <SelectItem value="3">Round 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    placeholder="72"
                    className="focus:ring-golf-green-500 focus:border-golf-green-500"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
                    disabled={updateScoreMutation.isPending}
                  >
                    {updateScoreMutation.isPending ? 'Updating...' : 'Update Score'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                  </form>
                </DialogContent>
              </Dialog>
              </>
            )}
          </div>
        </div>
      
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Scores are automatically calculated from hole-by-hole rounds played by each team. 
          Only Nick Grossi and Connor Patterson can manually adjust scores if needed.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto overflow-hidden">
          <TabsTrigger value="overall" className="flex flex-col items-center gap-1 py-3 text-xs">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Overall Scores</span>
            <span className="sm:hidden">Overall</span>
          </TabsTrigger>
          <TabsTrigger value="round1" className="flex flex-col items-center gap-1 py-3 text-xs">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Round 1: Better Ball</span>
            <span className="sm:hidden">Round 1</span>
          </TabsTrigger>
          <TabsTrigger value="round2" className="flex flex-col items-center gap-1 py-3 text-xs">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Round 2: Scramble</span>
            <span className="sm:hidden">Round 2</span>
          </TabsTrigger>
          <TabsTrigger value="round3" className="flex flex-col items-center gap-1 py-3 text-xs">
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Round 3: Match Play</span>
            <span className="sm:hidden">Round 3</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-golf-green-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Rank</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 1</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 2</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 3</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {scores.map((score: any) => (
                      <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">{getRankBadge(score.rank)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-sm sm:text-base">Team {score.team.teamNumber}</div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <ProfilePicture 
                                firstName={score.team.player1Name.split(' ')[0]} 
                                lastName={score.team.player1Name.split(' ')[1] || ''} 
                                size="sm"
                              />
                              <span className="truncate">{score.team.player1Name}</span>
                            </div>
                            <span className="hidden sm:inline">&</span>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <ProfilePicture 
                                firstName={score.team.player2Name.split(' ')[0]} 
                                lastName={score.team.player2Name.split(' ')[1] || ''} 
                                size="sm"
                              />
                              <span className="truncate">{score.team.player2Name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-medium text-sm sm:text-base">{score.round1Points || '-'}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-medium text-sm sm:text-base">{score.round2Points || '-'}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-medium text-sm sm:text-base">{score.round3Points || '-'}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <div className="font-bold text-golf-green-600 text-sm sm:text-base">{score.totalPoints}</div>
                          {score.currentRoundPoints > 0 && (
                            <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 sm:px-2 py-1 rounded mt-1">
                              Current: {score.currentRoundPoints} pts (#{score.currentRoundStanding})
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="round1">
          <Round1DetailedView leaderboard={round1Leaderboard} />
        </TabsContent>

        <TabsContent value="round2">
          <Round2DetailedView leaderboard={round2Leaderboard} />
        </TabsContent>

        <TabsContent value="round3">
          <Round3DetailedView leaderboard={round3Leaderboard} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

// Detailed view components with both leaderboards and individual scores

function Round1DetailedView({ leaderboard }: { leaderboard: any[] }) {
  const [activeSubTab, setActiveSubTab] = useState("leaderboard");
  
  const { data: holeScores = [] } = useQuery({
    queryKey: ['/api/hole-scores', 1],
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Better Ball Leaderboard
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individual Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <BetterBallLeaderboard leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent value="individual">
          <IndividualScoresTable holeScores={holeScores} round={1} format="Better Ball" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Round2DetailedView({ leaderboard }: { leaderboard: any[] }) {
  const [activeSubTab, setActiveSubTab] = useState("leaderboard");
  
  const { data: holeScores = [] } = useQuery({
    queryKey: ['/api/hole-scores', 2],
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Scramble Leaderboard
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individual Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <ScrambleLeaderboard leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent value="individual">
          <IndividualScoresTable holeScores={holeScores} round={2} format="Scramble" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Round3DetailedView({ leaderboard }: { leaderboard: any[] }) {
  const [activeSubTab, setActiveSubTab] = useState("leaderboard");
  
  const { data: holeScores = [] } = useQuery({
    queryKey: ['/api/hole-scores', 3],
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Match Play Leaderboard
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individual Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <MatchPlayLeaderboard leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent value="individual">
          <IndividualScoresTable holeScores={holeScores} round={3} format="Match Play" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Specialized leaderboard components for each round format

function BetterBallLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-golf-gold-100 text-golf-gold-800`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
      );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round 1: Better Ball Format</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Teams use best score between partners on each hole. Shows both gross and net scores.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Pos</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Gross</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Net</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">To Par</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {leaderboard.map((entry: any, index: number) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{getRankBadge(entry.position || index + 1)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm">Team {entry.team?.teamNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>{entry.team?.player1Name}</div>
                      <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player2Name}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.totalGrossStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.totalNetStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    <span className={entry.grossToPar > 0 ? 'text-red-600' : entry.grossToPar < 0 ? 'text-green-600' : 'text-gray-600'}>
                      {entry.grossToPar > 0 ? '+' : ''}{entry.grossToPar || 'E'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-golf-green-600 text-xs sm:text-sm">
                    {entry.roundPoints || (11 - entry.position) || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ScrambleLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-golf-gold-100 text-golf-gold-800`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
      );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round 2: Scramble Format</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Teams play one ball from best position. Lowest total strokes wins.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Pos</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Strokes</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">To Par</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Holes</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {leaderboard.map((entry: any, index: number) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{getRankBadge(entry.position || index + 1)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm">Team {entry.team?.teamNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>{entry.team?.player1Name}</div>
                      <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player2Name}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.totalStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    <span className={entry.totalToPar > 0 ? 'text-red-600' : entry.totalToPar < 0 ? 'text-green-600' : 'text-gray-600'}>
                      {entry.totalToPar > 0 ? '+' : ''}{entry.totalToPar || 'E'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs text-gray-500">{entry.holes}/18</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-golf-green-600 text-xs sm:text-sm">
                    {entry.roundPoints || (11 - entry.position) || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchPlayLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-golf-gold-100 text-golf-gold-800`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
      );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round 3: Match Play Format</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Individual match play within 4-person groups. Points earned from winning matches.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Pos</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Player</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Matches Won</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Matches Played</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Match Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {leaderboard.map((entry: any, index: number) => (
                <tr key={entry.playerId || entry.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-4 py-3">{getRankBadge(entry.position || index + 1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProfilePicture 
                        firstName={entry.playerName?.split(' ')[0] || entry.firstName || entry.user?.firstName || ''} 
                        lastName={entry.playerName?.split(' ')[1] || entry.lastName || entry.user?.lastName || ''} 
                        size="md"
                      />
                      <span className="font-medium">{entry.playerName || `${entry.firstName || entry.user?.firstName || 'Unknown'} ${entry.lastName || entry.user?.lastName || 'Player'}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">Team {entry.team?.teamNumber || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{entry.matchesWon || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{entry.matchesPlayed || 0}</td>
                  <td className="px-4 py-3 text-center font-bold text-golf-green-600">{entry.totalPoints || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
