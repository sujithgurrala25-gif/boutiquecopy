import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// DB file path — defaults to backend/db/boutique.db, override via DB_PATH env
const DB_PATH = resolve(
  process.env.DB_PATH || resolve(__dirname, "boutique.db")
);

let db;
let SQL; // sql.js module reference

/** Auto-save the database to disk every time it's modified */
function persistDb() {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

/** Wraps a write operation and persists afterwards */
function runWrite(sql, params = []) {
  db.run(sql, params);
  persistDb();
}

/** Execute a single SELECT that returns one row */
function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

/** Execute a SELECT that returns all matching rows */
function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/**
 * Opens (or creates) the SQLite database and runs the schema migrations.
 * Called once at server startup.
 */
export async function initDb() {
  SQL = await initSqlJs();

  // Ensure directory exists
  const dbDir = dirname(DB_PATH);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

  // Load existing DB or create a new one
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys & WAL mode
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = MEMORY;");

  // Run schema (CREATE TABLE IF NOT EXISTS — safe to re-run)
  const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf8");
  db.run(schema);

  // Persist so the file is created
  persistDb();

  // Seed default products if none exist
  seedProducts();

  console.log(`[DB] SQLite (sql.js) ready at ${DB_PATH}`);
}

/** Returns a simple db API compatible with the route handlers */
export function getDb() {
  if (!db) throw new Error("Database not initialised. Call initDb() first.");
  return {
    /** Run a write statement (INSERT/UPDATE/DELETE) */
    run(sql, params = []) {
      db.run(sql, params);
      persistDb();
    },
    /** Return a single row or null */
    get(sql, params = []) {
      return getOne(sql, params);
    },
    /** Return all matching rows */
    all(sql, params = []) {
      return getAll(sql, params);
    },
    /** Execute multiple SQL statements (schema etc.) */
    exec(sql) {
      db.run(sql);
      persistDb();
    },
    /**
     * Run multiple writes in a pseudo-transaction.
     * sql.js doesn't expose real nested transactions but
     * we wrap in BEGIN/COMMIT for atomicity.
     */
    transaction(fn) {
      return (...args) => {
        db.run("BEGIN;");
        try {
          fn(...args);
          db.run("COMMIT;");
          persistDb();
        } catch (e) {
          db.run("ROLLBACK;");
          throw e;
        }
      };
    },
  };
}

/** Generates a prefixed UUID-based ID (e.g. "user-a1b2c3d4") */
export function createId(prefix = "id") {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

// ── Seed Data ────────────────────────────────────────────────
function seedProducts() {
  const result = getOne("SELECT COUNT(*) as n FROM products");
  if (result && result.n > 0) return;

  const seedData = [
    {
      id: "product-blouse-001",
      name: "Designer Blouse Stitching",
      category: "Blouse",
      price: 1600,
      stock: 18,
      description: "Premium blouse stitching with custom neck, sleeve, lining, and fitting options.",
    },
    {
      id: "product-kurti-001",
      name: "Elegant Kurti Stitching",
      category: "Kurti",
      price: 1900,
      stock: 24,
      description: "Comfortable daily or festive kurti stitching based on exact body measurements.",
    },
    {
      id: "product-frock-001",
      name: "Long Frock Stitching",
      category: "Long Frock",
      price: 2600,
      stock: 12,
      description: "Flowing long frock design with graceful fall, neat finish, and modern silhouette.",
    },
    {
      id: "product-lehenga-001",
      name: "Bridal Lehenga Stitching",
      category: "Lehenga",
      price: 5200,
      stock: 8,
      description: "Occasion-ready lehenga stitching with lining, embroidery, tassels, and structured fit.",
    },
  ];

  for (const row of seedData) {
    db.run(
      "INSERT INTO products (id, name, category, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)",
      [row.id, row.name, row.category, row.price, row.stock, row.description]
    );
  }
  persistDb();
  console.log("[DB] Seeded default products.");
}
