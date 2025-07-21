import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGPS } from '@/hooks/useGPS';
import { calculateDistanceInYards, getHoleCoordinates } from '@shared/courseData';
import { MapPin, Target, Navigation, Crosshair, AlertCircle } from 'lucide-react';

interface EnhancedGolfGPSProps {
  hole: number;
  par: number;
  handicap: number;
}

export default function EnhancedGolfGPS({ hole, par, handicap }: EnhancedGolfGPSProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [tempMarker, setTempMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [teeMarker, setTeeMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [greenMarker, setGreenMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [courseLine, setCourseLine] = useState<google.maps.Polyline | null>(null);
  const [tempLine, setTempLine] = useState<google.maps.Polyline | null>(null);
  const [yardages, setYardages] = useState<{ toGreen: number; toTempMarker?: number }>({ toGreen: 0 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const { position, error: gpsError, isLoading } = useGPS();

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // Check if API key is available
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setMapError('Google Maps API key not configured. Contact admin to set up GPS functionality.');
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['marker']
        });

        await loader.load();
        
        if (!mapRef.current) return;

        let holeCoords;
        try {
          holeCoords = getHoleCoordinates(hole);
          if (!holeCoords || !holeCoords.tee || !holeCoords.green) {
            setMapError('Hole coordinates not found for hole ' + hole);
            return;
          }
        } catch (error) {
          console.error('Error getting hole coordinates:', error);
          setMapError('Unable to load hole coordinates');
          return;
        }

        // Center map on tee box
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy'
        });

        setMap(mapInstance);
        setMapLoaded(true);

        // Add click listener for temporary marker placement
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            placeTempMarker(event.latLng, mapInstance);
          }
        });

        setMapError(null);
      } catch (error) {
        console.error('Maps initialization error:', error);
        setMapError('Google Maps temporarily unavailable. GPS yardage calculations still work below.');
      }
    };

    initMap();
  }, [hole]);

  // Update markers and lines when map is ready
  useEffect(() => {
    if (!map || !mapLoaded) return;

    let holeCoords;
    try {
      holeCoords = getHoleCoordinates(hole);
      if (!holeCoords || !holeCoords.tee || !holeCoords.green) return;
    } catch (error) {
      console.error('Error getting hole coordinates for markers:', error);
      return;
    }

    // Clear existing markers and lines
    clearMarkers();

    // Create tee marker (red triangle)
    const teeElement = document.createElement('div');
    teeElement.innerHTML = '🏌️';
    teeElement.style.fontSize = '24px';
    teeElement.title = `Hole ${hole} Tee`;

    const teeMarkerInstance = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
      content: teeElement,
      title: `Hole ${hole} Tee`
    });
    setTeeMarker(teeMarkerInstance);

    // Create green marker (flag)
    const greenElement = document.createElement('div');
    greenElement.innerHTML = '🚩';
    greenElement.style.fontSize = '24px';
    greenElement.title = `Hole ${hole} Green`;

    const greenMarkerInstance = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: holeCoords.green.latitude, lng: holeCoords.green.longitude },
      content: greenElement,
      title: `Hole ${hole} Green`
    });
    setGreenMarker(greenMarkerInstance);

    // Draw line from tee to green
    const line = new google.maps.Polyline({
      path: [
        { lat: holeCoords.tee.latitude, lng: holeCoords.tee.longitude },
        { lat: holeCoords.green.latitude, lng: holeCoords.green.longitude }
      ],
      geodesic: true,
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map
    });
    setCourseLine(line);

    // Update yardages
    updateYardages();
  }, [map, mapLoaded, hole]);

  // Update user location marker
  useEffect(() => {
    try {
      if (!map || !position) return;

      // Clear existing user marker
      if (userMarker) {
        userMarker.map = null;
      }

      // Create user marker (blue dot with crosshairs)
      const userElement = document.createElement('div');
      userElement.innerHTML = '📍';
      userElement.style.fontSize = '20px';
      userElement.style.filter = 'hue-rotate(200deg)';
      userElement.title = 'Your Location';

      const userMarkerInstance = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: position.latitude, lng: position.longitude },
        content: userElement,
        title: 'Your Location'
      });
      setUserMarker(userMarkerInstance);

      updateYardages();
    } catch (error) {
      console.error('Error updating user location marker:', error);
    }
  }, [map, position]);

  const placeTempMarker = (latLng: google.maps.LatLng, mapInstance: google.maps.Map) => {
    // Remove existing temp marker and line
    if (tempMarker) {
      tempMarker.map = null;
    }
    if (tempLine) {
      tempLine.setMap(null);
    }

    // Create temp marker (target icon)
    const tempElement = document.createElement('div');
    tempElement.innerHTML = '🎯';
    tempElement.style.fontSize = '20px';
    tempElement.title = 'Measurement Point';

    const tempMarkerInstance = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstance,
      position: latLng,
      content: tempElement,
      title: 'Measurement Point'
    });
    setTempMarker(tempMarkerInstance);

    // Draw line from user to temp marker if user location is available
    if (position) {
      const line = new google.maps.Polyline({
        path: [
          { lat: position.latitude, lng: position.longitude },
          latLng
        ],
        geodesic: true,
        strokeColor: '#FF4444',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        strokePattern: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 }, offset: '0', repeat: '20px' }],
        map: mapInstance
      });
      setTempLine(line);
    }

    updateYardages(latLng);
  };

  const updateYardages = (tempLocation?: google.maps.LatLng) => {
    try {
      if (!position) return;

      const holeCoords = getHoleCoordinates(hole);
      if (!holeCoords || !holeCoords.green) return;

      const toGreen = calculateDistanceInYards(
        position.latitude,
        position.longitude,
        holeCoords.green.latitude,
        holeCoords.green.longitude
      );

      let toTempMarker: number | undefined;
      if (tempLocation) {
        toTempMarker = calculateDistanceInYards(
          position.latitude,
          position.longitude,
          tempLocation.lat(),
          tempLocation.lng()
        );
      }

      setYardages({ toGreen, toTempMarker });
    } catch (error) {
      console.error('Error updating yardages:', error);
    }
  };

  const clearMarkers = () => {
    try {
      if (teeMarker && teeMarker.map) teeMarker.map = null;
      if (greenMarker && greenMarker.map) greenMarker.map = null;
      if (tempMarker && tempMarker.map) tempMarker.map = null;
      if (courseLine) courseLine.setMap(null);
      if (tempLine) tempLine.setMap(null);
      setTeeMarker(null);
      setGreenMarker(null);
      setTempMarker(null);
      setCourseLine(null);
      setTempLine(null);
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  };

  if (mapError) {
    return (
      <div className="w-full space-y-4">
        {/* Show GPS info even when map fails */}
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

        {/* GPS Yardage - works without map */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-golf-green-400 mb-2">
                {(() => {
                  try {
                    const coords = getHoleCoordinates(hole);
                    if (position && coords && coords.green) {
                      return calculateDistanceInYards(
                        position.latitude, 
                        position.longitude, 
                        coords.green.latitude, 
                        coords.green.longitude
                      );
                    }
                    return '---';
                  } catch (error) {
                    console.error('GPS calculation error:', error);
                    return '---';
                  }
                })()}
              </div>
              <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                <Navigation className="w-4 h-4" />
                Yards to Green Center
              </div>
              {!position && (
                <div className="text-xs text-gray-500 mt-2">
                  {isLoading ? 'Getting GPS location...' : 'GPS location required for distance'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map error message */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-red-400">{mapError}</p>
            <p className="text-xs text-gray-500 mt-1">Yardage calculations work without the map</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Always show GPS yardage information even if map fails
  const toGreen = (() => {
    try {
      const holeCoords = getHoleCoordinates(hole);
      if (position && holeCoords && holeCoords.green) {
        return calculateDistanceInYards(
          position.latitude, 
          position.longitude, 
          holeCoords.green.latitude, 
          holeCoords.green.longitude
        );
      }
      return null;
    } catch (error) {
      console.error('GPS calculation error:', error);
      return null;
    }
  })();

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

      {/* Yardage Display */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-golf-green-400">
                {toGreen || '---'}
              </div>
              <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                <Navigation className="w-4 h-4" />
                To Green Center
              </div>
            </div>
            {yardages.toTempMarker && (
              <div>
                <div className="text-3xl font-bold text-red-400">
                  {yardages.toTempMarker}
                </div>
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                  <Crosshair className="w-4 h-4" />
                  To Target
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      {(isLoading || gpsError) && (
        <Card>
          <CardContent className="p-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Getting GPS location...
              </div>
            )}
            {gpsError && (
              <div className="text-red-600">
                GPS Error: {gpsError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div 
          ref={mapRef} 
          className="w-full h-[400px] bg-gray-100 flex items-center justify-center"
        >
          {!mapLoaded && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading satellite imagery...</p>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Tap anywhere on the map to measure distance to that point
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              🏌️ = Tee Box  •  🚩 = Green Center  •  📍 = Your Location  •  🎯 = Target
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}