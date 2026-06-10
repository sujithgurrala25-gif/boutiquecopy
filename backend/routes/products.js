import { Router } from "express";
import { getDb, createId } from "../db/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── GET /api/products  (public) ───────────────────────────────
router.get("/", (req, res) => {
  const db = getDb();
  const { category } = req.query;

  const products = category
    ? db.all("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC", [category])
    : db.all("SELECT * FROM products ORDER BY created_at DESC");

  return res.json({ ok: true, products });
});

// ── GET /api/products/:id  (public) ───────────────────────────
router.get("/:id", (req, res) => {
  const db = getDb();
  const product = db.get("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!product) return res.status(404).json({ ok: false, message: "Product not found." });
  return res.json({ ok: true, product });
});

// ── POST /api/products  (admin only) ─────────────────────────
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { name, category, price, stock, image_url, description } = req.body || {};

  if (!name || !category || price == null) {
    return res.status(400).json({ ok: false, message: "Name, category and price are required." });
  }
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ ok: false, message: "Price must be a non-negative number." });
  }

  const db = getDb();
  const id = createId("product");

  db.run(
    "INSERT INTO products (id, name, category, price, stock, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, name.trim(), category.trim(), Number(price), Number(stock || 0), image_url || null, description || null]
  );

  const product = db.get("SELECT * FROM products WHERE id = ?", [id]);
  return res.status(201).json({ ok: true, product });
});

// ── PUT /api/products/:id  (admin only) ───────────────────────
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.get("SELECT * FROM products WHERE id = ?", [id]);
  if (!existing) return res.status(404).json({ ok: false, message: "Product not found." });

  const name        = req.body.name        ?? existing.name;
  const category    = req.body.category    ?? existing.category;
  const price       = req.body.price       ?? existing.price;
  const stock       = req.body.stock       ?? existing.stock;
  const image_url   = req.body.image_url   ?? existing.image_url;
  const description = req.body.description ?? existing.description;

  if (isNaN(price) || price < 0) {
    return res.status(400).json({ ok: false, message: "Price must be a non-negative number." });
  }

  db.run(
    "UPDATE products SET name=?, category=?, price=?, stock=?, image_url=?, description=? WHERE id=?",
    [String(name).trim(), String(category).trim(), Number(price), Number(stock), image_url, description, id]
  );

  const updated = db.get("SELECT * FROM products WHERE id = ?", [id]);
  return res.json({ ok: true, product: updated });
});

// ── DELETE /api/products/:id  (admin only) ────────────────────
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.get("SELECT id FROM products WHERE id = ?", [id]);
  if (!existing) return res.status(404).json({ ok: false, message: "Product not found." });

  db.run("DELETE FROM products WHERE id = ?", [id]);
  return res.json({ ok: true, message: "Product deleted." });
});

export default router;
