"use client";

// Custom-work order form (kiss cut, die cut, sticker packs).
//
// The customer picks finish, size, sticker count (and stickers-per-pack for
// sticker packs), uploads a REQUIRED design file, and the live total is
// computed by the shared pricing helpers. Adding builds a cart line — it no
// longer sends a quote enquiry. The uploaded file travels with the cart item
// (its bytes are posted to /api/checkout when the cart is paid).
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FINISH_BASE_CENTS,
  PACK_FEE_CENTS,
  SHEET_FEE_CENTS,
  STICKER_SIZE_OPTIONS,
  customItemFromInput,
  formatCents,
  formatUnitCents,
  isFinish,
  sizeOptions,
  stickerUnitCents,
  type CartItem,
  type CustomKind,
} from "@/lib/cart";
import { useCart } from "./cart-store";

const FINISH_LABELS = Object.keys(FINISH_BASE_CENTS);

function UploadBox({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="mb-6 block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        Design file{" "}
        <span className="text-[#FFD60A]" title="Required">
          *
        </span>
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
        {file ? (
          <span className="text-sm font-medium text-emerald-400">{file.name}</span>
        ) : (
          <span className="text-sm text-slate-400">
            Click to upload your design (PNG, JPG, SVG, PDF)
          </span>
        )}
      </span>
      <input
        type="file"
        accept="image/*,.pdf,.svg"
        required
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export default function CustomOrderForm({
  type,
  sectionId,
}: {
  type: CustomKind;
  sectionId: string;
}) {
  const [finish, setFinish] = useState("");
  const [size, setSize] = useState("5");
  const [stickerCount, setStickerCount] = useState("10");
  const [stickersPerPack, setStickersPerPack] = useState("10");
  const [shape, setShape] = useState("");
  const [whiteOffset, setWhiteOffset] = useState(false);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedItem, setAddedItem] = useState<CartItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addItem, setOpen } = useCart();

  const sizes = useMemo(() => sizeOptions(10), []);
  const unit = isFinish(finish) ? stickerUnitCents(finish, size) : null;
  const count = Math.max(1, Math.floor(Number(stickerCount)) || 1);

  const totalCents = useMemo(() => {
    if (unit === null) return null;
    if (type === "kiss-cut") return Math.round(count * unit) + SHEET_FEE_CENTS;
    if (type === "die-cut") return Math.round(count * unit);
    const perPack = Math.max(1, Math.floor(Number(stickersPerPack)) || 1);
    return count * (Math.round(perPack * unit) + PACK_FEE_CENTS);
  }, [unit, count, stickersPerPack, type]);

  async function handleAdd() {
    setError(null);
    if (!isFinish(finish)) {
      setError("Please select a vinyl finish.");
      return;
    }
    if (!file) {
      setError(
        "Please attach a design image — a design image is required. Orders without an accurate design image will be cancelled."
      );
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Stage the design file with the upload service so its bytes survive
      // the browser session and travel with the order.
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        files?: Record<string, { name: string; mimeType: string; size: number }>;
      };
      if (!res.ok || data.ok !== true || !data.files) {
        throw new Error(data.error || "Could not upload the design file.");
      }
      const entry = Object.entries(data.files)[0];
      if (!entry) throw new Error("Could not upload the design file.");
      const [token, meta] = entry;
      window.sessionStorage.setItem(
        `pnp:upload:${token}`,
        "pending"
      );
      const item = customItemFromInput({
        type,
        finish,
        size,
        stickerCount: count,
        stickersPerPack:
          type === "sticker-packs"
            ? Math.max(1, Math.floor(Number(stickersPerPack)) || 1)
            : undefined,
        shape,
        whiteOffset,
        notes,
        files: [
          { name: meta.name, size: meta.size, type: meta.mimeType },
        ],
      });
      if (!item) {
        throw new Error("Could not price this item — please check the finish and size.");
      }
      addItem(item);
      // The cart item now owns the upload token.
      window.sessionStorage.setItem(`pnp:upload:${token}`, item.id);
      setAddedItem(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this item.");
    } finally {
      setUploading(false);
    }
  }

  if (addedItem) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-white">Added to your cart</h3>
        <p className="mt-2 text-sm text-slate-300">
          <strong className="text-white">{addedItem.name}</strong> —{" "}
          {addedItem.detail}
        </p>
        <p className="mt-2 text-2xl font-bold text-[#FFD60A]">
          {formatCents(addedItem.lineCents)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            View cart
          </button>
          <button
            type="button"
            onClick={() => {
              setAddedItem(null);
              setFile(null);
            }}
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
          >
            Add another
          </button>
          <Link
            href="/checkout"
            className="rounded-xl border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-6 py-3 text-sm font-semibold text-[#FFD60A] hover:bg-[#FFD60A]/20"
          >
            Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      id={sectionId}
      onSubmit={(e) => {
        e.preventDefault();
        handleAdd();
      }}
      noValidate
      className="mx-auto max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Vinyl printed on
          </span>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          >
            <option value="">— Select vinyl —</option>
            {FINISH_LABELS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Size
          </span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}cm
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-500">
            5cm is the price floor — smaller sizes still pay the 5cm base.
          </span>
        </label>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            {type === "sticker-packs" ? "Number of packs" : "Number of stickers"}
          </span>
          <input
            type="number"
            min={1}
            value={stickerCount}
            onChange={(e) => setStickerCount(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
          />
        </label>
        {type === "sticker-packs" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Stickers per pack
            </span>
            <input
              type="number"
              min={1}
              value={stickersPerPack}
              onChange={(e) => setStickersPerPack(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
            />
          </label>
        ) : null}
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
      </div>

      {type === "die-cut" ? (
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

      {unit !== null && totalCents !== null ? (
        <div className="mb-6 rounded-xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-5">
          <p className="text-sm text-slate-300">
            {count} sticker{count === 1 ? "" : "s"} · {size}cm · {finish}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            <span className="text-lg font-semibold text-white">
              {formatUnitCents(unit)}
            </span>{" "}
            per sticker
          </p>
          <p className="mt-2 text-2xl font-bold text-[#FFD60A]">
            Total {formatCents(totalCents)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {type === "kiss-cut"
              ? "Includes the $3.00 flat sheet fee per order."
              : type === "die-cut"
              ? "Per-sticker price x sticker count."
              : "Includes $1.50 per pack for the printed backing."}
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-950/40 p-5 text-sm text-slate-400">
          Select a finish to see your per-sticker price.
        </div>
      )}

      <UploadBox file={file} onChange={setFile} />
      <p className="mb-6 rounded-lg border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-2.5 text-xs font-medium text-[#FFD60A]">
        A design image is required — orders without an accurate design image
        will be cancelled. Shape is subject to Nelson&apos;s approval.
      </p>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Notes <span className="text-slate-500">(size, colours, deadline)</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. 5cm round stickers, 2 colours, need by Friday"
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
        />
      </label>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ backgroundColor: "#FFD60A" }}
      >
        {uploading ? "Uploading design…" : "Add to Cart"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        The design file travels with your cart and is sent to Nelson when you
        check out.
      </p>
    </form>
  );
}
