import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Calendar, MapPin, Users, Trophy, Clock, Play } from 'lucide-react';
import HoleView from '@/components/HoleView';
import { getTestRoundCourse, testRoundPlayers } from '@shared/courseData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function TestRound() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHole, setCurrentHole] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const course = getTestRoundCourse();

  // Check if user can access test round
  const canAccess = user && [1, 3, 6, 13].includes(user.id);

  // Get user's test round scores
  const { data: myScores = [], refetch: refetchMyScores } = useQuery({
    queryKey: ['/api/test-round/my-scores'],
    enabled: !!user && !!canAccess,
  });

  // Get all test round scores for leaderboard
  const { data: allScores = [] } = useQuery({
    queryKey: ['/api/test-round/scores'],
    enabled: !!user && !!canAccess,
  });



  // Handle score updates
  const handleScoreUpdate = async (strokes: number) => {
    try {
      console.log('Test Round: Saving score', { currentHole, strokes });
      
      const response = await fetch(`/api/test-round/scores/${currentHole}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strokes })
      });
      
      console.log('Test Round: Response status', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test Round: Save failed', errorText);
        throw new Error(`Failed to save score: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Test Round: Save successful', result);
      
      // Refetch scores after update
      refetchMyScores();
      
      toast({
        title: "Score Saved",
        description: `Hole ${currentHole}: ${strokes} strokes`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Test Round: Error saving score', error);
      toast({
        title: "Error",
        description: `Failed to save score: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Navigation handlers
  const handleNextHole = () => {
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
  };

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
    }
  };

  // Get current hole data
  const currentHoleData = course.holes.find(h => h.number === currentHole);
  const currentScore = Array.isArray(myScores) ? myScores.find((s: any) => s.hole === currentHole)?.strokes : undefined;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-lg mb-4">Authentication Required</div>
            <div className="text-gray-300">Please log in to access the Test Round</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-yellow-400 text-lg mb-4">Access Restricted</div>
            <div className="text-gray-300 mb-4">
              This test round is only available to:
            </div>
            <div className="space-y-2">
              {testRoundPlayers.map(player => (
                <Badge key={player.id} variant="secondary" className="mr-2">
                  {player.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show hole-by-hole scoring interface
  if (isPlaying && currentHoleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Progress Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 relative z-40">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white text-sm font-medium">Test Round Progress</div>
            <div className="text-gray-400 text-sm">{currentHole}/18</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-golf-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentHole / 18) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Hole View with adjusted styling */}
        <div className="relative">
          <HoleView
            hole={currentHoleData}
            round={99} // Special round number for test round
            currentScore={currentScore}
            onScoreUpdate={handleScoreUpdate}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleNextHole}
            isFirstHole={currentHole === 1}
            isLastHole={currentHole === 18}
            isUpdating={false}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            holeScores={Array.isArray(myScores) ? myScores : []}
          />
        </div>
      </div>
    );
  }

  // Show leaderboard overlay
  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto p-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-golf-green-400" />
                Test Round Leaderboard
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(false)}
                className="text-white border-gray-600"
              >
                Back to Round
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testRoundPlayers.map((player, index) => {
                  const playerScores = Array.isArray(allScores) ? allScores.filter((s: any) => s.userId === player.id) : [];
                  const totalStrokes = playerScores.reduce((sum: number, s: any) => sum + s.strokes, 0);
                  const holesPlayed = playerScores.length;
                  
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-golf-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{player.name}</div>
                          <div className="text-gray-400 text-sm">Holes: {holesPlayed}/18</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{totalStrokes || 0}</div>
                        <div className="text-gray-400 text-sm">Total Strokes</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main test round overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-golf-green-400" />
              Test Round
            </CardTitle>
            <div className="text-gray-300 text-lg">{course.name}</div>
            <div className="text-gray-400 text-sm">{course.location}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Round Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-golf-green-400" />
                <div>
                  <div className="font-medium">Saturday, July 26th</div>
                  <div className="text-sm text-gray-400">12:10 PM Tee Time</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-golf-green-400" />
                <div>
                  <div className="font-medium">Gross Match Play</div>
                  <div className="text-sm text-gray-400">No Handicap Adjustments</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Users className="w-5 h-5 text-golf-green-400" />
                <div>
                  <div className="font-medium">4 Players</div>
                  <div className="text-sm text-gray-400">Individual Scoring</div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Test Round Participants
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {testRoundPlayers.map(player => (
                  <div key={player.id} className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-white font-medium text-sm">{player.name}</div>
                    <div className="text-gray-400 text-xs">HCP {player.handicap}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => setIsPlaying(true)}
                className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Round
              </Button>
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Scores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Course Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {course.holes.map(hole => (
                <div key={hole.number} className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">#{hole.number}</div>
                  <div className="text-golf-green-400 text-sm">Par {hole.par}</div>
                  <div className="text-gray-400 text-xs">{hole.yardage}y</div>
                  <div className="text-gray-500 text-xs">HCP {hole.handicap}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}