"use client";

// Cart drawer — slide-in panel with per-line quantity, remove, per-line totals
// and a grand total. Opens from the header cart icon.
import Link from "next/link";
import { useEffect } from "react";
import { formatCents, recomputeLineCents } from "@/lib/cart";
import { DELIVERY_NOTE, deliveryFor, deliveryLabel } from "@/lib/delivery";
import { useCart } from "./cart-store";

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, setQuantity, count } = useCart();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const lines = items.map((item) => ({ ...item, lineCents: recomputeLineCents(item) }));
  const subtotal = lines.reduce((sum, item) => sum + item.lineCents, 0);
  const delivery = deliveryFor(lines);

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold text-white">
            Your cart{" "}
            <span className="text-sm font-medium text-slate-400">
              ({count} item{count === 1 ? "" : "s"})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:bg-slate-900/60 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400">Your cart is empty.</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950"
                style={{ backgroundColor: "#FFD60A" }}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const line = lines.find((l) => l.id === item.id)!;
                return (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:bg-slate-900/60 hover:text-red-300"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:text-white"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setQuantity(item.id, Number(e.target.value))
                        }
                        aria-label={`Quantity for ${item.name}`}
                        className="h-8 w-12 border-x border-slate-700 bg-slate-950 text-center text-sm text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {formatCents(line.lineCents)}
                    </p>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-slate-800 px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-semibold text-white">
                {formatCents(subtotal)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">{deliveryLabel(delivery)}</span>
              <span
                className={`font-semibold ${
                  delivery.feeCents === 0 ? "text-emerald-400" : "text-white"
                }`}
              >
                {delivery.feeCents === 0 ? "FREE" : formatCents(delivery.feeCents)}
              </span>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
              {DELIVERY_NOTE}
            </p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: "#FFD60A" }}
            >
              Checkout — {formatCents(subtotal + delivery.feeCents)}
            </Link>
            <p className="mt-2 text-center text-xs text-slate-500">
              The total is confirmed on the checkout page.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
