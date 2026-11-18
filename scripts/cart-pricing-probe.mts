// Unit probe for the shared cart pricing — run with npx tsx.
import {
  customItemFromInput,
  fixedItemFromCatalog,
  formatCents,
  formatUnitCents,
  lineCentsForQuantity,
  sheetFeeFor,
  stickerUnitCents,
  sizeOptions,
  mergeItems,
  itemCount,
} from "../src/lib/cart";
import type { CartItem } from "../src/lib/cart";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
}

// --- fixed products ---
check("NFC x2", fixedItemFromCatalog("nfc-keychains", "4x4", 2)?.lineCents, 1020);
check("acrylic x3", fixedItemFromCatalog("acrylic-keychains", "5x5", 3)?.lineCents, 1260);
check("vinyl matte x1", fixedItemFromCatalog("printable-vinyl", "matte-white", 1)?.lineCents, 820);
check("vinyl confetti x2", fixedItemFromCatalog("printable-vinyl", "confetti-holographic", 2)?.lineCents, 1850);
check("min qty clamp (custom-stickers not buyable)", fixedItemFromCatalog("custom-stickers", "matte", 5), null);
check("unknown product", fixedItemFromCatalog("nope", "x", 1), null);

// --- kiss cut ---
const kissMatte5 = customItemFromInput({
  type: "kiss-cut", finish: "Matte vinyl white", size: "5", stickerCount: 10,
  files: [{ name: "a.png", size: 1, type: "image/png" }],
});
check("kiss matte 5cm x10 unit", kissMatte5?.unitCents, 70);
check("kiss matte 5cm x10 line (stickers only)", kissMatte5?.lineCents, 700);
check("kiss matte 5cm x10 + sheet fee", sheetFeeFor([kissMatte5!].filter(Boolean) as CartItem[]), 300);
check("kiss 5.5cm matte unit (half cent)", stickerUnitCents("Matte vinyl white", "5.5"), 72.5);
const kiss55 = customItemFromInput({
  type: "kiss-cut", finish: "Matte vinyl white", size: "5.5", stickerCount: 10,
  files: [{ name: "a.png", size: 1, type: "image/png" }],
});
check("kiss 5.5cm matte x10 line (rounds to whole cent)", kiss55?.lineCents, 725);
check("kiss 5.5cm x10 + fee", (kiss55?.lineCents ?? 0) + sheetFeeFor((kiss55 ? [kiss55] : []) as CartItem[]), 1025);
check("kiss 4cm pays the 5cm floor", stickerUnitCents("Glossy vinyl white", "4"), 90);
check("kiss 6cm glossy", stickerUnitCents("Glossy vinyl white", "6"), 95);
check("kiss 10cm holo", stickerUnitCents("Silver holographic vinyl", "10"), 160);
check("no file -> blocked", customItemFromInput({
  type: "kiss-cut", finish: "Matte vinyl white", size: "5", stickerCount: 10, files: [],
})?.custom?.files.length === 0, true);
void lineCentsForQuantity;

// --- die cut ---
const die = customItemFromInput({
  type: "die-cut", finish: "Gold reflective vinyl", size: "5", stickerCount: 20,
  files: [{ name: "b.png", size: 1, type: "image/png" }],
});
check("die gold 5cm x20", die?.lineCents, 2200);
check("die has no sheet fee", sheetFeeFor([die!]), 0);

// --- sticker packs ---
const packs = customItemFromInput({
  type: "sticker-packs", finish: "Matte vinyl white", size: "5", stickerCount: 5, stickersPerPack: 10,
  files: [{ name: "c.png", size: 1, type: "image/png" }],
});
check("packs 5 x 10 matte (700+150 each)", packs?.lineCents, 4250);
const packs2 = customItemFromInput({
  type: "sticker-packs", finish: "Matte vinyl white", size: "5", stickerCount: 2, stickersPerPack: 4,
  files: [{ name: "c.png", size: 1, type: "image/png" }],
});
check("packs 2 x 4 matte", packs2?.lineCents, 2 * (280 + 150));

// --- sizes ---
check("size options 4-10", sizeOptions(10), ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"]);

// --- recompute / merge ---
const merged = mergeItems([kissMatte5!], [kissMatte5!]);
check("merge same line", merged.length, 1);
check("merge quantity", merged[0].quantity, 20);
check("item count", itemCount(merged), 20);
check("merge recomputes the line", merged[0].lineCents, 1400);

// --- spot checks from the brief ---
check("SPOT 10 matte 5cm kiss-cut = $10.00", formatCents(kissMatte5!.lineCents + sheetFeeFor([kissMatte5!])), "$10.00");
check("kiss 5.5cm x10 order total = $10.25", formatCents(kiss55!.lineCents + sheetFeeFor([kiss55!])), "$10.25");
check("SPOT 2 NFC = $10.20", formatCents(fixedItemFromCatalog("nfc-keychains", "4x4", 2)!.lineCents), "$10.20");
check("unit format whole cent", formatUnitCents(70), "$0.70");
check("unit format half cent", formatUnitCents(72.5), "$0.725");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
