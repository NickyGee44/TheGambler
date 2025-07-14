# The Gambler Cup 2025 - Tournament Tracker

## Overview

The Gambler Cup 2025 is a golf tournament tracking application built with React and Express. It's designed to manage team information, scores, side bets, and photos for an 8-team golf tournament taking place August 29-31, 2025. The tournament will be held at Deerhurst Golf Course in Muskoka (Days 1-2) and Muskoka Bay Golf Club (Final Day). The application features real-time updates, offline functionality, and a responsive design optimized for mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **Styling**: Tailwind CSS with custom golf-themed colors
- **Component Library**: Radix UI with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **PWA**: Service Worker implementation for offline functionality

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Type System**: TypeScript throughout
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Real-time**: WebSocket server for live updates
- **API**: RESTful endpoints with real-time WebSocket integration

### Key Components

#### Database Schema
- **Teams**: Stores team information (team number, player names, handicaps)
- **Scores**: Tracks tournament scores by round for each team
- **Side Bets**: Manages betting information between players
- **Photos**: Stores tournament photo metadata

#### Frontend Pages
- **Home**: Landing page with tournament countdown and overview
- **Teams**: Displays all 8 teams with player information and handicaps
- **Scores**: Real-time score tracking with admin update capabilities
- **Side Bets**: Betting system for tracking wagers between players
- **Rules**: Tournament format and rules explanation
- **Photos**: Gallery for tournament photos

#### Real-time Features
- WebSocket connections for live score updates
- Offline storage with background sync
- PWA capabilities for mobile app-like experience
- Real-time notifications for score changes and bet updates

### Data Flow

1. **Client Requests**: Frontend makes API calls using React Query
2. **Server Processing**: Express routes handle CRUD operations
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Real-time Updates**: WebSocket broadcasts changes to all connected clients
5. **Offline Handling**: Service Worker caches data and queues updates when offline

### External Dependencies

#### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (Radix UI, Lucide React icons)
- Styling (Tailwind CSS, class-variance-authority)
- Forms (React Hook Form, Zod validation)
- Routing (Wouter)
- Date handling (date-fns)

#### Backend Dependencies
- Express server framework
- Database (Drizzle ORM, PostgreSQL driver)
- WebSocket (ws package)
- Session management (connect-pg-simple)
- Development tools (tsx, esbuild)

### Deployment Strategy

#### Development
- Vite dev server for frontend with hot module replacement
- tsx for running TypeScript server code directly
- Concurrent development of client and server

#### Production Build
- Vite builds optimized client bundle
- esbuild bundles server code for Node.js
- Static files served from Express server
- Database migrations handled via Drizzle Kit

#### Environment Configuration
- PostgreSQL database via DATABASE_URL environment variable
- Neon Database serverless connection
- WebSocket server runs on same port as HTTP server

### Architecture Decisions

#### Database Choice
- **Problem**: Need reliable, scalable database for tournament data
- **Solution**: PostgreSQL with Neon Database serverless
- **Rationale**: Strong consistency, ACID compliance, and serverless scaling

#### Real-time Updates
- **Problem**: Multiple users need live score updates
- **Solution**: WebSocket server with automatic reconnection
- **Rationale**: Low latency, bidirectional communication for tournament tracking

#### Offline Functionality
- **Problem**: Tournament may have poor connectivity
- **Solution**: Service Worker with background sync
- **Rationale**: Ensures data isn't lost and provides smooth mobile experience

#### Component Architecture
- **Problem**: Need consistent, reusable UI components
- **Solution**: Radix UI with shadcn/ui design system
- **Rationale**: Accessibility, customization, and professional appearance

#### Type Safety
- **Problem**: Prevent runtime errors in tournament-critical application
- **Solution**: TypeScript throughout with Zod validation
- **Rationale**: Catch errors at compile time and ensure data integrity

### Recent Changes: Latest modifications with dates

**July 14, 2025:**
- Updated tournament dates from July 15-17 to August 29-31, 2025
- Added specific golf course locations:
  - Days 1-2: Deerhurst Golf Course, Muskoka
  - Final Day: Muskoka Bay Golf Club
- Fixed TypeScript errors in storage implementation for better type safety
- Updated countdown timer and all references to reflect new dates and locations
- **Implemented Custom Authentication System:**
  - Replaced Replit auth with simple username/password system
  - Users register with first name, last name, and password
  - Secure password hashing with crypto.scrypt and salt
  - PostgreSQL database with user and session tables
  - Player name matching system for score edit permissions
  - Players can only edit scores for their own team
  - Beautiful authentication page with login/register tabs
  - Logout functionality integrated in navigation
- **Applied Full Dark Mode Theme:**
  - Set default theme to dark mode
  - Enhanced CSS variables for better dark mode support
  - Added forced dark mode styling throughout the application
  - Updated all components to use dark mode variants
- **Added Professional Profile Picture System:**
  - Created ProfilePicture component with Radix UI Avatar
  - Added profilePicture field to database schema
  - Profile pictures display next to player names across the app
  - Implemented for Nick Grossi, Christian Hauck, Johnny Magnatta, and Erik Boudreau
  - Shows actual photos when available, initials as fallback
  - Appears in scores, leaderboards, side bets, and navigation