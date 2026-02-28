# TheGambler App — 2026 Overhaul

## Context
This is a private golf tournament app for ~15 friends. It runs once/year (July 2026). 
The app is already deployed at https://the-gambler-five.vercel.app using:
- React 18 + TypeScript + Vite (client)
- Express + Drizzle ORM (server)
- Supabase (Postgres)
- Vercel (serverless, no WebSockets)
- Vegas×Augusta dark theme: black #0A0A0A, emerald #00C853, gold #FFD700

Last year's biggest issue: scores didn't save reliably, scoring UX was buggy/hard to use on mobile. 
Players couldn't trust what they entered was saved.

## Priorities (in order)
1. Rock-solid hole-by-hole score entry
2. Real-time score updates (polling since no WS on Vercel)
3. PWA support (installable on iPhone home screen)
4. 2026 tournament setup
5. General UX polish

---

## TASK 1: Fix Score Entry Reliability

The `holeScores` table stores per-hole scores for each player. The entry flow must be bulletproof.

### Requirements:
- Optimistic UI: show the save immediately, confirm in background
- Visual indicator per hole: ✓ (saved), ⏳ (saving), ✗ (failed — tap to retry)
- Each hole auto-saves when the user changes the score (debounced 800ms)
- Failed saves must be retryable with one tap
- Never lose data silently — if save fails, show a clear error state on that hole
- Lock scored holes (grey them out) after round is complete

### Score entry UX:
- Mobile-first layout: big number input, +/- buttons on either side
- One hole visible at a time with swipe-like prev/next navigation (or a horizontal scrollable hole selector at top)
- Show par and net score in real-time as they type
- Show Stableford points calculated instantly

---

## TASK 2: Real-time Leaderboard

No WebSockets on Vercel. Use TanStack Query's `refetchInterval`.

### Requirements:
- Leaderboard auto-refreshes every 15 seconds during active round
- Show "Last updated X seconds ago" timestamp
- Add a manual refresh button (pull-to-refresh feel)
- Scores animate when they change (subtle green flash)
- Show each player's current hole (derived from their latest saved hole score)

---

## TASK 3: PWA Support

Add Progressive Web App support so the app installs on iPhone/Android home screens.

### Files to create/modify:
1. `client/public/manifest.json` — PWA manifest
   ```json
   {
     "name": "The Gambler",
     "short_name": "Gambler",
     "description": "Private golf tournament app",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#0A0A0A",
     "theme_color": "#00C853",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```
2. Add `<link rel="manifest" href="/manifest.json">` to `index.html`
3. Add `<meta name="viewport" content="width=device-width, initial-scale=1">` if missing
4. Add `<meta name="apple-mobile-web-app-capable" content="yes">` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
5. Create simple app icons: use a golf ball emoji or card suit on dark background (use a canvas/svg approach to generate programmatically, or just note where to drop PNGs)
6. `client/public/sw.js` — minimal service worker for offline shell caching
   - Cache the app shell (HTML, JS, CSS)
   - Network-first for API calls
   - Show cached version if offline

---

## TASK 4: Set Up 2026 Tournament

Add a new tournament record for 2026. The tournament table already exists.

Create a script `scripts/setup-2026-tournament.ts` that:
- Inserts a new tournament row: year=2026, name="The Gambler 2026", isActive=true
- Sets the old 2025 tournament isActive=false
- The script should be runnable via `npx tsx scripts/setup-2026-tournament.ts`
- Use the existing Drizzle DB connection from `server/db.ts`

Also update `shared/tournamentConfig.ts` to reflect 2026 as the current year if that's where the year is hardcoded.

---

## TASK 5: UX Polish

### Navigation:
- Bottom tab bar for mobile (home, scoring, leaderboard, side bets, more)
- Active tab highlight in emerald #00C853
- Haptic-style active indicator

### Home page:
- Show current tournament info (year, location, courses, dates)
- Live leaderboard preview (top 5)
- Quick-access "Enter My Score" button (big, prominent)

### Score Summary:
- After completing all 18 holes, show a summary card: total gross, total net, Stableford points, best hole, worst hole
- Celebrate with a subtle animation

### Trash Talk Chat:
- Fix the chat UX — should feel like iMessage
- Auto-scroll to bottom on new messages
- Show sender's name + time
- Poll every 10s for new messages

---

## TASK 6: Password Protection (simple invite gate)

Replace the complex Replit auth / Stripe registration flow with a simpler approach for the invite-only group:
- Keep existing user accounts and session auth
- Add an "invite code" to the env: `INVITE_CODE=gambler2026`
- New users must enter the invite code during registration to create an account
- Existing users are not affected
- Admin (Nick Grossi, Connor Patterson) can bypass or view/set the code

---

## Technical Notes:
- Vercel serverless = NO WebSockets, use polling
- Supabase DB is live (don't drop tables, only migrations)
- Run `npm run db:push` to apply schema changes
- Don't break existing 2025 data (tournament_year scoped queries)
- All new API endpoints go in `server/routes.ts`
- Client API calls use the existing `queryClient` setup
- Check `shared/schema.ts` before adding tables — many already exist

## When done:
- Run `npm run check` to verify TypeScript compiles
- List all files changed
- Commit with message: "feat: 2026 overhaul - reliable scoring, real-time, PWA, polish"
- Then run: openclaw system event --text "Done: TheGambler 2026 overhaul complete — scoring fixed, real-time, PWA, polish" --mode now
