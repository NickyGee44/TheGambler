import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Target, Zap, Crosshair } from "lucide-react";
import { useGPS } from "@/hooks/useGPS";
import { calculateDistance, type HoleData } from "@shared/courseData";
import { Loader } from "@googlemaps/js-api-loader";

interface HoleMapProps {
  hole: HoleData;
  courseName: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function HoleMap({ hole, courseName }: HoleMapProps) {
  const { location, isLoading, error, requestLocation } = useGPS();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [playerMarker, setPlayerMarker] = useState<any>(null);
  const [playerAccuracyCircle, setPlayerAccuracyCircle] = useState<any>(null);
  const [teeMarker, setTeeMarker] = useState<any>(null);
  const [greenMarkers, setGreenMarkers] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState<string>("");

  // Calculate distances when location changes
  const distances = location ? {
    toTee: calculateDistance(location.lat, location.lng, hole.tee.lat, hole.tee.lng),
    toGreenFront: calculateDistance(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng),
    toGreenMiddle: calculateDistance(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng),
    toGreenBack: calculateDistance(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)
  } : null;

  // Fetch API key from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        setApiKey(config.googleMapsApiKey || "");
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!apiKey) return;
    
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"]
        });

        const { Map } = await loader.importLibrary("maps");

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: hole.tee.lat, lng: hole.tee.lng },
            zoom: 17,
            mapTypeId: "satellite",
            tilt: 0,
            heading: 0,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          setMap(mapInstance);

          // Add tee marker - blue circle like The Grint
          const teeMarkerInstance = new window.google.maps.Marker({
            position: { lat: hole.tee.lat, lng: hole.tee.lng },
            map: mapInstance,
            title: "Tee",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#1d4ed8",
              strokeWeight: 2,
              scale: 8
            }
          });
          setTeeMarker(teeMarkerInstance);

          // Add green markers - different shades of green like professional golf apps
          const greenMarkerInstances = [
            new window.google.maps.Marker({
              position: { lat: hole.green.front.lat, lng: hole.green.front.lng },
              map: mapInstance,
              title: "Green Front",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#10b981",
                fillOpacity: 1,
                strokeColor: "#059669",
                strokeWeight: 2,
                scale: 5
              }
            }),
            new window.google.maps.Marker({
              position: { lat: hole.green.middle.lat, lng: hole.green.middle.lng },
              map: mapInstance,
              title: "Green Middle (Pin)",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#059669",
                fillOpacity: 1,
                strokeColor: "#047857",
                strokeWeight: 2,
                scale: 7
              }
            }),
            new window.google.maps.Marker({
              position: { lat: hole.green.back.lat, lng: hole.green.back.lng },
              map: mapInstance,
              title: "Green Back",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#047857",
                fillOpacity: 1,
                strokeColor: "#065f46",
                strokeWeight: 2,
                scale: 5
              }
            })
          ];
          setGreenMarkers(greenMarkerInstances);

          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setMapLoaded(false);
        
        // Check if it's a domain restriction error
        if (error instanceof Error && error.message.includes('RefererNotAllowedMapError')) {
          console.warn("Google Maps API domain not authorized. Please add *.replit.dev/*, *.replit.com/*, and *.replit.app/* to your API key restrictions.");
        }
      }
    };

    initializeMap();
  }, [hole, apiKey]);

  // Update player location marker
  useEffect(() => {
    if (map && location && window.google) {
      // Remove existing player marker and accuracy circle
      if (playerMarker) {
        playerMarker.setMap(null);
      }
      if (playerAccuracyCircle) {
        playerAccuracyCircle.setMap(null);
      }

      // Add GPS accuracy circle like professional golf apps
      const accuracyCircle = new window.google.maps.Circle({
        center: { lat: location.lat, lng: location.lng },
        radius: location.accuracy,
        map: map,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.3,
        strokeWeight: 1
      });
      setPlayerAccuracyCircle(accuracyCircle);

      // Add new player marker - red circle with white border like The Grint
      const newPlayerMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 10
        }
      });

      setPlayerMarker(newPlayerMarker);
    }
  }, [map, location]);

  // Fallback simple map if Google Maps fails
  const renderSimpleMap = () => {
    return (
      <div className="w-full h-64 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center border">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Interactive satellite map unavailable
          </p>
          <p className="text-xs text-muted-foreground">
            Enable location services for GPS features
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with hole info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hole {hole.number}</h3>
          <p className="text-sm text-muted-foreground">
            {courseName} • Par {hole.par} • {hole.yardage} yards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          <span className="text-sm">
            {isLoading ? "Getting location..." : 
             error ? "Location unavailable" : 
             location ? `±${location.accuracy}m` : "No location"}
          </span>
        </div>
      </div>

      {/* Interactive Satellite Map */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-80 rounded-lg overflow-hidden"
          style={{ minHeight: '320px' }}
        />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              {apiKey ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading satellite map...</p>
                </>
              ) : (
                <>
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Satellite map unavailable
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Google Maps API key needed
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Distance Information */}
      {distances && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(distances.toGreenFront)}
            </div>
            <div className="text-xs text-muted-foreground">Front</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(distances.toGreenMiddle)}
            </div>
            <div className="text-xs text-muted-foreground">Middle</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(distances.toGreenBack)}
            </div>
            <div className="text-xs text-muted-foreground">Back</div>
          </div>
        </div>
      )}

      {/* GPS Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {location && (
            <Badge variant="outline" className="text-green-600">
              <Crosshair className="w-3 h-3 mr-1" />
              GPS Active
            </Badge>
          )}
          {error && (
            <Badge variant="destructive">
              GPS Unavailable
            </Badge>
          )}
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

      {/* Map Legend */}
      <div className="bg-muted rounded-lg p-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Tee</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Green</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}