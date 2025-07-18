import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Database, Zap, Users, Camera, Trophy, Target } from "lucide-react";

export default function MockDataGenerator() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const generateMockDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/generate-mock-data', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Mock Data Generated",
        description: "All tournament data has been populated with realistic mock data",
      });
      
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/live-scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sidebets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/player-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate mock data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateMockData = () => {
    generateMockDataMutation.mutate();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Database className="w-4 h-4 mr-2" />
          Generate Mock Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-600 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Generate Tournament Mock Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">What will be generated:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Target className="w-4 h-4 text-golf-green-600" />
                <span>Complete hole scores for all 16 players across 3 rounds (864 total scores)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Trophy className="w-4 h-4 text-golf-gold-500" />
                <span>Realistic side bets with various statuses and outcomes</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Tournament photo gallery with sample images</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-green-600" />
                <span>Statistics and leaderboard data for all players</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> This will replace all existing tournament data with mock data. This action cannot be undone.
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleGenerateMockData}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={generateMockDataMutation.isPending}
            >
              <Database className="w-4 h-4 mr-2" />
              {generateMockDataMutation.isPending ? 'Generating...' : 'Generate Mock Data'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}