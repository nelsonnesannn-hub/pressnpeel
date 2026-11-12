import Link from "next/link";
import { products } from "@/lib/products";

/* ------------------------------------------------------------------ */
/*  Press N Peel — home page                                          */
/*  Theme: deep-navy + bronze/gold accent (from logo), star pattern   */
/* ------------------------------------------------------------------ */

const BRONZE = "#C5A059";
const BRONZE_LIGHT = "#D4B87A";

const SECTIONS = [
  {
    id: "signs",
    title: "Signs",
    subtitle:
      "Printed safety and compliance signs — hazard, danger, caution, and no-smoking. A4 or A3 on durable vinyl.",
    image: "/images/no-smoking-label.jpg",
    href: "/custom?type=signs",
  },
  {
    id: "decals",
    title: "Vinyl Decals",
    subtitle:
      "Flat-colour vinyl decals for bottles, vehicles, laptops, and walls — any size, weatherproof.",
    image: "/images/name-bottle-decal.jpg",
    href: "/custom?type=decals",
  },
  {
    id: "stickers",
    title: "Custom Stickers",
    subtitle:
      "Die-cut stickers in any shape — characters, logos, names, events. Matte, glossy, reflective, or holographic.",
    image: "/images/label-name-date-sheet.png",
    href: "/custom?type=stickers",
  },
  {
    id: "htv",
    title: "HTV Print",
    subtitle:
      "Heat transfer vinyl prints on shirts and jerseys — names, numbers, graphics, pressed on demand.",
    image: "/images/jersey-name-11.jpg",
    href: "/custom?type=htv",
  },
  {
    id: "laser",
    title: "Laser Engraving",
    subtitle:
      "Laser engraving on pine — coasters, tokens, blocks, boards, and keychains with your design.",
    image: "/images/name-laser-blocks.jpg",
    href: "/custom?type=laser",
  },
];

