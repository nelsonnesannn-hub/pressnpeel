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
      { src: w("motivational", 6), caption: "Motivational sticker sheet" },
      { src: w("motivational", 7), caption: "Sticker set with dog emblem" },
    ],
  },
  {
    id: "namecards",
    title: "Namecards & Packaging",
    blurb:
      "Press N Peel namecards, business cards, and branded black packet packaging shots.",
    items: [
      { src: w("namecards", 1), caption: "Keep Going sticker on black packet" },
      { src: w("namecards", 2), caption: "Press N Peel business cards" },
      { src: w("namecards", 3), caption: "Printed namecard stack" },
      { src: w("namecards", 4), caption: "Press N Peel badge and pin" },
    ],
  },
  {
    id: "brand",
    title: "Brand & Eaispire Stickers",
    blurb:
      "Eaispire robot-mascot die-cut stickers and logo stickers for a repeat B2B client.",
    items: [
      { src: w("brand", 1), caption: "Eaispire robot mascot assortment" },
      { src: w("brand", 2), caption: "Robot mascot sticker row" },
      { src: w("brand", 3), caption: "Robot figurine with stickers" },
      { src: w("brand", 4), caption: "Robot mascot line-up" },
      { src: w("brand", 5), caption: "Eaispire flyer — Learn It, Build It, Make It" },
      { src: w("brand", 6), caption: "Eaispire logo and robot mascot" },
      { src: w("brand", 7), caption: "Eaispire branded sticker assortment" },
      { src: w("brand", 8), caption: "Eaispire and Press N Peel logos" },
      { src: w("brand", 9), caption: "Eaispire sticker pile" },
      { src: w("brand", 10), caption: "Logo die-cut set" },
      { src: w("brand", 11), caption: "Admily brand stickers" },
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
      "Reflective, holographic, gold, and confetti vinyl — printed and cut to order.",
    items: [
      { src: w("materials", 1), caption: "Reflective vinyl" },
      { src: w("materials", 2), caption: "Holographic vinyl" },
      { src: w("materials", 3), caption: "Gold vinyl" },
      { src: w("materials", 4), caption: "Confetti vinyl" },
    ],
  },
];
