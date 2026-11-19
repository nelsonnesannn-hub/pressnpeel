// Delivery terms — shown on the category pages near every order form.
// Plain wording only; the numbers live in src/lib/delivery.ts.
import { DELIVERY_NOTE, DELIVERY_RULES } from "@/lib/delivery";

export default function DeliveryNote() {
  return (
    <p className="mb-6 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-xs leading-relaxed text-slate-400">
      <span className="font-semibold text-slate-200">Delivery:</span>{" "}
      {DELIVERY_NOTE} Free delivery at 300+ pieces (stickers, labels,
      keychains and similar) or 6+ packs of printable vinyl sheets — see the
      checkout page for the full rules. Urgent next-day delivery is available
      for vinyl sheet orders.
    </p>
  );
}

export { DELIVERY_RULES };
