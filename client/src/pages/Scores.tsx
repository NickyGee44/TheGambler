import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { isUnauthorizedError } from "@/lib/authUtils";
import { RefreshCw, Edit, Trophy, Medal, Award, Wifi, WifiOff } from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

export default function Scores() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [scoreValue, setScoreValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userTeamId, setUserTeamId] = useState<number | null>(null);
  const { toast } = useToast();
  const { isOnline } = useOfflineStorage();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);
  
  const { data: scores = [], isLoading: scoresLoading, refetch } = useQuery({
    queryKey: ['/api/scores'],
    refetchInterval: 30000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
  });

  // WebSocket for real-time updates
  useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATE') {
        queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
        toast({
          title: "Score Updated",
          description: `Team ${data.data.teamId} score has been updated`,
        });
      }
    }
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, round, score }: { teamId: number; round: number; score: number }) => {
      return await apiRequest('POST', '/api/scores', { teamId, round, score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
      toast({
        title: "Score Updated",
        description: "The score has been successfully updated",
      });
      setIsDialogOpen(false);
      setSelectedTeam("");
      setSelectedRound("");
      setScoreValue("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedRound || !scoreValue) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateScoreMutation.mutate({
      teamId: parseInt(selectedTeam),
      round: parseInt(selectedRound),
      score: parseInt(scoreValue),
    });
  };

  const getRankBadge = (rank: number) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
    
    if (rank === 1) {
      return (
        <Badge className={`${baseClasses} bg-golf-gold-100 text-golf-gold-800`}>
          <Trophy className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <Medal className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className={`${baseClasses} bg-orange-100 text-orange-800`}>
          <Award className="w-3 h-3 mr-1" />
          #{rank}
        </Badge>
      );
    } else {
      return (
        <span className="text-gray-500 dark:text-gray-400">
          #{rank}
        </span>
      );
    }
  };

  if (isLoading || scoresLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-golf-green-600 mb-2">Live Scores</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time tournament standings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center text-sm">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 mr-1 text-green-500" />
                <span className="text-green-500">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1 text-orange-500" />
                <span className="text-orange-500">Offline</span>
              </>
            )}
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {/* Only show edit button for Nick Grossi and Connor Patterson */}
          {user && ((user.firstName === 'Nick' && user.lastName === 'Grossi') || (user.firstName === 'Connor' && user.lastName === 'Patterson')) && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-golf-gold-500 hover:bg-golf-gold-600 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Scores
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-golf-green-600">Update Score</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="team">Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team: any) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          Team {team.teamNumber} ({team.player1Name} & {team.player2Name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="round">Round</Label>
                  <Select value={selectedRound} onValueChange={setSelectedRound}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Round 1</SelectItem>
                      <SelectItem value="2">Round 2</SelectItem>
                      <SelectItem value="3">Round 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    placeholder="72"
                    className="focus:ring-golf-green-500 focus:border-golf-green-500"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
                    disabled={updateScoreMutation.isPending}
                  >
                    {updateScoreMutation.isPending ? 'Updating...' : 'Update Score'}
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
          )}
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Scores are automatically calculated from hole-by-hole rounds played by each team. 
          Only Nick Grossi and Connor Patterson can manually adjust scores if needed.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-golf-green-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 1</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 2</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Round 3</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-golf-green-600 dark:text-golf-green-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {scores.map((score: any) => (
                  <tr key={score.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">{getRankBadge(score.rank)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">Team {score.team.teamNumber}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <ProfilePicture 
                            firstName={score.team.player1Name.split(' ')[0]} 
                            lastName={score.team.player1Name.split(' ')[1] || ''} 
                            size="sm"
                          />
                          <span>{score.team.player1Name}</span>
                        </div>
                        <span>&</span>
                        <div className="flex items-center gap-2">
                          <ProfilePicture 
                            firstName={score.team.player2Name.split(' ')[0]} 
                            lastName={score.team.player2Name.split(' ')[1] || ''} 
                            size="sm"
                          />
                          <span>{score.team.player2Name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{score.round1 || '-'}</td>
                    <td className="px-6 py-4 text-center font-medium">{score.round2 || '-'}</td>
                    <td className="px-6 py-4 text-center font-medium">{score.round3 || '-'}</td>
                    <td className="px-6 py-4 text-center font-bold text-golf-green-600">{score.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
