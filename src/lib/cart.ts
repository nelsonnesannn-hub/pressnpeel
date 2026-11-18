// Cart — PUBLIC, client-safe. Shared by the cart store, the checkout page,
// the product/category pages and the Stripe checkout route (the server
// recomputes every total from the item fields; the posted totals are never
// trusted).
//
// Two kinds of line:
//   fixed — a catalog product at a fixed price (NFC keychains, acrylic
//           keychains, printable vinyl sheets by finish).
//   custom — made-to-order work (kiss cut, die cut, sticker packs) priced
//           from finish + size + count. A design file is REQUIRED.
//
// Prices are in CENTS internally so half-cent unit prices round on the line
// total to the nearest whole cent.

import { getProduct, getOption } from "./pricing";

export type CartKind = "fixed" | "custom";

/** The seven vinyl finishes, in the order the shop lists them. */
export const VINYL_FINISHES = [
  "Matte vinyl white",
  "Glossy vinyl white",
  "Gold reflective vinyl",
  "Silver reflective vinyl",
  "Silver holographic vinyl",
  "Broken glass silver holographic",
  "Confetti/dotted silver holographic vinyl",
] as const;

/** Per-sticker base price at 5cm, in cents (owner's price list). */
export const FINISH_BASE_CENTS: Record<string, number> = {
  "Matte vinyl white": 70,
  "Glossy vinyl white": 90,
  "Gold reflective vinyl": 110,
  "Silver reflective vinyl": 110,
  "Silver holographic vinyl": 135,
  "Broken glass silver holographic": 135,
  "Confetti/dotted silver holographic vinyl": 135,
};

/** Kiss-cut sheet fee: a flat $3.00 per order. */
export const SHEET_FEE_CENTS = 300;
/** Sticker-pack backing fee: $1.50 per pack. */
export const PACK_FEE_CENTS = 150;

const BASE_SIZE_CM = 5;
const RATE_PER_CM_CENTS = 5;
const MIN_SIZE_CM = 4;
const MAX_SIZE_CM = 10;

/** Size options in 0.5cm steps, 4–10cm (stickers) — 5cm is the price floor. */
export function sizeOptions(maxCm: number): string[] {
  const steps = Math.floor((maxCm - MIN_SIZE_CM) / 0.5) + 1;
  return Array.from({ length: steps }, (_, i) =>
    (MIN_SIZE_CM + i * 0.5).toFixed(1).replace(/\.0$/, "")
  );
}

export const STICKER_SIZE_OPTIONS = sizeOptions(MAX_SIZE_CM);

export function isFinish(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(FINISH_BASE_CENTS, value);
}

/** Parse a size string ("5", "5.5") into cm; falls back to the 5cm floor. */
export function sizeCmOf(size: string): number {
  const value = Number.parseFloat(size);
  return Number.isFinite(value) && value > 0 ? value : BASE_SIZE_CM;
}

/**
 * Per-sticker price in cents. Can be a half cent (5.5cm matte = 72.5c).
 * 5cm is the floor — a smaller size still pays the base. Null for an
 * unknown finish.
 */
export function stickerUnitCents(
  finish: string,
  size: string | number
): number | null {
  const base = FINISH_BASE_CENTS[finish];
  if (base === undefined) return null;
  const cm = typeof size === "number" ? size : sizeCmOf(size);
  const overCm = Math.max(0, cm - BASE_SIZE_CM);
  return base + overCm * RATE_PER_CM_CENTS;
}

