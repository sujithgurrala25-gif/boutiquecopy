import { Router } from "express";

const router = Router();

// ── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", (_req, res) => {
  return res.status(400).json({
    ok: false,
    message: "Custom signup is disabled. Use Firebase Authentication on the client instead.",
  });
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", (_req, res) => {
  return res.status(400).json({
    ok: false,
    message: "Custom login is disabled. Use Firebase Authentication on the client instead.",
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post("/logout", (_req, res) => {
  return res.json({
    ok: true,
    message: "Custom session cleared. Note: Client-side Firebase Authentication handles signout.",
  });
});

export default router;
