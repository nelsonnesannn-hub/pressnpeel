"use client";

// Buy Now on a fixed-price category sample card: adds that catalog option to
// the cart straight away (minimum quantity) and opens the cart drawer so the
// customer can adjust the quantity before checkout. The price comes from the
// catalog via fixedItemFromCatalog — nothing is invented here.
import { products } from "@/lib/catalog";
import { fixedItemFromCatalog } from "@/lib/cart";
import { useCart } from "./cart-store";

export default function SampleBuyButton({
  slug,
  optionId,
}: {
  slug: string;
  optionId: string;
}) {
  const product = products.find((p) => p.slug === slug && p.buyable);
  const { addItem, setOpen } = useCart();

  if (!product) return null;
  const option =
    product.options.find((o) => o.id === optionId) ?? product.options[0];
  // Capture scalars so the click handler stays type-safe after the guard.
  const buySlug = product.slug;
  const minQty = product.min_qty;

  function handleBuy() {
    const item = fixedItemFromCatalog(buySlug, option.id, minQty);
    if (!item) return;
    addItem(item);
    setOpen(true);
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      className="mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: "#FFD60A" }}
    >
      Buy Now
    </button>
  );
}