export function formatUnitCents(cents: number): string {
  return cents % 1 === 0 ? `$${(cents / 100).toFixed(2)}` : `$${(cents / 100).toFixed(3)}`;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Round to the nearest whole cent (Stripe takes whole cents only). */
export function roundCents(value: number): number {
  return Math.round(value);
}

export type CustomKind = "kiss-cut" | "die-cut" | "sticker-packs";

export type CartItem = {
  /** Stable per-line key (same product/options re-merge into one line). */
  id: string;
  kind: CartKind;
  name: string;
  /** Shown under the name (finish, size, counts). */
  detail: string;
  /** Unit price in cents — fixed products: price per unit; custom: per sticker. */
  unitCents: number;
  quantity: number;
  /** Whole cents. The server recomputes this from the fields below. */
  lineCents: number;
  image?: string;
  productSlug?: string;
  /** Fixed-price products only. */
  optionId?: string;
  priceUnit?: string;
  minQty?: number;
  /** Custom items only. */
  custom?: {
    type: CustomKind;
    finish: string;
    sizeCm: number;
    stickerCount: number;
    /** Sticker packs only — stickers inside each pack. */
    stickersPerPack?: number;
    shape?: string;
    whiteOffset?: boolean;
    notes?: string;
    /** Uploaded design files (required). */
    files: { name: string; size: number; type: string }[];
  };
};

// ---- line keys -----------------------------------------------------------

function fixedKey(slug: string, optionId: string): string {
  return `fixed:${slug}:${optionId}`;
}

function customKey(fields: {
  type: CustomKind;
  finish: string;
  sizeCm: number;
  stickerCount: number;
  stickersPerPack?: number;
  shape?: string;
  whiteOffset?: boolean;
  fileName?: string;
}): string {
  return [
    "custom",
    fields.type,
    fields.finish,
    fields.sizeCm.toFixed(1),
    fields.stickerCount,
    fields.stickersPerPack ?? "",
    (fields.shape ?? "").trim().toLowerCase(),
    fields.whiteOffset ? "white" : "",
    (fields.fileName ?? "").toLowerCase(),
  ].join("|");
}

// ---- builders ------------------------------------------------------------

/** Build a fixed-price cart line from the catalog. Never trusts a posted price. */
export function fixedItemFromCatalog(
  slug: string,
  optionId: string,
  quantity: number
): CartItem | null {
  const product = getProduct(slug);
  if (!product || !product.buyable) return null;
  const option = getOption(product, optionId);
  const qty = Math.max(
    product.min_qty,
    Math.min(100000, Math.floor(Number(quantity)) || product.min_qty)
  );
  return {
    id: fixedKey(product.slug, option.id),
    kind: "fixed",
    name: product.name,
    detail: `${option.label} · ${product.material} · ${product.cut_type}`,
    unitCents: roundCents(option.price * 100),
    quantity: qty,
    lineCents: roundCents(option.price * 100) * qty,
    image: option.image ?? product.image,
    productSlug: product.slug,
    optionId: option.id,
    priceUnit: product.price_unit,
    minQty: product.min_qty,
  };
}

export type CustomItemInput = {
  type: CustomKind;
  finish: string;
  size: string | number;
  stickerCount: number;
  stickersPerPack?: number;
  shape?: string;
  whiteOffset?: boolean;
  notes?: string;
  files: { name: string; size: number; type: string }[];
};

/**
 * Build a custom cart line. Returns null when the finish is unknown, a count
 * is missing, or (for sticker packs) the per-pack count is missing.
 *
 * Totals:
 *   kiss cut      = per-sticker x sticker count + $3.00 flat per order
 *   die cut       = per-sticker x sticker count
 *   sticker packs = (die-cut price x stickers per pack) + $1.50 per pack,
 *                   for every pack in the order
 */
export function customItemFromInput(
  input: CustomItemInput
): CartItem | null {
  const finish = input.finish;
  if (!isFinish(finish)) return null;

  const sizeCm = sizeCmOf(typeof input.size === "number" ? String(input.size) : input.size);
  const unit = stickerUnitCents(finish, sizeCm);
  if (unit === null) return null;

  const count = Math.floor(Number(input.stickerCount));
  if (!Number.isFinite(count) || count < 1) return null;

  let lineCents = 0;
  let name = "";
  let detail = "";
  let quantity = 1;
  let stickersPerPack: number | undefined;

  if (input.type === "kiss-cut") {
    name = "Kiss cut stickers";
    lineCents = roundCents(count * unit);
    detail = `${finish} · ${sizeCm}cm · ${count} sticker${count === 1 ? "" : "s"}`;
    quantity = count;
  } else if (input.type === "die-cut") {
    name = "Die cut stickers";
    lineCents = roundCents(count * unit);
    detail = `${finish} · ${sizeCm}cm · ${count} sticker${count === 1 ? "" : "s"}`;
    quantity = count;
  } else {
    const perPack = Math.floor(Number(input.stickersPerPack));
    if (!Number.isFinite(perPack) || perPack < 1) return null;
    stickersPerPack = perPack;
    name = "Sticker packs";
    lineCents = count * (roundCents(perPack * unit) + PACK_FEE_CENTS);
    detail = `${finish} · ${sizeCm}cm · ${count} pack${count === 1 ? "" : "s"} × ${perPack} sticker${perPack === 1 ? "" : "s"}`;
    quantity = count;
  }

  const shape = (input.shape ?? "").trim();
  const parts = [detail];
  if (shape) parts.push(`shape: ${shape}`);
  if (input.whiteOffset) parts.push("white offset");
  if (input.notes && input.notes.trim()) parts.push(input.notes.trim());
  if (input.files.length > 0) {
    parts.push(`design: ${input.files.map((f) => f.name).join(", ")}`);
  }

  return {
    id: customKey({
      type: input.type,
      finish,
      sizeCm,
      stickerCount: count,
      stickersPerPack,
      shape,
      whiteOffset: input.whiteOffset,
      fileName: input.files[0]?.name ?? "",
    }),
    kind: "custom",
    name,
    detail: parts.join(" · "),
    unitCents: unit,
    quantity,
    // The $3.00 sheet fee is charged once per ORDER, not per line — see
    // sheetFeeFor(). A line total here is the sticker charges only.
    lineCents,
    custom: {
      type: input.type,
      finish,
      sizeCm,
      stickerCount: count,
      stickersPerPack,
      shape,
      whiteOffset: input.whiteOffset ?? false,
      notes: (input.notes ?? "").trim(),
      files: input.files,
    },
  };
}

/** The one flat $3.00 sheet fee, charged once per ORDER (not per line). */
export function sheetFeeFor(items: CartItem[]): number {
  return items.some((item) => item.custom?.type === "kiss-cut") ? SHEET_FEE_CENTS : 0;
}

/** Discount in cents from a percentage off a cent subtotal. */
export function discountCentsFor(subtotalCents: number, percentOff: number): number {
  if (!percentOff || percentOff <= 0) return 0;
  return Math.round((subtotalCents * percentOff) / 100);
}

/** Recompute every line total from the item fields — the server's rule. */
export function recomputeLineCents(item: CartItem): number {
  if (item.kind === "fixed") return item.unitCents * item.quantity;
  const c = item.custom;
  if (!c) return item.lineCents;
  const unit = stickerUnitCents(c.finish, c.sizeCm);
  if (unit === null) return item.lineCents;
  if (c.type === "kiss-cut") return roundCents(c.stickerCount * unit);
  if (c.type === "die-cut") return roundCents(c.stickerCount * unit);
  if (c.type === "sticker-packs" && c.stickersPerPack) {
    return c.stickerCount * (roundCents(c.stickersPerPack * unit) + PACK_FEE_CENTS);
  }
  return item.lineCents;
}

/**
 * Recompute a line total for a NEW quantity. Custom lines are priced by
 * sticker count, so their quantity is the sticker count; fixed lines are
 * priced per unit.
 */
export function lineCentsForQuantity(item: CartItem, quantity: number): number {
  if (item.kind === "fixed") return item.unitCents * quantity;
  const c = item.custom;
  if (!c) return item.lineCents;
  const unit = stickerUnitCents(c.finish, c.sizeCm);
  if (unit === null) return item.lineCents;
  if (c.type === "kiss-cut") return roundCents(quantity * unit);
  if (c.type === "die-cut") return roundCents(quantity * unit);
  if (c.type === "sticker-packs" && c.stickersPerPack) {
    return quantity * (roundCents(c.stickersPerPack * unit) + PACK_FEE_CENTS);
  }
  return item.lineCents;
}

export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Partial<CartItem>;
    if (item.kind === "fixed") {
      if (!item.productSlug || !item.optionId) continue;
      const rebuilt = fixedItemFromCatalog(
        item.productSlug,
        item.optionId,
        item.quantity ?? 1
      );
      if (!rebuilt) continue;
      out.push(rebuilt);
    } else if (item.kind === "custom" && item.custom) {
      const c = item.custom;
      if (
        (c.type === "kiss-cut" || c.type === "die-cut" || c.type === "sticker-packs") &&
        isFinish(c.finish) &&
        Number.isFinite(c.sizeCm) &&
        Number.isFinite(c.stickerCount)
      ) {
        const rebuilt = customItemFromInput({
          type: c.type,
          finish: c.finish,
          size: c.sizeCm,
          stickerCount: c.stickerCount,
          stickersPerPack: c.stickersPerPack,
          shape: c.shape,
          whiteOffset: c.whiteOffset,
          notes: c.notes,
          files: Array.isArray(c.files) ? c.files : [],
        });
        if (rebuilt) out.push(rebuilt);
      }
    }
  }
  return out;
}

/** Merge two carts, adding quantities for matching line keys. */
export function mergeItems(base: CartItem[], extra: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of base) map.set(item.id, { ...item });
  for (const item of extra) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, { ...item });
      continue;
    }
    const quantity = existing.quantity + item.quantity;
    map.set(item.id, {
      ...existing,
      quantity,
      lineCents: lineCentsForQuantity(existing, quantity),
    });
  }
  return [...map.values()];
}

/** Total item count for the header badge. */
export function itemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ---- localStorage persistence -------------------------------------------

const STORAGE_KEY = "pnp:cart:v1";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full / unavailable — the in-memory cart still works
  }
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
