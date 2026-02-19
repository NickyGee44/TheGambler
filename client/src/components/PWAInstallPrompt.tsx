import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Smartphone, Monitor, Share, Plus } from "lucide-react";

interface PWAInstallPromptProps {
  onDismiss: () => void;
}

export default function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onDismiss();
      }
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Share className="w-5 h-5 text-blue-600" />
            <span>1. Tap the Share button at the bottom</span>
          </div>
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>2. Select "Add to Home Screen"</span>
          </div>
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span>3. Tap "Add" to install the app</span>
          </div>
        </div>
      );
    } else if (isAndroid) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-green-600" />
            <span>1. Tap the menu (⋮) in your browser</span>
          </div>
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-green-600" />
            <span>2. Select "Add to Home screen"</span>
          </div>
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <span>3. Tap "Add" to install the app</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-600" />
            <span>1. Look for the install icon in your browser's address bar</span>
          </div>
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>2. Click "Install" when prompted</span>
          </div>
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span>3. The app will be added to your desktop</span>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] z-50 shadow-xl border-golf-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/gambler-logo.png" 
              alt="The Gambler Cup Logo" 
              className="w-8 h-8 rounded-full"
            />
            <div>
              <CardTitle className="text-sm font-semibold text-golf-green-600">
                Install The Gambler Cup
              </CardTitle>
              <CardDescription className="text-xs">
                Get the full app experience
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {getInstallInstructions()}
        
        <div className="mt-4 space-y-2">
          {deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white"
              size="sm"
            >
              Install Now
            </Button>
          )}
          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}