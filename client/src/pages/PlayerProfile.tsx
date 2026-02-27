import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  MapPin,
  BarChart3,
  Flag,
  ArrowLeft,
  History,
  Star,
  Medal,
  Clock
} from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { Link } from "wouter";

interface PlayerHistoricalStats {
  id: number;
  firstName: string;
  lastName: string;
  handicap: number;
  totalHoles: number;
  totalStrokes: number;
  averageScore: string;
  totalPutts: number;
  averagePutts: string;
  totalPenalties: number;
  fairwayPercentage: string;
  fairwayAttempts: number;
  greenPercentage: string;
  greenAttempts: number;
  sandSaves: number;
  upAndDowns: number;
  tournamentHistory: TournamentHistory[];
  totalTournaments: number;
  bestFinish: number | null;
  totalPoints: number;
}

interface TournamentHistory {
  id: number;
  tournamentYear: number;
  teamPartner: string;
  finalRanking: number | null;
  totalPoints: number;
  round1Points: number;
  round2Points: number;
  round3Points: number;
}

interface YearlyStats {
  year: number;
  totalHoles: number;
  totalStrokes: number;
  averageScore: string;
  totalPutts: number;
  averagePutts: string;
  fairwayPercentage: string;
  fairwayAttempts: number;
  greenPercentage: string;
  greenAttempts: number;
  tournamentData: TournamentHistory | null;
}

