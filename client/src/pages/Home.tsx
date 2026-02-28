import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TOURNAMENT_CONFIG } from "@shared/tournamentConfig";
import { CalendarDays, MapPin, Zap, Trophy, Target, DollarSign, ChevronRight } from "lucide-react";

interface LiveScoreRow {
  id: number;
  rank: number;
  totalPoints: number;
  round1Points: number;
  round2Points: number;
  round3Points: number;
  currentHole?: number;
  team: {
    teamNumber: number;
    player1Name: string;
    player2Name: string;
  };
}

const MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ?? "";

function CourseMiniMap({ name, location }: { name: string; location: string }) {
  const src = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(location)}&zoom=15&maptype=satellite`;
  return (
    <div className="overflow-hidden rounded-lg border border-gambler-border">
      <iframe
        title={name}
        src={src}
        width="100%"
        height="200"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block"
      />
      <div className="bg-gambler-black px-3 py-2">
        <p className="text-xs font-bold text-gambler-gold">{name}</p>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [changedRows, setChangedRows] = useState<Record<number, boolean>>({});
  const prevTotalsRef = useRef<Record<number, number>>({});

  const { data: leaderboard = [] } = useQuery<LiveScoreRow[]>({
    queryKey: ["/api/live-scores"],
    refetchInterval: 15000,
    staleTime: 0,
  });

  useEffect(() => {
    const changed: Record<number, boolean> = {};
    for (const row of leaderboard) {
      const prev = prevTotalsRef.current[row.id];
      if (typeof prev === "number" && prev !== row.totalPoints) changed[row.id] = true;
      prevTotalsRef.current[row.id] = row.totalPoints;
    }
    if (Object.keys(changed).length) {
      setChangedRows(changed);
      const t = setTimeout(() => setChangedRows({}), 1200);
      return () => clearTimeout(t);
    }
  }, [leaderboard]);

  const topFive = leaderboard.slice(0, 5);
  const rankSuffix = (n: number) => (["st", "nd", "rd"] as const)[n - 1] ?? "th";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Hero */}
      <section className="relative flex min-h-[52vh] flex-col items-center justify-center overflow-hidden bg-gambler-black px-4 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gambler-green/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gambler-gold/8 blur-[60px]" />
        </div>

        <div className="relative mb-4 flex items-center gap-2 rounded-full border border-gambler-green/40 bg-gambler-green/10 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gambler-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gambler-green" />
          </span>
          <span className="text-xs font-bold tracking-[0.18em] text-gambler-green">LIVE · 2026 TOURNAMENT</span>
        </div>

        <h1 className="relative text-6xl font-black tracking-[0.22em] text-gambler-gold drop-shadow-[0_0_32px_rgba(255,215,0,0.35)] md:text-8xl">
          THE GAMBLER
        </h1>
        <p className="relative mt-2 text-lg font-bold tracking-[0.28em] text-gambler-green md:text-2xl">
          2026 CHAMPIONSHIP
        </p>
        <p className="relative mt-3 max-w-md text-sm text-muted-foreground">
          Where bogeys buy beers and birdies win cash.
        </p>

        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 gap-2 bg-gambler-green font-bold tracking-wide text-black hover:bg-gambler-green/90">
            <Link href="/scoring"><Target className="h-4 w-4" /> Enter Score</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 gap-2 border-gambler-gold font-bold tracking-wide text-gambler-gold hover:bg-gambler-gold/10">
            <Link href="/scores"><Trophy className="h-4 w-4" /> Leaderboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 gap-2 border-gambler-border font-bold tracking-wide text-muted-foreground hover:text-white">
            <Link href="/sidebets"><DollarSign className="h-4 w-4" /> Side Bets</Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
        {/* Info Strip */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: CalendarDays, label: "Dates", value: (TOURNAMENT_CONFIG as any).dates?.display ?? "July 2026" },
            { icon: MapPin, label: "Location", value: (TOURNAMENT_CONFIG as any).courses?.round1?.location ?? "TBD" },
            { icon: Zap, label: "Format", value: ((TOURNAMENT_CONFIG as any).rounds?.types ?? ["Stableford"]).join(" · ") },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border-gambler-border bg-gambler-slate/60">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gambler-green/15">
                  <Icon className="h-4 w-4 text-gambler-green" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Live Leaderboard Top 5 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black tracking-wider text-foreground">🏆 LIVE STANDINGS</h2>
            <Link href="/scores" className="flex items-center gap-1 text-xs font-medium text-gambler-gold hover:underline">
              Full leaderboard <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {topFive.length === 0 ? (
            <Card className="border-gambler-border bg-gambler-slate/60">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No scores yet — tournament kicks off soon!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {topFive.map((row) => {
                const isFirst = row.rank === 1;
                return (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors duration-300 ${
                      changedRows[row.id]
                        ? "border-gambler-green bg-gambler-green/15"
                        : isFirst
                        ? "border-gambler-gold/50 bg-gambler-gold/5"
                        : "border-gambler-border bg-gambler-slate/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 text-center text-sm font-black ${isFirst ? "text-gambler-gold" : "text-muted-foreground"}`}>
                        {row.rank}{rankSuffix(row.rank)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">Team {row.team.teamNumber}</p>
                        <p className="text-xs text-muted-foreground">{row.team.player1Name} &amp; {row.team.player2Name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {row.currentHole && (
                        <span className="text-xs text-muted-foreground">Hole {row.currentHole}</span>
                      )}
                      <Badge className={`min-w-[48px] justify-center text-base font-black ${isFirst ? "bg-gambler-gold text-black" : "bg-gambler-green text-black"}`}>
                        {row.totalPoints}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Course Previews — Google Maps */}
        {MAPS_API_KEY && (
          <section>
            <h2 className="mb-3 text-base font-black tracking-wider text-foreground">⛳ COURSES</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(TOURNAMENT_CONFIG as any).courses?.round1?.name && (
                <CourseMiniMap
                  name={(TOURNAMENT_CONFIG as any).courses.round1.name}
                  location={(TOURNAMENT_CONFIG as any).courses.round1.location ?? (TOURNAMENT_CONFIG as any).courses.round1.name}
                />
              )}
              {(TOURNAMENT_CONFIG as any).courses?.round3?.name &&
                (TOURNAMENT_CONFIG as any).courses.round3.name !== (TOURNAMENT_CONFIG as any).courses.round1?.name && (
                  <CourseMiniMap
                    name={(TOURNAMENT_CONFIG as any).courses.round3.name}
                    location={(TOURNAMENT_CONFIG as any).courses.round3.location ?? (TOURNAMENT_CONFIG as any).courses.round3.name}
                  />
                )}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/scoring", emoji: "🎯", label: "Score Entry" },
            { href: "/sidebets", emoji: "💰", label: "Side Bets" },
            { href: "/trashtalk", emoji: "💬", label: "Trash Talk" },
            { href: "/matchups", emoji: "🏌️", label: "Matchups" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cursor-pointer border-gambler-border bg-gambler-slate/60 transition-all hover:border-gambler-green/50 hover:bg-gambler-green/5 active:scale-95">
                <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
