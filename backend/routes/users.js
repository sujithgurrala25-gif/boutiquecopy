import { Router } from "express";
import { getDb } from "../db/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── GET /api/users ────────────────────────────────────────────
router.get("/", requireAuth, (req, res) => {
  const db = getDb();

  if (req.user.role === "admin") {
    const users = db.all(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json({ ok: true, users });
  }

  const user = db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!user) return res.status(404).json({ ok: false, message: "User not found." });
  return res.json({ ok: true, user });
});

// ── GET /api/users/me ──────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  const db = getDb();
  const user = db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!user) return res.status(404).json({ ok: false, message: "User not found." });
  return res.json({ ok: true, user });
});

// ── GET /api/users/:id ────────────────────────────────────────
router.get("/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).json({ ok: false, message: "Access denied." });
  }

  const db = getDb();
  const user = db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  if (!user) return res.status(404).json({ ok: false, message: "User not found." });
  return res.json({ ok: true, user });
});

// ── PUT /api/users/:id ────────────────────────────────────────
router.put("/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user.id !== id) {
    return res.status(403).json({ ok: false, message: "Access denied." });
  }

  const { name, email } = req.body || {};
  if (!name && !email) {
    return res.status(400).json({ ok: false, message: "Provide at least name or email to update." });
  }

  const db = getDb();
  const existing = db.get("SELECT * FROM users WHERE id = ?", [id]);
  if (!existing) return res.status(404).json({ ok: false, message: "User not found." });

  const updatedName  = name  ? name.trim()              : existing.name;
  const updatedEmail = email ? email.trim().toLowerCase() : existing.email;

  if (updatedEmail !== existing.email) {
    const clash = db.get("SELECT id FROM users WHERE email = ? AND id != ?", [updatedEmail, id]);
    if (clash) return res.status(409).json({ ok: false, message: "Email already in use." });
  }

  db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [updatedName, updatedEmail, id]);

  const updated = db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return res.json({ ok: true, user: updated });
});

// ── DELETE /api/users/:id  (admin only) ──────────────────────
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const user = db.get("SELECT id FROM users WHERE id = ?", [id]);
  if (!user) return res.status(404).json({ ok: false, message: "User not found." });

  db.run("DELETE FROM users WHERE id = ?", [id]);
  return res.json({ ok: true, message: "User deleted." });
});

export default router;
