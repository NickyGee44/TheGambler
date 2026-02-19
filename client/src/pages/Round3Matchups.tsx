import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Users, Target, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const ROUND3_MATCHUPS = [
  {
    foursome: "Foursome 1",
    matchup: "Jordan Kreller vs Christian Hauck",
    holes: "1–6",
    strokes: "Christian gives Jordan 0 strokes",
    player1: "Jordan Kreller",
    player2: "Christian Hauck"
  },
  {
    foursome: "Foursome 1",
    matchup: "Jordan Kreller vs Connor Patterson",
    holes: "7–12",
    strokes: "Connor gives Jordan 1 stroke",
    player1: "Jordan Kreller",
    player2: "Connor Patterson"
  },
  {
    foursome: "Foursome 1",
    matchup: "Jordan Kreller vs Mystery Player",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Jordan Kreller",
    player2: "Mystery Player"
  },
  {
    foursome: "Foursome 1",
    matchup: "Christian Hauck vs Connor Patterson",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "Christian Hauck",
    player2: "Connor Patterson"
  },
  {
    foursome: "Foursome 1",
    matchup: "Christian Hauck vs Mystery Player",
    holes: "7–12",
    strokes: "No strokes given",
    player1: "Christian Hauck",
    player2: "Mystery Player"
  },
  {
    foursome: "Foursome 1",
    matchup: "Connor Patterson vs Mystery Player",
    holes: "13–18",
    strokes: "Mystery Player gives Connor 1 stroke",
    player1: "Connor Patterson",
    player2: "Mystery Player"
  },
  // Missing matchups to complete the round-robin for Foursome 1
  {
    foursome: "Foursome 1",
    matchup: "Christian Hauck vs Connor Patterson",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Christian Hauck",
    player2: "Connor Patterson"
  },
  {
    foursome: "Foursome 1",
    matchup: "Mystery Player vs Jordan Kreller",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "Mystery Player",
    player2: "Jordan Kreller"
  },
  {
    foursome: "Foursome 2",
    matchup: "Spencer Reid vs Jeffrey Reiner",
    holes: "1–6",
    strokes: "Spencer gets 2 strokes from Jeffrey",
    player1: "Spencer Reid",
    player2: "Jeffrey Reiner"
  },
  {
    foursome: "Foursome 2",
    matchup: "Spencer Reid vs Kevin Durco",
    holes: "7–12",
    strokes: "Kevin gives Spencer 4 strokes",
    player1: "Spencer Reid",
    player2: "Kevin Durco"
  },
  {
    foursome: "Foursome 2",
    matchup: "Spencer Reid vs Erik Boudreau",
    holes: "13–18",
    strokes: "Erik gives Spencer 2 strokes",
    player1: "Spencer Reid",
    player2: "Erik Boudreau"
  },
  {
    foursome: "Foursome 2",
    matchup: "Jeffrey Reiner vs Kevin Durco",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "Jeffrey Reiner",
    player2: "Kevin Durco"
  },
  {
    foursome: "Foursome 2",
    matchup: "Jeffrey Reiner vs Erik Boudreau",
    holes: "7–12",
    strokes: "Erik gets 1 stroke from Jeffrey",
    player1: "Jeffrey Reiner",
    player2: "Erik Boudreau"
  },
  {
    foursome: "Foursome 2",
    matchup: "Kevin Durco vs Erik Boudreau",
    holes: "13–18",
    strokes: "Erik gives Kevin 2 strokes",
    player1: "Kevin Durco",
    player2: "Erik Boudreau"
  },
  // Missing matchups to complete the round-robin for Foursome 2
  {
    foursome: "Foursome 2",
    matchup: "Jeffrey Reiner vs Kevin Durco",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Jeffrey Reiner",
    player2: "Kevin Durco"
  },
  {
    foursome: "Foursome 2",
    matchup: "Erik Boudreau vs Spencer Reid",
    holes: "1–6",
    strokes: "Erik gives Spencer 2 strokes",
    player1: "Erik Boudreau",
    player2: "Spencer Reid"
  },
  {
    foursome: "Foursome 3",
    matchup: "Sye Ellard vs Will Bibbings",
    holes: "1–6",
    strokes: "Will gives Sye 4 strokes",
    player1: "Sye Ellard",
    player2: "Will Bibbings"
  },
  {
    foursome: "Foursome 3",
    matchup: "Sye Ellard vs Nic Huxley",
    holes: "7–12",
    strokes: "Nic gives Sye 1 stroke",
    player1: "Sye Ellard",
    player2: "Nic Huxley"
  },
  {
    foursome: "Foursome 3",
    matchup: "Sye Ellard vs Bailey Carlson",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Sye Ellard",
    player2: "Bailey Carlson"
  },
  {
    foursome: "Foursome 3",
    matchup: "Will Bibbings vs Nic Huxley",
    holes: "1–6",
    strokes: "Nic gets 3 strokes from Will",
    player1: "Will Bibbings",
    player2: "Nic Huxley"
  },
  {
    foursome: "Foursome 3",
    matchup: "Will Bibbings vs Bailey Carlson",
    holes: "7–12",
    strokes: "Bailey gets 4 strokes from Will",
    player1: "Will Bibbings",
    player2: "Bailey Carlson"
  },
  {
    foursome: "Foursome 3",
    matchup: "Nic Huxley vs Bailey Carlson",
    holes: "13–18",
    strokes: "Bailey gets 2 strokes from Nic",
    player1: "Nic Huxley",
    player2: "Bailey Carlson"
  },
  // Missing matchups to complete the round-robin for Foursome 3
  {
    foursome: "Foursome 3",
    matchup: "Will Bibbings vs Nic Huxley",
    holes: "13–18",
    strokes: "Nic gets 3 strokes from Will",
    player1: "Will Bibbings",
    player2: "Nic Huxley"
  },
  {
    foursome: "Foursome 3",
    matchup: "Bailey Carlson vs Sye Ellard",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "Bailey Carlson",
    player2: "Sye Ellard"
  },
  {
    foursome: "Foursome 4",
    matchup: "Nick Grossi vs Nick Cook",
    holes: "1–6",
    strokes: "Nick Cook gives Nick Grossi 1 stroke",
    player1: "Nick Grossi",
    player2: "Nick Cook"
  },
  {
    foursome: "Foursome 4",
    matchup: "Nick Grossi vs Johnny Magnatta",
    holes: "7–12",
    strokes: "Johnny gives Nick 2 strokes",
    player1: "Nick Grossi",
    player2: "Johnny Magnatta"
  },
  {
    foursome: "Foursome 4",
    matchup: "Nick Grossi vs James Ogilvie",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Nick Grossi",
    player2: "James Ogilvie"
  },
  {
    foursome: "Foursome 4",
    matchup: "Nick Cook vs Johnny Magnatta",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "Nick Cook",
    player2: "Johnny Magnatta"
  },
  {
    foursome: "Foursome 4",
    matchup: "Nick Cook vs James Ogilvie",
    holes: "7–12",
    strokes: "James gets 2 strokes from Cook",
    player1: "Nick Cook",
    player2: "James Ogilvie"
  },
  {
    foursome: "Foursome 4",
    matchup: "Johnny Magnatta vs James Ogilvie",
    holes: "13–18",
    strokes: "James gets 2 strokes from Johnny",
    player1: "Johnny Magnatta",
    player2: "James Ogilvie"
  },
  // Missing matchups to complete the round-robin for Foursome 4
  {
    foursome: "Foursome 4",
    matchup: "Nick Cook vs Johnny Magnatta",
    holes: "13–18",
    strokes: "No strokes given",
    player1: "Nick Cook",
    player2: "Johnny Magnatta"
  },
  {
    foursome: "Foursome 4",
    matchup: "James Ogilvie vs Nick Grossi",
    holes: "1–6",
    strokes: "No strokes given",
    player1: "James Ogilvie",
    player2: "Nick Grossi"
  }
];

