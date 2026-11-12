// Backwards-compatible re-export.
// Product data now lives in ./catalog (client-safe).
// DB access lives in ./db (server-only, better-sqlite3).
export { products } from "./catalog";
export type { ProductRow } from "./catalog";
export { seedProducts } from "./db";
/* ------------------------------------------------------------------ */

