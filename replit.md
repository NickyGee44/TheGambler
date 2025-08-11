# The Gambler Cup 2025 - Tournament Tracker

## Overview
The Gambler Cup 2025 is a golf tournament tracking application for an 8-team tournament taking place August 29-31, 2025, at Deerhurst Golf Course and Muskoka Bay Golf Club. It manages team information, scores, side bets, and photos. Key capabilities include real-time updates, offline functionality via PWA, and a responsive mobile-optimized design. The project aims to provide a comprehensive, real-time tracking and social platform for tournament participants.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**August 11, 2025**: 
- ✅ Fixed critical Round 2/3 API routing issues by adding missing POST endpoints for hole score submissions
- ✅ Resolved authentication problems by setting all user passwords to "abc123" for comprehensive testing  
- ✅ Successfully tested scoring functionality across all 3 rounds for multiple players (Nick Grossi, Erik Boudreau, Connor Patterson, Bailey Carlson)
- ✅ Verified birdie notification system is working correctly during score submissions and broadcasting to all connected players
- ✅ Confirmed proper scoring calculations including handicap adjustments, net scores, and point allocations across all rounds
- ✅ **CRITICAL FIX**: Resolved hole-by-hole score saving issue where scores weren't persisting when navigating between holes quickly. Reduced auto-save delay from 2s to 1s and implemented immediate save-on-navigation to prevent data loss
- ✅ **CRITICAL CRASH BUG FIXED**: Resolved Sye Ellard scoring crash caused by race condition in auto-save mechanism that created duplicate API calls and infinite loops
- ✅ **TEST ROUND REMOVAL**: Completely removed test round functionality including database tables, server routes, client components, and all related code since testing phase is complete
- ✅ **COMPLETE SCORE SYNC INTEGRATION**: Fixed comprehensive scoring system synchronization across all leaderboards and scoring endpoints. Match play points now correctly integrate with stroke play points in all round leaderboards, main scores page, and tournament standings. Teams are ranked by combined stroke play + match play totals throughout the entire application.
- ✅ **ROUND 2 TEAM SCORE BUG FIXED**: Resolved Nick Grossi's "404 team not found" error in Round 2 by fixing team lookup mechanism. Updated database methods to properly find user teams by name instead of missing teamId foreign key.
- ✅ **ROUND 3 MATCH PLAY INFO**: Added compact match play info section under hole information showing current opponent and stroke status for each hole in Round 3 with gold/yellow theme.
- ✅ **ROUND 2 SCORE BUTTON HIGHLIGHTING**: Fixed score button highlighting issue in Round 2 by reverting getScoreForHole function to return 0 instead of null, matching behavior of Rounds 1 and 3. Score buttons now properly highlight when selected across all rounds.
- ✅ **ROUND 2 LIVE PLACEMENT POINTS**: Fixed critical placement point calculation for Round 2 where teams with partial progress (like Nick Grossi/Connor Patterson with 11/18 holes) were showing 0 roundPoints despite leading. Modified calculateTournamentPlacementPoints to award temporary placement points during play: 1st=8pts, 2nd=6pts, etc. Teams now receive proper placement points based on current standings during Round 2 play, not just after completing all 18 holes.
- ✅ **LIVE LEADERBOARDS FOR ALL ROUNDS**: Completely removed restrictions requiring completed rounds for leaderboard display. All rounds now show live data as scores are recorded in real-time. Teams with partial progress are ranked by current performance and awarded live placement points (1st=10pts, 2nd=9pts, etc.) regardless of completion status. Teams that haven't started a round are ranked below teams with scores, sorted by their total tournament points from other rounds.
- ✅ **CRITICAL DATA INTEGRITY FIX**: Added comprehensive hole number validation (1-18 only) to all scoring endpoints to prevent invalid holes like "19" or "0" from being saved. Cleaned existing invalid hole data from database.
- ✅ **TEAM 7 ROSTER UPDATE**: Updated Team 7 to replace Austin Hassani with James Ogilvie, resolving "Team members not found" errors for Sye Ellard during team scoring operations.
- ✅ **DEERHURST SCORECARD UPDATE**: Updated Deerhurst Highlands course data with official Gold tee yardages and handicaps from tournament scorecard. All 18 holes now reflect accurate course measurements for tournament play.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom golf-themed colors
- **Component Library**: Radix UI with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **PWA**: Service Worker implementation for offline functionality and app-like experience.
- **UI/UX Decisions**: Golf-themed colors, professional component library (Radix UI, shadcn/ui), intuitive navigation, responsive design, and visual feedback for interactions (e.g., score buttons, auto-save indicators). Integration of GPS with satellite imagery and golf-specific markers.

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Type System**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM, utilizing Neon Database for serverless capabilities.
- **Real-time**: WebSocket server for live updates.
- **API**: RESTful endpoints with WebSocket integration for real-time data push.

