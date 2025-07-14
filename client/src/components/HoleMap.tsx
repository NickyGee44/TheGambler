import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Target, Zap } from "lucide-react";
import { useGPS } from "@/hooks/useGPS";
import { calculateDistance, type HoleData } from "@shared/courseData";

interface HoleMapProps {
  hole: HoleData;
  courseName: string;
}

interface MapViewport {
  center: [number, number];
  zoom: number;
}

export default function HoleMap({ hole, courseName }: HoleMapProps) {
  const { location, isLoading, error, requestLocation } = useGPS();
  const mapRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<MapViewport>({
    center: [hole.tee.lat, hole.tee.lng],
    zoom: 16
  });

  // Calculate distances when location changes
  const distances = location ? {
    toTee: calculateDistance(location.lat, location.lng, hole.tee.lat, hole.tee.lng),
    toGreenFront: calculateDistance(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng),
    toGreenMiddle: calculateDistance(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng),
    toGreenBack: calculateDistance(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)
  } : null;

  // Create a simple map visualization
  const renderMap = () => {
    const mapSize = 300;
    const padding = 40;
    
    // Calculate bounds
    const allPoints = [
      { lat: hole.tee.lat, lng: hole.tee.lng },
      { lat: hole.green.front.lat, lng: hole.green.front.lng },
      { lat: hole.green.middle.lat, lng: hole.green.middle.lng },
      { lat: hole.green.back.lat, lng: hole.green.back.lng }
    ];
    
    if (location) {
      allPoints.push({ lat: location.lat, lng: location.lng });
    }
    
    const latitudes = allPoints.map(p => p.lat);
    const longitudes = allPoints.map(p => p.lng);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    // Add some padding to the bounds
    const paddedMinLat = minLat - latRange * 0.1;
    const paddedMaxLat = maxLat + latRange * 0.1;
    const paddedMinLng = minLng - lngRange * 0.1;
    const paddedMaxLng = maxLng + lngRange * 0.1;
    
    const paddedLatRange = paddedMaxLat - paddedMinLat;
    const paddedLngRange = paddedMaxLng - paddedMinLng;
    
    // Convert coordinates to pixel positions
    const toPixel = (lat: number, lng: number) => {
      const x = ((lng - paddedMinLng) / paddedLngRange) * (mapSize - 2 * padding) + padding;
      const y = ((paddedMaxLat - lat) / paddedLatRange) * (mapSize - 2 * padding) + padding;
      return { x, y };
    };
    
    const teePos = toPixel(hole.tee.lat, hole.tee.lng);
    const greenFrontPos = toPixel(hole.green.front.lat, hole.green.front.lng);
    const greenMiddlePos = toPixel(hole.green.middle.lat, hole.green.middle.lng);
    const greenBackPos = toPixel(hole.green.back.lat, hole.green.back.lng);
    const playerPos = location ? toPixel(location.lat, location.lng) : null;
    
    return (
      <div className="relative">
        <svg width={mapSize} height={mapSize} className="border rounded-lg bg-green-50 dark:bg-green-950">
          {/* Grid lines for reference */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Fairway line from tee to green */}
          <line
            x1={teePos.x}
            y1={teePos.y}
            x2={greenMiddlePos.x}
            y2={greenMiddlePos.y}
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="8"
            strokeDasharray="5,5"
          />
          
          {/* Green area */}
          <circle
            cx={greenMiddlePos.x}
            cy={greenMiddlePos.y}
            r="12"
            fill="rgba(34, 197, 94, 0.6)"
            stroke="rgba(34, 197, 94, 0.8)"
            strokeWidth="2"
          />
          
          {/* Green front marker */}
          <circle cx={greenFrontPos.x} cy={greenFrontPos.y} r="3" fill="#10b981" />
          
          {/* Green back marker */}
          <circle cx={greenBackPos.x} cy={greenBackPos.y} r="3" fill="#059669" />
          
          {/* Tee marker */}
          <rect
            x={teePos.x - 6}
            y={teePos.y - 6}
            width="12"
            height="12"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="1"
          />
          
          {/* Player location */}
          {playerPos && (
            <circle
              cx={playerPos.x}
              cy={playerPos.y}
              r="8"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="2"
            />
          )}
          
          {/* Distance line from player to green */}
          {playerPos && (
            <line
              x1={playerPos.x}
              y1={playerPos.y}
              x2={greenMiddlePos.x}
              y2={greenMiddlePos.y}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
          )}
        </svg>
        
        {/* Legend */}
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 p-2 rounded shadow text-xs">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Tee</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Green</span>
          </div>
          {location && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>You</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Hole {hole.number} GPS Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {courseName} • Par {hole.par} • {hole.yardage} yards
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GPS Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span className="text-sm">
              {isLoading ? "Getting location..." : 
               error ? "Location unavailable" : 
               location ? `±${location.accuracy}m accuracy` : "No location"}
            </span>
          </div>
          <Button
            onClick={requestLocation}
            size="sm"
            variant="outline"
            disabled={isLoading}
          >
            <Zap className="h-4 w-4 mr-1" />
            {isLoading ? "Getting..." : "Update GPS"}
          </Button>
        </div>

        {/* Map */}
        <div className="flex justify-center">
          {renderMap()}
        </div>

        {/* Distance Information */}
        {distances && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium">To Green</span>
              </div>
              <div className="pl-6 space-y-1">
                <div>Front: <span className="font-mono">{Math.round(distances.toGreenFront)}y</span></div>
                <div>Middle: <span className="font-mono">{Math.round(distances.toGreenMiddle)}y</span></div>
                <div>Back: <span className="font-mono">{Math.round(distances.toGreenBack)}y</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">To Tee</span>
              </div>
              <div className="pl-6">
                <div><span className="font-mono">{Math.round(distances.toTee)}y</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Hole Information */}
        <div className="bg-muted rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Par:</span> {hole.par}
            </div>
            <div>
              <span className="font-medium">Yardage:</span> {hole.yardage}
            </div>
            <div>
              <span className="font-medium">Handicap:</span> {hole.handicap}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}