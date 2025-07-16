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

**July 15, 2025:**
- **Enhanced Side Bet Challenge System with Database Persistence:**
  - Auto-fills current user as challenger when creating new bets
  - Removed manual bettor selection - challenger is automatically set
  - Only opponents can accept/decline challenges (not the challenger)
  - Challengers see "Waiting for response" status instead of buttons
  - Added enhanced notifications for challenge events with emojis
  - Added "Pussy Boys Hall of Shame" section for declined challenges
  - Public notifications when challenges are declined with shame messaging
  - All users can see all bets made across all rounds
  - Improved UI flow for challenge creation and response
  - **Database Storage:** Side bets now persist in PostgreSQL database with proper schema
  - **Witness-Based Resolution:** Added witness voting system for challenge resolution
  - **Tournament Persistence:** Bets remain in database until tournament completion
  - **Voting Mechanism:** Other players can vote on challenge winners after rounds complete
  - **Automatic Resolution:** Winner determined when majority witness votes reached
  - **Enhanced Schema:** Added witness votes tracking, winner determination, and resolution status
  - **Proper Challenge Flow:** Only recipients can accept/decline, challengers see waiting status
  - **Public Visibility:** All challenges remain publicly visible to all players for transparency
- **Fixed Navigation Menu Bar During Live Rounds:**
  - Updated all three round pages (Round1, Round2, Round3) to maintain navigation menu bar
  - Wrapped HoleView component with Layout component during live scoring
  - Navigation sidebar now remains accessible during hole-by-hole scoring
  - Progress bar still displays at top while preserving menu access
  - Fixed z-index layering so navigation menu appears above progress bar
  - Mobile menu toggle and overlay properly positioned to avoid conflicts
- **Updated Homepage Background Image:**
  - Applied new golf course background image (IMG_8550_1752593365391.jpeg)
  - Enhanced homepage hero section visual display with proper background opacity
  - Background image now displays correctly with tournament logo overlay
- **Updated Erik Boudreau Profile Picture:**
  - Applied new profile picture provided by user (IMG_5247_1752574677541.jpeg)
  - Updated ProfilePicture component to use latest photo
  - Replaced old profile image with new one in assets directory
- **Removed Map Functionality and Created Realistic GPS Interface:**
  - Completely removed Google Maps integration from GPS components
  - Simplified ProfessionalGolfGPS to focus on GPS location tracking and hole information
  - Simplified EnhancedGolfGPS to display GPS data in clean card-based interface
  - Removed all map-related dependencies and state management
  - Added realistic disclaimer about GPS yardage accuracy without precise hole coordinates
  - Interface now shows GPS location for tracking purposes and course hole information
  - Provides guidance to use course markers for accurate yardage measurements
  - Maintains core GPS functionality for location tracking during tournament play
- **Enhanced GPS Functionality for Replit Environment:**
  - Updated useGPS hook with robust error handling and user-friendly alerts
  - Improved error messages with instructions for Replit preview limitations
  - Enhanced GPS timeout settings (10 seconds) and disabled location caching
  - Added visual feedback for GPS errors with tip to open in new tab
  - GPS now works reliably in both Replit preview and standalone environments
