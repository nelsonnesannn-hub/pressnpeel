"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const TYPES = [
  {
    id: "signs",
    label: "Signs",
    hint: "Printed safety and compliance signs — A4 or A3, durable vinyl.",
    image: "/images/no-smoking-label.jpg",
  },
  {
    id: "decals",
    label: "Vinyl Decals",
    hint: "Flat-colour vinyl for bottles, vehicles, laptops, and walls. Any size.",
    image: "/images/name-bottle-decal.jpg",
  },
  {
    id: "stickers",
    label: "Custom Stickers",
    hint: "Die-cut in any shape. Matte, glossy, reflective, or holographic.",
    image: "/images/label-name-date-sheet.png",
  },
  {
    id: "htv",
    label: "HTV Print",
    hint: "Names, numbers, and graphics pressed onto shirts and jerseys.",
    image: "/images/jersey-name-11.jpg",
  },
  {
    id: "laser",
    label: "Laser Engraving",
    hint: "Pine coasters, tokens, blocks, boards, and keychains.",
    image: "/images/name-laser-blocks.jpg",
  },
];

const MATERIALS = ["Glossy vinyl", "Matte vinyl", "Holographic", "HTV", "Pine wood"];
const CUT_TYPES = ["Die-cut", "Kiss-cut", "Laser"];
const WHATSAPP_URL = "https://wa.me/6587674511";

function CustomForm() {
  const params = useSearchParams();
  const initialType = params.get("type") ?? "sticker";

  const [type, setType] = useState(initialType);
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [cutType, setCutType] = useState(CUT_TYPES[0]);
  const [quantity, setQuantity] = useState("10");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  // Sync type when the query param changes (e.g. clicking a category card)
  useEffect(() => {
    const t = params.get("type");
    if (t && TYPES.some((x) => x.id === t)) setType(t);
  }, [params]);

  const selected = TYPES.find((t) => t.id === type) ?? TYPES[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const ref = "PNP-" + Date.now().toString(36).toUpperCase().slice(-6);

    const fd = new FormData();
    fd.append("source", "Upload Your Design");
    fd.append("ref", ref);
    fd.append("type", selected.label);
    fd.append("material", material);
    fd.append("cutType", cutType);
    fd.append("quantity", quantity);
    fd.append("notes", notes);
    fd.append("fileName", file?.name ?? "");
    if (file) fd.append("file", file);

    try {
      const res = await fetch("/api/order", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        throw new Error(
          data?.telegram?.error || data?.error || "Could not send your design right now."
        );
      }
      setOrderRef(ref);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(String(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-white">Design received</h1>
          {orderRef ? (
            <p className="mt-2 text-sm font-semibold text-[#FFD60A]">
              Reference: {orderRef}
            </p>
          ) : null}
          <p className="mt-3 text-slate-400">
            Thanks — we&apos;ve logged your <strong className="text-white">{selected.label}</strong>{" "}
            request
            {file ? (
              <>
                {" "}with <strong className="text-white">{file.name}</strong>
              </>
            ) : null}
            . We&apos;ll reply on WhatsApp/email with a quote and proof before printing.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-6 text-left">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#FFD60A]">PayNow</span>
            <span className="rounded-full bg-[#FFD60A] px-2 py-0.5 text-xs font-bold text-slate-950">
              Payment method
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            PayNow to <strong className="text-white">Press N Peel</strong> (Singapore).
          </p>
          <p className="mt-1 text-sm text-slate-400">
            PayNow number / QR: <span className="text-slate-500">[to be confirmed]</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">
            We&apos;ll confirm your payment details on WhatsApp before production begins.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Browse Standard Products
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Upload Your Design
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Pick a product type, upload your artwork, and tell us the specs. We&apos;ll
          handle the printing and cutting.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Type selector */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            1 · Choose product type
          </h2>
          <div className="space-y-3">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                  type === t.id
                    ? "border-[#FFD60A]/60 bg-slate-900/80 shadow-lg"
                    : "border-slate-800/70 bg-slate-900/30 hover:border-slate-700"
                }`}
              >
                <span className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.image} alt="" className="h-full w-full object-cover" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{t.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                    {t.hint}
                  </span>
                </span>
                {type === t.id && (
                  <span className="ml-auto text-[#FFD60A]">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            2 · Your artwork &amp; specs
          </h2>

          {/* Upload */}
          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Design file <span className="text-slate-500">(PNG, JPG, SVG, PDF, AI)</span>
            </span>
            <span className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-6 py-10 text-center transition-colors hover:border-[#FFD60A]/50">
              <svg
                className="mb-3 h-8 w-8 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              {file ? (
                <span className="text-sm font-medium text-emerald-400">{file.name}</span>
              ) : (
                <span className="text-sm text-slate-400">
                  Click to upload or drag &amp; drop
                </span>
              )}
              <span className="mt-1 text-xs text-slate-600">
                Transparent PNG works best for die-cut
              </span>
            </span>
            <input
              type="file"
              accept="image/*,.pdf,.svg"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Material</span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Cut type</span>
              <select
                value={cutType}
                onChange={(e) => setCutType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
              >
                {CUT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Quantity</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
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
              placeholder="e.g. 5cm round stickers, 2 colours, need by Friday"
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
            />
          </label>

          {submitError ? (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError} Please try again.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
            style={{ backgroundColor: "#FFD60A" }}
          >
            {submitting ? "Sending…" : "Submit Design Request"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            We&apos;ll confirm your quote before any payment is taken.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CustomPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 py-24 text-center text-slate-400">
          Loading…
        </div>
      }
    >
      <CustomForm />
    </Suspense>
  );
}
