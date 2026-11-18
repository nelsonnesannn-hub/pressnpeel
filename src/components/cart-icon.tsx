"use client";

// Header cart icon + item count. Purely presentational; state lives in
// cart-store.tsx so any component on the page can read it.
import Link from "next/link";
import { useCart } from "./cart-store";

export default function CartIcon() {
  const { count, setOpen } = useCart();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open cart (${count} item${count === 1 ? "" : "s"})`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-slate-950">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      <Link
        href="/checkout"
        className="hidden items-center justify-center rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white md:inline-flex"
      >
        Checkout
      </Link>
    </div>
  );
}
