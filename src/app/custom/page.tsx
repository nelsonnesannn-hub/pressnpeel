import Link from "next/link";
import { categories } from "@/lib/categories";
import { WHATSAPP_URL } from "@/components/nav";

export const metadata = {
  title: "Upload Your Design | Press N Peel",
  description:
    "Choose a Press N Peel product category, upload your artwork, and tell us the specs. We'll print and cut it for you.",
};

export default function CustomPage() {
  const orderableCategories = categories.filter((c) => !c.comingSoon);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Upload Your Design
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Choose a product category, then upload your artwork on that page. We
          handle the printing and cutting.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orderableCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/products/${category.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70 hover:shadow-lg"
          >
            <span className="block overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.cardImage}
                alt={category.name}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </span>
            <div className="flex flex-1 flex-col p-6">
              <h3
                className="text-lg font-semibold transition-colors"
                style={{ color: "#FACC15" }}
              >
                {category.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {category.tagline}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-200">
                Upload &amp; order
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#FFD60A]">Stripe</span>
          <span className="rounded-full bg-[#FFD60A] px-2 py-0.5 text-xs font-bold text-slate-950">
            Payment method
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Fixed-price products are checked out securely with{" "}
          <strong className="text-white">Stripe</strong>. Made-to-order work is
          quoted first — we&apos;ll confirm everything on WhatsApp before any
          payment is taken.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950"
          style={{ backgroundColor: "#FFD60A" }}
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
