import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  Home,
  Trophy,
  Coins,
  BookOpen,
  Camera,
  Target,
  LogOut,
  BarChart3,
  Settings,
  Beer,
  MessageSquare,
  Calendar,
  Vote,
  Crosshair,
  ClipboardCheck,
} from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const isAuthenticated = !!user;

  const isAdmin = user && ["Nick Grossi", "Connor Patterson"].includes(`${user.firstName} ${user.lastName}`);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/scores", label: "Leaderboard", icon: Trophy },
    { href: "/scoring", label: "Scoring", icon: Target },
    { href: "/matchups", label: "Matchups", icon: Calendar },
    { href: "/sidebets", label: "Side Bets", icon: Coins },
    { href: "/trashtalk", label: "Trash Talk", icon: MessageSquare },
    { href: "/boozelympics", label: "Boozelympics", icon: Beer },
    { href: "/voting", label: "Voting", icon: Vote },
    { href: "/photos", label: "Photos", icon: Camera },
    { href: "/rules", label: "Rules", icon: BookOpen },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/registration", label: "Registration", icon: ClipboardCheck },
    { href: "/shot-tracker", label: "Shot Tracker", icon: Crosshair },
    ...(isAdmin
      ? [{ href: "/tournament-management", label: "Tournament Management", icon: Settings }]
      : []),
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[70] lg:hidden bg-gambler-black border-gambler-border text-foreground shadow-lg"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-gambler-black border-r border-gambler-border z-[60] transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 border-b border-gambler-border flex-shrink-0">
          <h1 className="text-xl font-black tracking-[0.2em] text-gambler-gold">🎰 THE GAMBLER</h1>
          <p className="text-xs tracking-[0.18em] text-muted-foreground mt-2">2026 CHAMPIONSHIP</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                      isActive
                        ? "border-gambler-green text-gambler-green bg-gambler-slate/50"
                        : "border-transparent text-muted-foreground hover:text-gambler-green hover:bg-gambler-slate/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {isAuthenticated && user && (
            <div className="mt-6 pt-4 border-t border-gambler-border">
              <div className="flex items-center gap-3 mb-3 p-3 bg-gambler-slate rounded-md border border-gambler-border">
                <ProfilePicture firstName={user.firstName} lastName={user.lastName} size="lg" />
                <div>
                  <div className="font-medium text-sm text-foreground">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">Tournament Player</div>
                </div>
              </div>

              <Button
                onClick={() => logoutMutation.mutate()}
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-red-500 hover:text-red-400 hover:bg-transparent"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          )}
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-[55] lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
