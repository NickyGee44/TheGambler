import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, Target } from "lucide-react";
import { HoleData } from "@shared/courseData";
import { useGPS } from "@/hooks/useGPS";

interface ProfessionalGolfGPSProps {
  hole: HoleData;
  courseName: string;
  courseCenter: { lat: number; lng: number };
}

export default function ProfessionalGolfGPS({ hole, courseName, courseCenter }: ProfessionalGolfGPSProps) {
  const [map, setMap] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [playerMarker, setPlayerMarker] = useState<any>(null);
  const [accuracyCircle, setAccuracyCircle] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { location, isLoading, error, requestLocation } = useGPS();

  // Calculate yardage based on GPS (using clubhouse as reference for now)
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

  // Get API key
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
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
          // Professional golf app configuration - show actual course area
          const mapInstance = new Map(mapRef.current, {
            center: courseCenter,
            zoom: 15, // Show full golf course area like The Grint
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

          // Add course center marker
          const courseMarker = new window.google.maps.Marker({
            position: courseCenter,
            map: mapInstance,
            title: `${courseName} - Hole ${hole.number}`,
            icon: {
              path: "M -8,-8 L 8,-8 L 8,8 L -8,8 Z", // Square clubhouse
              fillColor: "#1f2937",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1
            },
            zIndex: 100
          });

          // Add hole information
          const holeInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; text-align: center; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">Hole ${hole.number}</h3>
                <div style="margin: 0; color: #6b7280; font-size: 14px;">Par ${hole.par} • ${hole.yardage} yards</div>
                <div style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">Handicap ${hole.handicap}</div>
              </div>
            `
          });
          
          holeInfoWindow.open(mapInstance, courseMarker);
          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, [apiKey, courseCenter, hole, courseName]);

  // Update player location on map
  useEffect(() => {
    if (!map || !location) return;

    // Remove existing markers
    if (playerMarker) {
      playerMarker.setMap(null);
    }
    if (accuracyCircle) {
      accuracyCircle.setMap(null);
    }

    // Add GPS accuracy circle
    const newAccuracyCircle = new window.google.maps.Circle({
      center: { lat: location.lat, lng: location.lng },
      radius: location.accuracy,
      map: map,
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.25,
      strokeWeight: 1
    });
    setAccuracyCircle(newAccuracyCircle);

    // Add player marker like professional golf apps
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

    // Center map on player location
    map.setCenter({ lat: location.lat, lng: location.lng });
    map.setZoom(17);
  }, [map, location]);

  // Calculate distances
  const yardageToGreen = location ? calculateYardage(location.lat, location.lng, courseCenter.lat, courseCenter.lng) : null;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">GPS Satellite View</h3>
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

      {/* Satellite Map */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-80 rounded-lg overflow-hidden border"
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
                  <p className="text-sm text-muted-foreground">Google Maps API unavailable</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Golf App Yardage Display */}
      {location && yardageToGreen && (
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">GPS Distance</h3>
            <div className="text-xs text-muted-foreground">
              ±{Math.round(location.accuracy)}yd accuracy
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Distance to Course</div>
            <div className="text-3xl font-bold text-blue-500">{yardageToGreen}</div>
            <div className="text-xs text-muted-foreground">yards</div>
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
          <button
            onClick={requestLocation}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <Navigation className="h-4 w-4" />
            {isLoading ? "Getting GPS..." : "Update Location"}
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Professional GPS like The Grint
        </div>
      </div>

      {/* Note */}
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <p className="text-sm text-muted-foreground">
          This shows the actual {courseName} golf course location. Enable GPS for precise yardage calculations.
        </p>
      </div>
    </div>
  );
}