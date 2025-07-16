import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  PieChart
} from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

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

  // This would be replaced with actual API calls
  const { data: playerStats, isLoading } = useQuery({
    queryKey: ["/api/player-stats"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          userId: 1,
          firstName: "Nick",
          lastName: "Grossi",
          totalRounds: 3,
          totalHoles: 54,
          averageScore: 85.2,
          fairwayPercentage: 65.4,
          greenPercentage: 44.4,
          averagePutts: 1.8,
          totalPenalties: 12,
          totalSandSaves: 3,
          totalUpAndDowns: 8,
          totalDuffs: 5,
          birdies: 4,
          eagles: 1,
          pars: 28,
          bogeys: 18,
          doubleBogeys: 3,
          rounds: [
            { round: 1, score: 88, fairwayHits: 8, fairwayAttempts: 12, greenHits: 6, greenAttempts: 18, putts: 32, penalties: 4, sandSaves: 1, upAndDowns: 3, duffs: 2 },
            { round: 2, score: 82, fairwayHits: 9, fairwayAttempts: 12, greenHits: 9, greenAttempts: 18, putts: 30, penalties: 3, sandSaves: 2, upAndDowns: 3, duffs: 1 },
            { round: 3, score: 86, fairwayHits: 7, fairwayAttempts: 12, greenHits: 7, greenAttempts: 18, putts: 34, penalties: 5, sandSaves: 0, upAndDowns: 2, duffs: 2 }
          ]
        },
        {
          userId: 2,
          firstName: "Connor",
          lastName: "Patterson",
          totalRounds: 3,
          totalHoles: 54,
          averageScore: 78.5,
          fairwayPercentage: 72.2,
          greenPercentage: 61.1,
          averagePutts: 1.7,
          totalPenalties: 8,
          totalSandSaves: 5,
          totalUpAndDowns: 12,
          totalDuffs: 2,
          birdies: 8,
          eagles: 0,
          pars: 35,
          bogeys: 10,
          doubleBogeys: 1,
          rounds: [
            { round: 1, score: 79, fairwayHits: 9, fairwayAttempts: 12, greenHits: 11, greenAttempts: 18, putts: 29, penalties: 2, sandSaves: 2, upAndDowns: 4, duffs: 1 },
            { round: 2, score: 76, fairwayHits: 10, fairwayAttempts: 12, greenHits: 12, greenAttempts: 18, putts: 28, penalties: 3, sandSaves: 2, upAndDowns: 4, duffs: 0 },
            { round: 3, score: 81, fairwayHits: 8, fairwayAttempts: 12, greenHits: 10, greenAttempts: 18, putts: 31, penalties: 3, sandSaves: 1, upAndDowns: 4, duffs: 1 }
          ]
        }
      ] as PlayerStats[];
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
    getLeaderboardData('totalDuffs', 'Most Duffs', false, false),
    getLeaderboardData('birdies', 'Most Birdies', false, false),
    getLeaderboardData('totalPenalties', 'Penalty Strokes', false, false),
    getLeaderboardData('totalSandSaves', 'Sand Saves', false, false),
    getLeaderboardData('totalUpAndDowns', 'Up & Downs', false, false)
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
                      <ProfilePicture firstName="Connor" lastName="Patterson" size="sm" />
                      <span className="text-sm">72.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GIR</span>
                    <div className="flex items-center gap-2">
                      <ProfilePicture firstName="Connor" lastName="Patterson" size="sm" />
                      <span className="text-sm">61.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Putting</span>
                    <div className="flex items-center gap-2">
                      <ProfilePicture firstName="Connor" lastName="Patterson" size="sm" />
                      <span className="text-sm">1.7 avg</span>
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
                      <span className="text-sm font-medium">68.8%</span>
                    </div>
                    <Progress value={68.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Avg GIR %</span>
                      <span className="text-sm font-medium">52.8%</span>
                    </div>
                    <Progress value={52.8} className="h-2" />
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
                    <Badge variant="default">12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Eagles</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Pars</span>
                    <Badge variant="outline">63</Badge>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}