// Product catalog — PUBLIC, client-safe.
// NO PRICES HERE. Prices live in pricing-internal.json (never shipped to the browser).
// Customers request a quote; we quote from the internal price list.
//
// Five product lines:
//   signs      — printed safety signs (A4 / A3)
//   decals     — vinyl decals (flat colour, any size)
//   stickers   — custom die-cut stickers (matte / glossy / reflective / holographic)
//   htv        — heat transfer vinyl prints
//   laser      — laser engraving on pine

export type ProductRow = {
  name: string;
  slug: string;
  category: string;
  description: string;
  material: string;
  cut_type: string;
  min_qty: number;
  available: boolean;
  image: string;
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
    available: true,
    image: "/images/label-name-date-sheet.png",
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
  },
];
