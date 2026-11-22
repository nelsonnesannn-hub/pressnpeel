import Link from "next/link";
import { products, COASTER_PACKS } from "@/lib/catalog";
import { formatSGD } from "@/lib/pricing";
import { WHATSAPP_URL } from "@/components/nav";
import AddToCartButton from "@/components/add-to-cart-button";
import WorkGallery from "@/components/work-gallery";
import VideoGallery from "@/components/video-gallery";
import NfcSection from "@/components/nfc-section";
import HeroCarousel from "@/components/hero-carousel";
import CategoryShowcase from "@/components/category-showcase";
import EnquireButton from "@/components/enquire-button";
import { ENQUIRE_LINKS } from "@/lib/enquire";
import { workGroups } from "@/lib/work";
import { videoGroups } from "@/lib/videos";

/* ------------------------------------------------------------------ */
/*  Press N Peel — home page                                          */
/*  Theme: deep-navy + yellow accent, comic halftone + speed lines     */
/* ------------------------------------------------------------------ */

// Landing-page B2B pull — hidden for now (Nelson will decide later).
// The JSX and the /b2b route are untouched; flip to true to bring it back.
const SHOW_B2B_PULL = false;

const BRONZE = "#FFD60A";
const BRONZE_LIGHT = "#FACC15";

/* Radiating comic action/speed lines, generated once as an SVG data URI.
   The focal point sits behind the hero photo so the burst reads as
   coming from the product shot. */
function speedLinesURI(): string {
  const W = 1200;
  const H = 800;
  const cx = 980;
  const cy = 400;
  const COUNT = 34;
  const lines: string[] = [];
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + ((i * 7) % 5) * 0.012;
    const r1 = 95 + ((i * 41) % 70);
    const r2 = 540 + ((i * 67) % 360);
    const x1 = (cx + Math.cos(angle) * r1).toFixed(1);
    const y1 = (cy + Math.sin(angle) * r1).toFixed(1);
    const x2 = (cx + Math.cos(angle) * r2).toFixed(1);
    const y2 = (cy + Math.sin(angle) * r2).toFixed(1);
    const w = i % 5 === 0 ? 6 : i % 2 === 0 ? 3.5 : 2;
    const color = i % 2 === 0 ? BRONZE : BRONZE_LIGHT;
    lines.push(
      `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='${color}' stroke-width='${w}' stroke-linecap='round'/>`
    );
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' width='${W}' height='${H}' preserveAspectRatio='none'>${lines.join("")}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

type Section = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  badge?: string;
  /** Prefilled WhatsApp enquiry link — only on ORDERABLE categories. */
  enquire?: string;
};

const SECTIONS: Section[] = [
  {
    id: "stickers-and-labels",
    title: "Stickers and labels",
    subtitle:
      "Finished die-cut stickers and printed labels — printed to order.",
    image: "/images/stickers-labels-lifestyle.jpg",
    href: "/products/stickers-and-labels",
    enquire: ENQUIRE_LINKS.dieCut,
  },
  {
    id: "printable-vinyl",
    title: "Printable Vinyl Sheets",
    subtitle:
      "Printable vinyl sheets in 7 finishes — sold as a pack of 20 A4 sheets.",
    image: "/images/vinyl-sheets-lifestyle.jpg",
    href: "/products/printable-vinyl",
    enquire: ENQUIRE_LINKS.printableVinyl,
  },
  {
    id: "vinyl-decals",
    title: "Vinyl Decals & HTV",
    subtitle:
      "Cut-only vinyl decals and heat transfer vinyl — not printed. Any size, any shape.",
    image: "/images/decal-lifestyle.jpg",
    href: "/products/vinyl-decals",
    badge: "Coming soon",
  },
  {
    id: "keychains",
    title: "Keychains",
    subtitle:
      "NFC keychains that tap to open a link, and acrylic keychains in any shape.",
    image: "/images/keychains-lifestyle.jpg",
    href: "/products/keychains",
    enquire: ENQUIRE_LINKS.nfcKeychains,
  },
  {
    id: "laser",
    title: "Laser — Coasters",
    subtitle:
      "Laser-engraved coasters in birch ply, pine, or acrylic. Sold as a pack of 5.",
    image: "/images/laser-lifestyle.jpg",
    href: "/products/laser",
    badge: "Coming soon",
  },
  {
    id: "signs",
    title: "Signs",
    subtitle:
      "Printed safety & compliance signs — A4 or A3 on durable vinyl.",
    image: "/images/signs-lifestyle.jpg",
    href: "/products/signs",
    badge: "Coming soon",
  },
];

