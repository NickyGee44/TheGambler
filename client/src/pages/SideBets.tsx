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
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { Plus, DollarSign, CheckCircle, XCircle, Clock, Bell, AlertTriangle } from "lucide-react";
import { SideBet } from "@shared/schema";
import ProfilePicture from "@/components/ProfilePicture";

export default function SideBets() {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: sideBets = [], isLoading } = useQuery({
    queryKey: ['/api/sidebets'],
    refetchInterval: 30000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
  });

  // WebSocket for real-time updates
  useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'SIDE_BET_CREATED' || data.type === 'SIDE_BET_UPDATE' || data.type === 'SIDE_BET_STATUS_UPDATE') {
        queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
        
        if (data.type === 'SIDE_BET_CREATED') {
          const bet = data.data;
          const currentUserName = user ? `${user.firstName} ${user.lastName}` : '';
          
          if (bet.opponentName === currentUserName) {
            toast({
              title: "🎯 New Challenge!",
              description: `${bet.betterName} has challenged you to a $${bet.amount} bet!`,
              variant: "default",
            });
          } else {
            toast({
              title: "New Side Bet Created",
              description: `${bet.betterName} challenged ${bet.opponentName} for $${bet.amount}`,
            });
          }
        } else if (data.type === 'SIDE_BET_STATUS_UPDATE') {
          const bet = data.data;
          const currentUserName = user ? `${user.firstName} ${user.lastName}` : '';
          
          if (bet.status === 'Declined') {
            toast({
              title: "🐱 PUSSY ALERT!",
              description: `${bet.opponentName} has declined ${bet.betterName}'s challenge and is a PUSSY!`,
              variant: "destructive",
            });
          } else if (bet.status === 'Accepted') {
            if (bet.betterName === currentUserName) {
              toast({
                title: "Challenge Accepted!",
                description: `${bet.opponentName} has accepted your $${bet.amount} challenge!`,
              });
            } else {
              toast({
                title: "Challenge Accepted",
                description: `${bet.opponentName} accepted ${bet.betterName}'s $${bet.amount} challenge!`,
              });
            }
          }
        } else {
          toast({
            title: "Side Bet Updated",
            description: "Side bet result updated",
          });
        }
      }
    }
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

  const resetForm = () => {
    setSelectedRound("");
    setOpponentName("");
    setAmount("");
    setCondition("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUserName = user ? `${user.firstName} ${user.lastName}` : '';
    
    if (!selectedRound || !opponentName || !amount || !condition) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

    createSideBetMutation.mutate({
      round: parseInt(selectedRound),
      betterName: currentUserName,
      opponentName,
      amount: parseInt(amount),
      condition,
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

  const getBetsByRound = (round: number) => {
    return sideBets.filter((bet: SideBet) => bet.round === round);
  };

  const roundTitles = {
    1: "Round 1 - Best Ball (Deerhurst)",
    2: "Round 2 - Scramble (Deerhurst)", 
    3: "Round 3 - Net Stroke Play (Muskoka Bay)",
  };

  const allPlayers = teams.flatMap((team: any) => [team.player1Name, team.player2Name]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {[1, 2, 3].map((round) => (
            <Card key={round} className="shadow-lg">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-golf-green-600 mb-2">Side Bets</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your wagers and challenges</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-golf-gold-500 hover:bg-golf-gold-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Place New Bet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-golf-green-600">Place New Bet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="round">Round</Label>
                <Select value={selectedRound} onValueChange={setSelectedRound}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Round 1 - Best Ball (Deerhurst)</SelectItem>
                    <SelectItem value="2">Round 2 - Scramble (Deerhurst)</SelectItem>
                    <SelectItem value="3">Round 3 - Net Stroke Play (Muskoka Bay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="better">Challenger</Label>
                <Input
                  id="better"
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
                    {allPlayers.map((player, index) => (
                      <SelectItem key={index} value={player}>{player}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
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
              
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="Better round score"
                  className="focus:ring-golf-green-500 focus:border-golf-green-500"
                />
              </div>
              
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
          <Card key={round} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-golf-green-600">
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
                    <div key={bet.id} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-golf-green-600 flex items-center gap-3">
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
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {bet.condition}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                          <span className="font-semibold text-golf-gold-500">
                            ${bet.amount}
                          </span>
                          <div className="flex items-center space-x-2">
                            {(bet.status === 'Pending' || !bet.status) && (
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
                            {bet.status === 'Accepted' && (
                              <div className="flex space-x-1">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accepted
                                </Badge>
                                {bet.result === 'Pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateSideBetMutation.mutate({ id: bet.id, result: 'Won' })}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      Won
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateSideBetMutation.mutate({ id: bet.id, result: 'Lost' })}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      Lost
                                    </Button>
                                  </>
                                )}
                                {bet.result !== 'Pending' && getResultBadge(bet.result)}
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

      {/* Declined Challenges Section */}
      {sideBets.filter((bet: SideBet) => bet.status === 'Declined').length > 0 && (
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
                .filter((bet: SideBet) => bet.status === 'Declined')
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
                            Declined {bet.betterName}'s ${bet.amount} challenge
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
