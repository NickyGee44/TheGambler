import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

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

let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInit() {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await registerRoutes(app);
    initialized = true;
  })();
  return initPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureInit();
    app(req, res);
  } catch (error: any) {
    console.error("Vercel handler error:", error);
    res.status(500).json({ error: "Internal server error", detail: error?.message });
  }
}
