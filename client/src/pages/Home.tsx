import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volleyball, Trophy, Beer } from "lucide-react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-08-29T08:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-golf-green-600 to-golf-green-800 flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('/IMG_8550_1752593365391.jpeg')"
          }}
        />
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-6">
            <img 
              src="/gambler-logo.png" 
              alt="The Gambler Cup Logo" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">The Gambler Cup 2025</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">Where Bogeys Buy Beers and Birdies Win Cash</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-golf-gold-500 text-white px-4 py-2 text-sm font-semibold">
              Annual Championship
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
              8 Teams
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
              3 Rounds
            </Badge>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-golf-green-600 mb-2">Tournament Countdown</h2>
            <p className="text-gray-600 dark:text-gray-400">August 29-31, 2025</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="countdown-digit text-white p-4 rounded-lg mb-2">
                <div className="text-2xl md:text-3xl font-bold">{timeLeft.days}</div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days</p>
            </div>
            <div className="text-center">
              <div className="countdown-digit text-white p-4 rounded-lg mb-2">
                <div className="text-2xl md:text-3xl font-bold">{timeLeft.hours}</div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours</p>
            </div>
            <div className="text-center">
              <div className="countdown-digit text-white p-4 rounded-lg mb-2">
                <div className="text-2xl md:text-3xl font-bold">{timeLeft.minutes}</div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minutes</p>
            </div>
            <div className="text-center">
              <div className="countdown-digit text-white p-4 rounded-lg mb-2">
                <div className="text-2xl md:text-3xl font-bold">{timeLeft.seconds}</div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Overview */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="golf-card shadow-lg">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-golf-green-100 dark:bg-golf-green-900 rounded-lg flex items-center justify-center mb-4">
                <Volleyball className="text-golf-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Format</h3>
              <p className="text-gray-600 dark:text-gray-400">3 rounds: Days 1-2 at Deerhurst Golf Course, Final day at Muskoka Bay Golf Club</p>
            </CardContent>
          </Card>
          
          <Card className="golf-card shadow-lg">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="text-golf-gold-500 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Championship</h3>
              <p className="text-gray-600 dark:text-gray-400">Winner takes home the coveted Gambler Championship Trophy</p>
            </CardContent>
          </Card>
          
          <Card className="golf-card shadow-lg">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Beer className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Side Bets</h3>
              <p className="text-gray-600 dark:text-gray-400">Track your side bets and drinking games throughout the tournament</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
