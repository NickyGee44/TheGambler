# TheGambler — Improvement Roadmap (Updated 2026-02-23)

**App:** Golf tournament tracker for the annual Gambler Cup
**Live:** https://the-gambler-five.vercel.app (API /health 200 ✅, custom auth ready)
**DB:** Supabase (migrated from Neon/Replit, Feb 19 2026)
**Stack:** React 18 + TypeScript + Vite | Express + Drizzle ORM | PostgreSQL

---

## Status (Feb 23 2026)

- ✅ DB migrated to Supabase
- ✅ Vercel env vars set (DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, REPL_ID)
- ✅ API routes fixed with vercel.json + pre-compiled JS
- ✅ **Vercel crash fixed** (/api/health 200)
- ✅ **replitAuth → custom auth only** (skips if no REPL_ID env)
- ✅ Supabase session store on Vercel cold starts
- 🔄 **Spawned claude agent: Remove WS → TanStack Query polling + E2E login test + deploy**
- ⏳ Google Maps API key to Vercel env (Nick)

## Recent Git (top 10)
fa359aa chore: 2026-02-22 daily roadmap update
01402cc debug: minimal handler to verify @vercel/node works
...

## Priority Queue

### 🔴 P0 — Get it live ✅
1. ✅ vercel.json routing
2. ✅ Refactor replitAuth.ts → custom auth only (no Replit crash)
3. ✅ Verify Supabase session store on Vercel cold starts
4. 🔄 **E2E login test on Vercel** (agent)

### 🟠 P1 — Reliability 🔄
5. 🔄 **WS → TanStack Query polling** (agent)
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
_Last updated: 2026-02-23 Daily cron by Nova_