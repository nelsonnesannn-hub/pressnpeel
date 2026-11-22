// Delivery terms — shown on the category pages near every order form.
// Plain wording only; the numbers live in src/lib/delivery.ts.
import { DELIVERY_RULES } from "@/lib/delivery";

export default function DeliveryNote() {
  return (
    <p className="mb-6 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-xs leading-relaxed text-slate-400">
      <span className="font-semibold text-slate-200">Delivery:</span>{" "}
      $2.25 per order under 300 pieces — free delivery at 300+ pieces of
      stickers and labels, or 6+ packs of printable vinyl sheets. Keychains,
      coasters and signs don&apos;t count toward the 300-piece threshold.
      Delivery is on weekends only, lead time 2 weeks (usually the first
      weekend). Urgent next-day delivery is available for vinyl sheet orders —
      see the checkout page for the full rules.
    </p>
  );
}

export { DELIVERY_RULES };
