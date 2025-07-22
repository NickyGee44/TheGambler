import { useState, useRef, useEffect } from 'react';
import { useGPS } from '@/hooks/useGPS';
import { getHoleCoordinates, calculateDistanceInYards } from '@shared/courseData';
import { Button } from '@/components/ui/button';

// Calculate bearing between two points for map rotation
const calculateBearing = (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): number => {
  const startLat = start.latitude * Math.PI / 180;
  const startLng = start.longitude * Math.PI / 180;
  const endLat = end.latitude * Math.PI / 180;
  const endLng = end.longitude * Math.PI / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Trophy, X, Target, Compass } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FullScreenGPSProps {
  hole: number;
  par: number;
  handicap: number;
  round: number;
  onClose: () => void;
  onHoleChange: (newHole: number) => void;
  onShowLeaderboard: () => void;
  currentScore?: number;
  onScoreUpdate: (strokes: number) => void;
}

export function FullScreenGPS({ 
  hole, 
  par, 
  handicap, 
  round, 
  onClose, 
  onHoleChange, 
  onShowLeaderboard,
  currentScore,
  onScoreUpdate
}: FullScreenGPSProps) {
  const { position, isLoading } = useGPS();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const [targetMarker, setTargetMarker] = useState<{ lat: number; lng: number } | null>(null);
  const targetMarkerRef = useRef<any>(null);
  const targetLineRef = useRef<any>(null);
  const [selectedScore, setSelectedScore] = useState<number>(currentScore || par);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate yardages
  const getYardages = () => {
    try {
      if (!position) return { toGreen: null, toTee: null };
      
      const coords = getHoleCoordinates(hole);
      if (!coords) return { toGreen: null, toTee: null };
      
      const toGreen = coords.green ? 
        calculateDistanceInYards(position.latitude, position.longitude, coords.green.latitude, coords.green.longitude) : null;
      const toTee = coords.tee ? 
        calculateDistanceInYards(position.latitude, position.longitude, coords.tee.latitude, coords.tee.longitude) : null;
      
      return { toGreen, toTee };
    } catch (error) {
      return { toGreen: null, toTee: null };
    }
  };

  const { toGreen, toTee } = getYardages();

  // Calculate distance to target marker
  const getTargetDistance = () => {
    try {
      if (!position || !targetMarker) return null;
      
      return calculateDistanceInYards(
        position.latitude,
        position.longitude,
        targetMarker.lat,
        targetMarker.lng
      );
    } catch (error) {
      return null;
    }
  };

  const toTarget = getTargetDistance();

  // Use the same scoring mechanism as the main Score tab
  const updateScoreCallback = (score: number) => {
    setIsSaving(false);
    onScoreUpdate(score);
  };

  // Initialize Google Maps
  useEffect(() => {
    if (mapRef.current && !googleMapRef.current) {
      initializeMap();
    }
  }, [hole]);

  // Update map when position or target changes
  useEffect(() => {
    if (googleMapRef.current && (position || targetMarker)) {
      updateMapMarkers();
    }
  }, [position, targetMarker]);

  const initializeMap = async () => {
    try {
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['maps']
      });

      await loader.load();

      if (!mapRef.current) return;

      const holeCoords = getHoleCoordinates(hole);
      if (!holeCoords || !holeCoords.tee) return;

      // Create map with initial center
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
        zoom: 17,
        mapTypeId: (window as any).google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      googleMapRef.current = map;
      
      // Calculate bounds to show entire hole and set proper orientation
      if (holeCoords.tee && holeCoords.green) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        bounds.extend({ lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude });
        bounds.extend({ lat: holeCoords.green.latitude, lng: holeCoords.green.longitude });
        
        // Fit map to show entire hole with padding
        map.fitBounds(bounds, { top: 80, bottom: 80, left: 50, right: 50 });
        
        // Calculate bearing from tee to green and rotate map so tee is at bottom
        const bearing = calculateBearing(holeCoords.tee, holeCoords.green);
        map.setHeading(bearing - 180); // Rotate so tee points down
      }
      
      // Add click listener for placing target markers
      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setTargetMarker({ lat, lng });
      });
      
      updateMapMarkers();
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      // Show fallback message in map container
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-white">
            <div class="text-center p-4">
              <div class="text-lg mb-2">🗺️ Satellite View Unavailable</div>
              <div class="text-sm text-gray-300">Maps may be restricted on this domain</div>
            </div>
          </div>
        `;
      }
    }
  };

  const updateMapMarkers = () => {
    if (!googleMapRef.current) return;

    try {
      const holeCoords = getHoleCoordinates(hole);
      if (!holeCoords) return;

      // Add tee marker
      if (holeCoords.tee) {
        new (window as any).google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
          title: `Hole ${hole} Tee`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">🏌️</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32)
          }
        });
      }

      // Add green marker
      if (holeCoords.green) {
        new (window as any).google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: holeCoords.green.latitude, lng: holeCoords.green.longitude },
          title: `Hole ${hole} Green`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">🚩</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32)
          }
        });
      }

      // Add user position marker
      if (position) {
        new (window as any).google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: position.latitude, lng: position.longitude },
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">📍</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32)
          }
        });

        // Add line from tee to green
        if (holeCoords.tee && holeCoords.green) {
          new (window as any).google.maps.Polyline({
            path: [
              { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
              { lat: holeCoords.green.latitude, lng: holeCoords.green.longitude }
            ],
            geodesic: true,
            strokeColor: '#ffffff',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: googleMapRef.current
          });
        }
      }

      // Add target marker if set
      if (targetMarker) {
        // Remove previous target marker and line
        if (targetMarkerRef.current) {
          targetMarkerRef.current.setMap(null);
        }
        if (targetLineRef.current) {
          targetLineRef.current.setMap(null);
        }

        // Create new target marker
        targetMarkerRef.current = new (window as any).google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: targetMarker.lat, lng: targetMarker.lng },
          title: 'Target Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#f59e0b" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">🎯</text>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(32, 32)
          }
        });

        // Add line from user position to target if user position exists
        if (position) {
          targetLineRef.current = new (window as any).google.maps.Polyline({
            path: [
              { lat: position.latitude, lng: position.longitude },
              { lat: targetMarker.lat, lng: targetMarker.lng }
            ],
            geodesic: true,
            strokeColor: '#f59e0b',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: googleMapRef.current
          });
        }
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  // Auto-save score with 2-second delay (same as main Score tab)
  const scheduleScoreSave = (score: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      updateScoreCallback(score);
    }, 2000);
  };

  const updateScore = (score: number) => {
    if (score < 1) return;
    setSelectedScore(score);
    scheduleScoreSave(score);
  };

  const handleSaveScore = () => {
    updateScoreCallback(selectedScore);
  };

  // Update selected score when hole changes
  useEffect(() => {
    setSelectedScore(currentScore || par);
  }, [currentScore, par, hole]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleNextHole = () => {
    if (hole < 18) {
      onHoleChange(hole + 1);
      setTargetMarker(null); // Clear target when changing holes
    }
  };

  const handlePrevHole = () => {
    if (hole > 1) {
      onHoleChange(hole - 1);
      setTargetMarker(null); // Clear target when changing holes
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white">
            <div className="text-lg font-bold">Hole {hole}</div>
            <div className="text-sm text-gray-300">Par {par} • HCP {handicap}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onShowLeaderboard} className="text-white">
            <Trophy className="w-4 h-4 mr-1" />
            Scores
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef}
          className="w-full h-full"
        />
        
        {/* Yardage Overlay */}
        {position && (toGreen || toTee || toTarget) && (
          <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-3 rounded-lg">
            <div className="grid gap-2 text-sm">
              {toGreen && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-golf-green-400" />
                  <span className="font-bold text-golf-green-400">{toGreen}y Green</span>
                </div>
              )}
              {toTee && (
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-golf-sand-400" />
                  <span className="font-bold text-golf-sand-400">{toTee}y Tee</span>
                </div>
              )}
              {toTarget && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-bold text-amber-400">{toTarget}y Target</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!targetMarker && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-300">Tap map to measure distance</div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Hole Navigation */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevHole}
              disabled={hole <= 1}
              className="text-white border-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm">Hole {hole}/18</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextHole}
              disabled={hole >= 18}
              className="text-white border-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Score Input */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-white text-sm">Score:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((score) => (
                    <Button
                      key={score}
                      variant={selectedScore === score ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateScore(score)}
                      className={`w-8 h-8 p-0 text-xs font-bold transform transition-all ${
                        selectedScore === score 
                          ? 'bg-golf-green-500 text-white scale-110 ring-2 ring-white' 
                          : 'text-white border-gray-600 hover:scale-105'
                      }`}
                    >
                      {score}
                    </Button>
                  ))}
                </div>
                {/* Auto-save indicator */}
                {isSaving && (
                  <div className="flex items-center gap-2 text-xs text-golf-green-400">
                    <div className="w-3 h-3 border border-golf-green-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Auto-saving in 2s...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}