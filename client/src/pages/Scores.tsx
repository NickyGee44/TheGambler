import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy, Wifi } from "lucide-react";
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
      if (typeof prev === "number" && prev !== row.totalPoints) {
        changed[row.id] = true;
      }
      previousTotalsRef.current[row.id] = row.totalPoints;
    }
    if (Object.keys(changed).length) {
      setChangedRows(changed);
      const timer = setTimeout(() => setChangedRows({}), 1200);
      return () => clearTimeout(timer);
    }
  }, [liveScores]);

  const podium = useMemo(() => liveScores.slice(0, 3), [liveScores]);

  return (
    <div className="min-h-screen bg-background px-4 py-4 pb-24 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-[0.16em] text-gambler-gold">LEADERBOARD</h1>
          <p className="mt-1 text-sm text-muted-foreground">Auto-refresh every 15s</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3.5 w-3.5" /> Last updated {secondsSinceUpdate}s ago
          </Badge>
          <Button
            variant="outline"
            onClick={async () => {
              await queryClient.invalidateQueries({ queryKey: ["/api/live-scores"] });
              await refetch();
            }}
            disabled={isFetching}
            className="border-gambler-green text-gambler-green"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {podium.map((team, index) => (
            <Card key={team.id} className="border-gambler-border bg-gambler-slate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{index + 1}{index === 0 ? "st" : index === 1 ? "nd" : "rd"} Place</span>
                  <Trophy className="h-4 w-4 text-gambler-gold" />
                </div>
                <div className="mt-2 text-lg font-bold">Team {team.team.teamNumber}</div>
                <div className="mt-1 text-xs text-muted-foreground">Current hole: {team.currentHole ?? 1}</div>
                <div className="mt-2 text-2xl font-black text-gambler-green">{team.totalPoints}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gambler-border bg-gambler-slate">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live Team Standings</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading live scores...</div>
            ) : (
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gambler-border bg-gambler-black text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-3">Rank</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3 text-center">Current Hole</th>
                    <th className="px-3 py-3 text-center">R1</th>
                    <th className="px-3 py-3 text-center">R2</th>
                    <th className="px-3 py-3 text-center">R3</th>
                    <th className="px-3 py-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {liveScores.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gambler-border/60 transition-colors ${
                        changedRows[row.id] ? "bg-emerald-500/20" : ""
                      }`}
                    >
                      <td className="px-3 py-3 font-bold">#{row.rank}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold">Team {row.team.teamNumber}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <ProfilePicture firstName={row.team.player1Name.split(" ")[0]} lastName={row.team.player1Name.split(" ")[1] ?? ""} size="sm" />
                          <span>{row.team.player1Name} & {row.team.player2Name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-medium">{row.currentHole ?? 1}</td>
                      <td className="px-3 py-3 text-center">{row.round1Points ?? 0}</td>
                      <td className="px-3 py-3 text-center">{row.round2Points ?? 0}</td>
                      <td className="px-3 py-3 text-center">{row.round3Points ?? 0}</td>
                      <td className="px-3 py-3 text-center text-lg font-black text-gambler-green">{row.totalPoints ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="border-gambler-border bg-gambler-slate">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Player Progress</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {playerProgress.slice(0, 10).map((p: any) => (
              <div key={p.user.id} className="flex items-center justify-between rounded border border-gambler-border bg-gambler-black/40 px-3 py-2 text-sm">
                <span>{p.user.firstName} {p.user.lastName}</span>
                <Badge variant="outline">Hole {p.currentHole ?? 1}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
