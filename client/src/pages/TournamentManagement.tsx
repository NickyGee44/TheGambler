import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Edit,
  Crown,
  Archive,
  ChevronDown,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tournament } from "@shared/schema";

interface TournamentFormData {
  year: number;
  name: string;
  courses: string[];
  startDate: string;
  endDate: string;
  location: string;
  champions?: string[];
}

interface ChampionSelectionState {
  isOpen: boolean;
  tournamentYear: number;
  selectedTeam: string;
  selectedPlayers: string[];
}

export default function TournamentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showNewTournamentForm, setShowNewTournamentForm] = useState(false);
  const [formData, setFormData] = useState<TournamentFormData>({
    year: new Date().getFullYear() + 1,
    name: "",
    courses: [],
    startDate: "",
    endDate: "",
    location: "",
    champions: []
  });
  const [championSelection, setChampionSelection] = useState<ChampionSelectionState>({
    isOpen: false,
    tournamentYear: 0,
    selectedTeam: "",
    selectedPlayers: []
  });
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  // Check if user has admin privileges
  const isAdmin = user && ['Nick Grossi', 'Connor Patterson'].includes(`${user.firstName} ${user.lastName}`);

  // Fetch all tournaments
  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch active tournament
  const { data: activeTournament } = useQuery<Tournament>({
    queryKey: ['/api/tournaments/active'],
  });

  const { data: inviteCodeData } = useQuery<{ inviteCode: string }>({
    queryKey: ["/api/admin/invite-code"],
  });

  // Fetch teams and players for champion selection
  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/teams'],
    enabled: championSelection.isOpen
  });

  const { data: players = [] } = useQuery<any[]>({
    queryKey: ['/api/players'],
    enabled: championSelection.isOpen
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: TournamentFormData) => {
      const payload = {
        ...tournamentData,
        startDate: new Date(tournamentData.startDate),
        endDate: new Date(tournamentData.endDate),
        isActive: false
      };
      return await apiRequest('POST', '/api/tournaments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Success",
        description: "Tournament created successfully",
      });
      setShowNewTournamentForm(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tournament",
        variant: "destructive",
      });
    }
  });

  // Activate tournament mutation
  const activateTournamentMutation = useMutation({
    mutationFn: async (year: number) => {
      return await apiRequest('POST', `/api/tournaments/${year}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments/active'] });
      toast({
        title: "Success",
        description: "Tournament activated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to activate tournament",
        variant: "destructive",
      });
    }
  });

  // Update tournament mutation
  const updateTournamentMutation = useMutation({
    mutationFn: async ({ year, updateData }: { year: number; updateData: Partial<Tournament> }) => {
      return await apiRequest('PUT', `/api/tournaments/${year}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Success",
        description: "Tournament updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive",
      });
    }
  });

  const updateInviteCodeMutation = useMutation({
    mutationFn: async (nextCode: string) => {
      return apiRequest("PUT", "/api/admin/invite-code", { inviteCode: nextCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invite-code"] });
      setInviteCodeInput("");
      toast({
        title: "Success",
        description: "Invite code updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invite code",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear() + 1,
      name: "",
      courses: [],
      startDate: "",
      endDate: "",
      location: "",
      champions: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createTournamentMutation.mutate(formData);
  };

  const handleCoursesChange = (courses: string) => {
    setFormData({
      ...formData,
      courses: courses.split(',').map(course => course.trim()).filter(Boolean)
    });
  };

  const handleChampionsChange = (champions: string) => {
    setFormData({
      ...formData,
      champions: champions.split(',').map(champion => champion.trim()).filter(Boolean)
    });
  };

  const setChampions = (year: number, champions: string[]) => {
    updateTournamentMutation.mutate({
      year,
      updateData: { champions }
    });
  };

  const openChampionSelection = (year: number) => {
    setChampionSelection({
      isOpen: true,
      tournamentYear: year,
      selectedTeam: "",
      selectedPlayers: []
    });
  };

  const closeChampionSelection = () => {
    setChampionSelection({
      isOpen: false,
      tournamentYear: 0,
      selectedTeam: "",
      selectedPlayers: []
    });
  };

  const handleTeamSelection = (teamId: string) => {
    const selectedTeamData = (teams as any[]).find((team: any) => team.id.toString() === teamId);
    if (selectedTeamData) {
      setChampionSelection(prev => ({
        ...prev,
        selectedTeam: teamId,
        selectedPlayers: [selectedTeamData.player1Name, selectedTeamData.player2Name]
      }));
    }
  };

  const handlePlayerToggle = (playerName: string) => {
    setChampionSelection(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerName)
        ? prev.selectedPlayers.filter(p => p !== playerName)
        : [...prev.selectedPlayers, playerName]
    }));
  };

  const saveChampions = () => {
    if (championSelection.selectedPlayers.length > 0) {
      setChampions(championSelection.tournamentYear, championSelection.selectedPlayers);
      closeChampionSelection();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 mb-4">
                <Settings className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-300">Only tournament administrators can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-400 mx-auto mb-4"></div>
            <p>Loading tournaments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-golf-green-400" />
                Tournament Management
              </h1>
              <p className="text-gray-300">Manage multi-year tournaments and settings</p>
            </div>
            <Button 
              onClick={() => setShowNewTournamentForm(true)}
              className="bg-golf-green-400 hover:bg-golf-green-500 text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Tournament
            </Button>
          </div>
        </div>

        {/* Active Tournament Banner */}
        {activeTournament && (
          <Card className="bg-gradient-to-r from-golf-green-400/20 to-golf-green-600/20 border-golf-green-400/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-golf-green-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Active Tournament</h3>
                    <p className="text-golf-green-400 font-medium">{activeTournament.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-golf-green-400 border-golf-green-400 mb-2">
                    {activeTournament.year}
                  </Badge>
                  <p className="text-sm text-gray-300">{activeTournament.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Invite Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-300">
              Current code: <span className="font-semibold text-golf-green-400">{inviteCodeData?.inviteCode ?? "Loading..."}</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Set new invite code"
                className="bg-gray-900/50 border-gray-600 text-white"
              />
              <Button
                onClick={() => updateInviteCodeMutation.mutate(inviteCodeInput.trim())}
                disabled={!inviteCodeInput.trim() || updateInviteCodeMutation.isPending}
                className="bg-golf-green-400 hover:bg-golf-green-500 text-black"
              >
                Save Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tournament List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {tournament.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {tournament.isActive && (
                      <Badge className="bg-golf-green-400 text-black">Active</Badge>
                    )}
                    <Badge variant="outline" className="text-golf-green-400 border-golf-green-400">
                      {tournament.year}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4" />
                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4" />
                    {tournament.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4" />
                    {tournament.courses.join(', ')}
                  </div>
                  {tournament.champions && tournament.champions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">Champions: {tournament.champions.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  {!tournament.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Crown className="w-4 h-4 mr-2" />
                          Activate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Activate Tournament</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will make {tournament.name} the active tournament and deactivate all others.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => activateTournamentMutation.mutate(tournament.year)}>
                            Activate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openChampionSelection(tournament.year)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Set Champions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Champion Selection Dialog */}
        <AlertDialog open={championSelection.isOpen} onOpenChange={(open) => !open && closeChampionSelection()}>
          <AlertDialogContent className="sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Set Tournament Champions
              </AlertDialogTitle>
              <AlertDialogDescription>
                Select the winning team or individual champions for {championSelection.tournamentYear}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Winning Team</Label>
                <Select value={championSelection.selectedTeam} onValueChange={handleTeamSelection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(teams as any[]).map((team: any) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        Team {team.teamNumber}: {team.player1Name} & {team.player2Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {championSelection.selectedTeam && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Champions (select individual players)</Label>
                  <div className="space-y-2">
                    {(teams as any[]).find((team: any) => team.id.toString() === championSelection.selectedTeam) && (
                      <>
                        {[(teams as any[]).find((team: any) => team.id.toString() === championSelection.selectedTeam)?.player1Name,
                          (teams as any[]).find((team: any) => team.id.toString() === championSelection.selectedTeam)?.player2Name].map((playerName: string) => (
                          <div key={playerName} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={playerName}
                              checked={championSelection.selectedPlayers.includes(playerName)}
                              onChange={() => handlePlayerToggle(playerName)}
                              className="rounded border-gray-300 text-golf-green-600 focus:ring-golf-green-500"
                            />
                            <label htmlFor={playerName} className="text-sm">
                              {playerName}
                            </label>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select both players if the entire team won, or individual players for specific achievements.
                  </p>
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeChampionSelection}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={saveChampions}
                disabled={championSelection.selectedPlayers.length === 0}
                className="bg-golf-green-600 hover:bg-golf-green-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Set Champions
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* New Tournament Form */}
        {showNewTournamentForm && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Tournament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-white">Tournament Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      min={2020}
                      max={2050}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-white">Tournament Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      placeholder="e.g., The Gambler Cup 2026"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-gray-900/50 border-gray-600 text-white"
                    placeholder="e.g., Muskoka, Ontario"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="courses" className="text-white">Golf Courses</Label>
                  <Input
                    id="courses"
                    value={formData.courses.join(', ')}
                    onChange={(e) => handleCoursesChange(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white"
                    placeholder="e.g., Deerhurst Highlands, Muskoka Bay Golf Club"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-white">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-white">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-gray-900/50 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="champions" className="text-white">Champions (optional)</Label>
                  <Input
                    id="champions"
                    value={formData.champions?.join(', ') || ''}
                    onChange={(e) => handleChampionsChange(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white"
                    placeholder="e.g., Nick Grossi, Connor Patterson"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="bg-golf-green-400 hover:bg-golf-green-500 text-black font-medium"
                    disabled={createTournamentMutation.isPending}
                  >
                    {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowNewTournamentForm(false);
                      resetForm();
                    }}
                    className="text-white border-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
