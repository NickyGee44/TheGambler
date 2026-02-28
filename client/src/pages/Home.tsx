import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { TOURNAMENT_CONFIG } from "@shared/tournamentConfig";
import { CalendarDays, MapPin, Trophy, Zap } from "lucide-react";

interface LiveScoreRow {
  id: number;
  rank: number;
  totalPoints: number;
  team: {
    teamNumber: number;
    player1Name: string;
    player2Name: string;
  };
}

export default function Home() {
  const { data: leaderboard = [] } = useQuery<LiveScoreRow[]>({
    queryKey: ["/api/live-scores"],
    refetchInterval: 15000,
  });

  const topFive = leaderboard.slice(0, 5);

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-24 md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-xl border border-gambler-border bg-gradient-to-br from-gambler-black via-gambler-slate to-gambler-black p-6">
          <p className="text-xs font-bold tracking-[0.2em] text-gambler-green">LIVE TOURNAMENT</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.18em] text-gambler-gold">THE GAMBLER 2026</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Private tournament dashboard for scores, bets, and trash talk.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="lg" className="h-12 bg-gambler-green text-black hover:bg-gambler-green/90">
              <Link href="/scoring">Enter My Score</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-gambler-gold text-gambler-gold">
              <Link href="/scores">Open Leaderboard</Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="border-gambler-border bg-gambler-slate">
            <CardContent className="p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Dates</div>
              <div className="mt-1 font-semibold">{TOURNAMENT_CONFIG.dates.display}</div>
            </CardContent>
          </Card>
          <Card className="border-gambler-border bg-gambler-slate">
            <CardContent className="p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</div>
              <div className="mt-1 font-semibold">{TOURNAMENT_CONFIG.courses.round1.location}</div>
              <div className="text-xs text-muted-foreground">{TOURNAMENT_CONFIG.courses.round1.name} / {TOURNAMENT_CONFIG.courses.round3.name}</div>
            </CardContent>
          </Card>
          <Card className="border-gambler-border bg-gambler-slate">
            <CardContent className="p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Zap className="h-4 w-4" /> Format</div>
              <div className="mt-1 font-semibold">{TOURNAMENT_CONFIG.rounds.types.join(" • ")}</div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-gambler-border bg-gambler-slate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-gambler-gold" /> Live Leaderboard Preview (Top 5)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topFive.length === 0 ? (
              <div className="text-sm text-muted-foreground">No live scores yet.</div>
            ) : (
              topFive.map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded border border-gambler-border bg-gambler-black/40 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold">#{row.rank} Team {row.team.teamNumber}</div>
                    <div className="text-xs text-muted-foreground">{row.team.player1Name} & {row.team.player2Name}</div>
                  </div>
                  <Badge className="bg-gambler-green text-black">{row.totalPoints}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
