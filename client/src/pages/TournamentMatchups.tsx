import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Trophy, Shuffle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: number;
  teamNumber: number;
  player1Name: string;
  player1Handicap: number;
  player2Name: string;
  player2Handicap: number;
  totalHandicap: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  handicap: number;
}

interface Matchup {
  id: number;
  round: number;
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
  groupNumber: number;
}

export default function TournamentMatchups() {
  const { toast } = useToast();
  
  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: persistentMatchups = [], isLoading: matchupsLoading, refetch: refetchMatchups } = useQuery<Matchup[]>({
    queryKey: ['/api/matchups'],
    refetchInterval: 5000,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  // Check if current user is Nick Grossi
  const isNickGrossi = currentUser && 
    currentUser.firstName === 'Nick' && 
    currentUser.lastName === 'Grossi';

  // Create user lookup map
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<number, User>);

  const getPlayerName = (userId: number) => {
    const user = userMap[userId];
    return user ? `${user.firstName} ${user.lastName}` : `Player ${userId}`;
  };

  const getPlayerHandicap = (userId: number) => {
    const user = userMap[userId];
    return user?.handicap || 0;
  };

  // Handle shuffling matchups for different rounds
  const handleShuffleMatchups = async (round: number) => {
    try {
      if (round === 1 || round === 2) {
        await apiRequest('/api/matchups/shuffle', {
          method: 'POST',
          body: JSON.stringify({ round }),
          headers: { 'Content-Type': 'application/json' }
        });
        toast({
          title: `Round ${round} Shuffled`,
          description: round === 1 ? "New random foursomes generated." : "New scramble foursomes generated (teammates paired).",
        });
      } else if (round === 3) {
        await apiRequest('/api/matchups/initialize-round3', {
          method: 'POST'
        });
        toast({
          title: "Round 3 Initialized",
          description: "Fixed match play pairings created.",
        });
      }
      
      refetchMatchups();
    } catch (error) {
      console.error('Shuffle error:', error);
      toast({
        title: "Error",
        description: `Failed to shuffle Round ${round} matchups.`,
        variant: "destructive",
      });
    }
  };

  // Group matchups by round
  const matchupsByRound = persistentMatchups.reduce((acc: any, matchup) => {
    if (!acc[matchup.round]) acc[matchup.round] = [];
    acc[matchup.round].push(matchup);
    return acc;
  }, {});

  // Generate foursomes for display
  const getFoursomesForRound = (round: number) => {
    const roundMatchups = matchupsByRound[round] || [];
    const foursomes: { [key: number]: Set<number> } = {};
    
    // Group players by foursome number
    roundMatchups.forEach((matchup: Matchup) => {
      const groupNum = matchup.groupNumber;
      if (!foursomes[groupNum]) foursomes[groupNum] = new Set();
      foursomes[groupNum].add(matchup.player1Id);
      foursomes[groupNum].add(matchup.player2Id);
    });
    
    return foursomes;
  };

  if (teamsLoading || matchupsLoading || usersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading tournament matchups...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Tournament Matchups</h1>
        <p className="text-muted-foreground">
          View foursomes for each round of The Gambler Cup 2025
        </p>
        {isNickGrossi && (
          <div className="flex justify-center gap-2">
            <Button 
              onClick={() => handleShuffleMatchups(1)}
              variant="outline" 
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle Round 1
            </Button>
            <Button 
              onClick={() => handleShuffleMatchups(2)}
              variant="outline" 
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle Round 2
            </Button>
            <Button 
              onClick={() => handleShuffleMatchups(3)}
              variant="outline" 
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Initialize Round 3
            </Button>
          </div>
        )}
      </div>

      {/* Round 1 - Better Ball */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Round 1 - Better Ball Format
            {isNickGrossi && (
              <Button 
                onClick={() => handleShuffleMatchups(1)}
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 29, 2025 • Deerhurst Highlands Golf Course
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(getFoursomesForRound(1)).length > 0 ? (
            Object.entries(getFoursomesForRound(1)).map(([groupNum, playerIds]) => (
              <div key={`round1-group-${groupNum}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foursome {groupNum}
                </h3>
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(playerIds).map((playerId) => (
                      <div key={playerId} className="bg-white dark:bg-gray-800 rounded-lg p-3 border text-center">
                        <div className="font-medium">{getPlayerName(playerId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getPlayerHandicap(playerId)} hcp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isNickGrossi ? "Click 'Shuffle' to generate Round 1 matchups" : "Round 1 matchups not generated yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round 2 - Scramble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Round 2 - Scramble Format
            {isNickGrossi && (
              <Button 
                onClick={() => handleShuffleMatchups(2)}
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 30, 2025 • Deerhurst Highlands Golf Course
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(getFoursomesForRound(2)).length > 0 ? (
            Object.entries(getFoursomesForRound(2)).map(([groupNum, playerIds]) => (
              <div key={`round2-group-${groupNum}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foursome {groupNum}
                </h3>
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(playerIds).map((playerId) => (
                      <div key={playerId} className="bg-white dark:bg-gray-800 rounded-lg p-3 border text-center">
                        <div className="font-medium">{getPlayerName(playerId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getPlayerHandicap(playerId)} hcp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isNickGrossi ? "Click 'Shuffle' to generate Round 2 matchups" : "Round 2 matchups not generated yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round 3 - Match Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Round 3 - Match Play Format
            {isNickGrossi && Object.entries(getFoursomesForRound(3)).length === 0 && (
              <Button 
                onClick={() => handleShuffleMatchups(3)}
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                Initialize
              </Button>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            August 31, 2025 • Muskoka Bay Golf Club
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(getFoursomesForRound(3)).length > 0 ? (
            Object.entries(getFoursomesForRound(3)).map(([groupNum, playerIds]) => (
              <div key={`round3-group-${groupNum}`}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Foursome {groupNum}
                </h3>
                <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(playerIds).map((playerId) => (
                      <div key={playerId} className="bg-white dark:bg-gray-800 rounded-lg p-3 border text-center">
                        <div className="font-medium">{getPlayerName(playerId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getPlayerHandicap(playerId)} hcp
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isNickGrossi ? "Click 'Initialize' to create Round 3 matchups" : "Round 3 matchups not initialized yet"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}