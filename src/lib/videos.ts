// Video clips used on the site — real shop footage, transcoded for web.
// Files live in /videos/<name>.mp4 with posters in /videos/posters/<name>.jpg.

export type VideoItem = {
  src: string;
  poster: string;
  title: string;
  caption: string;
};

export type VideoGroup = {
  id: string;
  title: string;
  items: VideoItem[];
};

const v = (name: string, title: string, caption: string): VideoItem => ({
  src: `/videos/${name}.mp4`,
  poster: `/videos/posters/${name}.jpg`,
  title,
  caption,
});

export const videoGroups: VideoGroup[] = [
  {
    id: "process",
    title: "Print & Cut Process",
    items: [
      v(
        "20260610_002948",
        "Printing die-cut stickers",
        "Circular stickers rolling through the press."
      ),
      v(
        "20260821_001654_1",
        "Press N Peel stickers on the press",
        "Branded die-cut stickers in production."
      ),
      v(
        "20260926_185524",
        "Robot mascot print run",
        "Eaispire robot stickers coming off the printer."
      ),
      v(
        "VID-20261011-WA0004",
        "Cutting on the plotter",
        "Motivational stickers being cut to shape."
      ),
      v(
        "20260710_050209",
        "Production and application",
        "Stickers printed and applied to a laptop."
      ),
    ],
  },
  {
    id: "products",
    title: "Product Clips",
    items: [
      v(
        "20260922_012716",
        "Cartoon sticker sheet",
        "Children's cartoon die-cut stickers."
      ),
      v(
        "20260926_202002",
        "Sticker showcase",
        "Assorted printed and cut stickers."
      ),
      v(
        "20261011_164050",
        "Motivational stickers",
        "Quote and sea-creature sticker range."
      ),
      v(
        "VID_20260820_224202_646",
        "Dog-head sticker run",
        "Branded circular stickers on the press."
      ),
    ],
  },
  {
    id: "materials",
    title: "Materials",
    items: [
      v("20261106_195928", "Gold vinyl", "Gold printable vinyl sheet."),
      v(
        "20261106_195948",
        "Holographic vinyl",
        "Holographic printable vinyl sheet."
      ),
      v(
        "20261106_195956",
        "Iridescent vinyl",
        "Iridescent printable sheet."
      ),
    ],
  },
  {
    id: "b2b",
    title: "B2B Work",
    items: [
      v(
        "20260710_050302_1",
        "Pfizer label print run",
        "Company labels produced for a repeat client."
      ),
    ],
  },
  {
    id: "childrens-day",
    title: "Children's Day",
    items: [
      v(
        "VID_20260922_035806_188",
        "Children's Day stickers",
        "Coach Rey / KGA Happy Children's Day design."
      ),
    ],
  },
  {
    id: "nfc",
    title: "NFC Keychains",
    items: [
      v(
        "VID_20261113_022800_555",
        "NFC keychain unboxing",
        "Tap an NFC keychain to open a social link."
      ),
    ],
  },
];
