import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

// Simple token store for fallback authentication
const tokenStore = new Map<string, { userId: number; expires: number }>();

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function createUserToken(userId: number): string {
  const token = generateToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  tokenStore.set(token, { userId, expires });
  return token;
}

export function getUserFromToken(token: string): number | null {
  const tokenData = tokenStore.get(token);
  if (!tokenData || tokenData.expires < Date.now()) {
    if (tokenData) tokenStore.delete(token);
    return null;
  }
  return tokenData.userId;
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  });

  // Debug session store
  sessionStore.on('error', (err) => {
    console.error('Session store error:', err);
  });

  sessionStore.on('connect', () => {
    console.log('Session store connected');
  });

  sessionStore.on('disconnect', () => {
    console.log('Session store disconnected');
  });

  const isProduction = process.env.NODE_ENV === "production";
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "gambler-cup-2025-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: "gambler-cup-session",
    cookie: {
      secure: isProduction, // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? "none" : "lax", // Use "none" for cross-site in production
    },
  };

  app.set("trust proxy", 1);
  
  // Add CORS configuration for production
  if (isProduction) {
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      // Allow requests from the deployed domain
      if (origin && origin.includes('.replit.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      next();
    });
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'playerName',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, playerName, password, done) => {
        // Parse first and last name from selected player name
        const [firstName, lastName] = playerName.split(' ');
        const user = await storage.getUserByName(firstName, lastName);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const { playerName, password } = req.body;
    
    if (!playerName || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Parse first and last name from selected player name
    const [firstName, lastName] = playerName.split(' ');
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "Invalid player name format" });
    }

    const existingUser = await storage.getUserByName(firstName, lastName);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await storage.createUser({
      firstName,
      lastName,
      password: await hashPassword(password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      
      // Also create a token for fallback authentication
      const token = createUserToken(user.id);
      
      res.status(201).json({ 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName,
        token: token // Include token for fallback authentication
      });
    });
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", { playerName: req.body.playerName, sessionID: req.sessionID });
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("req.login error:", err);
          return next(err);
        }
        
        console.log("Login successful:", { 
          userId: user.id, 
          sessionID: req.sessionID,
          isAuthenticated: req.isAuthenticated()
        });
        
        // Also create a token for fallback authentication
        const token = createUserToken(user.id);
        
        res.json({ 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName,
          token: token // Include token for fallback authentication
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Destroy the session
      req.session.destroy((err) => {
        if (err) return next(err);
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", async (req, res) => {
    console.log("User request:", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      user: req.user,
      cookies: req.headers.cookie,
      authToken: req.headers.authorization
    });
    
    // First try session-based authentication
    if (req.isAuthenticated()) {
      const user = req.user as SelectUser;
      console.log("User authenticated via session:", user);
      return res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
    }
    
    // Fallback to token-based authentication
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userId = getUserFromToken(token);
      
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (user) {
            console.log("User authenticated via token:", user);
            return res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
          }
        } catch (error) {
          console.error("Error fetching user by token:", error);
        }
      }
    }
    
    console.log("Not authenticated, returning 401");
    return res.sendStatus(401);
  });

  // Quick login endpoint for testing
  app.post("/api/quick-login", async (req, res) => {
    try {
      const user = await storage.getUserByName("Nick", "Grossi");
      if (user) {
        req.login(user, (err) => {
          if (err) throw err;
          res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Browser quick login endpoint for testing
  app.get("/api/browser-quick-login", async (req, res) => {
    try {
      const user = await storage.getUserByName("Nick", "Grossi");
      if (user) {
        req.login(user, (err) => {
          if (err) throw err;
          res.redirect("/");
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Debug session endpoint
  app.get("/api/debug-session", (req, res) => {
    res.json({
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      session: req.session,
      cookies: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      nodeEnv: process.env.NODE_ENV,
      hasSessionSecret: !!process.env.SESSION_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  });
}