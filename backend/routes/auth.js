import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb, createId } from "../db/database.js";
import { signToken } from "../middleware/auth.js";

const router = Router();

const ADMIN_EMAIL    = "admin@stitchaura.com";
const ADMIN_PASSWORD = "admin123";

// ── POST /api/auth/signup ─────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, message: "Name, email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL) {
    return res.status(400).json({ ok: false, message: "This email is reserved for boutique admin login." });
  }

  if (password.length < 4) {
    return res.status(400).json({ ok: false, message: "Password must be at least 4 characters." });
  }

  const db = getDb();

  const existing = db.get("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
  if (existing) {
    return res.status(409).json({ ok: false, message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = createId("user");

  db.run(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'user')",
    [id, name.trim(), normalizedEmail, passwordHash]
  );

  const user = { id, name: name.trim(), email: normalizedEmail, role: "user" };
  const token = signToken(user);
  return res.status(201).json({ ok: true, token, user });
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Admin shortcut
  if (normalizedEmail === ADMIN_EMAIL) {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ ok: false, message: "Invalid email or password." });
    }
    const adminUser = { id: "admin", name: "Boutique Admin", email: ADMIN_EMAIL, role: "admin" };
    return res.json({ ok: true, token: signToken(adminUser), user: adminUser });
  }

  const db = getDb();
  const row = db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

  if (!row) {
    return res.status(401).json({ ok: false, message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ ok: false, message: "Invalid email or password." });
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = signToken(user);
  return res.json({ ok: true, token, user });
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post("/logout", (_req, res) => {
  res.json({ ok: true, message: "Logged out successfully." });
});

export default router;
