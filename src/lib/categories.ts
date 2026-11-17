// Product categories — the six shop categories, each with its own page.
// Every category page shows samples of what is available plus a custom order
// form, so customers can see the range and order without a separate flow.
import { products, type PriceOption } from "./catalog";
import { formatSGD } from "./pricing";

export type CategorySample = {
  src: string;
  caption: string;
  /** Price label for fixed-price products only (never invented). */
  priceLabel?: string;
  /** Link to the existing Stripe order flow for this sample. */
  orderHref?: string;
  /** Small pill shown on the card (e.g. "Coming soon"). */
  badge?: string;
};

export type CategoryOrderItem = { id: string; label: string };

export type SampleGroup = {
  /** Optional heading rendered above this group of sample cards. */
  title?: string;
  samples: CategorySample[];
};

/** The 7 printable-vinyl finishes — names only, never prices. */
export const VINYL_FINISHES = [
  "Matte vinyl white",
  "Glossy vinyl white",
  "Gold reflective vinyl",
  "Silver reflective vinyl",
  "Silver holographic vinyl",
  "Broken glass silver holographic",
  "Confetti/dotted silver holographic vinyl",
];

/** Vinyl Decals & HTV colour options. */
export const DECAL_COLOURS = [
  "Black",
  "White",
  "Blue",
  "Green",
  "Red",
  "Gold",
  "Silver Holographic",
];

export type QuoteUploadField = {
  /** Form field id, also used as the enquiry label. */
  id: string;
  label: string;
  hint?: string;
  /** Allow more than one file (sticker images). */
  multiple?: boolean;
  /** Require at least one file in this field before the form can submit. */
  required?: boolean;
};

/** Optional extra fields rendered by the category order form. */
export type OrderFormConfig = {
  /** "Vinyl printed on" selector with the 7 finishes. */
  vinylSelector?: boolean;
  /** Size + shape fields. */
  sizeShape?: boolean;
  /** Only show size/shape when the selected item id is in this list. */
  sizeShapeItems?: string[];
  /** Cap the size selector (cm). Defaults to 10cm. */
  sizeMaxCm?: number;
  /** "White offset" choice. */
  whiteOffset?: boolean;
  /** Require at least one design image before the form can submit. */
  requireDesign?: boolean;
  /** Extra upload fields carried through to the enquiry. */
  uploads?: QuoteUploadField[];
};

export type QuoteSection = {
  id: string;
  title: string;
  blurb?: string;
  samples: CategorySample[];
  /** Per-section form extras. */
  form?: OrderFormConfig;
};

export type Category = {
  slug: string;
  /** Short label used in the header dropdown. */
  name: string;
  /** Page heading. */
  title: string;
  tagline: string;
  description: string;
  cardImage: string;
  samples: CategorySample[];
  /** Grouped layout for the samples section (optional). */
  sampleGroups?: SampleGroup[];
  samplesIntro?: string;
  samplesNote?: string;
  /** Split quote sections; falls back to one form when absent. */
  quoteSections?: QuoteSection[];
  orderTitle: string;
  orderSubtitle: string;
  orderItems: CategoryOrderItem[];
  /** Teaser only — no order form and kept out of the Products dropdown. */
  comingSoon?: boolean;
  /** Custom heading for the coming-soon teaser block. */
  comingSoonTitle?: string;
  /** Hide the order form entirely (coming-soon note instead). */
  orderable?: boolean;
  /** Colour options shown on the page (Vinyl Decals & HTV). */
  colours?: string[];
  /** Form extras for the single-form layout (when quoteSections is absent). */
  form?: OrderFormConfig;
};

const product = (slug: string) => {
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error(`Unknown product: ${slug}`);
  return found;
};

const option = (slug: string, optionId: string): PriceOption => {
  const p = product(slug);
  return p.options.find((o) => o.id === optionId) ?? p.options[0];
};

const buyHref = (slug: string, optionId?: string) =>
  optionId
    ? `/order?product=${slug}&option=${encodeURIComponent(optionId)}`
    : `/order?product=${slug}`;

/** Badge shown on category cards (home + /products index). */
export function categoryBadge(category: Category): string | undefined {
  if (category.comingSoon) return "Coming soon";
  if (category.orderable === false) return "Coming soon";
  return undefined;
}

// Stickers & labels samples — kept as a named list so the category page can
// group the two label-sheet shots under their own heading without duplicating
// data. GAMX equipment labels appears once (the duplicate shot was removed).
const labelSheetSrcs = new Set([
  "/images/work/safety-labels/01.jpg",
  "/images/work/safety-labels/05.jpg",
]);

