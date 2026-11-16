"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { products, type ProductRow } from "@/lib/catalog";
import { computeTotal, formatSGD } from "@/lib/pricing";
import {
  findDiscountCode,
  discountAmount,
  type DiscountCode,
} from "@/lib/discount";
import { WHATSAPP_URL } from "@/components/nav";

// Only fixed-price products are sold through the Stripe checkout. Made-to-order
// lines are quoted through each category page's custom order form.
const BUYABLE_PRODUCTS = products.filter((p) => p.buyable);

const TYPE_LABELS: Record<string, string> = {
  "printable-vinyl": "Printable Vinyl",
  keychains: "Keychains",
  laser: "Laser",
};

const PILLS = BUYABLE_PRODUCTS.map((p) => ({ id: p.slug, label: p.name }));

type Props = {
  stripeReady: boolean;
  publishableKey: string;
};

function OrderForm({ stripeReady }: Props) {
  const params = useSearchParams();
  const preset = params.get("product") ?? "";
  const presetOption = params.get("option") ?? "";
  const presetType = params.get("type") ?? "";
  const canceled = params.get("canceled") === "1";

  const [productSlug, setProductSlug] = useState(
    BUYABLE_PRODUCTS.some((p) => p.slug === preset) ? preset : ""
  );
  const [orderType, setOrderType] = useState(presetType || "stickers");
  const [optionId, setOptionId] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [notes, setNotes] = useState("");
  const [nfcLink, setNfcLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null
  );
  const [discountError, setDiscountError] = useState<string | null>(null);

  const chosen: ProductRow | undefined =
    BUYABLE_PRODUCTS.find((p) => p.slug === productSlug) ??
    BUYABLE_PRODUCTS.find((p) => p.category === orderType);

  const option = chosen
    ? chosen.options.find((o) => o.id === optionId) ?? chosen.options[0]
    : undefined;

  const minQty = chosen?.min_qty ?? 1;
  const qty = Math.max(minQty, Math.min(100000, parseInt(quantity) || minQty));
  const total = chosen && option ? computeTotal(option.price, qty) : 0;
  const discountValue =
    appliedDiscount && stripeReady
      ? discountAmount(total, appliedDiscount.percentOff)
      : 0;
  const payableTotal = Math.round((total - discountValue) * 100) / 100;

  function selectProduct(slug: string) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    setProductSlug(p.slug);
    setOrderType(p.category);
    setOptionId(p.options[0].id);
    setQuantity((current) => {
      const n = parseInt(current);
      return !Number.isFinite(n) || n < p.min_qty ? String(p.min_qty) : current;
    });
  }

  // Sync state when the query params change (category-card links, product links).
  useEffect(() => {
    const p = params.get("product");
    if (p && BUYABLE_PRODUCTS.some((x) => x.slug === p)) {
      selectProduct(p);
      // A finish chosen on the product page carries through via ?option=.
      const prod = BUYABLE_PRODUCTS.find((x) => x.slug === p);
      if (presetOption && prod && prod.options.some((x) => x.id === presetOption)) {
        setOptionId(presetOption);
      }
      return;
    }
    const t = params.get("type");
    if (t && TYPE_LABELS[t]) {
      const match = products.find((x) => x.category === t);
      if (match) selectProduct(match.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

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
    if (!chosen || !option) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: chosen.slug,
          optionId: option.id,
          quantity: qty,
          name,
          email,
          phone,
          notes,
          nfcLink,
          fileName: file?.name ?? "",
          discountCode: appliedDiscount?.code ?? "",
        }),
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
      // Stripe not configured (or checkout failed) — order via WhatsApp.
      // Nelson has already been pinged on Telegram server-side.
      if (!data.stripeReady || !data.url) {
        window.location.href = data.whatsappUrl || WHATSAPP_URL;
        return;
      }
      // Stripe Checkout is a hosted page — redirect to the session URL.
      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      if (/discount/i.test(message)) {
        setAppliedDiscount(null);
        setDiscountError("That discount code isn't valid.");
      }
      setSubmitError(`${message} Please try again or order via WhatsApp.`);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Place Your Order
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Tell us what you need, confirm the price, and pay securely with
          Stripe.
        </p>
      </div>

      {canceled ? (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-200">
          Checkout was cancelled — your order has not been placed. You can
          restart below or message us on WhatsApp.
        </div>
      ) : null}

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest">
        <span
          className={`flex items-center gap-2 ${
            step === 1 ? "text-[#FFD60A]" : "text-slate-500"
          }`}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
            style={{
              backgroundColor: step === 1 ? "#FFD60A" : "transparent",
              color: step === 1 ? "#0f172a" : "#94a3b8",
              border: step === 1 ? "none" : "1px solid #475569",
            }}
          >
            1
          </span>
          Your details
        </span>
        <span className="h-px w-8 bg-slate-700" />
        <span
          className={`flex items-center gap-2 ${
            step === 2 ? "text-[#FFD60A]" : "text-slate-500"
          }`}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
            style={{
              backgroundColor: step === 2 ? "#FFD60A" : "transparent",
              color: step === 2 ? "#0f172a" : "#94a3b8",
              border: step === 2 ? "none" : "1px solid #475569",
            }}
          >
            2
          </span>
          Payment
        </span>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {PILLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectProduct(t.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              orderType === t.id
                ? "text-slate-950"
                : "border border-slate-700 text-slate-400 hover:text-white"
            }`}
            style={orderType === t.id ? { backgroundColor: "#FFD60A" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <form
          onSubmit={handleContinue}
          className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
        >
          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Product line
            </span>
            <select
              value={chosen?.slug ?? ""}
              onChange={(e) => selectProduct(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
            >
              <option value="" disabled>
                — Select a product line —
              </option>
              {BUYABLE_PRODUCTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} (min {p.min_qty})
                  {p.buyable ? ` — ${formatSGD(p.price)}` : ""}
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                {chosen?.slug === "printable-vinyl"
                  ? "Quantity (packs)"
                  : chosen?.slug === "coasters"
                  ? "Quantity (packs of 5)"
                  : "Quantity"}
              </span>
              <input
                type="number"
                min={minQty}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Minimum order: {minQty}
                {chosen?.min_note ? ` — ${chosen.min_note}` : ""}
              </p>
            </label>
          </div>

          {chosen?.slug === "nfc-keychains" ? (
            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Social media link to program{" "}
                <span className="text-slate-500">(required)</span>
              </span>
              <input
                required
                type="url"
                value={nfcLink}
                onChange={(e) => setNfcLink(e.target.value)}
                placeholder="https://instagram.com/yourpage"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Link setup is included — tell us which profile or page the
                keychain should open.
              </p>
            </label>
          ) : null}

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Design file <span className="text-slate-500">(optional for now)</span>
            </span>
            <span className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 px-6 py-8 text-center transition-colors hover:border-[#FFD60A]/50">
              <span className="text-sm text-slate-400">
                {file ? file.name : "Click to upload your artwork"}
              </span>
            </span>
            <input
              type="file"
              accept="image/*,.pdf,.svg"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#FFD60A] focus:outline-none"
              placeholder="e.g. size, finish, quantity, deadline"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Continue to Payment
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleCheckout}
          className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Order summary
          </h2>

          {chosen && chosen.options.length > 1 ? (
            <label className="mb-6 block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Finish / size
              </span>
              <select
                value={option?.id ?? ""}
                onChange={(e) => setOptionId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-[#FFD60A] focus:outline-none"
              >
                {chosen.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {formatSGD(o.price)} {chosen.price_unit}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="mb-6">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Discount code
            </span>
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
          </div>

          <dl className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Product line</dt>
              <dd className="font-medium text-white">
                {TYPE_LABELS[orderType] ?? orderType}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Product</dt>
              <dd className="font-medium text-white">{chosen?.name ?? "—"}</dd>
            </div>
            {option ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Option</dt>
                <dd className="font-medium text-white">
                  {option.label} · {formatSGD(option.price)} {chosen?.price_unit}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Quantity</dt>
              <dd className="font-medium text-white">
                {qty}
                {chosen?.slug === "printable-vinyl" ||
                chosen?.slug === "coasters"
                  ? qty === 1
                    ? " pack"
                    : " packs"
                  : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-white">
                {formatSGD(total)} SGD
              </dd>
            </div>
            {appliedDiscount && stripeReady ? (
              <div className="flex justify-between gap-4">
                <dt className="text-emerald-400">
                  Discount ({appliedDiscount.code} −{appliedDiscount.percentOff}%)
                </dt>
                <dd className="font-medium text-emerald-400">
                  −{formatSGD(discountValue)} SGD
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-slate-800 pt-3 text-base">
              <dt className="font-semibold text-white">Total</dt>
              <dd className="font-bold" style={{ color: "#FFD60A" }}>
                {formatSGD(payableTotal)} SGD
              </dd>
            </div>
            <div className="flex justify-between gap-4 pt-2">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-white">{name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-white">{email}</dd>
            </div>
            {phone ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phone / WhatsApp</dt>
                <dd className="font-medium text-white">{phone}</dd>
              </div>
            ) : null}
            {file ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Design file</dt>
                <dd className="font-medium text-white">{file.name}</dd>
              </div>
            ) : null}
            {notes ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Notes</dt>
                <dd className="font-medium text-white">{notes}</dd>
              </div>
            ) : null}
          </dl>

          {submitError ? (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {submitError} Please try again or order via WhatsApp.
            </p>
          ) : null}

          {stripeReady ? (
            <>
              <button
                type="submit"
                disabled={submitting || !chosen}
                className="w-full rounded-xl py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#FFD60A" }}
              >
                {submitting
                  ? "Starting secure checkout…"
                  : `Pay with Stripe — ${formatSGD(payableTotal)}`}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Secure card payment via Stripe. No payment is taken until you
                confirm on the Stripe page.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-5 text-center">
              <p className="text-sm font-semibold text-[#FFD60A]">
                Payments are being set up.
              </p>
              <p className="mt-1 text-sm text-slate-300">
                To place your order, message us on WhatsApp and we&apos;ll
                confirm everything there.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl py-3 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ backgroundColor: "#FFD60A" }}
              >
                {submitting ? "Sending…" : "Order via WhatsApp"}
              </button>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
            >
              Back
            </button>
            <div className="flex-1" />
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        Prefer to send a design first?{" "}
        <Link
          href="/custom"
          className="text-slate-400 underline-offset-2 hover:underline"
        >
          Upload your artwork
        </Link>{" "}
        and we&apos;ll quote it.
      </p>
    </div>
  );
}

export default function OrderFormWrapper(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-400">
          Loading…
        </div>
      }
    >
      <OrderForm {...props} />
    </Suspense>
  );
}
