# TheGambler — Full Platform Upgrade Spec
_Written: 2026-02-26 | Owner: Nick Grossi_

## Context
TheGambler is an invite-only golf tournament app for a group of friends (~15 users).
Annual tournament. No public signups. URL shared privately.

## Core Constraints
- **Drunk-proof UX** — anything requiring manual input must have dead-simple taps
- **Mobile-first** — all features must work on phone browsers (Safari iOS + Chrome Android)
- **Invite-only** — no public discovery, existing auth system stays
- **Stripe account:** acct_1T4y6PJ5gSSjmEKV (Bridg3)
- **DB:** Supabase (Postgres via Drizzle ORM), pooler connection

---

## Phase 1: Payments, Registration & RSVP

### 1.1 Tournament Entry Fee
- **Amount:** $150 CAD per player
- **Trigger:** New "Register for [Year]" button on home/dashboard
- **Flow:** 
  1. User clicks Register → Stripe Checkout session created (server-side)
  2. User pays $150 via Stripe Checkout (hosted page)
  3. Stripe webhook confirms `checkout.session.completed`
  4. DB: mark user as `registered = true, entry_paid = true` for that tournament year
  5. User redirected back to app with confirmation
- **Admin view:** See who has/hasn't paid, total collected
- **New env vars needed:** `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### 1.2 Par 3 CTP Side Bet (Per Round)
- **Amount:** $30 per round (optional, player opts in)
- **Per round:** Round 1, Round 2, Round 3 each have their own CTP pool
- **Flow:**
  1. On round registration screen: "Join CTP pool for this round? $30" toggle
  2. If yes → immediate Stripe payment ($30)
  3. Admin designates CTP winner per round after play
  4. Winner info displayed on leaderboard
- **Payout:** Manual — admin marks winner, system shows total pot per round

### 1.3 New DB Tables
```sql
registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tournament_year INTEGER,
  registered_at TIMESTAMP,
  entry_paid BOOLEAN DEFAULT false,
  entry_payment_intent_id TEXT,
  entry_amount_cents INTEGER DEFAULT 15000,
  ctp_round1_paid BOOLEAN DEFAULT false,
  ctp_round2_paid BOOLEAN DEFAULT false,
  ctp_round3_paid BOOLEAN DEFAULT false,
  ctp_payment_intent_ids JSONB DEFAULT '{}',
  UNIQUE(user_id, tournament_year)
)
```

### 1.4 Stripe Webhook Handler
- Endpoint: `POST /api/webhooks/stripe`
- Handle: `checkout.session.completed`, `payment_intent.succeeded`
- Use `STRIPE_WEBHOOK_SECRET` for signature verification
- Map session metadata to update registrations table

---

## Phase 2: Guest Applications (+1 System)

### 2.1 Apply to Bring a +1
- Any registered player can submit a +1 application
- Form fields: Guest name, relationship to player, "why should they come" (optional)
- Submitted applications visible to all registered players
- **Voting:** Registered players vote yes/no on each application
- If majority yes → admin approves → guest gets access link
- **New route:** `POST /api/guest-applications`, `GET /api/guest-applications`, `POST /api/guest-applications/:id/vote`

### 2.2 New DB Tables
```sql
guest_applications (
  id SERIAL PRIMARY KEY,
  applicant_user_id INTEGER REFERENCES users(id),
  guest_name TEXT NOT NULL,
  guest_relationship TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, denied
  tournament_year INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0
)

guest_application_votes (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES guest_applications(id),
  voter_user_id INTEGER REFERENCES users(id),
  vote TEXT, -- yes, no
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(application_id, voter_user_id)
)
```

---

## Phase 3: Destination & Accommodations Voting

### 3.1 Voting System
- Admin creates a vote with:
  - Category: `destination` | `accommodations` | `custom`
  - Options: 2-5 choices with optional descriptions/images
  - Deadline: optional date
- Registered players vote (one vote per person per poll)
- Results shown as bar chart (live, no hiding until deadline)
- Admin can close vote and mark result as "final"

### 3.2 New DB Tables
```sql
tournament_votes (
  id SERIAL PRIMARY KEY,
  tournament_year INTEGER,
  category TEXT, -- destination, accommodations, custom
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'open', -- open, closed
  deadline TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  winning_option_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
)