export default function HomePage() {
  return (
    <>
      {/* =============================================================
          HERO
          ============================================================= */}
      <section className="relative overflow-hidden bg-slate-950 py-28 sm:py-36 lg:py-44">
        {/* Background starfield */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'>
                <polygon points='30,6 36,22 53,22 40,32 45,49 30,39 15,49 20,32 7,22 24,22' fill='BRONZE'/>
              </svg>`
            )}"`,
            backgroundSize: "60px 60px",
          }}
          aria-hidden
        />

        {/* Gradient glow */}
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: BRONZE }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: "#38bdf8" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 text-center sm:px-8 lg:px-12">
          {/* eyebrow */}
          <span
            className="mb-4 inline-block rounded-full border border-opacity-30 bg-opacity-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              borderColor: BRONZE,
              backgroundColor: BRONZE,
              color: BRONZE,
            }}
          >
            Custom Die-Cut · Any Shape · Printed to Order
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Design.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #C5A059, #D4B87A, #A67C52)",
              }}
            >
              Die-Cut Perfect.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Premium custom stickers, vinyl decals, heat transfer prints, and
            B2B safety labels — manufactured to your exact shape, material, and
            quantity. No templates, no limits.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/order"
              className="inline-flex items-center gap-2 rounded-xl bg-[BRONZE] px-8 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:bg-[BRONZE_LIGHT] hover:scale-[1.03]"
              style={{ backgroundColor: BRONZE }}
            >
              Start Your Order
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
            >
              View All Products
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
            {TRUST_ITEMS.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ color: BRONZE }}
                  aria-hidden
                >
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7Z" />
                </svg>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          CATEGORY STRIP
          ============================================================= */}
      <section className="border-y border-slate-800/60 bg-slate-900/50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">
            Everything We Print
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="group relative rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 transition-all hover:border-[#C5A059]/40 hover:bg-slate-900/70 hover:shadow-lg"
              >
                {/* image thumbnail */}
                <span className="block overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </span>

                <h3
                  className="mt-4 text-lg font-semibold text-white transition-colors"
                  style={{ color: BRONZE_LIGHT }}
                >
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {s.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          FEATURED PRODUCTS
          ============================================================= */}
      <section id="products" className="border-t border-slate-800/60 bg-slate-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span
                className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{
                  borderColor: BRONZE,
                  backgroundColor: BRONZE,
                  color: "#fff",
                  opacity: 0.15,
                }}
              >
                Catalog
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Die-cut, kiss-cut, and laser options in glossy vinyl, matte
                vinyl, HTV, and pine. All printed to order.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:inline-flex"
            >
              See all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS_SLICE.map((product) => (
              <article
                key={product.slug}
                className="group rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 transition-all hover:border-[BRONZE]/30 hover:bg-slate-900/70 hover:shadow-lg"
              >
                {/* material chip */}
                <span className="mb-4 inline-block rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {product.material}
                </span>

                <h3
                  className="text-lg font-semibold leading-snug text-white transition-colors"
                  style={{ color: BRONZE_LIGHT }}
                >
                  {product.name}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {product.description}
                </p>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-sm font-medium text-slate-400">
                    Min. order: {product.min_qty}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/order?product=${product.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[BRONZE] px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:bg-[BRONZE_LIGHT] hover:scale-[1.02]"
                    style={{ backgroundColor: BRONZE }}
                  >
                    Order
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              See all products →
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================================
          HOW IT WORKS
          ============================================================= */}
      <section id="how" className="border-t border-slate-800/60 bg-slate-900/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                color: BRONZE_LIGHT,
                backgroundColor: BRONZE,
                opacity: 0.9,
              }}
            >
              Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Idea to Order in 3 Steps
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                {/* number badge */}
                <span
                  className="pointer-events-none flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold ring-1 ring-slate-700"
                  style={{
                    color: BRONZE_LIGHT,
                    borderColor: BRONZE,
                  }}
                  aria-hidden
                >
                  {i + 1}
                </span>

                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          B2B PULL
          ============================================================= */}
      <section
        id="b2b"
        className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-20 sm:py-24"
      >
        {/* decorative */}
        <div
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: BRONZE, opacity: 0.08 }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
          {/* product thumbnails */}
          <div className="mb-8 flex justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/no-smoking-label.jpg"
              alt="No Smoking safety label"
              className="h-24 w-24 rounded-2xl border border-slate-700 object-cover shadow-lg"
              loading="lazy"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/label-grid-sheet.jpg"
              alt="Label and date sticker sheet"
              className="h-24 w-24 rounded-2xl border border-slate-700 object-cover shadow-lg"
              loading="lazy"
            />
          </div>

          <span
            className="mb-4 inline-block rounded-full border border-opacity-30 bg-opacity-10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              borderColor: "#D4A017",
              backgroundColor: "#D4A017",
              color: "#fff",
            }}
          >
            For Businesses
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            B2B Safety Labels & Compliance Signs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
            OSHA-aligned hazard labels, equipment decals, compliance signs, and
            sticker sheets — die-cut or kiss-cut on durable glossy vinyl, in
            quantities that fit your operation.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/b2b"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D4A017] px-7 py-3 text-sm font-semibold text-slate-950 shadow transition-transform hover:bg-[#E0B020] hover:scale-[1.03]"
              style={{ backgroundColor: "#D4A017" }}
            >
              View B2B Catalog
            </Link>
            <Link
              href="/order?type=b2b"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================================
          CTA BANNER
          ============================================================= */}
      <section className="border-t border-slate-800/60 bg-slate-950 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Order?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Tell us what you need — shape, material, quantity, and your design.
            We'll turn it around.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: BRONZE }}
            >
              Upload Your Design
            </Link>
            <Link
              href="/products"
              className="rounded-xl border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
            >
              Browse Standard Products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Data helpers                                                      */
/* ------------------------------------------------------------------ */

const PRODUCTS_SLICE = products.slice(0, 6);

const TRUST_ITEMS = [
  { label: "Glossy & Matte Vinyl" },
  { label: "Die-Cut to Any Shape" },
  { label: "B2B & B2C Orders" },
];

const STEPS = [
  {
    title: "Submit Your Order",
    description:
      "Tell us the product, material, quantity, and upload your design. We'll confirm the details.",
  },
  {
    title: "We Print & Cut",
    description:
      "Your design is printed on premium vinyl or material and die-cut to your exact shape.",
  },
  {
    title: "Shipped to You",
    description:
      "Finished stickers, decals, or labels are packed and shipped — ready to peel and apply.",
  },
];
