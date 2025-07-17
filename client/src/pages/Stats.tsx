import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Trophy, 
  Flag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Award,
  BarChart3,
  PieChart,
  User,
  ExternalLink
} from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Mock statistics data structure
interface PlayerStats {
  userId: number;
  firstName: string;
  lastName: string;
  totalRounds: number;
  totalHoles: number;
  averageScore: number;
  fairwayPercentage: number;
  greenPercentage: number;
  averagePutts: number;
  totalPenalties: number;
  totalSandSaves: number;
  totalUpAndDowns: number;
  totalDuffs: number;
  birdies: number;
  eagles: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  rounds: {
    round: number;
    score: number;
    fairwayHits: number;
    fairwayAttempts: number;
    greenHits: number;
    greenAttempts: number;
    putts: number;
    penalties: number;
    sandSaves: number;
    upAndDowns: number;
    duffs: number;
  }[];
}

export default function Stats() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Real-time player statistics
  const { data: playerStats = [], isLoading } = useQuery({
    queryKey: ["/api/player-stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // WebSocket for real-time updates
  useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'HOLE_SCORE_UPDATE' || data.type === 'HOLE_STATS_UPDATE') {
        // Invalidate player statistics to trigger refresh
        queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-400 mx-auto mb-4"></div>
            <p>Loading tournament statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playerStats || playerStats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-golf-green-400" />
            <h2 className="text-2xl font-bold mb-2">No Statistics Available</h2>
            <p className="text-gray-300">Tournament statistics will appear here once players start recording scores and stats during live rounds.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate tournament-wide statistics
  const totalHoles = playerStats.reduce((sum: number, player: any) => sum + player.totalHoles, 0);
  const totalRounds = playerStats.reduce((sum: number, player: any) => sum + player.totalRounds, 0);
  const averageFairwayPercentage = totalHoles > 0 ? (
    playerStats.reduce((sum: number, player: any) => sum + (parseFloat(player.fairwayPercentage) || 0), 0) / playerStats.length
  ).toFixed(1) : 0;
  const averageGreenPercentage = totalHoles > 0 ? (
    playerStats.reduce((sum: number, player: any) => sum + (parseFloat(player.greenPercentage) || 0), 0) / playerStats.length
  ).toFixed(1) : 0;



  // Remove duplicate loading check

  const getLeaderboardData = (statKey: keyof PlayerStats, title: string, isPercentage = false, inverse = false) => {
    if (!playerStats) return [];
    
    const sorted = [...playerStats].sort((a, b) => {
      const aVal = Number(a[statKey]);
      const bVal = Number(b[statKey]);
      return inverse ? aVal - bVal : bVal - aVal;
    });

    return {
      title,
      data: sorted.map((player, index) => ({
        rank: index + 1,
        player,
        value: Number(player[statKey]),
        isPercentage
      }))
    };
  };

  const leaderboards = [
    getLeaderboardData('fairwayPercentage', 'Fairway Accuracy', true),
    getLeaderboardData('greenPercentage', 'Greens in Regulation', true),
    getLeaderboardData('averagePutts', 'Putting Average', false, true),
    getLeaderboardData('birdies', 'Most Birdies', false, false),
    getLeaderboardData('totalPenalties', 'Penalty Strokes', false, false),
    getLeaderboardData('totalSandSaves', 'Sand Saves', false, false),
    getLeaderboardData('totalUpAndDowns', 'Up & Downs', false, false),
    getLeaderboardData('totalPoints', 'Total Points', false, false)
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-golf-green-600 mb-2 flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Tournament Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive golf statistics and leaderboards for all players
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="golf-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-golf-green-600" />
                  Tournament Leaders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fairway Accuracy</span>
                    <div className="flex items-center gap-2">
                      {playerStats.length > 0 && (
                        <>
                          <ProfilePicture 
                            firstName={playerStats.sort((a, b) => parseFloat(b.fairwayPercentage) - parseFloat(a.fairwayPercentage))[0]?.firstName || ""} 
                            lastName={playerStats.sort((a, b) => parseFloat(b.fairwayPercentage) - parseFloat(a.fairwayPercentage))[0]?.lastName || ""} 
                            size="sm" 
                          />
                          <span className="text-sm">{playerStats.sort((a, b) => parseFloat(b.fairwayPercentage) - parseFloat(a.fairwayPercentage))[0]?.fairwayPercentage || 0}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GIR</span>
                    <div className="flex items-center gap-2">
                      {playerStats.length > 0 && (
                        <>
                          <ProfilePicture 
                            firstName={playerStats.sort((a, b) => parseFloat(b.greenPercentage) - parseFloat(a.greenPercentage))[0]?.firstName || ""} 
                            lastName={playerStats.sort((a, b) => parseFloat(b.greenPercentage) - parseFloat(a.greenPercentage))[0]?.lastName || ""} 
                            size="sm" 
                          />
                          <span className="text-sm">{playerStats.sort((a, b) => parseFloat(b.greenPercentage) - parseFloat(a.greenPercentage))[0]?.greenPercentage || 0}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Putting</span>
                    <div className="flex items-center gap-2">
                      {playerStats.length > 0 && (
                        <>
                          <ProfilePicture 
                            firstName={playerStats.sort((a, b) => parseFloat(a.averagePutts) - parseFloat(b.averagePutts))[0]?.firstName || ""} 
                            lastName={playerStats.sort((a, b) => parseFloat(a.averagePutts) - parseFloat(b.averagePutts))[0]?.lastName || ""} 
                            size="sm" 
                          />
                          <span className="text-sm">{playerStats.sort((a, b) => parseFloat(a.averagePutts) - parseFloat(b.averagePutts))[0]?.averagePutts || 0} avg</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="golf-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-golf-green-600" />
                  Accuracy Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Avg Fairway %</span>
                      <span className="text-sm font-medium">{averageFairwayPercentage}%</span>
                    </div>
                    <Progress value={parseFloat(averageFairwayPercentage.toString())} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Avg GIR %</span>
                      <span className="text-sm font-medium">{averageGreenPercentage}%</span>
                    </div>
                    <Progress value={parseFloat(averageGreenPercentage.toString())} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="golf-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="w-5 h-5 text-golf-green-600" />
                  Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Birdies</span>
                    <Badge variant="default">{playerStats.reduce((sum, p) => sum + p.birdies, 0)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Eagles</span>
                    <Badge variant="secondary">{playerStats.reduce((sum, p) => sum + p.eagles, 0)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Pars</span>
                    <Badge variant="outline">{playerStats.reduce((sum, p) => sum + p.pars, 0)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="golf-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Trouble Shots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Duffs</span>
                    <Badge variant="destructive">7</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Penalty Strokes</span>
                    <Badge variant="destructive">20</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sand Saves</span>
                    <Badge variant="default">8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaderboards.map((leaderboard, index) => (
              <Card key={index} className="golf-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-golf-green-600" />
                    {leaderboard.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.data.slice(0, 5).map((entry) => (
                      <div key={entry.player.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            entry.rank === 1 ? 'bg-yellow-500' : 
                            entry.rank === 2 ? 'bg-gray-400' :
                            entry.rank === 3 ? 'bg-amber-600' : 
                            'bg-golf-green-600'
                          }`}>
                            {entry.rank}
                          </div>
                          <ProfilePicture 
                            firstName={entry.player.firstName} 
                            lastName={entry.player.lastName} 
                            size="sm"
                          />
                          <span className="font-medium text-sm">
                            {entry.player.firstName} {entry.player.lastName}
                          </span>
                        </div>
                        <Badge variant={entry.rank <= 3 ? "default" : "outline"}>
                          {entry.isPercentage ? `${entry.value.toFixed(1)}%` : entry.value.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {playerStats?.map((player) => (
              <Card key={player.userId} className="golf-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ProfilePicture 
                      firstName={player.firstName} 
                      lastName={player.lastName} 
                      size="lg"
                    />
                    <div>
                      <div className="font-bold">{player.firstName} {player.lastName}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.totalRounds} rounds • {player.totalHoles} holes
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Score</span>
                        <span className="font-medium">{player.averageScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fairway %</span>
                        <span className="font-medium">{player.fairwayPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">GIR %</span>
                        <span className="font-medium">{player.greenPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Putts</span>
                        <span className="font-medium">{player.averagePutts.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Birdies</span>
                        <Badge variant="default">{player.birdies}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Eagles</span>
                        <Badge variant="secondary">{player.eagles}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Duffs</span>
                        <Badge variant="destructive">{player.totalDuffs}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Penalties</span>
                        <Badge variant="destructive">{player.totalPenalties}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/player/${player.userId}`}>
                      <Button className="w-full" variant="outline">
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}