- **Completely Redesigned Golf GPS Maps (The Grint Style):**
  - Updated ProfessionalGolfGPS to match The Grint app interface exactly
  - Added satellite imagery with tee markers (red triangles) and green markers (green squares)
  - Implemented white line from tee to green middle like professional golf apps
  - Added top overlay with hole info (HOLE #, Par, Yardage, HCP)
  - Added bottom overlay with live GPS yardages to front/middle/back of green
  - Updated player marker to circle with crosshairs design
  - Map centers on tee box with zoom level 17 for hole detail
  - Added yardage overlays on map showing exact distances
  - Removed redundant UI elements, focusing on map-based interface
- **Fixed Navigation Menu Overflow:**
  - Restructured navigation sidebar with proper flexbox layout
  - Added scrollable middle section for navigation links and user profile
  - Fixed header and footer sections (logo and leaderboard) remain visible
  - All menu options now accessible through smooth scrolling
- **Fixed Logout Functionality:**
  - Enhanced logout mutation to properly clear user cache and invalidate queries
  - Updated server logout endpoint to destroy session and clear cookies
  - Added automatic page redirect after logout for clean state
  - Fixed authentication session cleanup on both frontend and backend
- **Fixed Profile Picture Assignments Permanently:**
  - Renamed actual photo files to match correct player assignments
  - Jeffrey Reiner now uses the photo originally assigned to Austin Hassani
  - Austin Hassani now uses the photo originally assigned to Connor Patterson
  - Connor Patterson now uses the photo originally assigned to Erik Boudreau
  - Kevin Durco now uses the photo originally assigned to Jeffrey Reiner
  - Erik Boudreau now uses the photo originally assigned to Johnny Magnatta
  - Johnny Magnatta now uses the photo originally assigned to Kevin Durco
  - Updated ProfilePicture component to use standard naming convention
  - All file names now correctly correspond to their assigned golfers
- **Re-enabled Profile Picture Assignment Page:**
  - Restored access to `/admin/picture-assignment` for proper picture assignments
  - Added server-side API endpoint to handle profile picture updates
  - Reset ProfilePicture component to original state before incorrect assignments
  - Only Nick Grossi and Connor Patterson can access the assignment tool
  - Assignment page generates updated ProfilePicture component code automatically
  - Provides visual interface to reassign photos to correct player names

**July 14, 2025:**
- **Implemented Interactive Satellite GPS Maps:**
  - Added Google Maps API integration with real satellite imagery
  - Created HoleMap component showing actual course terrain, trees, water, and greens
  - Added GPS location tracking with accuracy circles
  - Implemented tee markers and green position markers (front, middle, back)
  - Live yardage calculations to all green positions
  - Professional golf app interface similar to The Grint and Arccos
  - Updated to use modern AdvancedMarkerElement API
  - Added domain restriction error handling for Google Maps API
- **Fixed Deployment Build Issues:**
  - Compressed large profile picture assets (christian-hauck.png 1.8MB → 8KB, kevin-durco.jpeg 1.6MB → 41KB)
  - Fixed import paths to use compressed .jpeg files instead of .png
  - Temporarily disabled PictureAssignment admin page to reduce build complexity
  - Successfully optimized build from timeout failures to 9-second completion
  - Final bundle sizes: 481KB JavaScript, 79KB CSS - deployment ready
- **Updated Photo Upload System:**
  - Removed placeholder images from Photos page
  - Added real file upload functionality for users to upload from camera roll
  - Implemented photo preview, file validation, and mobile optimization
  - Added multer backend support for handling photo uploads
  - Photos now stored as base64 data URLs in database
- **Updated Erik Boudreau Profile Picture:**
  - Applied new profile picture provided by user
  - Updated ProfilePicture component to use latest photo
- **Updated Homepage Background:**
  - Set new background photo for the homepage hero section
  - Increased opacity to 40% for better image visibility
  - Added image to public directory for web serving
- **Implemented "Pussy Boys" Challenge System:**
  - Added status field to side bets schema (Pending, Accepted, Declined)
  - Created Accept/Decline buttons for challenges
  - Added "Pussy Boys Hall of Shame" section for declined challenges
  - Players who decline challenges appear with challenger's photo as corner tag
  - Real-time updates for challenge responses via WebSocket
  - Public display of all declined challenges with shame messaging
- **Fixed Profile Picture Assignments:**
  - Created admin tool at `/admin/picture-assignment` for reassigning mixed up photos
  - Applied corrected profile picture mappings based on user feedback
  - Updated ProfilePicture component with accurate photo-to-player assignments
  - All 16 golfers now have correctly assigned profile pictures throughout the app
- **Added The Gambler Cup Logo Integration:**
  - Integrated official tournament logo throughout the application
  - Added logo to PWA manifest for app icons and branding
  - Updated HTML head with proper favicon and PWA meta tags
  - Added logo to navigation sidebar, landing page, home page, and auth page
  - Updated service worker to cache logo files for offline use
  - Logo displays prominently in all key user interface areas
- **Implemented PWA Installation Prompt:**
  - Created interactive PWA install prompt that appears after 3 seconds
  - Device-specific installation instructions for iOS, Android, and desktop
  - Auto-detects user's device type and shows appropriate steps
  - Dismissible prompt with localStorage to prevent repeated showing
  - Integrated with native browser install prompt when available
  - Guides users through complete installation process
- **Fixed Name Inconsistencies in Player Profiles:**
  - Updated "Will Bibi" to "Will Bibbings" consistently across all components
  - Updated "Jonathan Magnatta" to "Johnny Magnatta" consistently
  - Updated "Jeff Reiner" to "Jeffrey Reiner" consistently
  - Added name aliases in ProfilePicture component for backwards compatibility
  - Profile pictures now display correctly for all players with consistent naming
- **Updated Scoring System:**
  - Scores now calculate automatically from hole-by-hole rounds
  - Restricted manual score editing to only Nick Grossi and Connor Patterson
  - Added informational note about automatic score calculation
  - Scores pull from actual hole score data in the database
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
  - Implemented for 16 golfers with consistent names: Nick Grossi, Christian Hauck, Johnny Magnatta, Erik Boudreau, Connor Patterson, Austin Hassani, Jeffrey Reiner, Kevin Durco, Sye Ellard, Will Bibbings, Bailey Carlson, Ben Braun, Jordan Kreller, Nic Huxley, Spencer Reid, and Nick Cook
  - Shows actual photos when available, initials as fallback
  - Appears in scores, leaderboards, side bets, and navigation