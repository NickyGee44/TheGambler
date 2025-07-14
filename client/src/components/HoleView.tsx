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
  Crosshair 
} from "lucide-react";

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
  isUpdating
}: HoleViewProps) {
  const { location, isLoading: gpsLoading, error: gpsError, requestLocation } = useGPS();
  const { toast } = useToast();
  
  // Calculate yardages to green if GPS is available
  const yardages = location ? {
    front: calculateDistance(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng),
    middle: calculateDistance(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng),
    back: calculateDistance(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)
  } : null;

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
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-green-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-8 h-8 text-golf-green-600" />
            <h1 className="text-3xl font-bold text-golf-green-600">Hole {hole.number}</h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Par {hole.par}</span>
            <span>•</span>
            <span>{hole.yardage} yards</span>
            <span>•</span>
            <span>HCP {hole.handicap}</span>
          </div>
        </div>

        {/* Score Entry Card */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-golf-green-200 dark:border-slate-700">
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
                  <div className="text-sm font-medium text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">Saving score...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GPS Yardages Card */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-golf-green-600" />
              GPS Yardages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gpsLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-golf-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Getting your location...</p>
              </div>
            )}
            
            {gpsError && (
              <div className="text-center py-4">
                <p className="text-sm text-red-600 mb-2">{gpsError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={requestLocation}
                  className="flex items-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  Enable GPS
                </Button>
              </div>
            )}
            
            {location && yardages && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GPS Status</span>
                  <Badge variant="outline" className="text-green-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-golf-green-600">{yardages.front}</div>
                    <div className="text-xs text-muted-foreground">Front</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-golf-green-600">{yardages.middle}</div>
                    <div className="text-xs text-muted-foreground">Middle</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-golf-green-600">{yardages.back}</div>
                    <div className="text-xs text-muted-foreground">Back</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    <Flag className="w-3 h-3 mr-1" />
                    To Green
                  </Badge>
                </div>
              </div>
            )}
            
            {!location && !gpsLoading && !gpsError && (
              <div className="text-center py-4">
                <Button 
                  variant="outline" 
                  onClick={requestLocation}
                  className="flex items-center gap-2"
                >
                  <Crosshair className="w-4 h-4" />
                  Get GPS Yardages
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hole Info Card */}
        <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle>Hole Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Par</div>
                <div className="text-lg font-semibold">{hole.par}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Yardage</div>
                <div className="text-lg font-semibold">{hole.yardage}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Handicap</div>
                <div className="text-lg font-semibold">{hole.handicap}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Hole</div>
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
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onNextHole}
            disabled={isLastHole}
            className="flex-1"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}