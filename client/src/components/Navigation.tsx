import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Home, Users, Trophy, Coins, BookOpen, Camera, Target, Award, Moon, Sun, LogOut, BarChart3, Settings, Beer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import ProfilePicture from "@/components/ProfilePicture";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const isAuthenticated = !!user;

  const { data: scores } = useQuery({
    queryKey: ['/api/scores'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const topTeams = scores?.slice(0, 3) || [];

  const isAdmin = user && ['Nick Grossi', 'Connor Patterson'].includes(`${user.firstName} ${user.lastName}`);
  
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/round1", label: "Round 1", icon: Target },
    { href: "/round2", label: "Round 2", icon: Target },
    { href: "/round3", label: "Round 3", icon: Target },
    { href: "/scores", label: "Scores", icon: Trophy },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
    { href: "/sidebets", label: "Side Bets", icon: Coins },
    { href: "/boozelympics", label: "Boozelympics", icon: Beer },
    { href: "/rules", label: "Rules", icon: BookOpen },
    { href: "/photos", label: "Photos", icon: Camera },
    ...(isAdmin ? [{ href: "/tournament-management", label: "Tournament Management", icon: Settings }] : []),
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[70] lg:hidden bg-white dark:bg-slate-800 shadow-lg"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Navigation Sidebar */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-xl z-[60] transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/gambler-logo.png" 
              alt="The Gambler Cup Logo" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-golf-green-600">The Gambler Cup</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">2025 Championship</p>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
            
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'text-golf-green-600 bg-golf-green-50 dark:bg-slate-700'
                          : 'hover:bg-golf-green-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* User Profile Section */}
            {isAuthenticated && user && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4 p-3 bg-golf-green-50 dark:bg-slate-700 rounded-lg">
                  <ProfilePicture 
                    firstName={user.firstName} 
                    lastName={user.lastName} 
                    size="lg"
                  />
                  <div>
                    <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tournament Player</div>
                  </div>
                </div>
                
                <Button
                  onClick={() => logoutMutation.mutate()}
                  variant="outline"
                  className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-600"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mini Leaderboard - Fixed at bottom */}
        <div className="p-4 flex-shrink-0 border-t border-gray-200 dark:border-slate-700">
          <div className="bg-golf-green-50 dark:bg-slate-700 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-3 text-golf-green-600">Live Leaderboard</h3>
            <div className="space-y-2 text-sm">
              {topTeams.map((score, index) => (
                <div key={score.id} className="flex justify-between items-center">
                  <span className="font-medium flex items-center">
                    {index === 0 && <Trophy className="w-3 h-3 mr-1 text-golf-gold-500" />}
                    Team {score.team.teamNumber}
                  </span>
                  <Badge variant="outline" className="text-golf-gold-500 font-bold">
                    {score.totalScore}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
