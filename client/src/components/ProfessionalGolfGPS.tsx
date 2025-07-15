import React from "react";
import { MapPin, Navigation, Target, Info } from "lucide-react";
import { HoleData } from "@shared/courseData";
import { useGPS } from "@/hooks/useGPS";

interface ProfessionalGolfGPSProps {
  hole: HoleData;
  courseName: string;
  courseCenter: { lat: number; lng: number };
}

interface EnhancedProfessionalGolfGPSProps extends ProfessionalGolfGPSProps {
  round?: number;
}

export default function ProfessionalGolfGPS({ hole, courseName, courseCenter, round }: EnhancedProfessionalGolfGPSProps) {
  const { location, isLoading, error, requestLocation } = useGPS();

  // Calculate yardage based on GPS location
  const calculateYardage = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 1093.61); // Convert to yards
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Header - Course and Hole Info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">HOLE {hole.number}</h1>
            <p className="text-sm text-muted-foreground">
              {courseName} • Hole {hole.number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">
              {isLoading ? "Getting GPS..." : 
               error ? "GPS unavailable" : 
               location ? `±${Math.round(location.accuracy)}m` : "No GPS"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 pb-32 px-4">
        {/* Hole Information Card */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <h2 className="text-lg font-semibold">Hole {hole.number}</h2>
                <p className="text-sm text-gray-400">Par {hole.par} • {hole.yardage} yards</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">HANDICAP</div>
              <div className="text-xl font-bold">{hole.handicap}</div>
            </div>
          </div>
          
          {/* Course Layout Info */}
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Course Layout</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Tee:</span>
                <div className="text-white font-mono text-xs">
                  {hole.tee.lat.toFixed(6)}, {hole.tee.lng.toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Green:</span>
                <div className="text-white font-mono text-xs">
                  {hole.green.middle.lat.toFixed(6)}, {hole.green.middle.lng.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Status */}
        {location && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Your Location</span>
            </div>
            <div className="text-sm font-mono text-blue-200">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
            <div className="text-xs text-blue-400 mt-1">
              Accuracy: ±{Math.round(location.accuracy)} meters
            </div>
          </div>
        )}

        {/* Distance Information */}
        {location && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="text-center mb-4">
              <div className="text-sm text-green-400 mb-1">DISTANCE TO GREEN</div>
              <div className="text-3xl font-bold text-green-300">
                {calculateYardage(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng)} yds
              </div>
              <div className="text-xs text-green-400">to middle</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-400">FRONT</div>
                <div className="text-lg font-semibold text-green-300">
                  {calculateYardage(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">MIDDLE</div>
                <div className="text-lg font-semibold text-green-300">
                  {calculateYardage(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">BACK</div>
                <div className="text-lg font-semibold text-green-300">
                  {calculateYardage(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GPS Controls */}
      <div className="absolute bottom-4 left-4 right-4 space-y-4">
        <div className="flex items-center justify-center">
          <button
            onClick={requestLocation}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            <Navigation className="h-4 w-4" />
            {isLoading ? "Getting GPS..." : "Update Location"}
          </button>
        </div>
        
        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              {error}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-1">
              💡 Tip: Click "Open in new tab" (top-right arrow) to test GPS outside Replit preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}