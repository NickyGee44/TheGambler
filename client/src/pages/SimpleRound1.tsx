import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SimpleHoleView } from "@/components/SimpleHoleView";
import { getCourseForRound, type HoleData } from "@shared/courseData";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function SimpleRound1() {
  const round = 1;
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Auto-login mutation for testing
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/login", {
        playerName: "Nick Grossi",
        password: "abc123"
      });
      return response.json();
    },
    onSuccess: () => {
      setIsLoggingIn(false);
      // Refetch user data
      refetchUser();
    },
    onError: (error) => {
      console.error("Auto-login failed:", error);
      setIsLoggingIn(false);
    }
  });
  
  // Get current user
  const { data: user, isError, refetch: refetchUser } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false
  });

  // Auto-login if not authenticated
  useEffect(() => {
    if (isError && !isLoggingIn && !loginMutation.isPending) {
      setIsLoggingIn(true);
      loginMutation.mutate();
    }
  }, [isError, isLoggingIn, loginMutation]);

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
          <h2 className="text-xl font-semibold mb-2">
            {isLoggingIn || loginMutation.isPending ? "Logging in..." : "Loading..."}
          </h2>
          <p className="text-muted-foreground">
            {isLoggingIn || loginMutation.isPending 
              ? "Authenticating with test account..." 
              : "Please wait while we load your information."
            }
          </p>
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