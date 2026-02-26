import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Beer, Target, Users, User, Award, Star, Crown } from "lucide-react";

export default function Rules() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🏆 The Gambler Cup 2026
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Tournament Rules & Scoring System
          </p>
          <div className="bg-golf-green-50 dark:bg-slate-700 p-4 rounded-lg">
            <h3 className="font-semibold text-golf-green-600 mb-2">Tournament Schedule</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Friday Aug 29:</strong> 1:10 PM first tee - Deerhurst Golf Course, Muskoka</p>
              <p><strong>Saturday Aug 30:</strong> 11:20 AM first tee - Deerhurst Golf Course, Muskoka</p>
              <p><strong>Sunday Aug 31:</strong> 11:40 AM first tee - Muskoka Bay Golf Club</p>
              <p><strong>Awards Dinner:</strong> 4:00 PM Sunday - A la carte dinner/late lunch ($235 per person plus tax, pay for your own food)</p>
            </div>
          </div>
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
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1 flex items-center gap-2">
                  <Beer className="h-4 w-4" />
                  Drinking Rule: 3-6-9 System
                </h4>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <div><strong>3 drinks:</strong> Putter length gimme</div>
                  <div><strong>6 drinks:</strong> Flagstick length gimme</div>
                  <div><strong>9 drinks:</strong> Both putter + flagstick length gimmes</div>
                </div>
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
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1 flex items-center gap-2">
                  <Beer className="h-4 w-4" />
                  Drinking Rule: 3-6-9 System
                </h4>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <div><strong>3 drinks:</strong> Putter length gimme</div>
                  <div><strong>6 drinks:</strong> Flagstick length gimme</div>
                  <div><strong>9 drinks:</strong> Both putter + flagstick length gimmes</div>
                  <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-800/30 rounded text-xs">
                    <strong>SCRAMBLE SPECIAL:</strong> Both players must drink the amount to get the bonus
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Match Structure:</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Holes 1-6: First match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Holes 7-12: Second match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Holes 13-18: Third match</span>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Each player can earn 0-6 points total (3 matches × 2 points max)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Stroke Play Rules
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Strokes given/received based on handicap differences. Higher handicap players receive strokes on hardest holes within each 6-hole segment.
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1 flex items-center gap-2">
                <Beer className="h-4 w-4" />
                Drinking Rule: 3-6-9 System
              </h4>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <div><strong>3 drinks:</strong> Putter length gimme</div>
                <div><strong>6 drinks:</strong> Flagstick length gimme</div>
                <div><strong>9 drinks:</strong> Both putter + flagstick length gimmes</div>
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-800/30 rounded text-xs">
                  <strong>SCRAMBLE RULE:</strong> Both players must drink the amount to get the bonus
                </div>
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-800/30 rounded text-xs">
                  <strong>MATCH PLAY SPECIAL:</strong> No gimmes - all putts must be holed out
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Championship Summary */}
        <Card className="border-border bg-card lg:col-span-2 mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Championship Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">44</div>
                <p className="text-sm text-muted-foreground">Maximum Total Points</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                <p className="text-sm text-muted-foreground">Tournament Rounds</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                <p className="text-sm text-muted-foreground">Competing Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
