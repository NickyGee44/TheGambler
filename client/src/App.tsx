import { Switch, Route, useLocation } from "wouter";
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
import Scoring from "@/pages/Scoring";
import Round3Matchups from "@/pages/Round3Matchups";
import TournamentMatchups from "@/pages/TournamentMatchups";
import Registration from "@/pages/Registration";
import Voting from "@/pages/Voting";
import TrashTalk from "@/pages/TrashTalk";

import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";
import UpdateNotification from "@/components/UpdateNotification";
import BirdieNotification from "@/components/BirdieNotification";
import TrashTalkWidget from "@/components/TrashTalkWidget";
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

function RedirectToScoring({ tab }: { tab: "1" | "2" | "3" }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(`/scoring?tab=${tab}`);
  }, [navigate, tab]);

  return null;
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

  // Show loading only if we're actively checking and have already found a user
  if (isLoading && user) {
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
            <Route path="/round1">{() => <RedirectToScoring tab="1" />}</Route>
            <Route path="/round2">{() => <RedirectToScoring tab="2" />}</Route>
            <Route path="/round3">{() => <RedirectToScoring tab="3" />}</Route>
            <Route path="/scoring" component={Scoring} />

            <Route path="/scores" component={Scores} />
            <Route path="/stats" component={Stats} />
            <Route path="/player/:userId" component={PlayerProfile} />
            <Route path="/tournament-management" component={TournamentManagement} />
            <Route path="/sidebets" component={SideBets} />
            <Route path="/trashtalk" component={TrashTalk} />
            <Route path="/registration" component={Registration} />
            <Route path="/voting" component={Voting} />
            <Route path="/boozelympics" component={Boozelympics} />
            <Route path="/rules" component={Rules} />
    
            <Route path="/photos" component={Photos} />
            <Route path="/matchups" component={TournamentMatchups} />
            <Route path="/round3-matchups" component={Round3Matchups} />

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
      
      {/* Trash Talk Widget */}
      <TrashTalkWidget />
    </>
  );
}

function App() {
  useEffect(() => {
    document.title = 'The Gambler 2026';
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
