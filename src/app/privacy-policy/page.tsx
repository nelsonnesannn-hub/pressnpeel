import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Press N Peel",
  description:
    "Press N Peel privacy policy — what customer details we collect when you order, how Stripe handles your payment, and how long design images and order details are kept.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you place an order we collect the details you provide: your name, your email address, your order details, and any design image you upload. We use these only to fulfil your order and to contact you about it.",
  },
  {
    title: "Payments",
    body: "Payments are processed securely by Stripe. Your card details go to Stripe, not to Press N Peel, and Press N Peel does not store card numbers.",
  },
  {
    title: "How long we keep your details",
    body: "Design images and order details are kept only as needed to fulfil orders and for business records.",
  },
  {
    title: "Questions about privacy",
    body: "For any privacy question, contact Nelson at nelsonnesan.nn@gmail.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]">
          Privacy Policy
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
          What we collect when you order, how your payment is handled, and how
          long we keep your details.
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
          Have a privacy question?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Email Nelson directly — we&apos;ll answer you personally.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:nelsonnesan.nn@gmail.com"
            className="rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Email Nelson
          </a>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
