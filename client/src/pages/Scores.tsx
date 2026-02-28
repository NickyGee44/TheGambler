import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, Trophy, Medal } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

interface LiveScoreRow {
  id: number;
  rank: number;
  totalPoints: number;
  round1Points: number;
  round2Points: number;
  round3Points: number;
  currentRoundPoints: number;
  currentRoundStanding: number;
  currentHole?: number;
  team: {
    teamNumber: number;
    player1Name: string;
    player2Name: string;
    player3Name?: string;
  };
}

const PODIUM_STYLES = [
  { border: "border-gambler-gold/60", bg: "bg-gambler-gold/8", label: "text-gambler-gold", badge: "bg-gambler-gold text-black", icon: Trophy, glow: "shadow-[0_0_20px_rgba(255,215,0,0.2)]" },
  { border: "border-zinc-400/40", bg: "bg-zinc-400/5", label: "text-zinc-300", badge: "bg-zinc-300 text-black", icon: Medal, glow: "" },
  { border: "border-amber-700/40", bg: "bg-amber-700/5", label: "text-amber-600", badge: "bg-amber-700 text-white", icon: Medal, glow: "" },
];

export default function Scores() {
  const [changedRows, setChangedRows] = useState<Record<number, boolean>>({});
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const previousTotalsRef = useRef<Record<number, number>>({});

  const {
    data: liveScores = [],
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery<LiveScoreRow[]>({
    queryKey: ["/api/live-scores"],
    refetchInterval: 15000,
    staleTime: 0,
  });

  const { data: playerProgress = [] } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", 1],
    refetchInterval: 15000,
  });

  useEffect(() => {
    setSecondsSinceUpdate(0);
    const interval = setInterval(() => setSecondsSinceUpdate((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  useEffect(() => {
    const changed: Record<number, boolean> = {};
    for (const row of liveScores) {
      const prev = previousTotalsRef.current[row.id];
      if (typeof prev === "number" && prev !== row.totalPoints) changed[row.id] = true;
      previousTotalsRef.current[row.id] = row.totalPoints;
    }
    if (Object.keys(changed).length) {
      setChangedRows(changed);
      const timer = setTimeout(() => setChangedRows({}), 1200);
      return () => clearTimeout(timer);
    }
  }, [liveScores]);

  const podium = useMemo(() => liveScores.slice(0, 3), [liveScores]);
  const rest = useMemo(() => liveScores.slice(3), [liveScores]);

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-24 md:px-6 md:pb-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[0.16em] text-gambler-gold drop-shadow-[0_0_16px_rgba(255,215,0,0.25)]">
              LEADERBOARD
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Auto-refreshes every 15 seconds</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gambler-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gambler-green" />
              </span>
              <Wifi className="h-3 w-3" /> {secondsSinceUpdate}s ago
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await queryClient.invalidateQueries({ queryKey: ["/api/live-scores"] });
                await refetch();
              }}
              disabled={isFetching}
              className="border-gambler-green/50 text-gambler-green hover:bg-gambler-green/10"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Podium Top 3 */}
        {podium.length > 0 && (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {podium.map((team, i) => {
              const style = PODIUM_STYLES[i];
              const Icon = style.icon;
              return (
                <Card
                  key={team.id}
                  className={`border ${style.border} ${style.bg} ${style.glow} transition-colors duration-300 ${
                    changedRows[team.id] ? "!border-gambler-green !bg-gambler-green/10" : ""
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <Icon className={`h-5 w-5 ${style.label}`} />
                      <Badge className={`${style.badge} text-base font-black`}>{team.totalPoints}</Badge>
                    </div>
                    <p className={`mt-3 text-xs font-bold tracking-widest ${style.label}`}>
                      {i + 1}{(["st", "nd", "rd"] as const)[i]} PLACE
                    </p>
                    <p className="mt-1 text-base font-black text-foreground">Team {team.team.teamNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {team.team.player1Name} &amp; {team.team.player2Name}
                    </p>
                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      <span>R1: <strong>{team.round1Points ?? 0}</strong></span>
                      <span>R2: <strong>{team.round2Points ?? 0}</strong></span>
                      <span>R3: <strong>{team.round3Points ?? 0}</strong></span>
                    </div>
                    {team.currentHole && (
                      <p className="mt-1 text-xs text-gambler-green">▶ Hole {team.currentHole}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}

        {/* Full Standings Table */}
        <Card className="border-gambler-border bg-gambler-slate/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground">
              <Trophy className="h-4 w-4 text-gambler-gold" /> FULL STANDINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading scores...</div>
            ) : liveScores.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No scores recorded yet.</div>
            ) : (
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-gambler-border bg-gambler-black/60 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-center">Hole</th>
                    <th className="px-4 py-3 text-center">R1</th>
                    <th className="px-4 py-3 text-center">R2</th>
                    <th className="px-4 py-3 text-center">R3</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {liveScores.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gambler-border/50 last:border-0 transition-colors duration-300 ${
                        changedRows[row.id]
                          ? "bg-gambler-green/15"
                          : i === 0
                          ? "bg-gambler-gold/5"
                          : "hover:bg-gambler-slate/40"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`text-sm font-black ${i === 0 ? "text-gambler-gold" : i < 3 ? "text-foreground" : "text-muted-foreground"}`}>
                          #{row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">Team {row.team.teamNumber}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ProfilePicture
                            firstName={row.team.player1Name.split(" ")[0]}
                            lastName={row.team.player1Name.split(" ")[1] ?? ""}
                            size="sm"
                          />
                          <span>{row.team.player1Name} &amp; {row.team.player2Name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {row.currentHole ? <span className="font-medium text-gambler-green">{row.currentHole}</span> : "—"}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.round1Points ?? 0}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.round2Points ?? 0}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.round3Points ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-lg font-black tabular-nums ${i === 0 ? "text-gambler-gold" : "text-gambler-green"}`}>
                          {row.totalPoints ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Player Progress */}
        {playerProgress.length > 0 && (
          <Card className="border-gambler-border bg-gambler-slate/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-wider text-muted-foreground">👤 PLAYER PROGRESS</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {playerProgress.slice(0, 12).map((p: any) => (
                <div
                  key={p.user.id}
                  className="flex items-center justify-between rounded-lg border border-gambler-border bg-gambler-black/40 px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <ProfilePicture firstName={p.user.firstName} lastName={p.user.lastName} size="sm" />
                    <span className="font-medium">{p.user.firstName} {p.user.lastName}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Hole {p.currentHole ?? 1}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
