# The Gambler Cup 2025 - Tournament Tracker

## Overview
The Gambler Cup 2025 is a golf tournament tracking application designed for an 8-team tournament. Its primary purpose is to provide a comprehensive, real-time tracking and social platform for participants, managing team information, scores, side bets, and photos. Key capabilities include real-time updates, offline functionality via PWA, and a responsive mobile-optimized design.

**Scoring System:**
- **Round 1 (Better Ball):** 5-4.5-4-3.5-3-2.5-2-1.5 placement points (half of original 10-9-8-7-6-5-4-3)
- **Round 2 (Scramble):** 10-9-8-7-6-5-4-3 placement points (unchanged)
- **Round 3 (Match Play):** 4 points per match win, 2 points per match tie, 0 points for loss (doubled from original 2-1-0)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom golf-themed colors
- **Component Library**: Radix UI with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **PWA**: Service Worker for offline functionality.
- **UI/UX Decisions**: Golf-themed colors, professional component library, intuitive navigation, responsive design, visual feedback, and integration of GPS with satellite imagery and golf-specific markers.

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Type System**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM, utilizing Neon Database.
- **Real-time**: WebSocket server for live updates.
- **API**: RESTful endpoints with WebSocket integration.

### Key Features & Technical Implementations
- **Database Schema**: Manages `Teams`, `Scores` (hole-by-hole), `Side Bets`, `Photos`, `Users`, `Tournaments`, and `Player Tournament History`.
- **Tournament Structure**: Supports 8 teams, 3 rounds, with specific scoring rules (e.g., scramble handicap calculation, match play).
- **Team 7 Custom Round 1 Format**: The 3-person team (Nic Huxley, Sye Ellard, James Ogilvie) uses a special rotating pairing system:
  - Holes 1-6: James and Nic best ball
  - Holes 7-9: Nic and Sye best ball  
  - Holes 10-12: James and Sye best ball
  - Holes 13-18: All three players best ball
- **Live Scoring**: Real-time score tracking, automatic score calculation, and live standings updates.
- **Golf Statistics Tracking**: Comprehensive per-hole statistics (FIR, GIR, putts, penalties, drive direction, sand saves, up-and-downs) with dedicated statistics page and leaderboards.
- **GPS Functionality**: Integrated GPS with satellite imagery, displaying real-time yardages and custom distance measurements using Google Maps API.
- **Side Bet System**: Player-to-player challenge system with acceptance/declination, persistence, witness-based resolution, and a "Pussy Boys Hall of Shame."
- **Boozelympics Games**: Match logging system for drinking games with real-time leaderboards.
- **Photo Upload System**: Uploading and displaying tournament photos with camera roll support.
- **Authentication**: Custom username/password authentication with secure hashing, session management, and role-based access.
- **Tournament Management**: Admin interface for managing multi-year tournaments.

### Architecture Decisions
- **Database**: PostgreSQL with Neon Database for scalability and consistency.
- **Real-time Updates**: WebSockets for low-latency communication.
- **Offline Functionality**: Service Worker for PWA capabilities.
- **Component Architecture**: Radix UI/shadcn/ui for consistent, accessible, and reusable UI.
- **Type Safety**: TypeScript and Zod validation for robust error prevention.

## External Dependencies

### Frontend Dependencies
- React, React DOM, React Query (TanStack Query)
- Radix UI, Lucide React icons
- Tailwind CSS, class-variance-authority
- React Hook Form, Zod
- Wouter
- date-fns
- Google Maps API

### Backend Dependencies
- Express
- Drizzle ORM, PostgreSQL driver (`@neondatabase/serverless`)
- `ws`
- `connect-pg-simple`
- `crypto`
- `multer`

### Development/Build Tools
- Vite
- tsx
- esbuild