/**
 * Vercel serverless adapter for TheGambler Express app.
 * Routes all requests through the Express app.
 * WebSocket real-time updates degrade to polling in this deployment.
 */
import express from "express";
import path from "path";
import fs from "fs";
// Static imports so @vercel/node bundler includes and compiles all server code
import { registerRoutes } from "../server/routes";

let appInstance: express.Express | null = null;
let initPromise: Promise<express.Express> | null = null;

async function initApp(): Promise<express.Express> {
  const app = express();

  // CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register all routes (includes session middleware setup via setupAuth)
  await registerRoutes(app);

  // Serve Vite-built frontend — check multiple possible paths
  const possiblePaths = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(__dirname, "../dist/public"),
    path.resolve(__dirname, "../../dist/public"),
  ];

  const distPath = possiblePaths.find((p) => fs.existsSync(p));

  if (distPath) {
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    app.use("*", (_req, res) => {
      res.status(503).send("Frontend build not found. Run: npm run build");
    });
  }

  appInstance = app;
  return app;
}

export default async function handler(req: any, res: any) {
  if (!initPromise) {
    initPromise = initApp().catch((err) => {
      console.error("App init failed:", err);
      initPromise = null; // allow retry
      throw err;
    });
  }
  const app = await initPromise;
  return app(req, res);
}
