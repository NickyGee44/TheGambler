import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGPS } from "@/hooks/useGPS";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { HoleData, getCourseForRound } from "@shared/courseData";
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
  XCircle,
  Maximize2
} from "lucide-react";
import { EnhancedGolfGPS } from "./EnhancedGolfGPS";
import { FullScreenGPS } from "./FullScreenGPS";


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
  holeScores: any[];
  currentMatch?: any;
  userId?: number;
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
  onShowLeaderboard,
  holeScores,
  currentMatch,
  userId
}: HoleViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'scoring' | 'map'>('scoring');
  const [showFullScreenGPS, setShowFullScreenGPS] = useState(false);
  
  // Golf statistics state
  const [fairwayInRegulation, setFairwayInRegulation] = useState<boolean | null>(null);
  const [greenInRegulation, setGreenInRegulation] = useState<boolean | null>(null);

  const [putts, setPutts] = useState<number>(0);
  const [penalties, setPenalties] = useState<number>(0);
  const [sandSaves, setSandSaves] = useState<number>(0);
  const [upAndDowns, setUpAndDowns] = useState<number>(0);
  
  // Auto-save timer refs
  const scoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isSavingStats, setIsSavingStats] = useState(false);

  // Statistics update mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (statsData: any) => {
      return await apiRequest('PATCH', `/api/hole-scores/${round}/${hole.number}/stats`, statsData);
    },
    onSuccess: () => {
      setIsSavingStats(false);
      queryClient.invalidateQueries({ queryKey: ["/api/hole-scores", round] });
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
    },
    onError: (error) => {
      setIsSavingStats(false);
      toast({
        title: "Error",
        description: "Failed to save statistics: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-save statistics with 1-second delay after user stops making changes
  const scheduleStatsSave = () => {
    if (statsTimeoutRef.current) {
      clearTimeout(statsTimeoutRef.current);
    }
    
    setIsSavingStats(true);
    
    statsTimeoutRef.current = setTimeout(() => {
      const stats = {
        fairwayInRegulation: fairwayInRegulation,
        greenInRegulation: greenInRegulation,
        putts,
        penalties,
        sandSaves,
        upAndDowns,
      };
      
      updateStatsMutation.mutate(stats);
    }, 1000);
  };

  // Auto-save score with 2-second delay after user stops clicking
  const scheduleScoreSave = (strokes: number) => {
    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
    }
    
    setIsSavingScore(true);
    
    scoreTimeoutRef.current = setTimeout(() => {
      setIsSavingScore(false);
      onScoreUpdate(strokes);
    }, 2000);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current);
      }
    };
  }, []);

  // Track if we're in initial load to prevent auto-save during load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Auto-save stats when they change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      scheduleStatsSave();
    }
  }, [fairwayInRegulation, greenInRegulation, putts, penalties, sandSaves, upAndDowns, isInitialLoad]);

  // Load statistics and score for current hole
  useEffect(() => {
    setIsInitialLoad(true);
    
    // Find the hole score for the current hole
    const currentHoleScore = holeScores.find(score => score.hole === hole.number);
    
    console.log('Loading hole', hole.number, 'found score:', currentHoleScore);
    console.log('All hole scores:', holeScores);
    
    if (currentHoleScore) {
      // Load existing statistics for this hole
      console.log('Loading stats for hole', hole.number, ':', {
        fairway: currentHoleScore.fairwayInRegulation,
        green: currentHoleScore.greenInRegulation,
        putts: currentHoleScore.putts,
        penalties: currentHoleScore.penalties,
        sandSaves: currentHoleScore.sandSaves,
        upAndDowns: currentHoleScore.upAndDowns
      });
      
      setFairwayInRegulation(currentHoleScore.fairwayInRegulation);
      setGreenInRegulation(currentHoleScore.greenInRegulation);

      setPutts(currentHoleScore.putts || 0);
      setPenalties(currentHoleScore.penalties || 0);
      setSandSaves(currentHoleScore.sandSaves || 0);
      setUpAndDowns(currentHoleScore.upAndDowns || 0);
    } else {
      // No existing data, reset to defaults
      console.log('No existing stats for hole', hole.number, '- resetting to defaults');
      setFairwayInRegulation(null);
      setGreenInRegulation(null);

      setPutts(0);
      setPenalties(0);
      setSandSaves(0);
      setUpAndDowns(0);
    }
    
    // Set initial load to false after a brief delay to allow state to settle
    setTimeout(() => setIsInitialLoad(false), 200);
  }, [hole.number, holeScores]);
  
  // Get course data for GPS
  const courseData = getCourseForRound(round);

  // Check if current hole is a stroke hole for Round 3 match play
  const isStrokeHole = () => {
    if (round !== 3 || !currentMatch || !currentMatch.strokeHoles) return false;
    return currentMatch.strokeHoles.includes(hole.number);
  };

  // Get stroke recipient name
  const getStrokeRecipient = () => {
    if (!currentMatch || !currentMatch.strokeRecipientId) return null;
    const isPlayer1 = currentMatch.player1Id === userId;
    if (currentMatch.strokeRecipientId === userId) {
      return isPlayer1 ? currentMatch.player1Name : currentMatch.player2Name;
    }
    return isPlayer1 ? currentMatch.player2Name : currentMatch.player1Name;
  };

  // Track the current score locally for immediate UI updates
  const [localScore, setLocalScore] = useState(currentScore);
  
  // Update local score when prop changes
  useEffect(() => {
    setLocalScore(currentScore);
  }, [currentScore]);

  const updateScore = (strokes: number) => {
    if (strokes < 1) return;
    // Update the score immediately in UI
    setLocalScore(strokes);
    // Schedule save after 2 seconds of inactivity
    scheduleScoreSave(strokes);
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
    <div key={`hole-${hole.number}-${round}-v4-no-save-button`} className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousHole}
            disabled={isFirstHole}
            className="w-10 h-10 rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-white p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="w-5 h-5 text-golf-green-400" />
                <h1 className="text-xl font-bold text-white">Hole {hole.number}</h1>
                {isStrokeHole() && (
                  <Badge variant="secondary" className="bg-yellow-500 text-white text-xs px-2 py-1">
                    +1 Stroke
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                <span>Par {hole.par}</span>
                <span>•</span>
                <span>{hole.yardage}y</span>
                <span>•</span>
                <span>HCP {hole.handicap}</span>
                {isStrokeHole() && (
                  <span className="text-yellow-400 font-medium">• Stroke Hole</span>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNextHole}
            disabled={isLastHole}
            className="w-10 h-10 rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-white p-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">

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
            onClick={() => setActiveTab('scoring')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              activeTab === 'scoring' 
                ? 'bg-golf-green-600 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            Scoring
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

        {/* Combined Scoring & Stats Tab */}
        {activeTab === 'scoring' && (
          <div className="space-y-6">
            {/* Central Score Input */}
            <Card className="bg-gray-800 border-2 border-gray-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-white">Your Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {/* Score Selection Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: hole.par + 4 }, (_, i) => i + 1).map((score) => (
                      <Button
                        key={score}
                        variant={localScore === score ? "default" : "outline"}
                        size="lg"
                        onClick={() => updateScore(score)}
                        className={`w-12 h-12 rounded-full font-bold text-lg transition-all duration-200 ${
                          localScore === score 
                            ? `${getScoreColor(score, hole.par).replace('text-', 'bg-').replace('-600', '-600')} text-white font-extrabold shadow-lg transform scale-105 border-2 border-white` 
                            : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:scale-102'
                        }`}
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                  
                  {/* You Suck Button */}
                  <Button
                    variant={localScore === hole.par + 5 ? "default" : "outline"}
                    size="lg"
                    onClick={() => updateScore(hole.par + 5)}
                    className={`w-full font-bold transition-all duration-200 ${
                      localScore === hole.par + 5 
                        ? 'bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-lg transform scale-105 border-2 border-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:scale-102'
                    }`}
                  >
                    You Suck ({hole.par + 5})
                  </Button>
                  
                  {/* Current Score Display */}
                  {localScore > 0 && (
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(localScore, hole.par)}`}>
                        {localScore}
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        {getScoreName(localScore, hole.par)}
                      </div>
                    </div>
                  )}
                </div>
                
                {(isSavingScore || isUpdating) && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-golf-green-400 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">
                      {isSavingScore ? "Auto-saving in 2s..." : "Saving score..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fairway & Green */}
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Fairway</div>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant={fairwayInRegulation === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFairwayInRegulation(true)}
                          className={fairwayInRegulation === true ? "bg-green-600 hover:bg-green-700 text-xs px-2 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-2 py-1"}
                        >
                          Hit
                        </Button>
                        <Button
                          variant={fairwayInRegulation === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFairwayInRegulation(false)}
                          className={fairwayInRegulation === false ? "bg-red-600 hover:bg-red-700 text-xs px-2 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-2 py-1"}
                        >
                          Miss
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Green</div>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant={greenInRegulation === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => setGreenInRegulation(true)}
                          className={greenInRegulation === true ? "bg-green-600 hover:bg-green-700 text-xs px-2 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-2 py-1"}
                        >
                          Hit
                        </Button>
                        <Button
                          variant={greenInRegulation === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => setGreenInRegulation(false)}
                          className={greenInRegulation === false ? "bg-red-600 hover:bg-red-700 text-xs px-2 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-2 py-1"}
                        >
                          Miss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Putts & Penalties */}
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Putts</div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPutts(Math.max(0, putts - 1))}
                          disabled={putts <= 0}
                          className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="text-xl font-bold w-8 text-center text-white">
                          {putts}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPutts(putts + 1)}
                          className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Penalties</div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPenalties(Math.max(0, penalties - 1))}
                          disabled={penalties <= 0}
                          className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="text-xl font-bold w-8 text-center text-white">
                          {penalties}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPenalties(penalties + 1)}
                          className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            

            {/* Sand Saves & Up and Downs */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-300 mb-2">Sand Save</div>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant={sandSaves === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSandSaves(1)}
                        className={sandSaves === 1 ? "bg-green-600 hover:bg-green-700 text-xs px-3 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-3 py-1"}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={sandSaves === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSandSaves(0)}
                        className={sandSaves === 0 ? "bg-red-600 hover:bg-red-700 text-xs px-3 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-3 py-1"}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-300 mb-2">Up & Down</div>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant={upAndDowns === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUpAndDowns(1)}
                        className={upAndDowns === 1 ? "bg-green-600 hover:bg-green-700 text-xs px-3 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-3 py-1"}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={upAndDowns === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUpAndDowns(0)}
                        className={upAndDowns === 0 ? "bg-red-600 hover:bg-red-700 text-xs px-3 py-1" : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600 text-xs px-3 py-1"}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Auto-Save Status - NO SAVE BUTTON */}
            {(isSavingStats || updateStatsMutation.isPending) && (
              <div className="text-center py-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-golf-green-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-300">
                  {isSavingStats ? "Auto-saving stats in 1s..." : "Saving statistics..."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* GPS Map Tab */}
        {activeTab === 'map' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">GPS Navigation</h3>
              <Button
                onClick={() => setShowFullScreenGPS(true)}
                variant="outline"
                size="sm"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </div>
            <EnhancedGolfGPS 
              hole={hole.number} 
              par={hole.par}
              handicap={hole.handicap}
              round={round}
              onOpenFullScreen={() => setShowFullScreenGPS(true)}
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

      </div>
      
      {/* Full Screen GPS Modal */}
      {showFullScreenGPS && (
        <FullScreenGPS
          hole={hole.number}
          par={hole.par}
          handicap={hole.handicap}
          round={round}
          currentScore={localScore}
          onScoreUpdate={updateScore}
          onClose={() => setShowFullScreenGPS(false)}
          onHoleChange={(newHole) => {
            // Keep full screen GPS open when switching holes
            if (newHole > hole.number) {
              onNextHole();
            } else if (newHole < hole.number) {
              onPreviousHole();
            }
          }}
          onShowLeaderboard={() => {
            setShowFullScreenGPS(false);
            if (onShowLeaderboard) {
              onShowLeaderboard();
            }
          }}
        />
      )}
    </div>
  );
}