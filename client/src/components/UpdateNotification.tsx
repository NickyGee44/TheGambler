import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, X } from "lucide-react";

interface UpdateNotificationProps {
  onDismiss: () => void;
}

export default function UpdateNotification({ onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = () => {
    // Send message to service worker to skip waiting
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload the page to get the latest version
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className="w-80 shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Update Available
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            A new version of The Gambler Cup app is available
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              className="flex-1"
              size="sm"
            >
              Update Now
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              size="sm"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}