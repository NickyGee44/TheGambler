import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Navigation, MapPin, Compass, Map, List } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { getHoleCoordinates, calculateDistanceInYards } from '@shared/courseData';
import { useState, useEffect, useRef } from 'react';

interface EnhancedGolfGPSProps {
  hole: number;
  par: number;
  handicap: number;
}

export function EnhancedGolfGPS({ hole, par, handicap }: EnhancedGolfGPSProps) {
  const { position, isLoading, error } = useGPS();
  const [viewMode, setViewMode] = useState<'yardage' | 'map'>('yardage');
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const [targetMarker, setTargetMarker] = useState<{ lat: number; lng: number } | null>(null);
  const targetMarkerRef = useRef<any>(null);
  const targetLineRef = useRef<any>(null);

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
      console.error('Target distance calculation error:', error);
      return null;
    }
  };

  const toTarget = getTargetDistance();

  // Initialize Google Maps
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !googleMapRef.current) {
      initializeMap();
    }
  }, [viewMode, hole]);

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

      // Center map on tee box
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
        zoom: 17,
        mapTypeId: (window as any).google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      googleMapRef.current = map;
      
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
          <div class="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center text-white">
            <div class="text-center p-4">
              <div class="text-lg mb-2">🗺️ Satellite View Unavailable</div>
              <div class="text-sm text-gray-300">Maps may be restricted on this domain</div>
              <div class="text-xs text-gray-400 mt-2">Use the Yardages view for GPS data</div>
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

      // Clear ALL existing markers and lines on the map
      googleMapRef.current.data.forEach((feature: any) => {
        googleMapRef.current.data.remove(feature);
      });

      // Use standard Marker instead of AdvancedMarkerElement to avoid domain issues
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
        // Remove previous target marker
        if (targetMarkerRef.current) {
          targetMarkerRef.current.setMap(null);
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

        // Remove previous target line
        if (targetLineRef.current) {
          targetLineRef.current.setMap(null);
        }

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

      {/* View Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={viewMode === 'yardage' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('yardage')}
          className={`flex-1 ${viewMode === 'yardage' 
            ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
        >
          <List className="w-4 h-4 mr-2" />
          Yardages
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('map')}
          className={`flex-1 ${viewMode === 'map' 
            ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'}`}
        >
          <Map className="w-4 h-4 mr-2" />
          Satellite
        </Button>
      </div>

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

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'yardage' && (
        <>
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
        </>
      )}

      {viewMode === 'map' && (
        <>
          {/* Google Maps Satellite View */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  ref={mapRef}
                  className="w-full h-80 rounded-lg"
                  style={{ minHeight: '320px' }}
                />
                {/* Map Overlay - Yardage Display */}
                {position && (toGreen || toTee || toTarget) && (
                  <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg">
                    <div className="flex gap-4 text-sm">
                      {toGreen && (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-golf-green-400" />
                          <span className="font-bold text-golf-green-400">{toGreen}y</span>
                        </div>
                      )}
                      {toTee && (
                        <div className="flex items-center gap-1">
                          <Compass className="w-3 h-3 text-golf-sand-400" />
                          <span className="font-bold text-golf-sand-400">{toTee}y</span>
                        </div>
                      )}
                      {toTarget && (
                        <div className="flex items-center gap-1">
                          <span className="text-lg">🎯</span>
                          <span className="font-bold text-amber-400">{toTarget}y</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Instructions overlay */}
                {viewMode === 'map' && !targetMarker && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                    <div className="text-xs text-gray-300">Tap anywhere on the map to measure distance</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map Legend */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Map Legend</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏌️</span>
                  <span className="text-gray-300">Tee Box</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚩</span>
                  <span className="text-gray-300">Green Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <span className="text-gray-300">Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-white rounded"></div>
                  <span className="text-gray-300">Hole Layout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="text-gray-300">Target Marker (Tap to Place)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-amber-400 rounded"></div>
                  <span className="text-gray-300">Distance to Target</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}