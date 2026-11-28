import Link from "next/link";
import { formatSGD } from "@/lib/pricing";
import type { ProductRow } from "@/lib/catalog";
import AddToCartButton from "@/components/add-to-cart-button";

// Where a made-to-order (non-buyable) product sends its quote request.
// Buyable products use the Stripe checkout instead.
const QUOTE_HREF: Record<string, string> = {
  signs: "/products/signs#order",
  "vinyl-decals": "/products/vinyl-decals",
  "printable-vinyl": "/products/printable-vinyl#order",
  keychains: "/products/keychains#order",
  laser: "/products/laser",
};

export default async function ProductDetail({
  product,
  searchParams,
}: {
  product: ProductRow;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const buyable = Boolean(product.buyable);

  // Products whose options carry their own photo (printable vinyl finishes)
  // get a per-finish image slot driven by ?option=<id>.
  const hasFinishImages = product.options.some((o) => Boolean(o.image));
  const rawOption = typeof sp.option === "string" ? sp.option : "";
  const selectedOption =
    product.options.find((o) => o.id === rawOption) ?? product.options[0];
  const selectedPrice = selectedOption.price;
  const finishHref = (id: string) =>
    `/products/${product.slug}?option=${encodeURIComponent(id)}`;
  const quoteHref = QUOTE_HREF[product.category] ?? "/custom";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Back to Products
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                hasFinishImages
                  ? (selectedOption.image ?? product.image)
                  : product.image
              }
              alt={
                hasFinishImages
                  ? `${product.name} — ${selectedOption.label}`
                  : product.name
              }
              className="h-full w-full object-cover"
            />
          </div>
          {hasFinishImages ? (
            <p className="mt-3 text-center text-sm text-slate-400">
              Showing:{" "}
              <span className="font-medium text-white">
                {selectedOption.label}
              </span>
            </p>
          ) : null}
          {product.video ? (
            <video
              src={product.video.src}
              poster={product.video.poster}
              controls
              preload="metadata"
              playsInline
              className="mt-4 aspect-video w-full rounded-2xl border border-slate-800/70 bg-slate-950 object-cover"
            />
          ) : null}
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

          {buyable ? (
            <>
              <div className="mt-6 flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#FFD60A" }}
                >
                  {formatSGD(selectedPrice)}
                </span>
                <span className="text-sm text-slate-400">
                  {product.price_unit}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Size: {product.size ?? "—"} · Minimum order: {product.min_qty}
                {product.min_note ? ` — ${product.min_note}` : ""}
                {hasFinishImages
                  ? ` · Selected finish: ${selectedOption.label}`
                  : ""}
              </p>
            </>
          ) : (
            <>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-lg font-medium text-slate-400">
                  Made to order
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Minimum order quantity: {product.min_qty}
              </p>
            </>
          )}

          {buyable ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-slate-300">
                {hasFinishImages ? "Finish" : "Options"}
              </p>
              <ul className="space-y-1.5 text-sm">
                {product.options.map((o) => {
                  const active = o.id === selectedOption.id;
                  const row = (
                    <>
                      <span className={active ? "text-white" : "text-slate-300"}>
                        {o.label}
                      </span>
                      <span className="font-medium text-white">
                        {formatSGD(o.price)} {product.price_unit}
                      </span>
                    </>
                  );
                  const cls = active
                    ? "flex items-center justify-between gap-4 rounded-lg border border-[#FFD60A]/60 bg-[#FFD60A]/10 px-3 py-2"
                    : "flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2";
                  return (
                    <li key={o.id}>
                      {hasFinishImages ? (
                        <Link
                          href={finishHref(o.id)}
                          scroll={false}
                          aria-current={active ? "true" : undefined}
                          className={`${cls} transition-colors hover:border-[#FFD60A]/40`}
                        >
                          {row}
                        </Link>
                      ) : (
                        <div className={cls}>{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {buyable ? (
            <div className="mt-8">
              <AddToCartButton
                slug={product.slug}
                optionId={selectedOption.id}
                image={product.image}
              />
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={quoteHref}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#FFD60A" }}
              >
                Start an Order
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
              >
                Make It Custom
              </Link>
            </div>
          )}

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
                {product.category === "signs" ? "Signs" : "Custom"}
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
