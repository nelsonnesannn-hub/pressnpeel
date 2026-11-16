import Link from "next/link";

export const metadata = {
  title: "About | Press N Peel",
  description:
    "Press N Peel — custom die-cut stickers, vinyl decals, heat transfer vinyl, laser engraving, and B2B safety labels. Designed and printed in Singapore.",
};

const SERVICES = [
  {
    title: "Signs",
    body: "Printed safety and compliance signs — hazard, danger, caution, and no-smoking. A4 or A3 on durable vinyl.",
    image: "/images/no-smoking-label.jpg",
  },
  {
    title: "Vinyl Decals",
    body: "Flat-colour vinyl decals for bottles, vehicles, laptops, and walls. Any size, weatherproof, no white border.",
    image: "/images/name-bottle-decal.jpg",
  },
  {
    title: "Custom Stickers",
    body: "Die-cut stickers in any shape — characters, logos, names, events. Matte, glossy, reflective, or holographic.",
    image: "/images/label-name-date-sheet.png",
  },
  {
    title: "HTV Print",
    body: "Heat transfer vinyl prints on shirts and jerseys — names, numbers, graphics, pressed on demand.",
    image: "/images/jersey-name-11.jpg",
  },
  {
    title: "Laser Engraving",
    body: "Laser engraving on pine — coasters, tokens, blocks, boards, and keychains with your design.",
    image: "/images/name-laser-blocks.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          About Press N Peel
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-400">
          We&apos;re a Singapore-based print shop specialising in custom die-cut
          stickers, vinyl decals, heat transfer prints, laser engraving, and B2B
          safety labels. Every order is printed and cut to your exact shape,
          material, and quantity — no templates, no minimum fuss.
        </p>
      </div>

      <div className="mb-16 flex justify-center">
        <span className="inline-flex w-72 items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/press-n-peel-logo-light.jpg"
            alt="Press N Peel logo"
            className="w-full object-contain"
          />
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <article
            key={s.title}
            className="group overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:shadow-lg"
          >
            <span className="block overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </span>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-white">Have a design ready?</h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-400">
          Upload your artwork and we&apos;ll turn it around. Or browse our standard
          products for ready-to-order options.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/custom"
            className="rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Upload Your Design
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  );
}
