# TheGambler — Improvement Roadmap (Updated 2026-02-27)

**App:** Golf tournament tracker for the annual Gambler Cup
**Live:** https://the-gambler-five.vercel.app (API /health 200 ✅)
**DB:** Supabase (migrated from Neon/Replit, Feb 19 2026)
**Stack:** React 18 + TypeScript + Vite | Express + Drizzle ORM | PostgreSQL

---

## Status (Feb 27 2026)

- ✅ DB migrated to Supabase
- ✅ Vercel deployment fully working (health 200)
- ✅ Custom auth (session-based, replitAuth fallback)
- ✅ WebSocket → TanStack Query polling (Vercel compatible)
- ✅ All 7 teams + 15 players + 3 rounds of real 2025 data in DB
- ✅ APIs working: /api/teams, /api/scores, /api/leaderboard/:round, /api/player-stats, /api/matchups, /api/chat/messages
- ✅ **Feb 26: Home page post-tournament UX — final results instead of broken countdown**
- 🔄 **Feb 27: Stats page N/A fix for untracked R2/R3 shot data + Home page individual leaders fix**

## Priority Queue

### 🔴 P0 — Critical Bug Fixes
1. ✅ Vercel deployment
2. ✅ Auth refactor (replitAuth → custom)
3. ✅ Home page broken countdown → final results

### 🟠 P1 — UX Polish
4. 🔄 **Stats page N/A for missing R2/R3 fairway/GIR/putts** (agent running Feb 27)
5. Home page individual leaders → R3 final standings (part of today's fix)
6. Mobile score entry flow review
7. Tournament Complete celebration page (trophy/confetti moment)
8. Google Maps API key → Vercel env (Nick action needed)

### 🟡 P2 — 2026 Prep
9. Update `shared/tournamentConfig.ts` to 2026 dates (Nick needs to confirm dates/courses)
10. Multi-year support (archive 2025, start fresh for 2026)
11. Player registration flow for 2026
12. Team matchup display improvements

### 🟢 P3 — Features
13. Offline PWA support
14. Photo upload (multer route exists but needs Vercel S3/cloud storage)
15. Push notifications for birdie alerts
16. Admin dashboard improvements
17. Year-over-year player comparison

---

## Data State (2025 Tournament — COMPLETE)
- **Champion Team:** Spencer Reid & Jeffrey Reiner (Team 5) — 30.25 pts
- **Runner-up:** Johnny Magnatta & Jordan Kreller (Team 6) — 29.5 pts
- **Individual Leader R1:** Nick Grossi — 37 stableford pts
- 15 players, all 3 rounds scored
- Shot tracking data: R1 only (R2/R3 not tracked live — show N/A in UI)
- Chat messages from Aug 2025 preserved

---

## Flags for Nick
- 🚩 **Tournament dates for 2026** — need confirmation to update config (currently pointing to Aug 2025)
- 🚩 **Google Maps API key** — GPS features need this in Vercel env vars
- 🚩 **Photo storage** — multer upload route exists but Vercel serverless can't write local disk; need S3/Cloudflare R2 for photos to work

---

## Daily Log
- **Feb 22:** Vercel crash fix — WS → polling, replitAuth → custom auth
- **Feb 23:** Deployment stabilization, Supabase session store
- **Feb 26:** Home page post-tournament UX — replace broken countdown with final standings/results
- **Feb 27:** Stats page — show N/A for untracked R2/R3 shot data (fairway%, GIR%, putts); Home page individual leaders now shows R3 final standings

_Last updated: 2026-02-27 Daily cron by Nova_
