"use client";

// Cart checkout page — guest only. Shows every line, the design files that
// travel with it, the discount field, and starts ONE Stripe Checkout session
// for the whole cart. Custom (made-to-order) items put the payment on hold.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  formatCents,
  recomputeLineCents,
  sheetFeeFor,
  type CartItem,
} from "@/lib/cart";
import {
  DELIVERY_FEE_CENTS,
  DELIVERY_NOTE,
  DELIVERY_RULES,
  deliveryFor,
  deliveryLabel,
  pieceCountFor,
  vinylPackCountFor,
} from "@/lib/delivery";
import { findDiscountCode, type DiscountCode } from "@/lib/discount";
import { toPayloadItem } from "@/lib/cart-payload";
import { useCart } from "@/components/cart-store";

// token -> cart item id, staged by the add-to-cart forms and the checkout
// page's own upload button. /api/checkout exchanges the token for the bytes.
const UPLOAD_PREFIX = "pnp:upload:";

function readUploads(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (!key || !key.startsWith(UPLOAD_PREFIX)) continue;
      out[key.slice(UPLOAD_PREFIX.length)] = window.sessionStorage.getItem(key) || "";
    }
  } catch {
    // ignore
  }
  return out;
}

function rememberUpload(token: string, itemId: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${UPLOAD_PREFIX}${token}`, itemId);
  } catch {
    // ignore
  }
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Map the staged tokens to the cart lines they belong to. */
function tokensForItems(
  items: CartItem[],
  tokenMap: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [token, itemId] of Object.entries(tokenMap)) {
    if (items.some((item) => item.id === itemId)) out[itemId] = token;
  }
  return out;
}

function CheckoutInner() {
  const router = useRouter();
  const { items, ready, setQuantity, removeItem } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  // Urgent next-day delivery — offered only for vinyl-sheet orders. The server
  // re-derives eligibility from the basket, so this flag can never charge
  // urgent on a sticker-only cart.
  const [urgent, setUrgent] = useState(false);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the design-file tokens staged by the add-to-cart forms.
  useEffect(() => {
    if (!ready) return;
    setUploads(readUploads());
  }, [ready]);

  const lines = useMemo(
    () => items.map((item) => ({ ...item, lineCents: recomputeLineCents(item) })),
    [items]
  );

  const subtotal = lines.reduce((sum, item) => sum + item.lineCents, 0);
  const sheetFee = sheetFeeFor(lines);
  // Display-only here — /api/checkout recomputes all of it server-side.
  const delivery = deliveryFor(lines, urgent, true);
  const vinylPacks = vinylPackCountFor(lines);
  const pieces = pieceCountFor(lines);
  const discount = appliedDiscount
    ? Math.round(((subtotal + sheetFee) * appliedDiscount.percentOff) / 100)
    : 0;
  const total = subtotal + sheetFee - discount + delivery.feeCents;
  const hasCustom = lines.some((item) => item.kind === "custom");
  const customLines = lines.filter((item) => item.kind === "custom");
  const tokenByItemId = useMemo(() => tokensForItems(lines, uploads), [lines, uploads]);
  const allCustomAttached = customLines.every((item) => Boolean(tokenByItemId[item.id]));

  function applyDiscount() {
    const found = findDiscountCode(discountInput);
    if (!found) {
      setAppliedDiscount(null);
      setDiscountError("That discount code isn't valid.");
      return;
    }
    setAppliedDiscount(found);
    setDiscountError(null);
  }

  function clearDiscount() {
    setAppliedDiscount(null);
    setDiscountError(null);
    setDiscountInput("");
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    for (const item of lines) {
      if (item.kind === "custom" && (!item.custom?.files || item.custom.files.length === 0)) {
        setError(
          `Please attach a design image for "${item.name}" — a design image is required. Orders without an accurate design image will be cancelled.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        items: lines.map(toPayloadItem),
        uploadTokens: tokensForItems(lines, uploads),
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        },
        discountCode: appliedDiscount?.code ?? "",
                urgentDelivery: delivery.urgentAllowed ? urgent : false,
              };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        stripeReady?: boolean;
        url?: string;
        whatsappUrl?: string;
      };
      if (!res.ok && !data.whatsappUrl) {
        throw new Error(data.error || "Could not start checkout.");
      }
      // The cart is NOT cleared here. It is only cleared on the success page
      // once the payment is confirmed, so a customer who returns from Stripe
      // without paying keeps every item and total exactly as it was.
      if (!data.stripeReady || !data.url) {
        router.push(data.whatsappUrl || "https://wa.me/6587674511");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (/discount/i.test(message)) {
        setAppliedDiscount(null);
        setDiscountError("That discount code isn't valid.");
      }
      setError(message);
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
        <p className="mt-3 text-slate-400">
          Browse the products and add fixed-price items or custom work.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
          style={{ backgroundColor: "#FFD60A" }}
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]">
          Guest checkout
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Checkout
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          No account needed — Stripe collects your email and payment.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          {DELIVERY_NOTE}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleCheckout} className="space-y-6">
          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Your details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
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
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Notes <span className="text-slate-500">(optional)</span>
                </span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery, deadline, anything else"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
                />
              </label>
            </div>
          </section>

          {customLines.length > 0 ? (
            <section className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
                Design files
              </h2>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                {allCustomAttached
                  ? "These travel with your order and are sent to Nelson when you check out."
                  : "These travel with your order and are sent to Nelson when you check out. A design image is required for custom work — upload the missing file below."}
              </p>
              <ul className="space-y-2">
                {customLines.map((item) => {
                  const uploaded = Boolean(tokenByItemId[item.id]);
                  const files = item.custom?.files ?? [];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {files.map((f) => f.name).join(", ") || "No file attached"}
                        </p>
                        {files.length > 0 ? (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {formatBytes(files.reduce((sum, f) => sum + f.size, 0))}
                            {uploaded ? " · ready to send" : " · file needs uploading"}
                          </p>
                        ) : null}
                      </div>
                      {uploaded ? (
                        <span className="text-xs font-semibold text-emerald-400">
                          Attached ✓
                        </span>
                      ) : (
                        <UploadButton
                          item={item}
                          onDone={(token) => {
                            rememberUpload(token, item.id);
                            setUploads((prev) => ({ ...prev, [token]: item.id }));
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Discount code
            </h2>
            <div className="flex gap-2">
              <input
                value={discountInput}
                onChange={(e) => {
                  setDiscountInput(e.target.value);
                  if (discountError) setDiscountError(null);
                }}
                placeholder="Discount code"
                disabled={Boolean(appliedDiscount)}
                autoComplete="off"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm uppercase text-white placeholder:normal-case focus:border-[#FFD60A] focus:outline-none disabled:opacity-60"
              />
              {appliedDiscount ? (
                <button
                  type="button"
                  onClick={clearDiscount}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyDiscount}
                  className="rounded-lg border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-2.5 text-sm font-semibold text-[#FFD60A] transition-colors hover:bg-[#FFD60A]/20"
                >
                  Apply
                </button>
              )}
            </div>
            {discountError ? (
              <p className="mt-2 text-sm text-red-400">{discountError}</p>
            ) : null}
            {appliedDiscount ? (
              <p className="mt-2 text-sm text-emerald-400">
                {appliedDiscount.code} applied — {appliedDiscount.percentOff}% off.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Delivery
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              {DELIVERY_NOTE}
            </p>

            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-slate-300">
                Pieces: {pieces} / 300
              </span>
              <span className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-slate-300">
                Vinyl packs: {vinylPacks} / 6
              </span>
            </div>

            {delivery.free ? (
              <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300">
                Free delivery on this order
                {delivery.reason === "packs"
                  ? " — 6+ vinyl packs."
                  : " — 300+ pieces."}
              </p>
            ) : (
              <p className="mb-3 rounded-lg border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-2.5 text-sm text-[#FFD60A]">
                Delivery {formatCents(DELIVERY_FEE_CENTS)} — under 300 pieces and
                under 6 vinyl packs.
              </p>
            )}

            {delivery.urgentAllowed ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#FFD60A]"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-200">
                    Urgent next-day delivery{" "}
                    <span style={{ color: "#FFD60A" }}>
                      (+{formatCents(DELIVERY_FEE_CENTS)})
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Vinyl sheets only. Adds $2.25 to the delivery total.
                  </span>
                </span>
              </label>
            ) : null}

            <ul className="mt-4 space-y-1.5 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-500">
              {DELIVERY_RULES.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span aria-hidden className="text-slate-600">
                    •
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
            style={{ backgroundColor: "#FFD60A" }}
          >
            {submitting
              ? "Starting secure checkout…"
              : `Pay with Stripe — ${formatCents(total)}`}
          </button>
          <p className="text-center text-xs text-slate-500">
            {hasCustom
              ? "Custom work is authorised now and captured after Nelson approves your design."
              : "Secure card payment via Stripe."}
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Order summary
          </h2>
          <ul className="mb-4 space-y-3">
            {lines.map((item) => (
              <li key={item.id} className="text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                  <p className="flex-shrink-0 font-semibold text-white">
                    {formatCents(item.lineCents)}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center text-slate-300 hover:text-white"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center text-slate-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-red-300 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-slate-800 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Subtotal</dt>
              <dd className="font-medium text-white">{formatCents(subtotal)}</dd>
            </div>
            {sheetFee > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">
                  Sheet fee ({lines.some((i) => i.custom?.type === "kiss-cut")
                    ? "kiss cut"
                    : "order"})
                </dt>
                <dd className="font-medium text-white">{formatCents(sheetFee)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">{deliveryLabel(delivery)}</dt>
              <dd
                className={`font-medium ${
                  delivery.feeCents === 0 ? "text-emerald-400" : "text-white"
                }`}
              >
                {delivery.feeCents === 0 ? "FREE" : formatCents(delivery.feeCents)}
              </dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-emerald-400">
                  Discount ({appliedDiscount?.code} −{appliedDiscount?.percentOff}%)
                </dt>
                <dd className="font-medium text-emerald-400">
                  −{formatCents(discount)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-slate-800 pt-3 text-base">
              <dt className="font-semibold text-white">Total</dt>
              <dd className="font-bold" style={{ color: "#FFD60A" }}>
                {formatCents(total)} SGD
              </dd>
            </div>
          </dl>
          {hasCustom ? (
            <p className="mt-4 rounded-lg border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-3 py-2.5 text-xs leading-relaxed text-[#FFD60A]">
              This cart has custom work. Your card is authorised now and
              captured only after Nelson approves the design.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function UploadButton({
  item,
  onDone,
}: {
  item: CartItem;
  onDone: (token: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        files?: Record<string, { name: string; mimeType: string; size: number }>;
      };
      if (!res.ok || data.ok !== true || !data.files) {
        throw new Error(data.error || "Upload failed.");
      }
      const entry = Object.entries(data.files)[0];
      if (!entry) throw new Error("Upload failed.");
      const [token] = entry;
      onDone(token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white">
        {busy ? "Uploading…" : "Upload file"}
        <input
          type="file"
          accept="image/*,.pdf,.svg"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {err ? <span className="text-xs text-red-400">{err}</span> : null}
    </span>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-400">
          Loading…
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
