import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Crown, Trophy, Users } from "lucide-react";
import { Team } from "@shared/schema";
import ProfilePicture from "@/components/ProfilePicture";
import LoadingPage from "@/components/LoadingPage";

export default function Teams() {
  const [sortBy, setSortBy] = useState<'team' | 'handicap' | 'power'>('team');
  
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['/api/teams'],
  });

  const sortedTeams = [...teams].sort((a: Team, b: Team) => {
    switch (sortBy) {
      case 'handicap':
        return a.totalHandicap - b.totalHandicap;
      case 'power':
        return a.totalHandicap - b.totalHandicap; // Lower handicap = better ranking
      default:
        return a.teamNumber - b.teamNumber;
    }
  });

  if (isLoading) {
    return <LoadingPage message="Loading team information..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-sand-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-golf-gold-500" />
            <h2 className="text-4xl font-bold text-golf-green-600">Tournament Teams</h2>
            <Users className="w-10 h-10 text-golf-green-600" />
          </div>
          <p className="text-lg text-golf-green-700 dark:text-golf-green-400 mb-6">
            8 Teams • 16 Players • Championship Glory
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              onClick={() => setSortBy('team')}
              variant={sortBy === 'team' ? 'default' : 'outline'}
              className={`${sortBy === 'team' ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white' : 'border-golf-green-300 text-golf-green-600 hover:bg-golf-green-50'}`}
            >
              Team Order
            </Button>
            <Button
              onClick={() => setSortBy('handicap')}
              variant={sortBy === 'handicap' ? 'default' : 'outline'}
              className={`${sortBy === 'handicap' ? 'bg-golf-green-600 hover:bg-golf-green-700 text-white' : 'border-golf-green-300 text-golf-green-600 hover:bg-golf-green-50'}`}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort by Handicap
            </Button>
            <Button
              onClick={() => setSortBy('power')}
              variant={sortBy === 'power' ? 'default' : 'outline'}
              className={`${sortBy === 'power' ? 'bg-golf-gold-500 hover:bg-golf-gold-600 text-white' : 'border-golf-gold-300 text-golf-gold-600 hover:bg-golf-gold-50'}`}
            >
              <Crown className="w-4 h-4 mr-2" />
              Power Rankings
            </Button>
          </div>
        </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {sortedTeams.map((team: Team, index: number) => (
          <Card key={team.id} className="golf-card shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-golf-green-50 to-golf-gold-50 dark:from-golf-green-900/20 dark:to-golf-gold-900/20 rounded-t-lg">
              <div className="flex justify-between items-center mb-3">
                <CardTitle className="text-xl text-golf-green-600 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Team {team.teamNumber}
                  {sortBy === 'power' && (
                    <Badge variant="outline" className="ml-3 text-golf-gold-500 border-golf-gold-500">
                      #{index + 1}
                    </Badge>
                  )}
                </CardTitle>
                <Badge className="bg-golf-green-100 dark:bg-golf-green-900 text-golf-green-600 px-3 py-1 text-sm font-bold">
                  {team.totalHandicap} HCP
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 mr-1" />
                Combined Team Handicap
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="flex justify-center items-start space-x-8">
                {/* Player 1 */}
                <div className="flex flex-col items-center text-center">
                  <ProfilePicture 
                    firstName={team.player1Name.split(' ')[0]} 
                    lastName={team.player1Name.split(' ').slice(1).join(' ')} 
                    size="2xl"
                    className="border-2 border-golf-green-200 dark:border-golf-green-600 mb-3"
                  />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {team.player1Name}
                  </h3>
                  <Badge variant="secondary" className="bg-golf-green-100 dark:bg-golf-green-900 text-golf-green-700 dark:text-golf-green-300">
                    {team.player1Handicap} Handicap
                  </Badge>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center text-center">
                  <ProfilePicture 
                    firstName={team.player2Name.split(' ')[0]} 
                    lastName={team.player2Name.split(' ').slice(1).join(' ')} 
                    size="2xl"
                    className="border-2 border-golf-green-200 dark:border-golf-green-600 mb-3"
                  />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {team.player2Name}
                  </h3>
                  <Badge variant="secondary" className="bg-golf-green-100 dark:bg-golf-green-900 text-golf-green-700 dark:text-golf-green-300">
                    {team.player2Handicap} Handicap
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
}
