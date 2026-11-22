"use client";

// Add manual / WhatsApp order — same fields as a site order, so income and
// invoices include work taken outside the website.
import { useState } from "react";
import type { FulfilmentStatus, PaymentStatus } from "@/lib/admin-types";
import { Card, btnPrimary, inputClass } from "./admin-shared";
import type { OrderAction } from "./admin-orders";

type Line = {
  name: string;
  detail: string;
  quantity: string;
  unitCents: string;
};

const EMPTY_LINE: Line = { name: "", detail: "", quantity: "1", unitCents: "" };

function toCents(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export default function ManualOrderTab({
  runAction,
  weekend,
}: {
  runAction: (action: OrderAction) => Promise<void>;
  weekend: string | null;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [deliveryCents, setDeliveryCents] = useState("");
  const [discountCents, setDiscountCents] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [fulfilmentStatus, setFulfilmentStatus] =
    useState<FulfilmentStatus>("pending_approval");
  const [deliveryWeekend, setDeliveryWeekend] = useState(weekend ?? "");
  const [urgent, setUrgent] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lineTotal = (line: Line) =>
    toCents(line.unitCents) * Math.max(1, Math.floor(Number(line.quantity) || 1));

  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const delivery = toCents(deliveryCents);
  const discount = Math.min(subtotal, toCents(discountCents));
  const total = Math.max(0, subtotal + delivery - discount);

  function setLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const items = lines
      .filter((line) => line.name.trim())
      .map((line) => ({
        name: line.name.trim(),
        detail: line.detail.trim(),
        quantity: Math.max(1, Math.floor(Number(line.quantity) || 1)),
        unitCents: toCents(line.unitCents),
        lineCents: lineTotal(line),
      }));
    if (items.length === 0) {
      setError("Add at least one line with a name.");
      return;
    }
    setBusy(true);
    try {
      await runAction({
        type: "add_manual_order",
        order: {
          customerName,
          customerEmail,
          customerPhone,
          address,
          items,
          fees: delivery > 0 ? [{ label: "Delivery (weekends)", amountCents: delivery }] : [],
          discountCents: discount || undefined,
          totalCents: total,
          paymentStatus,
          fulfilmentStatus,
          deliveryWeekend: deliveryWeekend || undefined,
          urgent,
          notes,
        },
      });
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setAddress("");
      setLines([{ ...EMPTY_LINE }]);
      setDeliveryCents("");
      setDiscountCents("");
      setNotes("");
      setUrgent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Add manual order</h2>
        <p className="mt-1 text-sm text-slate-400">
          WhatsApp and phone orders count in income and appear in the invoice
          database, exactly like a website order.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} className="space-y-4">
        <Card className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-white">Customer</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Name *</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                WhatsApp / phone
              </span>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-slate-500">Email</span>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-slate-500">
                Delivery address
              </span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </label>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Items</h3>
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { ...EMPTY_LINE }])}
              className="text-xs font-medium text-[#FACC15] hover:underline"
            >
              + Add line
            </button>
          </div>
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-xl border border-slate-800 p-3 sm:grid-cols-[1fr_7rem_6rem_7rem_2rem]"
              >
                <input
                  value={line.name}
                  onChange={(e) => setLine(index, { name: e.target.value })}
                  placeholder="Product / description"
                  className={inputClass}
                />
                <input
                  value={line.quantity}
                  onChange={(e) => setLine(index, { quantity: e.target.value })}
                  placeholder="Qty"
                  type="number"
                  min={1}
                  className={inputClass}
                  aria-label="Quantity"
                />
                <input
                  value={line.unitCents}
                  onChange={(e) => setLine(index, { unitCents: e.target.value })}
                  placeholder="Unit $"
                  inputMode="decimal"
                  className={inputClass}
                  aria-label="Unit price"
                />
                <input
                  value={line.detail}
                  onChange={(e) => setLine(index, { detail: e.target.value })}
                  placeholder="Detail (size, finish)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    setLines((prev) =>
                      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
                    )
                  }
                  aria-label="Remove line"
                  className="text-slate-500 hover:text-rose-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Unit price is in dollars (e.g. 10.20). Line total is quantity ×
            unit price.
          </p>
        </Card>

        <Card className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-white">
            Payment &amp; delivery
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Delivery charge (SGD)
              </span>
              <input
                value={deliveryCents}
                onChange={(e) => setDeliveryCents(e.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder="0.00"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Discount (SGD)
              </span>
              <input
                value={discountCents}
                onChange={(e) => setDiscountCents(e.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder="0.00"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Payment status
              </span>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as PaymentStatus)
                }
                className={inputClass}
              >
                <option value="pending">Awaiting payment</option>
                <option value="held">Held</option>
                <option value="captured">Captured</option>
                <option value="released">Released</option>
                <option value="refunded">Refunded</option>
                <option value="unpaid">Not paid</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Fulfilment status
              </span>
              <select
                value={fulfilmentStatus}
                onChange={(e) =>
                  setFulfilmentStatus(e.target.value as FulfilmentStatus)
                }
                className={inputClass}
              >
                <option value="pending_approval">Pending approval</option>
                <option value="in_production">In production</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">
                Delivery weekend (YYYY-MM-DD)
              </span>
              <input
                value={deliveryWeekend}
                onChange={(e) => setDeliveryWeekend(e.target.value)}
                className={inputClass}
                placeholder="2026-11-28"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
              />
              Urgent next day
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </label>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm">
            <span className="text-slate-400">Total </span>
            <span className="text-lg font-bold text-white">
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            type="submit"
            disabled={busy}
            className={btnPrimary}
            style={{ backgroundColor: "#FFD60A" }}
          >
            {busy ? "Saving…" : "Save manual order"}
          </button>
        </Card>
      </form>
    </div>
  );
}
