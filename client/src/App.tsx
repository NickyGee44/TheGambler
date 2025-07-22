import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Teams from "@/pages/Teams";
import Scores from "@/pages/Scores";
import Stats from "@/pages/Stats";
import PlayerProfile from "@/pages/PlayerProfile";
import TournamentManagement from "@/pages/TournamentManagement";
import Boozelympics from "@/pages/Boozelympics";
import SideBets from "@/pages/SideBets";
import Rules from "@/pages/Rules";
import Photos from "@/pages/Photos";
import Round1 from "@/pages/Round1";
import Round2 from "@/pages/Round2";
import Round3 from "@/pages/Round3";
import Round3Matchups from "@/pages/Round3Matchups";
import TestRound from "@/pages/TestRound";
import AuthPage from "@/pages/AuthPage";
import PictureAssignment from "@/pages/PictureAssignment";
import NotFound from "@/pages/not-found";
import UpdateNotification from "@/components/UpdateNotification";
import BirdieNotification from "@/components/BirdieNotification";
import { useEffect, useState } from "react";
import React from "react";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log additional debugging information
    console.log('Error details:', {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">There was an error loading the app.</p>
            <button 
              onClick={() => {
                // Clear localStorage to reset state
                try {
                  localStorage.clear();
                } catch (e) {
                  console.warn('Failed to clear localStorage:', e);
                }
                window.location.reload();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded mr-2"
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                // Hard refresh to clear all cached resources
                window.location.href = window.location.href;
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
            >
              Hard Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { user, isLoading } = useAuth();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [birdieNotification, setBirdieNotification] = useState<{
    playerName: string;
    holeNumber: number;
    scoreName: string;
  } | null>(null);

  useEffect(() => {
    // Listen for service worker updates
    const handleSWUpdate = () => {
      setShowUpdateNotification(true);
    };

    // Listen for birdie notifications
    const handleBirdieNotification = (event: CustomEvent) => {
      const { playerName, holeNumber, scoreName } = event.detail;
      setBirdieNotification({ playerName, holeNumber, scoreName });
    };

    window.addEventListener('sw-update-available', handleSWUpdate);
    window.addEventListener('birdie-notification', handleBirdieNotification as EventListener);
    
    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
      window.removeEventListener('birdie-notification', handleBirdieNotification as EventListener);
    };
  }, []);

  const handleUpdateNotificationDismiss = () => {
    setShowUpdateNotification(false);
  };

  const handleBirdieNotificationDismiss = () => {
    setBirdieNotification(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!user ? (
          <Route path="/" component={AuthPage} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/teams" component={Teams} />
            <Route path="/round1" component={Round1} />
            <Route path="/round2" component={Round2} />
            <Route path="/round3" component={Round3} />
            <Route path="/test-round" component={TestRound} />
            <Route path="/scores" component={Scores} />
            <Route path="/stats" component={Stats} />
            <Route path="/player/:userId" component={PlayerProfile} />
            <Route path="/tournament-management" component={TournamentManagement} />
            <Route path="/sidebets" component={SideBets} />
            <Route path="/boozelympics" component={Boozelympics} />
            <Route path="/rules" component={Rules} />
    
            <Route path="/photos" component={Photos} />
            <Route path="/round3-matchups" component={Round3Matchups} />
            <Route path="/admin/picture-assignment" component={PictureAssignment} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      

      
      {/* Update Notification */}
      {showUpdateNotification && (
        <UpdateNotification onDismiss={handleUpdateNotificationDismiss} />
      )}
      
      {/* Birdie Notification */}
      {birdieNotification && (
        <BirdieNotification 
          playerName={birdieNotification.playerName}
          holeNumber={birdieNotification.holeNumber}
          scoreName={birdieNotification.scoreName}
          onDismiss={handleBirdieNotificationDismiss}
        />
      )}
    </>
  );
}

function App() {
  useEffect(() => {
    // Add manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Add theme color meta tag
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#059669';
    document.head.appendChild(themeColorMeta);

    // Add viewport meta tag for PWA
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);

    // Add apple-touch-icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/icons/icon-192x192.png';
    document.head.appendChild(appleTouchIcon);

    // Set title
    document.title = 'The Gambler Cup 2025';
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
