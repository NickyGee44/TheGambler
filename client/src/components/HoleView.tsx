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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-8 h-8 text-golf-green-400" />
            <h1 className="text-3xl font-bold text-white">Hole {hole.number}</h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
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
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1 border border-gray-700 shadow-lg">
          <button
            onClick={() => setActiveTab('score')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'score' 
                ? 'bg-golf-green-600 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            GPS
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'score' && (
          <Card className="mb-6 bg-gray-800 border-2 border-gray-700 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-white">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => updateScore(currentScore - 1)}
                disabled={currentScore <= 0 || isUpdating}
                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                <Minus className="w-6 h-6" />
              </Button>
              
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(currentScore, hole.par)}`}>
                  {currentScore || "-"}
                </div>
                {currentScore > 0 && (
                  <div className="text-sm font-medium text-gray-300">
                    {getScoreName(currentScore, hole.par)}
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => updateScore(currentScore + 1)}
                disabled={isUpdating}
                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
            
            {isUpdating && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-golf-green-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-300">Saving score...</p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <Card className="mb-6 bg-gray-800 border-2 border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center flex items-center justify-center gap-2 text-white">
                <Flag className="w-5 h-5" />
                Golf Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Fairway Hit (only for Par 4 and Par 5) */}
              {hole.par >= 4 && (
                <div>
                  <h3 className="font-semibold mb-3 text-white">Fairway in Regulation</h3>
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
                <h3 className="font-semibold mb-3 text-white">Drive Direction</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['left', 'hit', 'right'].map((direction) => (
                    <Button
                      key={direction}
                      variant={driveDirection === direction ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDriveDirection(direction)}
                      className={`capitalize ${driveDirection === direction ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
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
                      className={`capitalize ${driveDirection === direction ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
                    >
                      {direction}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Green in Regulation */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Green in Regulation</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={greenInRegulation === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGreenInRegulation(true)}
                    className={`flex items-center gap-2 ${greenInRegulation === true ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white border-golf-green-600' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Hit
                  </Button>
                  <Button
                    variant={greenInRegulation === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setGreenInRegulation(false)}
                    className={`flex items-center gap-2 ${greenInRegulation === false ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Missed
                  </Button>
                </div>
              </div>

              {/* Putts */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Number of Putts</h3>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPutts(Math.max(0, putts - 1))}
                    disabled={putts <= 0}
                    className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-3xl font-bold w-16 text-center text-white">
                    {putts}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPutts(putts + 1)}
                    className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Penalties */}
              <div>
                <h3 className="font-semibold mb-3 text-white">Penalty Strokes</h3>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPenalties(Math.max(0, penalties - 1))}
                    disabled={penalties <= 0}
                    className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-3xl font-bold w-16 text-center text-white">
                    {penalties}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPenalties(penalties + 1)}
                    className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sand Saves & Up and Downs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-white">Sand Saves</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandSaves(Math.max(0, sandSaves - 1))}
                      disabled={sandSaves <= 0}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="text-xl font-bold w-8 text-center text-white">
                      {sandSaves}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandSaves(sandSaves + 1)}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-white">Up & Downs</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpAndDowns(Math.max(0, upAndDowns - 1))}
                      disabled={upAndDowns <= 0}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="text-xl font-bold w-8 text-center text-white">
                      {upAndDowns}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpAndDowns(upAndDowns + 1)}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
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
        <Card className="mb-6 bg-gray-800 border border-gray-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Hole Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-300">Par</div>
                <div className="text-lg font-semibold text-white">{hole.par}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Yardage</div>
                <div className="text-lg font-semibold text-white">{hole.yardage}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Handicap</div>
                <div className="text-lg font-semibold text-white">{hole.handicap}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300">Hole</div>
                <div className="text-lg font-semibold text-white">{hole.number}</div>
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
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onNextHole}
            disabled={isLastHole}
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white shadow-lg"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}