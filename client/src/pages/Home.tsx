import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Beer, Medal, Users, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TOURNAMENT_CONFIG, getTournamentStartDate } from "@shared/tournamentConfig";

const isTournamentOver = () => new Date() > getTournamentStartDate();

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const tournamentOver = isTournamentOver();

  const { data: scores } = useQuery<any[]>({
    queryKey: ["/api/scores"],
    enabled: tournamentOver,
  });

  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/1"],
    enabled: tournamentOver,
  });

  const { data: availablePlayers = [] } = useQuery<any[]>({
    queryKey: ["/api/players"],
  });

  useEffect(() => {
    if (tournamentOver) return;

    const targetDate = getTournamentStartDate().getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [tournamentOver]);

  const champion = scores?.[0];
  const topIndividuals = leaderboard?.slice(0, 3) ?? [];
  const registeredPlayers = useMemo(() => {
    const availableCount = Array.isArray(availablePlayers) ? availablePlayers.length : 0;
    return Math.max(0, TOURNAMENT_CONFIG.teams.totalPlayers - availableCount);
  }, [availablePlayers]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[28rem] flex items-center justify-center border-b border-gambler-border">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/IMG_8550_1752593365391.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 text-center px-4 py-16">
          <h1 className="text-5xl md:text-8xl font-black tracking-[0.24em] text-gambler-gold">THE GAMBLER</h1>
          <p className="text-3xl md:text-5xl font-black text-gambler-green mt-3">2026</p>
          <p className="text-base md:text-xl text-foreground mt-5">Where Bogeys Buy Beers and Birdies Win Cash</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/scores" className="px-5 py-3 bg-gambler-green text-gambler-black font-extrabold tracking-wide uppercase rounded-sm">
              View Leaderboard
            </Link>
            <Link href="/sidebets" className="px-5 py-3 border border-gambler-gold text-gambler-gold font-extrabold tracking-wide uppercase rounded-sm hover:bg-gambler-gold hover:text-gambler-black transition-colors">
              Place a Bet
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gambler-slate border-b border-gambler-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {tournamentOver ? (
            <div className="text-center rounded-md border border-gambler-gold bg-gambler-black p-6">
              <h2 className="text-3xl md:text-4xl font-black tracking-[0.16em] text-gambler-gold">2025 CHAMPIONS</h2>
              {champion && (
                <p className="text-foreground mt-3 font-medium">
                  Team {champion.team.teamNumber}: {champion.team.player1Name} & {champion.team.player2Name}
                </p>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-center text-xl md:text-2xl font-bold tracking-[0.12em] text-gambler-gold mb-5">TOURNAMENT COUNTDOWN</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-gambler-black border border-gambler-gold rounded-sm p-4">
                      <div className="text-3xl md:text-4xl font-black text-foreground tabular-nums">{item.value}</div>
                    </div>
                    <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
            <Card className="bg-gambler-black border border-gambler-border">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Registered Players</p>
                <p className="text-3xl font-black text-gambler-green tabular-nums mt-1">{registeredPlayers}</p>
              </CardContent>
            </Card>
            <Card className="bg-gambler-black border border-gambler-border">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Days to Tournament</p>
                <p className="text-3xl font-black text-gambler-gold tabular-nums mt-1">{tournamentOver ? 0 : timeLeft.days}</p>
              </CardContent>
            </Card>
            <Card className="bg-gambler-black border border-gambler-border">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Teams</p>
                <p className="text-3xl font-black text-foreground tabular-nums mt-1">{TOURNAMENT_CONFIG.teams.count}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {tournamentOver && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <Tabs defaultValue="team" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gambler-slate border border-gambler-border">
              <TabsTrigger value="team">Final Results</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
            </TabsList>

            <TabsContent value="team">
              {scores && scores.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-gambler-border bg-gambler-slate">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gambler-border text-left text-muted-foreground">
                        <th className="py-3 px-3">Rank</th>
                        <th className="py-3 px-3">Team</th>
                        <th className="py-3 px-3 text-right">R1</th>
                        <th className="py-3 px-3 text-right">R2</th>
                        <th className="py-3 px-3 text-right">R3</th>
                        <th className="py-3 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s: any, i: number) => (
                        <tr key={s.teamId} className={`border-b border-gambler-border/70 last:border-0 ${i === 0 ? "bg-gambler-gold/10" : ""}`}>
                          <td className="py-3 px-3">{s.rank}</td>
                          <td className="py-3 px-3">
                            Team {s.team.teamNumber} - {s.team.player1Name} & {s.team.player2Name}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">{s.round1Points}</td>
                          <td className="py-3 px-3 text-right tabular-nums">{s.round2Points}</td>
                          <td className="py-3 px-3 text-right tabular-nums">{s.round3Points}</td>
                          <td className="py-3 px-3 text-right font-bold text-gambler-green tabular-nums">{s.totalPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Loading results...</p>
              )}
            </TabsContent>

            <TabsContent value="individual">
              {topIndividuals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {topIndividuals.map((player: any, i: number) => {
                    const cardTone = ["border-gambler-gold", "border-zinc-300", "border-amber-700"][i] ?? "border-gambler-border";
                    return (
                      <Card key={player.user.id} className={`border-2 ${cardTone} bg-gambler-slate`}>
                        <CardContent className="py-6 text-center">
                          <Medal className={`w-6 h-6 mx-auto ${i === 0 ? "text-gambler-gold" : i === 1 ? "text-zinc-300" : "text-amber-700"}`} />
                          <p className="mt-2 font-bold">
                            {player.user.firstName} {player.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{player.stablefordPoints} stableford pts</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Loading individual results...</p>
              )}
            </TabsContent>
          </Tabs>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gambler-slate border border-gambler-border">
            <CardContent className="p-6">
              <Users className="w-6 h-6 text-gambler-green mb-3" />
              <h3 className="text-lg font-bold">Format</h3>
              <p className="text-sm text-muted-foreground mt-2">3 rounds across Deerhurst and Muskoka Bay with team and match-play scoring.</p>
            </CardContent>
          </Card>

          <Card className="bg-gambler-slate border border-gambler-border">
            <CardContent className="p-6">
              <Trophy className="w-6 h-6 text-gambler-gold mb-3" />
              <h3 className="text-lg font-bold">Championship</h3>
              <p className="text-sm text-muted-foreground mt-2">Every hole matters. One team leaves with the trophy and bragging rights.</p>
            </CardContent>
          </Card>

          <Card className="bg-gambler-slate border border-gambler-border">
            <CardContent className="p-6">
              <Beer className="w-6 h-6 text-gambler-green mb-3" />
              <h3 className="text-lg font-bold">Side Action</h3>
              <p className="text-sm text-muted-foreground mt-2">Track bets, votes, and boozelympics chaos all weekend.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 rounded-md border border-gambler-border bg-gambler-slate p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            {TOURNAMENT_CONFIG.dates.display}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {TOURNAMENT_CONFIG.teams.count} teams
          </div>
        </div>
      </section>
    </div>
  );
}
