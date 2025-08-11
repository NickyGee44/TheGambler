import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";
import { ROUND3_MATCHUPS } from "@/pages/Round3Matchups";

interface MatchResult {
  id: number;
  groupId: number;
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
  player1Handicap: number;
  player2Handicap: number;
  holes: string;
  strokesGiven: number;
  strokeRecipientId: number;
  strokeHoles: number[];
  winnerId?: number;
  result?: string;
  pointsAwarded?: any;
  createdAt: string;
}

interface Round3MatchLeaderboardProps {
  matchResults: MatchResult[];
  allPlayers: any[];
  currentUser: any;
}

export default function Round3MatchLeaderboard({ 
  matchResults = [], 
  allPlayers = [], 
  currentUser 
}: Round3MatchLeaderboardProps) {
  
  // Get all unique players from matchups
  const getAllPlayersFromMatchups = () => {
    const playerSet = new Set<string>();
    ROUND3_MATCHUPS.forEach(matchup => {
      playerSet.add(matchup.player1);
      playerSet.add(matchup.player2);
    });
    return Array.from(playerSet);
  };

  // Get matches for each player organized by hole ranges
  const getPlayerMatches = (playerName: string) => {
    const playerMatchups = ROUND3_MATCHUPS.filter(matchup => 
      matchup.player1 === playerName || matchup.player2 === playerName
    );
    
    // Organize by hole range
    const matches = {
      "1–6": null as MatchResult | null,
      "7–12": null as MatchResult | null,
      "13–18": null as MatchResult | null
    };

    playerMatchups.forEach(matchup => {
      const opponent = matchup.player1 === playerName ? matchup.player2 : matchup.player1;
      
      // Find corresponding match result
      const matchResult = matchResults.find(result => 
        (result.player1Name === playerName || result.player2Name === playerName) &&
        (result.player1Name === opponent || result.player2Name === opponent) &&
        result.holes === matchup.holes
      );

      if (matchResult) {
        matches[matchup.holes as keyof typeof matches] = matchResult;
      } else {
        // Create a placeholder for unplayed match
        matches[matchup.holes as keyof typeof matches] = {
          id: 0,
          groupId: 0,
          player1Id: 0,
          player2Id: 0,
          player1Name: playerName,
          player2Name: opponent,
          player1Handicap: 0,
          player2Handicap: 0,
          holes: matchup.holes,
          strokesGiven: 0,
          strokeRecipientId: 0,
          strokeHoles: [],
          createdAt: new Date().toISOString()
        };
      }
    });

    return matches;
  };

  // Calculate total points for a player (6 points for win, 0 for loss, 3 for tie)
  const getPlayerTotalPoints = (playerName: string) => {
    const matches = getPlayerMatches(playerName);
    let total = 0;
    
    Object.values(matches).forEach(match => {
      if (match && match.winnerId !== undefined) {
        const isPlayer1 = match.player1Name === playerName;
        const playerId = isPlayer1 ? match.player1Id : match.player2Id;
        
        if (match.winnerId === playerId) {
          total += 6; // Win = 6 points
        } else if (match.winnerId === null) {
          total += 3; // Tie = 3 points
        }
        // Loss = 0 points (no addition needed)
      }
    });
    
    return total;
  };

  const allPlayerNames = getAllPlayersFromMatchups();
  
  // Sort players by total points
  const sortedPlayers = allPlayerNames.sort((a, b) => {
    const pointsA = getPlayerTotalPoints(a);
    const pointsB = getPlayerTotalPoints(b);
    return pointsB - pointsA; // Descending order
  });

  const getMatchResultDisplay = (match: MatchResult | null, playerName: string) => {
    if (!match || match.winnerId === undefined) {
      return { points: "-", status: "pending" };
    }

    const isPlayer1 = match.player1Name === playerName;
    const playerId = isPlayer1 ? match.player1Id : match.player2Id;
    
    let points = 0;
    let status = "completed";
    
    if (match.winnerId === playerId) {
      points = 6; // Win = 6 points
      status = "won";
    } else if (match.winnerId === null) {
      points = 3; // Tie = 3 points  
      status = "tied";
    } else {
      points = 0; // Loss = 0 points
      status = "lost";
    }

    return { points: `${points}pts`, status };
  };

  if (sortedPlayers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-golf-green-600" />
            Round 3 Match Play Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Match play leaderboard will appear here once players are set up.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-golf-green-600" />
          Round 3 Match Play Leaderboard
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Individual match results • 6 points per match win
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-muted rounded-lg text-sm font-medium">
            <div className="text-left">Player</div>
            <div className="text-center">Holes 1-6</div>
            <div className="text-center">Holes 7-12</div>
            <div className="text-center">Holes 13-18</div>
            <div className="text-center font-bold">Total</div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            {sortedPlayers.map((playerName, index) => {
              const matches = getPlayerMatches(playerName);
              const totalPoints = getPlayerTotalPoints(playerName);
              const isCurrentUser = currentUser && `${currentUser.firstName} ${currentUser.lastName}` === playerName;

              return (
                <div
                  key={playerName}
                  className={`grid grid-cols-5 gap-2 p-3 rounded-lg border-2 ${
                    isCurrentUser 
                      ? 'bg-golf-green-50 border-golf-green-200 dark:bg-golf-green-900/20 dark:border-golf-green-700' 
                      : 'bg-background border-border'
                  }`}
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' : 
                      'bg-golf-green-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <ProfilePicture 
                        firstName={playerName.split(' ')[0]} 
                        lastName={playerName.split(' ')[1] || ''} 
                        size="sm"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{playerName}</div>
                        {isCurrentUser && (
                          <div className="text-xs text-golf-green-600">(You)</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Results */}
                  {(["1–6", "7–12", "13–18"] as const).map((holeRange) => {
                    const match = matches[holeRange];
                    const result = getMatchResultDisplay(match, playerName);
                    
                    return (
                      <div key={holeRange} className="text-center">
                        <div className={`text-sm font-medium ${
                          result.status === "won" ? "text-green-600" :
                          result.status === "lost" ? "text-red-600" :
                          result.status === "tied" ? "text-blue-600" :
                          "text-gray-400"
                        }`}>
                          {result.points}
                        </div>
                        {match && match.winnerId !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            vs {match.player1Name === playerName ? match.player2Name.split(' ')[0] : match.player1Name.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Total Points */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-golf-green-600">
                      {totalPoints}pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
          <div>Each match is played over 6 holes using net stroke play</div>
          <div className="flex justify-center gap-4">
            <span className="text-green-600">● 6pts</span> Won
            <span className="text-blue-600">● 3pts</span> Tied  
            <span className="text-red-600">● 0pts</span> Lost
            <span className="text-gray-400">● -</span> Pending
          </div>
        </div>
      </CardContent>
    </Card>
  );
}