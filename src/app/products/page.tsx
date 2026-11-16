import Link from "next/link";
import { products } from "@/lib/catalog";
import { formatSGD } from "@/lib/pricing";

export const metadata = {
  title: "Products | Press N Peel",
  description:
    "Press N Peel products — buy NFC keychains, acrylic keychains, and printable vinyl online, or order signs, decals, stickers, HTV prints, and laser engraving made to order.",
};

function optionSummary(options: { label: string }[]) {
  return options.map((o) => o.label).join(" · ");
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Our Products
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Buy online with Stripe, or order made to order — send us your design
          and we&apos;ll quote it.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/custom"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.03]"
          style={{ backgroundColor: "#FFD60A" }}
        >
          + Upload Your Design
        </Link>
        <Link
          href="/order"
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
        >
          Request a Quote
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const buyable = Boolean(product.buyable);
          return (
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
                {product.material} · {product.cut_type}
              </span>

              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {product.description}
              </p>

              <div className="mt-4 flex items-baseline gap-3">
                {buyable ? (
                  <span
                    className="text-xl font-bold"
                    style={{ color: "#FFD60A" }}
                  >
                    {formatSGD(product.price)}
                  </span>
                ) : null}
                <span className="text-sm font-medium text-slate-400">
                  {buyable ? product.price_unit : `Min. order: ${product.min_qty}`}
                </span>
              </div>
              {buyable ? (
                <div className="mt-1.5 space-y-1">
                  {product.size ? (
                    <p className="text-xs text-slate-500">
                      Size: {product.size}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Options: {optionSummary(product.options)}
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    Min. order: {product.min_qty}
                    {product.min_note ? ` — ${product.min_note}` : ""}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {buyable ? (
                  <>
                    <Link
                      href={`/order?product=${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: "#FFD60A" }}
                    >
                      Buy Now
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      Details
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: "#FFD60A" }}
                    >
                      View &amp; Enquire
                    </Link>
                    <Link
                      href={`/custom?type=${product.category}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      Start Order
                    </Link>
                  </>
                )}
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
