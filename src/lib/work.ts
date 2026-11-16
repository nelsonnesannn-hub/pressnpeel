// "Our Work" gallery data — real client and product photos.
// Images live in /images/work/<group>/<n>.jpg (cleaned, white background).

export type WorkItem = {
  src: string;
  caption: string;
};

export type WorkGroup = {
  id: string;
  title: string;
  blurb: string;
  items: WorkItem[];
};

const w = (group: string, n: number) =>
  `/images/work/${group}/${String(n).padStart(2, "0")}.jpg`;

export const workGroups: WorkGroup[] = [
  {
    id: "motivational",
    title: "Motivational Stickers",
    blurb:
      "Die-cut motivational sticker ranges — sea creatures, animals, and keep-going quotes, cut to any shape.",
    items: [
      { src: w("motivational", 1), caption: "Motivational die-cut assortment" },
      { src: w("motivational", 2), caption: "Keep Going collection" },
      { src: w("motivational", 3), caption: "Keep Going sticker pile" },
      { src: w("motivational", 4), caption: "Sea-creature and quote mix" },
      { src: w("motivational", 5), caption: "Die-cut assortment on white" },
    ],
  },
  {
    id: "namecards",
    title: "Namecards & Packaging",
    blurb:
      "Press N Peel namecards, business cards, and branded black packet packaging shots.",
    items: [
      { src: w("namecards", 1), caption: "Keep Going sticker on black packet" },
      { src: w("motivational", 6), caption: "Press N Peel namecard with QR code" },
      {
        src: w("motivational", 7),
        caption: "Press N Peel namecards with gold coin logo",
      },
      { src: w("namecards", 4), caption: "Birthday sticker for party packaging" },
    ],
  },
  {
    id: "brand",
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
      { src: w("brand", 7), caption: "Eaispire branded sticker assortment" },
      { src: w("brand", 8), caption: "Eaispire and Press N Peel logos" },
      { src: w("brand", 9), caption: "Eaispire sticker pile" },
      { src: w("brand", 10), caption: "Logo die-cut set" },
      { src: w("brand", 11), caption: "Oldmolly brand logo stickers" },
      { src: w("namecards", 2), caption: "Eaispire logo sign" },
    ],
  },
  {
    id: "childrens-day",
    title: "Children's Day",
    blurb:
      "Two separate Children's Day orders — kept separate, as printed for each coach.",
    items: [
      {
        src: w("childrens-day", 1),
        caption: "Coach Julia — Shine Brightly, Little Gymnast",
      },
      {
        src: w("childrens-day", 2),
        caption: "Coach Rey / KGA — Happy Children's Day",
      },
    ],
  },
  {
    id: "b2b",
    title: "B2B & Company Labels",
    blurb:
      "Equipment labels, scaffold tags, and safety signage for Singapore workplaces.",
    items: [
      { src: w("b2b", 1), caption: "JGR Fit For Use inspection labels" },
      { src: w("b2b", 2), caption: "Scaffold and safety tags" },
      { src: w("b2b", 3), caption: "GAMX equipment labels" },
      { src: w("b2b", 4), caption: "Printed weight sign" },
      { src: w("b2b", 5), caption: "ROS Fit For Use labels" },
      { src: w("b2b", 6), caption: "Pfizer sticker" },
      { src: w("namecards", 3), caption: "CLC CL-COOL safety label stack" },
    ],
  },
  {
    id: "coasters-pine",
    title: "Laser-Engraved Pine Coasters",
    blurb:
      "Laser engraving on pine — motivational coasters with names, quotes, and emblems.",
    items: [
      { src: w("coasters-pine", 1), caption: "Start again — engraved pine" },
      { src: w("coasters-pine", 2), caption: "Engraved pine coaster set" },
      { src: w("coasters-pine", 3), caption: "Engraved coasters in a row" },
      { src: w("coasters-pine", 4), caption: "Pine coaster designs" },
    ],
  },
  {
    id: "coasters-holo",
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
    ],
  },
  {
    id: "keychains",
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
    ],
  },
  {
    id: "materials",
    title: "Printable Vinyl Materials",
    blurb:
      "Glossy white, matte white, gold, confetti, holographic, and reflective printable vinyl — printed and cut to order.",
    items: [
      { src: "/images/vinyl-glossy-white-listing.jpg", caption: "Glossy white vinyl" },
      { src: "/images/vinyl-matte-white-listing.jpg", caption: "Matte white vinyl" },
      { src: "/images/vinyl-gold-listing.jpg", caption: "Gold vinyl" },
      { src: "/images/vinyl-confetti-listing.jpg", caption: "Confetti vinyl" },
      { src: "/images/vinyl-holographic-listing.jpg", caption: "Holographic vinyl" },
      { src: "/images/vinyl-reflective-listing.jpg", caption: "Reflective vinyl" },
    ],
  },
];
