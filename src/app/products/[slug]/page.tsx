import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";

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

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-lg font-medium text-slate-400">
              Quoted individually
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Minimum order quantity: {product.min_qty}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/order?product=${product.slug}`}
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: "#C5A059" }}
            >
              Request a Quote
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
