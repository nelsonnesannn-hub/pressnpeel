// Stock state — SERVER ONLY.
//
// One JSON blob in the shared KV store, key pnp:stock:v1:
//   { counts: { <lineKey>: <units> }, available: { <lineKey>: <bool> } }
//
// A line with no count is "quantity unknown" and stays orderable; a line whose
// count is 0 is Sold out and is blocked in the checkout/order path. A line
// whose available flag is false is paused entirely ("stop selling this").
//
// Nothing is seeded with invented quantities: an absent count means Nelson has
// not entered one yet, so every line starts available and unrestricted.

import { createClient, type VercelKV } from "@vercel/kv";
import { STOCK_LINES } from "./stock-keys";

export type StockState = {
  counts: Record<string, number>;
  available: Record<string, boolean>;
};

const STOCK_KEY = "pnp:stock:v1";

function kvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REST_TOKEN ||
    "";
  if (!url || !token) return null;
  return { url, token };
}

let _client: VercelKV | null = null;

function client(): VercelKV | null {
  const creds = kvCredentials();
  if (!creds) return null;
  if (!_client) {
    _client = createClient({ url: creds.url, token: creds.token });
  }
  return _client;
}

export const EMPTY_STOCK: StockState = { counts: {}, available: {} };

/** Only line keys the site actually sells can be stored. */
function sanitize(raw: unknown): StockState {
  const state = (raw ?? {}) as {
    counts?: Record<string, unknown>;
    available?: Record<string, unknown>;
  };
  const known = new Set(STOCK_LINES.map((line) => line.key));
  const counts: Record<string, number> = {};
  const available: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(state.counts ?? {})) {
    if (!known.has(key)) continue;
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) counts[key] = Math.floor(n);
  }
  for (const [key, value] of Object.entries(state.available ?? {})) {
    if (!known.has(key)) continue;
    available[key] = value === true || value === "true" || value === 1;
  }
  return { counts, available };
}

export async function getStockState(): Promise<StockState> {
  const c = client();
  if (c) {
    try {
      const raw = await c.get<StockState>(STOCK_KEY);
      if (raw && typeof raw === "object") return sanitize(raw);
    } catch (err) {
      console.error("KV stock read failed:", err);
    }
  }
  return { counts: {}, available: {} };
}

export async function saveStockState(state: StockState): Promise<StockState> {
  const clean = sanitize(state);
  const c = client();
  if (c) {
    try {
      await c.set(STOCK_KEY, clean);
      return clean;
    } catch (err) {
      console.error("KV stock write failed:", err);
    }
  }
  return clean;
}

export function countFor(state: StockState, key: string): number | null {
  const value = state.counts[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

/** True when the line may be sold. A paused line is blocked even if stocked. */
export function isLineAvailable(state: StockState, key: string): boolean {
  return state.available[key] !== false;
}

/** True when a count is known and has run out. */
export function isSoldOut(state: StockState, key: string): boolean {
  const count = countFor(state, key);
  return count !== null && count <= 0;
}

/** True when a counted line is at or below its low-stock warning level. */
export function isLowStock(
  state: StockState,
  key: string,
  lowAt: number | undefined
): boolean {
  if (!lowAt) return false;
  const count = countFor(state, key);
  if (count === null) return false;
  return count > 0 && count <= lowAt;
}

/**
 * Why a line cannot be ordered, or null when it can. `label` is used in the
 * customer-facing message.
 */
export function blockReason(
  state: StockState,
  key: string,
  label: string
): string | null {
  if (!isLineAvailable(state, key)) {
    return `"${label}" is unavailable right now — please order via WhatsApp or contact us.`;
  }
  if (isSoldOut(state, key)) {
    return `"${label}" is sold out.`;
  }
  return null;
}

/** Reduce a line's count by `qty`. Unknown counts stay unknown; never negative. */
export async function decrementStock(
  state: StockState,
  key: string,
  qty: number
): Promise<StockState> {
  const count = countFor(state, key);
  if (count === null || qty <= 0) return state;
  const next = { ...state.counts, [key]: Math.max(0, count - qty) };
  return saveStockState({ ...state, counts: next });
}

/**
 * Apply several decrements to one in-memory state and report whether anything
 * changed, so a basket costs one KV write.
 */
export function decrementInState(
  state: StockState,
  entries: { key: string; qty: number }[]
): { state: StockState; changed: boolean } {
  const counts = { ...state.counts };
  let changed = false;
  for (const entry of entries) {
    const count = countFor(state, entry.key);
    if (count === null || entry.qty <= 0) continue;
    counts[entry.key] = Math.max(0, count - entry.qty);
    changed = true;
  }
  return changed ? { state: { ...state, counts }, changed } : { state, changed };
}

/** Block a whole basket, returning the first offending line's message. */
export function basketBlockReason(
  state: StockState,
  lines: { key: string; label: string }[]
): string | null {
  for (const line of lines) {
    const reason = blockReason(state, line.key, line.label);
    if (reason) return reason;
  }
  return null;
}

export type StockLineState = {
  key: string;
  label: string;
  kind: "counted" | "made-to-order";
  productSlug?: string;
  optionId?: string;
  lowAt?: number;
  soldOn: string;
  count: number | null;
  available: boolean;
  soldOut: boolean;
  low: boolean;
};

export function stockLineStates(state: StockState): StockLineState[] {
  return STOCK_LINES.map((line) => ({
    key: line.key,
    label: line.label,
    kind: line.kind,
    productSlug: line.productSlug,
    optionId: line.optionId,
    lowAt: line.lowAt,
    soldOn: line.soldOn,
    count: countFor(state, line.key),
    available: isLineAvailable(state, line.key),
    soldOut: isSoldOut(state, line.key),
    low: isLowStock(state, line.key, line.lowAt),
  }));
}
