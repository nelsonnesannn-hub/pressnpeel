// Product catalog — PUBLIC, client-safe.
// Prices are stored here (SGD) and shown at checkout. They are the single
// source of truth used by both the order summary and the Stripe integration.
//
// Five made-to-order lines (quoted individually):
//   signs      — printed safety signs (A4 / A3)
//   decals     — vinyl decals (flat colour, any size)
//   stickers   — custom die-cut stickers (matte / glossy / reflective / holographic)
//   htv        — heat transfer vinyl prints
//   laser      — laser engraving on pine
//
// Plus three buyable products with fixed prices, sold through the Stripe
// checkout flow (buyable: true):
//   nfc-keychains     — 4cm x 4cm NFC keychains, tap to open a link
//   acrylic-keychains — 5cm x 5cm acrylic keychains, all finishes
//   printable-vinyl   — printable vinyl, pack of 20 A4 sheets

export type PriceOption = {
  id: string;
  label: string;
  price: number; // SGD
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
    category: "decals",
    description:
      "Flat-colour vinyl decals for bottles, vehicles, laptops, and walls. Any size, any shape, weatherproof — no white border.",
    material: "vinyl",
    cut_type: "die-cut",
    min_qty: 1,
    available: true,
    image: "/images/name-bottle-decal.jpg",
    price: 0.5,
    price_unit: "per 5cm x 5cm decal",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 0.5 }],
  },
  {
    name: "Custom Stickers",
    slug: "custom-stickers",
    category: "stickers",
    description:
      "Custom die-cut stickers in any shape — characters, logos, names, events, gift packaging. Matte, glossy, reflective, or holographic.",
    material: "vinyl",
    cut_type: "die-cut",
    min_qty: 10,
    min_note:
      "Stickers are cut from a shared vinyl sheet — 10 keeps the run economical.",
    available: true,
    image: "/images/label-name-date-sheet.png",
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
    category: "htv",
    description:
      "Heat transfer vinyl prints on shirts and jerseys — names, numbers, graphics, pressed on demand.",
    material: "HTV",
    cut_type: "die-cut",
    min_qty: 1,
    available: true,
    image: "/images/jersey-name-11.jpg",
    price: 1.0,
    price_unit: "per 5cm x 5cm print",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 1.0 }],
  },
  {
    name: "Laser Engraving",
    slug: "laser-engraving",
    category: "laser",
    description:
      "Laser engraving on pine — coasters, tokens, blocks, boards, and keychains with your design or message.",
    material: "pine",
    cut_type: "laser",
    min_qty: 1,
    available: true,
    image: "/images/name-laser-blocks.jpg",
    price: 4.5,
    price_unit: "per 5cm x 5cm piece",
    options: [{ id: "5x5", label: "5cm x 5cm", price: 4.5 }],
  },
  {
    name: "NFC Keychains",
    slug: "nfc-keychains",
    category: "nfc-keychains",
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
    category: "acrylic-keychains",
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
    name: "Printable Vinyl",
    slug: "printable-vinyl",
    category: "printable-vinyl",
    description:
      "Printable vinyl sold by the pack — 20 A4 sheets per pack. Choose reflective, gold, confetti, glossy white, matte white, or holographic. Holographic is +$0.30 per pack.",
    material: "printable vinyl",
    cut_type: "printed sheets",
    min_qty: 1,
    min_note: "Sold as a pack of 20 A4 sheets.",
    available: true,
    image: "/images/work/materials/03.jpg",
    price: 8.55,
    price_unit: "per pack of 20 A4 sheets",
    size: "A4 sheets — pack of 20",
    buyable: true,
    options: [
      { id: "reflective", label: "Reflective", price: 8.55 },
      { id: "gold", label: "Gold", price: 8.55 },
      { id: "confetti", label: "Confetti", price: 8.55 },
      { id: "glossy-white", label: "Glossy white", price: 8.55 },
      { id: "matte-white", label: "Matte white", price: 8.55 },
      { id: "holographic", label: "Holographic", price: 8.85 },
    ],
  },
];
