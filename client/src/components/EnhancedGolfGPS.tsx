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

      {/* Course Yardage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Course Yardages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {hole.yardage}
              </div>
              <div className="text-sm text-muted-foreground">total hole distance</div>
            </div>
            
            <Separator />
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ GPS Distance Calculations Unavailable
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  Precise hole coordinates are needed for accurate yardage calculations. 
                  Use course markers and your best judgment for shot distances.
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Use course markers for:</div>
              <div className="text-sm font-medium mt-1">
                • 150-yard markers • Sprinkler heads • Tee markers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}