// Product catalog — PUBLIC, client-safe.
// Prices are stored here (SGD) and shown at checkout. They are the single
// source of truth used by both the order summary and the Stripe integration.
//
// Buyable products (fixed price, sold through the Stripe checkout):
//   printable-vinyl   — 7 finishes, pack of 20 A4 sheets
//   nfc-keychains     — 4cm x 4cm NFC keychains, tap to open a link
//   acrylic-keychains — 5cm x 5cm acrylic keychains, all finishes
//   coasters          — laser-engraved coaster pack of 5 (birch ply / pine / acrylic)
//
// Made-to-order lines (quoted individually — never shown with a price):
//   signs, vinyl-decals, custom-stickers, htv-print, laser-engraving
//
// The shop is organised into six category pages (see ./categories):
//   Stickers and labels · Printable Vinyl Sheets · Vinyl Decals & HTV ·
//   Keychains · Laser · Signs

export type PriceOption = {
  id: string;
  label: string;
  price: number; // SGD
  /** Optional per-option photo (e.g. the printable-vinyl finish lifestyle shot). */
  image?: string;
};

export type ProductRow = {
  name: string;
  slug: string;
  category: string;
  description: string;
  material: string;
  cut_type: string;
  min_qty: number;
  min_note?: string;
  available: boolean;
  image: string;
  price: number; // base price in SGD (first option)
  price_unit: string;
  options: PriceOption[];
  /** Physical size, shown on buyable listings (e.g. "4cm x 4cm"). */
  size?: string;
  /** Buyable online through the Stripe checkout flow. */
  buyable?: boolean;
  /** Optional product video (e.g. the NFC unboxing clip). */
  video?: { src: string; poster: string };
};

