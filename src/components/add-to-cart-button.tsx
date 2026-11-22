"use client";

// Add-to-cart for fixed-price products: product line + option + quantity.
// The price comes from the catalog via fixedItemFromCatalog — nothing is
// invented here.
import { useState } from "react";
import { products } from "@/lib/catalog";
import { formatSGD, getOption } from "@/lib/pricing";
import { fixedItemFromCatalog } from "@/lib/cart";
import { stockKeyForFixed } from "@/lib/stock-keys";
import { useCart } from "./cart-store";
import { flagsFor, useStock } from "./use-stock";

const BUYABLE = products.filter((p) => p.buyable);

export default function AddToCartButton({
  slug,
  optionId,
  image,
}: {
  slug: string;
  optionId?: string;
  image?: string;
}) {
  const product = BUYABLE.find((p) => p.slug === slug) ?? BUYABLE[0];
  const [selected, setSelected] = useState(
    optionId ?? product.options[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(String(product.min_qty));
  const [added, setAdded] = useState(false);
  const { addItem, setOpen } = useCart();
  const stock = useStock();

  const option = getOption(product, selected);
  const stockKey = stockKeyForFixed(product.slug, selected);
  const flags = flagsFor(stock, stockKey);
  const soldOut = flags.soldOut;
  const unavailable = !flags.available;
  const blocked = soldOut || unavailable;
  const qty = Math.max(
    product.min_qty,
    Math.min(100000, parseInt(quantity) || product.min_qty)
  );

  function handleAdd() {
    const item = fixedItemFromCatalog(product.slug, selected, qty);
    if (!item) return;
    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-4 space-y-3">
      {product.options.length > 1 ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">
            Finish
          </span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          >
            {product.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} — {formatSGD(o.price)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Qty
          <input
            type="number"
            min={product.min_qty}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={blocked}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#FFD60A" }}
        >
          {soldOut ? "Sold out" : unavailable ? "Unavailable" : added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {formatSGD(option.price)} {product.price_unit} · min {product.min_qty}
      </p>
      {blocked ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {soldOut
            ? "This line is sold out — order via WhatsApp and we will help you."
            : "This line is not available right now — please order via WhatsApp."}
        </p>
      ) : null}
      <button
        type="button"
        disabled={blocked}
        onClick={() => {
          handleAdd();
          setOpen(true);
        }}
        className="disabled:opacity-50 text-xs font-medium text-[#FACC15] underline-offset-2 hover:underline"
      >
        Add &amp; view cart
      </button>
    </div>
  );
}
