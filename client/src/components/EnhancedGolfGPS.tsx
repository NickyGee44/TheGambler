import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGPS } from '@/hooks/useGPS';
import { useToast } from '@/hooks/use-toast';
import { HoleData, calculateDistance } from '@shared/courseData';
import { getTournamentCourses, GolfCourseDetails } from '@shared/golfCourseAPI';
import { 
  Navigation, 
  MapPin, 
  Flag, 
  Crosshair, 
  Target,
  Info,
  Loader2
} from 'lucide-react';

interface EnhancedGolfGPSProps {
  hole: HoleData;
  round: number;
  courseName: string;
  courseCenter: { lat: number; lng: number };
}

export default function EnhancedGolfGPS({ hole, round, courseName, courseCenter }: EnhancedGolfGPSProps) {
  const { location, isLoading: gpsLoading, error: gpsError, requestLocation } = useGPS();
  const { toast } = useToast();
  const [courseDetails, setCourseDetails] = useState<GolfCourseDetails | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load course details from Golf Course API
  useEffect(() => {
    async function loadCourseDetails() {
      setIsLoadingCourse(true);
      try {
        const courses = await getTournamentCourses();
        const courseData = round === 3 ? courses.muskokaBay : courses.deerhurst;
        setCourseDetails(courseData);
        
        if (courseData) {
          toast({
            title: "Course Data Loaded",
            description: `Found ${courseData.club_name} - ${courseData.course_name}`,
          });
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
      } finally {
        setIsLoadingCourse(false);
      }
    }
    
    loadCourseDetails();
  }, [round, toast]);

  // Initialize Google Maps
  useEffect(() => {
    if (window.google && !mapLoaded) {
      const mapDiv = document.getElementById('enhanced-golf-map');
      if (mapDiv) {
        const newMap = new window.google.maps.Map(mapDiv, {
          zoom: 16,
          center: courseCenter,
          mapTypeId: 'satellite',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add course marker
        new window.google.maps.Marker({
          position: courseCenter,
          map: newMap,
          title: courseName,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#16a34a',
            strokeWeight: 2,
          },
        });

        // Add hole markers
        const teeMarker = new window.google.maps.Marker({
          position: hole.tee,
          map: newMap,
          title: `Hole ${hole.number} Tee`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#1d4ed8',
            strokeWeight: 2,
          },
        });

        const greenMarker = new window.google.maps.Marker({
          position: hole.green.middle,
          map: newMap,
          title: `Hole ${hole.number} Green`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#22c55e',
            fillOpacity: 0.8,
            strokeColor: '#16a34a',
            strokeWeight: 2,
          },
        });

        setMap(newMap);
        setMapLoaded(true);
      }
    }
  }, [courseCenter, courseName, hole, mapLoaded]);

  // Add user location marker when GPS is available
  useEffect(() => {
    if (map && location) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#dc2626',
          strokeWeight: 2,
        },
      });

      // Add accuracy circle
      const accuracyCircle = new window.google.maps.Circle({
        center: { lat: location.lat, lng: location.lng },
        radius: location.accuracy || 10,
        map: map,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });

      return () => {
        userMarker.setMap(null);
        accuracyCircle.setMap(null);
      };
    }
  }, [map, location]);

  // Calculate yardages to green if GPS is available
  const yardages = location ? {
    front: Math.round(calculateDistance(location.lat, location.lng, hole.green.front.lat, hole.green.front.lng)),
    middle: Math.round(calculateDistance(location.lat, location.lng, hole.green.middle.lat, hole.green.middle.lng)),
    back: Math.round(calculateDistance(location.lat, location.lng, hole.green.back.lat, hole.green.back.lng)),
    tee: Math.round(calculateDistance(location.lat, location.lng, hole.tee.lat, hole.tee.lng))
  } : null;

  return (
    <div className="space-y-4">
      {/* Course Information */}
      {courseDetails && (
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="w-5 h-5 text-golf-green-600" />
              {courseDetails.club_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Course:</span>
                <div className="font-medium">{courseDetails.course_name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <div className="font-medium">{courseDetails.location.city}, {courseDetails.location.state}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Rating:</span>
                <div className="font-medium">{courseDetails.rating}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Slope:</span>
                <div className="font-medium">{courseDetails.slope}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPS Map */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-golf-green-600" />
            Hole {hole.number} GPS Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            id="enhanced-golf-map" 
            className="h-64 rounded-lg border border-border"
            style={{ minHeight: '256px' }}
          />
          {isLoadingCourse && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-golf-green-600" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPS Yardages */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-golf-green-600" />
            GPS Yardages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gpsLoading && (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-golf-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Getting your location...</p>
            </div>
          )}
          
          {gpsError && (
            <div className="text-center py-4">
              <p className="text-sm text-red-600 mb-2">{gpsError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestLocation}
                className="flex items-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                Enable GPS
              </Button>
            </div>
          )}
          
          {location && yardages && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GPS Status</span>
                <Badge variant="outline" className="text-green-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  Active (±{location.accuracy?.toFixed(0)}m)
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-golf-green-600">{yardages.front}</div>
                  <div className="text-xs text-muted-foreground">Front</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-golf-green-600">{yardages.middle}</div>
                  <div className="text-xs text-muted-foreground">Middle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-golf-green-600">{yardages.back}</div>
                  <div className="text-xs text-muted-foreground">Back</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600 mb-1">{yardages.tee} yards</div>
                <div className="text-xs text-muted-foreground">Distance to Tee</div>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  <Flag className="w-3 h-3 mr-1" />
                  Professional GPS System
                </Badge>
              </div>
            </div>
          )}
          
          {!location && !gpsLoading && !gpsError && (
            <div className="text-center py-4">
              <Button 
                variant="outline" 
                onClick={requestLocation}
                className="flex items-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                Get GPS Yardages
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hole Details */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle>Hole {hole.number} Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-golf-green-600">{hole.par}</div>
              <div className="text-xs text-muted-foreground">Par</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-golf-green-600">{hole.yardage}</div>
              <div className="text-xs text-muted-foreground">Yards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-golf-green-600">{hole.handicap}</div>
              <div className="text-xs text-muted-foreground">Handicap</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}