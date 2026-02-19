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
          // Professional golf app configuration like The Grint/Arccos
          const mapInstance = new Map(mapRef.current, {
            center: { lat: hole.tee.lat, lng: hole.tee.lng },
            zoom: 18, // Closer zoom for golf hole detail
            mapTypeId: "satellite",
            tilt: 0,
            heading: 0,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "road",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          setMap(mapInstance);

          // Add tee marker - distinctive blue square like professional golf apps
          const teeMarkerInstance = new window.google.maps.Marker({
            position: { lat: hole.tee.lat, lng: hole.tee.lng },
            map: mapInstance,
            title: `Hole ${hole.number} Tee`,
            icon: {
              path: "M -6,-6 L 6,-6 L 6,6 L -6,6 Z", // Square shape
              fillColor: "#0066cc",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1.5
            },
            zIndex: 100
          });
          setTeeMarker(teeMarkerInstance);

          // Add green area outline (like professional golf apps)
          const greenArea = new window.google.maps.Polygon({
            paths: [
              { lat: hole.green.front.lat - 0.0001, lng: hole.green.front.lng - 0.0001 },
              { lat: hole.green.front.lat - 0.0001, lng: hole.green.back.lng + 0.0001 },
              { lat: hole.green.back.lat + 0.0001, lng: hole.green.back.lng + 0.0001 },
              { lat: hole.green.back.lat + 0.0001, lng: hole.green.front.lng - 0.0001 }
            ],
            strokeColor: "#10b981",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#10b981",
            fillOpacity: 0.15,
            map: mapInstance
          });

          // Add precise green markers like The Grint
          const greenMarkerInstances = [
            // Front of green - small circle
            new window.google.maps.Marker({
              position: { lat: hole.green.front.lat, lng: hole.green.front.lng },
              map: mapInstance,
              title: "Front of Green",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#22c55e",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1,
                scale: 4
              },
              zIndex: 90
            }),
            // Pin position - flag-like marker
            new window.google.maps.Marker({
              position: { lat: hole.green.middle.lat, lng: hole.green.middle.lng },
              map: mapInstance,
              title: "Pin Position",
              icon: {
                path: "M 0,-20 L 0,0 M 0,-20 L 12,-16 L 12,-12 L 0,-16 Z", // Flag shape
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#000000",
                strokeWeight: 1,
                scale: 1
              },
              zIndex: 95
            }),
            // Back of green - small circle
            new window.google.maps.Marker({
              position: { lat: hole.green.back.lat, lng: hole.green.back.lng },
              map: mapInstance,
              title: "Back of Green",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#16a34a",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1,
                scale: 4
              },
              zIndex: 90
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

      // Add GPS accuracy circle - subtle like professional golf apps
      const accuracyCircle = new window.google.maps.Circle({
        center: { lat: location.lat, lng: location.lng },
        radius: location.accuracy,
        map: map,
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.25,
        strokeWeight: 1
      });
      setPlayerAccuracyCircle(accuracyCircle);

      // Add player location marker - distinctive like The Grint/Arccos
      const newPlayerMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: "Your Location",
        icon: {
          path: "M 0,-12 L 8,0 L 0,12 L -8,0 Z", // Diamond shape
          fillColor: "#ff0000",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 1.2
        },
        zIndex: 200
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

      {/* Professional Golf App Yardage Display */}
      {distances && (
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">GPS Yardages</h3>
            <div className="text-xs text-muted-foreground">
              {location ? `±${Math.round(location.accuracy)}yd accuracy` : "No GPS"}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Front</div>
              <div className="text-xl font-bold text-green-500">{Math.round(distances.toGreenFront)}</div>
              <div className="text-xs text-muted-foreground">yd</div>
            </div>
            <div className="text-center border-l border-r px-2">
              <div className="text-xs text-muted-foreground mb-1">Pin</div>
              <div className="text-2xl font-bold text-red-500">{Math.round(distances.toGreenMiddle)}</div>
              <div className="text-xs text-muted-foreground">yd</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Back</div>
              <div className="text-xl font-bold text-green-700">{Math.round(distances.toGreenBack)}</div>
              <div className="text-xs text-muted-foreground">yd</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Hole {hole.number}</span>
              <span className="font-semibold">Par {hole.par}</span>
              <span className="text-muted-foreground">HCP {hole.handicap}</span>
            </div>
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