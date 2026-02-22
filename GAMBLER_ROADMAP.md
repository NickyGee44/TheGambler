# TheGambler — Improvement Roadmap (Updated 2026-02-22)

**App:** Golf tournament tracker for the annual Gambler Cup
**Live:** https://the-gambler-five.vercel.app (API crashing 500, fixing today)
**DB:** Supabase (migrated from Neon/Replit, Feb 19 2026)
**Stack:** React 18 + TypeScript + Vite | Express + Drizzle ORM | PostgreSQL

---

## Status (Feb 22 2026)

- ✅ DB migrated to Supabase
- ✅ Vercel env vars set (DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, REPL_ID)
- ✅ API routes fixed with vercel.json + pre-compiled JS (recent commits)
- 🔄 **Spawned claude agent to fix Vercel crash (replitAuth decoupling, WS→polling, E2E login test)**
- ⏳ Custom auth login verification pending
- ⚠️ WebSockets → TanStack Query polling (Vercel serverless)
- ⏳ Google Maps API key to Vercel env (Nick)

## Recent Git (top 10)
01402cc debug: minimal handler to verify @vercel/node works
2beb885 debug: surface real init error in response body
...

## Priority Queue

### 🔴 P0 — Get it live ✅ (mostly)
1. ✅ vercel.json routing
2. 🔄 Refactor replitAuth.ts → custom auth only (no Replit crash)
3. 🔄 Verify Supabase session store on Vercel cold starts
4. 🔄 **E2E login test on Vercel**

### 🟠 P1 — Reliability
5. 🔄 WS → TanStack Query polling
6. Add error boundaries (client has)
7. Google Maps API key (Nick)

### 🟡 P2 — UX
8. Mobile score entry
9. Offline PWA
10. Photo upload

### 🟢 P3 — Features
11. Multi-year support
...

## Data
- 15 players, 7 teams
- Ready for 2026 tournament

---
_Last updated: 2026-02-22 Daily cron by Nova_