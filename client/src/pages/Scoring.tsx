import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Round1 from "@/pages/Round1";
import Round2 from "@/pages/Round2";
import Round3 from "@/pages/Round3";

type TabValue = "round1" | "round2" | "round3";

const TAB_MAP: Record<string, TabValue> = {
  "1": "round1",
  "2": "round2",
  "3": "round3",
};

const QUERY_MAP: Record<TabValue, string> = {
  round1: "1",
  round2: "2",
  round3: "3",
};

export default function Scoring() {
  const [location, navigate] = useLocation();

  const defaultTab = useMemo<TabValue>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") ?? "1";
    return TAB_MAP[tabParam] ?? "round1";
  }, [location]);

  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (value: string) => {
    const tabValue = value as TabValue;
    setActiveTab(tabValue);
    navigate(`/scoring?tab=${QUERY_MAP[tabValue]}`);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black tracking-[0.18em] text-gambler-gold mb-6">⛳ SCORING</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-2 bg-gambler-slate border border-gambler-border p-2">
            <TabsTrigger value="round1" className="text-xs md:text-sm data-[state=active]:bg-gambler-green data-[state=active]:text-gambler-black">
              ROUND 1 - BETTER BALL
            </TabsTrigger>
            <TabsTrigger value="round2" className="text-xs md:text-sm data-[state=active]:bg-gambler-green data-[state=active]:text-gambler-black">
              ROUND 2 - SCRAMBLE
            </TabsTrigger>
            <TabsTrigger value="round3" className="text-xs md:text-sm data-[state=active]:bg-gambler-green data-[state=active]:text-gambler-black">
              ROUND 3 - MATCH PLAY
            </TabsTrigger>
          </TabsList>

          <TabsContent value="round1" className="mt-4">
            <Round1 />
          </TabsContent>
          <TabsContent value="round2" className="mt-4">
            <Round2 />
          </TabsContent>
          <TabsContent value="round3" className="mt-4">
            <Round3 />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
