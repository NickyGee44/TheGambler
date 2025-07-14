import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Crown } from "lucide-react";
import { Team } from "@shared/schema";

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
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-golf-green-600 mb-2">Tournament Teams</h2>
          <p className="text-gray-600 dark:text-gray-400">8 teams competing for the championship</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => setSortBy('handicap')}
            variant={sortBy === 'handicap' ? 'default' : 'outline'}
            className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort by Handicap
          </Button>
          <Button
            onClick={() => setSortBy('power')}
            variant={sortBy === 'power' ? 'default' : 'outline'}
            className="bg-golf-gold-500 hover:bg-golf-gold-600 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Power Rankings
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedTeams.map((team: Team, index: number) => (
          <Card key={team.id} className="golf-card shadow-lg border border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-golf-green-600 flex items-center">
                  Team {team.teamNumber}
                  {sortBy === 'power' && (
                    <Badge variant="outline" className="ml-2 text-golf-gold-500">
                      #{index + 1}
                    </Badge>
                  )}
                </CardTitle>
                <Badge className="bg-golf-green-100 dark:bg-golf-green-900 text-golf-green-600 px-2 py-1 text-sm font-medium">
                  HCP: {team.totalHandicap}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{team.player1Name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{team.player1Handicap} HCP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{team.player2Name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{team.player2Handicap} HCP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
