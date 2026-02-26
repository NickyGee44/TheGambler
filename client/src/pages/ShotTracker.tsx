import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ShotTracker() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [round, setRound] = useState(1);
  const [hole, setHole] = useState(1);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [lastShotAt, setLastShotAt] = useState<number>(0);
  const shotCountRef = useRef(0);

  const { data: shots = [] } = useQuery<any[]>({
    queryKey: ["/api/shots", year, round],
    queryFn: async () => {
      const res = await fetch(`/api/shots?year=${year}&round=${round}`, { credentials: "include" });
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to fetch shots");
      return res.json();
    },
  });

  useEffect(() => {
    shotCountRef.current = shots.filter((s) => s.hole === hole).length;
  }, [shots, hole]);

  const logShotMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/shots", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shots", year, round] });
      if (navigator.vibrate) navigator.vibrate(100);
      setLastShotAt(Date.now());
    },
  });

  const logShot = (detectedBy: "manual" | "motion") => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        shotCountRef.current += 1;
        logShotMutation.mutate({
          tournamentYear: year,
          round,
          hole,
          shotNumber: shotCountRef.current,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          detectedBy,
        });
      },
      () => {
        shotCountRef.current += 1;
        logShotMutation.mutate({
          tournamentYear: year,
          round,
          hole,
          shotNumber: shotCountRef.current,
          detectedBy,
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!motionEnabled) return;

    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      const x = Math.abs(acc?.x ?? 0);
      const y = Math.abs(acc?.y ?? 0);
      const z = Math.abs(acc?.z ?? 0);
      const total = Math.sqrt(x * x + y * y + z * z);
      if (total > 15 && Date.now() - lastShotAt > 2000) {
        logShot("motion");
      }
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [motionEnabled, lastShotAt, round, hole]);

  const enableMotion = async () => {
    const maybeDeviceMotion = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof maybeDeviceMotion.requestPermission === "function") {
      const permission = await maybeDeviceMotion.requestPermission();
      setMotionEnabled(permission === "granted");
    } else {
      setMotionEnabled(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Track My Round</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button variant={round === 1 ? "default" : "outline"} onClick={() => setRound(1)}>Round 1</Button>
            <Button variant={round === 2 ? "default" : "outline"} onClick={() => setRound(2)}>Round 2</Button>
            <Button variant={round === 3 ? "default" : "outline"} onClick={() => setRound(3)}>Round 3</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((h) => (
              <Button key={h} size="sm" variant={hole === h ? "default" : "outline"} onClick={() => setHole(h)}>{h}</Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Badge>{motionEnabled ? "Motion On" : "Motion Off"}</Badge>
            <Button onClick={enableMotion} variant="outline">Enable Motion</Button>
            <Button onClick={() => logShot("manual")}>Log Shot</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Shot Log</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {shots.map((shot) => (
            <div key={shot.id} className="border rounded p-2 text-sm">
              Hole {shot.hole} | Shot {shot.shotNumber} | {shot.detectedBy}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
