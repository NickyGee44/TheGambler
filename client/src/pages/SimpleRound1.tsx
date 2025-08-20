import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleHoleView } from "@/components/SimpleHoleView";
import { getCourseForRound, type HoleData } from "@shared/courseData";
import type { User } from "@shared/schema";

export function SimpleRound1() {
  const round = 1;
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  
  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  const course = getCourseForRound(round);
  const currentHole: HoleData = course.holes[currentHoleIndex];

  const handlePreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHoleIndex < course.holes.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    }
  };

  const handleShowLeaderboard = () => {
    // Navigate to leaderboard - for now just log
    console.log("Show leaderboard");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleHoleView
      hole={currentHole}
      round={round}
      onPreviousHole={handlePreviousHole}
      onNextHole={handleNextHole}
      isFirstHole={currentHoleIndex === 0}
      isLastHole={currentHoleIndex === course.holes.length - 1}
      onShowLeaderboard={handleShowLeaderboard}
      userId={user.id}
    />
  );
}