const stickerSamples: CategorySample[] = [
  { src: "/images/work/motivational/03.jpg", caption: "Keep Going sticker pile" },
  { src: "/images/work/brand/01.jpg", caption: "Eaispire mascot assortment" },
  { src: "/images/work/brand/09.jpg", caption: "Eaispire sticker pile" },
  { src: "/images/work/b2b/01.jpg", caption: "JGR Fit For Use inspection labels" },
  {
    src: "/images/work/childrens-day/01.jpg",
    caption: "Coach Julia — Shine Brightly, Little Gymnast",
  },
  {
    src: "/images/work/childrens-day/02.jpg",
    caption: "Coach Rey / KGA — Happy Children's Day",
  },
  { src: "/images/work/eaispire/01.jpg", caption: "Eaispire mascot sticker assortment" },
  { src: "/images/work/eaispire/04.jpg", caption: "Eaispire mascot and logo stickers" },
  { src: "/images/work/motivational/08.jpg", caption: "Motivational stickers" },
  { src: "/images/work/motivational/16.jpg", caption: "It's a new day — motivational sticker" },
  { src: "/images/work/events/01.jpg", caption: "Children's Day gymnastics stickers" },
  { src: "/images/work/events/02.jpg", caption: "Sarah unicorn birthday stickers" },
  { src: "/images/work/small-business/01.jpg", caption: "Small-business brand stickers" },
  { src: "/images/work/safety-labels/01.jpg", caption: "GAMX equipment labels" },
  { src: "/images/work/safety-labels/05.jpg", caption: "Safety Inducted tags" },
  { src: "/images/work/pnp-cards/01.jpg", caption: "Press N Peel logo vinyl stickers" },
];

