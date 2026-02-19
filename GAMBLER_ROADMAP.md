# TheGambler — Improvement Roadmap

**App:** Golf tournament tracker for the annual Gambler Cup
**Live:** https://the-gambler-five.vercel.app
**DB:** Supabase (migrated from Neon/Replit, Feb 19 2026)
**Stack:** React 18 + TypeScript + Vite | Express + Drizzle ORM | PostgreSQL

---

## Status (Feb 19 2026)

- ✅ DB migrated to Supabase
- ✅ Vercel env vars set (DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, REPL_ID)
- ⚠️ API routes returning 404 — needs vercel.json (in progress)
- ⚠️ replitAuth.ts hardcodes Replit startup check — needs decoupling
- ⚠️ WebSockets not compatible with Vercel serverless — needs polling fallback or platform switch
- ⏳ Replit → GitHub sync in progress (latest code may differ from local clone)

## Priority Queue

### 🔴 P0 — Get it live and working
1. Add `vercel.json` to route all requests through Express server
2. Replace/refactor `replitAuth.ts` to not throw on non-Replit environments
3. Verify Supabase session store (`connect-pg-simple`) works on Vercel cold starts
4. Confirm login works end-to-end

### 🟠 P1 — Reliability
5. Replace WebSocket live updates with TanStack Query polling (Vercel-compatible)
6. Add error boundaries on key pages
7. Add Google Maps API key to Vercel env (get from Nick)

### 🟡 P2 — UX improvements
8. Mobile score entry UX (tournament is phone-heavy)
9. Offline PWA caching improvements
10. Photo upload reliability check

### 🟢 P3 — Features for 2026 tournament
11. Multi-year tournament support (2025 data preserved, 2026 needs clean slate)
12. Admin panel for setting up new tournament year
13. Boozelympics leaderboard improvements
14. "Pussy Boys Hall of Shame" — confirm still working

## Known Data
- 15 players, 7 teams, 2 tournaments in Supabase
- 686 hole scores migrated
- 27 match play matches, 14 side bets, 6 chat messages

## Summer 2026 Target
Tournament is summer 2026. App needs to be stable and mobile-friendly by then.
Nick needs: working login, score entry, leaderboard, side bets.

---
_Last updated: 2026-02-19 by Nova_
