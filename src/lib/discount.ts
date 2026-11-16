// Discount codes — PUBLIC, client-safe.
// This list drives the on-page preview only. The server re-resolves the code
// against Stripe promotion codes before applying anything, so a code can never
// discount the order without a matching live Stripe promotion code.
export type DiscountCode = {
  code: string;
  percentOff: number;
  blurb: string;
};

export const DISCOUNT_CODES: Record<string, DiscountCode> = {
  SASHA10: {
    code: "SASHA10",
    percentOff: 10,
    blurb: "Sasha takeover — 10% off your first order.",
  },
};

export function findDiscountCode(input: string): DiscountCode | undefined {
  const key = input.trim().toUpperCase();
  return DISCOUNT_CODES[key];
}

export function discountAmount(total: number, percentOff: number): number {
  if (!percentOff || percentOff <= 0) return 0;
  return Math.round(((total * percentOff) / 100) * 100) / 100;
}
