import express from "express";
import cors from "cors";
import { initDb } from "./db/database.js";

// ── Route modules ─────────────────────────────────────────────
import authRoutes     from "./routes/auth.js";
import usersRoutes    from "./routes/users.js";
import ordersRoutes   from "./routes/orders.js";
import productsRoutes from "./routes/products.js";
import feedbackRoutes from "./routes/feedback.js";
import cartRoutes     from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";

// ── App setup ─────────────────────────────────────────────────
const app  = express();
const PORT = Number(process.env.API_PORT || 4000);

// Middleware
app.use(cors({
  origin: [
    "http://127.0.0.1:5173", // Vite dev server
    "http://localhost:5173",
    "http://127.0.0.1:8787", // Production static server
    "http://localhost:8787",
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  ],
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev mode)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    usersRoutes);
app.use("/api/orders",   ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Dhanvika Boutique API is running.", timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "API route not found." });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ ok: false, message: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────
(async () => {
  await initDb();
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`\n🌸 Dhanvika Boutique API running at http://127.0.0.1:${PORT}`);
    console.log(`   Health check → http://127.0.0.1:${PORT}/api/health\n`);
  });
})();
