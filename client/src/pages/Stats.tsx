import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart3, Bird, TrendingDown, Target, Flag, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProfilePicture from "@/components/ProfilePicture";

interface PlayerRoundStats {
  round: number;
  birdies?: number;
  eagles?: number;
  fairwayHits: number;
  fairwayAttempts: number;
  greenHits: number;
  greenAttempts: number;
  putts: number;
  penalties: number;
}

interface PlayerStats {
  userId: number;
  firstName: string;
  lastName: string;
  totalHoles: number;
  fairwayPercentage: string;
  averagePutts: string;
  totalPenalties: number;
  birdies: number;
  eagles: number;
  rounds: PlayerRoundStats[];
}

export default function Stats() {
  const [tab, setTab] = useState("leaderboards");
  const { data: playerStats = [], isLoading } = useQuery<PlayerStats[]>({
    queryKey: ["/api/player-stats"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gambler-green mx-auto mb-4"></div>
          <div>Loading tournament statistics...</div>
        </div>
      </div>
    );
  }

  if (playerStats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex items-center justify-center text-white">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gambler-green" />
          <div className="text-xl font-bold">No stats recorded yet</div>
        </div>
      </div>
    );
  }

  const withDerived = playerStats.map((player) => {
    const puttingAverage = player.totalHoles > 0 ? Number(player.averagePutts) : 0;
    const fairwayAccuracy = Number(player.fairwayPercentage || "0");
    const birdiesEaglesTotal = (player.birdies || 0) + (player.eagles || 0);
    return { ...player, puttingAverage, fairwayAccuracy, birdiesEaglesTotal };
  });

  const birdieEagleLeaders = [...withDerived].sort((a, b) => b.birdiesEaglesTotal - a.birdiesEaglesTotal);
  const puttingLeaders = [...withDerived].sort((a, b) => a.puttingAverage - b.puttingAverage);
  const fairwayLeaders = [...withDerived].sort((a, b) => b.fairwayAccuracy - a.fairwayAccuracy);
  const penaltyLeaders = [...withDerived].sort((a, b) => b.totalPenalties - a.totalPenalties);

  const LeaderboardCard = ({
    title,
    icon,
    rows,
    valueFormatter,
    subtitleFormatter,
  }: {
    title: string;
    icon: ReactNode;
    rows: (PlayerStats & { birdiesEaglesTotal?: number; puttingAverage?: number; fairwayAccuracy?: number })[];
    valueFormatter: (player: any) => string;
    subtitleFormatter?: (player: any) => string;
  }) => (
    <Card className="bg-gambler-black border-gambler-border">
      <CardHeader>
        <CardTitle className="text-gambler-gold flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.slice(0, 8).map((player, index) => (
          <div key={player.userId} className="flex items-center justify-between bg-gambler-slate border border-gambler-border rounded px-3 py-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-gray-700 text-white w-6 h-6 p-0 rounded-full flex items-center justify-center">{index + 1}</Badge>
              <ProfilePicture firstName={player.firstName} lastName={player.lastName} size="sm" />
              <div>
                <div className="text-white text-sm font-medium">{player.firstName} {player.lastName}</div>
                {subtitleFormatter && <div className="text-xs text-gray-400">{subtitleFormatter(player)}</div>}
              </div>
            </div>
            <div className="text-gambler-green font-bold">{valueFormatter(player)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-[0.14em] text-gambler-gold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          STATS
        </h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 bg-gambler-slate border border-gambler-border">
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboards" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeaderboardCard
            title="Birdies / Eagles Leaderboard"
            icon={<Bird className="w-5 h-5 text-gambler-green" />}
            rows={birdieEagleLeaders}
            valueFormatter={(p) => `${p.birdiesEaglesTotal}`}
            subtitleFormatter={(p) => `Birdies ${p.birdies} • Eagles ${p.eagles} • ${p.rounds?.map((r: PlayerRoundStats) => `R${r.round} ${r.birdies || 0}/${r.eagles || 0}`).join(" | ") || "No round split"}`}
          />
          <LeaderboardCard
            title="Putting Average (Putts / Hole)"
            icon={<Target className="w-5 h-5 text-gambler-green" />}
            rows={puttingLeaders}
            valueFormatter={(p) => `${p.puttingAverage.toFixed(2)}`}
          />
          <LeaderboardCard
            title="Fairway Accuracy"
            icon={<Flag className="w-5 h-5 text-gambler-green" />}
            rows={fairwayLeaders}
            valueFormatter={(p) => `${p.fairwayAccuracy.toFixed(1)}%`}
            subtitleFormatter={(p) => {
              const hits = p.rounds.reduce((sum: number, r: PlayerRoundStats) => sum + (r.fairwayHits || 0), 0);
              const attempts = p.rounds.reduce((sum: number, r: PlayerRoundStats) => sum + (r.fairwayAttempts || 0), 0);
              return `${hits}/${attempts || 0}`;
            }}
          />
          <LeaderboardCard
            title="Penalty Leaders"
            icon={<TrendingDown className="w-5 h-5 text-red-500" />}
            rows={penaltyLeaders}
            valueFormatter={(p) => `${p.totalPenalties}`}
          />
        </TabsContent>

        <TabsContent value="players" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {withDerived.map((player) => (
            <Card key={player.userId} className="bg-gambler-black border-gambler-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <ProfilePicture firstName={player.firstName} lastName={player.lastName} size="lg" />
                  <div>
                    <div>{player.firstName} {player.lastName}</div>
                    <div className="text-sm text-gray-400 font-normal">{player.totalHoles} holes</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-200"><span>Birdies + Eagles</span><span>{player.birdiesEaglesTotal}</span></div>
                <div className="flex justify-between text-gray-200"><span>Putting Avg</span><span>{player.puttingAverage.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-200"><span>Fairway Accuracy</span><span>{player.fairwayAccuracy.toFixed(1)}%</span></div>
                <div className="flex justify-between text-gray-200"><span>Penalties</span><span>{player.totalPenalties}</span></div>
                <Link href={`/player/${player.userId}`}>
                  <Button variant="outline" className="w-full border-gambler-border text-white hover:bg-gambler-slate mt-3">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