vote_options (
  id SERIAL PRIMARY KEY,
  vote_id INTEGER REFERENCES tournament_votes(id),
  option_text TEXT,
  description TEXT,
  image_url TEXT,
  vote_count INTEGER DEFAULT 0
)

player_votes (
  id SERIAL PRIMARY KEY,
  vote_id INTEGER REFERENCES tournament_votes(id),
  user_id INTEGER REFERENCES users(id),
  option_id INTEGER REFERENCES vote_options(id),
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vote_id, user_id)
)
```

---

## Phase 4: Betting Marketplace (Pay-to-Bet)

### 4.1 Concept
- Any registered player can create a bet
- **Must pay upfront to offer a bet** (Stripe Payment Intent → escrow)
- Other players can accept the bet (also pay upfront)
- After tournament, admin marks winner
- Winner gets full pot (or split minus fees)
- Unaccepted bets: full refund automatically

### 4.2 Bet Types
- Head-to-head (player A vs player B)
- Any custom wager (text description)
- Round-specific (e.g. "I'll shoot under 90 in Round 2")
- CTP challenge (specific hole)

### 4.3 Flow
1. Create bet → enter description + amount ($5-$500) + optional opponent
2. Pay amount via Stripe → held in escrow (Payment Intent)
3. Bet visible to all players in "Betting Marketplace"
4. Opponent accepts → pays same amount → both funds held
5. After tournament: admin clicks "Declare winner" on each bet
6. Winner receives payout (manual transfer or Stripe payout)
7. Unclaimed bets after 7 days → auto-refund

### 4.4 New DB Tables
```sql
bets (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES users(id),
  opponent_id INTEGER REFERENCES users(id), -- null = open to anyone
  tournament_year INTEGER,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  type TEXT DEFAULT 'custom', -- custom, head-to-head, round, ctp
  round INTEGER, -- if round-specific
  hole INTEGER, -- if hole-specific
  status TEXT DEFAULT 'open', -- open, matched, settled, refunded, cancelled
  creator_payment_intent_id TEXT,
  opponent_payment_intent_id TEXT,
  winner_id INTEGER REFERENCES users(id),
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 4.5 Routes
- `POST /api/bets` — create bet + Stripe Payment Intent
- `GET /api/bets?year=2025` — list all bets
- `POST /api/bets/:id/accept` — accept bet + pay
- `POST /api/bets/:id/settle` — admin: declare winner (trigger payout)
- `POST /api/bets/:id/cancel` — creator cancels (before matched) → refund

---

## Phase 5: Shot Tracking (GPS + Motion)

### 5.1 Auto-Detection
- Uses `DeviceMotionEvent` (accelerometer) to detect swing
- Threshold: acceleration > 15 m/s² in < 200ms → log shot
- On shot detection:
  1. Record GPS position (`navigator.geolocation.getCurrentPosition`)
  2. Vibrate phone (haptic feedback confirmation)
  3. Show brief "Shot logged ✓" overlay
- **Fallback:** Manual "Log Shot" button (big, easy to tap while drunk)
- iOS requires user gesture to enable DeviceMotion (request on first tap)

### 5.2 Session
- User opens "Track My Round" screen for current round
- GPS + motion tracking active while screen is open
- Auto-pause when app backgrounded (battery consideration)
- Shots grouped by: tournament_year → round → hole (auto-detect hole based on GPS proximity to tee/green)

### 5.3 Shot Analytics (Post-Round)
- Distance per shot (GPS delta between consecutive shots)
- Average drive distance
- Fairways hit (if course geometry added)
- Strokes per hole vs. par
- Heatmap of shot locations on simple overhead map view (Google Maps)

### 5.4 New DB Tables
```sql
shots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tournament_year INTEGER,
  round INTEGER,
  hole INTEGER,
  shot_number INTEGER, -- shot 1, 2, 3... within the hole
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  accuracy_meters DECIMAL(6, 2),
  detected_by TEXT DEFAULT 'motion', -- motion, manual, gps
  timestamp TIMESTAMP DEFAULT NOW()
)
```

---

## Phase 6: Enhanced Scoring & Leaderboard

### 6.1 Day-by-Day Leaderboard
- After each round: running total leaderboard
- Columns: Player | R1 | R2 | R3 | Total | vs Par | Points
- Sortable by: Total strokes, vs par, match play points
- Show delta from previous round ("↑3 from yesterday")

### 6.2 Round Analysis Cards
- Per-player per-round card: Hole-by-hole breakdown
- Highlight: eagles, birdies, pars, bogeys, doubles+ (colour coded)
- Stat line: GIR%, Putts (if tracked), Scrambling %
- Compare players side-by-side

### 6.3 Tournament Summary
- Final standings with trophy icons for podium
- Best round award, most improved, most consistent
- Betting results summary (who won what)
- Shot tracking stats (longest drive, most accurate)

---

## Phase 7: Automatic Tournament Entry + Payouts Dashboard

### 7.1 Entry Fee Tracker
- Admin dashboard showing:
  - Total collected vs. expected
  - Who hasn't paid (with "Send reminder" button → iMessage/app notification)
  - CTP pools per round
  - Breakdown of all pots

### 7.2 Payout Calculator
- Admin enters final standings
- System calculates suggested payouts based on:
  - Entry fee pool (e.g. top 3 pay out: 50/30/20%)
  - CTP winners per round
  - Bet settlements
- "Approve All Payouts" button
- Manual override per player

---

## Technical Implementation Notes

### Stripe Integration
- Use `stripe` npm package server-side
- Use `@stripe/stripe-js` + `@stripe/react-stripe-js` client-side
- All Checkout sessions: `mode: 'payment'`, metadata includes `{type, userId, year}`
- Webhook endpoint needs raw body (use `express.raw()` before JSON middleware)
- Store `STRIPE_WEBHOOK_SECRET` in Vercel env

### Shot Tracking - iOS Permission Flow
```javascript
// iOS 13+ requires user gesture for DeviceMotion
async function requestMotionPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    const permission = await DeviceMotionEvent.requestPermission();
    return permission === 'granted';
  }
  return true; // Android doesn't need permission
}
```

### Database Migrations
- Add all new tables via Drizzle migrations (`drizzle-kit generate` + `drizzle-kit migrate`)
- Run migrations against Supabase pooler connection
- All new tables need `created_at` and appropriate foreign keys

### Auth / Authorization
- New role: `admin` (already exists in schema — verify)
- Registration gated: must be `registered = true` to access betting/voting
- CTP and betting: registered players only
- Admin: all management actions

---

## Build Order (Recommended)
1. Stripe setup + DB migrations (new tables) 
2. Registration flow + entry fee payment
3. CTP side bet payment
4. Webhook handler
5. Betting marketplace (create/accept/settle)
6. Guest applications + voting
7. Destination/accommodations voting
8. Shot tracking (GPS + motion)
9. Enhanced leaderboard + analytics
10. Payout dashboard

---

## Files to Create/Modify
- `server/stripe.ts` — Stripe client + helper functions
- `server/routes.ts` — add all new routes
- `server/storage.ts` — add new DB operations
- `shared/schema.ts` — add new tables
- `client/src/pages/Registration.tsx` — RSVP + payment
- `client/src/pages/BettingMarketplace.tsx` — bet list + create/accept
- `client/src/pages/Voting.tsx` — destination + accommodations + guest votes
- `client/src/pages/ShotTracker.tsx` — GPS + motion shot tracking
- `client/src/pages/Leaderboard.tsx` — enhanced with round analysis
- `client/src/pages/AdminDashboard.tsx` — enhanced with payments + payouts
- `drizzle migrations` — new tables

---

_This spec is the source of truth. Do not deviate. All payment flows use live Stripe keys. Test with real amounts but refund immediately if testing. Never hardcode keys._
