import jwt from "jsonwebtoken";
import { getDb } from "../db/database.js";

const ADMIN_EMAIL = "admin@stitchaura.com";

/**
 * Middleware: verifies/decodes the Firebase Bearer ID Token in the Authorization header.
 * Automatically synchronizes the user with the SQLite users table to ensure foreign keys work.
 * On success, attaches `req.user = { id, email, name, role }`.
 */
export function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Authentication required." });
  }

  try {
    // Decode the Firebase ID Token (JWT)
    const payload = jwt.decode(token);
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ ok: false, message: "Invalid or corrupt token." });
    }

    // Optional: check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ ok: false, message: "Token has expired." });
    }

    const userId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = (payload.name || payload.email.split("@")[0] || "User").trim();

    const db = getDb();
    let user = db.get("SELECT * FROM users WHERE id = ?", [userId]);

    if (!user) {
      // Auto-register user in local SQLite DB if they don't exist yet
      const role = email === ADMIN_EMAIL ? "admin" : "user";
      db.run(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, 'firebase', ?)",
        [userId, name, email, role]
      );
      user = { id: userId, name, email, role };
    }

    // Attach synced user object to req
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("[Auth Middleware Error]", err);
    return res.status(401).json({ ok: false, message: "Invalid or expired token." });
  }
}

/**
 * Middleware: allows access only if the authenticated user has the 'admin' role.
 * Must be used AFTER requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Admin access required." });
  }
  next();
}

/** Placeholder for any backward compatibility requirements */
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    "dhanvika_boutique_secret_key_change_in_production",
    { expiresIn: "7d" }
  );
}
