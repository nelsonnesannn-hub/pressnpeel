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

// ---- Kiss-cut sticker pricing -------------------------------------------
// Kiss-cut stickers are ordered BY STICKER, not by sheet:
//   order total = per-sticker price x total number of stickers
//                 + a flat $3.00 per order for the sheets.
// Per-sticker price = finish base at 5cm + 5c per cm over 5cm (5cm is the
// floor — smaller sizes still pay the base). Half-cent unit prices round on
// the line total to the nearest whole cent (Stripe takes whole cents only).

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

const KISS_CUT_ORDER_FEE_CENTS = 300;
const KISS_CUT_BASE_SIZE_CM = 5;
const KISS_CUT_RATE_PER_CM_CENTS = 5;

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
 * Order total in whole cents: (per-sticker price x sticker count, rounded to
 * the nearest whole cent) + the flat $3.00 sheet fee. Null without a valid
 * finish or sticker count.
 */
export function kissCutTotalCents(
  finish: string,
  sizeCm: number,
  stickerCount: number
): number | null {
  const perSticker = kissCutStickerCents(finish, sizeCm);
  if (perSticker === null) return null;
  const count = Math.floor(Number(stickerCount));
  if (!Number.isFinite(count) || count < 1) return null;
  return Math.round(count * perSticker) + KISS_CUT_ORDER_FEE_CENTS;
}

/**
 * Per-sticker price for display: $0.70, or $0.725 when the unit price is a
 * half cent. The line total is what rounds, not the unit price.
 */
export function formatKissCutUnit(cents: number): string {
  return cents % 1 === 0
    ? formatSGD(cents / 100)
    : `$${(cents / 100).toFixed(3)}`;
}
