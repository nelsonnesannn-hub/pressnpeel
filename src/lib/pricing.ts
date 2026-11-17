// Pricing helpers — PUBLIC, client-safe (imports only the catalog).
// The server recomputes every total from here; the client only displays it.
import { products, type ProductRow, type PriceOption } from "./catalog";

export function getProduct(slug: string): ProductRow | undefined {
  return products.find((p) => p.slug === slug);
}

export function getOption(product: ProductRow, optionId: string): PriceOption {
  return (
    product.options.find((o) => o.id === optionId) ?? product.options[0]
  );
}

export function computeTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatSGD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// ---- Kiss-cut sticker sheet pricing -------------------------------------
// Kiss-cut stickers are ordered BY SHEET. At 5x5cm with a 3mm gap between
// stickers one row of the sheet is left free, so the counts are fixed:
//   A4 = 3 across x 4 down = 12 stickers per sheet
//   A3 = 5 across x 6 down = 30 stickers per sheet
// Sheet price = 20c border die cut + (stickers per sheet x per-sticker price).
// Per-sticker price = finish base at 5cm + 5c per cm over 5cm (5cm is the
// floor — smaller sizes still pay the base). Half-cent unit prices round on
// the line total to the nearest whole cent (Stripe takes whole cents only).

export const KISS_CUT_SHEET_SIZES = [
  { id: "A4", label: "A4", stickersPerSheet: 12 },
  { id: "A3", label: "A3", stickersPerSheet: 30 },
] as const;

export type KissCutSheetSize = (typeof KISS_CUT_SHEET_SIZES)[number];

/** Finish base price per sticker at 5cm, in cents. */
export const KISS_CUT_FINISH_BASE_CENTS: Record<string, number> = {
  "Matte vinyl white": 70,
  "Glossy vinyl white": 90,
  "Gold reflective vinyl": 110,
  "Silver reflective vinyl": 110,
  "Silver holographic vinyl": 135,
  "Broken glass silver holographic": 135,
  "Confetti/dotted silver holographic vinyl": 135,
};

const KISS_CUT_BORDER_CENTS = 20;
const KISS_CUT_BASE_SIZE_CM = 5;
const KISS_CUT_RATE_PER_CM_CENTS = 5;

/** Fixed sticker count for a sheet size, or null for an unknown size. */
export function kissCutStickersPerSheet(sheetSizeId: string): number | null {
  const found = KISS_CUT_SHEET_SIZES.find((s) => s.id === sheetSizeId);
  return found ? found.stickersPerSheet : null;
}

/** Parse a size string ("5", "5.5") into cm; falls back to the 5cm floor. */
export function kissCutSizeCm(size: string): number {
  const value = Number.parseFloat(size);
  return Number.isFinite(value) && value > 0 ? value : KISS_CUT_BASE_SIZE_CM;
}

/**
 * Per-sticker price in cents. Can be a half cent (e.g. 5.5cm matte = 72.5).
 * Returns null when the finish is not one of the 7 vinyl finishes.
 */
export function kissCutStickerCents(
  finish: string,
  sizeCm: number
): number | null {
  const base = KISS_CUT_FINISH_BASE_CENTS[finish];
  if (base === undefined) return null;
  const overCm = Math.max(0, sizeCm - KISS_CUT_BASE_SIZE_CM);
  return base + overCm * KISS_CUT_RATE_PER_CM_CENTS;
}

/**
 * Per-sheet price in whole cents: 20c border die cut + stickers per sheet at
 * the per-sticker price, rounded to the nearest cent. Null without a finish.
 */
export function kissCutSheetCents(
  finish: string,
  sizeCm: number,
  stickersPerSheet: number
): number | null {
  const perSticker = kissCutStickerCents(finish, sizeCm);
  if (perSticker === null) return null;
  return Math.round(KISS_CUT_BORDER_CENTS + stickersPerSheet * perSticker);
}

/** Order line total in whole cents (per-sheet price x number of sheets). */
export function kissCutTotalCents(sheetCents: number, sheets: number): number {
  return Math.round(sheetCents * sheets);
}
