// Prefilled WhatsApp enquiry links — one per product type (orderable and
// coming-soon). The `text` query is copied character-for-character from the
// owner's spec (including the %20 / %2C / %27 encoding). Do not re-encode or
// edit it.
export const ENQUIRE_LINKS = {
  nfcKeychains:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20NFC%20keychains.",
  acrylicKeychains:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20acrylic%20keychains.",
  kissCut:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20kiss-cut%20stickers.",
  dieCut:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20die-cut%20stickers.",
  stickerPacks:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20sticker%20packs.",
  printableVinyl:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20printable%20vinyl%20sheets.",
  vinylDecals:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20vinyl%20decals.",
  laserCoasters:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20laser-engraved%20coasters.",
  signs:
    "https://wa.me/6587674511?text=Hi%20Press%20N%20Peel%2C%20I%27d%20like%20to%20enquire%20about%20signs%20and%20labels.",
} as const;

export const ENQUIRE_LABELS = {
  nfcKeychains: "Enquire About NFC Keychains",
  acrylicKeychains: "Enquire About Acrylic Keychains",
  kissCut: "Enquire About Kiss-cut Stickers",
  dieCut: "Enquire About Die-cut Stickers",
  stickerPacks: "Enquire About Sticker Packs",
  printableVinyl: "Enquire About Printable Vinyl Sheets",
} as const;
