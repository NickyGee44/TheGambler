import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu, X, Home, Trophy, Coins, BookOpen, Camera, Target, LogOut,
  BarChart3, Settings, Beer, MessageSquare, Calendar, Vote, ClipboardCheck, ChevronRight,
} from "lucide-react";
import ProfilePicture from "@/components/ProfilePicture";

const ALL_NAV_LINKS = [
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
];

const BOTTOM_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scoring", label: "Score", icon: Target },
  { href: "/scores", label: "Board", icon: Trophy },
  { href: "/sidebets", label: "Bets", icon: Coins },
];

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const isAuthenticated = !!user;
  const isAdmin = user && ["Nick Grossi", "Connor Patterson"].includes(`${user.firstName} ${user.lastName}`);

  const navLinks = [
    ...ALL_NAV_LINKS,
    ...(isAdmin ? [{ href: "/tournament-management", label: "Tournament Mgmt", icon: Settings }] : []),
  ];

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <nav className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r border-gambler-border bg-gambler-black lg:flex">
        {/* Logo */}
        <div className="flex-shrink-0 border-b border-gambler-border px-5 py-5">
          <p className="text-lg font-black tracking-[0.22em] text-gambler-gold">🎰 THE GAMBLER</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] text-muted-foreground">2026 CHAMPIONSHIP</p>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gambler-green/15 text-gambler-green"
                        : "text-muted-foreground hover:bg-gambler-slate/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-gambler-green" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <span>{link.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-3 w-3 text-gambler-green" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User profile */}
        {isAuthenticated && user && (
          <div className="flex-shrink-0 border-t border-gambler-border p-3">
            <div className="mb-2 flex items-center gap-3 rounded-md bg-gambler-slate/60 p-3">
              <ProfilePicture firstName={user.firstName} lastName={user.lastName} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">Tournament Player</p>
              </div>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        )}
      </nav>

      {/* ── Mobile: Top bar + slide-out drawer ──────────── */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gambler-border bg-gambler-black/95 px-4 backdrop-blur-sm lg:hidden">
        <p className="text-sm font-black tracking-[0.2em] text-gambler-gold">🎰 GAMBLER</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gambler-border bg-gambler-black transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-gambler-border px-5 py-4">
          <p className="text-base font-black tracking-[0.2em] text-gambler-gold">🎰 THE GAMBLER</p>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gambler-green/15 text-gambler-green"
                        : "text-muted-foreground hover:bg-gambler-slate/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {isAuthenticated && user && (
          <div className="border-t border-gambler-border p-3">
            <div className="mb-2 flex items-center gap-3 rounded-md bg-gambler-slate/60 p-3">
              <ProfilePicture firstName={user.firstName} lastName={user.lastName} size="lg" />
              <div>
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">Tournament Player</p>
              </div>
            </div>
            <Button
              onClick={() => { logoutMutation.mutate(); setIsOpen(false); }}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-gambler-border bg-gambler-black/95 backdrop-blur-sm lg:hidden">
        {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-gambler-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-gambler-gold" />}
            </Link>
          );
        })}
        {/* More button triggers drawer */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-semibold tracking-wide">More</span>
        </button>
      </nav>
    </>
  );
}
