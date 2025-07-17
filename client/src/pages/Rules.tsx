import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Beer, Target, Users, User } from "lucide-react";

export default function Rules() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-golf-green-600 mb-2">Tournament Rules</h2>
        <p className="text-gray-600 dark:text-gray-400">Official format and scoring guidelines</p>
        <div className="mt-4 bg-golf-green-50 dark:bg-slate-700 p-4 rounded-lg">
          <h3 className="font-semibold text-golf-green-600 mb-2">Tournament Schedule</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Friday Aug 29:</strong> 1:10 PM first tee - Deerhurst Golf Course, Muskoka</p>
            <p><strong>Saturday Aug 30:</strong> 11:20 AM first tee - Deerhurst Golf Course, Muskoka</p>
            <p><strong>Sunday Aug 31:</strong> 11:40 AM first tee - Muskoka Bay Golf Club</p>
            <p><strong>Awards Dinner:</strong> 4:00 PM Sunday - A la carte dinner/late lunch ($235 per person plus tax, pay for your own food)</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Round 1 Rules */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-golf-green-600">
              <div className="w-8 h-8 bg-golf-green-100 dark:bg-golf-green-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-golf-green-600 font-bold text-sm">1</span>
              </div>
              Round 1: Best Ball - Friday 1:10 PM - Deerhurst Golf Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <Users className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Each player plays their own ball throughout the round</p>
              </div>
              <div className="flex items-start">
                <Target className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>The best score between teammates is used for each hole</p>
              </div>
              <div className="flex items-start">
                <Beer className="w-4 h-4 mr-2 mt-0.5 text-golf-gold-500" />
                <p><strong className="text-golf-gold-500">Drinking Rule:</strong> Birdie forces all other teams to drink</p>
              </div>
              <div className="flex items-start">
                <Trophy className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Points awarded: 1st place = 8 points, 2nd = 6 points, 3rd = 4 points, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round 2 Rules */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-golf-green-600">
              <div className="w-8 h-8 bg-golf-green-100 dark:bg-golf-green-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-golf-green-600 font-bold text-sm">2</span>
              </div>
              Round 2: Scramble - Saturday 11:20 AM - Deerhurst Golf Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <Users className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Both players hit from the tee</p>
              </div>
              <div className="flex items-start">
                <Target className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Choose the best shot and both players hit from that spot</p>
              </div>
              <div className="flex items-start">
                <Target className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Continue until the ball is in the hole</p>
              </div>
              <div className="flex items-start">
                <Beer className="w-4 h-4 mr-2 mt-0.5 text-golf-gold-500" />
                <p><strong className="text-golf-gold-500">Drinking Rule:</strong> The player whose shot wasn't chosen must sip</p>
              </div>
              <div className="flex items-start">
                <Trophy className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Points awarded: 1st place = 8 points, 2nd = 6 points, 3rd = 4 points, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round 3 Rules */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-golf-green-600">
              <div className="w-8 h-8 bg-golf-green-100 dark:bg-golf-green-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-golf-green-600 font-bold text-sm">3</span>
              </div>
              Round 3: Net Stroke Play - Sunday 11:40 AM - Muskoka Bay Golf Club
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <User className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Individual stroke play with handicap applied</p>
              </div>
              <div className="flex items-start">
                <Target className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Each player's net score contributes to team total</p>
              </div>
              <div className="flex items-start">
                <Beer className="w-4 h-4 mr-2 mt-0.5 text-golf-gold-500" />
                <p><strong className="text-golf-gold-500">Drinking Rule:</strong> Each player starts at +18, subtract 1 stroke per drink</p>
              </div>
              <div className="flex items-start">
                <Trophy className="w-4 h-4 mr-2 mt-0.5 text-golf-green-600" />
                <p>Points awarded: 1st place = 8 points, 2nd = 6 points, 3rd = 4 points, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Championship Trophy */}
        <Card className="shadow-lg bg-gradient-to-r from-golf-gold-50 to-golf-green-50 dark:from-golf-gold-900 dark:to-golf-green-900 border border-golf-gold-200 dark:border-golf-gold-700">
          <CardHeader>
            <CardTitle className="flex items-center text-golf-gold-600">
              <Trophy className="w-6 h-6 mr-3" />
              The Gambler Championship Trophy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p>The team with the highest total points across all three rounds wins the coveted Gambler Championship Trophy. In case of a tie, the team with the best Round 3 performance takes home the hardware.</p>
              <div className="mt-4 p-3 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-lg">
                <p className="text-golf-gold-700 dark:text-golf-gold-300 font-semibold">Awards Ceremony & Dinner</p>
                <p className="text-sm text-golf-gold-600 dark:text-golf-gold-400">Sunday 4:00 PM - A la carte dinner/late lunch following the final round. $235 per person plus tax, pay for your own food and drinks.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
