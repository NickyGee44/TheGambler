import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePicture from "@/components/ProfilePicture";
import { Trophy, Users, Target, Crown, Flag, Zap } from "lucide-react";

interface MatchPlayViewProps {
  currentHole: number;
  userId: number;
  currentMatch: any;
  onHoleComplete: (hole: number) => void;
}

export default function MatchPlayView({ 
  currentHole, 
  userId, 
  currentMatch, 
  onHoleComplete 
}: MatchPlayViewProps) {
  const [matchStatus, setMatchStatus] = useState<string>("All Square");
  const [strokesRemaining, setStrokesRemaining] = useState(0);
  
  // Determine which 6-hole segment we're in
  const getHoleSegment = (hole: number) => {
    if (hole >= 1 && hole <= 6) return "1-6";
    if (hole >= 7 && hole <= 12) return "7-12";
    if (hole >= 13 && hole <= 18) return "13-18";
    return "1-6";
  };

  // Determine current opponent based on hole
  const getCurrentOpponent = (hole: number) => {
    if (!currentMatch) return null;
    
    const segment = getHoleSegment(hole);
    const isPlayer1 = currentMatch.player1Id === userId;
    
    return {
      id: isPlayer1 ? currentMatch.player2Id : currentMatch.player1Id,
      name: isPlayer1 ? currentMatch.player2Name : currentMatch.player1Name,
      handicap: isPlayer1 ? currentMatch.player2Handicap : currentMatch.player1Handicap,
    };
  };

  // Calculate stroke holes for current match
  const getStrokeHoles = () => {
    if (!currentMatch) return [];
    
    const segment = getHoleSegment(currentHole);
    const strokeHoles = currentMatch.strokeHoles || [];
    
    return strokeHoles.filter((hole: number) => {
      if (segment === "1-6") return hole >= 1 && hole <= 6;
      if (segment === "7-12") return hole >= 7 && hole <= 12;
      if (segment === "13-18") return hole >= 13 && hole <= 18;
      return false;
    });
  };

  // Check if current hole is a stroke hole
  const isStrokeHole = (hole: number) => {
    const strokeHoles = getStrokeHoles();
    return strokeHoles.includes(hole);
  };

  // Get stroke recipient for current match
  const getStrokeRecipient = () => {
    if (!currentMatch) return null;
    
    const isPlayer1 = currentMatch.player1Id === userId;
    const recipientId = currentMatch.strokeRecipientId;
    
    if (recipientId === userId) {
      return "You";
    } else if (recipientId === (isPlayer1 ? currentMatch.player2Id : currentMatch.player1Id)) {
      return getCurrentOpponent(currentHole)?.name || "Opponent";
    }
    
    return null;
  };

  const currentOpponent = getCurrentOpponent(currentHole);
  const strokeRecipient = getStrokeRecipient();
  const segment = getHoleSegment(currentHole);
  const segmentProgress = ((currentHole - (segment === "1-6" ? 1 : segment === "7-12" ? 7 : 13)) / 6) * 100;

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="border-golf-green-200 bg-gradient-to-br from-golf-green-50 to-golf-sand-50 dark:from-golf-green-900/20 dark:to-golf-sand-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <CardTitle className="text-golf-green-700 dark:text-golf-green-300">
                  Round 3 - Match Play
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Holes {segment} • Muskoka Bay Golf Club
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
              {matchStatus}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Current Match Info */}
      {currentMatch && currentOpponent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-golf-green-600" />
              Current Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Players */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProfilePicture firstName="Your" lastName="Name" size="md" />
                  <div>
                    <div className="font-semibold">You</div>
                    <div className="text-sm text-muted-foreground">
                      Playing from {currentMatch.player1Id === userId ? "Player 1" : "Player 2"}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
                <div className="flex items-center gap-3">
                  <ProfilePicture firstName={currentOpponent.name.split(' ')[0]} lastName={currentOpponent.name.split(' ')[1]} size="md" />
                  <div>
                    <div className="font-semibold">{currentOpponent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      HCP {currentOpponent.handicap}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stroke Information */}
              {currentMatch.strokesGiven > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">
                      Stroke Information
                    </span>
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    {strokeRecipient} receives {currentMatch.strokesGiven} stroke{currentMatch.strokesGiven > 1 ? 's' : ''} in this match
                  </div>
                  {isStrokeHole(currentHole) && (
                    <div className="mt-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                        Hole {currentHole} - Stroke hole for {strokeRecipient}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Match Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Match Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Hole {currentHole} of {segment === "1-6" ? "6" : segment === "7-12" ? "12" : "18"}
                  </span>
                </div>
                <Progress value={segmentProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-golf-green-600" />
            Match Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-golf-green-600">
              {matchStatus}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentMatch ? `${6 - ((currentHole - (segment === "1-6" ? 1 : segment === "7-12" ? 7 : 13)))} holes remaining` : "Match not started"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Instructions */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">Match Play Scoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Win the hole: +1 hole up</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Tie the hole: Match remains the same</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Lose the hole: -1 hole down</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
            <div className="text-xs text-muted-foreground">
              <strong>Remember:</strong> After 6 holes, the match winner gets 2 points, tie gives 1 point each, loser gets 0 points.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}