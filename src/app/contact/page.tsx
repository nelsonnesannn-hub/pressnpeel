import Link from "next/link";
import { EMAIL, WHATSAPP_URL } from "@/components/nav";

export const metadata = {
  title: "Contact | Press N Peel",
  description:
    "Chat with Press N Peel on WhatsApp, email us, or start an order. Based in Singapore.",
};

const CHANNELS = [
  {
    title: "WhatsApp",
    detail: "+65 8767 4511",
    hint: "Fastest — we usually reply within the hour during working hours.",
    href: WHATSAPP_URL,
    external: true,
    cta: "Chat on WhatsApp",
  },
  {
    title: "Email",
    detail: EMAIL,
    hint: "Send artwork, specs, or questions. We reply within one working day.",
    href: `mailto:${EMAIL}`,
    external: false,
    cta: "Send an Email",
  },
  {
    title: "Order Form",
    detail: "Online form",
    hint: "Tell us the product, size, finish, and quantity — we'll confirm your order.",
    href: "/order",
    external: false,
    cta: "Start an Order",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Questions, artwork, or an order — reach us whichever way suits you.
          We&apos;re based in Singapore and ship locally.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => {
          const inner = (
            <>
              <h2 className="text-lg font-semibold text-white">{c.title}</h2>
              <p
                className="mt-1 text-sm font-medium text-[#FACC15]"
                style={{ wordBreak: "break-all" }}
              >
                {c.detail}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                {c.hint}
              </p>
              <span
                className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950"
                style={{ backgroundColor: "#FFD60A" }}
              >
                {c.cta}
              </span>
            </>
          );

          const cls =
            "group flex flex-col rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 transition-all hover:border-[#FFD60A]/40 hover:bg-slate-900/70 hover:shadow-lg";

          return c.external ? (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
            >
              {inner}
            </a>
          ) : (
            <Link key={c.title} href={c.href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-white">Common questions</h2>
        <div className="mt-6 space-y-5">
          {[
            {
              q: "Do you have a shop I can visit?",
              a: "We work to order from Singapore — no walk-in store. Everything is printed and cut once you confirm your order, then shipped or collected locally.",
            },
            {
              q: "How long does an order take?",
              a: "Most jobs are printed and cut within 2–4 working days after you approve the proof. Larger or specialty runs may take longer — we'll confirm the timeline with your order.",
            },
            {
              q: "Can I send my own design?",
              a: "Yes. Send a PNG, JPG, SVG, PDF, or AI file. Transparent PNG works best for die-cut stickers. We'll send a proof before printing.",
            },
            {
              q: "Do you do bulk or business orders?",
              a: "Yes — safety signs, labels, and sticker sheets at volume. Send your spec and we'll confirm your order.",
            },
          ].map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-white">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