interface ScoreUpdateData {
  matchupId: number;
  player1Score: number;
  player2Score: number;
}

export default function Round3Matchups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMatchup, setSelectedMatchup] = useState<any>(null);
  const [scoreForm, setScoreForm] = useState({
    player1Score: '',
    player2Score: ''
  });

  const { data: matchups, isLoading } = useQuery({
    queryKey: ['/api/matchups'],
  });

  const updateScoreMutation = useMutation({
    mutationFn: async (data: ScoreUpdateData) => {
      const res = await apiRequest("PUT", `/api/matchups/${data.matchupId}/score`, {
        player1Score: data.player1Score,
        player2Score: data.player2Score
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matchups'] });
      toast({
        title: "Score updated successfully",
        description: "The matchup score has been recorded.",
      });
      setSelectedMatchup(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating score",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleScoreUpdate = (matchup: any) => {
    if (!scoreForm.player1Score || !scoreForm.player2Score) {
      toast({
        title: "Invalid scores",
        description: "Please enter valid scores for both players.",
        variant: "destructive",
      });
      return;
    }

    updateScoreMutation.mutate({
      matchupId: matchup.id,
      player1Score: parseInt(scoreForm.player1Score),
      player2Score: parseInt(scoreForm.player2Score)
    });
  };

  const canEditScores = (matchup: any) => {
    if (!user) return false;
    const userFullName = `${user.firstName} ${user.lastName}`;
    return matchup.player1 === userFullName || matchup.player2 === userFullName;
  };

  const groupedMatchups = ROUND3_MATCHUPS.reduce((acc, matchup) => {
    if (!acc[matchup.foursome]) {
      acc[matchup.foursome] = [];
    }
    acc[matchup.foursome].push(matchup);
    return acc;
  }, {} as Record<string, typeof ROUND3_MATCHUPS>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading matchups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Round 3 - Stroke Matchups
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Muskoka Bay Golf Club • 6-Hole Net Stroke Matches
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>24 Individual Matchups</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>4 Foursomes</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Net Stroke Play</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {Object.entries(groupedMatchups).map(([foursome, matches]) => (
            <Card key={foursome} className="border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {foursome}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {matches.length} matchups across 18 holes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {match.matchup}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Holes {match.holes}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {match.holes}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Strokes:</strong> {match.strokes}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="secondary" className="ml-2">
                            Pending
                          </Badge>
                        </div>
                        
                        {user && canEditScores(match) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMatchup(match)}
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Enter Score
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enter Matchup Score</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                  <p><strong>Matchup:</strong> {match.matchup}</p>
                                  <p><strong>Holes:</strong> {match.holes}</p>
                                  <p><strong>Strokes:</strong> {match.strokes}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="player1Score">{match.player1}</Label>
                                    <Input
                                      id="player1Score"
                                      type="number"
                                      value={scoreForm.player1Score}
                                      onChange={(e) => setScoreForm({
                                        ...scoreForm,
                                        player1Score: e.target.value
                                      })}
                                      placeholder="Score"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="player2Score">{match.player2}</Label>
                                    <Input
                                      id="player2Score"
                                      type="number"
                                      value={scoreForm.player2Score}
                                      onChange={(e) => setScoreForm({
                                        ...scoreForm,
                                        player2Score: e.target.value
                                      })}
                                      placeholder="Score"
                                    />
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => handleScoreUpdate(match)}
                                  disabled={updateScoreMutation.isPending}
                                  className="w-full"
                                >
                                  {updateScoreMutation.isPending ? "Updating..." : "Update Score"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Round 3 Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Stroke Play Rules</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Each matchup is 6 holes of net stroke play</li>
                  <li>• Strokes given/received based on handicap differences</li>
                  <li>• Lowest net score wins the matchup</li>
                  <li>• All scores must be entered by players involved</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Scoring System</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Winner: 2 points</li>
                  <li>• Tie: 1 point each</li>
                  <li>• Loser: 0 points</li>
                  <li>• Points contribute to overall team standings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}