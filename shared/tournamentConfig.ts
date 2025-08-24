// Tournament Configuration - Centralized place for tournament details
// TODO: Move to database for full dynamic configuration

export const TOURNAMENT_CONFIG = {
  name: "The Gambler Cup 2025",
  year: 2025,
  dates: {
    start: "2025-08-29",
    end: "2025-08-31",
    display: "August 29-31, 2025"
  },
  courses: {
    round1: {
      name: "Deerhurst Golf Course",
      location: "Muskoka",
      displayName: "Deerhurst Golf Course, Muskoka"
    },
    round2: {
      name: "Deerhurst Golf Course", 
      location: "Muskoka",
      displayName: "Deerhurst Golf Course, Muskoka"
    },
    round3: {
      name: "Muskoka Bay Golf Club",
      location: "Gravenhurst",
      displayName: "Muskoka Bay Golf Club"
    }
  },
  schedule: {
    round1: {
      date: "Friday Aug 29",
      time: "1:10 PM first tee",
      course: "Deerhurst Golf Course"
    },
    round2: {
      date: "Saturday Aug 30", 
      time: "11:20 AM first tee",
      course: "Deerhurst Golf Course"
    },
    round3: {
      date: "Sunday Aug 31",
      time: "11:30 AM first tee", 
      course: "Muskoka Bay Golf Club"
    }
  },
  teams: {
    count: 8,
    totalPlayers: 16
  },
  rounds: {
    count: 3,
    types: ["Better Ball", "Scramble", "Match Play"]
  }
} as const;

export const getTournamentStartDate = () => new Date(TOURNAMENT_CONFIG.dates.start + 'T08:00:00');
export const getTournamentDisplayDates = () => TOURNAMENT_CONFIG.dates.display;
export const getCourseForRound = (round: number) => {
  switch(round) {
    case 1: return TOURNAMENT_CONFIG.courses.round1;
    case 2: return TOURNAMENT_CONFIG.courses.round2; 
    case 3: return TOURNAMENT_CONFIG.courses.round3;
    default: return TOURNAMENT_CONFIG.courses.round1;
  }
};