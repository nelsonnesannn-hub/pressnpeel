import Link from "next/link";
import { products } from "@/lib/catalog";
import { categories } from "@/lib/categories";
import { formatSGD } from "@/lib/pricing";

export const metadata = {
  title: "Products | Press N Peel",
  description:
    "Press N Peel product categories — stickers and labels, printable vinyl sheets, vinyl decals & HTV, keychains, laser-engraved coasters, and signs. Browse samples and order custom on each page.",
};

export default function ProductsPage() {
  const buyable = products.filter((p) => p.buyable);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Our Products
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Six product categories — browse the samples and order custom on each
          category page.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
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
                View category
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
            Buy Online
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Fixed-Price Products
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-400">
            Checked out securely with Stripe.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {buyable.map((product) => (
            <article
              key={product.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70"
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
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-white">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-xl font-bold"
                    style={{ color: "#FFD60A" }}
                  >
                    {formatSGD(product.price)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {product.price_unit}
                  </span>
                </div>
                <Link
                  href={`/order?product=${product.slug}`}
                  className="mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: "#FFD60A" }}
                >
                  Buy Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
