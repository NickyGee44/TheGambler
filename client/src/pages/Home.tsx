import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volleyball, Trophy, Beer, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TOURNAMENT_CONFIG, getTournamentStartDate } from "@shared/tournamentConfig";

const isTournamentOver = () => new Date() > getTournamentStartDate();

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const tournamentOver = isTournamentOver();

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const isAdmin = user?.firstName === "Nick" && user?.lastName === "Grossi";

  const { data: scores } = useQuery<any[]>({
    queryKey: ['/api/scores'],
    enabled: tournamentOver,
  });

  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ['/api/leaderboard/1'],
    enabled: tournamentOver,
  });

  useEffect(() => {
    if (tournamentOver) return;

    const targetDate = getTournamentStartDate().getTime();

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
  }, [tournamentOver]);

  const champion = scores?.[0];
  const topIndividuals = leaderboard?.slice(0, 3) ?? [];

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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{TOURNAMENT_CONFIG.name}</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">Where Bogeys Buy Beers and Birdies Win Cash</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-golf-gold-500 text-white px-4 py-2 text-sm font-semibold">
              Annual Championship
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
              {TOURNAMENT_CONFIG.teams.count} Teams
            </Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold">
              {TOURNAMENT_CONFIG.rounds.count} Rounds
            </Badge>
          </div>
        </div>
      </div>

      {tournamentOver ? (
        /* Tournament Complete — Final Results */
        <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-golf-green-600 mb-2">Tournament Complete</h2>
              <p className="text-gray-600 dark:text-gray-400">{TOURNAMENT_CONFIG.dates.display}</p>
            </div>

            {/* Champion Banner */}
            {champion && (
              <div className="mb-6 rounded-xl border-2 border-yellow-400 bg-yellow-400/20 p-6 text-center">
                <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold">
                  CHAMPIONS — Team {champion.team.teamNumber}: {champion.team.player1Name} & {champion.team.player2Name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{champion.totalPoints} total points</p>
              </div>
            )}

            <Tabs defaultValue="team" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="team">Final Results</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
              </TabsList>

              {/* Team Standings */}
              <TabsContent value="team">
                {scores && scores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                          <th className="py-2 pr-2">Rank</th>
                          <th className="py-2 pr-2">Team</th>
                          <th className="py-2 pr-2 text-right">R1</th>
                          <th className="py-2 pr-2 text-right">R2</th>
                          <th className="py-2 pr-2 text-right">R3</th>
                          <th className="py-2 text-right font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map((s: any, i: number) => (
                          <tr key={s.teamId} className={`border-b last:border-0 ${i === 0 ? "bg-yellow-50 dark:bg-yellow-900/20 font-semibold" : ""}`}>
                            <td className="py-2 pr-2">{s.rank}</td>
                            <td className="py-2 pr-2">
                              <span className="font-medium">Team {s.team.teamNumber}</span>{" "}
                              <span className="text-gray-500 dark:text-gray-400">
                                {s.team.player1Name} & {s.team.player2Name}
                              </span>
                            </td>
                            <td className="py-2 pr-2 text-right">{s.round1Points}</td>
                            <td className="py-2 pr-2 text-right">{s.round2Points}</td>
                            <td className="py-2 pr-2 text-right">{s.round3Points}</td>
                            <td className="py-2 text-right font-bold">{s.totalPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading results...</p>
                )}
              </TabsContent>

              {/* Individual Podium */}
              <TabsContent value="individual">
                {topIndividuals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {topIndividuals.map((player: any, i: number) => {
                      const colors = [
                        "border-yellow-400 bg-yellow-400/10",
                        "border-gray-400 bg-gray-400/10",
                        "border-amber-600 bg-amber-600/10",
                      ];
                      const icons = [
                        <Trophy key="gold" className="w-8 h-8 text-yellow-500" />,
                        <Medal key="silver" className="w-6 h-6 text-gray-400" />,
                        <Medal key="bronze" className="w-6 h-6 text-amber-600" />,
                      ];
                      return (
                        <Card key={player.user.id} className={`border-2 ${colors[i]} ${i === 0 ? "md:col-span-3 md:max-w-md md:mx-auto" : ""}`}>
                          <CardContent className={`flex flex-col items-center ${i === 0 ? "py-8" : "py-6"}`}>
                            {icons[i]}
                            <span className="text-lg font-bold mt-2">
                              {player.user.firstName} {player.user.lastName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                              {player.stablefordPoints} stableford pts
                            </span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading individual results...</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        /* Countdown Timer — tournament hasn't started */
        <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-golf-green-600 mb-2">Tournament Countdown</h2>
              <p className="text-gray-600 dark:text-gray-400">{TOURNAMENT_CONFIG.dates.display}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p><strong>{TOURNAMENT_CONFIG.schedule.round1.date}:</strong> {TOURNAMENT_CONFIG.schedule.round1.time} - {TOURNAMENT_CONFIG.schedule.round1.course}</p>
                <p><strong>{TOURNAMENT_CONFIG.schedule.round2.date}:</strong> {TOURNAMENT_CONFIG.schedule.round2.time} - {TOURNAMENT_CONFIG.schedule.round2.course}</p>
                <p><strong>{TOURNAMENT_CONFIG.schedule.round3.date}:</strong> {TOURNAMENT_CONFIG.schedule.round3.time} - {TOURNAMENT_CONFIG.schedule.round3.course}</p>
                <p><strong>Awards Dinner:</strong> 4:00 PM Sunday ($235 pp + tax, pay for own food)</p>
              </div>
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
      )}

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