### Key Features & Technical Implementations
- **Database Schema**: Manages `Teams`, `Scores` (hole-by-hole), `Side Bets`, `Photos`, `Users`, `Tournaments`, and `Player Tournament History`.
- **Tournament Structure**: Supports 8 teams, 3 rounds, with specific scoring rules (e.g., scramble handicap calculation, match play with stroke allocation).
- **Live Scoring**: Real-time score tracking with admin update capabilities, automatic score calculation from hole-by-hole data, and live standings updates.
- **Golf Statistics Tracking**: Comprehensive per-hole statistics (FIR, GIR, putts, penalties, drive direction, sand saves, up-and-downs) with a dedicated statistics page and leaderboards. Historical performance tracking per player across tournaments.
- **GPS Functionality**: Integrated GPS with satellite imagery (Google Maps API), displaying real-time yardages to tee and green, and custom distance measurements. Features include accurate course coordinates for specific holes/courses.
- **Side Bet System**: Player-to-player challenge system with acceptance/declination, persistence, a witness-based resolution system, and a "Pussy Boys Hall of Shame" for declined challenges.
- **Boozelympics Games**: Match logging system for various drinking games with team selection and real-time leaderboards.
- **Photo Upload System**: Uploading and displaying tournament photos with camera roll support, file validation, and previews.
- **Authentication**: Custom username/password authentication with secure hashing, session management, and role-based access for score editing and admin features.
- **Tournament Management**: Admin interface for managing multi-year tournaments, including creation, activation, and champion tracking.

### Data Flow
- Frontend initiates API calls via React Query.
- Express server handles CRUD operations.
- Drizzle ORM interacts with PostgreSQL.
- WebSocket broadcasts changes to connected clients for real-time updates.
- Service Worker manages offline data caching and background sync.

### Architecture Decisions
- **Database**: PostgreSQL with Neon Database for scalability and consistency.
- **Real-time Updates**: WebSockets for low-latency, bidirectional communication.
- **Offline Functionality**: Service Worker for PWA capabilities, ensuring functionality in low-connectivity areas.
- **Component Architecture**: Radix UI/shadcn/ui for consistent, accessible, and reusable UI.
- **Type Safety**: TypeScript and Zod validation for robust error prevention.

## External Dependencies

### Frontend Dependencies
- React, React DOM, React Query (TanStack Query)
- Radix UI, Lucide React icons
- Tailwind CSS, class-variance-authority
- React Hook Form, Zod (for validation)
- Wouter (routing)
- date-fns (date handling)
- Google Maps API (for GPS satellite imagery)

### Backend Dependencies
- Express (web framework)
- Drizzle ORM, PostgreSQL driver (`@neondatabase/serverless`)
- `ws` (WebSocket server)
- `connect-pg-simple` (session management)
- `crypto` (for password hashing)
- `multer` (for file uploads)

### Development/Build Tools
- Vite (frontend build tool)
- tsx (TypeScript server runner)
- esbuild (server bundling)