export default function PlayerProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  const playerId = parseInt(userId || "0");
  
  // Fetch player lifetime statistics
  const { data: playerStats, isLoading: isLoadingStats } = useQuery<PlayerHistoricalStats>({
    queryKey: [`/api/player-lifetime-stats/${playerId}`],
    enabled: !!playerId,
  });

  // Fetch player yearly statistics
  const { data: yearlyStats, isLoading: isLoadingYearly } = useQuery<YearlyStats>({
    queryKey: [`/api/player-yearly-stats/${playerId}/${selectedYear}`],
    enabled: !!playerId && !!selectedYear,
  });

  // Fetch player tournament history
  const { data: tournamentHistory = [], isLoading: isLoadingHistory } = useQuery<TournamentHistory[]>({
    queryKey: [`/api/player-history/${playerId}`],
    enabled: !!playerId,
  });

  if (isLoadingStats || isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-400 mx-auto mb-4"></div>
            <p>Loading player profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Player Not Found</h2>
            <p className="text-gray-300">The requested player profile could not be found.</p>
            <Link href="/stats">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Statistics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableYears = tournamentHistory.map(t => t.tournamentYear).sort((a, b) => b - a);
  const currentTournament = tournamentHistory.find(t => t.tournamentYear === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <Link href="/stats">
            <Button variant="outline" className="text-white border-golf-green-400 hover:bg-golf-green-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Statistics
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Player Profile</h1>
            <p className="text-gray-300 text-sm sm:text-base">Comprehensive performance analysis</p>
          </div>
          <div className="hidden sm:block w-32"></div>
        </div>

        {/* Player Header Card */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <ProfilePicture 
                  firstName={playerStats.firstName} 
                  lastName={playerStats.lastName} 
                  size="xl" 
                />
                <div className="flex-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-white">
                    {playerStats.firstName} {playerStats.lastName}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-lg">Handicap: {playerStats.handicap}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <Badge variant="outline" className="text-golf-green-400 border-golf-green-400 text-xs sm:text-sm">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {playerStats.totalTournaments} Tournaments
                    </Badge>
                    {playerStats.bestFinish && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs sm:text-sm">
                        <Medal className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Best Finish: #{playerStats.bestFinish}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-golf-green-400">
                  {playerStats.totalPoints}
                </div>
                <p className="text-gray-300 text-sm">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Selection */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-white font-medium text-center sm:text-left">Select Year:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {availableYears.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? "bg-golf-green-400 text-black" : "text-white border-golf-green-400 hover:bg-golf-green-400/10"}
                  size="sm"
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Statistics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-golf-green-400 data-[state=active]:text-black text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-white data-[state=active]:bg-golf-green-400 data-[state=active]:text-black text-xs sm:text-sm">
              {selectedYear} Season
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-golf-green-400 data-[state=active]:text-black text-xs sm:text-sm">
              Tournament History
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-white data-[state=active]:bg-golf-green-400 data-[state=active]:text-black text-xs sm:text-sm">
              Performance Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-golf-green-400">
                    {playerStats.averageScore}
                  </div>
                  <p className="text-sm text-gray-300">per hole</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Fairway Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-golf-green-400">
                    {playerStats.fairwayAttempts > 0 ? `${playerStats.fairwayPercentage}%` : "N/A"}
                  </div>
                  <Progress value={playerStats.fairwayAttempts > 0 ? parseFloat(playerStats.fairwayPercentage) : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Green Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-golf-green-400">
                    {playerStats.greenAttempts > 0 ? `${playerStats.greenPercentage}%` : "N/A"}
                  </div>
                  <Progress value={playerStats.greenAttempts > 0 ? parseFloat(playerStats.greenPercentage) : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Average Putts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-golf-green-400">
                    {playerStats.fairwayAttempts > 0 ? playerStats.averagePutts : "N/A"}
                  </div>
                  <p className="text-sm text-gray-300">per hole</p>
                </CardContent>
              </Card>
            </div>

            {/* Career Summary */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Career Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golf-green-400">{playerStats.totalHoles}</div>
                    <p className="text-sm text-gray-300">Total Holes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golf-green-400">{playerStats.totalStrokes}</div>
                    <p className="text-sm text-gray-300">Total Strokes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golf-green-400">{playerStats.sandSaves}</div>
                    <p className="text-sm text-gray-300">Sand Saves</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golf-green-400">{playerStats.upAndDowns}</div>
                    <p className="text-sm text-gray-300">Up & Downs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yearly Stats Tab */}
          <TabsContent value="yearly" className="space-y-6">
            {isLoadingYearly ? (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-green-400 mx-auto mb-4"></div>
                <p>Loading {selectedYear} statistics...</p>
              </div>
            ) : yearlyStats ? (
              <div className="space-y-6">
                {/* Tournament Results */}
                {currentTournament && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        {selectedYear} Tournament Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Tournament Performance</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Team Partner:</span>
                              <span className="text-white font-medium">{currentTournament.teamPartner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Final Ranking:</span>
                              <span className="text-golf-green-400 font-bold">
                                #{currentTournament.finalRanking || 'TBD'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Total Points:</span>
                              <span className="text-golf-green-400 font-bold">{currentTournament.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Round Breakdown</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Round 1:</span>
                              <span className="text-white">{currentTournament.round1Points} pts</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Round 2:</span>
                              <span className="text-white">{currentTournament.round2Points} pts</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Round 3:</span>
                              <span className="text-white">{currentTournament.round3Points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Yearly Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-golf-green-400">
                        {yearlyStats.averageScore}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Fairway Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-golf-green-400">
                        {yearlyStats.fairwayAttempts > 0 ? `${yearlyStats.fairwayPercentage}%` : "N/A"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Green Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-golf-green-400">
                        {yearlyStats.greenAttempts > 0 ? `${yearlyStats.greenPercentage}%` : "N/A"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Average Putts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-golf-green-400">
                        {yearlyStats.fairwayAttempts > 0 ? yearlyStats.averagePutts : "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center text-white">
                <p>No data available for {selectedYear}</p>
              </div>
            )}
          </TabsContent>

          {/* Tournament History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Tournament History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tournamentHistory.map((tournament, index) => (
                    <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-golf-green-400 border-golf-green-400">
                          {tournament.tournamentYear}
                        </Badge>
                        <div>
                          <p className="text-white font-medium">
                            Partner: {tournament.teamPartner}
                          </p>
                          <p className="text-sm text-gray-300">
                            Total Points: {tournament.totalPoints}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-golf-green-400">
                          #{tournament.finalRanking || 'TBD'}
                        </div>
                        <p className="text-sm text-gray-300">Final Ranking</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-300 py-8">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-golf-green-400" />
                  <p>Performance trends charts will be available with more tournament data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}