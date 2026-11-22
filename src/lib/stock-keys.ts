// Stock lines — PUBLIC, client-safe (pure data + key helpers, no KV import).
//
// Two kinds of stock:
//   counted       — vinyl packs (resell) and finished keychains / coasters.
//                   A number per line; selling reduces it; at 0 the line is
//                   "Sold out" and cannot be ordered.
//   made-to-order — custom stickers / labels / signs. No count, only an
//                   Available on/off toggle.
//
// Every sellable line also has a toggle, so a line can be stopped instantly
// from the admin without deleting anything.

export type StockLineKind = "counted" | "made-to-order";

export type StockLine = {
  /** KV key inside the pnp:stock:v1 blob. */
  key: string;
  label: string;
  kind: StockLineKind;
  /** Catalog product this line belongs to, when there is one. */
  productSlug?: string;
  /** Catalog option (per-finish lines). */
  optionId?: string;
  /** Low-stock warning threshold in units. Vinyl packs: 2. */
  lowAt?: number;
  /** Where the customer buys it. */
  soldOn: string;
};

const VINYL: { optionId: string; label: string }[] = [
  { optionId: "matte-white", label: "Matte vinyl white" },
  { optionId: "glossy-white", label: "Glossy vinyl white" },
  { optionId: "gold-reflective", label: "Gold reflective vinyl" },
  { optionId: "silver-reflective", label: "Silver reflective vinyl" },
  { optionId: "silver-holographic", label: "Silver holographic vinyl" },
  { optionId: "broken-glass", label: "Broken glass silver holographic" },
  {
    optionId: "confetti-holographic",
    label: "Confetti/dotted silver holographic vinyl",
  },
];

/** Low-stock warning level for vinyl packs. */
export const VINYL_LOW_STOCK = 2;

export const STOCK_LINES: StockLine[] = [
  ...VINYL.map((finish) => ({
    key: `printable-vinyl:${finish.optionId}`,
    label: `${finish.label} — pack of 20 A4 sheets`,
    kind: "counted" as StockLineKind,
    productSlug: "printable-vinyl",
    optionId: finish.optionId,
    lowAt: VINYL_LOW_STOCK,
    soldOn: "/products/printable-vinyl#order",
  })),
  {
    key: "nfc-keychains",
    label: "NFC keychains (4cm x 4cm)",
    kind: "counted",
    productSlug: "nfc-keychains",
    soldOn: "/products/keychains#order",
  },
  {
    key: "acrylic-keychains",
    label: "Acrylic keychains (5cm x 5cm)",
    kind: "counted",
    productSlug: "acrylic-keychains",
    soldOn: "/products/keychains#order",
  },
  {
    key: "coasters:birch-ply",
    label: "Coaster pack — birch ply (pack of 5)",
    kind: "counted",
    productSlug: "coasters",
    optionId: "birch-ply",
    soldOn: "/products/laser",
  },
  {
    key: "coasters:pine",
    label: "Coaster pack — pine (pack of 5)",
    kind: "counted",
    productSlug: "coasters",
    optionId: "pine",
    soldOn: "/products/laser",
  },
  {
    key: "coasters:acrylic",
    label: "Coaster pack — acrylic (pack of 5)",
    kind: "counted",
    productSlug: "coasters",
    optionId: "acrylic",
    soldOn: "/products/laser",
  },
  {
    key: "custom:kiss-cut",
    label: "Kiss cut stickers",
    kind: "made-to-order",
    productSlug: "custom-stickers",
    soldOn: "/products/stickers-and-labels#order-kiss-cut",
  },
  {
    key: "custom:die-cut",
    label: "Die cut stickers",
    kind: "made-to-order",
    productSlug: "custom-stickers",
    soldOn: "/products/stickers-and-labels#order-die-cut",
  },
  {
    key: "custom:sticker-packs",
    label: "Sticker packs",
    kind: "made-to-order",
    productSlug: "custom-stickers",
    soldOn: "/products/stickers-and-labels#order-sticker-packs",
  },
  {
    key: "product:signs",
    label: "Signs",
    kind: "made-to-order",
    productSlug: "signs",
    soldOn: "/products/signs",
  },
  {
    key: "product:vinyl-decals",
    label: "Vinyl decals & HTV",
    kind: "made-to-order",
    productSlug: "vinyl-decals",
    soldOn: "/products/vinyl-decals",
  },
  {
    key: "product:htv-print",
    label: "HTV print",
    kind: "made-to-order",
    productSlug: "htv-print",
    soldOn: "/products/vinyl-decals",
  },
  {
    key: "product:laser-engraving",
    label: "Laser engraving",
    kind: "made-to-order",
    productSlug: "laser-engraving",
    soldOn: "/products/laser",
  },
];

export function stockLine(key: string): StockLine | undefined {
  return STOCK_LINES.find((line) => line.key === key);
}

/** Products whose counted stock is tracked per option (finish / pack). */
const PER_OPTION_PRODUCTS = new Set(["printable-vinyl", "coasters"]);

/** Stock key for a fixed-price cart/order line. */
export function stockKeyForFixed(
  productSlug: string,
  optionId?: string
): string {
  if (optionId && PER_OPTION_PRODUCTS.has(productSlug)) {
    return `${productSlug}:${optionId}`;
  }
  return productSlug;
}

/** Stock key for a made-to-order cart line. */
export function stockKeyForCustom(type: string): string {
  return `custom:${type}`;
}

/** Stock key for a quote-only enquiry. */
export function stockKeyForProduct(productSlug: string): string {
  return `product:${productSlug}`;
}

/**
 * Stock key for a quote enquiry (the /api/order path). Returns null when the
 * enquiry is not a stock-controlled line.
 */
export function stockKeyForEnquiry(
  source: string,
  isKissCut: boolean
): string | null {
  if (isKissCut) return "custom:kiss-cut";
  const text = source.toLowerCase();
  if (text.includes("signs")) return "product:signs";
  if (text.includes("vinyl decal")) return "product:vinyl-decals";
  if (text.includes("htv")) return "product:htv-print";
  if (text.includes("laser")) return "product:laser-engraving";
  return null;
}
