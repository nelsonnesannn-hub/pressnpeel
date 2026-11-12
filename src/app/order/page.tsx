"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { products } from "@/lib/catalog";

function OrderForm() {
  const params = useSearchParams();
  const preset = params.get("product") ?? "";
  const presetType = params.get("type") ?? "";

  const [productSlug, setProductSlug] = useState(
    products.some((p) => p.slug === preset) ? preset : ""
  );
  const [orderType, setOrderType] = useState(presetType || "stickers");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const chosen = products.find((p) => p.slug === productSlug);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-white">Order received</h1>
          <p className="mt-3 text-slate-400">
            Thanks {name || "there"} — we&apos;ve logged your{" "}
            <strong className="text-white">
              {products.find((p) => p.slug === productSlug)?.name ?? "product"}
            </strong>{" "}
            enquiry
            {chosen ? (
              <>
                {" "}for <strong className="text-white">{chosen.name}</strong>
              </>
            ) : null}
            . We&apos;ll send you a quote shortly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
              style={{ backgroundColor: "#C5A059" }}
            >
              Continue Browsing
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Request a Quote
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Tell us what you need — we&apos;ll send you a quote.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {[
          { id: "signs", label: "Signs" },
          { id: "decals", label: "Vinyl Decals" },
          { id: "stickers", label: "Custom Stickers" },
          { id: "htv", label: "HTV Print" },
          { id: "laser", label: "Laser Engraving" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setOrderType(t.id);
              setProductSlug("");
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              orderType === t.id
                ? "text-slate-950"
                : "border border-slate-700 text-slate-400 hover:text-white"
            }`}
            style={orderType === t.id ? { backgroundColor: "#C5A059" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
      >
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Product line
          </span>
          <select
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
          >
            <option value="">— Select a product line —</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} (min {p.min_qty})
              </option>
            ))}
          </select>
        </label>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Name *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Email *
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
            />
          </label>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Phone / WhatsApp
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Quantity
            </span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#C5A059] focus:outline-none"
            />
          </label>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Design file <span className="text-slate-500">(optional for quote)</span>
          </span>
          <span className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-6 py-8 text-center transition-colors hover:border-[#C5A059]/50">
            <span className="text-sm text-slate-400">
              {fileName ?? "Click to upload your artwork"}
            </span>
          </span>
          <input
            type="file"
            accept="image/*,.pdf,.svg"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <label className="mb-8 block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Notes <span className="text-slate-500">(size, colours, deadline)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#C5A059] focus:outline-none"
            placeholder="e.g. size, finish, quantity, deadline"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: "#C5A059" }}
        >
          Submit Enquiry
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">
          No payment taken yet — we confirm everything first.
        </p>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-400">
          Loading…
        </div>
      }
    >
      <OrderForm />
    </Suspense>
  );
}
