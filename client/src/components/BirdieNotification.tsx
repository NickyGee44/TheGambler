import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Star, Trophy } from "lucide-react";

interface BirdieNotificationProps {
  playerName: string;
  holeNumber: number;
  scoreName: string;
  onDismiss: () => void;
}

export default function BirdieNotification({ 
  playerName, 
  holeNumber, 
  scoreName, 
  onDismiss 
}: BirdieNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-dismiss after 8 seconds
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const getScoreIcon = () => {
    if (scoreName === "Albatross") return <Trophy className="h-6 w-6 text-purple-400" />;
    if (scoreName === "Eagle") return <Star className="h-6 w-6 text-yellow-400" />;
    return <Star className="h-6 w-6 text-green-400" />;
  };

  const getScoreColor = () => {
    if (scoreName === "Albatross") return "from-purple-500 to-purple-600";
    if (scoreName === "Eagle") return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className={`w-80 shadow-xl border-2 bg-gradient-to-r ${getScoreColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getScoreIcon()}
              <h3 className="text-lg font-bold text-white">
                {scoreName}!
              </h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-white">
            <p className="font-semibold">
              {playerName} scored a {scoreName.toLowerCase()} on Hole {holeNumber}!
            </p>
            <p className="text-sm text-white/90 mt-1">
              Great shot! 🎯
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}