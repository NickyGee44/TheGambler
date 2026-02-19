import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, MapPin, Calendar, Users } from "lucide-react";
import { TOURNAMENT_CONFIG } from "@shared/tournamentConfig";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 dark:from-green-950 dark:via-green-900 dark:to-green-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/gambler-logo.png" 
              alt="The Gambler Cup Logo" 
              className="w-32 h-32 rounded-full shadow-2xl"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {TOURNAMENT_CONFIG.name}
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Join the ultimate golf tournament experience
          </p>
          
          <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-6 w-6" />
                Tournament Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-300" />
                <span>{TOURNAMENT_CONFIG.dates.display}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-300" />
                <div>
                  <p>Days 1-2: {TOURNAMENT_CONFIG.courses.round1.displayName}</p>
                  <p>Final Day: {TOURNAMENT_CONFIG.courses.round3.displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-300" />
                <span>{TOURNAMENT_CONFIG.teams.count} Teams • {TOURNAMENT_CONFIG.teams.totalPlayers} Players</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-green-100 mb-6 text-lg">
            Players: Log in to track your scores and manage your team!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-green-800 hover:bg-green-50 font-semibold px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Log In to Join Tournament
          </Button>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white">Live Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">
                Track your scores in real-time throughout the tournament
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white">Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">
                View team standings and player statistics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white">Side Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100">
                Manage your friendly wagers and track winnings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}