import Link from "next/link";

// Landing-page category showcase: real recent work, each photo labelled with
// its category and what it is for. Clicking a card opens that category's
// custom order form.
const ITEMS = [
  {
    src: "/images/work/eaispire/01.jpg",
    category: "Stickers and labels",
    slug: "stickers-and-labels",
    caption: "Eaispire mascot stickers",
    purpose: "Brand & mascot die-cut stickers",
    href: "/products/stickers-and-labels#order-die-cut",
  },
  {
    src: "/images/work/motivational/08.jpg",
    category: "Stickers and labels",
    slug: "stickers-and-labels",
    caption: "Keep Going sea-creature stickers",
    purpose: "Motivational sticker ranges",
    href: "/products/stickers-and-labels#order-die-cut",
  },
  {
    src: "/images/work/events/01.jpg",
    category: "Stickers and labels",
    slug: "stickers-and-labels",
    caption: "Children's Day gymnastics stickers",
    purpose: "Event & celebration stickers",
    href: "/products/stickers-and-labels#order-die-cut",
  },
  {
    src: "/images/work/safety-labels/01.jpg",
    category: "Stickers and labels",
    slug: "stickers-and-labels",
    caption: "GAMX equipment labels",
    purpose: "B2B safety & equipment labels",
    href: "/products/stickers-and-labels#order-kiss-cut",
  },
  {
    src: "/images/work/keychains/08.jpg",
    category: "Keychains",
    slug: "keychains",
    caption: "Silver jellyfish keychain",
    purpose: "Acrylic keychains — any shape",
    href: "/products/keychains#order",
  },
  {
    src: "/images/work/keychains/18.jpg",
    category: "Keychains",
    slug: "keychains",
    caption: "NFC keychains",
    purpose: "Tap to open a link — no app needed",
    href: "/products/keychains#order",
  },
  {
    src: "/images/work/coasters-birch/01.jpg",
    category: "Laser",
    slug: "laser",
    caption: "Birch ply engraved coasters",
    purpose: "Laser-engraved coasters",
    href: "/products/laser",
  },
  {
    src: "/images/work/coasters-holo/07.jpg",
    category: "Laser",
    slug: "laser",
    caption: "Starfish holographic coaster",
    purpose: "Acrylic & holographic coasters",
    href: "/products/laser",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="border-y border-slate-800/60 bg-slate-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Browse
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              Real recent work, labelled by what it is — tap a photo to start
              an order.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            All products
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {ITEMS.map((item) => (
            <Link
              key={item.src}
              href={item.href}
              className="group w-64 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/40 hover:bg-slate-900/70 hover:shadow-lg"
            >
              <span className="block overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.caption}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </span>
              <span className="block p-4">
                <span className="inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#FACC15]">
                  {item.category}
                </span>
                <span className="mt-2 block text-sm font-semibold text-white">
                  {item.caption}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  {item.purpose}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-200">
                  Order
                  <span
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
