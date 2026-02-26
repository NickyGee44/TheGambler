// Tournament Configuration - Centralized place for tournament details
// TODO: Move to database for full dynamic configuration

// 2025 completed. Update dates below once 2026 is confirmed.
export const TOURNAMENT_CONFIG = {
  name: "The Gambler Cup 2026",
  year: 2026,
  dates: {
    start: "2026-08-28", // TBD — placeholder, update when confirmed
    end: "2026-08-30",   // TBD — placeholder
    display: "August 2026 — Date TBD"
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
      date: "Friday Aug 28",
      time: "TBD",
      course: "Deerhurst Golf Course",
      startDateTime: "2026-08-28T13:10:00-04:00" // TBD
    },
    round2: {
      date: "Saturday Aug 29",
      time: "TBD",
      course: "Deerhurst Golf Course",
      startDateTime: "2026-08-29T11:20:00-04:00" // TBD
    },
    round3: {
      date: "Sunday Aug 30",
      time: "TBD",
      course: "Muskoka Bay Golf Club",
      startDateTime: "2026-08-30T11:30:00-04:00" // TBD
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