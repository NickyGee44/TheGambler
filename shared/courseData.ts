// Golf course data for different rounds
export interface HoleInfo {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

// Legacy HoleData interface for compatibility
export interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

export interface CourseData {
  name: string;
  location: string;
  holes: HoleInfo[];
  totalPar: number;
  totalYardage: number;
  courseRating: number;
}

// Deerhurst Highlands Golf Course data (Rounds 1-3) - Official Gold Tee Scorecard
export const deerhurstCourse: CourseData = {
  name: "Deerhurst Highlands Golf Course",
  location: "Huntsville, Ontario",
  holes: [
    { number: 1, par: 4, yardage: 374, handicap: 13 },
    { number: 2, par: 4, yardage: 465, handicap: 1 },
    { number: 3, par: 3, yardage: 201, handicap: 15 },
    { number: 4, par: 4, yardage: 319, handicap: 17 },
    { number: 5, par: 5, yardage: 601, handicap: 3 },
    { number: 6, par: 4, yardage: 390, handicap: 7 },
    { number: 7, par: 5, yardage: 490, handicap: 9 },
    { number: 8, par: 3, yardage: 231, handicap: 11 },
    { number: 9, par: 4, yardage: 402, handicap: 5 },
    { number: 10, par: 4, yardage: 464, handicap: 2 },
    { number: 11, par: 4, yardage: 450, handicap: 4 },
    { number: 12, par: 3, yardage: 212, handicap: 16 },
    { number: 13, par: 4, yardage: 355, handicap: 14 },
    { number: 14, par: 5, yardage: 523, handicap: 12 },
    { number: 15, par: 4, yardage: 411, handicap: 8 },
    { number: 16, par: 4, yardage: 375, handicap: 10 },
    { number: 17, par: 3, yardage: 195, handicap: 18 },
    { number: 18, par: 5, yardage: 553, handicap: 6 }
  ],
  totalPar: 72,
  totalYardage: 7031,
  courseRating: 73.8
};

// Muskoka Bay Club data (Round 3) - Official Championship Tee Scorecard
export const muskokaBayCourse: CourseData = {
  name: "Muskoka Bay Club",
  location: "Gravenhurst, Ontario",
  holes: [
    { number: 1, par: 4, yardage: 392, handicap: 9 },
    { number: 2, par: 3, yardage: 181, handicap: 15 },
    { number: 3, par: 4, yardage: 399, handicap: 5 },
    { number: 4, par: 4, yardage: 319, handicap: 13 },
    { number: 5, par: 5, yardage: 516, handicap: 1 },
    { number: 6, par: 3, yardage: 203, handicap: 17 },
    { number: 7, par: 4, yardage: 409, handicap: 11 },
    { number: 8, par: 5, yardage: 494, handicap: 3 },
    { number: 9, par: 4, yardage: 390, handicap: 7 },
    { number: 10, par: 4, yardage: 408, handicap: 8 },
    { number: 11, par: 3, yardage: 173, handicap: 18 },
    { number: 12, par: 5, yardage: 539, handicap: 4 },
    { number: 13, par: 4, yardage: 370, handicap: 16 },
    { number: 14, par: 5, yardage: 560, handicap: 2 },
    { number: 15, par: 4, yardage: 445, handicap: 6 },
    { number: 16, par: 4, yardage: 440, handicap: 12 },
    { number: 17, par: 3, yardage: 182, handicap: 14 },
    { number: 18, par: 4, yardage: 429, handicap: 10 }
  ],
  totalPar: 72,
  totalYardage: 6911,
  courseRating: 72.4
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

// Deerhurst Golf Course GPS coordinates (Rounds 1-3)
export const deerhurstGPSCoordinates: HoleCoordinates[] = [
  { hole: 1, tee: { latitude: 45.34616103620428, longitude: -79.14535801798596 }, green: { latitude: 45.3443222916284, longitude: -79.14852083567796 } },
  { hole: 2, tee: { latitude: 45.34398102863268, longitude: -79.14943993587053 }, green: { latitude: 45.34311671149175, longitude: -79.14464895988188 } },
  { hole: 3, tee: { latitude: 45.342559040427574, longitude: -79.14457368654315 }, green: { latitude: 45.34306720909093, longitude: -79.14238132649747 } },
  { hole: 4, tee: { latitude: 45.342153238850436, longitude: -79.14239465378142 }, green: { latitude: 45.341312234785775, longitude: -79.1389537176389 } },
  { hole: 5, tee: { latitude: 45.34094504833668, longitude: -79.13863108701688 }, green: { latitude: 45.33897677364309, longitude: -79.14450043083217 } },
  { hole: 6, tee: { latitude: 45.33907426559279, longitude: -79.14531823871374 }, green: { latitude: 45.34191249016493, longitude: -79.1428569497976 } },
  { hole: 7, tee: { latitude: 45.34239991398666, longitude: -79.1447426024231 }, green: { latitude: 45.34324969895713, longitude: -79.15030512509948 } },
  { hole: 8, tee: { latitude: 45.343859241949744, longitude: -79.15093831389868 }, green: { latitude: 45.34518335653074, longitude: -79.15280679202314 } },
  { hole: 9, tee: { latitude: 45.345497803328975, longitude: -79.15132153707968 }, green: { latitude: 45.34655086516202, longitude: -79.14703617024507 } },
  { hole: 10, tee: { latitude: 45.347316997409024, longitude: -79.14429922284117 }, green: { latitude: 45.34961056181364, longitude: -79.14032469771445 } },
  { hole: 11, tee: { latitude: 45.3498078597367, longitude: -79.13939286277414 }, green: { latitude: 45.353034175006364, longitude: -79.1382612876836 } },
  { hole: 12, tee: { latitude: 45.353614889473675, longitude: -79.13856608379822 }, green: { latitude: 45.353105669806425, longitude: -79.1407678630912 } },
  { hole: 13, tee: { latitude: 45.35269133539527, longitude: -79.1418913065636 }, green: { latitude: 45.35539559784702, longitude: -79.14144423280938 } },
  { hole: 14, tee: { latitude: 45.355011913301205, longitude: -79.14257118051609 }, green: { latitude: 45.35190927644294, longitude: -79.1455617675153 } },
  { hole: 15, tee: { latitude: 45.35145249385614, longitude: -79.14526171854538 }, green: { latitude: 45.349451100924675, longitude: -79.14778290586527 } },
  { hole: 16, tee: { latitude: 45.349810757624006, longitude: -79.14829734208942 }, green: { latitude: 45.34757966849906, longitude: -79.15089998378599 } },
  { hole: 17, tee: { latitude: 45.34656124625057, longitude: -79.1510667030502 }, green: { latitude: 45.34531092168978, longitude: -79.1527587352176 } },
  { hole: 18, tee: { latitude: 45.34588458183412, longitude: -79.15103725364635 }, green: { latitude: 45.347380532587316, longitude: -79.14575116111246 } }
];



// Get GPS coordinates based on round and hole
export const getHoleCoordinates = (hole: number, round?: number): HoleCoordinates | null => {
  // For Round 3, use Muskoka Bay coordinates (using Deerhurst coordinates until Muskoka Bay GPS data is provided)
  if (round === 3) {
    // TODO: Replace with actual Muskoka Bay GPS coordinates when available
    const holeData = deerhurstGPSCoordinates.find(h => h.hole === hole);
    return holeData || null;
  }
  
  // For rounds 1-2, use Deerhurst coordinates
  const holeData = deerhurstGPSCoordinates.find(h => h.hole === hole);
  return holeData || null;
};



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

// Get course data based on round
export const getCourseForRound = (round: number): CourseData => {
  // Round 3 uses Muskoka Bay Club
  if (round === 3) {
    return muskokaBayCourse;
  }
  
  // Rounds 1-2 use Deerhurst Golf Course
  return deerhurstCourse;
};