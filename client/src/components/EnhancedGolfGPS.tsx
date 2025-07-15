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

  // Calculate yardage to different green positions
  const calculateYardage = (targetLat: number, targetLng: number) => {
    if (!location) return 0;
    return Math.round(calculateDistance(location.lat, location.lng, targetLat, targetLng) * 1093.61); // Convert km to yards
  };

  return (
    <div className="space-y-6">
      {/* Hole Information Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Hole {hole.number}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {courseName} • Par {hole.par} • {hole.yardage} yards
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline">HCP {hole.handicap}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Information */}
      {courseDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Course:</span>
                <span className="text-sm font-medium">{courseDetails.club_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="text-sm font-medium">
                  {courseDetails.location.city}, {courseDetails.location.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <span className="text-sm font-medium">{courseDetails.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Slope:</span>
                <span className="text-sm font-medium">{courseDetails.slope}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPS Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            GPS Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2">
                {gpsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Badge variant={location ? "default" : "secondary"}>
                  {gpsLoading ? "Getting GPS..." : location ? "GPS Active" : "GPS Inactive"}
                </Badge>
              </div>
            </div>
            
            {location && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coordinates:</span>
                  <span className="text-sm font-mono">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy:</span>
                  <span className="text-sm">±{Math.round(location.accuracy)} meters</span>
                </div>
              </>
            )}
            
            {gpsError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {gpsError}
              </div>
            )}
            
            <Button 
              onClick={requestLocation}
              disabled={gpsLoading}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {gpsLoading ? "Getting Location..." : "Update GPS Location"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distance Information */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair className="h-5 w-5" />
              Distance to Green
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {calculateYardage(hole.green.middle.lat, hole.green.middle.lng)}
                </div>
                <div className="text-sm text-muted-foreground">yards to middle</div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">
                    {calculateYardage(hole.green.front.lat, hole.green.front.lng)}
                  </div>
                  <div className="text-xs text-muted-foreground">FRONT</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {calculateYardage(hole.green.middle.lat, hole.green.middle.lng)}
                  </div>
                  <div className="text-xs text-muted-foreground">MIDDLE</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {calculateYardage(hole.green.back.lat, hole.green.back.lng)}
                  </div>
                  <div className="text-xs text-muted-foreground">BACK</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Distance from tee</div>
                <div className="text-lg font-medium">
                  {calculateYardage(hole.tee.lat, hole.tee.lng)} yards
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}