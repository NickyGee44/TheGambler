import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCourseForRound } from "@shared/courseData";
import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";

type TabValue = "round1" | "round2" | "round3";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface HoleScore {
  hole: number;
  strokes: number;
  points: number;
  netScore: number;
}

const TAB_MAP: Record<string, TabValue> = {
  "1": "round1",
  "2": "round2",
  "3": "round3",
};

const ROUND_MAP: Record<TabValue, number> = {
  round1: 1,
  round2: 2,
  round3: 3,
};

const QUERY_MAP: Record<TabValue, string> = {
  round1: "1",
  round2: "2",
  round3: "3",
};

function getStablefordPoints(par: number, netScore: number) {
  return Math.max(0, 2 + (par - netScore));
}

export default function Scoring() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const defaultTab = useMemo<TabValue>(() => {
    const params = new URLSearchParams(window.location.search);
    return TAB_MAP[params.get("tab") ?? "1"] ?? "round1";
  }, [location]);

  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [currentHole, setCurrentHole] = useState(1);
  const [draftScores, setDraftScores] = useState<Record<number, number>>({});
  const [saveStatus, setSaveStatus] = useState<Record<number, SaveStatus>>({});
  const [errorMessage, setErrorMessage] = useState<Record<number, string>>({});

  const debounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const round = ROUND_MAP[activeTab];
  const course = getCourseForRound(round);
  const holeData = course.holes[currentHole - 1];

  const { data: holeScores = [], isLoading } = useQuery<HoleScore[]>({
    queryKey: [`/api/my-hole-scores/${round}`],
    enabled: !!user,
  });

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setCurrentHole(1);
    setDraftScores({});
    setSaveStatus({});
    setErrorMessage({});
  }, [round]);

  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(clearTimeout);
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: async ({ hole, strokes }: { hole: number; strokes: number }) => {
      const res = await apiRequest("POST", "/api/hole-scores", { round, hole, strokes });
      return res.json();
    },
    onSuccess: (_data, { hole }) => {
      setSaveStatus((prev) => ({ ...prev, [hole]: "saved" }));
      setErrorMessage((prev) => ({ ...prev, [hole]: "" }));
      queryClient.invalidateQueries({ queryKey: [`/api/my-hole-scores/${round}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", round] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", "live", round] });
    },
    onError: (error: Error, { hole }) => {
      setSaveStatus((prev) => ({ ...prev, [hole]: "error" }));
      setErrorMessage((prev) => ({ ...prev, [hole]: error.message || "Save failed" }));
    },
  });

  const savedScoreMap = useMemo(() => {
    const map: Record<number, HoleScore> = {};
    for (const score of holeScores) map[score.hole] = score;
    return map;
  }, [holeScores]);

  const isRoundComplete = holeScores.length >= 18;
  const displayedScore = draftScores[currentHole] ?? savedScoreMap[currentHole]?.strokes ?? 0;
  const receivesStroke = (user?.handicap ?? 0) >= holeData.handicap;
  const netScore = displayedScore > 0 ? displayedScore - (receivesStroke ? 1 : 0) : 0;
  const stablefordPoints = displayedScore > 0 ? getStablefordPoints(holeData.par, netScore) : 0;

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    navigate(`/scoring?tab=${QUERY_MAP[tab]}`);
  };

  const queueSave = (hole: number, strokes: number) => {
    if (debounceRef.current[hole]) clearTimeout(debounceRef.current[hole]);
    setSaveStatus((prev) => ({ ...prev, [hole]: "saving" }));
    debounceRef.current[hole] = setTimeout(() => {
      saveMutation.mutate({ hole, strokes });
    }, 800);
  };

  const setScore = (hole: number, strokes: number) => {
    if (isRoundComplete) return;
    const safe = Math.max(1, Math.min(15, strokes));
    setDraftScores((prev) => ({ ...prev, [hole]: safe }));
    queueSave(hole, safe);
  };

  const retryHole = (hole: number) => {
    const retryValue = draftScores[hole] ?? savedScoreMap[hole]?.strokes;
    if (!retryValue) return;
    queueSave(hole, retryValue);
  };

  const getStatus = (hole: number) => {
    const status = saveStatus[hole];
    if (status) return status;
    if (savedScoreMap[hole]?.strokes) return "saved";
    return "idle";
  };

  const statusBadge = (hole: number) => {
    const status = getStatus(hole);
    if (status === "saved") return <Badge className="bg-emerald-600 text-black">✓ saved</Badge>;
    if (status === "saving") return <Badge variant="secondary">⏳ saving</Badge>;
    if (status === "error") {
      return (
        <Button variant="destructive" size="sm" onClick={() => retryHole(hole)} className="h-6 px-2 text-xs">
          ✗ retry
        </Button>
      );
    }
    return <Badge variant="outline">not saved</Badge>;
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading scoring...</div>;
  }

  const summary = holeScores.length
    ? holeScores.reduce(
        (acc, item) => {
          acc.gross += item.strokes;
          acc.net += item.netScore;
          acc.stableford += item.points;
          if (item.strokes < acc.best.strokes) acc.best = item;
          if (item.strokes > acc.worst.strokes) acc.worst = item;
          return acc;
        },
        {
          gross: 0,
          net: 0,
          stableford: 0,
          best: holeScores[0],
          worst: holeScores[0],
        },
      )
    : null;

  return (
    <div className="min-h-screen bg-background pb-28 px-3 pt-4 md:px-6">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-center text-2xl font-black tracking-[0.16em] text-gambler-gold">SCORING</h1>

        <div className="grid grid-cols-3 gap-2">
          {([
            ["round1", "Round 1"],
            ["round2", "Round 2"],
            ["round3", "Round 3"],
          ] as const).map(([tab, label]) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              className={activeTab === tab ? "bg-gambler-green text-black" : ""}
              onClick={() => handleTabChange(tab)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-md border border-gambler-border bg-gambler-slate p-2">
          {course.holes.map((h) => {
            const status = getStatus(h.number);
            const isActive = currentHole === h.number;
            return (
              <button
                key={h.number}
                onClick={() => setCurrentHole(h.number)}
                className={`min-w-9 rounded px-2 py-1 text-xs ${
                  isActive ? "bg-gambler-green text-black font-bold" : "bg-gambler-black text-white"
                } ${status === "error" ? "ring-1 ring-red-500" : ""} ${isRoundComplete ? "opacity-60" : ""}`}
              >
                {h.number}
                {status === "saved" ? " ✓" : status === "saving" ? " ⏳" : status === "error" ? " ✗" : ""}
              </button>
            );
          })}
        </div>

        <Card className="border-gambler-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Hole {currentHole}</span>
              {statusBadge(currentHole)}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Par {holeData.par} • {holeData.yardage} yds • HCP {holeData.handicap}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {saveStatus[currentHole] === "error" && errorMessage[currentHole] && (
              <div className="rounded border border-red-700 bg-red-950/30 p-2 text-xs text-red-300">
                Save failed: {errorMessage[currentHole]}
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setScore(currentHole, (displayedScore || holeData.par) - 1)}
                disabled={isRoundComplete}
                className="h-12 w-12"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <input
                type="number"
                min={1}
                max={15}
                value={displayedScore || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value > 0) setScore(currentHole, value);
                }}
                disabled={isRoundComplete}
                className="h-16 w-28 rounded-md border border-gambler-border bg-gambler-black text-center text-3xl font-black"
              />

              <Button
                size="icon"
                variant="outline"
                onClick={() => setScore(currentHole, (displayedScore || holeData.par) + 1)}
                disabled={isRoundComplete}
                className="h-12 w-12"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded bg-gambler-slate p-2">
                <div className="text-muted-foreground">Par</div>
                <div className="font-bold">{holeData.par}</div>
              </div>
              <div className="rounded bg-gambler-slate p-2">
                <div className="text-muted-foreground">Net</div>
                <div className="font-bold">{netScore || "-"}</div>
              </div>
              <div className="rounded bg-gambler-slate p-2">
                <div className="text-muted-foreground">Stableford</div>
                <div className="font-bold text-gambler-green">{stablefordPoints}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentHole((h) => Math.max(1, h - 1))}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" onClick={() => retryHole(currentHole)} disabled={getStatus(currentHole) !== "error"}>
                <RotateCcw className="mr-2 h-4 w-4" /> Retry
              </Button>
              <Button variant="outline" onClick={() => setCurrentHole((h) => Math.min(18, h + 1))}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isRoundComplete && summary && (
          <Card className="animate-in fade-in zoom-in-95 duration-500 border-gambler-green">
            <CardHeader>
              <CardTitle className="text-gambler-green">Round Complete</CardTitle>
              <p className="text-xs text-muted-foreground">Scores are locked for this round.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-gambler-slate p-2">Gross: <span className="font-bold">{summary.gross}</span></div>
              <div className="rounded bg-gambler-slate p-2">Net: <span className="font-bold">{summary.net}</span></div>
              <div className="rounded bg-gambler-slate p-2">Stableford: <span className="font-bold">{summary.stableford}</span></div>
              <div className="rounded bg-gambler-slate p-2">Best/Worst: <span className="font-bold">H{summary.best.hole}/H{summary.worst.hole}</span></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
