// Deerhurst Golf Course GPS Coordinates
export interface CourseCoordinate {
  hole: number;
  position: 'Tee Block' | 'Green Center';
  latitude: number;
  longitude: number;
}

export const DEERHURST_COORDINATES: CourseCoordinate[] = [
  { hole: 1, position: 'Tee Block', latitude: 45.34616103620428, longitude: -79.14535801798596 },
  { hole: 1, position: 'Green Center', latitude: 45.3443222916284, longitude: -79.14852083567796 },
  { hole: 2, position: 'Tee Block', latitude: 45.34398102863268, longitude: -79.14943993587053 },
  { hole: 2, position: 'Green Center', latitude: 45.34311671149175, longitude: -79.14464895988188 },
  { hole: 3, position: 'Tee Block', latitude: 45.342559040427574, longitude: -79.14457368654315 },
  { hole: 3, position: 'Green Center', latitude: 45.34306720909093, longitude: -79.14238132649747 },
  { hole: 4, position: 'Tee Block', latitude: 45.342153238850436, longitude: -79.14239465378142 },
  { hole: 4, position: 'Green Center', latitude: 45.341312234785775, longitude: -79.1389537176389 },
  { hole: 5, position: 'Tee Block', latitude: 45.34094504833668, longitude: -79.13863108701688 },
  { hole: 5, position: 'Green Center', latitude: 45.33897677364309, longitude: -79.14450043083217 },
  { hole: 6, position: 'Tee Block', latitude: 45.33907426559279, longitude: -79.14531823871374 },
  { hole: 6, position: 'Green Center', latitude: 45.34191249016493, longitude: -79.1428569497976 },
  { hole: 7, position: 'Tee Block', latitude: 45.34239991398666, longitude: -79.1447426024231 },
  { hole: 7, position: 'Green Center', latitude: 45.34324969895713, longitude: -79.15030512509948 },
  { hole: 8, position: 'Tee Block', latitude: 45.343859241949744, longitude: -79.15093831389868 },
  { hole: 8, position: 'Green Center', latitude: 45.34518335653074, longitude: -79.15280679202314 },
  { hole: 9, position: 'Tee Block', latitude: 45.345497803328975, longitude: -79.15132153707968 },
  { hole: 9, position: 'Green Center', latitude: 45.34655086516202, longitude: -79.14703617024507 },
  { hole: 10, position: 'Tee Block', latitude: 45.347316997409024, longitude: -79.14429922284117 },
  { hole: 10, position: 'Green Center', latitude: 45.34961056181364, longitude: -79.14032469771445 },
  { hole: 11, position: 'Tee Block', latitude: 45.3498078597367, longitude: -79.13939286277414 },
  { hole: 11, position: 'Green Center', latitude: 45.353034175006364, longitude: -79.1382612876836 },
  { hole: 12, position: 'Tee Block', latitude: 45.353614889473675, longitude: -79.13856608379822 },
  { hole: 12, position: 'Green Center', latitude: 45.353105669806425, longitude: -79.1407678630912 },
  { hole: 13, position: 'Tee Block', latitude: 45.35269133539527, longitude: -79.1418913065636 },
  { hole: 13, position: 'Green Center', latitude: 45.35539559784702, longitude: -79.14144423280938 },
  { hole: 14, position: 'Tee Block', latitude: 45.355011913301205, longitude: -79.14257118051609 },
  { hole: 14, position: 'Green Center', latitude: 45.35190927644294, longitude: -79.1455617675153 },
  { hole: 15, position: 'Tee Block', latitude: 45.35145249385614, longitude: -79.14526171854538 },
  { hole: 15, position: 'Green Center', latitude: 45.349451100924675, longitude: -79.14778290586527 },
  { hole: 16, position: 'Tee Block', latitude: 45.349810757624006, longitude: -79.14829734208942 },
  { hole: 16, position: 'Green Center', latitude: 45.34757966849906, longitude: -79.15089998378599 },
  { hole: 17, position: 'Tee Block', latitude: 45.34656124625057, longitude: -79.1510667030502 },
  { hole: 17, position: 'Green Center', latitude: 45.34531092168978, longitude: -79.1527587352176 },
  { hole: 18, position: 'Tee Block', latitude: 45.34588458183412, longitude: -79.15103725364635 },
  { hole: 18, position: 'Green Center', latitude: 45.347380532587316, longitude: -79.14575116111246 }
];

// Calculate distance between two GPS coordinates in yards
export function calculateDistanceInYards(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const meters = R * c;
  return Math.round(meters * 1.09361); // Convert to yards
}

// Get hole coordinates
export function getHoleCoordinates(hole: number) {
  const tee = DEERHURST_COORDINATES.find(c => c.hole === hole && c.position === 'Tee Block');
  const green = DEERHURST_COORDINATES.find(c => c.hole === hole && c.position === 'Green Center');
  return { tee, green };
}

// Golf course data structure
export interface HoleData {
  hole: number;
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

// Get course for round (placeholder for compatibility)
export function getCourseForRound(round: number) {
  return {
    name: round <= 2 ? "Deerhurst Golf Course" : "Muskoka Bay Golf Club",
    clubhouse: { latitude: 45.34616, longitude: -79.14536 }
  };
}