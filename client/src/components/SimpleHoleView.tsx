import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoleData } from "@shared/courseData";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";

interface SimpleHoleViewProps {
  hole: HoleData;
  round: number;
  onPreviousHole: () => void;
  onNextHole: () => void;
  isFirstHole: boolean;
  isLastHole: boolean;
  onShowLeaderboard?: () => void;
  userId?: number;
  isScrambleMode?: boolean;
}

interface HoleScore {
  id: number;
  userId: number;
  teamId: number;
  round: number;
  hole: number;
  strokes: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export function SimpleHoleView({
  hole,
  round,
  onPreviousHole,
  onNextHole,
  isFirstHole,
  isLastHole,
  onShowLeaderboard,
  userId,
  isScrambleMode = false
}: SimpleHoleViewProps) {
  const { toast } = useToast();
  
  // Get the current score for this specific hole
  const { data: currentScore, refetch: refetchScore } = useQuery({
    queryKey: [`/api/hole-score/${round}/${hole.number}`],
    queryFn: async (): Promise<number> => {
      const endpoint = isScrambleMode 
        ? `/api/team-hole-score/${round}/${hole.number}`
        : `/api/hole-score/${round}/${hole.number}`;
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return 0; // No score yet
      }
      
      const data = await response.json();
      return data.strokes || 0;
    },
    enabled: !!userId,
    staleTime: 0 // Always refetch
  });

  // Mutation to save score
  const saveScoreMutation = useMutation({
    mutationFn: async (strokes: number) => {
      const endpoint = isScrambleMode 
        ? "/api/team-hole-scores"
        : "/api/hole-scores";
      
      const payload = {
        round,
        hole: hole.number,
        strokes
      };
      
      const response = await apiRequest("POST", endpoint, payload);
      return response.json();
    },
    onSuccess: async (data, strokes) => {
      // Immediately refetch this hole's score
      await refetchScore();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [isScrambleMode ? `/api/team-hole-scores/${round}` : `/api/my-hole-scores/${round}`] 
      });
      
      toast({
        title: "Score saved",
        description: `Hole ${hole.number}: ${strokes} strokes`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving score",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScoreClick = (strokes: number) => {
    if (strokes < 1) return;
    saveScoreMutation.mutate(strokes);
  };

  const getScoreButtonStyle = (score: number) => {
    const isSelected = currentScore === score;
    const diff = score - hole.par;
    
    let colorClass = "";
    if (diff <= -2) colorClass = "bg-yellow-500 text-white"; // Eagle+
    else if (diff === -1) colorClass = "bg-green-500 text-white"; // Birdie
    else if (diff === 0) colorClass = "bg-blue-500 text-white"; // Par
    else if (diff === 1) colorClass = "bg-red-400 text-white"; // Bogey
    else if (diff === 2) colorClass = "bg-red-600 text-white"; // Double bogey
    else colorClass = "bg-purple-600 text-white"; // Triple+
    
    return `${isSelected ? colorClass + " ring-2 ring-offset-2 ring-gray-700 scale-105" : "bg-gray-200 text-gray-800 hover:" + colorClass} transition-all duration-200`;
  };

  const getScoreName = (score: number) => {
    const diff = score - hole.par;
    if (diff <= -3) return "Albatross";
    if (diff === -2) return "Eagle";
    if (diff === -1) return "Birdie";
    if (diff === 0) return "Par";
    if (diff === 1) return "Bogey";
    if (diff === 2) return "Double";
    if (diff >= 8) return "You Suck";
    return `+${diff}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-golf-green-50 to-golf-sand-50 dark:from-golf-green-900 dark:to-golf-sand-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        
        {/* Hole Info Card */}
        <Card className="mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-golf-green-200 dark:border-golf-green-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Hole {hole.number}
            </CardTitle>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>Par {hole.par}</span>
              <span>•</span>
              <span>{hole.yardage} yds</span>
              <span>•</span>
              <span>HCP {hole.handicap}</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current Score Display */}
            {currentScore && currentScore > 0 && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold">{currentScore}</div>
                <div className="text-sm text-muted-foreground">
                  {getScoreName(currentScore)}
                </div>
              </div>
            )}
            
            {/* Score Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((score) => (
                <Button
                  key={score}
                  onClick={() => handleScoreClick(score)}
                  disabled={saveScoreMutation.isPending}
                  className={getScoreButtonStyle(score)}
                  size="lg"
                >
                  {score}
                </Button>
              ))}
            </div>
            
            {/* Score Names Row */}
            <div className="grid grid-cols-4 gap-2 text-xs text-center text-muted-foreground">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((score) => (
                <div key={score}>{getScoreName(score)}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mb-4">
          <Button
            onClick={onPreviousHole}
            disabled={isFirstHole}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={onNextHole}
            disabled={isLastHole}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Leaderboard Button */}
        {onShowLeaderboard && (
          <Button
            onClick={onShowLeaderboard}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Leaderboard
          </Button>
        )}
        
        {/* Loading State */}
        {saveScoreMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-center">Saving score...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}