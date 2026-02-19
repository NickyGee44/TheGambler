// Minimal test - no server imports
export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, path: req.url, env: !!process.env.DATABASE_URL });
}
