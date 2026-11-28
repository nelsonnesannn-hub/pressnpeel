import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p
        className="text-6xl font-bold tracking-tight"
        style={{ color: "#FFD60A" }}
      >
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-slate-400">
        This page doesn&apos;t exist or has moved. The shop is still here —
        browse the products or start an order below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "#FFD60A" }}
        >
          Browse Products
        </Link>
        <Link
          href="/order"
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
        >
          Start Order
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
