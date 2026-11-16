import Link from "next/link";
import type { Category } from "@/lib/categories";
import CategoryOrderForm from "./category-order-form";

export default function CategoryPage({ category }: { category: Category }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]">
          {category.tagline}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {category.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
          {category.description}
        </p>
      </div>

      {/* Samples */}
      <section className="mb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Samples
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What&apos;s Available
            </h2>
            {category.samplesIntro ? (
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                {category.samplesIntro}
              </p>
            ) : null}
          </div>
          <Link
            href="/products"
            className="hidden rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:inline-flex"
          >
            All Products
          </Link>
        </div>

        {category.samples.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.samples.map((sample) => (
              <article
                key={sample.src + sample.caption}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70"
              >
                <span className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample.src}
                    alt={sample.caption}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </span>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex-1 text-sm font-medium leading-relaxed text-slate-200">
                    {sample.caption}
                  </p>
                  {sample.priceLabel ? (
                    <p
                      className="mt-3 text-lg font-bold"
                      style={{ color: "#FFD60A" }}
                    >
                      {sample.priceLabel}
                    </p>
                  ) : null}
                  {sample.orderHref ? (
                    <Link
                      href={sample.orderHref}
                      className="mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: "#FFD60A" }}
                    >
                      Buy Now
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-16 text-center text-slate-400">
            Samples coming soon — send us your design and we&apos;ll quote it.
          </div>
        )}

        {category.samplesNote ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            {category.samplesNote}
          </p>
        ) : null}
      </section>

      {/* Custom order form */}
      <section id="order" className="scroll-mt-24">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-950" style={{ backgroundColor: "#FFD60A" }}>
            Custom Order
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {category.orderTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {category.orderSubtitle}
          </p>
        </div>
        <CategoryOrderForm category={category} />
      </section>
    </div>
  );
}
