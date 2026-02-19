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
      course: "Deerhurst Golf Course",
      startDateTime: "2025-08-29T13:10:00-04:00" // 1:10 PM EDT
    },
    round2: {
      date: "Saturday Aug 30", 
      time: "11:20 AM first tee",
      course: "Deerhurst Golf Course",
      startDateTime: "2025-08-30T11:20:00-04:00" // 11:20 AM EDT
    },
    round3: {
      date: "Sunday Aug 31",
      time: "11:30 AM first tee", 
      course: "Muskoka Bay Golf Club",
      startDateTime: "2025-08-31T11:30:00-04:00" // 11:30 AM EDT
    }
  },
  teams: {
    count: 7,
    totalPlayers: 15, // 6 two-person teams (12 players) + 1 three-person team (3 players) = 15 players
    threePersonTeam: {
      teamNumber: 7,
      members: ["Nic Huxley", "Sye Ellard", "James Ogilvie"]
    }
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

export const getRoundStartTime = (round: number): Date => {
  switch(round) {
    case 1: return new Date(TOURNAMENT_CONFIG.schedule.round1.startDateTime);
    case 2: return new Date(TOURNAMENT_CONFIG.schedule.round2.startDateTime);
    case 3: return new Date(TOURNAMENT_CONFIG.schedule.round3.startDateTime);
    default: return new Date(TOURNAMENT_CONFIG.schedule.round1.startDateTime);
  }
};

export const getBetDeadline = (round: number): Date => {
  const roundStart = getRoundStartTime(round);
  // Deadline is 1 hour before round start
  return new Date(roundStart.getTime() - (60 * 60 * 1000));
};