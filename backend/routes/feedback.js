import { Router } from "express";
import { getDb, createId } from "../db/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── GET /api/feedback  (public) ───────────────────────────────
router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.all(`
    SELECT f.*, u.name AS user_name
    FROM feedback f
    LEFT JOIN users u ON u.id = f.user_id
    ORDER BY f.created_at DESC
  `);
  return res.json({ ok: true, feedback: rows });
});

// ── POST /api/feedback  (authenticated) ───────────────────────
router.post("/", requireAuth, (req, res) => {
  const { name, outfit_type, rating, message } = req.body || {};

  if (!name || !outfit_type || rating == null || !message) {
    return res.status(400).json({ ok: false, message: "name, outfit_type, rating and message are required." });
  }

  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ ok: false, message: "Rating must be an integer between 1 and 5." });
  }

  const db = getDb();
  const id = createId("fb");
  const now = new Date().toISOString();

  db.run(
    "INSERT INTO feedback (id, user_id, name, outfit_type, rating, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, req.user.id, name.trim(), outfit_type.trim(), numRating, message.trim(), now]
  );

  const row = db.get("SELECT * FROM feedback WHERE id = ?", [id]);
  return res.status(201).json({ ok: true, feedback: row });
});

// ── DELETE /api/feedback/:id  (admin only) ────────────────────
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.get("SELECT id FROM feedback WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ ok: false, message: "Feedback not found." });

  db.run("DELETE FROM feedback WHERE id = ?", [req.params.id]);
  return res.json({ ok: true, message: "Feedback deleted." });
});

export default router;
