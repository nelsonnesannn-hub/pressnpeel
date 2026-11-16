"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/lib/categories";
import { WHATSAPP_URL } from "./nav";

export default function CategoryOrderForm({ category }: { category: Category }) {
  const [item, setItem] = useState(category.orderItems[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const itemLabel =
    category.orderItems.find((i) => i.id === item)?.label ??
    category.orderItems[0]?.label ??
    "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const ref = "PNP-" + Date.now().toString(36).toUpperCase().slice(-6);
    const fd = new FormData();
    fd.append("source", `${category.title} — Custom Order`);
    fd.append("ref", ref);
    fd.append("type", category.title);
    fd.append("item", itemLabel);
    fd.append("quantity", quantity);
    fd.append("notes", notes);
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("fileName", file?.name ?? "");
    if (file) fd.append("file", file);

    try {
      const res = await fetch("/api/order", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        throw new Error(
          data?.telegram?.error ||
            data?.error ||
            "Could not send your request right now."
        );
      }
      setOrderRef(ref);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-white">Request received</h3>
        {orderRef ? (
          <p className="mt-2 text-sm font-semibold text-[#FFD60A]">
            Reference: {orderRef}
          </p>
        ) : null}
        <p className="mt-3 text-slate-400">
          Thanks — we&apos;ve logged your{" "}
          <strong className="text-white">{itemLabel}</strong> request
          {file ? (
            <>
              {" "}
              with <strong className="text-white">{file.name}</strong>
            </>
          ) : null}
          . We&apos;ll reply on WhatsApp or email with a quote and proof before
          anything is printed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Chat on WhatsApp
          </a>
          <Link
            href="/products"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            What are you ordering?
          </span>
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          >
            {category.orderItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          />
        </label>
      </div>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Design file{" "}
          <span className="text-slate-500">(PNG, JPG, SVG, PDF, AI)</span>
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
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          {file ? (
            <span className="text-sm font-medium text-emerald-400">
              {file.name}
            </span>
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

      <label className="mb-6 block">
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Name <span className="text-slate-500">(required)</span>
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Email <span className="text-slate-500">(required)</span>
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          />
        </label>
      </div>

      <label className="mb-8 block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Phone / WhatsApp
        </span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+65 ..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
        />
      </label>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error} Please try again.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ backgroundColor: "#FFD60A" }}
      >
        {submitting ? "Sending…" : "Send Custom Order Request"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        We&apos;ll confirm your quote before any payment is taken.
      </p>
    </form>
  );
}
