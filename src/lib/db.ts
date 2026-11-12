// Server-only data access layer.
// Imports better-sqlite3 (Node built-ins) — never import this from a client component.
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { products, type ProductRow } from "./catalog";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "..", "..", "..", "pressnpeel.db");

// Ensure directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL DEFAULT 0,
        material TEXT DEFAULT 'glossy vinyl',
        cut_type TEXT DEFAULT 'die-cut',
        min_qty INTEGER DEFAULT 1,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        order_type TEXT NOT NULL DEFAULT 'b2c',
        status TEXT DEFAULT 'pending',
        total REAL NOT NULL,
        notes TEXT,
        design_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        material TEXT,
        cut_type TEXT,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS cart (
        session_id TEXT PRIMARY KEY,
        items TEXT NOT NULL DEFAULT '[]'
      );
    `);

    _db = db;
  }
  return _db;
}

export { dbPath };

export function seedProducts() {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO products (name, slug, category, description, material, cut_type, min_qty, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insert = db.transaction((rows: ProductRow[]) => {
    for (const p of rows) {
      stmt.run(
        p.name,
        p.slug,
        p.category,
        p.description,
        p.material,
        p.cut_type,
        p.min_qty,
        p.available
      );
    }
  });

  insert(products);
}