export default function HomePage() {
  return (
    <>
      {/* =============================================================
          HERO
          ============================================================= */}
      <section className="relative overflow-hidden bg-slate-950 py-14 sm:py-18 lg:py-20">
        {/* Comic halftone dots — edge-weighted so the headline stays clear */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,214,10,0.7) 1.4px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, black 78%)",
            maskImage:
              "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, black 78%)",
          }}
          aria-hidden
        />

        {/* Larger halftone cluster, top-right corner */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,204,21,0.8) 2.2px, transparent 2.3px)",
            backgroundSize: "30px 30px",
            backgroundPosition: "6px 6px",
            WebkitMaskImage:
              "radial-gradient(circle 340px at 88% 6%, black 0%, transparent 72%)",
            maskImage:
              "radial-gradient(circle 340px at 88% 6%, black 0%, transparent 72%)",
          }}
          aria-hidden
        />

        {/* Radiating action/speed lines behind the hero photo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: speedLinesURI(),
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
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

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              {/* eyebrow — yellow on dark, readable at phone size */}
              <span
                className="mb-4 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]"
              >
                Custom Die-Cut · Any Shape · Printed to Order
              </span>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your Design.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #FFD60A, #FACC15)",
                  }}
                >
                  Die-Cut Perfect.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl lg:mx-0">
                Premium custom stickers, vinyl decals, heat transfer prints, and
                safety signs — manufactured to your exact shape, material, and
                quantity. No templates, no limits.
              </p>

              {/* CTA row */}
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/order"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03] sm:w-auto"
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
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-7 py-3.5 text-base font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 sm:w-auto"
                >
                  Chat on WhatsApp
                </a>
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white sm:w-auto"
                >
                  View All Products
                </Link>
              </div>

              {/* Trust line */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start">
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

            {/* Hero product visual */}
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-20 blur-2xl"
                style={{ backgroundColor: BRONZE }}
                aria-hidden
              />
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          CATEGORY STRIP
          ============================================================= */}
      <section className="border-y border-slate-800/60 bg-slate-900/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Categories
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything We Print
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Six product lines, printed and cut to order — choose a category to
              see samples and start an order.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <div
                key={s.id}
                className="group relative flex flex-col rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5 transition-all hover:border-[#FFD60A]/40 hover:bg-slate-900/70 hover:shadow-lg"
              >
                {/* Card body links to the category page. The Enquire button is a
                    sibling anchor, never nested inside this Link. */}
                <Link href={s.href} className="block">
                  {/* square thumb — no cropping */}
                  <span className="block overflow-hidden rounded-xl ring-1 ring-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </span>

                  <h3
                    className="mt-4 text-lg font-semibold transition-colors"
                    style={{ color: BRONZE_LIGHT }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {s.subtitle}
                  </p>
                  {s.badge ? (
                    <span className="mt-3 inline-flex rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#FFD60A]">
                      {s.badge}
                    </span>
                  ) : null}
                </Link>
                {s.enquire ? (
                  <div className="mt-4">
                    <EnquireButton href={s.enquire} label="Enquire" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          FEATURED PRODUCTS
          ============================================================= */}
      <section id="products" className="border-t border-slate-800/60 bg-slate-950 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
                Catalog
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Every line is printed and cut to order. Add to cart and check
                out securely.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:inline-flex"
            >
              See all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS_SLICE.map((product) => (
              <article
                key={product.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70 hover:shadow-lg"
              >
                <span className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </span>

                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-3 inline-block w-fit rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {product.material}
                  </span>

                  <h3
                    className="text-lg font-semibold leading-snug transition-colors"
                    style={{ color: BRONZE_LIGHT }}
                  >
                    {product.name}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                    {product.description}
                  </p>

                  {product.buyable ? (
                    <p className="mt-3 text-xs text-slate-500">
                      {product.price_unit}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.buyable ? (
                      <AddToCartButton
                        slug={product.slug}
                        optionId={product.options[0].id}
                        image={product.image}
                      />
                    ) : (
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: BRONZE }}
                      >
                        Enquire
                      </Link>
                    )}
                  </div>
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
          NFC KEYCHAINS
          ============================================================= */}
      <NfcSection />

      {/* =============================================================
          SHOP BY CATEGORY — new photos, labelled, click to order
          ============================================================= */}
      <CategoryShowcase />

      {/* =============================================================
          COMING SOON — COASTER PACKS
          ============================================================= */}
      <section className="border-t border-slate-800/60 bg-slate-900/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-950"
              style={{ backgroundColor: BRONZE }}
            >
              Coming soon
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Coaster Packs
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Packs of 5 — random motivational quotes, no custom designs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COASTER_PACKS.map((pack) => (
              <Link
                key={pack.id}
                href="/products/laser"
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70"
              >
                <span className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pack.image}
                    alt={pack.label}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </span>
                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-3 inline-block w-fit rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#FFD60A]">
                    Coming soon
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    {pack.label} coasters
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                    {pack.blurb}
                  </p>
                  <p
                    className="mt-4 text-xl font-bold"
                    style={{ color: BRONZE }}
                  >
                    {formatSGD(pack.price)}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      per pack of 5
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          HOW IT WORKS
          ============================================================= */}
      <section id="how" className="border-t border-slate-800/60 bg-slate-900/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                color: "#0f172a",
                backgroundColor: BRONZE,
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

      {SHOW_B2B_PULL ? (
        <>
        {/* =============================================================
            B2B PULL
            ============================================================= */}
        <section
          id="b2b"
          className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-16 sm:py-20"
        >
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
                src="/images/work/b2b/01.jpg"
                alt="JGR Fit For Use inspection labels"
                className="h-24 w-24 rounded-2xl border border-slate-700 object-cover shadow-lg"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/work/b2b/02.jpg"
                alt="Scaffold and safety tags"
                className="h-24 w-24 rounded-2xl border border-slate-700 object-cover shadow-lg"
                loading="lazy"
              />
            </div>

            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "#FFD60A",
                color: "#0f172a",
              }}
            >
              For Businesses
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Workplace Safety Signs &amp; Labels
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Printed hazard, danger, and caution signs plus equipment labels and
              sticker sheets — made to Singapore workplace safety requirements, in
              quantities that fit your operation.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#FFD60A" }}
              >
                View Signs &amp; Labels
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-7 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
        </>
      ) : null}

      {/* =============================================================
          OUR WORK
          ============================================================= */}
      <section
        id="work"
        className="border-t border-slate-800/60 bg-slate-950 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Our Work
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Real Jobs, Fresh Off the Press
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              A selection of recent stickers, labels, coasters, keychains, and
              materials — all printed and cut to order.
            </p>
          </div>
          <WorkGallery groups={workGroups} />
        </div>
      </section>

      {/* =============================================================
          VIDEOS
          ============================================================= */}
      <section
        id="videos"
        className="border-t border-slate-800/60 bg-slate-950 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Videos
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Print &amp; Cut in Action
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Short clips from the shop — printing, cutting, materials, and NFC
              keychains.
            </p>
          </div>
          <VideoGallery groups={videoGroups} />
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
            We&apos;ll turn it around.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/custom"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03] sm:w-auto"
              style={{ backgroundColor: BRONZE }}
            >
              Upload Your Design
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-8 py-3.5 text-base font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 sm:w-auto"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 px-8 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white sm:w-auto"
            >
              Browse Products
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

const PRODUCTS_SLICE = products.filter((p) => p.buyable);

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
