import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BettingMarketplace() {
  const { toast } = useToast();
  const year = useMemo(() => new Date().getFullYear(), []);
  const [description, setDescription] = useState("");
  const [amountCents, setAmountCents] = useState("500");

  const { data: bets = [] } = useQuery<any[]>({
    queryKey: ["/api/bets", year],
    queryFn: async () => {
      const res = await fetch(`/api/bets?year=${year}`, { credentials: "include" });
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to load bets");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bets", {
        tournamentYear: year,
        description,
        amountCents: Number(amountCents),
        type: "custom",
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets", year] });
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: () => toast({ title: "Error", description: "Failed to create bet", variant: "destructive" }),
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/bets/${id}/accept`, { tournamentYear: year });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets", year] });
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: () => toast({ title: "Error", description: "Failed to accept bet", variant: "destructive" }),
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Create Bet</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bet description" />
          <Input value={amountCents} onChange={(e) => setAmountCents(e.target.value)} type="number" min={500} max={50000} step={100} />
          <Button onClick={() => createMutation.mutate()} disabled={!description || createMutation.isPending}>Create and Pay</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Marketplace</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {bets.map((bet) => (
            <div key={bet.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{bet.description}</p>
                <p className="text-sm text-muted-foreground">${(bet.amountCents / 100).toFixed(2)} CAD</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{bet.status}</Badge>
                {bet.status === "open" ? (
                  <Button size="sm" onClick={() => acceptMutation.mutate(bet.id)} disabled={acceptMutation.isPending}>Accept</Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
