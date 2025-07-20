import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trash2, MapPin, Target, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGPS } from '@/hooks/useGPS';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProfessionalGolfGPS from '@/components/ProfessionalGolfGPS';

// Circle Pines Borden Golf Club course data
const COURSE_DATA = {
  name: "Circle Pines Borden Golf Club",
  location: "Borden, Ontario",
  holes: [
    { number: 1, par: 4, yardage: 385, handicap: 10 },
    { number: 2, par: 5, yardage: 520, handicap: 2 },
    { number: 3, par: 3, yardage: 165, handicap: 16 },
    { number: 4, par: 4, yardage: 410, handicap: 6 },
    { number: 5, par: 4, yardage: 395, handicap: 12 },
    { number: 6, par: 3, yardage: 180, handicap: 18 },
    { number: 7, par: 5, yardage: 540, handicap: 4 },
    { number: 8, par: 4, yardage: 420, handicap: 8 },
    { number: 9, par: 4, yardage: 375, handicap: 14 },
    { number: 10, par: 4, yardage: 400, handicap: 9 },
    { number: 11, par: 3, yardage: 175, handicap: 17 },
    { number: 12, par: 5, yardage: 510, handicap: 1 },
    { number: 13, par: 4, yardage: 430, handicap: 5 },
    { number: 14, par: 4, yardage: 360, handicap: 13 },
    { number: 15, par: 3, yardage: 190, handicap: 15 },
    { number: 16, par: 4, yardage: 415, handicap: 7 },
    { number: 17, par: 5, yardage: 525, handicap: 3 },
    { number: 18, par: 4, yardage: 390, handicap: 11 }
  ]
};

interface TestRoundScore {
  id: number;
  userId: number;
  hole: number;
  par: number;
  strokes?: number;
  gpsLat?: string;
  gpsLng?: string;
  gpsAccuracy?: string;
  fairwayInRegulation?: boolean;
  greenInRegulation?: boolean;
  driveDirection?: string;
  putts?: number;
  penalties?: number;
  sandSaves?: number;
  upAndDowns?: number;
  createdAt: string;
  updatedAt: string;
}

interface HoleViewProps {
  hole: number;
  holeData: typeof COURSE_DATA.holes[0];
  userScore?: TestRoundScore;
  onScoreUpdate: (holeNumber: number, scoreData: Partial<TestRoundScore>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function HoleView({ hole, holeData, userScore, onScoreUpdate, onNext, onPrevious, isFirst, isLast }: HoleViewProps) {
  const { location: gpsData, error: gpsError, requestLocation } = useGPS();
  const [localScore, setLocalScore] = useState(userScore?.strokes || 0);
  const [stats, setStats] = useState({
    fairwayInRegulation: userScore?.fairwayInRegulation,
    greenInRegulation: userScore?.greenInRegulation || false,
    driveDirection: userScore?.driveDirection || '',
    putts: userScore?.putts || 0,
    penalties: userScore?.penalties || 0,
    sandSaves: userScore?.sandSaves || 0,
    upAndDowns: userScore?.upAndDowns || 0,
  });

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-save after 2 seconds of inactivity
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      if (localScore > 0) {
        handleSave();
      }
    }, 2000);

