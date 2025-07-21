import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Navigation, MapPin, Compass } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { getHoleCoordinates, calculateDistanceInYards } from '@shared/courseData';

interface EnhancedGolfGPSProps {
  hole: number;
  par: number;
  handicap: number;
}

export function EnhancedGolfGPS({ hole, par, handicap }: EnhancedGolfGPSProps) {
  const { position, isLoading, error } = useGPS();

  // Calculate yardages safely
  const getYardages = () => {
    try {
      if (!position) return { toGreen: null, toTee: null };
      
      const holeCoords = getHoleCoordinates(hole);
      if (!holeCoords || !holeCoords.green || !holeCoords.tee) {
        return { toGreen: null, toTee: null };
      }

      const toGreen = calculateDistanceInYards(
        position.latitude,
        position.longitude,
        holeCoords.green.latitude,
        holeCoords.green.longitude
      );

      const toTee = calculateDistanceInYards(
        position.latitude,
        position.longitude,
        holeCoords.tee.latitude,
        holeCoords.tee.longitude
      );

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
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-golf-green-400" />
            <span className="text-sm font-medium text-white">GPS Status</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              <span className="text-sm">Getting your location...</span>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          {position && !isLoading && (
            <div className="text-golf-green-400 text-sm">
              ✓ Location acquired (±{position.accuracy?.toFixed(0)}m accuracy)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yardage Display */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-golf-green-400 mb-1">
                {toGreen || '---'}
              </div>
              <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                <Target className="w-4 h-4" />
                Yards to Green
              </div>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="text-3xl font-bold text-golf-sand-400 mb-1">
                {toTee || '---'}
              </div>
              <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                <Compass className="w-4 h-4" />
                Yards to Tee
              </div>
            </div>
          </div>
          {!position && (
            <div className="text-center mt-4 text-gray-500 text-sm">
              {isLoading ? 'Calculating distances...' : 'Enable location to see yardages'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-golf-green-400" />
            Course Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Hole:</span>
              <span className="text-white">{hole}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Par:</span>
              <span className="text-white">{par}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Handicap:</span>
              <span className="text-white">{handicap}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Instructions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-white mb-2">GPS Tips</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Enable location services for accurate yardages</li>
            <li>• Use course markers for precise pin positions</li>
            <li>• GPS accuracy varies by device and conditions</li>
            <li>• Distances are calculated to green center</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}