// "Our Work" gallery data — real client and product photos.
// Images live in /images/work/<group>/<n>.jpg (Nelson's own photos,
// resized + gamma lift only).

export type WorkItem = {
  src: string;
  caption: string;
  /** Optional per-card link override (defaults to the group's href). */
  href?: string;
};

export type WorkGroup = {
  id: string;
  title: string;
  blurb: string;
  /** Where cards in this group link (order section anchor or teaser page). */
  href: string;
  items: WorkItem[];
  /**
   * Hidden groups stay in the data (and in git) but are not rendered.
   * Used for the B2B sets Nelson is revamping.
   */
  hidden?: boolean;
};

const w = (group: string, n: number) =>
  `/images/work/${group}/${String(n).padStart(2, "0")}.jpg`;

export const workGroups: WorkGroup[] = [
  {
    id: "motivational",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Motivational Stickers",
    blurb:
      "Die-cut motivational sticker ranges — sea creatures, animals, and keep-going quotes, cut to any shape.",
    items: [
      { src: w("motivational", 2), caption: "Keep Going collection" },
      { src: w("motivational", 3), caption: "Keep Going sticker pile" },
      { src: w("motivational", 4), caption: "Sea-creature and quote mix" },
      { src: w("motivational", 5), caption: "Die-cut assortment on white" },
      { src: w("motivational", 10), caption: "Motivational die-cut assortment" },
      { src: w("motivational", 13), caption: "Quote and sea-creature stickers" },
      { src: w("motivational", 16), caption: "It's a new day — rainbow quote sticker" },
      { src: w("motivational", 17), caption: "There is time — sea turtle sticker" },
      { src: w("motivational", 18), caption: "Shine — starfish sticker" },
      { src: w("motivational", 19), caption: "Turn your pain into purpose — quote sticker" },
      { src: w("motivational", 20), caption: "Motivational die-cut sticker" },
    ],
  },
  {
    id: "pnp-cards",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Press N Peel Logo Stickers",
    blurb:
      "Press N Peel wordmark and logo stickers — the brand stickers we print for ourselves and our clients.",
    items: [
      { src: w("pnp-cards", 1), caption: "Press N Peel logo vinyl stickers" },
      { src: w("pnp-cards", 2), caption: "Press N Peel wordmark stickers" },
      { src: w("pnp-cards", 3), caption: "Press N Peel logo stickers" },
      { src: w("pnp-cards", 4), caption: "Press N Peel sticker pile" },
      { src: w("pnp-cards", 5), caption: "Press N Peel branded sticker stack" },
      { src: w("pnp-cards", 6), caption: "Press N Peel logo sticker display" },
      { src: "/images/work/pnp-testprints/IMG_0681.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0688.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0692.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0699.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0700.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0701.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0702.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0703.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0706.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0708.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0710.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0713.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0722.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0726.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0729.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0735.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0736.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0737.jpg", caption: "Press N Peel logo stickers" },
      { src: "/images/work/pnp-testprints/IMG_0738.jpg", caption: "Press N Peel logo stickers" },
    ],
  },
  {
    id: "brand",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Brand & Eaispire Stickers",
    blurb:
      "Eaispire mascot die-cut stickers and logo stickers for a repeat B2B client.",
    items: [
      { src: w("brand", 1), caption: "Eaispire mascot assortment" },
      { src: w("brand", 2), caption: "Eaispire mascot sticker row" },
      { src: w("brand", 3), caption: "Eaispire mascot figurine with stickers" },
      { src: w("brand", 4), caption: "Eaispire mascot line-up" },
      { src: w("brand", 5), caption: "Eaispire flyer — Learn It, Build It, Make It" },
      { src: w("brand", 6), caption: "Eaispire logo and mascot" },
      { src: w("brand", 7), caption: "Eaispire logo stickers" },
      { src: w("brand", 8), caption: "Eaispire and Press N Peel logos" },
      { src: w("brand", 9), caption: "Eaispire sticker pile" },
      { src: w("brand", 10), caption: "Logo die-cut set" },
      { src: w("eaispire", 1), caption: "Eaispire mascot sticker assortment" },
      { src: w("eaispire", 2), caption: "Eaispire mascot sticker row" },
      { src: w("eaispire", 3), caption: "Eaispire sticker scatter" },
      { src: w("eaispire", 4), caption: "Eaispire mascot and logo stickers" },
      { src: w("eaispire", 5), caption: "Eaispire robot mascot stickers" },
      { src: w("eaispire", 6), caption: "Eaispire mascot die-cut set" },
      { src: w("eaispire", 7), caption: "Eaispire mascot sticker stack" },
      { src: w("eaispire", 8), caption: "Eaispire mascot sticker display" },
    ],
  },
  {
    id: "events",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Event & Celebration Stickers",
    blurb:
      "Birthday, thank-you, and school event stickers — die-cut to any shape with the child's name and artwork.",
    items: [
      {
        src: w("events", 1),
        caption: "Shine Brightly, Little Gymnast — Children's Day",
      },
      { src: w("events", 2), caption: "Sarah unicorn birthday stickers" },
      { src: w("events", 3), caption: "Sarah thank-you unicorn sticker" },
      { src: w("events", 4), caption: "Event sticker labels" },
    ],
  },
  {
    id: "small-business",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Small-Business Brand Stickers",
    blurb:
      "Logo and brand stickers for small businesses — food, retail, and personal brands.",
    items: [
      { src: w("small-business", 1), caption: "Small-business brand sticker stack" },
      { src: w("small-business", 2), caption: "The Shazana Sharak brand stickers" },
      { src: w("small-business", 3), caption: "Oldmolly logo stickers" },
      { src: w("small-business", 4), caption: "Brand sticker sheet" },
    ],
  },
  {
    id: "childrens-day",
    href: "/products/stickers-and-labels#order-die-cut",
    title: "Children's Day",
    blurb:
      "Two separate Children's Day orders — kept separate, as printed for each coach.",
    items: [
      {
        src: w("childrens-day", 1),
        caption: "Coach Julia — Shine Brightly, Little Gymnast",
      },
      {
        src: "/images/die-cut-sample-coach-rey.jpg",
        caption: "Coach Rey / KGA — Happy Children's Day",
      },
    ],
  },
  {
    id: "b2b",
    hidden: true,
    href: "/products/stickers-and-labels#order-kiss-cut",
    title: "B2B & Company Labels",
    blurb:
      "Equipment labels, scaffold tags, and safety signage for Singapore workplaces.",
    items: [
      { src: w("b2b", 1), caption: "JGR Fit For Use inspection labels" },
      { src: w("b2b", 2), caption: "Scaffold and safety tags" },
      { src: w("b2b", 3), caption: "GAMX equipment labels" },
      { src: w("b2b", 4), caption: "Printed weight sign", href: "/products/signs" },
      { src: w("b2b", 5), caption: "ROS Fit For Use labels" },
      { src: w("b2b", 6), caption: "Pfizer sticker" },
    ],
  },
  {
    id: "safety-labels",
    hidden: true,
    href: "/products/stickers-and-labels#order-kiss-cut",
    title: "Safety & Equipment Labels",
    blurb:
      "Fit-for-use tags, SWL weight signs, and equipment labels printed on durable vinyl.",
    items: [
      { src: w("safety-labels", 1), caption: "GAMX equipment labels" },
      { src: w("safety-labels", 2), caption: "KCM equipment labels" },
      { src: w("safety-labels", 3), caption: "Fit For Use inspection tag" },
      { src: w("safety-labels", 4), caption: "Fit For Use tag — alt" },
      { src: w("safety-labels", 5), caption: "Safety Inducted tags" },
      { src: w("safety-labels", 6), caption: "SWL weight sign", href: "/products/signs" },
      { src: w("safety-labels", 7), caption: "Do Not Use / scaffold tags" },
      { src: w("safety-labels", 8), caption: "Safety label sheet" },
      { src: w("safety-labels", 9), caption: "Cutting equipment label" },
      { src: w("safety-labels", 10), caption: "Hyp equipment label" },
    ],
  },
  {
    id: "coasters-pine",
    href: "/products/laser",
    title: "Laser-Engraved Pine Coasters",
    blurb:
      "Laser engraving on pine — motivational coasters with names, quotes, and emblems.",
    items: [
      { src: w("coasters-pine", 1), caption: "Start again — engraved pine" },
      { src: w("coasters-pine", 2), caption: "Engraved pine coaster set" },
      { src: w("coasters-pine", 3), caption: "Engraved coasters in a row" },
      { src: w("coasters-pine", 4), caption: "Pine coaster designs" },
      { src: w("coasters-pine", 5), caption: "Pine — engraved coasters" },
      { src: w("coasters-pine", 6), caption: "Pine coaster set" },
      { src: w("coasters-pine", 7), caption: "Engraved coasters in a row" },
      { src: w("coasters-pine", 8), caption: "Pine coaster designs" },
    ],
  },
  {
    id: "coasters-birch",
    href: "/products/laser",
    title: "Laser-Engraved Birch Ply Coasters",
    blurb:
      "Laser engraving on birch ply — quote coasters with crisp, high-contrast lines.",
    items: [
      { src: w("coasters-birch", 1), caption: "Birch ply — engraved coasters" },
      { src: w("coasters-birch", 2), caption: "Keep going, you're closer than you think" },
      { src: w("coasters-birch", 3), caption: "Birch ply coaster set" },
      { src: w("coasters-birch", 4), caption: "Engraved birch coasters" },
      { src: w("coasters-birch", 5), caption: "Birch ply coaster designs" },
    ],
  },
  {
    id: "coasters-holo",
    href: "/products/laser",
    title: "Holographic Coasters",
    blurb:
      "Holographic and iridescent coasters — jellyfish, starfish, and quote designs.",
    items: [
      { src: w("coasters-holo", 1), caption: "Never give up — holographic" },
      { src: w("coasters-holo", 2), caption: "Jellyfish holographic coaster" },
      { src: w("coasters-holo", 3), caption: "Keep Going holographic" },
      { src: w("coasters-holo", 4), caption: "Jellyfish acrylic coaster" },
      { src: w("coasters-holo", 5), caption: "Starfish holographic coaster" },
      {
        src: w("coasters-holo", 6),
        caption: "Turn your pain into purpose",
      },
      { src: w("coasters-holo", 7), caption: "Starfish holographic coaster" },
      { src: w("coasters-holo", 8), caption: "Never give up — coaster pile" },
      { src: w("coasters-holo", 9), caption: "Keep Going — holographic coaster" },
      { src: w("coasters-holo", 10), caption: "Holographic coaster design" },
      { src: w("coasters-holo", 11), caption: "Holographic coaster" },
      { src: w("coasters-holo", 12), caption: "Holographic quote coaster" },
    ],
  },
  {
    id: "keychains",
    href: "/products/keychains#order",
    title: "Acrylic & NFC Keychains",
    blurb:
      "Acrylic keychains in any shape — including NFC keychains that tap to open a link.",
    items: [
      { src: w("keychains", 1), caption: "Gold jellyfish keychain" },
      { src: w("keychains", 2), caption: "Blue jellyfish keychain" },
      { src: w("keychains", 3), caption: "Floating jellyfish keychain" },
      { src: w("keychains", 4), caption: "Iridescent jellyfish keychain" },
      { src: w("keychains", 5), caption: "Silver jellyfish keychain" },
      { src: w("keychains", 6), caption: "Keychain collection" },
      { src: w("keychains", 7), caption: "NFC keychains — tap to open" },
      { src: w("keychains", 8), caption: "Silver jellyfish keychain" },
      { src: w("keychains", 9), caption: "Blue jellyfish keychain" },
      { src: w("keychains", 10), caption: "Sea-creature keychain collection" },
      { src: w("keychains", 11), caption: "Keychain assortment" },
      { src: w("keychains", 12), caption: "Jellyfish keychain set" },
      { src: w("keychains", 13), caption: "Keychain row" },
      { src: w("keychains", 14), caption: "Keychain pile" },
      { src: w("keychains", 15), caption: "Acrylic keychain" },
      { src: w("keychains", 16), caption: "Keychain collection" },
      { src: w("keychains", 17), caption: "Acrylic keychain display" },
      { src: w("keychains", 18), caption: "NFC keychains" },
      { src: w("keychains", 20), caption: "NFC keychain — tap to open" },
    ],
  },
  {
    id: "signs",
    hidden: true,
    href: "/products/signs",
    title: "Printed Signs",
    blurb:
      "Printed safety and compliance signs — hydrojetting, caution, no-smoking, and PPE notices.",
    items: [
      { src: w("signs", 1), caption: "Hydrojetting in progress safety sign" },
      { src: w("signs", 2), caption: "Caution sign" },
      { src: w("signs", 3), caption: "No-smoking sign" },
      { src: w("signs", 4), caption: "Hearing protection must be worn sign" },
      { src: w("signs", 5), caption: "Scaffold and do-not-use tags" },
    ],
  },
  {
    id: "materials",
    href: "/products/printable-vinyl#order",
    title: "Printable Vinyl Materials",
    blurb:
      "Matte white, glossy white, gold reflective, silver reflective, silver holographic, broken glass silver holographic, and confetti/dotted silver holographic printable vinyl — printed and cut to order.",
    items: [
      { src: "/images/v2-matte-white-listing.jpg", caption: "Matte vinyl white" },
      { src: "/images/v2-glossy-white-listing.jpg", caption: "Glossy vinyl white" },
      {
        src: "/images/v2-gold-reflective-listing.jpg",
        caption: "Gold reflective vinyl",
      },
      {
        src: "/images/v2-silver-reflective-listing.jpg",
        caption: "Silver reflective vinyl",
      },
      {
        src: "/images/v2-silver-holographic-listing.jpg",
        caption: "Silver holographic vinyl",
      },
      {
        src: "/images/v2-broken-glass-listing.jpg",
        caption: "Broken glass silver holographic",
      },
      {
        src: "/images/v2-confetti-holographic-listing.jpg",
        caption: "Confetti/dotted silver holographic vinyl",
      },
    ],
  },
];
