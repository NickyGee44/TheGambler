import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Voting() {
  const { toast } = useToast();
  const year = useMemo(() => new Date().getFullYear(), []);
  const [guestName, setGuestName] = useState("");
  const [guestRelationship, setGuestRelationship] = useState("");
  const [reason, setReason] = useState("");

  const { data: votes = [] } = useQuery<any[]>({
    queryKey: ["/api/tournament-votes", year],
    queryFn: async () => {
      const res = await fetch(`/api/tournament-votes?year=${year}`, { credentials: "include" });
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to load votes");
      return res.json();
    },
  });

  const { data: guestApplications = [] } = useQuery<any[]>({
    queryKey: ["/api/guest-applications", year],
    queryFn: async () => {
      const res = await fetch(`/api/guest-applications?year=${year}`, { credentials: "include" });
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to load guest applications");
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/guest-applications", {
        tournamentYear: year,
        guestName,
        guestRelationship,
        reason,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-applications", year] });
      setGuestName("");
      setGuestRelationship("");
      setReason("");
    },
    onError: () => toast({ title: "Error", description: "Failed to submit guest application", variant: "destructive" }),
  });

  const castVoteMutation = useMutation({
    mutationFn: async ({ voteId, optionId }: { voteId: number; optionId: number }) => {
      const res = await apiRequest("POST", `/api/tournament-votes/${voteId}/vote`, { optionId, tournamentYear: year });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tournament-votes", year] }),
  });

  const guestVoteMutation = useMutation({
    mutationFn: async ({ applicationId, vote }: { applicationId: number; vote: "yes" | "no" }) => {
      const res = await apiRequest("POST", `/api/guest-applications/${applicationId}/vote`, { vote, tournamentYear: year });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/guest-applications", year] }),
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Apply to Bring a Guest (+1)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          <Input placeholder="Relationship" value={guestRelationship} onChange={(e) => setGuestRelationship(e.target.value)} />
          <Textarea placeholder="Why should they come?" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button onClick={() => applyMutation.mutate()} disabled={!guestName || applyMutation.isPending}>Submit Application</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Destination / Accommodations Voting</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {votes.map((vote) => (
            <div key={vote.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{vote.title}</p>
                <Badge>{vote.status}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(vote.options ?? []).map((option: any) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    onClick={() => castVoteMutation.mutate({ voteId: vote.id, optionId: option.id })}
                    disabled={castVoteMutation.isPending || vote.status !== "open"}
                  >
                    {option.optionText}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Guest Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {guestApplications.map((application) => (
            <div key={application.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{application.guestName}</p>
                <Badge>{application.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{application.guestRelationship}</p>
              <p className="text-sm mb-2">{application.reason}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => guestVoteMutation.mutate({ applicationId: application.id, vote: "yes" })}>Vote Yes</Button>
                <Button size="sm" variant="outline" onClick={() => guestVoteMutation.mutate({ applicationId: application.id, vote: "no" })}>Vote No</Button>
                <span className="text-xs text-muted-foreground ml-auto">Yes: {application.votesYes ?? 0} | No: {application.votesNo ?? 0}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
