import Navigation from "./Navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{position: 'relative', height: 'auto'}}>


      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg flex items-center">
            <WifiOff className="w-4 h-4 mr-2" />
            Offline mode - Changes will sync when connection is restored
          </div>
        </div>
      )}

      {user && <Navigation />}
      
      <main className={user ? "lg:ml-64 page-container" : "page-container"}>
        <div className="w-full mobile-scroll-fix">
          {children}
        </div>
      </main>
    </div>
  );
}
