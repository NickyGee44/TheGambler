// Golf course data for different rounds
export interface HoleInfo {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

export interface CourseData {
  name: string;
  location: string;
  holes: HoleInfo[];
}

// Lionhead Golf Course data (Test Round)
export const lionheadCourse: CourseData = {
  name: "Lionhead Golf Course",
  location: "Mississauga, Ontario",
  holes: [
    { number: 1, par: 4, yardage: 350, handicap: 10 },
    { number: 2, par: 5, yardage: 500, handicap: 2 },
    { number: 3, par: 3, yardage: 150, handicap: 18 },
    { number: 4, par: 4, yardage: 380, handicap: 6 },
    { number: 5, par: 4, yardage: 365, handicap: 14 },
    { number: 6, par: 3, yardage: 175, handicap: 16 },
    { number: 7, par: 5, yardage: 520, handicap: 4 },
    { number: 8, par: 4, yardage: 390, handicap: 8 },
    { number: 9, par: 4, yardage: 360, handicap: 12 },
    { number: 10, par: 4, yardage: 370, handicap: 11 },
    { number: 11, par: 3, yardage: 160, handicap: 17 },
    { number: 12, par: 4, yardage: 400, handicap: 5 },
    { number: 13, par: 5, yardage: 510, handicap: 3 },
    { number: 14, par: 4, yardage: 345, handicap: 15 },
    { number: 15, par: 4, yardage: 385, handicap: 9 },
    { number: 16, par: 3, yardage: 140, handicap: 13 },
    { number: 17, par: 4, yardage: 375, handicap: 7 },
    { number: 18, par: 5, yardage: 530, handicap: 1 }
  ]
};

// Test Round participants
export const testRoundPlayers = [
  { id: 1, name: "Nick Grossi", handicap: 20 },
  { id: 3, name: "Erik Boudreau", handicap: 10 },
  { id: 6, name: "Connor Patterson", handicap: 3 },
  { id: 13, name: "Bailey Carlson", handicap: 16 }
];

// Get course data for test round
export const getTestRoundCourse = (): CourseData => {
  return lionheadCourse;
};

// Check if user can access test round
export const canAccessTestRound = (userId: number): boolean => {
  const allowedIds = [1, 3, 6, 13]; // Nick, Erik, Connor, Bailey
  return allowedIds.includes(userId);
};

// GPS coordinates placeholder (to be provided later)
export interface GPSCoordinate {
  latitude: number;
  longitude: number;
}

export interface HoleCoordinates {
  hole: number;
  tee?: GPSCoordinate;
  green?: GPSCoordinate;
  fairway?: GPSCoordinate;
}

// Placeholder for Lionhead GPS coordinates - to be updated when provided
export const lionheadGPSCoordinates: HoleCoordinates[] = [
  // Will be populated when GPS coordinates are provided
  { hole: 1 },
  { hole: 2 },
  { hole: 3 },
  { hole: 4 },
  { hole: 5 },
  { hole: 6 },
  { hole: 7 },
  { hole: 8 },
  { hole: 9 },
  { hole: 10 },
  { hole: 11 },
  { hole: 12 },
  { hole: 13 },
  { hole: 14 },
  { hole: 15 },
  { hole: 16 },
  { hole: 17 },
  { hole: 18 }
];

// Get GPS coordinates for test round hole
export const getTestRoundHoleCoordinates = (hole: number): HoleCoordinates | null => {
  const holeData = lionheadGPSCoordinates.find(h => h.hole === hole);
  return holeData || null;
};

// Legacy function name for compatibility with existing components
export const getHoleCoordinates = getTestRoundHoleCoordinates;

// Haversine formula to calculate distance between two GPS points in yards
export const calculateDistanceInYards = (
  start: GPSCoordinate,
  end: GPSCoordinate
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (end.latitude - start.latitude) * Math.PI / 180;
  const dLon = (end.longitude - start.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  
  // Convert kilometers to yards (1 km = 1093.61 yards)
  return Math.round(distanceKm * 1093.61);
};

// Legacy compatibility function - returns course data based on round
export const getCourseForRound = (round: number): CourseData => {
  // For now, return Lionhead course data for Test Round
  // This can be expanded later for different courses per round
  return lionheadCourse;
};

// Legacy HoleData interface for compatibility
export interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}