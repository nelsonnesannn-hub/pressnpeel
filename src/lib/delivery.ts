// Delivery — PUBLIC, client-safe.
//
// Nelson delivers every order himself by bike, on weekends only. The delivery
// charge is an ORDER-LEVEL fee in cents, computed here from the same shared
// helpers the cart uses, and recomputed by /api/checkout before anything is
// charged — the client totals are display-only, never trusted.
//
// The two thresholds are deliberately separate units:
//   * PIECES — stickers, labels, keychains and similar. Free at 300+ pieces.
//   * PACKS  — printable vinyl sheets (1 pack = 20 A4 sheets). Free at 6+ packs.
// Vinyl packs NEVER count toward the 300-piece rule, and pieces never count
// toward the 6-pack rule. A mixed order is free when EITHER threshold is met.
//
// Urgent next-day delivery is VINYL SHEETS ONLY.

import type { CartItem } from "./cart";

export const DELIVERY_FEE_CENTS = 225;
/** Pieces counted per keychain unit. */
export const KEYCHAIN_PIECES_PER_UNIT = 1;

/** Free-delivery thresholds. */
export const FREE_DELIVERY_PIECES = 300;
export const FREE_DELIVERY_VINYL_PACKS = 6;

/**
 * Vinyl sheet lines are counted in PACKS (printable vinyl — 20 A4 sheets per
 * pack), never in pieces and never in sheets.
 */
export function isVinylSheetItem(item: CartItem): boolean {
  return item.kind === "fixed" && item.productSlug === "printable-vinyl";
}

/** Non-vinyl lines are counted in PIECES: custom sticker counts + keychains. */
export function pieceCountFor(items: CartItem[]): number {
  let pieces = 0;
  for (const item of items) {
    if (isVinylSheetItem(item)) continue;
    if (item.kind === "custom") pieces += item.quantity;
    else if (
      item.productSlug === "nfc-keychains" ||
      item.productSlug === "acrylic-keychains"
    ) {
      pieces += item.quantity * KEYCHAIN_PIECES_PER_UNIT;
    }
    // Any other fixed line contributes nothing to the piece threshold.
  }
  return pieces;
}

export function vinylPackCountFor(items: CartItem[]): number {
  let packs = 0;
  for (const item of items) {
    if (isVinylSheetItem(item)) packs += item.quantity;
  }
  return packs;
}

/** True when the basket contains any printable vinyl sheet line. */
export function hasVinylSheets(items: CartItem[]): boolean {
  return items.some(isVinylSheetItem);
}

export type DeliveryQuote = {
  /** Charged delivery total in cents (0 = free delivery). */
  feeCents: number;
  /** Flat $2.25 charge before the urgent surcharge — kept for wording. */
  baseCents: number;
  /** +$2.25 for urgent next-day (vinyl sheets only). */
  urgentCents: number;
  /** True when the order qualifies for free delivery. */
  free: boolean;
  /** Which threshold was met, for the label. */
  reason: "pieces" | "packs" | null;
  /** Urgent is only ever offered for vinyl-sheet orders. */
  urgentAllowed: boolean;
  /** True when the caller asked for urgent AND it is allowed. */
  urgent: boolean;
};

/**
 * Compute the delivery charge for a basket.
 *
 * @param items          cart lines (already server-rebuilt)
 * @param urgent         customer asked for next-day delivery
 * @param allowUrgent    whether the UI is offering the option at all; the
 *                       server computes it from the basket itself and ignores
 *                       this field.
 */
export function deliveryFor(
  items: CartItem[],
  urgent = false,
  allowUrgent = true
): DeliveryQuote {
  const packs = vinylPackCountFor(items);
  const pieces = pieceCountFor(items);

  const freeByPieces = pieces >= FREE_DELIVERY_PIECES;
  const freeByPacks = packs >= FREE_DELIVERY_VINYL_PACKS;
  const free = freeByPieces || freeByPacks;

  const urgentAllowed = hasVinylSheets(items) && allowUrgent;
  const useUrgent = Boolean(urgent) && urgentAllowed;

  const baseCents = free ? 0 : DELIVERY_FEE_CENTS;
  const urgentCents = useUrgent ? DELIVERY_FEE_CENTS : 0;

  return {
    feeCents: baseCents + urgentCents,
    baseCents,
    urgentCents,
    free,
    reason: freeByPieces ? "pieces" : freeByPacks ? "packs" : null,
    urgentAllowed,
    urgent: useUrgent,
  };
}

// ---- site copy ------------------------------------------------------------

/** Short plain-language note, shown near the order forms and summaries. */
export const DELIVERY_NOTE =
  "Delivery is on weekends only. Lead time is 2 weeks, but usually delivered by the first weekend.";

/** Longer copy for the checkout page's delivery section. */
export const DELIVERY_TERMS_SHORT = [
  "Delivery is on weekends only.",
  "Lead time is 2 weeks, but usually delivered by the first weekend.",
] as const;

/** The pricing rules, spelled out on the checkout page. */
export const DELIVERY_RULES = [
  "Stickers, labels, keychains and similar (counted in pieces): $2.25 delivery under 300 pieces — free at 300+ pieces.",
  "Printable vinyl sheets (counted in packs of 20 A4 sheets): free at 6+ packs — $2.25 for 5 or fewer packs.",
  "Mixed orders keep the vinyl on its own 6-pack rule. Free when either threshold is met.",
  "Urgent next-day delivery is for vinyl sheets only, and adds $2.25.",
] as const;

/** Label for the delivery line in the cart / checkout totals. */
export function deliveryLabel(quote: DeliveryQuote): string {
  if (quote.free && quote.urgent) {
    return "Delivery (weekend — urgent next day)";
  }
  if (quote.free) {
    return "Delivery (weekends)";
  }
  if (quote.urgent) {
    return "Delivery (urgent next day)";
  }
  return "Delivery (weekends)";
}
