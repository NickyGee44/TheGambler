import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Users, Award, Star } from "lucide-react";

export default function TournamentRules() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 The Gambler Cup 2025
          </h1>
          <p className="text-xl text-muted-foreground">
            Tournament Rules & Scoring System
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Round 1 */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Round 1 - Best Ball (Net)
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                Maximum 10 Points
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Format:</h3>
                <p className="text-sm text-muted-foreground">
                  Each team records the best net score per hole between the 2 players.
                  Compare total team net scores for final ranking.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Point Structure:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>1st Place:</span>
                    <Badge variant="default">10 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>2nd Place:</span>
                    <Badge variant="secondary">8 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>3rd Place:</span>
                    <Badge variant="secondary">6 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>4th Place:</span>
                    <Badge variant="secondary">5 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>5th Place:</span>
                    <Badge variant="outline">4 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>6th Place:</span>
                    <Badge variant="outline">3 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>7th Place:</span>
                    <Badge variant="outline">2 pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>8th Place:</span>
                    <Badge variant="outline">1 pt</Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  🍺 Drinking Rule:
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Any birdie or better: opposing team must finish their drink.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Round 2 */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Round 2 - Scramble (Net)
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                Maximum 10 Points
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Format:</h3>
                <p className="text-sm text-muted-foreground">
                  Teams choose best shot each time; both hit from that spot.
                  Net team score ranked vs all others.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Team Handicap:</h3>
                <p className="text-sm text-muted-foreground">
                  35% of lower HCP + 15% of higher HCP
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Point Structure:</h3>
                <p className="text-sm text-muted-foreground">
                  Same as Round 1 (1st = 10pts, 2nd = 8pts, etc.)
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  🍺 Drinking Rule:
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Each time your shot isn't chosen, take a sip.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Round 3 */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Round 3 - 6-Hole Match Play (Net)
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="w-fit">
                  Maximum 24 Points
                </Badge>
                <Badge variant="destructive" className="w-fit">
                  DOUBLE POINTS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Format:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Individual-based but adds to team total. Each player plays 3× six-hole net matches vs everyone in their foursome (1v1).
                  </p>
                  
                  <h3 className="font-semibold text-foreground mb-2">Scoring per Player:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Win:</span>
                      <Badge variant="default">2 points</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tie:</span>
                      <Badge variant="secondary">1 point</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Loss:</span>
                      <Badge variant="outline">0 points</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Max 6 points per player</strong><br />
                    <strong>Max 12 per team</strong>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Stroke Assignment:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on handicap difference between players.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      Example:
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Player A (6 HCP) vs Player B (12 HCP)<br />
                      → Player B gets 2 strokes across 6 holes
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                  🍺 Drink Handicap Modifier:
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  All players begin with a net +18. For each drink consumed, subtract 1 stroke from net (max -6).
                  Drinks consumed lower your starting net score - strategic choice!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Leaderboard */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              Final Leaderboard Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="inline-block bg-primary/10 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-foreground mb-2">Team Total Formula:</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Round 1 Points + Round 2 Points + Round 3 Player 1 + Round 3 Player 2</strong>
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Maximum Points
                </h4>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  44
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  10 + 10 + 12 + 12
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  Winning Team
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Highlighted in Gold
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Team Display
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Rank, Members, Total Points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}