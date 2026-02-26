import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Plus, DollarSign, CheckCircle, XCircle, Clock, Bell, AlertTriangle, Users, Vote } from "lucide-react";
import { SideBet } from "@shared/schema";
import ProfilePicture from "@/components/ProfilePicture";
import LoadingPage from "@/components/LoadingPage";

export default function SideBets() {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Enhanced preset match options
  const [matchType, setMatchType] = useState<string>("custom"); // "team", "individual", "custom"
  const [scoringType, setScoringType] = useState<string>(""); // "gross", "net_stroke", "net_match"
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<string>("");
  const [selectedOpponentPlayer, setSelectedOpponentPlayer] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: sideBets = [], isLoading } = useQuery<SideBet[]>({
    queryKey: ['/api/sidebets'],
    refetchInterval: 10000,
  });

  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/teams'],
  });

  const { data: registeredPlayers = [] } = useQuery<any[]>({
    queryKey: ['/api/registered-players'],
  });

  const createSideBetMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sidebets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
      toast({
        title: "Side Bet Created",
        description: "Your side bet has been successfully created",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create side bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSideBetMutation = useMutation({
    mutationFn: async ({ id, result }: { id: number; result: string }) => {
      return await apiRequest('PATCH', `/api/sidebets/${id}`, { result });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update side bet result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSideBetStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/sidebets/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
      toast({
        title: "Side Bet Updated",
        description: "The side bet result has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update side bet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const teammateAcceptMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('PATCH', `/api/sidebets/${id}/teammate-accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
      toast({
        title: "Bet Accepted",
        description: "You have accepted the team bet",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to accept team bet",
        variant: "destructive",
      });
    },
  });

  const witnessVoteMutation = useMutation({
    mutationFn: async ({ id, winnerName }: { id: number; winnerName: string }) => {
      return await apiRequest('POST', `/api/sidebets/${id}/witness-vote`, { winnerName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
      toast({
        title: "Vote Recorded",
        description: "Your witness vote has been recorded",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record witness vote",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedRound("");
    setOpponentName("");
    setAmount("");
    setCondition("");
    setMatchType("custom");
    setScoringType("");
    setSelectedOpponentTeam("");
    setSelectedOpponentPlayer("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUserName = user ? `${user.firstName} ${user.lastName}` : '';
    
    // Validation based on match type
    if (!selectedRound || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    let finalOpponentName = opponentName;
    let finalCondition = condition;
    
    // Handle preset match types
    if (matchType === "team") {
      if (!selectedOpponentTeam || !scoringType) {
        toast({
          title: "Error",
          description: "Please select opponent team and scoring type",
          variant: "destructive",
        });
        return;
      }
      
      const currentUserTeam = teams.find((t: any) => t.id === user?.teamId);
      const opponentTeam = teams.find((t: any) => t.id === parseInt(selectedOpponentTeam));
      
      if (currentUserTeam?.id === opponentTeam?.id) {
        toast({
          title: "Error",
          description: "You cannot challenge your own team",
          variant: "destructive",
        });
        return;
      }
      
      finalOpponentName = `Team ${opponentTeam?.teamNumber}`;
      finalCondition = `Team vs Team - ${scoringType.replace('_', ' ').toUpperCase()} - Round ${selectedRound}`;
    } else if (matchType === "individual") {
      if (!selectedOpponentPlayer || !scoringType) {
        toast({
          title: "Error",
          description: "Please select opponent player and scoring type",
          variant: "destructive",
        });
        return;
      }
      
      // Check round restrictions for individual matches
      if (selectedRound === "2") {
        toast({
          title: "Error",
          description: "Individual matches are not available for Round 2 (Better Ball format)",
          variant: "destructive",
        });
        return;
      }
      
      finalOpponentName = selectedOpponentPlayer;
      finalCondition = `Individual - ${scoringType.replace('_', ' ').toUpperCase()} - Round ${selectedRound}`;
      
      if (currentUserName === finalOpponentName) {
        toast({
          title: "Error",
          description: "You cannot challenge yourself",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Custom match
      if (!opponentName || !condition) {
        toast({
          title: "Error",
          description: "Please fill in opponent and condition for custom match",
          variant: "destructive",
        });
        return;
      }
      
      if (currentUserName === opponentName) {
        toast({
          title: "Error",
          description: "You cannot challenge yourself",
          variant: "destructive",
        });
        return;
      }
    }

    // For team bets, get teammate information
    let isTeamBet = matchType === "team";
    let betterTeammate = null;
    let opponentTeammate = null;

    if (isTeamBet) {
      const currentUserTeam = teams.find((t: any) => t.id === user?.teamId);
      const opponentTeam = teams.find((t: any) => t.id === parseInt(selectedOpponentTeam));
      
      if (currentUserTeam) {
        // Find teammate (the player who isn't the current user)
        betterTeammate = currentUserTeam.player1Name === currentUserName ? 
          currentUserTeam.player2Name : currentUserTeam.player1Name;
      }
      
      if (opponentTeam) {
        // For team bets, set main opponent as first player and teammate as second
        finalOpponentName = opponentTeam.player1Name;
        opponentTeammate = opponentTeam.player2Name;
      }
    }

    createSideBetMutation.mutate({
      round: parseInt(selectedRound),
      betterName: currentUserName,
      opponentName: finalOpponentName,
      amount: parseInt(amount),
      condition: finalCondition,
      isTeamBet,
      betterTeammate,
      opponentTeammate,
      teammateAccepted: false,
    });
  };

  const getResultBadge = (result: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (result === 'Won') {
      return (
        <Badge className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Won
        </Badge>
      );
    } else if (result === 'Lost') {
      return (
        <Badge className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircle className="w-3 h-3 mr-1" />
          Lost
        </Badge>
      );
    } else {
      return (
        <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const getBetCardClasses = (bet: SideBet) => {
    if (bet.result === "Won") return "bg-gambler-slate border border-gambler-green";
    if (bet.result === "Lost") return "bg-gambler-slate border border-red-500";
    return "bg-gambler-slate border border-amber-500";
  };

  const getBetsByRound = (round: number) => {
    return sideBets.filter((bet: SideBet) => 
      bet.round === round && 
      bet.status !== 'Declined' && 
      !bet.status?.startsWith('Auto-declined')
    );
  };

  const roundTitles = {
    1: "Round 1 - Best Ball (Deerhurst)",
    2: "Round 2 - Scramble (Deerhurst)", 
    3: "Round 3 - Net Stroke Play (Muskoka Bay)",
  };

  const allPlayers = teams.flatMap((team: any) => [team.player1Name, team.player2Name]);

  if (isLoading) {
    return <LoadingPage message="Loading side bets..." fullScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-[0.16em] text-gambler-gold mb-2">🎰 THE BOOK</h2>
          <p className="text-muted-foreground">Side bets open until 1 hour before each round</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-gradient-to-r from-[#FFD700] to-[#FFB300] hover:from-[#ffe266] hover:to-[#ffc247] text-gambler-black font-extrabold tracking-wide uppercase">
              <Plus className="w-4 h-4 mr-2" />
              PLACE A BET
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-golf-green-600">Place New Bet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Match Type Selection */}
              <div>
                <Label>Match Type</Label>
                <Select value={matchType} onValueChange={(value) => {
                  setMatchType(value);
                  // Reset dependent fields when match type changes
                  setOpponentName("");
                  setSelectedOpponentTeam("");
                  setSelectedOpponentPlayer("");
                  setScoringType("");
                  setCondition("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team vs Team</SelectItem>
                    <SelectItem value="individual">Individual Match</SelectItem>
                    <SelectItem value="custom">Custom Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Round Selection */}
              <div>
                <Label htmlFor="round">Round</Label>
                <Select value={selectedRound} onValueChange={setSelectedRound}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Round 1 - Better Ball (Deerhurst)</SelectItem>
                    <SelectItem value="2">Round 2 - Scramble (Deerhurst)</SelectItem>
                    <SelectItem value="3">Round 3 - Match Play (Muskoka Bay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Match Interface */}
              {matchType === "team" && (
                <>
                  <div>
                    <Label>Your Team</Label>
                    <Input
                      value={`Team ${teams.find((t: any) => t.id === user?.teamId)?.teamNumber || ''} - ${user?.firstName} ${user?.lastName} & Partner`}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Label>Opponent Team</Label>
                    <Select value={selectedOpponentTeam} onValueChange={setSelectedOpponentTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opponent team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.filter((team: any) => team.id !== user?.teamId).map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            Team {team.teamNumber} - {team.player1Name} & {team.player2Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Scoring Type</Label>
                    <Select value={scoringType} onValueChange={setScoringType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scoring type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRound === "1" || selectedRound === "2" ? (
                          <SelectItem value="gross">Gross Score Only</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="gross">Gross Score</SelectItem>
                            <SelectItem value="net_stroke">Net Stroke Play</SelectItem>
                            <SelectItem value="net_match">Net Match Play</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Individual Match Interface */}
              {matchType === "individual" && (
                <>
                  <div>
                    <Label>Challenger</Label>
                    <Input
                      value={user ? `${user.firstName} ${user.lastName}` : ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Label>Opponent Player</Label>
                    <Select value={selectedOpponentPlayer} onValueChange={setSelectedOpponentPlayer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opponent player" />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredPlayers
                          .filter((player: any) => player.userId !== user?.id)
                          .map((player: any) => (
                            <SelectItem key={player.userId} value={player.name}>
                              {player.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRound !== "2" && (
                    <div>
                      <Label>Scoring Type</Label>
                      <Select value={scoringType} onValueChange={setScoringType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scoring type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gross">Gross Score</SelectItem>
                          <SelectItem value="net_stroke">Net Stroke Play</SelectItem>
                          {selectedRound === "3" && (
                            <SelectItem value="net_match">Net Match Play</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Custom Match Interface */}
              {matchType === "custom" && (
                <>
                  <div>
                    <Label htmlFor="challenger">Challenger</Label>
                    <Input
                      id="challenger"
                      value={user ? `${user.firstName} ${user.lastName}` : ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">You are automatically set as the challenger</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="opponent">Opponent</Label>
                    <Select value={opponentName} onValueChange={setOpponentName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opponent" />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredPlayers
                          .filter((player: any) => player.userId !== user?.id)
                          .map((player: any) => (
                            <SelectItem key={player.userId} value={player.name}>
                              {player.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="condition">Custom Condition</Label>
                    <Input
                      id="condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="e.g., Better round score, Most birdies, etc."
                      className="focus:ring-golf-green-500 focus:border-golf-green-500"
                    />
                  </div>
                </>
              )}

              {/* Amount (common for all types) */}
              <div>
                <Label htmlFor="amount">Wager Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="20"
                    className="pl-10 focus:ring-golf-green-500 focus:border-golf-green-500"
                  />
                </div>
              </div>

              {/* Submit/Cancel buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
                  disabled={createSideBetMutation.isPending}
                >
                  {createSideBetMutation.isPending ? 'Creating...' : 'Place Bet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((round) => (
          <Card key={round} className="shadow-lg bg-gambler-black border border-gambler-border">
            <CardHeader>
              <CardTitle className="text-xl text-gambler-gold">
                {roundTitles[round as keyof typeof roundTitles]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getBetsByRound(round).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No bets placed yet for this round
                  </p>
                ) : (
                  getBetsByRound(round).map((bet: SideBet) => (
                    <div key={bet.id} className={`${getBetCardClasses(bet)} p-4 rounded-sm`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gambler-green">
                            {bet.isTeamBet ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <ProfilePicture 
                                      firstName={bet.betterName.split(' ')[0]} 
                                      lastName={bet.betterName.split(' ')[1] || ''} 
                                      size="sm"
                                    />
                                    <span className="text-sm">{bet.betterName}</span>
                                    <span className="text-xs text-gray-500">&</span>
                                    <ProfilePicture 
                                      firstName={bet.betterTeammate?.split(' ')[0] || ''} 
                                      lastName={bet.betterTeammate?.split(' ')[1] || ''} 
                                      size="sm"
                                    />
                                    <span className="text-sm">{bet.betterTeammate}</span>
                                  </div>
                                  <span className="text-sm">challenge</span>
                                  <div className="flex items-center gap-1">
                                    <ProfilePicture 
                                      firstName={bet.opponentName.split(' ')[0]} 
                                      lastName={bet.opponentName.split(' ')[1] || ''} 
                                      size="sm"
                                    />
                                    <span className="text-sm">{bet.opponentName}</span>
                                    <span className="text-xs text-gray-500">&</span>
                                    <ProfilePicture 
                                      firstName={bet.opponentTeammate?.split(' ')[0] || ''} 
                                      lastName={bet.opponentTeammate?.split(' ')[1] || ''} 
                                      size="sm"
                                    />
                                    <span className="text-sm">{bet.opponentTeammate}</span>
                                  </div>
                                </div>
                                {bet.status === 'Partially Accepted' && (
                                  <div className="text-xs text-orange-600 dark:text-orange-400">
                                    Waiting for {bet.teammateAccepted ? bet.opponentName : bet.opponentTeammate} to accept
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <ProfilePicture 
                                    firstName={bet.betterName.split(' ')[0]} 
                                    lastName={bet.betterName.split(' ')[1] || ''} 
                                    size="md"
                                  />
                                  <span>{bet.betterName}</span>
                                </div>
                                <span>challenges</span>
                                <div className="flex items-center gap-2">
                                  <ProfilePicture 
                                    firstName={bet.opponentName.split(' ')[0]} 
                                    lastName={bet.opponentName.split(' ')[1] || ''} 
                                    size="md"
                                  />
                                  <span>{bet.opponentName}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {bet.condition}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                          <span className="font-semibold text-gambler-gold">
                            ${bet.amount}
                          </span>
                          <div className="flex items-center space-x-2">
                            {(bet.status === 'Pending' || bet.status === 'Partially Accepted') && (
                              <>
                                {bet.isTeamBet ? (
                                  // Team bet acceptance logic
                                  <>
                                    {(bet.opponentName === (user ? `${user.firstName} ${user.lastName}` : '') || 
                                      bet.opponentTeammate === (user ? `${user.firstName} ${user.lastName}` : '')) ? (
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => bet.opponentName === (user ? `${user.firstName} ${user.lastName}` : '') ? 
                                            updateSideBetStatusMutation.mutate({ id: bet.id, status: 'Accepted' }) :
                                            teammateAcceptMutation.mutate(bet.id)
                                          }
                                          className="text-green-600 hover:text-green-700 border-green-600"
                                          disabled={bet.status === 'Partially Accepted' && 
                                            ((bet.teammateAccepted && bet.opponentTeammate === (user ? `${user.firstName} ${user.lastName}` : '')) ||
                                             (!bet.teammateAccepted && bet.opponentName === (user ? `${user.firstName} ${user.lastName}` : '')))}
                                        >
                                          {bet.status === 'Partially Accepted' ? 'Complete Acceptance' : 'Accept'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateSideBetStatusMutation.mutate({ id: bet.id, status: 'Declined' })}
                                          className="text-red-600 hover:text-red-700 border-red-600"
                                        >
                                          Decline
                                        </Button>
                                      </div>
                                    ) : bet.betterName === (user ? `${user.firstName} ${user.lastName}` : '') || 
                                           bet.betterTeammate === (user ? `${user.firstName} ${user.lastName}` : '') ? (
                                      <div className="flex items-center space-x-1">
                                        <Bell className="w-4 h-4 text-yellow-500" />
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          {bet.status === 'Partially Accepted' ? 'Partially Accepted' : 'Waiting for response'}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-800">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {bet.status === 'Partially Accepted' ? 'Partially Accepted' : 'Pending'}
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  // Individual bet acceptance logic (unchanged)
                                  <>
                                    {bet.opponentName === (user ? `${user.firstName} ${user.lastName}` : '') ? (
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateSideBetStatusMutation.mutate({ id: bet.id, status: 'Accepted' })}
                                          className="text-green-600 hover:text-green-700 border-green-600"
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateSideBetStatusMutation.mutate({ id: bet.id, status: 'Declined' })}
                                          className="text-red-600 hover:text-red-700 border-red-600"
                                        >
                                          Decline
                                        </Button>
                                      </div>
                                    ) : bet.betterName === (user ? `${user.firstName} ${user.lastName}` : '') ? (
                                      <div className="flex items-center space-x-1">
                                        <Bell className="w-4 h-4 text-yellow-500" />
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Waiting for response
                                        </Badge>
                                      </div>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-800">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                            {bet.status === 'Accepted' && (
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-1">
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Accepted
                                  </Badge>
                                  {bet.result !== 'Pending' && getResultBadge(bet.result)}
                                </div>
                                
                                {bet.result === 'Pending' && (bet.readyForResolution || bet.witnessVotes) && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Users className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                        Witness Voting
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => witnessVoteMutation.mutate({ id: bet.id, winnerName: bet.betterName })}
                                        className="text-green-600 hover:text-green-700 border-green-300"
                                        disabled={witnessVoteMutation.isPending}
                                      >
                                        <Vote className="w-3 h-3 mr-1" />
                                        {bet.betterName} Won
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => witnessVoteMutation.mutate({ id: bet.id, winnerName: bet.opponentName })}
                                        className="text-green-600 hover:text-green-700 border-green-300"
                                        disabled={witnessVoteMutation.isPending}
                                      >
                                        <Vote className="w-3 h-3 mr-1" />
                                        {bet.opponentName} Won
                                      </Button>
                                    </div>
                                    
                                    {bet.witnessVotes && Object.keys(bet.witnessVotes).length > 0 && (
                                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>Votes: {Object.keys(bet.witnessVotes).length}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                          {Object.entries(bet.witnessVotes).map(([witness, winner]) => (
                                            <span key={witness} className="text-xs">
                                              {witness}: {winner}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            {bet.status === 'Declined' && (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Declined
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Declined Challenges Section - Pussy Boys Hall of Shame */}
      {sideBets.filter((bet: SideBet) => bet.status === 'Declined' || bet.status?.startsWith('Auto-declined')).length > 0 && (
        <Card className="shadow-lg border-red-200 bg-red-50 dark:bg-red-950/20 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600 font-bold text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Pussy Boys Hall of Shame
              <AlertTriangle className="w-6 h-6" />
            </CardTitle>
            <p className="text-center text-red-600 font-medium">
              These cowards declined challenges and deserve public shame!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sideBets
                .filter((bet: SideBet) => bet.status === 'Declined' || bet.status?.startsWith('Auto-declined'))
                .map((bet: SideBet) => (
                  <div key={bet.id} className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-300 dark:border-red-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <ProfilePicture 
                            firstName={bet.opponentName.split(' ')[0]} 
                            lastName={bet.opponentName.split(' ')[1] || ''} 
                            size="lg"
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🐱</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-red-800 dark:text-red-300 text-lg">
                            {bet.opponentName} is a PUSSY!
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-sm">
                            {bet.status?.startsWith('Auto-declined') ? 
                              `Missed deadline for ${bet.betterName}'s $${bet.amount} challenge` :
                              `Declined ${bet.betterName}'s $${bet.amount} challenge`
                            }
                          </p>
                          <p className="text-red-500 dark:text-red-500 text-xs italic">
                            "{bet.condition}"
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-600 text-white">
                          Round {bet.round}
                        </Badge>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Declined ${bet.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