export const categories: Category[] = [
  {
    slug: "stickers-and-labels",
    name: "Stickers and labels",
    title: "Stickers and Labels",
    tagline: "Finished stickers & labels — quoted per job",
    description:
      "Finished die-cut stickers and printed labels — motivational sticker ranges, brand and logo stickers, B2B equipment labels, and event stickers. Send us your design and we’ll quote it.",
    cardImage: "/images/stickers-labels-lifestyle.jpg",
    samplesIntro:
      "Samples of finished work — quoted per job, no published prices.",
    samples: stickerSamples,
    sampleGroups: [
      { samples: stickerSamples.filter((s) => !labelSheetSrcs.has(s.src)) },
      {
        title: "Label sheets / Kiss cut",
        samples: stickerSamples.filter((s) => labelSheetSrcs.has(s.src)),
      },
    ],
    quoteSections: [
      {
        id: "kiss-cut",
        title: "Kiss cut",
        blurb: "Sticker sheets with peelable stickers, used as labels.",
        samples: [
          {
            src: "/images/kiss-cut-sample-shazana-shaik.jpg",
            caption: "By Shazana Shaik — purple round kiss-cut sticker sheet",
          },
          {
            src: "/images/kiss-cut-sample-av-engineering.jpg",
            caption: "AV ENGINEERING — kiss-cut label sheet",
          },
          {
            src: "/images/kiss-cut-sample-hyp.jpg",
            caption: "HYP — kiss-cut label sheet",
          },
        ],
        form: { vinylSelector: true, sizeShape: true, requireDesign: true },
      },
      {
        id: "die-cut",
        title: "Die cut",
        blurb: "Die-cut stickers cut to the exact shape of your design.",
        samples: [
          {
            src: "/images/die-cut-sample-pressnpeel-holographic.jpg",
            caption: "Press N Peel logo vinyl stickers",
          },
          {
            src: "/images/die-cut-sample-coach-rey.jpg",
            caption: "Coach Rey Children's Day die-cut stickers",
          },
          {
            src: "/images/die-cut-sample-eaispire-robot.jpg",
            caption: "Eaispire robot mascot die-cut stickers",
          },
        ],
        form: {
          vinylSelector: true,
          sizeShape: true,
          whiteOffset: true,
          requireDesign: true,
        },
      },
      {
        id: "sticker-packs",
        title: "Sticker packs",
        blurb:
          "Die-cut stickers packed with printed backings — for gifts and events.",
        samples: [
          {
            src: "/images/sticker-pack-sample-eaispire-back.jpg",
            caption: "Eaispire Meetup #01 pack — back (Learn it. Build it. Make it. + QR)",
          },
          {
            src: "/images/sticker-pack-sample-eaispire-front.jpg",
            caption: "Eaispire Meetup #01 pack — front with sticker fan",
          },
          {
            src: "/images/sticker-pack-sample-eaispire-row.jpg",
            caption: "Eaispire Meetup #01 sticker packs — row of 4",
          },
        ],
        form: {
          vinylSelector: true,
          sizeShape: true,
          requireDesign: true,
          uploads: [
            {
              id: "sticker_images",
              label: "Sticker images",
              hint: "Upload one or more sticker designs",
              multiple: true,
              required: true,
            },
            {
              id: "backing_front",
              label: "Backing — front image",
              hint: "One image for the front of the backing card",
              required: true,
            },
            {
              id: "backing_back",
              label: "Backing — back image",
              hint: "One image for the back of the backing card",
              required: true,
            },
          ],
        },
      },
    ],
    orderTitle: "Request a Quote — Stickers & Labels",
    orderSubtitle:
      "Upload your artwork and tell us the size, finish, and quantity. We’ll reply on WhatsApp or email with a quote before any payment.",
    orderItems: [
      { id: "die-cut-stickers", label: "Custom die-cut stickers" },
      { id: "logo-stickers", label: "Logo / brand stickers" },
      { id: "labels", label: "Equipment / safety labels" },
      { id: "event", label: "Event & celebration stickers" },
      { id: "other", label: "Other stickers & labels" },
    ],
  },
  {
    slug: "printable-vinyl",
    name: "Printable Vinyl Sheets",
    title: "Printable Vinyl Sheets",
    tagline: "Printable vinyl sheets in 7 finishes — sold by the pack",
    description:
      "Printable vinyl sold by the pack — 20 A4 sheets per pack, in seven finishes. Print your own stickers and labels, or send us your design and we’ll print and cut them for you.",
    cardImage: "/images/vinyl-sheets-lifestyle.jpg",
    samplesIntro: "1 pack = 20 A4 sheets. Prices are per pack.",
    samples: [
      {
        src: "/images/v2-matte-white-listing.jpg",
        caption: "Matte vinyl white",
        priceLabel: `${formatSGD(option("printable-vinyl", "matte-white").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "matte-white"),
      },
      {
        src: "/images/v2-glossy-white-listing.jpg",
        caption: "Glossy vinyl white",
        priceLabel: `${formatSGD(option("printable-vinyl", "glossy-white").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "glossy-white"),
      },
      {
        src: "/images/v2-gold-reflective-listing.jpg",
        caption: "Gold reflective vinyl",
        priceLabel: `${formatSGD(option("printable-vinyl", "gold-reflective").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "gold-reflective"),
      },
      {
        src: "/images/v2-silver-reflective-listing.jpg",
        caption: "Silver reflective vinyl",
        priceLabel: `${formatSGD(option("printable-vinyl", "silver-reflective").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "silver-reflective"),
      },
      {
        src: "/images/v2-silver-holographic-listing.jpg",
        caption: "Silver holographic vinyl",
        priceLabel: `${formatSGD(option("printable-vinyl", "silver-holographic").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "silver-holographic"),
      },
      {
        src: "/images/v2-broken-glass-listing.jpg",
        caption: "Broken glass silver holographic",
        priceLabel: `${formatSGD(option("printable-vinyl", "broken-glass").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "broken-glass"),
      },
      {
        src: "/images/v2-confetti-holographic-listing.jpg",
        caption: "Confetti/dotted silver holographic vinyl",
        priceLabel: `${formatSGD(option("printable-vinyl", "confetti-holographic").price)} per pack`,
        orderHref: buyHref("printable-vinyl", "confetti-holographic"),
      },
    ],
    orderTitle: "Order Printable Vinyl Sheets",
    orderSubtitle:
      "Tell us the finish and quantity, or upload your design and we’ll print and cut it for you.",
    orderItems: [
      { id: "matte-white", label: "Matte vinyl white" },
      { id: "glossy-white", label: "Glossy vinyl white" },
      { id: "gold-reflective", label: "Gold reflective vinyl" },
      { id: "silver-reflective", label: "Silver reflective vinyl" },
      { id: "silver-holographic", label: "Silver holographic vinyl" },
      { id: "broken-glass", label: "Broken glass silver holographic" },
      {
        id: "confetti-holographic",
        label: "Confetti/dotted silver holographic vinyl",
      },
      { id: "custom", label: "Custom size / other printed vinyl" },
    ],
  },
  {
    slug: "vinyl-decals",
    name: "Vinyl Decals",
    title: "Vinyl Decals & HTV",
    tagline: "Non-printable vinyl — cut-only decals & heat transfer",
    description:
      "Cut-only vinyl, not printed. Vinyl decals are cut names, words, and shapes applied to bottles, vehicles, laptops, and walls. HTV (heat transfer vinyl) is cut and pressed onto fabric — shirts, jerseys, and tote bags.",
    cardImage: "/images/decal-lifestyle.jpg",
    samplesIntro:
      "Decals for bottles, vehicles, laptops, and walls · HTV pressed onto fabric. Quoted per job — no published prices.",
    samples: [
      {
        src: "/images/decal-listing.jpg",
        caption: "Vinyl decal — bottle listing",
      },
      {
        src: "/images/decal-lifestyle.jpg",
        caption: "Name decal applied to a bottle",
      },
      {
        src: "/images/htv-listing.jpg",
        caption: "HTV — heat transfer vinyl on a shirt",
      },
      {
        src: "/images/htv-lifestyle.jpg",
        caption: "HTV pressed onto a folded tee",
      },
    ],
    orderTitle: "Vinyl Decals & HTV — Coming Soon",
    orderSubtitle:
      "Vinyl decals and HTV are not orderable yet. See the samples and colour options, and message us on WhatsApp to be notified.",
    orderItems: [
      { id: "decal", label: "Vinyl decal" },
      { id: "htv", label: "HTV / heat transfer vinyl" },
      { id: "other", label: "Other cut-only vinyl" },
    ],
    colours: DECAL_COLOURS,
    comingSoon: true,
    orderable: false,
  },
  {
    slug: "keychains",
    name: "Keychains",
    title: "Keychains",
    tagline: "NFC & acrylic keychains",
    description:
      "Custom keychains made to order in any shape. NFC keychains tap to open a link — no app needed; acrylic keychains are printed in full colour. Tell us your design and we’ll handle the rest.",
    cardImage: "/images/keychains-lifestyle.jpg",
    samplesIntro:
      "NFC keychains $5.10 each (4cm x 4cm, min 1) · Acrylic keychains $4.20 each (5cm x 5cm, min 1).",
    samples: [
      {
        src: "/images/work/keychains/07.jpg",
        caption: "NFC Keychains — 4cm x 4cm · tap to open a link",
        priceLabel: `${formatSGD(product("nfc-keychains").price)} each`,
        orderHref: buyHref("nfc-keychains"),
      },
      {
        src: "/images/work/keychains/04.jpg",
        caption: "Acrylic Keychains — 5cm x 5cm · any shape",
        priceLabel: `${formatSGD(product("acrylic-keychains").price)} each`,
        orderHref: buyHref("acrylic-keychains"),
      },
      {
        src: "/images/work/keychains/01.jpg",
        caption: "Gold jellyfish keychain",
      },
      {
        src: "/images/work/keychains/02.jpg",
        caption: "Blue jellyfish keychain",
      },
      {
        src: "/images/work/keychains/05.jpg",
        caption: "Silver jellyfish keychain",
      },
      {
        src: "/images/work/keychains/06.jpg",
        caption: "Keychain collection",
      },
      { src: "/images/work/keychains/08.jpg", caption: "Silver jellyfish keychain" },
      { src: "/images/work/keychains/09.jpg", caption: "Blue jellyfish keychain" },
      {
        src: "/images/work/keychains/10.jpg",
        caption: "Sea-creature keychain collection",
      },
      { src: "/images/work/keychains/13.jpg", caption: "Keychain row" },
      {
        src: "/images/work/keychains/18.jpg",
        caption: "NFC keychains — tap to open a link",
      },
      {
        src: "/images/work/keychains/21.jpg",
        caption: "NFC keychain with dog sticker",
      },
    ],
    orderTitle: "Order Custom Keychains",
    orderSubtitle:
      "Upload your artwork and tell us the quantity. NFC link setup is included — just supply the link.",
    orderItems: [
      { id: "nfc", label: "NFC keychain (4cm x 4cm)" },
      { id: "other", label: "Other custom keychain" },
    ],
    form: {
      sizeShape: true,
      sizeShapeItems: ["nfc"],
      sizeMaxCm: 6,
      requireDesign: true,
    },
  },
  {
    slug: "laser",
    name: "Laser",
    title: "Laser — Coasters",
    tagline: "Laser-engraved coaster packs — coming soon",
    description:
      "Laser-engraved coaster packs made to order — birch ply, pine, or acrylic. Sold as a pack of 5 with random motivational quotes; no custom designs.",
    cardImage: "/images/laser-lifestyle.jpg",
    samplesIntro:
      "Packs of 5 · random motivational quotes · no custom designs.",
    samples: [
      {
        src: "/images/work/coasters-pine/02.jpg",
        caption: "Birch ply — engraved coasters",
        priceLabel: `${formatSGD(option("coasters", "birch-ply").price)} per pack of 5`,
        badge: "Coming soon",
      },
      {
        src: "/images/work/coasters-pine/01.jpg",
        caption: "Pine — engraved coasters",
        priceLabel: `${formatSGD(option("coasters", "pine").price)} per pack of 5`,
        badge: "Coming soon",
      },
      {
        src: "/images/work/coasters-holo/04.jpg",
        caption: "Acrylic — engraved coasters",
        priceLabel: `${formatSGD(option("coasters", "acrylic").price)} per pack of 5`,
        badge: "Coming soon",
      },
      {
        src: "/images/work/coasters-pine/03.jpg",
        caption: "Engraved coasters in a row",
      },
      {
        src: "/images/work/coasters-holo/02.jpg",
        caption: "Jellyfish coaster",
      },
      {
        src: "/images/work/coasters-holo/05.jpg",
        caption: "Starfish coaster",
      },
      {
        src: "/images/work/coasters-birch/01.jpg",
        caption: "Birch ply — engraved coasters",
      },
      {
        src: "/images/work/coasters-birch/02.jpg",
        caption: "Keep going, you're closer than you think",
      },
      { src: "/images/work/coasters-pine/05.jpg", caption: "Pine — engraved coasters" },
      {
        src: "/images/work/coasters-holo/07.jpg",
        caption: "Starfish holographic coaster",
      },
      {
        src: "/images/work/coasters-holo/09.jpg",
        caption: "Keep Going — holographic coaster",
      },
      { src: "/images/work/coasters-pine/07.jpg", caption: "Engraved coasters in a row" },
    ],
    orderTitle: "Coaster Packs — Coming Soon",
    orderSubtitle:
      "Coaster packs are packs of 5 with random motivational quotes — no custom designs. Ordering opens shortly.",
    orderItems: [
      { id: "birch-ply", label: "Birch ply coasters" },
      { id: "pine", label: "Pine coasters" },
      { id: "acrylic", label: "Acrylic coasters" },
      { id: "other", label: "Other laser-engraved item" },
    ],
    orderable: false,
  },
  {
    slug: "signs",
    name: "Signs",
    title: "Signs",
    tagline: "Printed signs & labels",
    description:
      "Printed signs and labels for workplaces, events, and spaces — safety signs, hazard warnings, no-smoking, and custom text. Send us your artwork or text and we’ll typeset it.",
    cardImage: "/images/signs-lifestyle.jpg",
    samplesIntro: "Printed to order — quoted per job.",
    samples: [
      {
        src: "/images/work/signs/01.jpg",
        caption: "Hydrojetting in progress safety sign",
      },
      { src: "/images/work/signs/02.jpg", caption: "Caution sign" },
      { src: "/images/work/signs/03.jpg", caption: "No-smoking sign" },
      {
        src: "/images/work/signs/04.jpg",
        caption: "Hearing protection must be worn sign",
      },
      { src: "/images/work/signs/05.jpg", caption: "Scaffold and do-not-use tags" },
      {
        src: "/images/work/b2b/04.jpg",
        caption: "Printed SWL weight sign",
      },
      {
        src: "/images/no-smoking-label.jpg",
        caption: "No-smoking sign",
      },
    ],
    orderTitle: "Signs — Coming Soon",
    orderSubtitle:
      "Printed signs are not orderable yet. See the samples and message us on WhatsApp to be notified.",
    orderItems: [
      { id: "safety", label: "Safety / compliance sign" },
      { id: "no-smoking", label: "No-smoking sign" },
      { id: "custom", label: "Custom text sign" },
      { id: "other", label: "Other sign" },
    ],
    form: { requireDesign: true },
    // Teaser only — samples stay visible, no quote form, hidden from the
    // Products dropdown. Flip these two flags off to re-enable ordering.
    comingSoon: true,
    orderable: false,
    comingSoonTitle: "Printed signs are coming soon.",
  },
];

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
