import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { isUnauthorizedError } from "@/lib/authUtils";
import { RefreshCw, Trophy, Medal, Award, Wifi, WifiOff, Target, Flag, Users } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import LoadingPage from "@/components/LoadingPage";
import IndividualScoresTable from "@/components/IndividualScoresTable";

export default function Scores() {
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
    staleTime: 0, // Always fetch fresh data
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
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
    queryKey: ['/api/team-scramble', 2],
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


  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-gambler-gold/20 text-gambler-gold border border-gambler-gold/40`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-zinc-300/20 text-zinc-100 border border-zinc-300/40`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-amber-700/20 text-amber-500 border border-amber-700/40`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-muted-foreground">
          #{rank}
        </span>
      );
    }
  };

  const podiumTeams = (scores as any[]).slice(0, 3);

  const getRowStyles = (rank: number) => {
    if (rank === 1) return "border-l-4 border-gambler-gold bg-gambler-gold/10";
    if (rank === 2) return "border-l-4 border-zinc-300 bg-zinc-300/10";
    if (rank === 3) return "border-l-4 border-amber-700 bg-amber-700/10";
    return "border-l-4 border-transparent bg-gambler-black/30";
  };

  const scoreClass = (value: any) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "text-foreground";
    if (num < 0) return "text-gambler-green";
    if (num > 0) return "text-red-500";
    return "text-foreground";
  };

  // Check if main data is loading
  const isMainLoading = isLoading || scoresLoading || teamsLoading;
  
  if (isMainLoading) {
    return <LoadingPage message="Loading tournament scores..." fullScreen />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 pb-20">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-gambler-gold" />
            <h2 className="text-2xl sm:text-4xl font-black tracking-[0.18em] text-gambler-gold">LEADERBOARD</h2>
            <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-gambler-green" />
          </div>
          <p className="text-sm sm:text-lg text-muted-foreground mb-4 sm:mb-6">
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
              onClick={() => {
                // Invalidate all queries to ensure fresh data
                queryClient.invalidateQueries({ queryKey: ['/api/live-scores'] });
                queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
                queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
                queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
                queryClient.invalidateQueries({ queryKey: ['/api/team-scramble'] });
                queryClient.invalidateQueries({ queryKey: ['/api/team-better-ball'] });
                queryClient.invalidateQueries({ queryKey: ['/api/hole-scores'] });
                queryClient.invalidateQueries({ queryKey: ['/api/player-stats'] });
                refetch();
              }}
              variant="outline"
              className="bg-gambler-green hover:bg-gambler-green/90 text-gambler-black border-gambler-green font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {podiumTeams.map((team: any, idx: number) => (
            <Card
              key={team.id}
              className={`bg-gambler-slate border ${
                idx === 0
                  ? "border-gambler-gold"
                  : idx === 1
                  ? "border-zinc-300"
                  : "border-amber-700"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {idx === 0 ? "1st Place" : idx === 1 ? "2nd Place" : "3rd Place"}
                  </span>
                  <Medal className={idx === 0 ? "text-gambler-gold" : idx === 1 ? "text-zinc-300" : "text-amber-700"} />
                </div>
                <p className="text-lg font-bold mt-2">Team {team.team.teamNumber}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {team.team.player1Name} & {team.team.player2Name}
                </p>
                <p className="mt-2 text-2xl tabular-nums font-black text-gambler-green">{team.totalPoints}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto overflow-hidden bg-gambler-slate border border-gambler-border">
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
          <Card className="shadow-lg bg-gambler-slate border border-gambler-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gambler-black">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Rank</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Team</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-muted-foreground">Round 1</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-muted-foreground">Round 2</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-muted-foreground">Round 3</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gambler-border">
                    {(scores as any[]).map((score: any) => (
                      <tr key={score.id} className={`${getRowStyles(score.rank)} hover:bg-gambler-black/70 transition-colors`}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">{getRankBadge(score.rank)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-sm sm:text-base">Team {score.team.teamNumber}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
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
                            {/* Show third player for 3-person teams */}
                            {score.team.isThreePersonTeam && score.team.player3Name && (
                              <>
                                <span className="hidden sm:inline">&</span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <ProfilePicture 
                                    firstName={score.team.player3Name.split(' ')[0]} 
                                    lastName={score.team.player3Name.split(' ')[1] || ''} 
                                    size="sm"
                                  />
                                  <span className="truncate">{score.team.player3Name}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base tabular-nums ${scoreClass(score.round1Points)}`}>{score.round1Points || '-'}</td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base tabular-nums ${scoreClass(score.round2Points)}`}>{score.round2Points || '-'}</td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base tabular-nums ${scoreClass(score.round3Points)}`}>{score.round3Points || '-'}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <div className={`font-black text-sm sm:text-base tabular-nums ${scoreClass(score.totalPoints)}`}>{score.totalPoints}</div>
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
          <Round1DetailedView leaderboard={round1BetterBall} />
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

function Round1DetailedView({ leaderboard = [] }: { leaderboard: any[] }) {
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

function Round2DetailedView({ leaderboard = [] }: { leaderboard: any[] }) {
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

function Round3DetailedView({ leaderboard = [] }: { leaderboard: any[] }) {
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
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round 1: Net Better Ball Format</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Teams use best net score between partners on each hole. Lower net strokes wins. Teams ranked by net strokes completed during live play.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Pos</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Gross</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Net Strokes</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">To Par</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Holes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {leaderboard
                .sort((a: any, b: any) => (a.netStrokes || a.totalNetStrokes || 999) - (b.netStrokes || b.totalNetStrokes || 999))
                .map((entry: any, index: number) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{getRankBadge(index + 1)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm">Team {entry.team?.teamNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>{entry.team?.player1Name}</div>
                      <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player2Name}</div>
                      {/* Show third player for 3-person teams */}
                      {entry.team?.isThreePersonTeam && entry.team?.player3Name && (
                        <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player3Name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.totalGrossStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-golf-green-600 text-xs sm:text-sm">{entry.netStrokes || entry.totalNetStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    <span className={entry.grossToPar > 0 ? 'text-red-600' : entry.grossToPar < 0 ? 'text-green-600' : 'text-gray-600'}>
                      {entry.grossToPar > 0 ? '+' : ''}{entry.grossToPar || 'E'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {entry.holesCompleted || 0}/18
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
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round 2: Scramble Format (Net)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Teams play one ball from best position. Team handicap: 35% of lower + 15% of higher handicap. Teams ranked by lowest net strokes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Pos</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team Hcp</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Gross</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Net</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">To Par</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {leaderboard
                .sort((a: any, b: any) => (a.totalNetStrokes || 999) - (b.totalNetStrokes || 999))
                .map((entry: any, index: number) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{getRankBadge(index + 1)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm">Team {entry.team?.teamNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>{entry.team?.player1Name} ({entry.team?.player1Handicap})</div>
                      <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player2Name} ({entry.team?.player2Handicap})</div>
                      {/* Show third player for 3-person teams */}
                      {entry.team?.isThreePersonTeam && entry.team?.player3Name && (
                        <div className="sm:inline sm:before:content-['_&_'] ">{entry.team?.player3Name} ({entry.team?.player3Handicap})</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.teamHandicap || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm">{entry.totalGrossStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-golf-green-600 text-xs sm:text-sm">{entry.totalNetStrokes || '-'}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    <span className={entry.netToPar > 0 ? 'text-red-600' : entry.netToPar < 0 ? 'text-green-600' : 'text-gray-600'}>
                      {entry.netToPar > 0 ? '+' : ''}{entry.netToPar || 'E'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-golf-green-600 text-xs sm:text-sm">
                    {entry.totalPoints || 0}
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
