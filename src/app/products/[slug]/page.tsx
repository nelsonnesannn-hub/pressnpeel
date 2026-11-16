import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import { formatSGD } from "@/lib/pricing";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const buyable = Boolean(product.buyable);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Back to Products
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        {product.video ? (
          <video
            src={product.video.src}
            poster={product.video.poster}
            controls
            preload="none"
            playsInline
            className="mt-4 aspect-video w-full rounded-2xl border border-slate-800/70 bg-slate-950 object-cover"
          />
        ) : null}

        <div>
          <span className="mb-4 inline-block rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-400">
            {product.material} · {product.cut_type}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            {product.description}
          </p>

          {buyable ? (
            <>
              <div className="mt-6 flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#FFD60A" }}
                >
                  {formatSGD(product.price)}
                </span>
                <span className="text-sm text-slate-400">
                  {product.price_unit}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Size: {product.size ?? "—"} · Minimum order: {product.min_qty}
                {product.min_note ? ` — ${product.min_note}` : ""}
              </p>
            </>
          ) : (
            <>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-lg font-medium text-slate-400">
                  Quoted individually
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Minimum order quantity: {product.min_qty}
              </p>
            </>
          )}

          {buyable ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-slate-300">Options</p>
              <ul className="space-y-1.5 text-sm">
                {product.options.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
                  >
                    <span className="text-slate-300">{o.label}</span>
                    <span className="font-medium text-white">
                      {formatSGD(o.price)} {product.price_unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/order?product=${product.slug}`}
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: "#FFD60A" }}
            >
              {buyable
                ? `Buy Now — ${formatSGD(product.price)}`
                : "Request a Quote"}
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
            >
              Make It Custom
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-800/70 pt-8 text-sm">
            <div>
              <dt className="text-slate-500">Material</dt>
              <dd className="mt-1 font-medium text-white">{product.material}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Cut type</dt>
              <dd className="mt-1 font-medium text-white">{product.cut_type}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="mt-1 font-medium text-white">
                {product.category === "b2b" ? "B2B Safety" : "B2C Custom"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Availability</dt>
              <dd className="mt-1 font-medium text-emerald-400">
                {product.available ? "In stock — printed to order" : "Unavailable"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
