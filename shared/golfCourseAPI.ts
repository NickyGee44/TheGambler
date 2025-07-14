const GOLF_API_KEY = "ERJJTZFDF7ZIKRUE76RRDOKLXQ";

export interface GolfCourseSearchResult {
  id: number;
  club_name: string;
  course_name: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  slope: number;
  par: number;
  yardage: number;
}

export interface GolfCourseDetails extends GolfCourseSearchResult {
  holes: Array<{
    hole: number;
    par: number;
    yardage: number;
    handicap: number;
  }>;
  description?: string;
  website?: string;
  phone?: string;
}

export async function searchCourse(query: string): Promise<GolfCourseSearchResult | null> {
  try {
    const response = await fetch(`/api/golf-course/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error(`Golf API search failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.courses?.[0] || null;
  } catch (error) {
    console.error('Error searching golf course:', error);
    return null;
  }
}

export async function getCourseDetails(courseId: number): Promise<GolfCourseDetails | null> {
  try {
    const response = await fetch(`/api/golf-course/details/${courseId}`);
    
    if (!response.ok) {
      console.error(`Golf API details failed: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching course details:', error);
    return null;
  }
}

// Search for our tournament courses
export async function getTournamentCourses(): Promise<{
  deerhurst: GolfCourseDetails | null;
  muskokaBay: GolfCourseDetails | null;
}> {
  try {
    const response = await fetch('/api/golf-course/tournament-courses');
    
    if (!response.ok) {
      console.error(`Tournament courses API failed: ${response.status}`);
      return { deerhurst: null, muskokaBay: null };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tournament courses:', error);
    return { deerhurst: null, muskokaBay: null };
  }
}