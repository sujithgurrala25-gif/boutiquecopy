import { Router } from "express";
import { getDb, createId } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── GET /api/cart  ────────────────────────────────────────────
router.get("/", requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.all(`
    SELECT c.id, c.quantity, c.product_id,
           p.name, p.category, p.price, p.stock, p.image_url, p.description
    FROM cart c
    LEFT JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.id
  `, [req.user.id]);

  const items = rows.map((r) => ({
    id: r.product_id,
    cartId: r.id,
    quantity: r.quantity,
    name: r.name,
    category: r.category,
    price: r.price,
    stock: r.stock,
    image: r.image_url,
    description: r.description,
  }));

  return res.json({ ok: true, cart: items });
});

// ── POST /api/cart  (add or increment) ───────────────────────
router.post("/", requireAuth, (req, res) => {
  const { product_id } = req.body || {};
  if (!product_id) {
    return res.status(400).json({ ok: false, message: "product_id is required." });
  }

  const db = getDb();

  // Verify product exists
  const product = db.get("SELECT * FROM products WHERE id = ?", [product_id]);
  if (!product) {
    return res.status(404).json({ ok: false, message: "Product not found." });
  }

  // Upsert: if already in cart, keep as-is (idempotent add)
  const existing = db.get(
    "SELECT id FROM cart WHERE user_id = ? AND product_id = ?",
    [req.user.id, product_id]
  );

  if (!existing) {
    db.run(
      "INSERT INTO cart (id, user_id, product_id, quantity) VALUES (?, ?, ?, 1)",
      [createId("cart"), req.user.id, product_id]
    );
  }

  // Return updated cart
  const rows = db.all(`
    SELECT c.id, c.quantity, c.product_id,
           p.name, p.category, p.price, p.stock, p.image_url, p.description
    FROM cart c
    LEFT JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.id
  `, [req.user.id]);

  const cart = rows.map((r) => ({
    id: r.product_id,
    cartId: r.id,
    quantity: r.quantity,
    name: r.name,
    category: r.category,
    price: r.price,
    stock: r.stock,
    image: r.image_url,
    description: r.description,
  }));

  return res.json({ ok: true, cart });
});

// ── DELETE /api/cart/:productId  ──────────────────────────────
router.delete("/:productId", requireAuth, (req, res) => {
  const db = getDb();
  db.run(
    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
    [req.user.id, req.params.productId]
  );

  const rows = db.all(`
    SELECT c.id, c.quantity, c.product_id,
           p.name, p.category, p.price, p.stock, p.image_url, p.description
    FROM cart c
    LEFT JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.id
  `, [req.user.id]);

  const cart = rows.map((r) => ({
    id: r.product_id,
    cartId: r.id,
    quantity: r.quantity,
    name: r.name,
    category: r.category,
    price: r.price,
    stock: r.stock,
    image: r.image_url,
    description: r.description,
  }));

  return res.json({ ok: true, cart });
});

// ── DELETE /api/cart  (clear all) ─────────────────────────────
router.delete("/", requireAuth, (req, res) => {
  const db = getDb();
  db.run("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
  return res.json({ ok: true, cart: [] });
});

export default router;