    setSaveTimeout(timeout);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [localScore, stats]);

  const handleSave = () => {
    const scoreData: Partial<TestRoundScore> = {
      strokes: localScore,
      par: holeData.par,
      ...stats,
      gpsLat: gpsData?.latitude?.toString(),
      gpsLng: gpsData?.longitude?.toString(),
      gpsAccuracy: gpsData?.accuracy?.toString(),
    };
    onScoreUpdate(hole, scoreData);
  };

  const handleScoreClick = (score: number) => {
    setLocalScore(score);
  };

  const handleStatUpdate = (key: string, value: any) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  // Score buttons (1 to 4 over par, plus "You Suck" for 5+)
  const renderScoreButtons = () => {
    const buttons = [];
    const maxNormalScore = holeData.par + 4;
    
    for (let score = 1; score <= maxNormalScore; score++) {
      const toPar = score - holeData.par;
      let label = score.toString();
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
      
      if (toPar === 0) {
        label = "Par";
        variant = "secondary";
      } else if (toPar === -2) {
        label = "Eagle";
        variant = "default";
      } else if (toPar === -1) {
        label = "Birdie";
        variant = "default";
      } else if (toPar >= 4) {
        label = "You Suck";
        variant = "destructive";
      }

      if (localScore === score) {
        variant = "default";
      }

      buttons.push(
        <Button
          key={score}
          variant={variant}
          size="lg"
          className={`h-16 w-16 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
            localScore === score ? 'ring-2 ring-white scale-110 font-bold' : ''
          }`}
          onClick={() => handleScoreClick(score)}
        >
          {label}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
      {/* Sticky Header with Navigation */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={isFirst}
            className="text-white hover:bg-white/10"
          >
            ← Prev
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold">Hole {hole}</h1>
            <p className="text-sm text-green-200">Par {holeData.par} • {holeData.yardage} yards</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={isLast}
            className="text-white hover:bg-white/10"
          >
            Next →
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="score" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Score
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Stats
            </TabsTrigger>
            <TabsTrigger value="gps" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              GPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="space-y-6 mt-6">
            <Card className="bg-black/20 border-white/10 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Select Your Score</CardTitle>
                <CardDescription className="text-green-200">
                  Tap the button for your total strokes on this hole
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 justify-items-center">
                  {renderScoreButtons()}
                </div>
                
                {localScore > 0 && (
                  <div className="mt-6 text-center">
                    <div className="text-lg">
                      Score: <span className="font-bold text-2xl">{localScore}</span>
                    </div>
                    <div className="text-sm text-green-200">
                      {localScore - holeData.par > 0 ? '+' : ''}{localScore - holeData.par} to par
                    </div>
                    <div className="mt-2 text-xs text-green-300">
                      Auto-saving in 2s...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 mt-6">
            <Card className="bg-black/20 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Golf Statistics</CardTitle>
                <CardDescription className="text-green-200">
                  Track detailed hole statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fairway in Regulation (skip for par 3s) */}
                {holeData.par > 3 && (
                  <div>
                    <label className="text-sm font-medium text-green-200 block mb-2">
                      Fairway in Regulation
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={stats.fairwayInRegulation === true ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatUpdate('fairwayInRegulation', true)}
                      >
                        Hit
                      </Button>
                      <Button
                        variant={stats.fairwayInRegulation === false ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatUpdate('fairwayInRegulation', false)}
                      >
                        Miss
                      </Button>
                    </div>
                  </div>
                )}

                {/* Green in Regulation */}
                <div>
                  <label className="text-sm font-medium text-green-200 block mb-2">
                    Green in Regulation
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={stats.greenInRegulation === true ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatUpdate('greenInRegulation', true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={stats.greenInRegulation === false ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatUpdate('greenInRegulation', false)}
                    >
                      No
                    </Button>
                  </div>
                </div>

                {/* Putts */}
                <div>
                  <label className="text-sm font-medium text-green-200 block mb-2">
                    Putts: {stats.putts}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatUpdate('putts', Math.max(0, stats.putts - 1))}
                      disabled={stats.putts <= 0}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center py-2 text-lg font-bold">
                      {stats.putts}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatUpdate('putts', stats.putts + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Penalties */}
                <div>
                  <label className="text-sm font-medium text-green-200 block mb-2">
                    Penalty Strokes: {stats.penalties}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatUpdate('penalties', Math.max(0, stats.penalties - 1))}
                      disabled={stats.penalties <= 0}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center py-2 text-lg font-bold">
                      {stats.penalties}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatUpdate('penalties', stats.penalties + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gps" className="space-y-6 mt-6">
            <Card className="bg-black/20 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Location
                </CardTitle>
                <CardDescription className="text-green-200">
                  Circle Pines Borden Golf Club • Hole {hole}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gpsError ? (
                  <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                    <p className="text-red-200">{gpsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={requestLocation}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : gpsData ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-green-400" />
                      <span>Location: {gpsData.latitude?.toFixed(6)}, {gpsData.longitude?.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span>Accuracy: ±{Math.round(gpsData.accuracy || 0)}m</span>
                    </div>
                    
                    {/* Professional GPS Map Component */}
                    <ProfessionalGolfGPS
                      playerLat={gpsData.latitude || 0}
                      playerLng={gpsData.longitude || 0}
                      holeNumber={hole}
                      par={holeData.par}
                      yardage={holeData.yardage}
                      handicap={holeData.handicap}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-green-400 mb-4" />
                    <p className="text-green-200 mb-4">Getting your location...</p>
                    <Button variant="outline" onClick={requestLocation}>
                      Enable GPS
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function TestRound() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentHole, setCurrentHole] = useState(1);

  // Fetch test round scores for current user
  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['/api/test-round', user?.id],
    enabled: !!user?.id,
  });

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({ hole, scoreData }: { hole: number; scoreData: Partial<TestRoundScore> }) => {
      const response = await fetch(`/api/test-round/${user?.id}/${hole}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });
      if (!response.ok) {
        throw new Error('Failed to update score');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-round', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save score. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete all test data mutation (admin only)
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/test-round/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete test data');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-round'] });
      toast({
        title: "Success",
        description: "All test round data has been cleared.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete test data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScoreUpdate = (holeNumber: number, scoreData: Partial<TestRoundScore>) => {
    updateScoreMutation.mutate({ hole: holeNumber, scoreData });
  };

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to delete ALL test round data? This cannot be undone.')) {
      deleteAllMutation.mutate();
    }
  };

  const currentHoleData = COURSE_DATA.holes.find(h => h.number === currentHole);
  const userScore = Array.isArray(scores) ? scores.find((s: TestRoundScore) => s.hole === currentHole) : undefined;
  const completedHoles = Array.isArray(scores) ? scores.filter((s: TestRoundScore) => s.strokes && s.strokes > 0).length : 0;
  const progress = (completedHoles / 18) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <Card className="w-96 bg-black/20 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription className="text-green-200">
              Please log in to access the test round.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading test round...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      {/* Header with course info and progress */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{COURSE_DATA.name}</h1>
              <p className="text-green-200">{COURSE_DATA.location}</p>
            </div>
            
            {/* Admin delete button */}
            {user && ['Nick Grossi', 'Connor Patterson'].includes(`${user.firstName} ${user.lastName}`) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Test Data
              </Button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-green-200">
              <span>Holes Completed</span>
              <span>{completedHoles}/18</span>
            </div>
            <Progress value={progress} className="h-2 bg-black/20" />
          </div>
          
          {/* Hole navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {COURSE_DATA.holes.map(hole => {
              const holeScore = Array.isArray(scores) ? scores.find((s: TestRoundScore) => s.hole === hole.number) : undefined;
              const isCompleted = holeScore?.strokes && holeScore.strokes > 0;
              const isCurrent = currentHole === hole.number;
              
              return (
                <Button
                  key={hole.number}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`min-w-12 h-10 text-xs ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''} ${
                    isCurrent ? 'ring-2 ring-white' : ''
                  }`}
                  onClick={() => setCurrentHole(hole.number)}
                >
                  {hole.number}
                  {isCompleted && <div className="text-xs">✓</div>}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hole View */}
      {currentHoleData && (
        <HoleView
          hole={currentHole}
          holeData={currentHoleData}
          userScore={userScore}
          onScoreUpdate={handleScoreUpdate}
          onNext={() => setCurrentHole(Math.min(18, currentHole + 1))}
          onPrevious={() => setCurrentHole(Math.max(1, currentHole - 1))}
          isFirst={currentHole === 1}
          isLast={currentHole === 18}
        />
      )}
    </div>
  );
}