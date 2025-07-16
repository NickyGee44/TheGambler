import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGPS } from "@/hooks/useGPS";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { HoleData, calculateDistance } from "@shared/courseData";
import { 
  Target, 
  MapPin, 
  Navigation, 
  Plus, 
  Minus, 
  Flag, 
  ArrowLeft, 
  ArrowRight,
  Crosshair,
  Map,
  Trophy,
  CheckCircle,
  XCircle
} from "lucide-react";
import ProfessionalGolfGPS from "./ProfessionalGolfGPS";
import { getCourseForRound } from "@shared/courseData";

interface HoleViewProps {
  hole: HoleData;
  round: number;
  currentScore: number;
  onScoreUpdate: (strokes: number) => void;
  onPreviousHole: () => void;
  onNextHole: () => void;
  isFirstHole: boolean;
  isLastHole: boolean;
  isUpdating: boolean;
  onShowLeaderboard?: () => void;
}

export default function HoleView({
  hole,
  round,
  currentScore,
  onScoreUpdate,
  onPreviousHole,
  onNextHole,
  isFirstHole,
  isLastHole,
  isUpdating,
  onShowLeaderboard
}: HoleViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'score' | 'stats' | 'map'>('score');
  
  // Golf statistics state
  const [fairwayHit, setFairwayHit] = useState<boolean | null>(null);
  const [greenInRegulation, setGreenInRegulation] = useState<boolean | null>(null);
  const [driveDirection, setDriveDirection] = useState<string>('');
  const [putts, setPutts] = useState<number>(0);
  const [penalties, setPenalties] = useState<number>(0);
  const [sandSaves, setSandSaves] = useState<number>(0);
  const [upAndDowns, setUpAndDowns] = useState<number>(0);

  // Statistics update mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (statsData: any) => {
      return await apiRequest(`/api/hole-scores/${round}/${hole.number}/stats`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Statistics Updated",
        description: "Golf statistics have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hole-scores", round] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save statistics: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-save statistics when they change
  const saveStatistics = () => {
    const stats = {
      fairwayInRegulation: fairwayHit,
      greenInRegulation: greenInRegulation,
      driveDirection: driveDirection || null,
      putts,
      penalties,
      sandSaves,
      upAndDowns,
    };
    
    updateStatsMutation.mutate(stats);
  };
  
  // Get course data for GPS
  const courseData = getCourseForRound(round);

  const updateScore = (strokes: number) => {
    if (strokes < 1) return;
    onScoreUpdate(strokes);
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return "text-blue-600"; // Eagle or better
    if (diff === -1) return "text-green-600"; // Birdie
    if (diff === 0) return "text-gray-600"; // Par
    if (diff === 1) return "text-yellow-600"; // Bogey
    return "text-red-600"; // Double bogey or worse
  };

  const getScoreName = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -3) return "Albatross";
    if (diff === -2) return "Eagle";
    if (diff === -1) return "Birdie";
    if (diff === 0) return "Par";
    if (diff === 1) return "Bogey";
    if (diff === 2) return "Double Bogey";
    return "Triple Bogey+";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 via-golf-sand-50 to-golf-gold-50 dark:from-golf-green-900 dark:via-golf-sand-900 dark:to-golf-gold-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-8 h-8 text-golf-green-600" />
            <h1 className="text-3xl font-bold text-golf-green-600">Hole {hole.number}</h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-golf-green-700 dark:text-golf-green-200">
            <span>Par {hole.par}</span>
            <span>•</span>
            <span>{hole.yardage} yards</span>
            <span>•</span>
            <span>HCP {hole.handicap}</span>
          </div>
        </div>

        {/* Leaderboard Button */}
        {onShowLeaderboard && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-yellow-400 shadow-lg"
              onClick={onShowLeaderboard}
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white/90 dark:bg-golf-green-800/90 backdrop-blur-sm rounded-lg p-1 border border-golf-green-200 dark:border-golf-green-700 shadow-lg">
          <button
            onClick={() => setActiveTab('score')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'score' 
                ? 'bg-golf-green-600 text-white shadow-md' 
                : 'text-golf-green-600 hover:bg-golf-green-50 dark:hover:bg-golf-green-700/50'
            }`}
          >
            <Target className="w-4 h-4" />
            Score
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'stats' 
                ? 'bg-golf-green-600 text-white shadow-md' 
                : 'text-golf-green-600 hover:bg-golf-green-50 dark:hover:bg-golf-green-700/50'
            }`}
          >
            <Flag className="w-4 h-4" />
            Stats
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'map' 
                ? 'bg-golf-green-600 text-white shadow-md' 
                : 'text-golf-green-600 hover:bg-golf-green-50 dark:hover:bg-golf-green-700/50'
            }`}
          >
            <Map className="w-4 h-4" />
            GPS
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'score' && (
          <Card className="mb-6 bg-white/90 dark:bg-golf-green-800/90 backdrop-blur-sm border-2 border-golf-green-200 dark:border-golf-green-600 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => updateScore(currentScore - 1)}
                disabled={currentScore <= 0 || isUpdating}
                className="w-12 h-12 rounded-full"
              >
                <Minus className="w-6 h-6" />
              </Button>
              
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(currentScore, hole.par)}`}>
                  {currentScore || "-"}
                </div>
                {currentScore > 0 && (
                  <div className="text-sm font-medium text-golf-green-700 dark:text-golf-green-200">
                    {getScoreName(currentScore, hole.par)}
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => updateScore(currentScore + 1)}
                disabled={isUpdating}
                className="w-12 h-12 rounded-full"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
            
            {isUpdating && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-golf-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-golf-green-700 dark:text-golf-green-200">Saving score...</p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <Card className="mb-6 bg-white/90 dark:bg-golf-green-800/90 backdrop-blur-sm border-2 border-golf-green-200 dark:border-golf-green-600 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Flag className="w-5 h-5" />
                Golf Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Fairway Hit (only for Par 4 and Par 5) */}
              {hole.par >= 4 && (
                <div>
                  <h3 className="font-semibold mb-3 text-golf-green-800 dark:text-golf-green-100">Fairway in Regulation</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={fairwayHit === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFairwayHit(true)}
                      className="flex items-center gap-2 bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600"
                    >
                      <Target className="w-4 h-4" />
                      Hit
                    </Button>
                    <Button
                      variant={fairwayHit === false ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setFairwayHit(false)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                      Missed
                    </Button>
                  </div>
                </div>
              )}

              {/* Drive Direction */}
              <div>
                <h3 className="font-semibold mb-3 text-golf-green-800 dark:text-golf-green-100">Drive Direction</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['left', 'hit', 'right'].map((direction) => (
                    <Button
                      key={direction}
                      variant={driveDirection === direction ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDriveDirection(direction)}
                      className={`capitalize ${driveDirection === direction ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300'}`}
                    >
                      {direction}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['short', 'long', 'duff'].map((direction) => (
                    <Button
                      key={direction}
                      variant={driveDirection === direction ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDriveDirection(direction)}
                      className={`capitalize ${driveDirection === direction ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300'}`}
                    >
                      {direction}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Green in Regulation */}
              <div>
                <h3 className="font-semibold mb-3 text-golf-green-800 dark:text-golf-green-100">Green in Regulation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={greenInRegulation === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGreenInRegulation(true)}
                    className={`flex items-center gap-2 ${greenInRegulation === true ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Hit
                  </Button>
                  <Button
                    variant={greenInRegulation === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setGreenInRegulation(false)}
                    className={`flex items-center gap-2 ${greenInRegulation === false ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300'}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Missed
                  </Button>
                </div>
              </div>

              {/* Putts */}
              <div>
                <h3 className="font-semibold mb-3 text-golf-green-800 dark:text-golf-green-100">Number of Putts</h3>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPutts(Math.max(0, putts - 1))}
                    disabled={putts <= 0}
                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-3xl font-bold w-16 text-center text-golf-green-800 dark:text-golf-green-100">
                    {putts}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPutts(putts + 1)}
                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Penalties */}
              <div>
                <h3 className="font-semibold mb-3 text-golf-green-800 dark:text-golf-green-100">Penalty Strokes</h3>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPenalties(Math.max(0, penalties - 1))}
                    disabled={penalties <= 0}
                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-3xl font-bold w-16 text-center text-golf-green-800 dark:text-golf-green-100">
                    {penalties}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPenalties(penalties + 1)}
                    className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sand Saves & Up and Downs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-golf-green-800 dark:text-golf-green-100">Sand Saves</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandSaves(Math.max(0, sandSaves - 1))}
                      disabled={sandSaves <= 0}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="text-xl font-bold w-8 text-center text-golf-green-800 dark:text-golf-green-100">
                      {sandSaves}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandSaves(sandSaves + 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-golf-green-800 dark:text-golf-green-100">Up & Downs</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpAndDowns(Math.max(0, upAndDowns - 1))}
                      disabled={upAndDowns <= 0}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="text-xl font-bold w-8 text-center text-golf-green-800 dark:text-golf-green-100">
                      {upAndDowns}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpAndDowns(upAndDowns + 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-golf-green-800 border-golf-green-300"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Save Statistics Button */}
              <div className="pt-4">
                <Button
                  onClick={saveStatistics}
                  disabled={updateStatsMutation.isPending}
                  className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white font-semibold py-3"
                >
                  {updateStatsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4 mr-2" />
                      Save Statistics
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GPS Map Tab */}
        {activeTab === 'map' && (
          <div className="mb-6">
            <ProfessionalGolfGPS 
              hole={hole} 
              courseName={courseData.name}
              courseCenter={courseData.clubhouse}
              round={round}
            />
          </div>
        )}

        {/* GPS integrated into map tab now */}

        {/* Hole Info Card */}
        <Card className="mb-6 bg-white/90 dark:bg-golf-green-800/90 backdrop-blur-sm border border-golf-green-200 dark:border-golf-green-600 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Hole Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-golf-green-700 dark:text-golf-green-200">Par</div>
                <div className="text-lg font-semibold">{hole.par}</div>
              </div>
              <div>
                <div className="text-sm text-golf-green-700 dark:text-golf-green-200">Yardage</div>
                <div className="text-lg font-semibold">{hole.yardage}</div>
              </div>
              <div>
                <div className="text-sm text-golf-green-700 dark:text-golf-green-200">Handicap</div>
                <div className="text-lg font-semibold">{hole.handicap}</div>
              </div>
              <div>
                <div className="text-sm text-golf-green-700 dark:text-golf-green-200">Hole</div>
                <div className="text-lg font-semibold">{hole.number}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onPreviousHole}
            disabled={isFirstHole}
            className="flex-1 bg-white/90 dark:bg-golf-green-800/90 border-golf-green-200 dark:border-golf-green-600 hover:bg-golf-green-50 dark:hover:bg-golf-green-700/70 text-golf-green-700 dark:text-golf-green-200 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onNextHole}
            disabled={isLastHole}
            className="flex-1 bg-white/90 dark:bg-golf-green-800/90 border-golf-green-200 dark:border-golf-green-600 hover:bg-golf-green-50 dark:hover:bg-golf-green-700/70 text-golf-green-700 dark:text-golf-green-200 shadow-lg"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}