import { Router } from "express";
import { getDb, createId } from "../db/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Helper: attach measurements to orders ────────────────────
function attachMeasurements(db, orders) {
  return orders.map((order) => {
    const measurements = db.all(
      "SELECT field_name, value FROM measurements WHERE order_id = ?",
      [order.id]
    );
    const measurementsMap = {};
    for (const m of measurements) measurementsMap[m.field_name] = m.value;

    // Reconstruct the nested `outfit` object expected by the frontend
    const outfit = {
      title: order.outfit_title || order.outfit_type,
      category: order.outfit_category || order.outfit_type,
      id: (order.outfit_type || "").toLowerCase().replace(/\s+/g, "-"),
    };

    return {
      ...order,
      outfit,
      extras: order.extras ? JSON.parse(order.extras) : [],
      measurements: measurementsMap,
      // Friendly aliases used by front-end components
      price: order.total_price,
      createdAt: order.created_at,
      customization: {
        neckStyle: order.neck_style,
        sleeveStyle: order.sleeve_style,
        fittingStyle: order.fitting,
        extras: order.extras ? JSON.parse(order.extras) : [],
      },
    };
  });
}

// ── GET /api/orders ───────────────────────────────────────────
router.get("/", requireAuth, (req, res) => {
  const db = getDb();

  const rows =
    req.user.role === "admin"
      ? db.all(`
          SELECT o.*, u.name AS user_name, u.email AS user_email
          FROM orders o
          LEFT JOIN users u ON u.id = o.user_id
          ORDER BY o.created_at DESC
        `)
      : db.all(`
          SELECT o.*, u.name AS user_name, u.email AS user_email
          FROM orders o
          LEFT JOIN users u ON u.id = o.user_id
          WHERE o.user_id = ?
          ORDER BY o.created_at DESC
        `, [req.user.id]);

  return res.json({ ok: true, orders: attachMeasurements(db, rows) });
});

// ── GET /api/orders/:id ───────────────────────────────────────
router.get("/:id", requireAuth, (req, res) => {
  const db = getDb();
  const order = db.get(`
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
  `, [req.params.id]);

  if (!order) return res.status(404).json({ ok: false, message: "Order not found." });
  if (req.user.role !== "admin" && order.user_id !== req.user.id) {
    return res.status(403).json({ ok: false, message: "Access denied." });
  }

  const [enriched] = attachMeasurements(db, [order]);
  return res.json({ ok: true, order: enriched });
});

// ── POST /api/orders ──────────────────────────────────────────
router.post("/", requireAuth, (req, res) => {
  const {
    outfit_type,
    outfit_title,
    outfit_category,
    total_price,
    neck_style,
    sleeve_style,
    fitting,
    extras,
    notes,
    measurements,
    fabric_image,
    customer_name,
    customer_email,
    customer_phone,
    unit,
  } = req.body || {};

  if (!outfit_type || total_price == null) {
    return res.status(400).json({ ok: false, message: "outfit_type and total_price are required." });
  }

  const db = getDb();
  const orderId = createId("order");
  const now = new Date().toISOString();

  // Resolve customer info — admin may supply it for offline orders
  const resolvedName  = customer_name  || req.user.name  || null;
  const resolvedEmail = customer_email || req.user.email || null;

  db.run(`
    INSERT INTO orders
      (id, user_id, outfit_type, outfit_title, outfit_category,
       total_price, neck_style, sleeve_style, fitting, extras, notes,
       fabric_image, customer_name, customer_email, customer_phone, unit,
       created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    orderId,
    req.user.id,
    outfit_type,
    outfit_title || outfit_type,
    outfit_category || outfit_type,
    Number(total_price),
    neck_style   || null,
    sleeve_style || null,
    fitting      || null,
    extras ? JSON.stringify(extras) : null,
    notes        || null,
    fabric_image || null,
    resolvedName,
    resolvedEmail,
    customer_phone || null,
    unit || "Inches",
    now,
    now,
  ]);

  // Save measurements
  if (measurements && typeof measurements === "object") {
    for (const [field, value] of Object.entries(measurements)) {
      if (value !== undefined && value !== "") {
        db.run(
          "INSERT INTO measurements (id, order_id, user_id, field_name, value) VALUES (?, ?, ?, ?, ?)",
          [createId("meas"), orderId, req.user.id, field, String(value)]
        );
      }
    }
  }

  const order = db.get("SELECT * FROM orders WHERE id = ?", [orderId]);
  const [enriched] = attachMeasurements(db, [order]);
  return res.status(201).json({ ok: true, order: enriched });
});

// ── PUT /api/orders/:id/status  (admin only) ─────────────────
router.put("/:id/status", requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const VALID = ["Order Received", "Cutting", "Stitching", "Ready", "Delivered"];

  if (!status || !VALID.includes(status)) {
    return res.status(400).json({ ok: false, message: `Status must be one of: ${VALID.join(", ")}` });
  }

  const db = getDb();
  const existing = db.get("SELECT id FROM orders WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ ok: false, message: "Order not found." });

  db.run("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?",
    [status, new Date().toISOString(), req.params.id]);

  const order = db.get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  const [enriched] = attachMeasurements(db, [order]);
  return res.json({ ok: true, order: enriched });
});

// ── DELETE /api/orders/:id  (admin only) ─────────────────────
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.get("SELECT id FROM orders WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ ok: false, message: "Order not found." });

  db.run("DELETE FROM orders WHERE id = ?", [req.params.id]);
  return res.json({ ok: true, message: "Order deleted." });
});

export default router;
