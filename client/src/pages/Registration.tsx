import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Registration() {
  const { toast } = useToast();
  const year = useMemo(() => new Date().getFullYear(), []);

  const { data: registration, isLoading } = useQuery<any>({
    queryKey: ["/api/registrations", year, "me"],
    queryFn: async () => {
      const res = await fetch(`/api/registrations/${year}/me`, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load registration");
      return res.json();
    },
  });

  const entryCheckoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/registrations/entry-checkout", { year });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      toast({ title: "Checkout created", description: "Entry checkout session created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create entry checkout", variant: "destructive" });
    },
  });

  const ctpCheckoutMutation = useMutation({
    mutationFn: async (round: number) => {
      const res = await apiRequest("POST", "/api/registrations/ctp-checkout", { round, tournamentYear: year });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      toast({ title: "Checkout created", description: "CTP checkout session created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create CTP checkout", variant: "destructive" });
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/registrations", year, "me"] });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Register for {year}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading registration...</p> : null}
          <div className="flex items-center gap-2">
            <span className="text-sm">Entry Fee:</span>
            <Badge>{registration?.entryPaid ? "Paid" : "Unpaid"}</Badge>
          </div>
          <Button onClick={() => entryCheckoutMutation.mutate()} disabled={entryCheckoutMutation.isPending || registration?.entryPaid}>
            Pay $150 CAD Entry Fee
          </Button>
          <Button variant="outline" onClick={refresh}>Refresh Status</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CTP Side Bet ($30 CAD per round)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((round) => {
            const paid = registration?.[`ctpRound${round}Paid`];
            return (
              <div key={round} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Round {round}</p>
                  <Badge>{paid ? "Paid" : "Not Paid"}</Badge>
                </div>
                <Button
                  className="w-full"
                  onClick={() => ctpCheckoutMutation.mutate(round)}
                  disabled={ctpCheckoutMutation.isPending || !registration?.entryPaid || paid}
                >
                  Join Round {round} CTP
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