export const products: ProductRow[] = [
  {
    name: "Printable Vinyl Sheets",
    slug: "printable-vinyl",
    category: "printable-vinyl",
    description:
      "Printable vinyl sold by the pack — 20 A4 sheets per pack, in seven finishes: matte white, glossy white, gold reflective, silver reflective, silver holographic, broken glass silver holographic, and confetti/dotted silver holographic.",
    material: "printable vinyl",
    cut_type: "printed sheets",
    min_qty: 1,
    min_note: "Sold as a pack of 20 A4 sheets.",
    available: true,
    image: "/images/vinyl-finishes-collage.jpg",
    price: 10.2,
    price_unit: "per pack of 20 A4 sheets",
    size: "A4 sheets — pack of 20",
    buyable: true,
    options: [
      {
        id: "matte-white",
        label: "Matte vinyl white",
        price: 10.2,
        image: "/images/v2-matte-white-lifestyle.jpg",
      },
      {
        id: "glossy-white",
        label: "Glossy vinyl white",
        price: 10.4,
        image: "/images/v2-glossy-white-lifestyle.jpg",
      },
      {
        id: "gold-reflective",
        label: "Gold reflective vinyl",
        price: 10.55,
        image: "/images/v2-gold-reflective-lifestyle.jpg",
      },
      {
        id: "silver-reflective",
        label: "Silver reflective vinyl",
        price: 10.55,
        image: "/images/v2-silver-reflective-lifestyle.jpg",
      },
      {
        id: "silver-holographic",
        label: "Silver holographic vinyl",
        price: 10.8,
        image: "/images/v2-silver-holographic-lifestyle.jpg",
      },
      {
        id: "broken-glass",
        label: "Broken glass silver holographic",
        price: 11.1,
        image: "/images/v2-broken-glass-lifestyle.jpg",
      },
      {
        id: "confetti-holographic",
        label: "Confetti/dotted silver holographic vinyl",
        price: 11.25,
        image: "/images/v2-confetti-holographic-lifestyle.jpg",
      },
    ],
  },
  {
    name: "NFC Keychains",
    slug: "nfc-keychains",
    category: "keychains",
    description:
      "Acrylic NFC keychain, 4cm x 4cm. Tap any phone on the chip to open a social-media link — no app needed. Link setup is included — just supply the link you want the keychain to open. Printed in any shape with your design.",
    material: "acrylic + NFC chip",
    cut_type: "die-cut",
    min_qty: 1,
    available: true,
    image: "/images/work/keychains/07.jpg",
    price: 5.1,
    price_unit: "each",
    size: "4cm x 4cm",
    buyable: true,
    video: {
      src: "/videos/VID_20261113_022800_555.mp4",
      poster: "/videos/posters/VID_20261113_022800_555.jpg",
    },
    options: [{ id: "4x4", label: "4cm x 4cm", price: 5.1 }],
  },
  {
    name: "Acrylic Keychains",
    slug: "acrylic-keychains",
    category: "keychains",
    description:
      "Custom acrylic keychains, 5cm x 5cm, die-cut to any shape — characters, logos, names, and more. One price for all finishes.",
    material: "acrylic",
    cut_type: "die-cut",
    min_qty: 1,
    available: true,
    image: "/images/work/keychains/04.jpg",
    price: 4.2,
    price_unit: "each",
    size: "5cm x 5cm",
    buyable: true,
    options: [{ id: "5x5", label: "5cm x 5cm — all finishes", price: 4.2 }],
  },
  {
    name: "Coaster Pack",
    slug: "coasters",
    category: "laser",
    description:
      "Laser-engraved coaster packs — birch ply, pine, or acrylic. Sold as a pack of 5 with random motivational quotes; no custom designs.",
    material: "birch ply / pine / acrylic",
    cut_type: "laser engraved",
    min_qty: 1,
    min_note: "Sold as a pack of 5 — minimum order 5 pcs (1 pack).",
    available: true,
    image: "/images/work/coasters-pine/02.jpg",
    price: 10.3,
    price_unit: "per pack of 5",
    size: "Pack of 5 coasters",
    buyable: false,
    options: [
      { id: "birch-ply", label: "Birch ply", price: 10.3 },
      { id: "pine", label: "Pine", price: 12.6 },
      { id: "acrylic", label: "Acrylic", price: 14.0 },
    ],
  },
  {
    name: "Signs",
    slug: "signs",
    category: "signs",
    description:
      "Printed safety and compliance signs — hazard warnings, danger notices, caution signs, no-smoking, and equipment labels. A4 or A3, durable vinyl.",
    material: "vinyl",
    cut_type: "printed",
    min_qty: 1,
    available: true,
    image: "/images/no-smoking-label.jpg",
    price: 2.5,
    price_unit: "per sign",
    options: [
      { id: "a4", label: "A4", price: 2.5 },
      { id: "a3", label: "A3", price: 4.5 },
    ],
  },
  {
    name: "Vinyl Decals",
    slug: "vinyl-decals",
    category: "vinyl-decals",
    description:
      "Cut-only vinyl decals — flat-colour names, words, and shapes for bottles, vehicles, laptops, and walls. Any size, any shape, weatherproof. Not printed.",
    material: "vinyl",
    cut_type: "cut-only",
    min_qty: 1,
    available: true,
    image: "/images/decal-lifestyle.jpg",
    price: 0.5,
    price_unit: "per 5cm x 5cm decal",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 0.5 }],
  },
  {
    name: "Custom Stickers",
    slug: "custom-stickers",
    category: "printable-vinyl",
    description:
      "Custom die-cut stickers in any shape — characters, logos, names, events, gift packaging. Printed on matte, glossy, reflective, or holographic vinyl.",
    material: "vinyl",
    cut_type: "die-cut",
    min_qty: 10,
    min_note:
      "Stickers are cut from a shared vinyl sheet — 10 keeps the run economical.",
    available: true,
    image: "/images/card-stickers.jpg",
    price: 0.5,
    price_unit: "per sticker",
    options: [
      { id: "matte", label: "Matte", price: 0.5 },
      { id: "glossy", label: "Glossy", price: 0.8 },
      { id: "reflective", label: "Reflective", price: 1.1 },
      { id: "holographic", label: "Holographic", price: 1.5 },
    ],
  },
  {
    name: "HTV Print",
    slug: "htv-print",
    category: "vinyl-decals",
    description:
      "Heat transfer vinyl — cut and pressed onto shirts, jerseys, and tote bags. Names, numbers, and graphics, made to order. Not printed.",
    material: "HTV",
    cut_type: "heat transfer",
    min_qty: 1,
    available: true,
    image: "/images/htv-listing.jpg",
    price: 1.0,
    price_unit: "per 5cm x 5cm print",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 1.0 }],
  },
  {
    name: "Laser Engraving",
    slug: "laser-engraving",
    category: "laser-engraving",
    description:
      "Laser engraving on pine — tokens, blocks, and boards with your design or message.",
    material: "pine",
    cut_type: "laser",
    min_qty: 1,
    available: true,
    image: "/images/name-laser-blocks.jpg",
    price: 4.5,
    price_unit: "per 5cm x 5cm piece",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 4.5 }],
  },
];

// Coaster packs — coming soon. Prices and photos are the live Laser-page set.
export type CoasterPack = {
  id: string;
  label: string;
  price: number;
  image: string;
  blurb: string;
};

export const COASTER_PACKS: CoasterPack[] = [
  {
    id: "birch-ply",
    label: "Birch ply",
    price: 10.3,
    image: "/images/work/coasters-pine/02.jpg",
    blurb: "Pack of 5 laser-engraved birch ply coasters — random motivational quotes.",
  },
  {
    id: "pine",
    label: "Pine",
    price: 12.6,
    image: "/images/work/coasters-pine/01.jpg",
    blurb: "Pack of 5 laser-engraved pine coasters — random motivational quotes.",
  },
  {
    id: "acrylic",
    label: "Acrylic",
    price: 14.0,
    image: "/images/work/coasters-holo/04.jpg",
    blurb: "Pack of 5 laser-engraved acrylic coasters — random motivational quotes.",
  },
];
