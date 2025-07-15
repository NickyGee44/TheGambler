import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, Target, Info } from "lucide-react";
import { HoleData } from "@shared/courseData";
import { useGPS } from "@/hooks/useGPS";
import { getTournamentCourses, GolfCourseDetails } from "@shared/golfCourseAPI";

interface ProfessionalGolfGPSProps {
  hole: HoleData;
  courseName: string;
  courseCenter: { lat: number; lng: number };
}

// Add round prop to determine which course to fetch
interface EnhancedProfessionalGolfGPSProps extends ProfessionalGolfGPSProps {
  round?: number;
}

export default function ProfessionalGolfGPS({ hole, courseName, courseCenter, round }: EnhancedProfessionalGolfGPSProps) {
  const [map, setMap] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [playerMarker, setPlayerMarker] = useState<any>(null);
  const [accuracyCircle, setAccuracyCircle] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<GolfCourseDetails | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
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

  // Load course details from Golf Course API
  useEffect(() => {
    if (round) {
      const loadCourseDetails = async () => {
        setIsLoadingCourse(true);
        try {
          const courses = await getTournamentCourses();
          const courseData = round === 3 ? courses.muskokaBay : courses.deerhurst;
          setCourseDetails(courseData);
        } catch (error) {
          console.error('Failed to load course details:', error);
        } finally {
          setIsLoadingCourse(false);
        }
      };
      
      loadCourseDetails();
    }
  }, [round]);

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
          // Professional golf app configuration - show actual course area like The Grint
          const mapInstance = new Map(mapRef.current, {
            center: hole.tee, // Center on the tee box
            zoom: 17, // Close zoom to show hole detail like The Grint
            mapTypeId: "satellite",
            tilt: 0,
            heading: 0,
            disableDefaultUI: true,
            zoomControl: false,
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
              },
              {
                featureType: "administrative",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          setMap(mapInstance);

          // Add tee box marker (red tee marker like The Grint)
          const teeMarker = new window.google.maps.Marker({
            position: hole.tee,
            map: mapInstance,
            title: `Hole ${hole.number} Tee`,
            icon: {
              path: "M 0,-8 L 8,8 L -8,8 Z", // Triangle pointing up
              fillColor: "#dc2626",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1.5
            },
            zIndex: 100
          });

          // Add green markers (front, middle, back)
          const greenFrontMarker = new window.google.maps.Marker({
            position: hole.green.front,
            map: mapInstance,
            title: `Green Front`,
            icon: {
              path: "M -6,-6 L 6,-6 L 6,6 L -6,6 Z",
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1
            },
            zIndex: 90
          });

          const greenMiddleMarker = new window.google.maps.Marker({
            position: hole.green.middle,
            map: mapInstance,
            title: `Green Middle`,
            icon: {
              path: "M -6,-6 L 6,-6 L 6,6 L -6,6 Z",
              fillColor: "#16a34a",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1.2
            },
            zIndex: 95
          });

          const greenBackMarker = new window.google.maps.Marker({
            position: hole.green.back,
            map: mapInstance,
            title: `Green Back`,
            icon: {
              path: "M -6,-6 L 6,-6 L 6,6 L -6,6 Z",
              fillColor: "#15803d",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 1
            },
            zIndex: 90
          });

          // Add line from tee to green middle (like The Grint)
          const holePath = new window.google.maps.Polyline({
            path: [hole.tee, hole.green.middle],
            geodesic: true,
            strokeColor: "#ffffff",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: mapInstance,
            zIndex: 50
          });

          // Add yardage labels like The Grint
          const middlePoint = {
            lat: (hole.tee.lat + hole.green.middle.lat) / 2,
            lng: (hole.tee.lng + hole.green.middle.lng) / 2
          };

          const yardageOverlay = new window.google.maps.InfoWindow({
            content: `
              <div style="
                background: rgba(0, 0, 0, 0.8); 
                color: white; 
                padding: 8px 12px; 
                border-radius: 20px; 
                font-family: system-ui; 
                font-size: 18px; 
                font-weight: bold;
                text-align: center;
                border: 2px solid white;
              ">
                ${hole.yardage}
              </div>
            `,
            position: middlePoint,
            disableAutoPan: true
          });
          
          yardageOverlay.open(mapInstance);
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

    // Add player marker like professional golf apps (circle with crosshairs)
    const newPlayerMarker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: "Your Location",
      icon: {
        path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0 M 0,-12 L 0,12 M -12,0 L 12,0", // Circle with crosshairs
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 1
      },
      zIndex: 200
    });
    setPlayerMarker(newPlayerMarker);

    // Show player location yardages like The Grint
    const frontYardage = calculateYardage(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng);
    const middleYardage = calculateYardage(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng);
    const backYardage = calculateYardage(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng);

    // Add yardage overlays for player position
    const playerYardageOverlay = new window.google.maps.InfoWindow({
      content: `
        <div style="
          background: rgba(0, 0, 0, 0.9); 
          color: white; 
          padding: 12px; 
          border-radius: 12px; 
          font-family: system-ui; 
          text-align: center;
          border: 2px solid white;
          min-width: 80px;
        ">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${middleYardage}</div>
          <div style="font-size: 12px; margin-bottom: 8px;">to middle</div>
          <div style="font-size: 10px; color: #ccc;">
            ${frontYardage} • ${middleYardage} • ${backYardage}
          </div>
        </div>
      `,
      position: { lat: location.lat, lng: location.lng },
      disableAutoPan: true,
      pixelOffset: new window.google.maps.Size(0, -30)
    });
    
    playerYardageOverlay.open(map);

    // Don't auto-center on player, keep hole view like The Grint
    // map.setCenter({ lat: location.lat, lng: location.lng });
  }, [map, location]);

  // Calculate distances
  const yardageToGreen = location ? calculateYardage(location.lat, location.lng, courseCenter.lat, courseCenter.lng) : null;

  return (
    <div className="w-full space-y-4">
      {/* Course Information from Golf Course API */}
      {courseDetails && (
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Course Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Course:</div>
              <div className="font-medium">{courseDetails.club_name}</div>
              <div className="text-xs text-muted-foreground">{courseDetails.course_name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Location:</div>
              <div className="font-medium">{courseDetails.location.city}, {courseDetails.location.state}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Rating:</div>
              <div className="font-medium">{courseDetails.rating}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Slope:</div>
              <div className="font-medium">{courseDetails.slope}</div>
            </div>
          </div>
        </div>
      )}

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

      {/* Satellite Map - Full Screen like The Grint */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg overflow-hidden border"
          style={{ minHeight: '400px' }}
        />
        
        {/* Top overlay - Hole info like The Grint */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg">
            <div className="text-lg font-bold">HOLE {hole.number}</div>
            <div className="text-sm">Par {hole.par} • {hole.yardage} yds</div>
          </div>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg">
            <div className="text-sm">HCP {hole.handicap}</div>
          </div>
        </div>

        {/* Bottom overlay - Distance info like The Grint */}
        {location && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black/90 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-300">TO GREEN</div>
                <div className="text-xs text-gray-300">±{Math.round(location.accuracy)}y</div>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <div>
                  <div className="text-xs text-gray-300">FRONT</div>
                  <div>{calculateYardage(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-300">MIDDLE</div>
                  <div className="text-2xl">{calculateYardage(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-300">BACK</div>
                  <div>{calculateYardage(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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

      {/* GPS Controls */}
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
    </div>
  );
}