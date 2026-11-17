import Link from "next/link";
import type { Category } from "@/lib/categories";

export type OrderJump = {
  /** Label shown on the button. */
  label: string;
  /** In-page anchor the button scrolls to. */
  href: string;
};

/**
 * Quick-jump shortcuts between a category page's header and its order sections.
 * Rendered only when the page actually has order sections — coming-soon pages
 * (orderable === false) show no shortcuts.
 *
 * Stickers & labels has three quote sections; the third is labelled
 * "Sticker packs" but the owner wants the shortcut to read "Package".
 * Keychains has one order form, so it gets one shortcut.
 * Printable Vinyl Sheets has one order form and therefore gets none.
 */
export const ORDER_JUMPS: Record<string, OrderJump[]> = {
  "stickers-and-labels": [
    { label: "Kiss cut", href: "#order-kiss-cut" },
    { label: "Die cut", href: "#order-die-cut" },
    { label: "Package", href: "#order-sticker-packs" },
  ],
  keychains: [{ label: "Keychains", href: "#order" }],
};

export function orderJumpsFor(category: Category): OrderJump[] {
  if (category.orderable === false) return [];
  return ORDER_JUMPS[category.slug] ?? [];
}

/**
 * Anchor ids for a category's order sections.
 * Single-form pages reuse the page-level `#order` id, so a jump lands on the
 * section heading rather than between the heading and the form.
 */
export function orderSectionIds(category: Category): string[] {
  if (category.quoteSections && category.quoteSections.length > 0) {
    return category.quoteSections.map((section) => `order-${section.id}`);
  }
  return ["order"];
}

export default function OrderJumpBar({ category }: { category: Category }) {
  const jumps = orderJumpsFor(category);
  if (jumps.length === 0) return null;

  return (
    <nav aria-label="Jump to an order section" className="mx-auto max-w-7xl px-6">
      <div className="mb-14 flex flex-wrap items-center gap-3">
        <span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          Jump to order
        </span>
        {jumps.map((jump) => (
          <Link
            key={jump.href}
            href={jump.href}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-2 text-sm font-semibold text-[#FFD60A] transition-all hover:border-[#FFD60A]/70 hover:bg-[#FFD60A]/20"
          >
            {jump.label}
            <span aria-hidden className="transition-transform hover:translate-y-0.5">
              →
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
