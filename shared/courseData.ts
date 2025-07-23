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
}

// Deerhurst Golf Course data (Rounds 1-3)
export const deerhurstCourse: CourseData = {
  name: "Deerhurst Highlands Golf Course",
  location: "Huntsville, Ontario",
  holes: [
    { number: 1, par: 4, yardage: 365, handicap: 11 },
    { number: 2, par: 4, yardage: 310, handicap: 17 },
    { number: 3, par: 3, yardage: 135, handicap: 15 },
    { number: 4, par: 4, yardage: 370, handicap: 5 },
    { number: 5, par: 5, yardage: 510, handicap: 3 },
    { number: 6, par: 4, yardage: 340, handicap: 13 },
    { number: 7, par: 3, yardage: 165, handicap: 9 },
    { number: 8, par: 4, yardage: 395, handicap: 1 },
    { number: 9, par: 5, yardage: 485, handicap: 7 },
    { number: 10, par: 4, yardage: 335, handicap: 12 },
    { number: 11, par: 4, yardage: 380, handicap: 4 },
    { number: 12, par: 3, yardage: 155, handicap: 18 },
    { number: 13, par: 5, yardage: 500, handicap: 2 },
    { number: 14, par: 4, yardage: 320, handicap: 16 },
    { number: 15, par: 4, yardage: 390, handicap: 6 },
    { number: 16, par: 3, yardage: 140, handicap: 14 },
    { number: 17, par: 4, yardage: 360, handicap: 10 },
    { number: 18, par: 5, yardage: 520, handicap: 8 }
  ]
};

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

// Lionhead Golf Course GPS coordinates - Legends course from Gold tees (6934 yards)
export const lionheadGPSCoordinates: HoleCoordinates[] = [
  { hole: 1, tee: { latitude: 43.643807263240554, longitude: -79.78812587798268 }, green: { latitude: 43.64752711855521, longitude: -79.78763207431722 } },
  { hole: 2, tee: { latitude: 43.648137604816874, longitude: -79.78612021851671 }, green: { latitude: 43.64877617278399, longitude: -79.7906737899568 } },
  { hole: 3, tee: { latitude: 43.647936038281586, longitude: -79.79144132051347 }, green: { latitude: 43.649315148094814, longitude: -79.79241387534158 } },
  { hole: 4, tee: { latitude: 43.64939402793037, longitude: -79.79370184145456 }, green: { latitude: 43.653545239464144, longitude: -79.79233181971891 } },
  { hole: 5, tee: { latitude: 43.65348292385546, longitude: -79.7917699096181 }, green: { latitude: 43.65101365945271, longitude: -79.7894603397729 } },
  { hole: 6, tee: { latitude: 43.65066346667803, longitude: -79.78953613571406 }, green: { latitude: 43.64941456406052, longitude: -79.79318784745074 } },
  { hole: 7, tee: { latitude: 43.64931658304827, longitude: -79.79189634267264 }, green: { latitude: 43.64971123779534, longitude: -79.78561269998629 } },
  { hole: 8, tee: { latitude: 43.6495061105831, longitude: -79.78510498205104 }, green: { latitude: 43.64855391514416, longitude: -79.78639040285583 } },
  { hole: 9, tee: { latitude: 43.64815896327963, longitude: -79.786150872062 }, green: { latitude: 43.64480740282229, longitude: -79.78659679137404 } },
  { hole: 10, tee: { latitude: 43.64469731535939, longitude: -79.78916468078182 }, green: { latitude: 43.647791157394614, longitude: -79.78907183813686 } },
  { hole: 11, tee: { latitude: 43.64804642948019, longitude: -79.79046060583978 }, green: { latitude: 43.64514515363708, longitude: -79.79215810037931 } },
  { hole: 12, tee: { latitude: 43.646266853972136, longitude: -79.79257904591302 }, green: { latitude: 43.64198567753386, longitude: -79.79397068136728 } },
  { hole: 13, tee: { latitude: 43.64236353713944, longitude: -79.79466849219357 }, green: { latitude: 43.64328823139354, longitude: -79.79561251596557 } },
  { hole: 14, tee: { latitude: 43.64357537081953, longitude: -79.7959016008091 }, green: { latitude: 43.64645321856575, longitude: -79.79328053884043 } },
  { hole: 15, tee: { latitude: 43.64613978576738, longitude: -79.79401996158462 }, green: { latitude: 43.645441536490566, longitude: -79.79875854982124 } },
  { hole: 16, tee: { latitude: 43.645414443510866, longitude: -79.79798160138806 }, green: { latitude: 43.64696104243232, longitude: -79.793365401257 } },
  { hole: 17, tee: { latitude: 43.6466127083869, longitude: -79.79278434771403 }, green: { latitude: 43.64776302093006, longitude: -79.79186187988213 } },
  { hole: 18, tee: { latitude: 43.64831101033453, longitude: -79.78997141156306 }, green: { latitude: 43.644622384197014, longitude: -79.7897668288719 } }
];

// Get GPS coordinates based on round and hole
export const getHoleCoordinates = (hole: number, round?: number): HoleCoordinates | null => {
  // For test round (round 999), use Lionhead coordinates
  if (round === 999) {
    const holeData = lionheadGPSCoordinates.find(h => h.hole === hole);
    return holeData || null;
  }
  
  // For rounds 1-3, use Deerhurst coordinates
  const holeData = deerhurstGPSCoordinates.find(h => h.hole === hole);
  return holeData || null;
};

// Get GPS coordinates for test round hole specifically
export const getTestRoundHoleCoordinates = (hole: number): HoleCoordinates | null => {
  const holeData = lionheadGPSCoordinates.find(h => h.hole === hole);
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
  // Test Round uses Lionhead Golf Course
  if (round === 999) {
    return lionheadCourse;
  }
  
  // Rounds 1-3 use Deerhurst Golf Course
  return deerhurstCourse;
};