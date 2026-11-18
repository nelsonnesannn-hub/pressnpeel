"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, OrderFormConfig, QuoteUploadField } from "@/lib/categories";
import { VINYL_FINISHES } from "@/lib/categories";
import {
  formatKissCutUnit,
  formatSGD,
  kissCutSizeCm,
  kissCutStickerCents,
  kissCutTotalCents,
} from "@/lib/pricing";
import { WHATSAPP_URL } from "./nav";

// 4cm in 0.5cm steps, capped at `max` cm (10cm by default; keychains use 6cm).
function sizeOptions(max: number): string[] {
  const steps = Math.floor((max - 4) / 0.5) + 1;
  return Array.from({ length: steps }, (_, i) =>
    (4 + i * 0.5).toFixed(1).replace(/\.0$/, "")
  );
}

const DEFAULT_SIZE_OPTIONS = sizeOptions(10);

function UploadField({
  label,
  hint,
  multiple,
  required,
  files,
  onChange,
}: {
  label: React.ReactNode;
  hint?: string;
  multiple?: boolean;
  required?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <label className="mb-6 block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
        {required ? (
          <span className="ml-1 text-[#FFD60A]" title="Required">
            *
          </span>
        ) : null}
      </span>
      <span className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-6 py-8 text-center transition-colors hover:border-[#FFD60A]/50">
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
        {files.length > 0 ? (
          <span className="text-sm font-medium text-emerald-400">
            {files.map((f) => f.name).join(", ")}
          </span>
        ) : (
          <span className="text-sm text-slate-400">
            Click to upload or drag &amp; drop
          </span>
        )}
        {hint ? (
          <span className="mt-1 text-xs text-slate-600">{hint}</span>
        ) : null}
      </span>
      <input
        type="file"
        accept="image/*,.pdf,.svg"
        multiple={multiple}
        required={required}
        aria-required={required || undefined}
        className="sr-only"
        onChange={(e) =>
          onChange(
            e.target.files ? Array.from(e.target.files).slice(0, multiple ? 12 : 1) : []
          )
        }
      />
    </label>
  );
}

export default function CategoryOrderForm({
  category,
  sectionTitle,
  form,
}: {
  category: Category;
  sectionTitle?: string;
  form?: OrderFormConfig;
}) {
  const config = form ?? {};
  const [item, setItem] = useState(category.orderItems[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [vinyl, setVinyl] = useState("");
  const [size, setSize] = useState("4");
  const [shape, setShape] = useState("");
  const [whiteOffset, setWhiteOffset] = useState(false);
  const [uploads, setUploads] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const showSizeShape =
    Boolean(config.sizeShape) &&
    (!config.sizeShapeItems || config.sizeShapeItems.includes(item));

  // Kiss-cut is ordered by the sticker: per-sticker price x sticker count +
  // a flat $3 sheet fee per order.
  const kissCut = Boolean(config.kissCutPricing);
  const sizeCm = kissCutSizeCm(size);
  const stickerCount = Math.max(1, Math.floor(Number(quantity)) || 1);
  const perStickerCents = kissCut
    ? kissCutStickerCents(vinyl, sizeCm)
    : null;
  const totalCents =
    perStickerCents == null
      ? null
      : kissCutTotalCents(vinyl, sizeCm, stickerCount);

  const itemLabel =
    category.orderItems.find((i) => i.id === item)?.label ??
    category.orderItems[0]?.label ??
    "";

  const allFiles = [
    ...(file ? [file] : []),
    ...(config.uploads ?? []).flatMap((u) => uploads[u.id] ?? []),
  ];

  const designRequired = Boolean(config.requireDesign);
  const requiredUploads = (config.uploads ?? []).filter((u) => u.required);

  /** Labels of every required image field that is still empty. */
  function missingDesignImages(): string[] {
    const missing: string[] = [];
    if (designRequired && allFiles.length === 0) missing.push("a design image");
    for (const u of requiredUploads) {
      if ((uploads[u.id] ?? []).length === 0) missing.push(u.label);
    }
    return missing;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (kissCut && !vinyl) {
      setError("Please select a vinyl finish.");
      return;
    }
    const missing = missingDesignImages();
    if (missing.length > 0) {
      setError(
        `Please attach ${missing.join(", ")} — a design image is required. Orders without an accurate design image will be cancelled.`
      );
      return;
    }

    setSubmitting(true);

    const ref = "PNP-" + Date.now().toString(36).toUpperCase().slice(-6);
    const fd = new FormData();
    fd.append(
      "source",
      sectionTitle
        ? `${category.title} — ${sectionTitle}`
        : `${category.title} — Custom Order`
    );
    fd.append("ref", ref);
    fd.append("type", category.title);
    fd.append("item", itemLabel);
    fd.append("quantity", quantity);
    if (config.vinylSelector) {
      fd.append(kissCut ? "finish" : "vinyl", vinyl);
    }
    if (showSizeShape) {
      fd.append("size", size);
      fd.append("shape", shape);
    }
    if (kissCut) {
      fd.append("kissCut", "1");
      fd.append("stickerCount", String(stickerCount));
      if (perStickerCents != null && totalCents != null) {
        fd.append("pricePerSticker", formatKissCutUnit(perStickerCents));
        fd.append("priceTotal", formatSGD(totalCents / 100));
      }
    }
    if (config.whiteOffset) fd.append("whiteOffset", whiteOffset ? "Yes" : "No");
    fd.append("notes", notes);
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("fileName", file?.name ?? "");
    fd.append("upload_label:design", "Design file");
    if (file) fd.append("file:design", file);
    if (designRequired) fd.append("requireDesign", "1");
    if (requiredUploads.length > 0) {
      fd.append("requiredUploads", requiredUploads.map((u) => u.id).join(","));
    }
    for (const u of config.uploads ?? []) {
      fd.append(`upload_label:${u.id}`, u.label);
      for (const f of uploads[u.id] ?? []) fd.append(`file:${u.id}`, f);
    }

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
          {allFiles.length > 0 ? (
            <>
              {" "}
              with{" "}
              <strong className="text-white">
                {allFiles.map((f) => f.name).join(", ")}
              </strong>
            </>
          ) : null}
          . We&apos;ll reply on WhatsApp or email with a proof before
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
      noValidate
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
            {kissCut ? "Number of stickers" : "Quantity"}
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

      {showSizeShape ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Size
            </span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
            >
              {(config.sizeMaxCm
                ? sizeOptions(config.sizeMaxCm)
                : DEFAULT_SIZE_OPTIONS
              ).map((s) => (
                <option key={s} value={s}>
                  {s}cm
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Shape
            </span>
            <input
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="e.g. round, square, custom logo"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500 sm:col-span-2">
            Shape is subject to Nelson&apos;s approval — if it cannot be made as
            requested, he will suggest other shapes or cancel the order.
          </p>
        </div>
      ) : null}

      {config.vinylSelector ? (
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Vinyl printed on
          </span>
          <select
            value={vinyl}
            onChange={(e) => setVinyl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          >
            <option value="">— Select vinyl —</option>
            {VINYL_FINISHES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {kissCut ? (
        <div className="mb-6 rounded-xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-5">
          {perStickerCents == null || totalCents == null ? (
            <p className="text-sm text-slate-300">
              Select a finish to see your per-sticker price.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-300">
                {stickerCount} sticker{stickerCount === 1 ? "" : "s"} ·{" "}
                {size}cm · {vinyl}
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                <p className="text-sm text-slate-400">
                  <span className="text-lg font-semibold text-white">
                    {formatKissCutUnit(perStickerCents)}
                  </span>{" "}
                  per sticker
                </p>
                <p className="text-sm text-slate-400">
                  {stickerCount} sticker{stickerCount === 1 ? "" : "s"}
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#FFD60A]">
                Total {formatSGD(totalCents / 100)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Includes the $3.00 flat sheet fee per order.
              </p>
            </>
          )}
        </div>
      ) : null}

      {config.whiteOffset ? (
        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3">
          <input
            type="checkbox"
            checked={whiteOffset}
            onChange={(e) => setWhiteOffset(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#FFD60A]"
          />
          <span>
            <span className="block text-sm font-medium text-slate-200">
              White offset
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Add a white border around each sticker.
            </span>
          </span>
        </label>
      ) : null}

      <UploadField
        label={
          <>
            Design file{" "}
            <span className="text-slate-500">(PNG, JPG, SVG, PDF, AI)</span>
          </>
        }
        hint="Transparent PNG works best for die-cut"
        files={file ? [file] : []}
        onChange={(fs) => setFile(fs[0] ?? null)}
        required={designRequired}
      />
      {designRequired ? (
        <p className="mb-6 rounded-lg border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-2.5 text-xs font-medium text-[#FFD60A]">
          A design image is required — orders without an accurate design image
          will be cancelled.
        </p>
      ) : null}

      {(config.uploads ?? []).map((u: QuoteUploadField) => (
        <UploadField
          key={u.id}
          label={u.label}
          hint={u.hint}
          multiple={u.multiple}
          required={u.required}
          files={uploads[u.id] ?? []}
          onChange={(fs) =>
            setUploads((prev) => ({ ...prev, [u.id]: fs }))
          }
        />
      ))}

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
        We&apos;ll confirm your order before anything is printed.
      </p>
    </form>
  );
}
