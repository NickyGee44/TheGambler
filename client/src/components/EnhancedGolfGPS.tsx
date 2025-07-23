import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Navigation, MapPin, Map } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { getHoleCoordinates, calculateDistanceInYards, getCourseForRound } from '@shared/courseData';

interface EnhancedGolfGPSProps {
  hole: number;
  par: number;
  handicap: number;
  round?: number;
  onOpenFullScreen?: () => void;
}

export function EnhancedGolfGPS({ hole, par, handicap, round, onOpenFullScreen }: EnhancedGolfGPSProps) {
  const { position, isLoading, error } = useGPS();
  
  // Get course information
  const course = getCourseForRound(round || 1);

  // Calculate yardages safely
  const getYardages = () => {
    try {
      if (!position) return { toGreen: null, toTee: null };
      
      const holeCoords = getHoleCoordinates(hole, round);
      if (!holeCoords || !holeCoords.green || !holeCoords.tee) {
        return { toGreen: null, toTee: null };
      }

      const toGreen = calculateDistanceInYards(position, holeCoords.green);
      const toTee = calculateDistanceInYards(position, holeCoords.tee);

      return { toGreen, toTee };
    } catch (error) {
      console.error('GPS calculation error:', error);
      return { toGreen: null, toTee: null };
    }
  };

  const { toGreen, toTee } = getYardages();

  return (
    <div className="w-full space-y-4">
      {/* Hole Information Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5 text-golf-green-600" />
              Hole {hole}
            </span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-golf-green-400 border-golf-green-400">Par {par}</Badge>
              <Badge variant="outline" className="text-golf-sand-400 border-golf-sand-400">HCP {handicap}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* GPS Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-golf-green-400">
                <Navigation className="w-5 h-5 animate-pulse" />
                <span>Getting GPS location...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <div className="text-red-400 mb-2">GPS Error</div>
              <div className="text-sm text-gray-400 mb-4">{error}</div>
              <div className="text-xs text-gray-500">
                Tip: Open in new browser tab for better GPS access
              </div>
            </div>
          )}

          {position && !isLoading && !error && (
            <div className="space-y-4">
              {/* Yardage Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-golf-green-400">
                    {toGreen ? `${Math.round(toGreen)}` : '--'}
                  </div>
                  <div className="text-sm text-gray-400">yards to green</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-golf-sand-400">
                    {toTee ? `${Math.round(toTee)}` : '--'}
                  </div>
                  <div className="text-sm text-gray-400">yards from tee</div>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="text-center pt-2 border-t border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                  </span>
                </div>
                {position.accuracy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Accuracy: ±{Math.round(position.accuracy)}m
                  </div>
                )}
              </div>

              {/* Full Screen Map Button */}
              {onOpenFullScreen && (
                <div className="pt-4">
                  <Button
                    onClick={onOpenFullScreen}
                    className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Open Full Screen Map
                  </Button>
                </div>
              )}
            </div>
          )}

          {!position && !isLoading && !error && (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">GPS location not available</div>
              <div className="text-sm text-gray-500">
                Enable location services to see yardages
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Information & Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Course Name */}
            <div className="text-center border-b border-gray-700 pb-3">
              <div className="text-white font-medium">{course.name}</div>
              <div className="text-sm text-gray-400">{course.location}</div>
            </div>
            
            {/* GPS Tips */}
            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-golf-green-600" />
                <span>Use course markers for precise yardages</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-golf-sand-400" />
                <span>GPS provides approximate distances</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}