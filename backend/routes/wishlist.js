import { Router } from "express";
import { getDb, createId } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Helper: fetch wishlist with product details
function getWishlistRows(db, userId) {
  const rows = db.all(`
    SELECT w.id, w.product_id,
           p.name, p.category, p.price, p.stock, p.image_url, p.description
    FROM wishlist w
    LEFT JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ?
    ORDER BY w.id
  `, [userId]);

  return rows.map((r) => ({
    id: r.product_id,
    wishlistId: r.id,
    name: r.name,
    category: r.category,
    price: r.price,
    stock: r.stock,
    image: r.image_url,
    description: r.description,
  }));
}

// ── GET /api/wishlist  ────────────────────────────────────────
router.get("/", requireAuth, (req, res) => {
  const db = getDb();
  return res.json({ ok: true, wishlist: getWishlistRows(db, req.user.id) });
});

// ── POST /api/wishlist/:productId  (toggle) ───────────────────
router.post("/:productId", requireAuth, (req, res) => {
  const db = getDb();
  const { productId } = req.params;

  // Verify product exists
  const product = db.get("SELECT id FROM products WHERE id = ?", [productId]);
  if (!product) {
    return res.status(404).json({ ok: false, message: "Product not found." });
  }

  const existing = db.get(
    "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
    [req.user.id, productId]
  );

  if (existing) {
    // Remove if already in wishlist (toggle off)
    db.run("DELETE FROM wishlist WHERE id = ?", [existing.id]);
  } else {
    // Add to wishlist (toggle on)
    db.run(
      "INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)",
      [createId("wl"), req.user.id, productId]
    );
  }

  return res.json({ ok: true, wishlist: getWishlistRows(db, req.user.id) });
});

// ── DELETE /api/wishlist/:productId  ──────────────────────────
router.delete("/:productId", requireAuth, (req, res) => {
  const db = getDb();
  db.run(
    "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
    [req.user.id, req.params.productId]
  );
  return res.json({ ok: true, wishlist: getWishlistRows(db, req.user.id) });
});

export default router;
