import Link from "next/link";

export const metadata = {
  title: "Refund Policy | Press N Peel",
  description:
    "Press N Peel refund policy — cancelling before approval, made-to-order items, printable vinyl returns, and how refunds reach your card.",
};

const SECTIONS = [
  {
    title: "Cancelling before we approve your order",
    body: "If you cancel before Nelson approves your order, it is free. Any payment hold is released and you are never charged.",
  },
  {
    title: "Made-to-order items after approval",
    body: "Once an order is approved and production has started, custom made-to-order items cannot be refunded. They are made with your own design and cannot be resold.",
  },
  {
    title: "If we made a mistake",
    body: "If the mistake is ours — a wrong print, a damaged item, or a mis-cut — Nelson will reprint it or refund it.",
  },
  {
    title: "Fixed-price stock items (printable vinyl packs)",
    body: "An unopened printable vinyl pack can be returned for a refund.",
  },
  {
    title: "How refunds are sent",
    body: "Refunds after a payment has been captured go back to your card in about 5–10 business days. Stripe keeps its fee on a refunded payment.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]">
          Refund Policy
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Refunds &amp; Cancellations
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
          Plain terms for custom work and ready-made stock — what can be
          cancelled, what can be refunded, and how long a refund takes.
        </p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8 text-center sm:p-10">
        <h2 className="text-2xl font-bold text-white">
          Have a question about an order?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Message us on WhatsApp or send an email — we&apos;ll sort it out with
          you directly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Contact Us
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
