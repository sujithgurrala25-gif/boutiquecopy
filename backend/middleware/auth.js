import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dhanvika_boutique_secret_key_change_in_production";

/**
 * Middleware: verifies the Bearer JWT in the Authorization header.
 * On success, attaches `req.user = { id, email, role }`.
 */
export function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
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

/** Creates a signed JWT token for a user. */
export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
